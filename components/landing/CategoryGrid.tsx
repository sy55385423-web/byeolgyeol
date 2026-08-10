import Link from "next/link";
import { categories, categoryHref } from "@/data/categories";
import { categoryIcons, IconArrow } from "@/components/ui/icons";
import Reveal from "@/components/ui/Reveal";

export default function CategoryGrid() {
  return (
    <section id="readings" className="mx-auto max-w-5xl px-5 py-20 sm:py-28">
      <Reveal>
        <p className="text-sm font-medium tracking-widest text-brass">READINGS</p>
        <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
          여섯 가지 결
        </h2>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-soft">
          지금 가장 궁금한 것 하나부터 시작하세요.
          각 리딩이 어떤 질문에 답하는지 먼저 보여드립니다.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c, i) => {
          const Icon = categoryIcons[c.id];
          return (
            <Reveal key={c.id} delay={i * 0.06}>
              <Link
                href={categoryHref(c)}
                className="group flex h-full flex-col rounded-2xl border border-line bg-white/70 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-brass/50 hover:shadow-[0_8px_30px_rgba(23,24,28,0.06)]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-brass">
                    <Icon className="h-7 w-7" />
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-ink-faint">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        c.tier === "deep"
                          ? "bg-brass-faint text-brass"
                          : "bg-paper-warm text-ink-faint"
                      }`}
                    >
                      {c.tier === "deep" ? "초상세" : "컴팩트"}
                    </span>
                    {["love-life", "love-compatibility", "love-reunion"].includes(c.id)
                      ? "약 1만자 이상"
                      : "약 3천자 이상"}
                  </span>
                </div>
                <h3 className="mt-5 font-serif text-xl font-semibold">{c.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{c.short}</p>
                <ul className="mt-5 space-y-1.5 border-t border-line pt-4 text-[13px] text-ink-faint">
                  {c.questions.slice(0, 3).map((q) => (
                    <li key={q} className="flex gap-2">
                      <span className="text-brass">·</span>
                      {q}
                    </li>
                  ))}
                  {c.questions.length > 3 && (
                    <li className="text-brass">외 {c.questions.length - 3}개 질문</li>
                  )}
                </ul>
                <div className="mt-auto flex items-center justify-between pt-5">
                  <span className="flex items-center gap-1.5 text-sm font-medium text-ink transition-colors group-hover:text-brass">
                    {c.cta}
                    <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                  <span className="text-[13px] font-semibold text-brass">
                    {c.price.toLocaleString("ko-KR")}원
                  </span>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
