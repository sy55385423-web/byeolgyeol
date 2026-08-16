import { NextRequest, NextResponse } from "next/server";
import { categories, type PreviewStat } from "@/data/categories";
import { computeChart } from "@/lib/saju";
import { generateCompletion, hasLlmKey } from "@/lib/llm";
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
  deterministicAdvice,
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

  // LLM 프로바이더 키가 하나도 없으면 API 호출을 아예 시도하지 않고 결정론적 엔진을 바로 쓴다.
  // (오행·자미두수·점성술 조합으로 사람마다 실제로 달라지는 리포트 — 비용·지연 없음)
  if (!hasLlmKey()) {
    const report = generateReport(input);
    if (!report) {
      return NextResponse.json({ error: "리포트 생성에 실패했습니다." }, { status: 500 });
    }
    return NextResponse.json(report);
  }

  const me = computeChart(input.me);
  const pt = input.partner ? computeChart(input.partner) : undefined;
  const factsBlock = buildFactsBlock(category, me, pt, input.name);
  const systemPrompt = buildSystemPrompt(category);
  const who = input.name ? `${input.name} 님` : "당신";

  // 사주엔진으로 모든 질문의 핵심 값을 사전 계산 — LLM에 강제 주입해 일관성 보장
  const ctx: Ctx = { me, pt, c: category, input };
  const precomputed = values(ctx);
  // 문항 1개 = API 호출 1개 (별:결 배포 전 버전과 동일한 구조).
  // 묶어서 호출하면 토큰은 아끼지만 모델이 한 응답 안에서 여러 주제를 나눠 쓰면서
  // 문항당 분량·품질이 목표치에 못 미쳤기 때문에, 문항당 개별 호출로 되돌린다.
  // deep(연애·궁합·재회): 목표 1,300~1,700자/문항 → 3,000 토큰/문항
  // light(커리어·재물·건강): 목표 800~1,100자/문항 → 1,600 토큰/문항
  const perQuestionTokens = category.tier === "deep" ? 3000 : 1600;
  const adviceTokens = category.tier === "deep" ? 2600 : 2000;

  const headlineOf = (q: string, v: string, stat?: PreviewStat) =>
    stat ? `${who}의 ${stat.prefix}${v}${stat.suffix ?? ""}` : `${q} — ${v}`;

  try {
    // 문항마다 개별 호출 — 모델이 한 번에 한 주제에만 집중하게 해서 문항당 분량을 보장한다.
    // 호출 하나가 실패해도 그 문항만 결정론적 텍스트로 대체하고 나머지는 정상 진행.
    const sectionsPromise: Promise<Section[]> = mapWithConcurrency(
      category.questions,
      3,
      async (q): Promise<Section> => {
        const pre = precomputed[q];
        const stat = category.previewStats?.find((s) => s.label === q);
        const userPrompt = buildQuestionPrompt({
          category,
          question: q,
          factsBlock,
          name: input.name,
          forcedValue: pre?.v,
          forcedGauge: pre?.gauge,
        });

        try {
          const raw = await generateCompletion(userPrompt, systemPrompt, perQuestionTokens);
          const parsed = parseSectionResponse(raw);
          const finalValue = pre?.v ?? stripRedundantUnit(parsed.value, stat?.suffix);
          const finalGauge = pre?.gauge ?? parsed.gauge;
          return { question: q, headline: headlineOf(q, finalValue, stat), gauge: finalGauge, content: parsed.content };
        } catch (err) {
          console.error(`[api/report] "${q}" LLM 생성 실패 — 이 문항만 결정론적 텍스트로 대체:`, err);
          const finalValue = pre?.v ?? "";
          return {
            question: q,
            headline: headlineOf(q, finalValue, stat),
            gauge: pre?.gauge,
            content: sectionFallback(ctx, q, finalValue),
          };
        }
      },
    );

    // 무료로 공개되는 요약은 어차피 짧은 티저 문장이라, LLM 호출 없이 카테고리의
    // previewLine을 그대로 써서 API 호출 1건과 그만큼의 지연을 줄인다.
    const freeSummary = category.previewLine;

    // 종합 조언은 다른 문항들과 독립적으로 명식 사실만 근거로 쓰이므로 별도 호출 1건으로 병렬 처리.
    const closingAdvicePromise: Promise<string> = generateCompletion(
      buildAdvicePrompt(category, factsBlock, input.name),
      systemPrompt,
      adviceTokens,
    )
      .then((raw) => raw.trim())
      .catch((err) => {
        console.error("[api/report] 종합 조언 LLM 생성 실패 — 결정론적 텍스트로 대체:", err);
        return deterministicAdvice(ctx);
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
      extraAnswerPromise = generateCompletion(userPrompt, systemPrompt, perQuestionTokens)
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
