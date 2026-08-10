import Reveal from "@/components/ui/Reveal";

/** 맨 앞 신뢰 근거 섹션 — 감이 아니라 계산이라는 것을 먼저 증명 */
export default function Evidence() {
  const bases = [
    {
      t: "사주명리",
      sub: "1,000년의 기록",
      d: "수많은 출생과 삶의 궤적을 간지력으로 정리해 온 동아시아의 운명 기록 체계. 같은 입력이면 언제 어디서 계산해도 같은 명식이 나옵니다.",
    },
    {
      t: "자미두수",
      sub: "송대 황실의 명반학",
      d: "별의 위치를 12궁에 배치해 삶의 영역별 흐름을 읽는 정밀 체계. 궁과 별의 조합이 만들어내는 경우의 수로 개인을 구분합니다.",
    },
    {
      t: "서양점성술",
      sub: "천문학에서 나온 언어",
      d: "행성의 실제 좌표를 기반으로 하는 서양의 해석 체계. 태양·달·상승궁의 조합은 천문 계산 그 자체입니다.",
    },
  ];
  return (
    <section className="mx-auto max-w-5xl px-5 py-20 sm:py-28">
      <Reveal>
        <p className="text-sm font-medium tracking-widest text-brass">METHOD</p>
        <h2 className="mt-3 font-serif text-3xl font-semibold leading-snug tracking-tight sm:text-4xl">
          타고난 흐름을 읽는
          <br />
          가장 정교한 방법
        </h2>
        <p className="mt-2 text-[13px] text-ink-faint">
          전통적인 세 가지 기법으로 정밀하고 정확하게 풀어냅니다.
        </p>
        <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-ink-soft">
          세 체계는 모두 태어난 순간의 좌표를 정해진 규칙으로 계산하는 기록의
          학문입니다. 별:결은 여기에 수천 개 명반의 패턴 데이터를 더해, 세 기법이
          같은 방향을 가리키는 지점만 골라 말합니다. 감상이 아니라 교차 검증입니다.
        </p>
      </Reveal>
      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        {bases.map((b, i) => (
          <Reveal key={b.t} delay={i * 0.07}>
            <div className="h-full rounded-2xl border border-line bg-white/70 p-6">
              <p className="text-xs font-medium text-brass">{b.sub}</p>
              <h3 className="mt-1.5 font-serif text-xl font-semibold">{b.t}</h3>
              <p className="mt-3 text-[13.5px] leading-relaxed text-ink-soft">{b.d}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal delay={0.15}>
        <div className="mt-4 rounded-2xl bg-night p-6 text-paper sm:p-7">
          <p className="font-serif text-lg font-semibold text-brass-soft">
            세 기법이 겹치는 지점만 말합니다
          </p>
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-paper/60">
            하나의 기법으로는 해석이 갈릴 수 있습니다. 별:결은 사주·자미두수·점성술을
            각각 따로 계산한 뒤, 세 결과가 일치하는 방향 하나만 문장으로 만듭니다.
            그래서 리포트에 두루뭉술한 말이 들어갈 자리가 없습니다.
          </p>
        </div>
      </Reveal>
    </section>
  );
}
