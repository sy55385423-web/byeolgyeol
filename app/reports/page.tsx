import type { Metadata } from "next";
import { categories } from "@/data/categories";
import ReportDeck from "@/components/reports/ReportDeck";
import Reveal from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "리포트 — 별:결",
  description: "연애, 궁합, 재회, 커리어, 재물, 건강. 한 장씩 넘겨 보고 하나를 고르세요.",
};

/** 리포트 탭.
 *
 *  일곱 개를 격자로 늘어놓던 것을 한 장씩 넘겨 보는 덱으로 바꿨다.
 *  고르는 자리에서는 여러 개를 동시에 비교하기보다 하나를 제대로 보는 편이
 *  낫고, 그래야 카드 하나에 질문과 분량과 값을 다 담을 여유가 생긴다. */
export default function ReportsPage() {
  return (
    <main className="mx-auto max-w-xl px-5 pb-16 pt-9 sm:pt-12">
      <Reveal>
        <div className="text-center">
          <p className="text-xs font-medium tracking-[0.22em] text-brass-ink">REPORT</p>
          <h1 className="mt-2.5 font-serif text-[25px] font-semibold tracking-tight sm:text-[28px]">
            일곱 가지 결
          </h1>
          <p className="mx-auto mt-2.5 max-w-[19rem] break-keep text-[13px] leading-relaxed text-ink-soft">
            옆으로 넘기며 하나씩 보세요. 어느 것이든 한 항목은 결제 없이
            공개합니다.
          </p>
        </div>
      </Reveal>

      <div className="mt-7">
        <ReportDeck categories={categories} />
      </div>

      <Reveal delay={0.12}>
        <p className="mt-9 break-keep rounded-2xl border border-line bg-white/50 px-5 py-4 text-[12.5px] leading-relaxed text-ink-soft">
          생년월일을 넣으면 먼저 미리보기가 나옵니다. 한 항목은 실제 결과를
          공개하고 나머지는 수치만 가려서 보여 드려요. 결제는 그다음에 정하셔도
          됩니다.
        </p>
      </Reveal>
    </main>
  );
}
