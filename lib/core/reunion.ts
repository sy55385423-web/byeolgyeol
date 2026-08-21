/** 재회 시기 엔진 — 헤어진 시점을 기준으로 잰다.
 *
 *  예전에는 마음 정리·연락 타이밍·재회 시기를 전부 오늘 기준으로 냈다. 그러면
 *  10년 전에 헤어진 사람과 지난달에 헤어진 사람에게 같은 답이 나간다. 이별은
 *  사건이고, 그 뒤로 얼마나 지났느냐가 답을 완전히 바꾼다.
 *
 *  명리에서 이별 뒤의 회복을 보는 자리
 *    용신 달   기운이 돌아오는 달. 여기서 마음이 실제로 가라앉는다
 *    기신 달   미련이 다시 올라오는 달. 이 구간에 연락하면 대개 후회한다
 *    일지 합   배우자궁이 묶이는 시기. 다시 이어질 자리
 *    일지 충   배우자궁이 흔들리는 시기. 관계의 형태가 바뀐다
 *
 *  회복에 걸리는 기간은 명식마다 다르다.
 *    인성이 두꺼우면   품고 곱씹는 쪽이라 오래 걸린다
 *    식상이 두꺼우면   밖으로 털어내는 쪽이라 빠르다
 *    일지가 충이면     끊는 힘이 있어 빠르다
 *    신약하면          회복에 시간이 더 든다 */

import { comingMonths, scoreMonths, type MonthScore } from "./month";
import { branchSix, branchClash, TRIPLE } from "./ganji";
import type { Analysis } from "./analyze";

export type ReunionTiming = {
  /** 헤어진 뒤 몇 달이 지났는가 */
  monthsSince: number;
  /** 마음이 실제로 가라앉는 시점 */
  settle: MonthScore;
  /** 이미 지나온 시점인가 */
  settlePassed: boolean;
  /** 연락하기 나은 달 — 반드시 오늘 이후 */
  contact?: MonthScore;
  /** 다시 이어질 자리가 열리는 달 — 반드시 오늘 이후 */
  reunion?: MonthScore;
  /** 새 인연이 들어오는 달 — 마음이 정리된 뒤라야 눈에 들어온다 */
  newLove?: MonthScore;
  /** 회복에 걸리는 것으로 본 개월 수 */
  healMonths: number;
};

const idx = (y: number, m: number) => y * 12 + (m - 1);

/** 이 명식이 이별에서 회복하는 데 걸리는 기간(개월). */
function healingSpan(a: Analysis): number {
  const g = a.groupWeight;
  let n = 9;
  n += g.인성 * 2.2;          // 품고 곱씹는다
  n -= g.식상 * 1.6;          // 밖으로 털어낸다
  n += (60 - a.strengthScore) / 12; // 신약하면 회복이 더디다
  const day = a.pillars.일!.branch;
  if (a.relations.some((r) => r.kind === "충" && r.between.includes("일"))) n -= 3; // 끊는 힘
  if (a.relations.some((r) => r.kind === "육합" && r.between.includes("일"))) n += 3; // 붙드는 힘
  void day;
  return Math.max(3, Math.min(30, Math.round(n)));
}

export function reunionTiming(
  a: Analysis,
  breakup: { y: number; m: number },
  yearScore: (y: number) => number,
  now = new Date(),
): ReunionTiming {
  const nowIdx = idx(now.getFullYear(), now.getMonth() + 1);
  const buIdx = idx(breakup.y, breakup.m);
  const monthsSince = Math.max(0, nowIdx - buIdx);
  const healMonths = healingSpan(a);
  const day = a.pillars.일!.branch;

  // 이별한 달부터 오늘 이후 2년까지 훑는다. 정리 시점은 과거일 수 있으니
  // 오늘이 아니라 이별한 달부터 봐야 하고, 연락·재회는 앞으로를 답해야 하니
  // 오래전에 헤어진 경우에도 오늘 이후 구간이 창 안에 들어와야 한다.
  const lastYear = Math.max(breakup.y + 3, now.getFullYear() + 2);
  const months: MonthScore[] = [];
  for (let y = breakup.y; y <= lastYear; y++) {
    for (const m of scoreMonths(a, y, yearScore(y))) {
      if (idx(m.year, m.month) >= buIdx) months.push(m);
    }
  }
  months.sort((x, y2) => idx(x.year, x.month) - idx(y2.year, y2.month));

  // 마음이 가라앉는 시점 — 회복 기간이 지난 뒤 처음 오는 좋은 달.
  // 명리로는 용신이 드는 달에 기운이 돌아온다고 본다.
  const after = months.filter((m) => idx(m.year, m.month) >= buIdx + healMonths);
  const settle = after.find((m) => m.score >= 55) ?? after[0] ?? months[months.length - 1];

  // 연락·재회는 두 가지를 동시에 만족해야 한다.
  //   ① 오늘 이후일 것 — 지나간 달을 알려 줘야 소용이 없다
  //   ② 회복 구간을 지났을 것 — 마음이 아직 안 가라앉았는데 연락하면 대개 후회한다
  // 오래전에 헤어진 사람은 ②가 이미 지났으니 사실상 ①만 걸린다.
  const gate = Math.max(nowIdx, buIdx + healMonths - 1);
  const ahead = months.filter((m) => idx(m.year, m.month) > gate);
  const contact = ahead.find((m) => m.score >= 58) ?? ahead.find((m) => m.score >= 52) ?? ahead[0];
  const reunion =
    ahead.find((m) => branchSix(day, m.branch) && m.score >= 50) ??
    ahead.find((m) => TRIPLE.some((t) => t.members.includes(day) && t.members.includes(m.branch)) && m.score >= 52) ??
    ahead.slice().sort((x, y2) => y2.score - x.score)[0];

  // 새 인연은 마음이 정리된 다음이라야 실제로 눈에 들어온다. 정리 시점과 오늘 중
  // 늦은 쪽을 지나고, 도화(자·묘·오·유)가 드는 달을 짚는다.
  const settleIdx = idx(settle.year, settle.month);
  const openFrom = months.filter((m) => idx(m.year, m.month) > Math.max(nowIdx, settleIdx));
  const newLove =
    openFrom.find((m) => [0, 3, 6, 9].includes(m.branch) && m.score >= 50) ??
    openFrom.find((m) => [0, 3, 6, 9].includes(m.branch)) ??
    openFrom.slice().sort((x, y2) => y2.score - x.score)[0];

  return {
    monthsSince,
    settle,
    newLove,
    settlePassed: idx(settle.year, settle.month) <= nowIdx,
    contact,
    reunion,
    healMonths,
  };
}

/** 오늘 이후만 보는 기본값 — 이별 시기를 모를 때 쓴다. */
export function reunionTimingFallback(
  a: Analysis,
  yearScore: (y: number) => number,
  now = new Date(),
): Pick<ReunionTiming, "contact" | "reunion" | "newLove" | "healMonths"> {
  const ms = comingMonths(a, 24, yearScore, now);
  const day = a.pillars.일!.branch;
  return {
    healMonths: healingSpan(a),
    newLove: ms.find((m) => [0, 3, 6, 9].includes(m.branch)) ?? ms[0],
    contact: ms.find((m) => m.score >= 58) ?? ms[0],
    reunion: ms.find((m) => branchSix(day, m.branch)) ?? ms.slice().sort((x, y) => y.score - x.score)[0],
  };
}

void branchClash;
