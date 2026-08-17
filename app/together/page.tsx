import type { Metadata } from "next";
import Link from "next/link";
import { IconArrow } from "@/components/ui/icons";
import { personaFromChoice } from "@/lib/persona";
import { PersonaBadge } from "@/components/persona/PersonaCard";
import WeddingCharacter from "@/components/top1/WeddingCharacter";

export const metadata: Metadata = {
  title: "우리끼리 — 별:결",
};

export default function TogetherPage() {
  const examplePersona = personaFromChoice(1, "사자자리"); // 불꽃파워 사자 — 오행 배경색·캐릭터 예시용
  return (
    <main className="mx-auto max-w-lg px-5 pb-16 pt-10 sm:pt-14">
      <p className="text-sm font-medium tracking-widest text-brass">TOGETHER</p>
      <h1 className="mt-3 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
        우리끼리
      </h1>
      <p className="mt-3 text-[13.5px] leading-relaxed text-ink-soft">
        친구들과 함께 즐기는 무료 기능이 이곳에 모여요.
      </p>

      <div className="mt-8 flex flex-col gap-4">
        {/* 나의 별:결 */}
        <Link
          href="/together/persona"
          className="group relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-3xl border border-brass/25 p-6 text-center transition-transform duration-300 active:scale-[0.98]"
          style={{ background: examplePersona.type.badge.dark }}
        >
          <span className="absolute left-5 top-5 rounded-full bg-paper/90 px-2.5 py-1 text-[10px] font-semibold text-ink-faint">
            무료
          </span>
          <div className="transition-transform duration-300 group-hover:scale-105">
            <PersonaBadge type={examplePersona.type} size={112} />
          </div>
          <p className="mt-5 text-xs font-medium tracking-widest text-brass-soft">MY 별:결</p>
          <h2 className="mt-1.5 font-serif text-xl font-bold text-paper">나의 별:결 유형 캐릭터</h2>
          <p className="mt-2 max-w-[240px] text-[13px] leading-relaxed text-paper/60">
            사주·자미두수·점성술로 내 유형을 찾고, 친구와 궁합을 %로 확인해요.
          </p>
          <span className="mt-4 flex items-center gap-1 text-[12.5px] font-semibold text-brass-soft transition-transform group-hover:translate-x-0.5">
            시작하기
            <IconArrow className="h-3.5 w-3.5" />
          </span>
        </Link>

        {/* 우리중 TOP1 */}
        <Link
          href="/together/top1"
          className="group relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-3xl border p-6 text-center transition-transform duration-300 active:scale-[0.98]"
          style={{ borderColor: "#f3b8c8", background: "linear-gradient(160deg, #ffedf1 0%, #fff6e0 100%)" }}
        >
          <span
            className="absolute left-5 top-5 rounded-full bg-white/70 px-2.5 py-1 text-[10px] font-semibold"
            style={{ color: "#d6467a" }}
          >
            무료
          </span>
          <div className="transition-transform duration-300 group-hover:scale-105">
            <WeddingCharacter stage="adult" size={140} />
          </div>
          <p className="text-xs font-medium tracking-widest" style={{ color: "#d6467a" }}>
            우리중 TOP1
          </p>
          <h2 className="mt-1.5 font-serif text-xl font-bold text-ink">결혼 가장 먼저 하는 사람은?</h2>
          <p className="mt-2 max-w-[240px] text-[13px] leading-relaxed text-ink-soft">
            생년월일로 예상 결혼 나이를 확인하고, 친구들과 순위로 비교해요.
          </p>
          <span
            className="mt-4 flex items-center gap-1 text-[12.5px] font-semibold transition-transform group-hover:translate-x-0.5"
            style={{ color: "#d6467a" }}
          >
            시작하기
            <IconArrow className="h-3.5 w-3.5" />
          </span>
        </Link>
      </div>

      <p className="mt-8 text-center text-[13px] text-ink-faint">
        더 많은 기능이 곧 추가돼요.
      </p>
    </main>
  );
}
