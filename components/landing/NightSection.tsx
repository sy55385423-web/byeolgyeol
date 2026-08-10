import { comparisons, compareRows } from "@/data/site";
import Reveal from "@/components/ui/Reveal";

/** 기존 사주 vs 별:결 비교 + Why 별:결 + 리포트 미리보기 — 밤하늘 남색 다크 섹션 */
export default function NightSection() {
  return (
    <section id="why" className="bg-night text-paper">
      <div className="mx-auto max-w-5xl px-5 py-20 sm:py-28">
        {/* 기존 사주 vs 별:결 */}
        <Reveal>
          <p className="text-sm font-medium tracking-widest text-brass-soft">WHY IT HITS</p>
          <h2 className="mt-3 font-serif text-3xl font-semibold leading-snug tracking-tight sm:text-4xl">
            사주는 많이 봤는데,
            <br />
            맞은 적이 없다면
          </h2>
          <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-paper/60">
            누구에게나 맞는 말은 누구에게도 맞지 않는 말입니다. 별:결은 같은 질문을
            자미두수·사주명리·서양점성술로 세 번 따로 계산하고, 세 결과가 겹치는
            지점만 문장으로 만듭니다. 그래서 두루뭉술할 수가 없습니다.
          </p>
        </Reveal>
        <div className="mt-10 space-y-3">
          {comparisons.map((c, i) => (
            <Reveal key={c.before} delay={i * 0.06}>
              <div className="grid gap-0 overflow-hidden rounded-xl border border-night-line sm:grid-cols-2">
                <div className="bg-night-soft/50 p-5 sm:p-6">
                  <p className="text-[11px] font-medium tracking-wider text-paper/30">
                    어디서나 듣는 말
                  </p>
                  <p className="mt-2 text-[15px] leading-relaxed text-paper/40 line-through decoration-paper/20">
                    “{c.before}”
                  </p>
                </div>
                <div className="border-t border-night-line bg-night-soft p-5 sm:border-l sm:border-t-0 sm:p-6">
                  <p className="text-[11px] font-medium tracking-wider text-brass-soft">
                    별:결의 문장
                  </p>
                  <p className="mt-2 font-serif text-[15px] leading-relaxed text-paper/90">
                    “{c.after}”
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.1}>
          <p className="mt-5 text-sm text-paper/40">
            * 별:결 문장은 일반화된 예시입니다. 당신의 문장은 생년월일을 입력한 뒤에 완성됩니다.
          </p>
        </Reveal>

        {/* 타사 비교표 */}
        <div className="mt-24">
          <Reveal>
            <h3 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
              무엇이 다른지, 표로 보여드릴게요
            </h3>
            <p className="mt-3 max-w-lg text-[14px] leading-relaxed text-paper/60">
              많은 사주 서비스가 같은 만세력 차트 하나로 해석합니다. 그래서 보는
              사람마다 말이 달라지죠. 별:결은 애초에 계산부터 세 번 합니다.
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="mt-8 overflow-hidden rounded-2xl border border-night-line">
              <div className="grid grid-cols-[1fr_1.2fr_1.5fr] border-b border-night-line bg-night-soft px-4 py-3 text-[12px] font-semibold sm:px-6">
                <span className="text-paper/50">항목</span>
                <span className="text-paper/50">다른 사주 앱</span>
                <span className="text-brass-soft">별:결</span>
              </div>
              {compareRows.map((r) => (
                <div
                  key={r.label}
                  className="grid grid-cols-[1fr_1.2fr_1.5fr] items-center gap-x-2 border-b border-night-line px-4 py-4 text-[13px] last:border-0 sm:px-6"
                >
                  <span className="font-medium text-paper/70">{r.label}</span>
                  <span className="pr-1 leading-relaxed text-paper/40">{r.others}</span>
                  <span className="leading-relaxed text-paper/90">{r.ours}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Why 별:결 */}
        <div className="mt-24 grid gap-10 sm:grid-cols-3">
          {[
            {
              t: "세 이론의 교차 검증",
              d: "자미두수·사주명리·서양점성술이 같은 방향을 가리킬 때만 확신을 담아 말합니다. 한 이론에 기대지 않습니다.",
            },
            {
              t: "당신 명반만의 해석",
              d: "같은 연도 태어난 사람도 월·일·시가 다르면 전혀 다른 결론이 나옵니다. 별:결의 모든 문장은 당신의 명식 하나하나에서 시작합니다.",
            },
            {
              t: "심리학적 언어",
              d: "겁주는 표현 대신, 실제 선택에 쓸 수 있는 문장으로 씁니다. 읽고 나서 무엇을 하면 되는지가 남습니다.",
            },
          ].map((item, i) => (
            <Reveal key={item.t} delay={i * 0.08}>
              <div className="border-t border-brass/40 pt-5">
                <h3 className="font-serif text-lg font-semibold text-brass-soft">{item.t}</h3>
                <p className="mt-3 text-sm leading-relaxed text-paper/60">{item.d}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* 리포트 미리보기 목업 */}
        <div className="mt-24 grid items-center gap-10 sm:grid-cols-[1fr_1.1fr]">
          <Reveal>
            <p className="text-sm font-medium tracking-widest text-brass-soft">REPORT</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight">
              한눈에 들어오는
              <br />
              리포트
            </h2>
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-paper/60">
              긴 풀이문 대신, 핵심 지표와 흐름 그래프로 먼저 보여드립니다.
              깊이 읽고 싶은 항목만 펼쳐 보세요.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            {/* 샘플 목업 — 실제 결과 화면 아님을 명시 */}
            <div className="rounded-2xl border border-night-line bg-night-soft p-6">
              <div className="flex items-center justify-between">
                <span className="font-serif text-sm font-semibold text-paper/80">
                  연애 궁합 총론
                </span>
                <span className="rounded-full border border-night-line px-2.5 py-0.5 text-[11px] text-paper/40">
                  샘플
                </span>
              </div>
              <div className="mt-5 flex items-end gap-3">
                <span className="font-serif text-5xl font-semibold text-brass-soft">82</span>
                <span className="pb-1.5 text-sm text-paper/50">/ 100 · 궁합 총점</span>
              </div>
              <div className="mt-5 space-y-3">
                {[
                  ["서로에 대한 호감도", 78, 88],
                  ["관계의 지속력", 84, 84],
                  ["결혼 가능성", 72, 72],
                ].map(([label, a]) => (
                  <div key={label as string}>
                    <div className="mb-1.5 flex justify-between text-xs text-paper/50">
                      <span>{label}</span>
                      <span>{a}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-night-line">
                      <div
                        className="h-full rounded-full bg-brass"
                        style={{ width: `${a}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-6 border-t border-night-line pt-4 font-serif text-sm leading-relaxed text-paper/70">
                “두 사람은 속도가 다를 뿐, 향하는 방향은 같은 궁합입니다. 다만 올해
                가을의 선택 하나가…”
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
