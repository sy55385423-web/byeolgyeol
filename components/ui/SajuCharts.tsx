/** 사주 만세력 · 자미두수 명반 · 서양 점성술 3표 — 계산은 lib/saju.ts 엔진 사용 */

import { computeChart, hourBranchFromLabel, ELEMENTS, ELEMENT_COLOR, STEM_ELEMENT, BRANCH_ELEMENT } from "@/lib/saju";

export type BirthInput = {
  y: number;
  m: number;
  d: number;
  knowsTime: boolean;
  timeLabel?: string; // "자시 (23:30~01:29)" 형식
  /** 정확한 시각과 출생지 경도 — 있으면 진태양시로 보정한다 */
  hour?: number;
  minute?: number;
  lon?: number;
  gender?: "male" | "female" | "none";
};

export default function SajuCharts({ me, name }: { me: BirthInput; name?: string }) {
  // 시각을 정확히 받았으면 그 값으로 계산한다. timeLabel(시진)만 있으면 그쪽을 쓴다.
  // 여기서 다시 계산하는 이유는 이 컴포넌트가 랜딩 예시에도 쓰이기 때문이다.
  // 다만 입력은 호출부와 같은 것을 받아야 명반이 어긋나지 않는다.
  const chart = computeChart({
    y: me.y,
    m: me.m,
    d: me.d,
    hourBranch:
      me.hour !== undefined
        ? Math.floor(((me.hour + 1) % 24) / 2)
        : me.knowsTime
          ? hourBranchFromLabel(me.timeLabel)
          : undefined,
    hour: me.hour,
    minute: me.minute,
    lon: me.lon,
    gender: me.gender,
  });
  const { pillars } = chart;
  const cols = [
    { label: "연주", p: pillars.year },
    { label: "월주", p: pillars.month },
    { label: "일주", p: pillars.day },
    { label: "시주", p: pillars.hour },
  ];
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-medium text-brass">
          {name ? `${name}님의 명반` : "당신의 명반"} · 세 가지 기법으로 세웠어요
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {/* 사주 만세력 */}
        <div className="rounded-2xl border border-line bg-white p-4">
          <p className="text-[11px] font-semibold tracking-wider text-ink-faint">사주명리 · 만세력</p>
          <div className="mt-3 grid grid-cols-4 gap-1.5">
            {cols.map(({ label, p }) => {
              const stemColor = p ? ELEMENT_COLOR[STEM_ELEMENT[p.stem] as 0 | 1 | 2 | 3 | 4] : null;
              const branchColor = p ? ELEMENT_COLOR[BRANCH_ELEMENT[p.branch] as 0 | 1 | 2 | 3 | 4] : null;
              return (
                <div key={label} className="rounded-lg bg-paper-warm/70 py-2.5 text-center">
                  <p className="text-[10px] text-ink-faint">{label}</p>
                  {p && stemColor && branchColor ? (
                    <div className="mt-1.5 flex flex-col items-center gap-1">
                      <span
                        className="flex h-8 w-8 items-center justify-center rounded-lg font-serif text-lg font-bold"
                        style={{ background: stemColor.bg, color: stemColor.text }}
                      >
                        {p.hanja[0]}
                      </span>
                      <span
                        className="flex h-8 w-8 items-center justify-center rounded-lg font-serif text-lg font-bold"
                        style={{ background: branchColor.bg, color: branchColor.text }}
                      >
                        {p.hanja[1]}
                      </span>
                    </div>
                  ) : (
                    <p className="mt-1 font-serif text-lg font-semibold leading-none text-ink-faint">—</p>
                  )}
                  <p className="mt-1.5 text-[10px] text-ink-soft">{p ? p.ko : "미상"}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1">
            {(["목", "화", "토", "금", "수"] as const).map((w, i) => (
              <span key={w} className="flex items-center gap-1 text-[9.5px] text-ink-faint">
                <span className="h-2 w-2 rounded-full" style={{ background: ELEMENT_COLOR[i as 0 | 1 | 2 | 3 | 4].text }} />
                {w}
              </span>
            ))}
          </div>
          <p className="mt-2 text-[10.5px] text-ink-faint">
            {pillars.hour
              ? `일간 ${ELEMENTS[chart.dayMaster]}(${pillars.day.ko[0]}) · ${ELEMENTS[chart.dominant]} 기운이 강한 명식`
              : "태어난 시간 입력 시 시주까지 정밀해져요"}
          </p>
        </div>

        {/* 자미두수 명반 */}
        <div className="rounded-2xl border border-line bg-white p-4">
          <p className="text-[11px] font-semibold tracking-wider text-ink-faint">자미두수 · 12궁 명반</p>
          <div className="mt-3 grid grid-cols-4 gap-1">
            {chart.gongs.map((g) => (
              <div
                key={g.name}
                className={`rounded-md px-1 py-1.5 text-center ${
                  g.isMing ? "bg-night text-paper" : "bg-paper-warm/70"
                }`}
              >
                <p className={`text-[9px] ${g.isMing ? "text-brass-soft" : "text-ink-faint"}`}>
                  {g.name}
                </p>
                <p className={`text-[10.5px] font-medium ${g.isMing ? "text-paper" : "text-ink-soft"}`}>
                  {g.star}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-2.5 text-[10.5px] text-ink-faint">
            명궁에 {chart.mingStar}성이 자리했어요
          </p>
        </div>

        {/* 서양 점성술 */}
        <div className="rounded-2xl border border-line bg-white p-4">
          <p className="text-[11px] font-semibold tracking-wider text-ink-faint">서양 점성술 · 3대 지표</p>
          <div className="mt-3 space-y-1.5">
            {[
              ["태양궁", chart.sun, "타고난 본질"],
              ["달궁", chart.moon, "감정의 방식"],
              ["상승궁", chart.asc ?? "시간 입력 시 제공", "보여지는 모습"],
            ].map(([k, v, desc]) => (
              <div key={k as string} className="flex items-center justify-between rounded-lg bg-paper-warm/70 px-3 py-2">
                <div>
                  <p className="text-[10px] text-ink-faint">{k}</p>
                  <p className={`text-[13px] font-medium ${v === "시간 입력 시 제공" ? "text-ink-faint" : ""}`}>{v}</p>
                </div>
                <p className="text-[10px] text-ink-faint">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
