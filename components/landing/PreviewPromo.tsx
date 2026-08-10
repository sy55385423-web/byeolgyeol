import Link from "next/link";
import { categories } from "@/data/categories";
import StatGrid from "@/components/ui/StatGrid";
import Reveal from "@/components/ui/Reveal";
import { IconArrow } from "@/components/ui/icons";

/** 랜딩 초반 — "결과를 먼저 보여주는" 미리보기 리포트 홍보 섹션 */
export default function PreviewPromo() {
  const loveLife = categories.find((c) => c.id === "love-life")!;
  return (
    <section className="mx-auto max-w-5xl px-5 py-20 sm:py-28">
      <div className="grid items-center gap-10 sm:grid-cols-[1fr_1.1fr]">
        <Reveal>
          <p className="text-sm font-medium tracking-widest text-brass">PREVIEW</p>
          <h2 className="mt-3 font-serif text-3xl font-semibold leading-snug tracking-tight sm:text-4xl">
            결과부터
            <br />
            보여드립니다
          </h2>
          <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-ink-soft">
            타고난 인기가 상위 몇 %인지, 결제 없이 바로 공개합니다.
            나머지 항목도 전부 미리보기로 보여드려요 —
            수치만 가려져 있을 뿐, 어떤 답이 나왔는지 다 보입니다.
          </p>
          <Link
            href="/reading/love/life"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-ink px-6 py-3.5 text-[15px] font-semibold text-paper transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            내 인기 상위 % 확인하기
            <IconArrow className="h-4 w-4" />
          </Link>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="rounded-2xl border border-line bg-paper-warm/60 p-5">
            <div className="mb-4 flex items-center justify-between px-1">
              <span className="font-serif text-sm font-semibold">
                지수님의 평생 연애 총론 · 미리보기
              </span>
              <span className="rounded-full border border-line bg-white px-2.5 py-0.5 text-[11px] text-ink-faint">
                샘플
              </span>
            </div>
            <StatGrid stats={loveLife.previewStats!.slice(0, 6)} compact />
            <p className="mt-4 px-1 text-xs text-ink-faint">
              가려진 수치는 전체 리포트에서 공개돼요
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
