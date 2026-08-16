import Link from "next/link";
import { categories } from "@/data/categories";
import Reveal from "@/components/ui/Reveal";
import { IconArrow } from "@/components/ui/icons";

/** 랜딩 초반 — "결과를 먼저 보여주는" 미리보기 리포트 홍보 섹션 */
export default function PreviewPromo() {
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
                일곱 가지 리딩 · 무료 공개 항목
              </span>
              <span className="rounded-full border border-line bg-white px-2.5 py-0.5 text-[11px] text-ink-faint">
                샘플
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {categories.map((c) => {
                const revealedStat = c.previewStats?.find((s) => s.revealed);
                return (
                  <div key={c.id} className="rounded-xl border border-line bg-white p-4">
                    <p className="text-[11px] font-medium text-ink-faint">{c.name}</p>
                    {revealedStat ? (
                      <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-soft">
                        {revealedStat.prefix}
                        <span className="font-serif text-lg font-bold text-brass">
                          {revealedStat.value}
                        </span>
                        {revealedStat.suffix}
                      </p>
                    ) : (
                      <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-soft">
                        "{c.previewLine}"
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="mt-4 px-1 text-xs text-ink-faint">
              나머지 항목은 결제 없이도 수치만 가린 미리보기로 전부 보여드려요
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
