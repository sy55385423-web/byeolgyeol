/** 해석 규칙의 형태 — "어떤 조건일 때 무엇을 말할지"를 데이터로 적는다.
 *
 *  이 앱은 LLM 없이 리포트를 만든다. 그래서 문장을 미리 써 두되, 어떤 문장이 나갈지는
 *  명식 계산 결과가 정한다. 규칙 하나는 "조건(when) + 그 조건일 때의 해석(text)"이고,
 *  조건이 참인 규칙만 모아 우선순위대로 문단을 만든다.
 *
 *  이 구조라야 두 가지가 동시에 된다.
 *    - 같은 생년월일이면 항상 같은 리포트 (결정론적)
 *    - 명식이 다르면 실제로 다른 문장 (조건이 다르게 걸리므로)
 *
 *  규칙을 쓸 때 지킬 것
 *    1) text는 조건이 참일 때만 성립하는 말이어야 한다. 아무에게나 해당되는 문장을 쓰면
 *       조건을 붙인 의미가 없어진다.
 *    2) 근거(명식의 어느 자리에서 나왔는지)를 문장 안에 남긴다.
 *    3) tag가 같은 규칙은 한 섹션에 하나만 나간다. 같은 얘기를 두 번 하지 않기 위해서다. */

import type { Analysis } from "../core/analyze";
import type { YearScore } from "../core/luck";
import type { Chart } from "../saju";

/** 리포트가 다루는 주제. 문항을 이 단위로 묶어 규칙을 고른다. */
export type Topic =
  | "매력" | "끌림" | "인기" | "연애패턴" | "연애주의" | "배우자" | "결혼시기" | "연애시기"
  | "성격" | "인생흐름" | "전성기"
  | "직업" | "재물" | "건강"
  | "궁합" | "재회";

/** 규칙이 판단에 쓰는 재료. 계산 엔진이 만든 사실만 들어간다. */
export type Facts = {
  a: Analysis;
  chart: Chart;
  /** 대운 — 지금 걷는 구간 */
  luck?: { age: number; stem: number; branch: number; ko: string };
  luckStartAge: number;
  luckForward: boolean;
  /** 올해부터 10년 치 세운 점수 */
  years: YearScore[];
  isMale: boolean;
  genderKnown: boolean;
  /** 이름 — 문장에서 부를 때 쓴다. 없으면 "당신" */
  who: string;
};

export type Rule = {
  id: string;
  topics: Topic[];
  /** 이 조건이 참일 때만 문장이 나간다 */
  when: (f: Facts) => boolean;
  /** 높을수록 먼저 나간다. 명식의 뼈대에 해당하는 것일수록 높게 준다.
   *  90+ 그 사람을 규정하는 구조 / 70~89 뚜렷한 특징 / 50~69 보조 / ~49 곁가지 */
  weight: number;
  /** 같은 태그는 한 섹션에 하나만. 같은 얘기의 반복을 막는다. */
  tag: string;
  text: (f: Facts) => string;
};

/** 조사 — 규칙 텍스트에서 자주 쓴다. */
export function jong(w: string): boolean {
  for (let i = w.length - 1; i >= 0; i--) {
    const c = w.charCodeAt(i);
    if (c >= 0xac00 && c <= 0xd7a3) return (c - 0xac00) % 28 !== 0;
  }
  return false;
}
export const ga = (w: string) => (jong(w) ? "이" : "가");
export const eun = (w: string) => (jong(w) ? "은" : "는");
export const eul = (w: string) => (jong(w) ? "을" : "를");
export const ro = (w: string) => {
  for (let i = w.length - 1; i >= 0; i--) {
    const c = w.charCodeAt(i);
    if (c >= 0xac00 && c <= 0xd7a3) {
      const j = (c - 0xac00) % 28;
      return j === 0 || j === 8 ? "로" : "으로";
    }
  }
  return "로";
};
export const ira = (w: string) => (jong(w) ? "이라" : "라");
