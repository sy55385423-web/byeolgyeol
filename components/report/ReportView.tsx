"use client";

/** 결제 후 상세 리포트 화면.
 *  - ID(URL)만으로 결정적 재생성 → 공유·저장·다시 보기가 그대로 성립
 *  - 리뷰 작성 후 모든 카테고리에서 추가 질문 1회 활성화
 *  ⚠️ 결제 검증은 서버 연동 시 교체 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { decodeOrder, type Order, personOf } from "@/lib/order";
import { radarStats, type Ctx, type Report, type ReportInput } from "@/lib/report";
import { computeChart, BRANCHES } from "@/lib/saju";
import { categories } from "@/data/categories";
import SajuCharts from "@/components/ui/SajuCharts";
import RadarCard from "@/components/ui/RadarCard";

const TOPIC: Record<string, string> = {
  "love-life": "연애", "love-compatibility": "이 관계", "love-reunion": "재회",
  career: "커리어", wealth: "재물", health: "몸의 리듬",
};

export default function ReportView({ id }: { id: string }) {
  const [order, setOrder] = useState<Order | null | "invalid">(null);
  useEffect(() => {
    setOrder(decodeOrder(decodeURIComponent(id)) ?? "invalid");
  }, [id]);

  if (order === null) return null;
  if (order === "invalid") {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-5">
        <p className="font-serif text-xl">리포트를 찾을 수 없어요</p>
        <Link href="/" className="rounded-xl bg-ink px-6 py-3 text-sm font-semibold text-paper">
          홈으로
        </Link>
      </div>
    );
  }
  return <Body order={order} id={id} />;
}

function Body({ order, id }: { order: Order; id: string }) {
  const category = useMemo(() => categories.find((c) => c.id === order.c), [order]);
  const [report, setReport] = useState<Report | null>(null);
  const [reportError, setReportError] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    setReport(null);
    setReportError(false);
    const input: ReportInput = {
      categoryId: order.c,
      name: order.n,
      me: personOf(order.me),
      partner: order.pt
        ? personOf(order.pt) : undefined,
      partnerName: order.pn,
      extraQuestion: order.q,
      breakup: order.bu,
      tier: order.t,
    };
    fetch("/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
      .then((res) => {
        if (!res.ok) throw new Error("report generation failed");
        return res.json();
      })
      .then((data: Report) => setReport(data))
      .catch(() => setReportError(true));
  }, [order]);

  useEffect(() => {
    if (report || !category) return;
    const timer = setInterval(() => {
      setStepIndex((i) => (i + 1) % category.loadingSteps.length);
    }, 1400);
    return () => clearInterval(timer);
  }, [report, category]);

  const myChart = useMemo(
    () => computeChart(personOf(order.me)),
    [order]
  );

  const chartCtx: Ctx | null = useMemo(() => {
    if (!category) return null;
    const ptChart = order.pt
      ? computeChart(personOf(order.pt))
      : undefined;
    const input: ReportInput = {
      categoryId: order.c,
      name: order.n,
      me: personOf(order.me),
      partner: order.pt
        ? personOf(order.pt) : undefined,
      partnerName: order.pn,
      breakup: order.bu,
      tier: order.t,
    };
    return { me: myChart, pt: ptChart, c: category, input };
  }, [category, order, myChart]);

  /* 리뷰 작성 (localStorage) */
  const [review, setReview] = useState("");
  const [reviewed, setReviewed] = useState(false);
  useEffect(() => {
    setReviewed(!!localStorage.getItem(`bz-review-${id.slice(0, 40)}`));
  }, [id]);
  const submitReview = () => {
    if (review.trim().length < 10) return;
    localStorage.setItem(`bz-review-${id.slice(0, 40)}`, review.trim());
    setReviewed(true);
  };

  /* 리뷰 후 추가 질문 1회 (전 카테고리 공통) */
  const [extraQ, setExtraQ] = useState("");
  const [extraAnswer, setExtraAnswer] = useState<string | null>(null);
  const [askingExtra, setAskingExtra] = useState(false);
  const askExtraQuestion = async () => {
    const q = extraQ.trim();
    if (q.length < 3 || askingExtra || extraAnswer) return;
    setAskingExtra(true);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId: id, question: q }),
      });
      if (res.ok) {
        const data = await res.json();
        setExtraAnswer(data.content);
      }
    } finally {
      setAskingExtra(false);
    }
  };

  const [copied, setCopied] = useState(false);
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: `별:결 리포트`, url });
        return;
      }
    } catch {
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* unused — suppresses TS unused warning */
  void TOPIC;

  if (reportError) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-5 text-center">
        <p className="font-serif text-xl">리포트를 만드는 데 실패했어요</p>
        <p className="text-sm text-ink-faint">잠시 후 다시 시도해 주세요.</p>
        <Link href="/" className="rounded-xl bg-ink px-6 py-3 text-sm font-semibold text-paper">
          홈으로
        </Link>
      </div>
    );
  }
  if (!report || !category) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-5 text-center">
        <p className="font-serif text-lg">{category?.loadingSteps[stepIndex] ?? "명식을 세우는 중"}</p>
        <p className="text-xs text-ink-faint">리포트를 정성껏 만들고 있어요. 잠시만 기다려 주세요.</p>
      </div>
    );
  }
  const { sections } = report;
  const who = order.n ? `${order.n} 님` : "당신";

  return (
    <div className="min-h-dvh bg-paper">
      <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-5">
          <Link href="/" className="flex items-baseline gap-2">
            <span className="font-serif text-lg font-semibold">별:결</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-ink-faint">bazistar</span>
          </Link>
          <button
            onClick={share}
            className="rounded-full border border-line bg-white px-4 py-1.5 text-xs text-ink-soft transition-colors hover:border-ink-faint"
          >
            {copied ? "복사됐어요" : "공유 · 저장"}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 pb-24">
        <div className="pt-10">
          <p className="text-sm font-medium tracking-widest text-brass">FULL REPORT</p>
          <h1 className="mt-3 font-serif text-2xl font-semibold leading-snug sm:text-3xl">
            {who}의 {category.name}
          </h1>
          <p className="mt-2 text-[13px] text-ink-faint">
            {order.me.y}. {order.me.m}. {order.me.d}.
            {order.me.h !== undefined && ` ${BRANCHES[order.me.h]}시`} 기준 ·{" "}
            {category.tier === "deep" ? "기본 리포트" : "컴팩트 리포트"} ·
            이 링크로 언제든 다시 볼 수 있어요
          </p>
          <p className="mt-4 text-[14.5px] leading-[1.85] text-ink-soft">{report.freeSummary}</p>
        </div>

        {/* 명반 */}
        <div className="mt-8 rounded-2xl border border-line bg-paper-warm/50 p-4 sm:p-5">
          <SajuCharts
            me={{
              y: order.me.y,
              m: order.me.m,
              d: order.me.d,
              knowsTime: order.me.h !== undefined,
              timeLabel: order.me.h !== undefined ? `${BRANCHES[order.me.h]}시` : undefined,
              hour: order.me.hh,
              minute: order.me.mi,
              lon: order.me.lo,
              gender: order.me.g,
            }}
            name={order.n}
          />
          {order.pt && (
            <div className="mt-4 border-t border-line pt-4">
              <SajuCharts
                me={{
                  y: order.pt.y,
                  m: order.pt.m,
                  d: order.pt.d,
                  knowsTime: order.pt.h !== undefined,
                  timeLabel: order.pt.h !== undefined ? `${BRANCHES[order.pt.h]}시` : undefined,
                  hour: order.pt.hh,
                  minute: order.pt.mi,
                  lon: order.pt.lo,
                  gender: order.pt.g,
                }}
                name={order.pn || "그 사람"}
              />
            </div>
          )}
        </div>

        {/* 종합 지수 + 레이더 */}
        {chartCtx && (
          <div className="mt-6">
            <RadarCard stats={radarStats(chartCtx)} />
          </div>
        )}

        {/* 목차 */}
        <div className="mt-6 rounded-2xl border border-line bg-white/70 p-5">
          <p className="text-xs font-medium text-ink-faint">이 리포트가 답하는 {sections.length}개 질문</p>
          <ol className="mt-3 grid gap-1.5 text-[13.5px] sm:grid-cols-2">
            {sections.map((s, i) => (
              <li key={s.question}>
                <a href={`#q${i}`} className="text-ink-soft transition-colors hover:text-brass">
                  <span className="mr-1.5 font-serif text-brass">{i + 1}</span>
                  {s.question}
                </a>
              </li>
            ))}
          </ol>
        </div>

        {/* 본문 */}
        {sections.map((s, i) => (
          <section key={s.question} id={`q${i}`} className="mt-12 scroll-mt-20">
            <p className="text-xs font-medium tracking-widest text-brass">
              {String(i + 1).padStart(2, "0")} · {s.question}
            </p>
            <h2 className="mt-3 font-serif text-xl font-semibold leading-relaxed sm:text-[22px]">
              {s.headline}
            </h2>
            {s.gauge !== undefined && (
              <div className="mt-4 h-1.5 max-w-sm overflow-hidden rounded-full bg-paper-warm">
                <div className="h-full rounded-full bg-brass" style={{ width: `${s.gauge}%` }} />
              </div>
            )}
            <div className="mt-5 space-y-4 text-[15px] leading-[1.95] text-ink">
              {s.content
                .split("\n\n")
                .filter(Boolean)
                .map((para, pi) => (
                  <p key={pi}>{para}</p>
                ))}
            </div>
          </section>
        ))}

        {/* 마무리 조언 */}
        <section className="mt-12 rounded-2xl border border-line bg-paper-warm/50 p-6">
          <p className="text-xs font-medium tracking-widest text-brass">종합 조언</p>
          <div className="mt-4 space-y-4 text-[15px] leading-[1.95] text-ink">
            {report.closingAdvice
              .split("\n\n")
              .filter(Boolean)
              .map((para, pi) => (
                <p key={pi}>{para}</p>
              ))}
          </div>
        </section>

        {/* 리뷰 + 추가 질문 */}
        <section className="mt-12 rounded-2xl border border-brass/40 bg-white p-6">
          <h3 className="font-serif text-lg font-semibold">
            {reviewed ? "리뷰를 남겨주셨어요" : "리뷰 남기고 추가 질문권 받기"}
          </h3>
          {!reviewed ? (
            <>
              <p className="mt-1.5 text-[13px] text-ink-soft">
                리포트 이용 후기를 남기면 추가 질문 1회가 바로 활성화됩니다.
              </p>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="리포트가 어땠는지 10자 이상 남겨주세요"
                className="mt-3 h-24 w-full resize-none rounded-xl border border-line bg-white px-4 py-3 text-[14px] outline-none focus:border-brass"
              />
              <button
                onClick={submitReview}
                disabled={review.trim().length < 10}
                className="mt-3 rounded-xl bg-brass px-6 py-3 text-[14px] font-semibold text-night transition-transform enabled:hover:scale-[1.02] disabled:opacity-40"
              >
                리뷰 제출하고 추가 질문권 받기
              </button>
            </>
          ) : (
            <>
              <p className="mt-2 text-[14px] text-ink-soft">감사해요. 정말 도움이 됩니다.</p>
              <div className="mt-5 rounded-xl border border-brass/30 bg-paper-warm/40 p-4">
                <p className="text-xs font-semibold text-brass">추가 질문 1회 사용 가능</p>
                {!extraAnswer ? (
                  <div className="mt-3 flex gap-2">
                    <input
                      value={extraQ}
                      onChange={(e) => setExtraQ(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !askingExtra && void askExtraQuestion()}
                      placeholder="궁금한 걸 물어보세요"
                      disabled={askingExtra}
                      className="flex-1 rounded-xl border border-line bg-white px-4 py-3 text-[14px] outline-none focus:border-brass disabled:opacity-60"
                    />
                    <button
                      onClick={() => void askExtraQuestion()}
                      disabled={extraQ.trim().length < 3 || askingExtra}
                      className="rounded-xl bg-ink px-5 py-3 text-[14px] font-semibold text-paper transition-transform enabled:hover:scale-[1.02] enabled:active:scale-[0.98] disabled:opacity-40"
                    >
                      {askingExtra ? "답하는 중…" : "질문하기"}
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3.5">
                    <p className="text-[13px] font-medium text-ink">Q. {extraQ}</p>
                    {extraAnswer
                      .split("\n\n")
                      .filter(Boolean)
                      .map((para, pi) => (
                        <p key={pi} className="text-[14.5px] leading-[1.95] text-ink-soft">
                          {para}
                        </p>
                      ))}
                  </div>
                )}
              </div>
            </>
          )}
        </section>

        <p className="mt-10 text-center text-xs text-ink-faint">
          리딩 결과는 참고용이며, 중요한 결정은 스스로의 판단을 따르세요.
        </p>
      </main>
    </div>
  );
}
