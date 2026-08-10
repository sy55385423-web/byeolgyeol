import { NextRequest, NextResponse } from "next/server";
import { categories } from "@/data/categories";
import { computeChart } from "@/lib/saju";
import { generateCompletion } from "@/lib/llm";
import {
  buildSystemPrompt,
  buildFactsBlock,
  buildQuestionPrompt,
  buildAdvicePrompt,
  parseSectionResponse,
  stripRedundantUnit,
} from "@/lib/prompt";
import {
  generateReport,
  values,
  sectionFallback,
  answerParagraphs,
  joinParas,
  TOPIC,
  type ReportInput,
  type Report,
  type Section,
  type Ctx,
} from "@/lib/report";

export const runtime = "nodejs";

/** 동시 요청 수를 제한해 무료 API 티어의 분당 요청(RPM) 한도에 안 걸리게 함 */
async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const i = cursor++;
      results[i] = await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

export async function POST(req: NextRequest) {
  const input = (await req.json()) as ReportInput;
  const category = categories.find((c) => c.id === input.categoryId);
  if (!category) {
    return NextResponse.json({ error: "알 수 없는 카테고리입니다." }, { status: 400 });
  }

  const me = computeChart(input.me);
  const pt = input.partner ? computeChart(input.partner) : undefined;
  const factsBlock = buildFactsBlock(category, me, pt, input.name);
  const systemPrompt = buildSystemPrompt(category);
  const who = input.name ? `${input.name} 님` : "당신";

  // 사주엔진으로 모든 질문의 핵심 값을 사전 계산 — LLM에 강제 주입해 일관성 보장
  const ctx: Ctx = { me, pt, c: category, input };
  const precomputed = values(ctx);
  // deep(연애·궁합·재회): 목표 1,100~1,500자/문항 → 여유 있게 3,000 토큰
  // light(커리어·재물·건강): 목표 700~1,000자/문항 → 1,600 토큰
  const maxTokens = category.tier === "deep" ? 3000 : 1600;

  try {
    const sectionsPromise: Promise<Section[]> = mapWithConcurrency(category.questions, 4, async (q) => {
      const pre = precomputed[q];
      const stat = category.previewStats?.find((s) => s.label === q);
      const headlineOf = (v: string) =>
        stat ? `${who}의 ${stat.prefix}${v}${stat.suffix ?? ""}` : `${q} — ${v}`;

      const userPrompt = buildQuestionPrompt({
        category,
        question: q,
        factsBlock,
        name: input.name,
        forcedValue: pre?.v,
        forcedGauge: pre?.gauge,
      });

      // 이 문항만 실패해도 리포트 전체를 백업으로 내리지 않고, 그 문항만 결정론적 텍스트로 대체
      try {
        const raw = await generateCompletion(userPrompt, systemPrompt, maxTokens);
        const parsed = parseSectionResponse(raw);
        const finalValue = pre?.v ?? stripRedundantUnit(parsed.value, stat?.suffix);
        const finalGauge = pre?.gauge ?? parsed.gauge;
        return { question: q, headline: headlineOf(finalValue), gauge: finalGauge, content: parsed.content };
      } catch (err) {
        console.error(`[api/report] "${q}" 문항 LLM 생성 실패 — 이 문항만 결정론적 텍스트로 대체:`, err);
        const finalValue = pre?.v ?? "";
        return {
          question: q,
          headline: headlineOf(finalValue),
          gauge: pre?.gauge,
          content: sectionFallback(ctx, q, finalValue),
        };
      }
    });

    // 무료로 공개되는 요약은 어차피 짧은 티저 문장이라, LLM 호출 없이 카테고리의
    // previewLine을 그대로 써서 API 호출 1건과 그만큼의 지연을 줄인다.
    const freeSummary = category.previewLine;

    const closingAdvicePromise: Promise<string> = generateCompletion(
      buildAdvicePrompt(category, factsBlock, input.name, category.questions),
      systemPrompt,
      maxTokens,
    )
      .then((raw) => raw.trim())
      .catch((err) => {
        console.error("[api/report] 마무리 조언 생성 실패 — 결정론적 문구로 대체:", err);
        return category.teaser;
      });

    let extraAnswerPromise: Promise<Report["extraAnswer"]> = Promise.resolve(undefined);
    if (input.extraQuestion) {
      const extraQuestion = input.extraQuestion;
      const userPrompt = buildQuestionPrompt({
        category,
        question: extraQuestion,
        factsBlock,
        name: input.name,
      });
      extraAnswerPromise = generateCompletion(userPrompt, systemPrompt, maxTokens)
        .then((raw) => {
          const parsed = parseSectionResponse(raw);
          return { q: extraQuestion, content: parsed.content };
        })
        .catch((err) => {
          console.error("[api/report] 추가 질문 LLM 생성 실패 — 결정론적 텍스트로 대체:", err);
          return {
            q: extraQuestion,
            content: joinParas(answerParagraphs(me, pt, extraQuestion, TOPIC[category.id] ?? "이 흐름")),
          };
        });
    }

    const [sections, closingAdvice, extraAnswer] = await Promise.all([
      sectionsPromise,
      closingAdvicePromise,
      extraAnswerPromise,
    ]);

    const report: Report = { category, freeSummary, sections, closingAdvice, extraAnswer };
    return NextResponse.json(report);
  } catch (err) {
    console.error("[api/report] 리포트 생성 자체가 실패 — 전체를 결정적 리포트로 대체:", err);
    const fallback = generateReport(input);
    if (!fallback) {
      return NextResponse.json({ error: "리포트 생성에 실패했습니다." }, { status: 500 });
    }
    return NextResponse.json(fallback);
  }
}
