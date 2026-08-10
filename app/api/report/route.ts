import { NextRequest, NextResponse } from "next/server";
import { categories } from "@/data/categories";
import { computeChart } from "@/lib/saju";
import { generateCompletion } from "@/lib/llm";
import {
  buildSystemPrompt,
  buildFactsBlock,
  buildQuestionPrompt,
  parseSectionResponse,
  stripRedundantUnit,
} from "@/lib/prompt";
import {
  generateReport,
  values,
  sectionFallback,
  answerParagraphs,
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
  const factsBlock = buildFactsBlock(category, me, pt);
  const systemPrompt = buildSystemPrompt(category);
  const who = input.name ? `${input.name} 님` : "당신";

  // 사주엔진으로 모든 질문의 핵심 값을 사전 계산 — LLM에 강제 주입해 일관성 보장
  const ctx: Ctx = { me, pt, c: category, input };
  const precomputed = values(ctx);
  // deep(연애·궁합·재회): 6문단×230~280자 ≈ 1,500자/문항 → 여유 있게 4,000 토큰
  // light(커리어·재물·건강): 3문단×180~220자 ≈ 600자/문항 → 2,000 토큰
  const maxTokens = category.tier === "deep" ? 4000 : 2000;

  try {
    const sections: Section[] = await mapWithConcurrency(category.questions, 3, async (q) => {
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
        return { question: q, headline: headlineOf(finalValue), gauge: finalGauge, paragraphs: parsed.paragraphs };
      } catch (err) {
        console.error(`[api/report] "${q}" 문항 LLM 생성 실패 — 이 문항만 결정론적 텍스트로 대체:`, err);
        const finalValue = pre?.v ?? "";
        return {
          question: q,
          headline: headlineOf(finalValue),
          gauge: pre?.gauge,
          paragraphs: sectionFallback(ctx, q, finalValue),
        };
      }
    });

    let extraAnswer: Report["extraAnswer"];
    if (category.tier === "deep" && input.extraQuestion) {
      const userPrompt = buildQuestionPrompt({
        category,
        question: input.extraQuestion,
        factsBlock,
        name: input.name,
      });
      try {
        const raw = await generateCompletion(userPrompt, systemPrompt, maxTokens);
        const parsed = parseSectionResponse(raw);
        extraAnswer = { q: input.extraQuestion, paragraphs: parsed.paragraphs };
      } catch (err) {
        console.error("[api/report] 추가 질문 LLM 생성 실패 — 결정론적 텍스트로 대체:", err);
        extraAnswer = {
          q: input.extraQuestion,
          paragraphs: answerParagraphs(me, pt, input.extraQuestion, TOPIC[category.id] ?? "이 흐름"),
        };
      }
    }

    const report: Report = { category, sections, extraAnswer };
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
