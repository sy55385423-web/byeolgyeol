/** 간지(干支) 기본 상수와 관계 계산 — 지장간 · 12운성 · 합충형파해.
 *
 *  만세력(사주팔자·십신·공망·대운)은 manseryeok이 계산한다. 여기서는 그 라이브러리에
 *  없는 것만 다룬다. 전부 표로 정해져 있는 값이라 계산이 아니라 인용에 가깝고,
 *  아래 표는 자평명리 통용 기준을 따랐다.
 *
 *  ⚠️ 학파에 따라 다르게 보는 항목이 있다(특히 형·파·해, 신살 채택 여부).
 *  그런 항목은 주석에 표시해 두었고, 리포트에서 켜고 끌 수 있게 분리해 두는 편이 좋다. */

export const STEMS = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"] as const;
export const BRANCHES = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"] as const;
export const ELEMENTS = ["목", "화", "토", "금", "수"] as const;

export type ElIdx = 0 | 1 | 2 | 3 | 4;

/** 천간 오행 — 갑을(목) 병정(화) 무기(토) 경신(금) 임계(수) */
export const STEM_EL: ElIdx[] = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4];
/** 지지 오행 — 자(수) 축(토) 인묘(목) 진(토) 사오(화) 미(토) 신유(금) 술(토) 해(수) */
export const BRANCH_EL: ElIdx[] = [4, 2, 0, 0, 2, 1, 1, 2, 3, 3, 2, 4];
/** 천간 음양 — 짝수 index가 양(갑 병 무 경 임) */
export const isYangStem = (s: number) => s % 2 === 0;
/** 지지 음양 — 자 인 진 오 신 술이 양 */
export const isYangBranch = (b: number) => b % 2 === 0;

/* ───────────────────────── 지장간(支藏干) ─────────────────────────
 * 지지 속에 숨은 천간. 여기(餘氣)·중기(中氣)·정기(正氣) 순이고, 괄호 안은 절기 배분 일수다.
 * 십신·통근 판정이 이 표 위에서 이뤄지므로 사주 계산의 기초가 된다. */
export type Hidden = { stem: number; days: number; role: "여기" | "중기" | "정기" };

export const HIDDEN: Hidden[][] = [
  /* 자 */ [{ stem: 8, days: 10, role: "여기" }, { stem: 9, days: 20, role: "정기" }],
  /* 축 */ [{ stem: 9, days: 9, role: "여기" }, { stem: 7, days: 3, role: "중기" }, { stem: 5, days: 18, role: "정기" }],
  /* 인 */ [{ stem: 4, days: 7, role: "여기" }, { stem: 2, days: 7, role: "중기" }, { stem: 0, days: 16, role: "정기" }],
  /* 묘 */ [{ stem: 0, days: 10, role: "여기" }, { stem: 1, days: 20, role: "정기" }],
  /* 진 */ [{ stem: 1, days: 9, role: "여기" }, { stem: 9, days: 3, role: "중기" }, { stem: 4, days: 18, role: "정기" }],
  /* 사 */ [{ stem: 4, days: 7, role: "여기" }, { stem: 6, days: 7, role: "중기" }, { stem: 2, days: 16, role: "정기" }],
  /* 오 */ [{ stem: 2, days: 10, role: "여기" }, { stem: 5, days: 9, role: "중기" }, { stem: 3, days: 11, role: "정기" }],
  /* 미 */ [{ stem: 3, days: 9, role: "여기" }, { stem: 1, days: 3, role: "중기" }, { stem: 5, days: 18, role: "정기" }],
  /* 신 */ [{ stem: 4, days: 7, role: "여기" }, { stem: 8, days: 7, role: "중기" }, { stem: 6, days: 16, role: "정기" }],
  /* 유 */ [{ stem: 6, days: 10, role: "여기" }, { stem: 7, days: 20, role: "정기" }],
  /* 술 */ [{ stem: 7, days: 9, role: "여기" }, { stem: 3, days: 3, role: "중기" }, { stem: 4, days: 18, role: "정기" }],
  /* 해 */ [{ stem: 4, days: 7, role: "여기" }, { stem: 0, days: 7, role: "중기" }, { stem: 8, days: 16, role: "정기" }],
];

/** 정기(본기) — 지지를 대표하는 천간 */
export const mainStem = (b: number) => HIDDEN[b].find((h) => h.role === "정기")!.stem;

/* ───────────────────────── 십신(十神) ─────────────────────────
 * 일간과 다른 천간의 관계. 오행 관계(생·극·동)에 음양 같고 다름을 곱해 열 가지가 된다. */
export type TenGod =
  | "비견" | "겁재" | "식신" | "상관" | "편재" | "정재" | "편관" | "정관" | "편인" | "정인";

export function tenGod(dayStem: number, other: number): TenGod {
  const d = STEM_EL[dayStem], o = STEM_EL[other];
  const same = isYangStem(dayStem) === isYangStem(other); // 음양이 같은가
  if (o === d) return same ? "비견" : "겁재";
  if (o === (d + 1) % 5) return same ? "식신" : "상관";   // 내가 생하는 것
  if (o === (d + 2) % 5) return same ? "편재" : "정재";   // 내가 극하는 것
  if (o === (d + 3) % 5) return same ? "편관" : "정관";   // 나를 극하는 것
  return same ? "편인" : "정인";                          // 나를 생하는 것
}

/** 십신이 속한 큰 갈래 — 강약 판정에서 이 단위로 묶어 센다. */
export const godGroup = (g: TenGod) =>
  g === "비견" || g === "겁재" ? "비겁"
  : g === "식신" || g === "상관" ? "식상"
  : g === "편재" || g === "정재" ? "재성"
  : g === "편관" || g === "정관" ? "관성"
  : "인성";

/* ───────────────────────── 12운성(十二運星) ─────────────────────────
 * 일간이 각 지지에서 갖는 기세. 양간은 순행, 음간은 역행한다.
 * 장생지: 갑—해, 병무—인, 경—사, 임—신 / 을—오, 정기—유, 신—자, 계—묘 */
export const TWELVE = [
  "장생", "목욕", "관대", "건록", "제왕", "쇠", "병", "사", "묘", "절", "태", "양",
] as const;
export type TwelveStage = (typeof TWELVE)[number];

const BIRTH_BRANCH: number[] = [
  /* 갑 */ 11, /* 을 */ 6, /* 병 */ 2, /* 정 */ 9, /* 무 */ 2,
  /* 기 */ 9, /* 경 */ 5, /* 신 */ 0, /* 임 */ 8, /* 계 */ 3,
];

export function twelveStage(dayStem: number, branch: number): TwelveStage {
  const start = BIRTH_BRANCH[dayStem];
  const step = isYangStem(dayStem) ? 1 : -1;
  // start에서 step 방향으로 몇 칸 갔을 때 branch가 되는지
  const idx = (((branch - start) * step) % 12 + 12) % 12;
  return TWELVE[idx];
}

/* ───────────────────────── 합·충·형·파·해 ─────────────────────────
 * 두 글자가 만났을 때의 관계. 궁합과 시기 판단에서 실제로 쓰인다. */

/** 천간합 — 갑기합토, 을경합금, 병신합수, 정임합목, 무계합화 */
export const STEM_COMBO: Record<string, ElIdx> = {
  "0-5": 2, "1-6": 3, "2-7": 4, "3-8": 0, "4-9": 1,
};
export function stemCombo(a: number, b: number): ElIdx | null {
  const k = a < b ? `${a}-${b}` : `${b}-${a}`;
  return STEM_COMBO[k] ?? null;
}
/** 천간충 — 갑경, 을신, 병임, 정계 (무기는 충하지 않는다) */
export const stemClash = (a: number, b: number) => Math.abs(a - b) === 6 && a % 2 === b % 2;

/** 지지 육합 — 자축·인해·묘술·진유·사신·오미 */
export const branchSix = (a: number, b: number) => (a + b) % 12 === 1;
/** 지지 충 — 여섯 칸 마주 본다 */
export const branchClash = (a: number, b: number) => Math.abs(a - b) === 6;
/** 삼합 — 신자진(수)·해묘미(목)·인오술(화)·사유축(금) */
export const TRIPLE: { members: number[]; el: ElIdx }[] = [
  { members: [8, 0, 4], el: 4 },
  { members: [11, 3, 7], el: 0 },
  { members: [2, 6, 10], el: 1 },
  { members: [5, 9, 1], el: 3 },
];
/** 방합 — 인묘진(목)·사오미(화)·신유술(금)·해자축(수) */
export const DIRECTIONAL: { members: number[]; el: ElIdx }[] = [
  { members: [2, 3, 4], el: 0 },
  { members: [5, 6, 7], el: 1 },
  { members: [8, 9, 10], el: 3 },
  { members: [11, 0, 1], el: 4 },
];
/** 형(刑) — 인사신 · 축술미 삼형, 자묘 상형, 진·오·유·해 자형.
 *  ⚠️ 형은 학파별 채택 범위가 가장 크게 갈리는 항목이다. */
export const TRIPLE_PUNISH = [
  [2, 5, 8],
  [1, 10, 7],
];
export const MUTUAL_PUNISH = [0, 3]; // 자묘
export const SELF_PUNISH = [4, 6, 9, 11]; // 진 오 유 해
/** 파(破) — 자유·축진·인해·묘오·사신·술미 */
export const BREAKS: [number, number][] = [[0, 9], [1, 4], [2, 11], [3, 6], [5, 8], [10, 7]];
/** 해(害) — 자미·축오·인사·묘진·신해·유술 */
export const HARMS: [number, number][] = [[0, 7], [1, 6], [2, 5], [3, 4], [8, 11], [9, 10]];

const inPairList = (list: [number, number][], a: number, b: number) =>
  list.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
export const branchBreak = (a: number, b: number) => inPairList(BREAKS, a, b);
export const branchHarm = (a: number, b: number) => inPairList(HARMS, a, b);
