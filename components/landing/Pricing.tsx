import Reveal from "@/components/ui/Reveal";
import { pricing } from "@/data/site";
import { IconCheck } from "@/components/ui/icons";

/** 가격 섹션 — 두 티어 카드 + 혜택 요약. 퀄리티 대비 저렴함 강조 */
export default function Pricing() {
  const won = (n: number) => n.toLocaleString("ko-KR") + "원";

  const deepFeatures = [
    "8~10개 항목 초상세 풀이",
    "요약 수치 전체 공개 (인기 % · 궁합 점수 · 재회 확률)",
    "리뷰 작성 시 추가 질문 1회",
    "링크 저장 · 공유 · 평생 다시 보기",
  ];
  const lightFeatures = [
    "5~7개 핵심 항목 분석",
    "시기·행동 조언 포함",
    "리뷰 작성 시 추가 질문 1회",
    "링크 저장 · 평생 다시 보기",
  ];

  return (
    <section id="pricing" className="border-t border-line bg-paper-warm/50">
      <div className="mx-auto max-w-3xl px-5 py-20 sm:py-28">
        <Reveal>
          <p className="text-center text-sm font-medium tracking-widest text-brass">PRICING</p>
          <h2 className="mt-3 text-center font-serif text-3xl font-semibold leading-snug tracking-tight sm:text-4xl">
            대면 사주 상담의 1/10도 안 되는
            <br />
            가격으로 더 정확하게
          </h2>
          <p className="mx-auto mt-5 max-w-md text-center text-[15px] leading-relaxed text-ink-soft">
            대면 상담 한 번이 5만 원. 별:결은 세 가지 기법의 교차 분석과
            1만자 이상 분량의 리포트를 커피 한 잔 값에 드립니다.
          </p>
        </Reveal>

        {/* 가격 카드 */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          <Reveal>
            <div className="relative flex h-full flex-col rounded-2xl border-2 border-brass bg-white p-7">
              <span className="absolute -top-3 left-6 rounded-full bg-brass px-3 py-1 text-[11px] font-bold text-night">
                인기
              </span>
              <p className="text-xs font-medium tracking-widest text-brass">연애 · 궁합 · 재회 · 평생 총론</p>
              <h3 className="mt-2 font-serif text-xl font-semibold">초상세 리딩</h3>
              <p className="mt-4 font-serif text-4xl font-bold text-ink">{won(pricing.loveReadings)}</p>
              <ul className="mt-5 space-y-2">
                {deepFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[13px] text-ink-soft">
                    <IconCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brass" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={0.07}>
            <div className="flex h-full flex-col rounded-2xl border border-line bg-white/70 p-7">
              <p className="text-xs font-medium tracking-widest text-ink-faint">커리어 · 재물 · 건강</p>
              <h3 className="mt-2 font-serif text-xl font-semibold">컴팩트 리딩</h3>
              <p className="mt-4 font-serif text-4xl font-bold">{won(pricing.basicReadings)}</p>
              <ul className="mt-5 space-y-2">
                {lightFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[13px] text-ink-soft">
                    <IconCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-faint" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        {/* 요약보기 안내 */}
        <Reveal delay={0.1}>
          <div className="mt-5 rounded-2xl border border-line bg-white px-5 py-4 text-[13px] text-ink-soft">
            <span className="font-medium text-ink">요약 수치 미리보기</span>는 연애 총론·궁합·재회에서만 제공됩니다.
            커리어·재물·건강은 핵심 문장 한 줄을 미리 공개하는 방식으로 제공됩니다.
          </div>
        </Reveal>

        {/* 리뷰 추가질문 안내 */}
        <Reveal delay={0.12}>
          <div className="mt-3 rounded-2xl bg-night px-5 py-4 text-[13px] text-paper/70">
            리뷰를 남기면 <span className="font-semibold text-brass-soft">추가 질문 1회</span>가 활성화됩니다.
            리포트 하단에서 바로 명반 기반 답변을 받을 수 있어요. 전 리딩 공통 혜택입니다.
          </div>
        </Reveal>
      </div>
    </section>
  );
}
