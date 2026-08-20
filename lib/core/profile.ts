/** 2~6층 — 원천 특성에서 능력 프로파일을 만든다.
 *
 *      명반
 *        ↓  1층 (features.ts)
 *      원천 특성 20개
 *        ↓  2층  능력마다 다른 비중으로 조합 — 잠재력(Potential)
 *        ↓  3층  발현력(Expression) · 감당력 · 구조 보정을 따로 계산
 *        ↓  4층  능력끼리의 상호작용
 *        ↓  5층  균형 보정
 *      종합 원점수
 *        ↓  6층  표준화 → 백분위
 *      종합 점수 · 상위 %
 *
 *  핵심은 세 가지다.
 *
 *  1) 능력을 십신 하나에 대응시키지 않는다. 신뢰감을 "관성이 높으면 높다"로
 *     보면 관살에 눌린 사람도 신뢰감이 높게 나온다. 책임성·일관성·약속이행·
 *     안정성·관계지속성을 따로 재서 합친다.
 *
 *  2) 잠재력과 발현력을 나눈다. 능력이 명반에 있는 것과 그걸 실제로 안정되게
 *     쓰는 것은 다르다. 감당력은 가산점이 아니라 발현 효율로 쓴다 —
 *     효율 = 0.6 + 0.4 × 감당력/100. 잠재 90에 감당 50이면 90×0.8 = 72다.
 *
 *  3) 종합 점수와 백분위는 다른 값이다. 72점은 이 사람의 프로파일 점수고,
 *     상위 30%는 모집단 안에서의 위치다. 둘을 같은 숫자로 쓰면 안 된다.
 *
 *  ⚠️ 백분위 기준분포는 지금 이론값(모의 명반 표본)이다. 실제 사용자 데이터가
 *  쌓이면 그쪽으로 갈아 끼운다(Theory Mode → Empirical Mode). */

import type { Analysis } from "./analyze";
import { extractFeatures, FEATURE_SOURCE, type Features, type FeatureKey } from "./features";

export type AbilitySet = "love" | "career" | "wealth";

/** 능력 하나 = 원천 특성들의 가중 조합. 비중의 합은 1. */
type Recipe = { label: string; potential: Partial<Record<FeatureKey, number>>; channel: FeatureKey[] };

/** 2층 — 능력 정의.
 *  channel은 그 능력이 밖으로 나오는 통로다. 발현력을 잴 때 쓴다. */
const RECIPES: Record<AbilitySet, Recipe[]> = {
  love: [
    { label: "사교성", potential: { 표현성: 0.3, 대인접근성: 0.25, 자기주도: 0.2, 관계확장: 0.15, 정서개방: 0.1 }, channel: ["표현성", "통로개방"] },
    { label: "감정표현", potential: { 표현성: 0.4, 정서개방: 0.3, 대인접근성: 0.15, 외부의존도: 0.15 }, channel: ["표현성", "통로개방"] },
    { label: "독립성", potential: { 자기주도: 0.35, 의사결정력: 0.3, 외부의존도: -0.2, 감당력: 0.15 }, channel: ["자기주도", "의사결정력"] },
    { label: "신뢰감", potential: { 책임성: 0.25, 일관성: 0.25, 약속이행: 0.2, 안정성: 0.15, 관계지속성: 0.15 }, channel: ["일관성", "안정성"] },
    { label: "책임감", potential: { 책임성: 0.3, 현실감각: 0.2, 실행력: 0.2, 자기통제: 0.15, 지속성: 0.15 }, channel: ["자기통제", "지속성"] },
  ],
  career: [
    { label: "리더십", potential: { 자기주도: 0.3, 의사결정력: 0.3, 책임성: 0.25, 대인접근성: 0.15 }, channel: ["의사결정력", "통로개방"] },
    { label: "전문성", potential: { 안정성: 0.3, 지속성: 0.3, 자기통제: 0.2, 균형도: 0.2 }, channel: ["지속성", "구조안정"] },
    { label: "적응력", potential: { 표현성: 0.3, 관계확장: 0.3, 정서개방: 0.2, 균형도: 0.2 }, channel: ["표현성", "통로개방"] },
    { label: "협업력", potential: { 일관성: 0.3, 안정성: 0.25, 대인접근성: 0.25, 외부의존도: 0.2 }, channel: ["일관성", "안정성"] },
    { label: "실행력", potential: { 실행력: 0.35, 현실감각: 0.25, 의사결정력: 0.2, 지속성: 0.2 }, channel: ["실행력", "현실감각"] },
  ],
  wealth: [
    { label: "저축력", potential: { 일관성: 0.3, 지속성: 0.3, 자기통제: 0.25, 안정성: 0.15 }, channel: ["자기통제", "지속성"] },
    { label: "투자 감각", potential: { 현실감각: 0.35, 실행력: 0.25, 의사결정력: 0.25, 표현성: 0.15 }, channel: ["실행력", "현실감각"] },
    { label: "소비 관리", potential: { 자기통제: 0.35, 일관성: 0.3, 대인접근성: -0.2, 균형도: 0.15 }, channel: ["자기통제", "구조안정"] },
    { label: "수입 다각화", potential: { 표현성: 0.3, 관계확장: 0.3, 현실감각: 0.25, 관계지속성: 0.15 }, channel: ["표현성", "통로개방"] },
    { label: "재물 그릇", potential: { 현실감각: 0.3, 감당력: 0.3, 구조안정: 0.2, 실행력: 0.2 }, channel: ["현실감각", "구조안정"] },
  ],
};

export type AbilityScore = {
  label: string;
  /** 명반에 그 능력의 재료가 얼마나 있는가 */
  potential: number;
  /** 그 재료가 실제로 밖으로 나올 수 있는가 */
  expression: number;
  /** 최종 항목 점수 (0~100) */
  score: number;
  /** 어느 특성이 이 점수를 가장 크게 만들었는지 — 화면에 근거로 쓴다 */
  basis: string;
  /** 순위로 옮기기 전의 원점수 */
  rawScore?: number;
};

export type Profile = {
  features: Features;
  abilities: AbilityScore[];
  /** 다섯 능력을 합치고 상호작용·균형을 보정한 종합 원점수 */
  compositeRaw: number;
  /** 0~100으로 표준화한 종합 점수. 백분위와 다른 값이다. */
  composite: number;
  /** 모집단 안에서 상위 몇 %인가 */
  percentile: number;
};

/** 발현 효율 — 감당력이 낮으면 잠재력이 다 나오지 못한다.
 *  가산점으로 쓰면 "잠재 90 + 감당 50 = 140" 같은 무의미한 값이 된다.
 *
 *  0.6 + 0.4×감당력 으로 시작했는데, 실제로 재 보니 효과가 상쇄됐다.
 *  식상이 많아서 신약해진 사람은 통로(식상)가 두꺼우므로, 감당 손실을
 *  통로 두께가 그대로 메워 버린다. 명리에서 설기태과는 "표현할 거리는
 *  많은데 감당이 안 돼 오히려 위축된다"는 것이니 이건 원리와 반대다.
 *  0.35~1.15로 폭을 넓혀 감당이 실제로 결과를 가르게 한다. */
const efficiency = (capacity: number) => 0.35 + 0.8 * (capacity / 100);

function abilityScore(f: Features, r: Recipe): AbilityScore {
  // 2층 — 잠재력
  let potential = 0;
  const parts: { k: FeatureKey; v: number }[] = [];
  for (const [k, w] of Object.entries(r.potential) as [FeatureKey, number][]) {
    // 음수 비중은 "적을수록 좋은" 특성이다(외부의존도 등). 뒤집어서 더한다.
    const v = w < 0 ? (100 - f[k]) * -w : f[k] * w;
    potential += v;
    parts.push({ k, v });
  }
  potential = Math.max(0, Math.min(100, potential));

  // 3층 — 발현력: 통로가 열려 있는가 × 감당 효율
  const channel = r.channel.reduce((s, k) => s + f[k], 0) / r.channel.length;
  const expression = Math.max(0, Math.min(100, channel * efficiency(f.감당력)));

  // 항목 점수 — 잠재 0.45 · 발현 0.25 · 감당 0.15 · 구조 0.15
  const score = Math.round(
    potential * 0.45 + expression * 0.25 + f.감당력 * 0.15 + f.구조안정 * 0.15,
  );

  const top = parts.sort((a, b) => b.v - a.v).slice(0, 2);
  const basis = top.map((p) => `${p.k}(${FEATURE_SOURCE[p.k]})`).join(" · ");
  return { label: r.label, potential: Math.round(potential), expression: Math.round(expression), score, basis };
}

/** 4층 — 능력끼리의 상호작용.
 *  다섯 능력은 서로 독립이 아니다. 사교성이 높아도 감정표현이 낮으면
 *  "사람은 잘 만나는데 속을 안 보이는" 쪽이 되고, 책임감이 높은데 독립성이
 *  낮으면 "조직 안에서 움직이는" 쪽이 된다. 그 조합을 점수에 반영한다. */
function interaction(ab: AbilityScore[]): number {
  const v = Object.fromEntries(ab.map((a) => [a.label, a.score])) as Record<string, number>;
  const g = (k: string) => v[k] ?? 55;
  let n = 0;
  // 사교성과 감정표현이 함께 높으면 실제로 관계가 열린다
  n += Math.max(0, Math.min(g("사교성"), g("감정표현")) - 60) * 0.12;
  // 사교성은 높은데 감정표현이 낮으면 겉돌기 쉽다
  n -= Math.max(0, g("사교성") - g("감정표현") - 20) * 0.08;
  // 책임감과 신뢰감이 함께 높으면 서로를 받쳐 준다
  n += Math.max(0, Math.min(g("책임감"), g("신뢰감")) - 60) * 0.1;
  // 독립성이 지나치게 높고 신뢰감이 낮으면 관계가 오래 못 간다
  n -= Math.max(0, g("독립성") - g("신뢰감") - 25) * 0.07;
  // 커리어·재물 쪽 조합
  n += Math.max(0, Math.min(g("실행력"), g("의사결정력") || g("리더십")) - 60) * 0.08;
  n += Math.max(0, Math.min(g("저축력"), g("소비 관리")) - 60) * 0.1;
  return n;
}

/** 5층 — 균형 보정. 한쪽으로 쏠린 프로파일은 종합에서 조금 깎는다.
 *  다섯 자리가 고른 사람이 실제로 더 넓게 쓴다고 보기 때문이다. */
function balancePenalty(ab: AbilityScore[]): number {
  const xs = ab.map((a) => a.score);
  const m = xs.reduce((s, v) => s + v, 0) / xs.length;
  const sd = Math.sqrt(xs.reduce((s, v) => s + (v - m) ** 2, 0) / xs.length);
  return Math.min(8, Math.max(0, (sd - 8) * 0.35));
}

/** 6층 — 표준화·백분위에 쓰는 기준분포.
 *
 *  종합 원점수는 40~55 언저리에 뭉친다(항목 점수가 그 부근이니 평균도 그렇다).
 *  그대로 화면에 올리면 누구나 "45점"이 되어 아무 정보가 안 된다. 그래서
 *  모집단 안에서의 위치로 두 값을 만든다.
 *
 *    종합 점수  평균 50 · 표준편차 14인 눈금으로 옮긴 표준 점수.
 *               분포의 모양이 남아서, 평범한 사람끼리는 붙고 극단은 벌어진다.
 *    백분위     같은 원점수를 순위로 본 값.
 *
 *  둘은 같이 움직이지만 다른 값이다. "72점 / 상위 30%"에서 72는 점수고
 *  30%는 순위다.
 *
 *  ⚠️ 지금 숫자는 모의 명반 500개로 잰 이론값이다. 실제 사용자 데이터가 쌓이면
 *  scripts/calibrate-profile.mjs로 다시 재서 갈아 끼운다(Theory → Empirical). */
export type Norm = { mean: number; sd: number; deciles: number[] };

export const COMPOSITE_NORM: Record<AbilitySet, Norm> = {
  love: { mean: 44.6, sd: 5.7, deciles: [37.1, 39.6, 42.2, 43.5, 44.8, 46.2, 47.7, 49.4, 51.9] },
  career: { mean: 43.3, sd: 5.3, deciles: [36.3, 39.1, 40.9, 42.2, 43.7, 44.7, 46.4, 47.8, 50] },
  wealth: { mean: 45.1, sd: 6.5, deciles: [36.5, 39.4, 41.6, 43.4, 45.3, 47.3, 49, 51.3, 53.9] },
};







/** 항목별 기준분포 — 다섯 능력도 같은 방식으로 순위를 매긴다. */
export const ABILITY_DECILES: Record<AbilitySet, number[][]> = {
  love: [[33, 36, 38, 40, 42, 43, 46, 48, 50], [32, 36, 39, 42, 44, 46, 49, 52, 55], [27, 32, 36, 40, 42, 46, 49, 53, 58], [33, 36, 39, 41, 43, 46, 48, 51, 54], [35, 38, 40, 42, 45, 47, 48, 50, 53]],
  career: [[33, 36, 39, 41, 43, 45, 48, 51, 55], [38, 42, 45, 47, 49, 51, 52, 56, 58], [33, 37, 40, 43, 45, 47, 49, 51, 53], [32, 35, 38, 41, 43, 45, 48, 50, 53], [32, 35, 39, 42, 44, 46, 48, 51, 54]],
  wealth: [[34, 37, 40, 43, 44, 47, 50, 53, 56], [31, 35, 38, 41, 43, 45, 47, 49, 52], [36, 40, 42, 46, 48, 51, 53, 56, 59], [34, 38, 40, 42, 44, 46, 47, 49, 52], [33, 38, 42, 45, 47, 50, 52, 55, 58]],
};




/** 원점수 → 순위(0~1). 기준분포가 비었으면 가운데로 둔다. */
export function rankOf(raw: number, deciles: number[]): number {
  if (!deciles.length) return 0.5;
  let below = 0;
  for (const b of deciles) if (raw >= b) below++;
  return (below + 0.5) / (deciles.length + 1);
}

export function buildProfile(a: Analysis, set: AbilitySet): Profile {
  const features = extractFeatures(a);
  const raw = RECIPES[set].map((r) => abilityScore(features, r));
  // 항목도 모집단 순위로 옮긴다. 50~94 눈금.
  const abilities = raw.map((x, i) => ({
    ...x,
    score: Math.round(47.6 + rankOf(x.score, ABILITY_DECILES[set][i] ?? []) * 48.9),
    rawScore: x.score,
  }));

  const base = raw.reduce((s, x) => s + x.score, 0) / raw.length; // 가중치는 균등 20%
  const compositeRaw = base + interaction(abilities) - balancePenalty(abilities);

  const n = COMPOSITE_NORM[set];
  const z = n.sd > 0 ? (compositeRaw - n.mean) / n.sd : 0;
  const pct = rankOf(compositeRaw, n.deciles);

  return {
    features,
    abilities,
    compositeRaw: Math.round(compositeRaw * 10) / 10,
    composite: Math.round(Math.max(25, Math.min(98, 50 + z * 14))),
    percentile: Math.max(2, Math.min(97, Math.round(100 - pct * 100))),
  };
}
