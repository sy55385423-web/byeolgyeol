/** 계산 엔진 통합 진입점.
 *
 *  생년월일시 하나로 아래를 한 번에 계산해 "사실 묶음"을 만든다. 해석(문장)은 하지 않는다.
 *
 *    manseryeok  — 만세력(절기·입춘 보정), 사주팔자, 공망, 대운
 *    lib/core    — 지장간, 십신, 12운성, 합충형파해, 신살, 신강약·용신
 *    lib/timing  — 용신에서 도출한 좋은 달·조심할 달
 *
 *  자미두수(iztro)와 서양 점성술은 lib/saju.ts가 계속 담당한다. 그쪽은 이미 실계산이라
 *  건드릴 이유가 없고, 여기서는 사주 쪽 공백만 메운다. */

import { calculateFourPillars, type Gender } from "manseryeok";
import { STEMS, BRANCHES, ELEMENTS, type ElIdx } from "./ganji";
import { analyze, type Analysis, type Pillar } from "./analyze";

export type SajuInput = { y: number; m: number; d: number; hour?: number; isMale?: boolean };

export type SajuFacts = {
  /** 사람이 읽는 형태 — "무인 정사 기미 정묘" */
  pillarText: string;
  hanja: string;
  analysis: Analysis;
  /** 대운 — 시작 나이와 10년 단위 간지 */
  luck: { startAge: number; forward: boolean; list: { age: number; stem: number; branch: number; ko: string }[] };
  voidBranches: string[];
};

const si = (s: string) => STEMS.indexOf(s as (typeof STEMS)[number]);
const bi = (b: string) => BRANCHES.indexOf(b as (typeof BRANCHES)[number]);

/** 시(hour)를 모르면 정오로 근사한다. 시주가 빠지면 분석에서도 시 자리를 비운다. */
export function computeSaju(input: SajuInput): SajuFacts {
  const { y, m, d, hour, isMale = true } = input;
  const known = hour !== undefined;
  const r = calculateFourPillars({ year: y, month: m, day: d, hour: known ? hour : 12, minute: 0 });

  const pillars: { year: Pillar; month: Pillar; day: Pillar; hour: Pillar | null } = {
    year: { stem: si(r.year.heavenlyStem), branch: bi(r.year.earthlyBranch) },
    month: { stem: si(r.month.heavenlyStem), branch: bi(r.month.earthlyBranch) },
    day: { stem: si(r.day.heavenlyStem), branch: bi(r.day.earthlyBranch) },
    hour: known ? { stem: si(r.hour.heavenlyStem), branch: bi(r.hour.earthlyBranch) } : null,
  };

  const voidBranches: string[] = Array.isArray(r.voidBranches) ? (r.voidBranches as string[]) : [];
  const analysis = analyze(pillars, voidBranches);

  // 대운 — manseryeok이 절입 시각 차이로 시작 나이까지 계산해 준다.
  const lp = r.luckPillars as
    | { startAge?: number; forward?: boolean; pillars?: { age: number; korean: string; pillar: { heavenlyStem: string; earthlyBranch: string } }[] }
    | undefined;
  const luck = {
    startAge: lp?.startAge ?? 0,
    forward: lp?.forward ?? true,
    list: (lp?.pillars ?? []).map((p) => ({
      age: p.age,
      stem: si(p.pillar.heavenlyStem),
      branch: bi(p.pillar.earthlyBranch),
      ko: p.korean,
    })),
  };

  return {
    pillarText: `${r.yearString} ${r.monthString} ${r.dayString}${known ? ` ${r.hourString}` : ""}`,
    hanja: `${r.yearHanja} ${r.monthHanja} ${r.dayHanja}${known ? ` ${r.hourHanja}` : ""}`,
    analysis,
    luck,
    voidBranches,
  };
}

/** 지금 나이에 해당하는 대운 구간 */
export function currentLuck(facts: SajuFacts, birthYear: number, now = new Date()) {
  const age = now.getFullYear() - birthYear + 1;
  const list = facts.luck.list;
  for (let i = list.length - 1; i >= 0; i--) if (age >= list[i].age) return { ...list[i], age };
  return undefined;
}

export { ELEMENTS, STEMS, BRANCHES };
export type { Analysis, ElIdx, Gender };
