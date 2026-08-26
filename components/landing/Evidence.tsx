import Reveal from "@/components/ui/Reveal";

/** 맨 앞 신뢰 근거 섹션 — 감이 아니라 계산이라는 것을 먼저 증명한다.
 *
 *  예전에는 "세 기법이 같은 방향을 가리키는 지점만 골라 말합니다"라고 적어 뒀는데
 *  엔진은 그렇게 동작하지 않는다. 세 체계는 교집합을 내는 게 아니라 각자 다른
 *  질문에 답한다. 실제로 하는 일을 적는 편이 설명하기도 쉽다. */
export default function Evidence() {
  const bases = [
    {
      t: "사주명리",
      role: "뼈대",
      d: "여덟 글자에서 일간의 강약, 힘이 되는 오행과 부담이 되는 오행, 십신의 무게를 잽니다. 리포트에서 \"어떤 사람인가\"에 해당하는 부분이 여기서 나옵니다.",
    },
    {
      t: "자미두수",
      role: "영역",
      d: "열두 궁 중 어느 자리에 어떤 별이 앉았는지를 봅니다. 같은 기질도 연애에서 드러나는 사람과 일에서 드러나는 사람이 다른데, 그 갈림을 이쪽에서 읽습니다.",
    },
    {
      t: "서양점성술",
      role: "기질",
      d: "태양궁·달궁·상승궁의 좌표를 계산합니다. 본질과 감정과 첫인상이 서로 어긋나는 사람이 있고, 세 개가 한 방향인 사람이 있습니다.",
    },
  ];
  return (
    <section className="mx-auto max-w-5xl px-5 py-20 sm:py-28">
      <Reveal>
        <p className="text-sm font-medium tracking-widest text-brass-ink">METHOD</p>
        <h2 className="mt-3 font-serif text-3xl font-semibold leading-snug tracking-tight sm:text-4xl">
          세 체계가 각각
          <br />
          다른 층을 맡습니다
        </h2>
        <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-ink-soft">
          셋을 평균 내거나 겹치는 말만 고르지 않습니다. 각 체계가 실제로 답할 수
          있는 질문에만 그 체계를 씁니다. 어떤 문장이 어디서 나왔는지는 리포트
          안에 그대로 적혀 있습니다.
        </p>
      </Reveal>
      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        {bases.map((b, i) => (
          <Reveal key={b.t} delay={i * 0.07}>
            <div className="h-full rounded-2xl border border-line bg-white/70 p-6">
              <p className="text-xs font-medium text-brass-ink">{b.role}</p>
              <h3 className="mt-1.5 font-serif text-xl font-semibold">{b.t}</h3>
              <p className="mt-3 text-[13.5px] leading-relaxed text-ink-soft">{b.d}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal delay={0.15}>
        <div className="mt-4 rounded-2xl bg-night p-6 text-paper sm:p-7">
          <p className="font-serif text-lg font-semibold text-brass-soft">
            숫자 옆에 계산 과정을 같이 띄웁니다
          </p>
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-paper/60">
            궁합 총점 76점이라고만 하면 믿을 근거가 없습니다. 별:결은 그 76점이
            일간 관계 60점, 배우자궁 89점, 기운 교환 74점, 힘의 균형 50점,
            시기 동조 65점을 합친 값이라는 것과, 각 점수가 무엇 때문에 그렇게
            나왔는지를 화면에서 펼쳐 보여 줍니다.
          </p>
        </div>
      </Reveal>
    </section>
  );
}
