import type { Metadata } from "next";
import Link from "next/link";
import { categories, categoryHref, type Category } from "@/data/categories";
import { categoryIcons, IconArrow } from "@/components/ui/icons";
import Reveal from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "리포트 — 별:결",
  description: "연애, 궁합, 재회, 커리어, 재물, 건강. 지금 가장 궁금한 것부터 선택하세요.",
};

/** 리포트 탭 — 벤토 그리드.
 *
 *  예전에는 위에 반폭 카드 하나를 가운데 놓고 아래에 두 장을 까는 "삼각형"
 *  배치였다. 위 카드 양옆이 통째로 비어서 의도한 구성이 아니라 깨진 것처럼
 *  보였다. 카드 안도 문제였다 — 제목·설명·질문이 전부 한 줄로 잘려서
 *  "타고난 매력부터 결혼…"처럼 말이 끊긴 채로만 읽혔고, 아이콘은 14px라
 *  거의 안 보였다.
 *
 *  크기를 달리한 타일로 위계를 만든다. 대표 리딩 하나는 가로 전체를 쓰면서
 *  질문을 세 개까지 보여 주고, 나머지는 2열로 깐다. 잘라내는 대신 담을
 *  만큼만 담는다. */

const LENGTH = (c: Category) => (c.tier === "deep" ? "13,000자" : "7,000자");

/** 가로로 넓게 놓이는 대표 카드 */
function FeatureCard({ c }: { c: Category }) {
  const Icon = categoryIcons[c.id];
  return (
    <Link
      href={categoryHref(c)}
      className="group relative flex flex-col overflow-hidden rounded-[26px] border border-brass/25 bg-night p-6 text-paper transition-all duration-300 hover:-translate-y-1 hover:border-brass/60 hover:shadow-[0_18px_44px_rgba(19,22,34,0.34)]"
    >
      {/* 대표 카드에만 도는 황동빛 — 위계를 색으로도 준다 */}
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full opacity-60 blur-3xl transition-opacity duration-500 group-hover:opacity-90"
        style={{ background: "radial-gradient(circle, rgba(183,138,60,0.5) 0%, rgba(183,138,60,0) 70%)" }}
        aria-hidden
      />
      <div className="relative flex items-start justify-between gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-brass/30 bg-brass/10 text-brass-soft">
          <Icon className="h-5 w-5" />
        </span>
        <span className="rounded-full bg-brass px-2.5 py-1 text-[10px] font-bold tracking-wide text-night">
          가장 많이 봐요
        </span>
      </div>

      <h3 className="relative mt-5 font-serif text-[22px] font-bold leading-tight">{c.name}</h3>
      <p className="relative mt-2 break-keep text-[13.5px] leading-relaxed text-paper/60">{c.short}</p>

      <ul className="relative mt-5 space-y-1.5 border-t border-paper/10 pt-4">
        {c.questions.slice(0, 3).map((q, i) => (
          <li key={q} className="flex items-start gap-2 break-keep text-[12.5px] leading-snug text-paper/70">
            <span className="mt-[3px] shrink-0 text-[9px] text-brass-soft">◆</span>
            {q}
            {i === 0 && (
              <span className="mt-px shrink-0 rounded-full bg-brass/20 px-1.5 py-0.5 text-[9px] font-bold text-brass-soft">
                무료
              </span>
            )}
          </li>
        ))}
        <li className="pl-4 text-[12px] text-paper/40">외 {c.questions.length - 3}개 질문</li>
      </ul>

      <div className="relative mt-5 flex items-end justify-between border-t border-paper/10 pt-4">
        <span className="text-[11.5px] text-paper/50">{LENGTH(c)} 안팎 · 초상세</span>
        <span className="flex items-baseline gap-1.5">
          <span className="font-serif text-[22px] font-bold text-brass-soft">
            {c.price.toLocaleString("ko-KR")}
          </span>
          <span className="text-[12px] text-paper/60">원</span>
          <IconArrow className="ml-0.5 h-4 w-4 self-center text-brass-soft transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

/** 2열로 깔리는 기본 카드 */
function ReportCard({ c }: { c: Category }) {
  const Icon = categoryIcons[c.id];
  return (
    <Link
      href={categoryHref(c)}
      className="group flex h-full flex-col rounded-[22px] border border-brass/15 bg-night p-4 text-paper transition-all duration-300 hover:-translate-y-1 hover:border-brass/50 hover:shadow-[0_14px_34px_rgba(19,22,34,0.3)]"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-brass/25 bg-brass/10 text-brass-soft">
          <Icon className="h-4 w-4" />
        </span>
        <span className="mt-0.5 rounded-full border border-paper/15 px-1.5 py-0.5 text-[9px] font-medium text-paper/60">
          {c.tier === "deep" ? "초상세" : "컴팩트"}
        </span>
      </div>

      <h3 className="mt-3.5 break-keep font-serif text-[15px] font-bold leading-snug">{c.name}</h3>
      <p className="mt-1.5 line-clamp-2 break-keep text-[11.5px] leading-relaxed text-paper/55">
        {c.short}
      </p>

      <p className="mt-3 flex items-start gap-1.5 break-keep text-[11px] leading-snug text-paper/65">
        <span className="mt-px shrink-0 rounded-full bg-brass/20 px-1.5 py-0.5 text-[9px] font-bold text-brass-soft">
          무료
        </span>
        <span className="line-clamp-2">{c.questions[0]}</span>
      </p>

      <div className="mt-auto flex items-end justify-between pt-4">
        <span className="text-[10px] text-paper/50">{LENGTH(c)}</span>
        <span className="flex items-baseline gap-0.5">
          <span className="font-serif text-[16px] font-bold text-brass-soft">
            {c.price.toLocaleString("ko-KR")}
          </span>
          <span className="text-[10.5px] text-paper/60">원</span>
        </span>
      </div>
    </Link>
  );
}

export default function ReportsPage() {
  const love = categories.filter((c) => c.group === "연애·인간관계");
  const rest = categories.filter((c) => c.group !== "연애·인간관계");
  const [feature, ...loveRest] = love;

  return (
    <main className="mx-auto max-w-2xl px-5 pb-16 pt-10 sm:pt-14">
      <Reveal>
        <p className="text-xs font-medium tracking-[0.2em] text-brass-ink">REPORT</p>
        <h1 className="mt-2.5 break-keep font-serif text-[27px] font-semibold leading-tight tracking-tight sm:text-3xl">
          지금 궁금한 것
          <br />
          하나부터 시작하세요
        </h1>
        <p className="mt-3 break-keep text-[13.5px] leading-relaxed text-ink-soft">
          사주로 뼈대를, 자미두수로 영역을, 점성술로 기질을 세워 읽습니다.
          모든 리딩에서 한 항목은 결제 없이 공개해요.
        </p>
      </Reveal>

      <section className="mt-9">
        <Reveal>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-serif text-[15px] font-semibold">연애 · 인간관계</h2>
            <span className="text-[11px] text-ink-faint">{love.length}개 리딩</span>
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <FeatureCard c={feature} />
        </Reveal>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {loveRest.map((c, i) => (
            <Reveal key={c.id} className="h-full" delay={0.1 + i * 0.05}>
              <ReportCard c={c} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <Reveal>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-serif text-[15px] font-semibold">인생 · 커리어 · 재물 · 건강</h2>
            <span className="text-[11px] text-ink-faint">{rest.length}개 리딩</span>
          </div>
        </Reveal>
        <div className="grid grid-cols-2 gap-3">
          {rest.map((c, i) => (
            <Reveal key={c.id} className="h-full" delay={i * 0.05}>
              <ReportCard c={c} />
            </Reveal>
          ))}
        </div>
      </section>

      <Reveal delay={0.1}>
        <p className="mt-8 break-keep rounded-2xl border border-line bg-white/50 px-5 py-4 text-[12.5px] leading-relaxed text-ink-soft">
          어느 리딩이든 생년월일을 넣으면 먼저 미리보기가 나옵니다. 한 항목은 실제
          결과를 공개하고 나머지는 수치만 가려서 보여 드려요. 결제는 그다음에
          정하셔도 됩니다.
        </p>
      </Reveal>
    </main>
  );
}
