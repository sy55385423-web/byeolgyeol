import type { Metadata } from "next";
import Link from "next/link";
import { categories, categoryHref } from "@/data/categories";
import { categoryIcons, IconArrow } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "리포트 — 별:결",
  description: "연애, 궁합, 재회, 커리어, 재물, 건강. 지금 가장 궁금한 것부터 선택하세요.",
};

export default function ReportsPage() {
  return (
    <main className="mx-auto max-w-5xl px-5 pb-16 pt-10 sm:pt-14">
      <p className="text-sm font-medium tracking-widest text-brass">REPORT</p>
      <h1 className="mt-3 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
        지금 궁금한 것 하나를 고르세요
      </h1>

      <div className="mt-8 space-y-3">
        {categories.map((c) => {
          const Icon = categoryIcons[c.id];
          return (
            <Link
              key={c.id}
              href={categoryHref(c)}
              className="group flex flex-col rounded-xl border border-line bg-white/70 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-brass/50 hover:shadow-[0_8px_30px_rgba(23,24,28,0.06)]"
            >
              <div className="flex items-center justify-between">
                <span className="text-brass">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="flex items-center gap-1.5 text-[10px] text-ink-faint">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                      c.tier === "deep" ? "bg-brass-faint text-brass" : "bg-paper-warm text-ink-faint"
                    }`}
                  >
                    {c.tier === "deep" ? "초상세" : "컴팩트"}
                  </span>
                  {["love-life", "love-compatibility", "love-reunion"].includes(c.id)
                    ? "약 1만자 이상"
                    : "약 3천자 이상"}
                </span>
              </div>
              <h3 className="mt-3 font-serif text-[15px] font-semibold">{c.name}</h3>
              <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">{c.short}</p>
              <ul className="mt-3 space-y-1 border-t border-line pt-3 text-[11.5px] text-ink-faint">
                {c.questions.slice(0, 3).map((q) => (
                  <li key={q} className="flex gap-1.5">
                    <span className="text-brass">·</span>
                    {q}
                  </li>
                ))}
                {c.questions.length > 3 && (
                  <li className="text-brass">외 {c.questions.length - 3}개 질문</li>
                )}
              </ul>
              <div className="mt-3 flex items-center justify-between pt-3">
                <span className="flex items-center gap-1 text-[12.5px] font-medium text-ink transition-colors group-hover:text-brass">
                  {c.cta}
                  <IconArrow className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
                <span className="text-[12px] font-semibold text-brass">
                  {c.price.toLocaleString("ko-KR")}원
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
