import type { Metadata } from "next";
import Link from "next/link";
import { IconArrow, IconPersonaBadge } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "우리끼리 — 별:결",
};

export default function TogetherPage() {
  return (
    <main className="mx-auto max-w-lg px-5 pb-16 pt-10 sm:pt-14">
      <p className="text-sm font-medium tracking-widest text-brass">TOGETHER</p>
      <h1 className="mt-3 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
        우리끼리
      </h1>
      <p className="mt-3 text-[13.5px] leading-relaxed text-ink-soft">
        친구들과 함께 즐기는 무료 기능이 이곳에 모여요.
      </p>

      <div className="mt-8 space-y-3">
        <Link
          href="/together/persona"
          className="group flex items-center gap-4 rounded-2xl border border-line bg-white/70 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-brass/50 hover:shadow-[0_8px_30px_rgba(23,24,28,0.06)]"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brass-faint text-brass">
            <IconPersonaBadge className="h-6 w-6" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5">
              <span className="font-serif text-[16px] font-semibold">나의 별:결</span>
              <span className="rounded-full bg-paper-warm px-2 py-0.5 text-[10px] font-semibold text-ink-faint">무료</span>
            </span>
            <span className="mt-1 block text-[13px] text-ink-soft">
              사주·자미두수·점성술로 내 유형을 찾고, 친구와 궁합을 %로 확인해요.
            </span>
          </span>
          <IconArrow className="h-4 w-4 shrink-0 text-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:text-ink" />
        </Link>
      </div>

      <p className="mt-8 text-center text-[13px] text-ink-faint">
        더 많은 기능이 곧 추가돼요.
      </p>
    </main>
  );
}
