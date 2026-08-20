/** 월운(月運) 엔진 — "몇 년 몇 월"까지 짚는다.
 *
 *  지금까지 이 앱이 말하던 "좋은 달"은 용신 오행에 해당하는 달을 고른 것이었다.
 *  월지의 오행이 용신이면 좋은 달로 본 것인데, 그건 **매년 반복되는 달**이다.
 *  리포트에는 "5월 무렵"이라고만 나가서 읽는 사람은 올해 5월로 받아들이지만,
 *  실제로는 어느 해인지 정해지지 않은 값이었다.
 *
 *  여기서는 그해 그달의 실제 간지를 세워 점수를 낸다.
 *    월 간지    절기 기준으로 세운다(만세력). 같은 5월이라도 해마다 간지가 다르다
 *    용신·기신  월 천간·지지가 용신인가 기신인가
 *    세운       그해 자체의 점수를 바탕값으로 깐다
 *    원국 충합  월지가 원국 지지와 충하면 흔들리고 합하면 묶인다
 *
 *  이러면 "2026년 8월"처럼 연도까지 말할 수 있다.
 *
 *  ⚠️ 절기 경계는 매달 4~8일 사이에 있다. 여기서는 각 달 15일로 간지를 세우므로
 *  그 달의 절기 구간 안에 확실히 들어간다. 경계에 걸친 날짜를 따로 다루지는 않는다. */

import { calculateFourPillars } from "manseryeok";
import {
  BRANCHES, STEMS, ELEMENTS, STEM_EL, BRANCH_EL, branchClash, branchSix, type ElIdx,
} from "./ganji";
import type { Analysis } from "./analyze";

export type MonthScore = {
  year: number;
  /** 양력 월(1~12) */
  month: number;
  ganji: string;
  stem: number;
  branch: number;
  score: number;
  reasons: string[];
  clashes: string[];
};

/** 그달의 간지를 절기 기준으로 세운다.
 *  달의 간지는 사람과 무관하게 달력이 정한다 — 1998년 5월은 누구에게나 정사월이다.
 *  그래서 한 번 세우면 모든 사용자가 같이 쓴다. */
const ganjiCache = new Map<number, { stem: number; branch: number; ko: string }>();

function monthGanji(year: number, month: number) {
  const key = year * 100 + month;
  const hit = ganjiCache.get(key);
  if (hit) return hit;
  const r = calculateFourPillars({ year, month, day: 15, hour: 12, minute: 0 });
  const stem = STEMS.indexOf(r.month.heavenlyStem as (typeof STEMS)[number]);
  const branch = BRANCHES.indexOf(r.month.earthlyBranch as (typeof BRANCHES)[number]);
  const v = { stem, branch, ko: `${r.month.heavenlyStem}${r.month.earthlyBranch}` };
  if (ganjiCache.size > 3000) ganjiCache.clear();
  ganjiCache.set(key, v);
  return v;
}

/** 한 해 열두 달의 점수. baseScore는 그해 세운 점수(판을 깔아 주는 값). */
export function scoreMonths(a: Analysis, year: number, baseScore = 50): MonthScore[] {
  const out: MonthScore[] = [];
  for (let m = 1; m <= 12; m++) {
    let g;
    try {
      g = monthGanji(year, m);
    } catch {
      continue;
    }
    // 그해 세운 점수를 절반만 반영한다. 달이 해를 뒤집지는 못하지만 흐름은 탄다.
    let score = 50 + (baseScore - 50) * 0.5;
    const reasons: string[] = [];
    const clashes: string[] = [];

    const judge = (el: ElIdx, where: string, w: number) => {
      if (el === a.useEl) { score += w; reasons.push(`${where} 용신 ${ELEMENTS[el]}`); }
      else if (el === a.helpEl) { score += Math.round(w * 0.6); reasons.push(`${where} 희신 ${ELEMENTS[el]}`); }
      else if (el === a.avoidEl) { score -= w; reasons.push(`${where} 기신 ${ELEMENTS[el]}`); }
    };
    judge(STEM_EL[g.stem], "월 천간", 8);
    judge(BRANCH_EL[g.branch], "월 지지", 12);

    for (const [pos, pil] of Object.entries(a.pillars)) {
      if (!pil) continue;
      if (branchClash(pil.branch, g.branch)) {
        clashes.push(`${pos}지 ${BRANCHES[pil.branch]}`);
        const w = pos === "일" || pos === "월" ? 8 : 4;
        score -= w;
        reasons.push(`${pos}지 ${BRANCHES[pil.branch]} 충`);
      } else if (branchSix(pil.branch, g.branch)) {
        score += 4;
        reasons.push(`${pos}지 ${BRANCHES[pil.branch]} 합`);
      }
    }
    out.push({
      year, month: m, ganji: g.ko, stem: g.stem, branch: g.branch,
      score: Math.max(5, Math.min(95, Math.round(score))),
      reasons, clashes,
    });
  }
  return out;
}

/** 지금부터 앞으로 span개월. 해를 넘어가도 이어서 낸다. */
export function comingMonths(a: Analysis, span = 14, yearScore: (y: number) => number = () => 50, now = new Date()): MonthScore[] {
  const out: MonthScore[] = [];
  let y = now.getFullYear();
  let m = now.getMonth() + 1;
  const cache = new Map<number, MonthScore[]>();
  for (let i = 0; i < span; i++) {
    if (!cache.has(y)) cache.set(y, scoreMonths(a, y, yearScore(y)));
    const hit = cache.get(y)!.find((x) => x.month === m);
    if (hit) out.push(hit);
    m += 1;
    if (m > 12) { m = 1; y += 1; }
  }
  return out;
}
