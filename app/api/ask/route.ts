/** 리뷰 후 추가 질문 1회 (전 카테고리 공통) — 명반 기반 LLM 답변 */

import { NextRequest, NextResponse } from "next/server";
import { decodeOrder } from "@/lib/order";
import { categories } from "@/data/categories";
import { computeChart } from "@/lib/saju";
import { generateCompletion, hasLlmKey } from "@/lib/llm";
import { buildCompactFollowUpPrompt } from "@/lib/prompt";
import { answerParagraphs, joinParas, TOPIC } from "@/lib/report";

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

    // 추가 질문도 기본값은 비용 없는 결정론적 답변이다. LLM 보완은 명시적으로 켠 경우에만
    // 짧은 프롬프트와 700토큰 상한으로 한 번 실행한다.
    const fallback = joinParas(answerParagraphs(me, pt, question.trim(), TOPIC[category.id] ?? "이 흐름"));
    if (process.env.BYEOLGYEOL_LLM_FOLLOW_UPS !== "true" || !hasLlmKey()) {
      return NextResponse.json({ content: fallback });
    }

    const userPrompt = buildCompactFollowUpPrompt({
      category,
      question: question.trim(),
      me,
      partner: pt,
      name: order.n,
      partnerName: order.pn,
    });
    const content = await generateCompletion(userPrompt, "", 700).catch((error) => {
      console.error("[api/ask] LLM 보완 실패, 결정론적 답변 사용:", error);
      return fallback;
    });

    return NextResponse.json({ content });
  } catch (e) {
    console.error("API ask error:", e);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
