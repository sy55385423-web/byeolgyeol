"use client";

/** 긴 리포트를 읽는 동안 길을 잃지 않게 하는 장치.
 *
 *  연애·궁합·재회 리포트는 13,000자가 넘는다. 스크롤 하나로 쭉 늘어놓으면
 *  세 가지가 동시에 안 보인다 — 얼마나 왔는지, 지금 몇 번 문항인지,
 *  다른 문항으로 어떻게 건너뛰는지.
 *
 *  헤더에 이 셋을 붙인다.
 *    진행 막대   문서 전체에서 지금 위치
 *    현재 문항   스크롤에 따라 바뀌는 라벨
 *    목차 열기   라벨을 누르면 전체 문항이 펼쳐진다 */

import { useEffect, useRef, useState } from "react";

export default function ReportNav({ questions }: { questions: string[] }) {
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(-1);   // -1이면 아직 본문 전(표지·명반 구간)
  const [open, setOpen] = useState(false);
  const raf = useRef(0);

  useEffect(() => {
    const read = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);

      // 화면 위쪽 1/3 선을 넘어선 마지막 섹션이 "지금 읽는 문항"이다.
      // 화면 정중앙을 기준으로 잡으면 섹션이 길 때 바뀌는 시점이 너무 늦다.
      const line = window.innerHeight / 3;
      let cur = -1;
      for (let i = 0; i < questions.length; i++) {
        const el = document.getElementById(`q${i}`);
        if (el && el.getBoundingClientRect().top <= line) cur = i;
      }
      setActive(cur);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [questions.length]);

  // 목차가 열려 있을 때 Esc로 닫는다. 모달은 아니지만 열린 레이어의 기본 기대다.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const label = active < 0 ? "리포트 처음" : `${active + 1} / ${questions.length} · ${questions[active]}`;

  return (
    <>
      {/* 진행 막대 — 헤더 아래 경계선 자리에 겹쳐 둔다 */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-brass/15"
        aria-hidden
      >
        <div
          className="h-full bg-brass transition-[width] duration-150 ease-out"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="report-toc"
        className="flex min-w-0 flex-1 items-center gap-1.5 px-2 text-left"
      >
        <span className="truncate text-[12px] text-ink-faint">{label}</span>
        <svg
          viewBox="0 0 12 12"
          className={`h-2.5 w-2.5 shrink-0 text-ink-faint transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          <path d="M2 4.5 6 8.5 10 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="sr-only">문항 목차 {open ? "닫기" : "열기"}</span>
      </button>

      {open && (
        <div
          id="report-toc"
          className="absolute inset-x-0 top-full max-h-[65dvh] overflow-y-auto border-b border-line bg-paper/95 shadow-[0_12px_30px_rgba(23,24,28,0.08)] backdrop-blur-sm"
        >
          <ol className="mx-auto max-w-2xl px-5 py-3">
            {questions.map((q, i) => (
              <li key={q}>
                <a
                  href={`#q${i}`}
                  onClick={() => setOpen(false)}
                  className={`flex gap-2.5 rounded-lg px-2 py-2 text-[13.5px] leading-snug transition-colors ${
                    i === active ? "bg-brass-faint text-ink" : "text-ink-soft hover:bg-paper-warm"
                  }`}
                >
                  <span className={`font-serif ${i === active ? "text-brass" : "text-ink-faint"}`}>
                    {i + 1}
                  </span>
                  {q}
                </a>
              </li>
            ))}
          </ol>
        </div>
      )}
    </>
  );
}
