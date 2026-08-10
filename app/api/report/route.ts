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
import { generateReport, values, type ReportInput, type Report, type Section, type Ctx } from "@/lib/report";

export const runtime = "nodejs";

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
    const sections: Section[] = await Promise.all(
      category.questions.map(async (q) => {
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

        const raw = await generateCompletion(userPrompt, systemPrompt, maxTokens);
        const parsed = parseSectionResponse(raw);

        // value는 사전계산값 우선 사용 (LLM이 바꿔도 무시)
        const finalValue = pre?.v ?? stripRedundantUnit(parsed.value, stat?.suffix);
        const finalGauge = pre?.gauge ?? parsed.gauge;

        const headline = stat
          ? `${who}의 ${stat.prefix}${finalValue}${stat.suffix ?? ""}`
          : `${q} — ${finalValue}`;

        return { question: q, headline, gauge: finalGauge, paragraphs: parsed.paragraphs };
      }),
    );

    let extraAnswer: Report["extraAnswer"];
    if (category.tier === "deep" && input.extraQuestion) {
      const userPrompt = buildQuestionPrompt({
        category,
        question: input.extraQuestion,
        factsBlock,
        name: input.name,
      });
      const raw = await generateCompletion(userPrompt, systemPrompt, maxTokens);
      const parsed = parseSectionResponse(raw);
      extraAnswer = { q: input.extraQuestion, paragraphs: parsed.paragraphs };
    }

    const report: Report = { category, sections, extraAnswer };
    return NextResponse.json(report);
  } catch (err) {
    console.error("[api/report] LLM 생성 실패 — 결정적 리포트로 대체:", err);
    const fallback = generateReport(input);
    if (!fallback) {
      return NextResponse.json({ error: "리포트 생성에 실패했습니다." }, { status: 500 });
    }
    return NextResponse.json(fallback);
  }
}
