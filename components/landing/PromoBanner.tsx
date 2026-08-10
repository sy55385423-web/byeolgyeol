import Reveal from "@/components/ui/Reveal";

const items = [
  { icon: "◎", text: "사주·자미두수·점성술 세 체계 교차 분석" },
  { icon: "✦", text: "생년월일만으로 — 가입·설치 없이 바로" },
  { icon: "◈", text: "리뷰 작성 시 추가 질문 1회 무료 제공" },
];

export default function PromoBanner() {
  return (
    <Reveal>
      <section className="border-y border-line bg-paper-warm/50">
        <div className="mx-auto max-w-5xl px-5">
          <div className="flex flex-col divide-y divide-line sm:flex-row sm:divide-x sm:divide-y-0">
            {items.map((item) => (
              <div
                key={item.text}
                className="flex flex-1 items-center gap-3 py-5 sm:justify-center sm:px-6 sm:py-7"
              >
                <span className="text-sm text-brass">{item.icon}</span>
                <span className="text-[13.5px] leading-snug text-ink-soft">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Reveal>
  );
}
