/** 시기 분석 엔진 — 대운·세운을 원국과 대조해 연도별 점수를 낸다.
 *
 *  "2028년 81점" 같은 값이 랜덤이면 아무 의미가 없다. 여기서는 아래를 실제로 계산한다.
 *
 *    세운 간지        그 해의 천간·지지 (1984년 갑자 기준 60갑자 순환)
 *    용신·기신 관계   세운의 오행이 용신이면 가점, 기신이면 감점
 *    대운 관계        지금 걷는 대운의 오행도 같은 기준으로 본다 (대운이 판을 깔고 세운이 그 위에서 움직인다)
 *    원국과의 충·합   세운 지지가 원국 지지와 충하면 흔들리고, 합하면 묶인다
 *    십신             세운 천간이 일간에게 어떤 십신인지 — 영역별(재물·직업·관계) 판단의 근거
 *
 *  점수는 절대적인 등급이 아니라 그 사람 안에서의 상대 비교로 읽어야 한다.
 *  같은 60점이라도 사람에 따라 뜻이 다르다. */

import {
  BRANCHES, STEMS, ELEMENTS, STEM_EL, BRANCH_EL,
  tenGod, godGroup, branchClash, branchSix, branchBreak, branchHarm,
  type ElIdx, type TenGod,
} from "./ganji";
import type { Analysis } from "./analyze";

/** 1984년이 갑자년(60갑자 index 0). 여기서 순환한다. */
export function yearGanji(year: number): { stem: number; branch: number; ko: string } {
  const idx = ((year - 1984) % 60 + 60) % 60;
  const stem = idx % 10;
  const branch = idx % 12;
  return { stem, branch, ko: `${STEMS[stem]}${BRANCHES[branch]}` };
}

export type YearScore = {
  year: number;
  age: number;
  ganji: string;
  stem: number;
  branch: number;
  score: number;              // 0~100
  tenGodStem: TenGod;         // 세운 천간의 십신
  group: ReturnType<typeof godGroup>;
  reasons: { text: string; delta: number }[];
  clashes: string[];          // 원국과 충하는 자리
  combos: string[];           // 원국과 합하는 자리
};

/** 한 해가 이 사람에게 어떤 해인지 계산한다. */
export function scoreYear(
  a: Analysis,
  year: number,
  birthYear: number,
  daewoonBranch?: number,
  daewoonStem?: number,
): YearScore {
  const g = yearGanji(year);
  const reasons: { text: string; delta: number }[] = [];
  let score = 50; // 평년을 50으로 두고 가감한다

  const stemEl = STEM_EL[g.stem];
  const branchEl = BRANCH_EL[g.branch];

  // ── 세운의 오행이 용신인가 기신인가 ──────────────────────────
  // "천간"은 받침이 있고 "지지"는 없다. 조사를 고정하면 "천간가"가 된다.
  const ga = (w: string) => {
    const last = w.charCodeAt(w.length - 1);
    return last >= 0xac00 && last <= 0xd7a3 && (last - 0xac00) % 28 !== 0 ? "이" : "가";
  };
  const judge = (el: ElIdx, where: string, weight: number) => {
    if (el === a.useEl) { score += weight; reasons.push({ text: `${where}${ga(where)} 용신 ${ELEMENTS[el]}`, delta: weight }); }
    else if (el === a.helpEl) { score += Math.round(weight * 0.6); reasons.push({ text: `${where}${ga(where)} 희신 ${ELEMENTS[el]}`, delta: Math.round(weight * 0.6) }); }
    else if (el === a.avoidEl) { score -= weight; reasons.push({ text: `${where}${ga(where)} 기신 ${ELEMENTS[el]}`, delta: -weight }); }
  };
  judge(stemEl, "세운 천간", 10);
  judge(branchEl, "세운 지지", 14); // 지지가 실제로 더 크게 작용한다

  // ── 대운 — 판을 깔아 주는 자리라 세운보다 비중이 크다 ────────
  if (daewoonBranch !== undefined) judge(BRANCH_EL[daewoonBranch], "대운 지지", 16);
  if (daewoonStem !== undefined) judge(STEM_EL[daewoonStem], "대운 천간", 8);

  // ── 원국과의 충·합 ────────────────────────────────────────
  const clashes: string[] = [];
  const combos: string[] = [];
  for (const [pos, pil] of Object.entries(a.pillars)) {
    if (!pil) continue;
    if (branchClash(pil.branch, g.branch)) {
      clashes.push(`${pos}지 ${BRANCHES[pil.branch]}`);
      // 일지·월지 충은 특히 크게 흔든다 (배우자궁·월령)
      const w = pos === "일" || pos === "월" ? 10 : 5;
      score -= w;
      reasons.push({ text: `${pos}지 ${BRANCHES[pil.branch]} 충`, delta: -w });
    }
    if (branchSix(pil.branch, g.branch)) {
      combos.push(`${pos}지 ${BRANCHES[pil.branch]}`);
      score += 5;
      reasons.push({ text: `${pos}지 ${BRANCHES[pil.branch]} 합`, delta: 5 });
    }
    if (branchBreak(pil.branch, g.branch) || branchHarm(pil.branch, g.branch)) {
      score -= 3;
      reasons.push({ text: `${pos}지와 파·해`, delta: -3 });
    }
  }

  const tenGodStem = tenGod(a.dayStem, g.stem);
  return {
    year,
    age: year - birthYear + 1,
    ganji: g.ko,
    stem: g.stem,
    branch: g.branch,
    score: Math.max(0, Math.min(100, Math.round(score))),
    tenGodStem,
    group: godGroup(tenGodStem),
    reasons,
    clashes,
    combos,
  };
}

/** 앞으로 N년 치를 한 번에. 대운은 나이에 맞는 구간을 찾아 넘긴다. */
export function scoreYears(
  a: Analysis,
  birthYear: number,
  from: number,
  count: number,
  luckList: { age: number; stem: number; branch: number }[],
): YearScore[] {
  const out: YearScore[] = [];
  for (let y = from; y < from + count; y++) {
    const age = y - birthYear + 1;
    let dw: { stem: number; branch: number } | undefined;
    for (let i = luckList.length - 1; i >= 0; i--) if (age >= luckList[i].age) { dw = luckList[i]; break; }
    out.push(scoreYear(a, y, birthYear, dw?.branch, dw?.stem));
  }
  return out;
}

/** 영역별 시기 — 어떤 십신이 들어오는 해인지로 나눈다.
 *  재성이 들어오면 재물·연애(남성 기준 재성=배우자), 관성이면 직업·결혼,
 *  식상이면 표현·창업, 인성이면 공부·자격, 비겁이면 사람·경쟁. */
export const DOMAIN_GROUP = {
  재물: "재성",
  직업: "관성",
  연애: "재성",
  결혼: "관성",
  공부: "인성",
  창업: "식상",
} as const;

export function bestYearsFor(scores: YearScore[], domain: keyof typeof DOMAIN_GROUP, top = 3) {
  const want = DOMAIN_GROUP[domain];
  return [...scores]
    .map((s) => ({ ...s, domainScore: s.score + (s.group === want ? 12 : 0) }))
    .sort((x, y) => y.domainScore - x.domainScore)
    .slice(0, top);
}

/* ───────────────────── 대운(大運) 점수 ─────────────────────
 *
 *  세운이 한 해의 날씨라면 대운은 10년의 기후다. "몇 살이 전성기냐"는 질문에
 *  원국만으로 답할 수 없다. 원국은 타고난 배치고, 그게 언제 열리는지는 대운이 정한다.
 *
 *  그 대운의 천간·지지가 각각
 *    용신 +3 · 희신 +2 · 기신 −3 · 기신을 생하는 오행 −1
 *  지지는 계절을 쥐고 있어 1.5배로 본다.
 *
 *  ⚠️ 유파에 따라 지지만 보기도, 천간·지지를 5년씩 나눠 보기도 한다. 여기서는
 *  10년을 한 덩어리로 두되 지지에 가중치를 준다. */

export type DecadalScore = {
  age: number;
  ko: string;
  score: number;
  /** 왜 이 점수인지 — 문장에 그대로 인용한다 */
  why: string[];
};

/** 오행 하나가 이 명식에 몇 점짜리인지. */
export function elementScore(a: Pick<Analysis, "useEl" | "helpEl" | "avoidEl">, el: number): number {
  if (el === a.useEl) return 3;
  if (el === a.helpEl) return 2;
  if (el === a.avoidEl) return -3;
  if ((el + 1) % 5 === a.avoidEl) return -1; // 기신을 생하는 오행
  return 0;
}

export function scoreDecadals(
  a: Pick<Analysis, "useEl" | "helpEl" | "avoidEl">,
  list: { age: number; stem: number; branch: number; ko: string }[],
): DecadalScore[] {
  return list.map((d) => {
    const se = STEM_EL[d.stem], be = BRANCH_EL[d.branch];
    const ss = elementScore(a, se), bs = elementScore(a, be);
    const why: string[] = [];
    // 조사는 괄호 앞 간지 이름을 따라간다 — "지지 진(토)이 희신"으로 읽는다.
    const j = (w: string) => {
      const c = w.charCodeAt(w.length - 1);
      return (c - 0xac00) % 28 !== 0 ? "이" : "가";
    };
    if (ss > 0) why.push(`천간 ${STEMS[d.stem]}(${ELEMENTS[se]})${j(STEMS[d.stem])} ${ss === 3 ? "용신" : "희신"}`);
    if (bs > 0) why.push(`지지 ${BRANCHES[d.branch]}(${ELEMENTS[be]})${j(BRANCHES[d.branch])} ${bs === 3 ? "용신" : "희신"}`);
    if (ss < 0) why.push(`천간 ${STEMS[d.stem]}(${ELEMENTS[se]})${j(STEMS[d.stem])} 부담`);
    if (bs < 0) why.push(`지지 ${BRANCHES[d.branch]}(${ELEMENTS[be]})${j(BRANCHES[d.branch])} 부담`);
    return { age: d.age, ko: d.ko, score: ss + bs * 1.5, why };
  });
}

/** 나이 구간(초년·청년·중년·말년)에 걸치는 대운들의 평균 점수. */
export function spanScore(scores: DecadalScore[], from: number, to: number): number {
  const hit = scores.filter((s) => s.age + 9 >= from && s.age <= to);
  if (!hit.length) return 0;
  return hit.reduce((sum, s) => sum + s.score, 0) / hit.length;
}
