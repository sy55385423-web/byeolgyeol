import type { Metadata } from "next";
import Link from "next/link";
import { categories, categoryHref, type Category } from "@/data/categories";
import { categoryIcons } from "@/components/ui/icons";
import Reveal from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "리포트 — 별:결",
  description: "연애, 궁합, 재회, 커리어, 재물, 건강. 지금 가장 궁금한 것부터 선택하세요.",
};

function ReportCard({ c }: { c: Category }) {
  const Icon = categoryIcons[c.id];
  return (
    <Link
      href={categoryHref(c)}
      className="group flex h-full flex-col rounded-2xl border border-brass/20 bg-night/95 p-3 text-paper transition-all duration-200 hover:-translate-y-0.5 hover:border-brass/50 hover:shadow-[0_10px_26px_rgba(19,22,34,0.28)]"
    >
      <div className="flex items-center justify-between">
        <span className="text-brass-soft">
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span className="rounded-full border border-paper/15 px-1.5 py-0.5 text-[8.5px] font-medium text-paper/55">
          {c.tier === "deep" ? "초상세" : "컴팩트"}
        </span>
      </div>
      <h3 className="mt-1.5 line-clamp-2 break-keep font-serif text-[13.5px] font-semibold leading-snug text-paper">
        {c.name}
      </h3>
      <p className="mt-1 line-clamp-1 break-keep text-[10.5px] leading-relaxed text-paper/55">{c.short}</p>
      <p className="mt-1.5 flex items-start gap-1">
        <span className="mt-px shrink-0 rounded-full bg-brass px-1.5 py-0.5 text-[8px] font-bold text-night">
          무료
        </span>
        <span className="line-clamp-1 break-keep text-[10px] leading-snug text-paper/50">{c.questions[0]}</span>
      </p>
      <div className="mt-auto pt-2">
        <p className="text-[9px] whitespace-nowrap text-paper/35">
          {["love-life", "love-compatibility", "love-reunion", "life-overview"].includes(c.id) ? "1만자 이상" : "3천자 이상"}
        </p>
        <p className="mt-0.5 whitespace-nowrap text-right font-serif text-[13.5px] font-bold text-brass-soft">
          {c.price.toLocaleString("ko-KR")}원
        </p>
      </div>
    </Link>
  );
}

export default function ReportsPage() {
  const loveCategories = categories.filter((c) => c.group === "연애·인간관계");
  const otherCategories = categories.filter((c) => c.group !== "연애·인간관계");

  return (
    <main className="mx-auto max-w-5xl px-5 pb-16 pt-10 sm:pt-14">
      <p className="text-sm font-medium tracking-widest text-brass">별:결 PREMIUM REPORT</p>
      <p className="mt-3 text-[13px] text-ink-soft">사주+자미두수+점성술을 결합한 프리미엄 리포트</p>
      <h1 className="mt-2 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
        지금 궁금한 것 하나를 고르세요
      </h1>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {["사주 만세력", "자미두수 12궁", "서양 점성술"].map((t) => (
          <span key={t} className="rounded-full border border-line px-2.5 py-1 text-[10.5px] font-medium text-ink-soft">
            {t}
          </span>
        ))}
      </div>

      <div className="mt-8 rounded-3xl border border-line bg-white/40 p-4 sm:p-5">
        <p className="text-xs font-medium tracking-wide text-ink-faint">연애·인간관계</p>
        {/* 삼각형 배치 — 위 1개(아래 카드와 같은 폭), 아래 2개 */}
        <div className="mt-2.5 space-y-2.5">
          <Reveal delay={0}>
            <div className="mx-auto w-[calc(50%-5px)]">
              <ReportCard c={loveCategories[0]} />
            </div>
          </Reveal>
          <div className="grid grid-cols-2 gap-2.5">
            {loveCategories.slice(1).map((c, i) => (
              <Reveal key={c.id} className="h-full" delay={(i + 1) * 0.05}>
                <ReportCard c={c} />
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-3xl border border-line bg-white/40 p-4 sm:p-5">
        <p className="text-xs font-medium tracking-wide text-ink-faint">인생·커리어·재물·건강</p>
        <div className="mt-2.5 grid grid-cols-2 gap-2.5">
          {otherCategories.map((c, i) => (
            <Reveal key={c.id} className="h-full" delay={i * 0.05}>
              <ReportCard c={c} />
            </Reveal>
          ))}
        </div>
      </div>
    </main>
  );
}
