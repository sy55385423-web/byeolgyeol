"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

/** 숫자가 0에서 올라가는 연출.
 *
 *  연출이 안 돌아가는 경우가 생각보다 많다. 탭이 배경에 있으면 rAF도
 *  IntersectionObserver도 멈추고, 자바스크립트가 늦게 붙으면 그 사이는 서버가
 *  그린 HTML만 보인다. 그때 화면에 "해석 규칙 0개"가 떠 있으면 연출이 아니라
 *  틀린 정보다.
 *
 *  그래서 못 세는 상황에서는 언제나 진짜 값 쪽으로 떨어지게 해 둔다.
 *  연출은 실패해도 되지만 숫자는 틀리면 안 된다. */
export default function CountUp({
  value,
  decimals = 0,
  suffix = "",
  duration = 1.4,
}: {
  value: number;
  decimals?: number;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  // 안전망 — 이 시간 안에 세기가 시작되지 않으면 그냥 값을 채운다.
  useEffect(() => {
    const t = setTimeout(() => {
      if (!started.current) setDisplay(value);
    }, 1200);
    return () => clearTimeout(t);
  }, [value]);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    // 움직임을 줄여 달라고 설정한 사람에게는 세지 않고 결과만 보여 준다.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      return;
    }
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const t = Math.min((now - start) / (duration * 1000), 1);
      setDisplay(value * (1 - Math.pow(1 - t, 3)));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setDisplay(value);   // 마지막에 정확한 값으로 맞춘다
    };
    raf = requestAnimationFrame(tick);
    const guard = setTimeout(() => setDisplay(value), duration * 1000 + 400);
    return () => { cancelAnimationFrame(raf); clearTimeout(guard); };
  }, [inView, value, duration]);

  const formatted =
    decimals > 0
      ? display.toFixed(decimals)
      : Math.round(display).toLocaleString("ko-KR");

  return (
    <span ref={ref}>
      {formatted}
      {suffix}
    </span>
  );
}
