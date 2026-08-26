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
            누구에게나 맞는 말은 누구에게도 맞지 않는 말입니다. 두루뭉술한 문장은
            대개 명식을 안 보고 썼기 때문에 나옵니다. 별:결의 문장은 규칙 183개가
            각자 명식의 특정 조건을 확인한 뒤에야 나가고, 조건에 안 걸리면 그
            문장은 아예 실리지 않습니다. 분량을 채우려고 넣는 말이 없습니다.
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
              사주 서비스 대부분이 만세력 차트 하나를 세워 놓고 사람이 읽습니다.
              그래서 같은 명식을 봐도 보는 사람마다 말이 달라집니다. 별:결은
              읽는 자리까지 계산으로 정해 두었습니다.
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
              t: "근거를 같이 보여 줍니다",
              d: "점수만 던지지 않습니다. 그 점수가 어느 항목 몇 점을 합친 값인지, 각 항목이 무엇 때문에 그렇게 나왔는지를 화면에서 펼쳐 볼 수 있습니다.",
            },
            {
              t: "시기를 연도와 달로 답합니다",
              d: "\"올해 하반기\"가 아니라 대운·세운·월운을 짚어 \"2027년 8월\"이라고 답합니다. 그 달이 왜 그 달인지도 간지로 적습니다.",
            },
            {
              t: "다시 열어도 같은 답입니다",
              d: "그때그때 지어내는 글이 아니라 명반에서 계산해 만드는 결과라, 저장해 둔 링크를 몇 달 뒤에 열어도 문장이 그대로입니다.",
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
              핵심 수치를 먼저 보여 주고, 그 밑에 계산 근거를 펼칠 수 있게 둡니다.
              긴 풀이는 궁금한 항목만 열어서 읽으세요.
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
                <span className="font-serif text-5xl font-semibold text-brass-soft">76</span>
                <span className="pb-1.5 text-sm text-paper/50">/ 100 · 궁합 총점</span>
              </div>
              <div className="mt-5 space-y-3">
                {[
                  ["일간 관계", 60],
                  ["배우자궁", 89],
                  ["기운 교환", 74],
                  ["힘의 균형", 50],
                ].map(([label, a]) => (
                  <div key={label as string}>
                    <div className="mb-1.5 flex justify-between text-xs text-paper/50">
                      <span>{label}</span>
                      <span>{a}점</span>
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
              <p className="mt-6 border-t border-night-line pt-4 text-[12px] leading-relaxed text-paper/50">
                배우자궁 89점 — 배우자 자리끼리 직접 합충 없음 · 상대 일지가 중립<br />
                힘의 균형 50점 — 강약 81점 대 37점 · 상보 2.6
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
