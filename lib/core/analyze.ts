/** 명식 분석 엔진 — 계산된 사주에서 "해석의 재료가 되는 사실"을 뽑아낸다.
 *
 *  이 파일은 문장을 만들지 않는다. 문장은 리포트 쪽에서 여기 나온 사실을 읽고 쓴다.
 *  계산과 해석을 분리해 두면, 해석 문구를 바꿔도 판단이 흔들리지 않고 판단을 고쳐도
 *  문구를 다시 쓸 필요가 없다.
 *
 *  판단 순서는 실제 상담과 같다.
 *   1) 여덟 글자를 십신으로 환산하고, 지장간까지 펼쳐 무게를 잰다.
 *   2) 월령을 얻었는지(득령), 일지에 뿌리가 있는지(득지), 천간에 같은 편이 있는지(득세)를 본다.
 *   3) 셋을 합쳐 신강·신약을 판정한다.
 *   4) 억부(모자란 쪽을 채우고 넘치는 쪽을 덜어냄)로 용신·기신을 정한다.
 *   5) 지지끼리의 합충형파해, 12운성, 신살을 모은다.
 *
 *  ⚠️ 한계: 조후(계절 온도로 용신을 잡는 방식)와 격국은 아직 넣지 않았다. 용신은 억부
 *  기준 단일 후보만 낸다. 실제로는 유파에 따라 다른 답이 나올 수 있어, 확정이 아니라
 *  "근거를 붙인 후보"로 다루는 게 맞다. */

import {
  BRANCHES, STEMS, ELEMENTS, STEM_EL, BRANCH_EL, HIDDEN, mainStem, tenGod, godGroup,
  twelveStage, stemCombo, stemClash, branchSix, branchClash, branchBreak, branchHarm,
  TRIPLE, DIRECTIONAL, TRIPLE_PUNISH, MUTUAL_PUNISH, SELF_PUNISH,
  type ElIdx, type TenGod, type TwelveStage,
} from "./ganji";
import { findSinsal, voidMeaning, type Sinsal } from "./sinsal";

export type PillarPos = "년" | "월" | "일" | "시";
export type Pillar = { stem: number; branch: number };

export type Relation = {
  kind: "천간합" | "천간충" | "육합" | "삼합" | "방합" | "충" | "형" | "파" | "해";
  between: [PillarPos, PillarPos];
  chars: string;
  el?: ElIdx;     // 합으로 만들어지는 오행
  note: string;
};

export type Analysis = {
  pillars: Record<PillarPos, Pillar | null>;
  dayStem: number;
  dayEl: ElIdx;

  /** 십신 — 천간과 지지(정기 기준) 각각 */
  tenGods: { pos: PillarPos; stem: TenGod | "일간"; branch: TenGod }[];
  /** 십신 갈래별 무게. 지장간까지 펼쳐 일수 비중으로 계산한다. */
  groupWeight: Record<"비겁" | "식상" | "재성" | "관성" | "인성", number>;
  elementWeight: number[]; // 오행별 무게

  득령: boolean;  // 월지가 일간을 돕는가
  득지: boolean;  // 일지가 일간을 돕는가
  득세: boolean;  // 천간에 같은 편이 있는가
  strong: boolean;
  strengthScore: number; // 0~100, 50이 균형

  useEl: ElIdx;    // 용신
  helpEl: ElIdx;   // 희신 — 용신을 생해 주는 오행
  avoidEl: ElIdx;  // 기신
  useReason: string[];

  twelve: { pos: PillarPos; stage: TwelveStage }[];
  relations: Relation[];
  sinsal: Sinsal[];

  /** 없는 오행 / 가장 두꺼운 오행 */
  missing: ElIdx[];
  dominant: ElIdx;

  /** 격국(格局) — 월지가 일간에게 어떤 십신인지로 정한다.
   *  월령은 사주에서 가장 무거운 자리라, 그 자리의 성격이 곧 이 사람이 사는 방식이 된다.
   *  ⚠️ 유파에 따라 투출·변격까지 따져 다르게 잡기도 한다. 여기서는 월지 정기 기준의
   *  기본격만 낸다(내격 10종). 외격·특수격은 다루지 않는다. */
  gyeok: { name: string; god: TenGod; note: string };
};

const POS: PillarPos[] = ["년", "월", "일", "시"];

export function analyze(
  pillars: { year: Pillar; month: Pillar; day: Pillar; hour: Pillar | null },
  voidBranches: string[] = [],
): Analysis {
  const P: Record<PillarPos, Pillar | null> = {
    년: pillars.year, 월: pillars.month, 일: pillars.day, 시: pillars.hour,
  };
  const dayStem = pillars.day.stem;
  const dayEl = STEM_EL[dayStem];

  // ── 1) 십신 ────────────────────────────────────────────────
  const tenGods = POS.filter((p) => P[p]).map((p) => ({
    pos: p,
    stem: p === "일" ? ("일간" as const) : tenGod(dayStem, P[p]!.stem),
    branch: tenGod(dayStem, mainStem(P[p]!.branch)),
  }));

  // ── 2) 무게 재기 ───────────────────────────────────────────
  // 천간은 1점. 지지는 지장간을 일수 비중으로 나눠 합계 1점이 되게 흩는다.
  // 월지는 계절을 쥐고 있어 두 배로 본다(월령의 비중).
  const elementWeight = [0, 0, 0, 0, 0];
  const groupWeight = { 비겁: 0, 식상: 0, 재성: 0, 관성: 0, 인성: 0 };
  const add = (stem: number, w: number) => {
    elementWeight[STEM_EL[stem]] += w;
    if (stem !== dayStem || w !== 1) groupWeight[godGroup(tenGod(dayStem, stem))] += w;
  };
  for (const p of POS) {
    const pil = P[p];
    if (!pil) continue;
    // 일간 자신은 무게에 넣지 않는다(자기 자신을 자기 편으로 세면 항상 신강이 된다).
    if (p !== "일") add(pil.stem, 1);
    else elementWeight[STEM_EL[pil.stem]] += 1;
    const mul = p === "월" ? 2 : 1;
    const total = HIDDEN[pil.branch].reduce((a, h) => a + h.days, 0);
    for (const h of HIDDEN[pil.branch]) add(h.stem, (h.days / total) * mul);
  }

  // ── 3) 득령·득지·득세 ──────────────────────────────────────
  const helps = (el: ElIdx) => el === dayEl || el === ((dayEl + 4) % 5); // 비겁 또는 인성
  const 득령 = helps(BRANCH_EL[pillars.month.branch]);
  const 득지 = helps(BRANCH_EL[pillars.day.branch]);
  const 득세 = POS.filter((p) => p !== "일" && P[p]).some((p) => helps(STEM_EL[P[p]!.stem]));

  const support = groupWeight.비겁 + groupWeight.인성;
  const drain = groupWeight.식상 + groupWeight.재성 + groupWeight.관성;
  // 세 조건은 강약 판정에서 각각 큰 비중을 갖는다. 월령이 가장 무겁다.
  const bonus = (득령 ? 1.5 : 0) + (득지 ? 0.8 : 0) + (득세 ? 0.5 : 0);
  const total = support + drain + bonus || 1;
  const strengthScore = Math.round(((support + bonus) / total) * 100);
  const strong = strengthScore >= 50;

  // ── 4) 억부 용신 ───────────────────────────────────────────
  const G = {
    비겁: dayEl,
    인성: ((dayEl + 4) % 5) as ElIdx,
    식상: ((dayEl + 1) % 5) as ElIdx,
    재성: ((dayEl + 2) % 5) as ElIdx,
    관성: ((dayEl + 3) % 5) as ElIdx,
  };
  const useReason: string[] = [];
  let useEl: ElIdx;
  let avoidEl: ElIdx;
  if (!strong) {
    // 약하면 채운다. 인성이 이미 두꺼우면 같은 편인 비겁으로 옮긴다.
    if (groupWeight.인성 >= 2.5) {
      useEl = G.비겁;
      useReason.push(`받쳐 주는 인성(${ELEMENTS[G.인성]})은 이미 두꺼워서, 같은 편인 비겁(${ELEMENTS[G.비겁]})으로 힘을 보태는 쪽이 낫습니다`);
    } else {
      useEl = G.인성;
      useReason.push(`일간을 생해 주는 인성(${ELEMENTS[G.인성]})이 부족해, 이 기운이 들어올 때 힘이 붙습니다`);
    }
    // 가장 무거운 부담 쪽을 기신으로 본다.
    const worst = (["관성", "재성", "식상"] as const).reduce((a, b) => (groupWeight[a] >= groupWeight[b] ? a : b));
    avoidEl = G[worst];
    useReason.push(`반대로 ${worst}(${ELEMENTS[G[worst]]})이 가장 무겁게 눌러서, 그 기운이 강해질 때 부담이 커집니다`);
  } else {
    // 강하면 덜어낸다. 식상이 없으면 재성으로 흘리고, 그것도 없으면 관성으로 누른다.
    if (groupWeight.식상 >= 0.5) {
      useEl = G.식상;
      useReason.push(`일간이 힘을 얻은 편이라, 쌓인 기운을 밖으로 흘려 주는 식상(${ELEMENTS[G.식상]})이 숨통을 틔웁니다`);
    } else if (groupWeight.재성 >= 0.5) {
      useEl = G.재성;
      useReason.push(`흘려 줄 식상이 거의 없어, 강한 기운을 결과로 바꿔 주는 재성(${ELEMENTS[G.재성]})이 그 자리를 대신합니다`);
    } else {
      useEl = G.관성;
      useReason.push(`덜어낼 통로가 마땅치 않아, 눌러 정리해 주는 관성(${ELEMENTS[G.관성]})이 필요합니다`);
    }
    avoidEl = G.인성;
    useReason.push(`이미 강한 일간에 더 보태는 인성(${ELEMENTS[G.인성]})은 오히려 부담이 됩니다`);
  }
  // 희신 — 용신을 생해 주는 오행
  const helpEl = ((useEl + 4) % 5) as ElIdx;

  // ── 5) 12운성 ──────────────────────────────────────────────
  const twelve = POS.filter((p) => P[p]).map((p) => ({ pos: p, stage: twelveStage(dayStem, P[p]!.branch) }));

  // ── 6) 관계 ────────────────────────────────────────────────
  const relations: Relation[] = [];
  const present = POS.filter((p) => P[p]);
  for (let i = 0; i < present.length; i++) {
    for (let j = i + 1; j < present.length; j++) {
      const a = P[present[i]]!, b = P[present[j]]!;
      const pair: [PillarPos, PillarPos] = [present[i], present[j]];
      const sc = stemCombo(a.stem, b.stem);
      if (sc !== null) relations.push({ kind: "천간합", between: pair, chars: `${STEMS[a.stem]}${STEMS[b.stem]}`, el: sc, note: `${ELEMENTS[sc]} 기운으로 묶입니다` });
      if (stemClash(a.stem, b.stem)) relations.push({ kind: "천간충", between: pair, chars: `${STEMS[a.stem]}${STEMS[b.stem]}`, note: "두 기운이 정면으로 부딪힙니다" });
      if (branchSix(a.branch, b.branch)) relations.push({ kind: "육합", between: pair, chars: `${BRANCHES[a.branch]}${BRANCHES[b.branch]}`, note: "서로 붙잡아 묶는 관계입니다" });
      if (branchClash(a.branch, b.branch)) relations.push({ kind: "충", between: pair, chars: `${BRANCHES[a.branch]}${BRANCHES[b.branch]}`, note: "마주 보고 부딪혀 자리가 흔들립니다" });
      if (branchBreak(a.branch, b.branch)) relations.push({ kind: "파", between: pair, chars: `${BRANCHES[a.branch]}${BRANCHES[b.branch]}`, note: "이어지던 것이 한 번 끊깁니다" });
      if (branchHarm(a.branch, b.branch)) relations.push({ kind: "해", between: pair, chars: `${BRANCHES[a.branch]}${BRANCHES[b.branch]}`, note: "속으로 서운함이 쌓이는 관계입니다" });
      if (MUTUAL_PUNISH.includes(a.branch) && MUTUAL_PUNISH.includes(b.branch) && a.branch !== b.branch)
        relations.push({ kind: "형", between: pair, chars: `${BRANCHES[a.branch]}${BRANCHES[b.branch]}`, note: "예의가 어긋나는 자리로 봅니다" });
      if (a.branch === b.branch && SELF_PUNISH.includes(a.branch))
        relations.push({ kind: "형", between: pair, chars: `${BRANCHES[a.branch]}${BRANCHES[b.branch]}`, note: "같은 글자가 겹쳐 스스로를 찌릅니다" });
    }
  }
  const branchList = present.map((p) => P[p]!.branch);
  for (const t of TRIPLE) {
    if (t.members.every((mm) => branchList.includes(mm)))
      relations.push({ kind: "삼합", between: ["년", "시"], chars: t.members.map((mm) => BRANCHES[mm]).join(""), el: t.el, note: `세 글자가 모여 ${ELEMENTS[t.el]} 기운을 크게 만듭니다` });
  }
  for (const d of DIRECTIONAL) {
    if (d.members.every((mm) => branchList.includes(mm)))
      relations.push({ kind: "방합", between: ["년", "시"], chars: d.members.map((mm) => BRANCHES[mm]).join(""), el: d.el, note: `한 계절이 통째로 모여 ${ELEMENTS[d.el]} 기운이 몰립니다` });
  }
  for (const t of TRIPLE_PUNISH) {
    if (t.every((mm) => branchList.includes(mm)))
      relations.push({ kind: "형", between: ["년", "시"], chars: t.map((mm) => BRANCHES[mm]).join(""), note: "세 글자가 얽혀 문제가 반복되는 구조로 봅니다" });
  }

  // ── 7) 신살 ────────────────────────────────────────────────
  const branchesOrNull = POS.map((p) => P[p]?.branch ?? null);
  const sinsal = findSinsal(dayStem, branchesOrNull, pillars.year.branch);
  const vm = voidMeaning(voidBranches, branchesOrNull);
  if (vm) sinsal.push(vm);

  // 격국 — 월지 정기가 일간에게 어떤 십신인가.
  // 비견이면 건록격(월지가 일간의 록), 겁재면 양간은 양인격·음간은 월겁격으로 부른다.
  const monthGod = tenGod(dayStem, mainStem(pillars.month.branch));
  const gyeok = (() => {
    if (monthGod === "비견") return { name: "건록격", god: monthGod, note: "월지가 일간의 록이 되는 자리" };
    if (monthGod === "겁재")
      return dayStem % 2 === 0
        ? { name: "양인격", god: monthGod, note: "양간이 월지에서 날이 선 자리" }
        : { name: "월겁격", god: monthGod, note: "월지가 같은 편으로 채워진 자리" };
    return { name: `${monthGod}격`, god: monthGod, note: `월지 정기가 ${monthGod}인 자리` };
  })();

  const missing = ([0, 1, 2, 3, 4] as ElIdx[]).filter((e) => elementWeight[e] < 0.35);
  const dominant = elementWeight.indexOf(Math.max(...elementWeight)) as ElIdx;

  return {
    pillars: P, dayStem, dayEl, tenGods, groupWeight, elementWeight,
    득령, 득지, 득세, strong, strengthScore,
    useEl, helpEl, avoidEl, useReason,
    twelve, relations, sinsal, missing, dominant, gyeok,
  };
}
