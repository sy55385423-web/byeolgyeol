/** 리뷰 후 추가 질문 1회 (전 카테고리 공통) — 명반 기반 LLM 답변 */

import { NextRequest, NextResponse } from "next/server";
import { decodeOrder } from "@/lib/order";
import { categories } from "@/data/categories";
import { computeChart } from "@/lib/saju";
import { generateCompletion } from "@/lib/llm";
import { buildSystemPrompt, buildFactsBlock, buildQuestionPrompt, parseSectionResponse } from "@/lib/prompt";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { reportId, question } = await req.json();
    if (!reportId || !question || typeof question !== "string" || question.trim().length < 3) {
      return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
    }

    const order = decodeOrder(decodeURIComponent(reportId));
    if (!order) return NextResponse.json({ error: "잘못된 리포트 ID" }, { status: 400 });

    const category = categories.find((c) => c.id === order.c);
    if (!category) return NextResponse.json({ error: "알 수 없는 카테고리" }, { status: 400 });

    const me = computeChart({ y: order.me.y, m: order.me.m, d: order.me.d, hourBranch: order.me.h });
    const pt = order.pt
      ? computeChart({ y: order.pt.y, m: order.pt.m, d: order.pt.d, hourBranch: order.pt.h })
      : undefined;

    const factsBlock = buildFactsBlock(category, me, pt, order.n, order.pn);
    const systemPrompt = buildSystemPrompt(category);
    const userPrompt = buildQuestionPrompt({
      category,
      question: question.trim(),
      factsBlock,
      name: order.n,
    });

    const raw = await generateCompletion(userPrompt, systemPrompt);
    const { content } = parseSectionResponse(raw);

    return NextResponse.json({ content });
  } catch (e) {
    console.error("API ask error:", e);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
