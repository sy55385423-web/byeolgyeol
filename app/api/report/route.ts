import { NextRequest, NextResponse } from "next/server";
import { categories, type PreviewStat } from "@/data/categories";
import { computeChart } from "@/lib/saju";
import { generateCompletion } from "@/lib/llm";
import {
  buildSystemPrompt,
  buildFactsBlock,
  buildQuestionPrompt,
  buildBatchQuestionPrompt,
  parseSectionResponse,
  parseBatchResponse,
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

/** 문항을 batchSize개씩 묶는다 — 묶음마다 systemPrompt·factsBlock을 1번만 보내서
 *  문항 수만큼 반복되던 입력 토큰 중복을 줄인다. */
function chunk<T>(items: T[], batchSize: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += batchSize) batches.push(items.slice(i, i + batchSize));
  return batches;
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
  // 문항 1개 기준 목표 분량에 맞춘 토큰 예산. 배치 호출 시 묶음 크기만큼 곱해서 쓴다.
  // deep(연애·궁합·재회): 목표 1,300~1,700자/문항 → 3,000 토큰/문항
  // light(커리어·재물·건강): 목표 800~1,100자/문항 → 1,600 토큰/문항
  const perQuestionTokens = category.tier === "deep" ? 3000 : 1600;

  const headlineOf = (q: string, v: string, stat?: PreviewStat) =>
    stat ? `${who}의 ${stat.prefix}${v}${stat.suffix ?? ""}` : `${q} — ${v}`;

  try {
    // 문항을 3개씩 묶어서 호출 — systemPrompt·factsBlock 중복 전송을 줄여 토큰을 크게 절약.
    // 묶음 하나가 실패해도 그 묶음(최대 3문항)만 결정론적 텍스트로 대체하고 나머지는 정상 진행.
    // 종합 조언(closingAdvice)도 별도 호출을 만들지 않고 마지막 묶음에 끼워 넣어서 호출을 1건 더 줄인다.
    const batches = chunk(category.questions, 3);
    let closingAdviceFromBatch: string | undefined;

    const sectionsPromise: Promise<Section[]> = mapWithConcurrency(batches, 3, async (batchQuestions, idx) => {
      const isLastBatch = idx === batches.length - 1;
      const forcedValues: Record<string, { v?: string; gauge?: number }> = {};
      for (const q of batchQuestions) forcedValues[q] = precomputed[q] ?? {};

      const userPrompt = buildBatchQuestionPrompt({
        category,
        questions: batchQuestions,
        factsBlock,
        name: input.name,
        forcedValues,
        includeClosingAdvice: isLastBatch,
      });
      const batchTokens = perQuestionTokens * batchQuestions.length + (isLastBatch ? perQuestionTokens : 0);

      try {
        const raw = await generateCompletion(userPrompt, systemPrompt, batchTokens);
        const { sections: parsedMap, closingAdvice } = parseBatchResponse(raw, batchQuestions);
        if (isLastBatch && closingAdvice) closingAdviceFromBatch = closingAdvice;
        return batchQuestions.map((q): Section => {
          const pre = precomputed[q];
          const stat = category.previewStats?.find((s) => s.label === q);
          const item = parsedMap[q];
          const finalValue = pre?.v ?? stripRedundantUnit(item.value, stat?.suffix);
          const finalGauge = pre?.gauge ?? item.gauge;
          return { question: q, headline: headlineOf(q, finalValue, stat), gauge: finalGauge, content: item.content };
        });
      } catch (err) {
        console.error(`[api/report] 묶음(${batchQuestions.join(", ")}) LLM 생성 실패 — 이 묶음만 결정론적 텍스트로 대체:`, err);
        return batchQuestions.map((q): Section => {
          const pre = precomputed[q];
          const stat = category.previewStats?.find((s) => s.label === q);
          const finalValue = pre?.v ?? "";
          return {
            question: q,
            headline: headlineOf(q, finalValue, stat),
            gauge: pre?.gauge,
            content: sectionFallback(ctx, q, finalValue),
          };
        });
      }
    }).then((batchResults) => batchResults.flat());

    // 무료로 공개되는 요약은 어차피 짧은 티저 문장이라, LLM 호출 없이 카테고리의
    // previewLine을 그대로 써서 API 호출 1건과 그만큼의 지연을 줄인다.
    const freeSummary = category.previewLine;

    // 마지막 묶음이 끝나야 closingAdviceFromBatch가 채워지므로 sectionsPromise에 이어서 읽는다
    // (별도 API 호출이 없으니 추가 지연도 없다).
    const closingAdvicePromise: Promise<string> = sectionsPromise.then(
      () => closingAdviceFromBatch ?? category.teaser,
    );

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
