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

import { calculateFourPillars, getLuckPillars, type Gender } from "manseryeok";
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

  // 대운 — 출생에서 다음(순행)/이전(역행) 절(節)까지의 일수로 시작 나이를 정한다.
  // 순역은 성별에 달려 있다(양남·음녀 순행 / 음남·양녀 역행). 앱이 성별을 받으므로
  // 그 값을 그대로 넘긴다. "밝히지 않음"이면 남성 기준으로 계산한다.
  let luck = { startAge: 0, forward: true, list: [] as { age: number; stem: number; branch: number; ko: string }[] };
  try {
    // 출생 절대 순간(UTC ms) — 한국 표준시(UTC+9) 기준
    const instantUTCms = Date.UTC(y, m - 1, d, (known ? hour! : 12) - 9, 0);
    const lp = getLuckPillars({
      instantUTCms,
      birthYear: y,
      monthPillar: { heavenlyStem: r.month.heavenlyStem, earthlyBranch: r.month.earthlyBranch },
      sajuYearStemIndex: si(r.year.heavenlyStem),
      gender: (isMale ? "male" : "female") as Gender,
      count: 9,
    });
    luck = {
      startAge: lp.startAge,
      forward: lp.forward,
      list: lp.pillars.map((pp) => ({
        age: pp.age,
        stem: si(pp.pillar.heavenlyStem),
        branch: bi(pp.pillar.earthlyBranch),
        ko: pp.korean,
      })),
    };
  } catch {
    // 절기 데이터 범위를 벗어나는 연도 등 — 대운이 없어도 나머지 분석은 그대로 유효하다.
  }

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
