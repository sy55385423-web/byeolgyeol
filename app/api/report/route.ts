import { NextRequest, NextResponse } from "next/server";
import { categories, type PreviewStat } from "@/data/categories";
import { computeChart } from "@/lib/saju";
import { generateCompletion, hasLlmKey } from "@/lib/llm";
import {
  buildSystemPrompt,
  buildFactsBlock,
  buildQuestionPrompt,
  buildBatchQuestionPrompt,
  buildAdvicePrompt,
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

/** 문항을 3~4개씩 균등하게 나눈다 (마지막 그룹만 작아지는 방식 대신, 그룹 크기를 고르게
 *  맞춰 한 그룹에 5개 이상이 몰리지 않게 한다 — 그룹이 커질수록 문항당 분량·품질이 떨어짐). */
function chunkQuestions(questions: string[], targetSize = 4): string[][] {
  const numGroups = Math.max(1, Math.ceil(questions.length / targetSize));
  const base = Math.floor(questions.length / numGroups);
  const remainder = questions.length % numGroups;
  const groups: string[][] = [];
  let idx = 0;
  for (let i = 0; i < numGroups; i++) {
    const size = base + (i < remainder ? 1 : 0);
    groups.push(questions.slice(idx, idx + size));
    idx += size;
  }
  return groups;
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
  const factsBlock = buildFactsBlock(category, me, pt, input.name, input.partnerName);
  const systemPrompt = buildSystemPrompt(category);
  const who = input.name ? `${input.name} 님` : "당신";
  const pWho = input.partnerName ? `${input.partnerName} 님` : "상대방";

  // 사주엔진으로 모든 질문의 핵심 값을 사전 계산 — LLM에 강제 주입해 일관성 보장
  const ctx: Ctx = { me, pt, c: category, input };
  const precomputed = values(ctx);
  // 문항을 3~4개씩 묶어 호출 (완전 일괄 호출은 별:결 배포 전 버전에서 문항당 분량·품질이
  // 목표 미달로 떨어져서 되돌린 이력이 있음 — 그룹 크기를 3~4로 제한해 그 재발을 피하면서,
  // 문항마다 반복되는 흐름 지시문·JSON 포맷 지시문은 그룹당 1번만 보내 호출 수 자체를 줄인다.
  // deep(연애·궁합·재회): 목표 850~1,050자/문항 → 약 750토큰(한글 ~1.4자/토큰 가정)에
  // 여유 버퍼를 더한 상한. light(커리어·재물·건강): 목표 500~620자/문항.
  // (리포트 전체 글자수를 딥 ~12,000자, 라이트 ~5,000자로 낮추기 위해 문항당 목표를 축소함)
  const perQuestionTokens = category.tier === "deep" ? 1200 : 700;
  const adviceTokens = category.tier === "deep" ? 1150 : 650;
  const questionGroups = chunkQuestions(category.questions, 4);

  const headlineOf = (q: string, v: string, stat?: PreviewStat) =>
    !stat
      ? `${q} — ${v}`
      : stat.subject === "shared"
        ? `${stat.prefix}${v}${stat.suffix ?? ""}`
        : `${stat.subject === "partner" ? pWho : who}의 ${stat.prefix}${v}${stat.suffix ?? ""}`;

  try {
    const toSection = (q: string, parsed?: { value: string; gauge?: number; content: string }): Section => {
      const pre = precomputed[q];
      const stat = category.previewStats?.find((s) => s.label === q);
      if (parsed) {
        const finalValue = pre?.v ?? stripRedundantUnit(parsed.value, stat?.suffix);
        const finalGauge = pre?.gauge ?? parsed.gauge;
        return { question: q, headline: headlineOf(q, finalValue, stat), gauge: finalGauge, content: parsed.content };
      }
      const finalValue = pre?.v ?? "";
      return {
        question: q,
        headline: headlineOf(q, finalValue, stat),
        gauge: pre?.gauge,
        content: sectionFallback(ctx, q, finalValue),
      };
    };

    // 그룹(3~4문항) 단위로 호출 — 그룹 하나가 통째로 실패하면 그 그룹의 문항만 결정론적
    // 텍스트로 대체. JSON은 파싱됐지만 특정 질문 키만 빠진 경우엔 그 문항만 대체하고
    // 나머지 그룹원은 정상 결과를 그대로 쓴다 (parseBatchResponse가 부분 결과를 반환).
    const sectionsPromise: Promise<Section[]> = mapWithConcurrency(
      questionGroups,
      3,
      async (group): Promise<Section[]> => {
        const forced: Record<string, { value?: string; gauge?: number }> = {};
        for (const q of group) {
          const pre = precomputed[q];
          forced[q] = { value: pre?.v, gauge: pre?.gauge };
        }
        const userPrompt = buildBatchQuestionPrompt({ category, questions: group, name: input.name, forced });
        const groupTokens = perQuestionTokens * group.length + 200;

        try {
          const raw = await generateCompletion(userPrompt, systemPrompt, groupTokens, factsBlock);
          const parsedMap = parseBatchResponse(raw);
          return group.map((q) => {
            if (!parsedMap[q]) {
              console.error(`[api/report] 배치 응답에 "${q}" 항목 누락 — 이 문항만 결정론적 텍스트로 대체`);
            }
            return toSection(q, parsedMap[q]);
          });
        } catch (err) {
          console.error(`[api/report] 문항 그룹(${group.join(", ")}) LLM 생성 실패 — 그룹 전체를 결정론적 텍스트로 대체:`, err);
          return group.map((q) => toSection(q));
        }
      },
    ).then((groups) => groups.flat());

    // 무료로 공개되는 요약은 어차피 짧은 티저 문장이라, LLM 호출 없이 카테고리의
    // previewLine을 그대로 써서 API 호출 1건과 그만큼의 지연을 줄인다.
    const freeSummary = category.previewLine;

    // 종합 조언은 다른 문항들과 독립적으로 명식 사실만 근거로 쓰이므로 별도 호출 1건으로 병렬 처리.
    const closingAdvicePromise: Promise<string> = generateCompletion(
      buildAdvicePrompt(category, input.name),
      systemPrompt,
      adviceTokens,
      factsBlock,
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
        name: input.name,
      });
      extraAnswerPromise = generateCompletion(userPrompt, systemPrompt, perQuestionTokens, factsBlock)
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
