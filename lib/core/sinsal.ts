/** 신살(神殺) — 특정 글자 조합에 붙는 이름표.
 *
 *  학파마다 채택 범위가 크게 갈리는 영역이라, 여기서는 현대 한국 사주에서 실제로 자주
 *  쓰이고 해석이 비교적 일관된 것만 넣었다. 각 항목에 "무엇을 보는 자리인지"를 함께 두어
 *  리포트가 이름만 나열하지 않고 뜻을 쓸 수 있게 한다.
 *
 *  ⚠️ 신살은 사주의 뼈대가 아니라 곁가지다. 강약·용신 판단을 뒤집는 근거로 쓰면 안 되고,
 *  "이런 색이 하나 얹혀 있다" 정도로 다루는 게 맞다. */

import { BRANCHES, STEMS, isYangStem } from "./ganji";

export type Sinsal = {
  name: string;
  where: ("년" | "월" | "일" | "시")[]; // 어느 기둥의 지지에 붙었는지
  meaning: string;
  tone: "길" | "흉" | "중립";
};

/** 삼합 그룹 — 도화·역마·화개는 모두 년지(또는 일지)가 속한 삼합을 기준으로 정한다. */
function tripleGroup(b: number): 0 | 1 | 2 | 3 {
  if ([8, 0, 4].includes(b)) return 0; // 신자진
  if ([11, 3, 7].includes(b)) return 1; // 해묘미
  if ([2, 6, 10].includes(b)) return 2; // 인오술
  return 3; // 사유축
}

// 삼합 그룹별 도화 / 역마 / 화개 지지
const PEACH = [9, 0, 3, 6];   // 신자진→유, 해묘미→자, 인오술→묘, 사유축→오
const HORSE = [2, 8, 5, 11];  // 신자진→인, 해묘미→사, 인오술→신, 사유축→해
const CANOPY = [4, 7, 10, 1]; // 신자진→진, 해묘미→미, 인오술→술, 사유축→축

/** 천을귀인 — 일간 기준. 사주에서 가장 강한 길신으로 친다. */
const NOBLE: Record<number, number[]> = {
  0: [1, 7], 4: [1, 7], 6: [1, 7],   // 갑무경 → 축미
  1: [0, 8], 5: [0, 8],              // 을기 → 자신
  2: [11, 9], 3: [11, 9],            // 병정 → 해유
  7: [6, 2],                         // 신 → 오인
  8: [5, 3], 9: [5, 3],              // 임계 → 사묘
};

/** 문창귀인 — 일간이 생하는 오행의 록지. 공부·표현 쪽 별로 본다. */
const ACADEMY: Record<number, number> = { 0: 5, 1: 6, 2: 8, 4: 8, 3: 9, 5: 9, 6: 11, 7: 0, 8: 2, 9: 3 };

/** 양인 — 양간에만 붙는다. 힘이 넘쳐 날이 서는 자리. */
const BLADE: Record<number, number> = { 0: 3, 2: 6, 4: 6, 6: 9, 8: 0 };

const POS = ["년", "월", "일", "시"] as const;

export function findSinsal(dayStem: number, branches: (number | null)[], yearBranch: number): Sinsal[] {
  const g = tripleGroup(yearBranch);
  const out: Sinsal[] = [];
  const at = (target: number) =>
    branches.map((b, i) => (b === target ? POS[i] : null)).filter((x): x is (typeof POS)[number] => !!x);
  const atAny = (targets: number[]) =>
    branches.map((b, i) => (b !== null && targets.includes(b) ? POS[i] : null)).filter((x): x is (typeof POS)[number] => !!x);

  const push = (name: string, where: Sinsal["where"], meaning: string, tone: Sinsal["tone"]) => {
    if (where.length) out.push({ name, where, meaning, tone });
  };

  push("도화", at(PEACH[g]), "사람을 끌어당기는 힘이 붙는 자리입니다. 인기와 매력으로 나오지만, 관계가 복잡해지는 쪽으로 흐르기도 합니다.", "중립");
  push("역마", at(HORSE[g]), "한자리에 오래 머물지 않는 자리입니다. 이동·출장·이사·해외가 잦고, 변화가 있을 때 오히려 살아납니다.", "중립");
  push("화개", at(CANOPY[g]), "혼자 파고드는 자리입니다. 종교·예술·학문 쪽으로 깊어지는 대신, 사람들 속에서 외로움을 자주 느낍니다.", "중립");
  push("천을귀인", atAny(NOBLE[dayStem] ?? []), "결정적인 순간에 도와주는 사람이 나타나는 자리입니다. 사주에서 가장 강한 길신으로 봅니다.", "길");
  push("문창귀인", at(ACADEMY[dayStem]), "머리로 푸는 일과 표현에 힘이 붙는 자리입니다. 공부·글·기획 쪽에서 값이 매겨집니다.", "길");
  if (isYangStem(dayStem)) {
    push("양인", at(BLADE[dayStem]), "힘이 넘쳐 날이 서는 자리입니다. 밀어붙이는 힘이 강한 대신, 과하면 스스로를 다치게 합니다.", "중립");
  }
  return out;
}

/** 공망 지지 두 개 — manseryeok이 계산해 주지만, 이름만 있고 뜻이 없어 여기서 붙인다. */
export function voidMeaning(voidBranches: string[], branches: (number | null)[]): Sinsal | null {
  const idx = voidBranches.map((v) => BRANCHES.indexOf(v as (typeof BRANCHES)[number])).filter((i) => i >= 0);
  const where = branches
    .map((b, i) => (b !== null && idx.includes(b) ? POS[i] : null))
    .filter((x): x is (typeof POS)[number] => !!x);
  if (!where.length) return null;
  return {
    name: "공망",
    where,
    meaning: "그 자리의 힘이 반쯤 비어 있다고 봅니다. 채우려 애쓸수록 헛돌기 쉬워서, 그 영역은 기대를 낮추고 다른 쪽에 무게를 싣는 편이 낫습니다.",
    tone: "흉",
  };
}

export const stemName = (i: number) => STEMS[i];
