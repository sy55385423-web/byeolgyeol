"use client";

/** 리포트 탭 — 한 장씩 넘겨 보는 카드 덱.
 *
 *  일곱 개를 격자에 늘어놓으면 훑기는 좋은데 하나하나가 눈에 안 들어온다.
 *  고르는 자리에서는 여러 개를 동시에 비교하기보다 한 번에 하나를 제대로
 *  보는 편이 낫다. 그래서 가로로 넘기는 덱으로 둔다.
 *
 *  넘기는 동작 자체는 자바스크립트로 만들지 않았다. CSS scroll-snap이
 *  브라우저의 관성 스크롤을 그대로 쓰므로 손끝에 붙는 느낌이 훨씬 낫고,
 *  스크립트가 없어도 넘어간다. 자바스크립트는 두 가지만 한다 —
 *  지금 몇 번째 장인지 표시하는 것과, 아래 인덱스를 눌렀을 때 그 장으로
 *  옮겨 주는 것. 둘 다 없어도 덱은 그대로 동작한다. */

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { categoryIcons, IconArrow } from "@/components/ui/icons";
import { categoryHref, type Category } from "@/data/categories";

/** 리딩마다 한 글자.
 *
 *  사주는 글자로 사람을 읽는 체계다. 카드의 얼굴을 한자 한 글자로 두면
 *  일곱 장이 같은 결로 묶이고, 아래 인덱스도 글자만으로 읽힌다. */
const GLYPH: Record<string, { char: string; read: string; meaning: string }> = {
  "love-life": { char: "戀", read: "연", meaning: "그리워하다" },
  "love-compatibility": { char: "合", read: "합", meaning: "맞물리다" },
  "love-reunion": { char: "再", read: "재", meaning: "다시" },
  "life-overview": { char: "命", read: "명", meaning: "타고난 결" },
  career: { char: "職", read: "직", meaning: "맡은 자리" },
  wealth: { char: "財", read: "재", meaning: "쌓이는 것" },
  health: { char: "身", read: "신", meaning: "몸" },
};

export default function ReportDeck({ categories }: { categories: Category[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  // 어느 장이 가운데 있는지. 스크롤 위치에서 바로 계산한다. 카드 폭이
  // 화면 폭에 따라 달라지므로 첫 카드의 실제 폭을 재서 나눈다.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let raf = 0;
    const read = () => {
      const card = el.firstElementChild as HTMLElement | null;
      if (!card) return;
      const step = card.getBoundingClientRect().width + 16; // gap-4
      setActive(Math.max(0, Math.min(categories.length - 1, Math.round(el.scrollLeft / step))));
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(read);
    };
    read();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [categories.length]);

  const goTo = useCallback((i: number) => {
    const el = trackRef.current;
    const card = el?.children[i] as HTMLElement | undefined;
    if (!el || !card) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: card.offsetLeft - el.offsetLeft, behavior: reduce ? "auto" : "smooth" });
  }, []);

  return (
    <div>
      {/* 카드 덱 — 양옆을 화면 밖까지 늘려 다음 장이 살짝 보이게 한다.
          넘길 수 있다는 걸 화살표로 설명하지 않아도 알게 되는 자리다. */}
      <div
        ref={trackRef}
        className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain scroll-smooth px-5 pb-2 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {categories.map((c, i) => (
          <Card key={c.id} c={c} index={i} total={categories.length} />
        ))}
      </div>

      {/* 인덱스 — 일곱 글자를 한 줄로. 지금 보는 장만 크고 진하다. */}
      <nav className="mt-7" aria-label="리딩 목록">
        <ul className="flex items-end justify-center gap-1">
          {categories.map((c, i) => {
            const g = GLYPH[c.id];
            const on = i === active;
            return (
              <li key={c.id}>
                <button
                  onClick={() => goTo(i)}
                  aria-current={on ? "true" : undefined}
                  className="flex min-h-11 w-11 flex-col items-center justify-end gap-1 pb-1 sm:w-12"
                >
                  <span
                    className={`font-serif leading-none transition-all duration-300 ${
                      on ? "text-[26px] text-ink" : "text-[17px] text-ink-faint"
                    }`}
                  >
                    {g?.char ?? c.name.slice(0, 1)}
                  </span>
                  <span
                    className={`h-1 w-1 rounded-full transition-colors duration-300 ${
                      on ? "bg-brass" : "bg-transparent"
                    }`}
                    aria-hidden
                  />
                  <span className="sr-only">{c.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
        {/* 활성 글자의 뜻 — 레퍼런스의 작은 세로 라벨 자리 */}
        <p className="mt-2 text-center text-[11px] tracking-[0.14em] text-ink-faint">
          {GLYPH[categories[active]?.id]?.meaning ?? ""}
        </p>
      </nav>
    </div>
  );
}

function Card({ c, index, total }: { c: Category; index: number; total: number }) {
  const Icon = categoryIcons[c.id];
  const g = GLYPH[c.id];
  const deep = c.tier === "deep";

  return (
    <article className="w-[calc(100%-2.5rem)] shrink-0 snap-center sm:w-[330px]">
      <Link
        href={categoryHref(c)}
        className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-line bg-white shadow-[0_10px_40px_rgba(23,24,28,0.07)] transition-shadow duration-300 hover:shadow-[0_16px_50px_rgba(23,24,28,0.12)]"
      >
        <div className="relative flex-1 px-6 pb-5 pt-5">
          <div className="flex items-center justify-between">
            <span className="font-serif text-[11.5px] text-ink-faint">
              {index + 1}/{total}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                deep ? "bg-brass-faint text-brass-ink" : "border border-line text-ink-faint"
              }`}
            >
              {deep ? "초상세" : "컴팩트"}
            </span>
          </div>

          {/* 얼굴 — 한자 한 글자와, 그 뒤로 도는 해 하나 */}
          <div className="relative mt-7 flex items-start justify-between">
            <div className="relative z-10">
              <p className="mb-1 font-serif text-[12px] tracking-[0.18em] text-ink-faint">
                {g?.read}
              </p>
              <p className="font-serif text-[62px] font-semibold leading-[0.9] text-ink">
                {g?.char ?? c.name.slice(0, 1)}
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              {/* 세로 한 줄 — 레퍼런스의 세로쓰기 자리 */}
              <p
                className="mt-1 text-[10.5px] leading-[1.8] tracking-[0.12em] text-ink-faint"
                style={{ writingMode: "vertical-rl" }}
              >
                {c.group}
              </p>
              <div className="relative">
                <span
                  className="absolute -right-1 -top-2 block h-[72px] w-[72px] rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle at 38% 36%, #eeb694 0%, #dd8a63 58%, rgba(221,138,99,0) 100%)",
                    opacity: 0.5,
                  }}
                  aria-hidden
                />
                <span className="relative flex h-[72px] w-[72px] items-center justify-center text-ink/65">
                  <Icon className="h-11 w-11" />
                </span>
              </div>
            </div>
          </div>

          <h3 className="mt-7 break-keep font-serif text-[19px] font-bold leading-snug text-ink">
            {c.name}
          </h3>
          <p className="mt-2.5 break-keep text-[13px] leading-relaxed text-ink-soft">
            {c.short}
          </p>

          <ul className="mt-5 space-y-1.5 border-t border-line pt-4">
            {c.questions.slice(0, 2).map((q, i) => (
              <li
                key={q}
                className="flex items-start gap-2 break-keep text-[12px] leading-snug text-ink-soft"
              >
                <span className="mt-[5px] block h-1 w-1 shrink-0 rounded-full bg-brass" aria-hidden />
                <span className="min-w-0">{q}</span>
                {i === 0 && (
                  <span className="mt-px shrink-0 rounded-full bg-brass-faint px-1.5 py-0.5 text-[9px] font-bold text-brass-ink">
                    무료
                  </span>
                )}
              </li>
            ))}
            <li className="pl-3 text-[11.5px] text-ink-faint">
              외 {c.questions.length - 2}개 질문
            </li>
          </ul>
        </div>

        <div className="flex items-center justify-between border-t border-line px-6 py-4">
          <span className="text-[11.5px] text-ink-faint">
            {deep ? "13,000자" : "7,000자"} 안팎
          </span>
          <span className="flex items-baseline gap-1">
            <span className="font-serif text-[19px] font-bold text-ink">
              {c.price.toLocaleString("ko-KR")}
            </span>
            <span className="text-[12px] text-ink-soft">원</span>
            <IconArrow className="ml-1 h-4 w-4 self-center text-brass-ink transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>
    </article>
  );
}
