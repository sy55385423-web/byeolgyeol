/** 시기(時期) 계산 엔진 — 좋은 달·조심할 달을 명식에서 실제로 도출한다.
 *
 *  예전에는 `1 + ((seed + 10) % 12)`처럼 생년월일 해시로 달을 만들었다. 사람마다 값이
 *  달라지긴 해도 명리와는 아무 상관이 없어서, 왜 그 달인지 설명할 수 없는 숫자였다.
 *
 *  여기서는 실제 사주 판단 순서를 따른다.
 *   1) 일간이 강한지 약한지 본다(신강·신약). 여덟 글자를 일간 기준 십신으로 나눠,
 *      일간을 돕는 쪽(비겁·인성)과 빼는 쪽(식상·재성·관성)의 무게를 비교한다.
 *      월지는 계절을 쥐고 있어 비중이 크므로(득령) 가중치를 더 준다.
 *   2) 그 결과로 용신(도움이 되는 기운)과 기신(부담이 되는 기운)을 정한다.
 *      신약이면 채워 주는 인성·비겁이 용신이고 극하는 관성이 기신,
 *      신강이면 빼 주는 식상이 용신이고 더 보태는 인성이 기신이다.
 *   3) 열두 달은 각각 지지를 갖는다(2월 인, 3월 묘 … 1월 축). 그 지지의 오행이
 *      용신이면 흐름이 트이는 달, 기신이면 조심할 달로 본다.
 *   4) 대한(大限)은 자미두수 쪽에서 실제로 계산된 값(iztro)을 그대로 쓴다.
 *
 *  ⚠️ 한계: 조후(계절 온도), 통근·투출, 합충형파, 공망 등은 반영하지 않은 단순화 모델이다.
 *  실제 상담에서는 이보다 훨씬 많은 요소를 함께 본다. 다만 "왜 이 달인지" 설명할 수
 *  있다는 점에서 해시 방식과는 성격이 다르다. */

import { BRANCH_ELEMENT, ELEMENTS, type Chart, type Element } from "./saju";
import { analyze, type Analysis } from "./core/analyze";

/** 일간(D)을 기준으로 한 십신 계열의 오행.
 *  상생은 (i+1)%5 (목→화→토→금→수→목), 상극은 (i+2)%5 (목→토, 화→금 …). */
export function tenGods(day: Element) {
  return {
    비겁: day as Element,                    // 나와 같은 오행 — 힘을 보탠다
    인성: ((day + 4) % 5) as Element,        // 나를 생하는 오행 — 힘을 보탠다
    식상: ((day + 1) % 5) as Element,        // 내가 생하는 오행 — 힘을 뺀다
    재성: ((day + 2) % 5) as Element,        // 내가 극하는 오행 — 힘을 뺀다
    관성: ((day + 3) % 5) as Element,        // 나를 극하는 오행 — 힘을 뺀다
  };
}

export type Timing = {
  strong: boolean;         // 신강이면 true
  support: number;         // 일간을 돕는 무게
  drain: number;           // 일간을 빼는 무게
  useEl: Element;          // 용신
  avoidEl: Element;        // 기신
  goodMonths: number[];    // 용신 오행에 해당하는 달(양력 근사)
  riskMonths: number[];    // 기신 오행에 해당하는 달
  good: number;            // 대표 좋은 달
  risk: number;            // 대표 조심할 달
  daewoon?: { from: number; to: number; stem: string; branch: string; el: Element; helpful: boolean };
  /** 십신·관계·신살까지 담긴 전체 분석 — 리포트가 사실을 인용할 때 쓴다. */
  analysis: Analysis;
};

/** 양력 달 → 월지 index. 절기 기준이라 실제로는 4~5일 앞뒤로 밀리지만,
 *  달 단위로 안내하는 리포트에서는 이 근사로 충분하다.
 *  1월 축(1) · 2월 인(2) … 11월 해(11) · 12월 자(0) → m % 12 로 떨어진다. */
export const monthBranch = (m: number) => m % 12;
export const monthElement = (m: number): Element => BRANCH_ELEMENT[monthBranch(m)] as Element;

const monthsOf = (el: Element) => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].filter((m) => monthElement(m) === el);

export function analyzeTiming(c: Chart, now = new Date()): Timing {
  // 강약·용신 판정은 lib/core/analyze.ts가 한다. 그쪽은 지장간을 일수 비중으로 펼치고
  // 득령·득지·득세를 함께 보므로, 오행 개수만 세던 예전 판정보다 훨씬 정확하다.
  const a = analyze(
    {
      year: { stem: c.pillars.year.stem, branch: c.pillars.year.branch },
      month: { stem: c.pillars.month.stem, branch: c.pillars.month.branch },
      day: { stem: c.pillars.day.stem, branch: c.pillars.day.branch },
      hour: c.pillars.hour ? { stem: c.pillars.hour.stem, branch: c.pillars.hour.branch } : null,
    },
    c.voidBranches,
  );

  const useEl = a.useEl as Element;
  const avoidEl = a.avoidEl as Element;
  const goodMonths = monthsOf(useEl);
  const riskMonths = monthsOf(avoidEl);
  // 대표값 — 같은 오행에 달이 여럿이면(토는 넷) 그중 첫 달을 쓴다. 같은 사람에게 항상
  // 같은 값이 나와야 리포트 안에서 시기가 어긋나지 않는다.
  const good = goodMonths[0] ?? 1;
  const risk = riskMonths[0] ?? 7;

  // 대한(大限) — 자미두수 쪽에서 실제로 계산된 구간
  const age = now.getFullYear() - c.birthYear + 1; // 한국식 세는나이
  const cur = c.decadals.find((d) => age >= d.from && age <= d.to);
  const daewoon = cur
    ? { ...cur, el: BRANCH_ELEMENT[cur.branchIdx] as Element, helpful: (BRANCH_ELEMENT[cur.branchIdx] as Element) === useEl }
    : undefined;

  return {
    strong: a.strong,
    support: a.groupWeight.비겁 + a.groupWeight.인성,
    drain: a.groupWeight.식상 + a.groupWeight.재성 + a.groupWeight.관성,
    useEl, avoidEl, goodMonths, riskMonths, good, risk, daewoon,
    analysis: a,
  };

}

// 오행 이름의 받침 — 목(ㄱ)·금(ㅁ)만 받침이 있다. 조사를 하드코딩하면 "목가", "화이"가 된다.
const hasJong = (el: Element) => el === 0 || el === 3;
const ga = (el: Element) => (hasJong(el) ? "이" : "가");
const eul = (el: Element) => (hasJong(el) ? "을" : "를");

/** 사람이 읽을 수 있는 한 줄 근거 — "왜 이 달인지"를 설명할 때 쓴다. */
export function timingReason(tm: Timing, day: Element): string {
  const t = tenGods(day);
  const useName =
    tm.useEl === t.인성 ? "일간을 받쳐 주는 기운" :
    tm.useEl === t.비겁 ? "일간과 같은 편의 기운" :
    tm.useEl === t.식상 ? "쌓인 기운을 밖으로 흘려 주는 기운" :
    tm.useEl === t.재성 ? "강한 기운을 실제 결과로 바꿔 주는 기운" : "기운을 정리해 주는 기운";
  return `일간 ${ELEMENTS[day]}${
    tm.strong ? `${ga(day)} 여덟 글자 안에서 힘을 얻은 편이라(신강)` : `${eul(day)} 받쳐 주는 글자가 적어(신약)`
  } ${ELEMENTS[tm.useEl]}, 즉 ${useName}이 들어올 때 흐름이 풀립니다. 반대로 ${ELEMENTS[tm.avoidEl]}${ga(tm.avoidEl)} 강해지는 달에는 같은 일도 더 무겁게 걸립니다.`;
}
