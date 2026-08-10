import { NextRequest, NextResponse } from "next/server";
import { categories } from "@/data/categories";
import { computeChart } from "@/lib/saju";
import { generateCompletion } from "@/lib/llm";
import {
  buildSystemPrompt,
  buildFactsBlock,
  buildQuestionPrompt,
  buildSummaryPrompt,
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

/** 분량 미달이면 한 번 더 강하게 재시도 — LLM이 지시받은 최소 글자수보다 짧게 쓰는 경우의 안전장치 */
async function generateWithLengthRetry(
  userPrompt: string,
  systemPrompt: string,
  maxTokens: number,
  minLen: number,
) {
  const raw = await generateCompletion(userPrompt, systemPrompt, maxTokens);
  let parsed = parseSectionResponse(raw);
  if (parsed.content.length < minLen * 0.75) {
    try {
      const retryPrompt = `${userPrompt}\n\n[다시 작성] 방금 답변은 ${parsed.content.length}자로 너무 짧습니다. 최소 ${minLen}자 이상이 되도록 구체적인 상황·근거·시기를 더 채워서, 처음부터 다시 작성하세요.`;
      const retryRaw = await generateCompletion(retryPrompt, systemPrompt, maxTokens);
      const retryParsed = parseSectionResponse(retryRaw);
      if (retryParsed.content.length > parsed.content.length) parsed = retryParsed;
    } catch {
      // 재시도 실패 시 원래 응답 그대로 사용
    }
  }
  return parsed;
}

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
  // deep(연애·궁합·재회): 최소 1,300~최대 1,700자/문항 → 여유 있게 4,800 토큰
  // light(커리어·재물·건강): 최소 800~최대 1,100자/문항 → 2,400 토큰
  const maxTokens = category.tier === "deep" ? 4800 : 2400;
  const minLen = category.tier === "deep" ? 1300 : 800;

  try {
    const sectionsPromise: Promise<Section[]> = mapWithConcurrency(category.questions, 3, async (q) => {
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
        const parsed = await generateWithLengthRetry(userPrompt, systemPrompt, maxTokens, minLen);
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

    const freeSummaryPromise: Promise<string> = generateCompletion(
      buildSummaryPrompt(category, factsBlock, input.name),
      systemPrompt,
      600,
    )
      .then((raw) => raw.trim())
      .catch((err) => {
        console.error("[api/report] 요약 생성 실패 — 결정론적 문구로 대체:", err);
        return category.previewLine;
      });

    const adviceMinLen = category.tier === "deep" ? 1100 : 850;
    const advicePrompt = buildAdvicePrompt(category, factsBlock, input.name, category.questions);
    const closingAdvicePromise: Promise<string> = generateCompletion(advicePrompt, systemPrompt, maxTokens)
      .then(async (raw) => {
        const text = raw.trim();
        if (text.length >= adviceMinLen * 0.75) return text;
        try {
          const retryPrompt = `${advicePrompt}\n\n[다시 작성] 방금 답변은 ${text.length}자로 너무 짧습니다. 최소 ${adviceMinLen}자 이상이 되도록 더 채워서 처음부터 다시 작성하세요.`;
          const retryText = (await generateCompletion(retryPrompt, systemPrompt, maxTokens)).trim();
          return retryText.length > text.length ? retryText : text;
        } catch {
          return text;
        }
      })
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

    const [sections, freeSummary, closingAdvice, extraAnswer] = await Promise.all([
      sectionsPromise,
      freeSummaryPromise,
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
