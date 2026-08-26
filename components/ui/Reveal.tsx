"use client";

import { useEffect, useRef, useState } from "react";

/** 스크롤 진입 시 절제된 페이드업. 이동량 12px, 한 번만.
 *
 *  예전에는 framer-motion의 whileInView를 썼는데, 서버가 그린 HTML이
 *  opacity:0인 채로 나가고 그걸 되돌리는 일을 전적으로 자바스크립트가 맡았다.
 *  스크립트가 안 뜨거나, 탭이 배경에 있어 IntersectionObserver가 안 돌거나,
 *  관찰이 어떤 이유로든 한 번 어긋나면 랜딩이 통째로 백지가 된다.
 *  연출 하나 때문에 페이지 전체가 사라질 수 있는 구조였다.
 *
 *  그래서 세 가지를 깔아 둔다.
 *    · 화면에 들어오면 보인다 (원래 하던 일)
 *    · 일정 시간 안에 관찰이 안 걸리면 그냥 보인다
 *    · 움직임을 줄여 달라고 설정한 사람에게는 처음부터 보인다
 *  연출은 실패해도 되지만 글은 언제나 보여야 한다. */
export default function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    // 관찰이 안 걸리는 상황에서도 글은 보이게 하는 안전망
    const guard = setTimeout(() => setShown(true), 1500);
    if (typeof IntersectionObserver !== "function") {
      setShown(true);
      clearTimeout(guard);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
          clearTimeout(guard);
        }
      },
      { rootMargin: "-60px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearTimeout(guard);
    };
  }, []);

  return (
    <div
      ref={ref}
      data-reveal
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : "translateY(12px)",
        transition: `opacity 0.55s cubic-bezier(0.22,1,0.36,1) ${delay}s, transform 0.55s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}
