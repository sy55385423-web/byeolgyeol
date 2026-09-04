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
import type { MonthScore } from "../core/month";
import type { Chart } from "../saju";

/** 리포트가 다루는 주제. 문항을 이 단위로 묶어 규칙을 고른다. */
export type Topic =
  | "매력" | "끌림" | "인기" | "연애패턴" | "연애주의" | "배우자" | "결혼시기" | "연애시기"
  | "성격" | "인생흐름" | "전성기" | "대운"
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
  /** 앞으로 14개월 월운 — "몇 년 몇 월"까지 말하려면 이게 있어야 한다.
   *  용신 오행에 해당하는 달을 고르는 방식은 매년 반복되는 달이라 연도가 없다. */
  months: MonthScore[];
  isMale: boolean;
  genderKnown: boolean;
  /** 이름 — 문장에서 부를 때 쓴다. 없으면 "당신" */
  who: string;
  /** 재회 카테고리에서 사용자가 밝힌 이별 시점. 마음 정리·연락·재회 시기를
   *  여기서부터 잰다. 없으면 규칙은 오늘 기준으로 답한다. */
  breakup?: { y: number; m: number; monthsSince: number; heal: number; settle?: { year: number; month: number }; contact?: { year: number; month: number }; reunion?: { year: number; month: number } };
  /** 궁합·재회에서 상대방. 두 사람의 관계를 보는 규칙은 이게 있을 때만 걸린다. */
  other?: {
    a: Analysis;
    who: string;
    isMale: boolean;
  };
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
  /** 이 규칙이 특히 맞는 문항의 키워드.
   *
   *  한 카테고리의 문항이 대부분 같은 주제라, weight가 높은 규칙은 첫 문항이
   *  다 가져가 버린다. "재물을 잃기 쉬운 시기"에 정작 연도를 대는 규칙이 안
   *  나가고 성격 얘기가 들어가는 일이 그래서 생긴다.
   *
   *  문항 제목에 이 키워드가 있으면 그 문항에서 먼저 나간다. */
  prefer?: string[];
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
export const wa = (w: string) => (jong(w) ? "과" : "와");
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

/** 십신 다섯 갈래가 무엇이고 숫자가 무슨 뜻인지.
 *
 *  규칙들이 "비겁 1.4 · 식상 3.1 · 재성 0.5 · 관성 1.0 · 인성 2.1"처럼 숫자를
 *  늘어놓는데, 이게 무슨 척도인지 어디에도 안 적혀 있었다. 읽는 사람 입장에서는
 *  3.1이 큰 건지 작은 건지 알 방법이 없다.
 *
 *  숫자는 여덟 글자에서 그 갈래가 차지하는 무게다. 천간 한 자가 1점,
 *  지지는 지장간을 일수로 나눠 합계 1점, 월지만 계절을 쥐고 있어 두 배다.
 *  그래서 다 더하면 8이 되고, 태어난 시간을 모르면 여섯 자만 잡혀 6이 된다.
 *
 *  문장이 똑같으면 리포트 안에서 두 번째부터는 중복 제거에 걸려 저절로 빠진다.
 *  그래서 어느 규칙에 붙이든 같은 문구를 쓴다. */
export function godLegend(f: Facts): string {
  const total = f.a.pillars.시 ? 8 : 6;
  return `십신은 여덟 글자를 일간과의 관계로 다섯 갈래로 나눈 것입니다. 비겁은 나와 같은 편, 식상은 내가 내보내는 것, 재성은 내가 다루는 것, 관성은 나를 누르는 것, 인성은 나를 받쳐 주는 것입니다. 숫자는 각 갈래가 차지하는 무게라 다 더하면 ${total}이 됩니다${total === 6 ? "(태어난 시간을 몰라 여섯 자만 잡혔습니다)" : ""}.`;
}
