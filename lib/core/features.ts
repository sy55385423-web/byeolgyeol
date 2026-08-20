/** 1층 — 명반에서 원천 특성(feature)을 뽑는다.
 *
 *  예전에는 명반의 십신 무게를 바로 점수로 썼다(식상 3.3 → 표현력 84).
 *  거칠고, 무엇보다 "식상 = 표현력"이라는 대응을 내가 정해야 했다.
 *
 *  여기서는 명반을 점수표가 아니라 **특성 생성기**로 쓴다. 십신·오행·강약·
 *  생극제화·구조를 재료로 스무 가지 원천 특성을 만들고, 능력은 그 특성들의
 *  조합으로 2층에서 만든다. 한 특성이 여러 능력에 서로 다른 비중으로 들어가므로
 *  "십신 하나 = 능력 하나" 같은 억지 대응이 사라진다.
 *
 *  모든 특성은 0~100. 명리의 값(무게 0~4, 강약 0~100, 개수 0~4)을 여기서 한 번만
 *  눈금으로 옮기고, 위층은 눈금 걱정 없이 비중만 다룬다.
 *
 *  ⚠️ 특성 이름은 심리 용어지만 재료는 전부 명리 값이다. 어떤 명리 자리에서
 *  나왔는지 각 항목에 적어 둔다. */

import { ELEMENTS, type ElIdx } from "./ganji";
import type { Analysis } from "./analyze";

/** 십신 무게(대개 0~4)를 0~100으로. 4를 만점으로 본다. */
const w100 = (v: number, cap = 4) => Math.max(0, Math.min(100, (v / cap) * 100));
/** 개수(0~4개)를 0~100으로 */
const n100 = (n: number, cap = 4) => Math.max(0, Math.min(100, (n / cap) * 100));
const clamp = (v: number) => Math.max(0, Math.min(100, v));

export type FeatureKey =
  | "표현성" | "대인접근성" | "자기주도" | "관계확장" | "정서개방"
  | "책임성" | "일관성" | "약속이행" | "안정성" | "관계지속성"
  | "현실감각" | "실행력" | "자기통제" | "지속성" | "의사결정력"
  | "외부의존도" | "감당력" | "균형도" | "구조안정" | "통로개방";

export type Features = Record<FeatureKey, number>;

/** 어떤 명리 자리에서 나온 특성인지 — 화면에 근거를 밝힐 때 쓴다. */
export const FEATURE_SOURCE: Record<FeatureKey, string> = {
  표현성: "식상",
  대인접근성: "비겁·재성·도화",
  자기주도: "비겁·강약",
  관계확장: "재성·역마·천을귀인",
  정서개방: "식상·화 기운·음간",
  책임성: "관성",
  일관성: "정관·정재·정인 비중",
  약속이행: "정관·강약",
  안정성: "인성·토 기운·합",
  관계지속성: "일지 12운성·일지 합충",
  현실감각: "재성",
  실행력: "재성·강약·식상생재",
  자기통제: "관성·인성",
  지속성: "토 기운·정관·12운성",
  의사결정력: "비겁·관성·강약",
  외부의존도: "인성·신약",
  감당력: "강약 점수",
  균형도: "오행 편차",
  구조안정: "격국의 성패",
  통로개방: "식상·관성이 막히지 않았는가",
};

/** 12운성 중 기운이 오른 자리 */
const ALIVE = ["장생", "관대", "건록", "제왕"];

export function extractFeatures(a: Analysis): Features {
  const g = a.groupWeight;
  const el = a.elementWeight;
  const gods = a.tenGods.flatMap((t) => [t.stem, t.branch]) as string[];
  const has = (n: string) => a.sinsal.some((s) => s.name === n);
  const cnt = (...n: string[]) => gods.filter((x) => n.includes(x)).length;
  const dayStage = a.twelve.find((t) => t.pos === "일")?.stage ?? "제왕";
  const dayAlive = ALIVE.includes(dayStage);
  const rel = (k: Analysis["relations"][number]["kind"]) => a.relations.filter((r) => r.kind === k).length;

  // ── 생극제화 — 십신끼리의 상호작용. 명리에서 실제로 이름이 붙은 구조들.
  const 식상생재 = g.식상 >= 1 && g.재성 >= 1;          // 만들어서 판다
  const 관인상생 = g.관성 >= 1 && g.인성 >= 1;          // 자리가 배움을 부른다
  const 재생관 = g.재성 >= 1 && g.관성 >= 1;            // 재물이 자리를 만든다
  const 상관견관 = cnt("상관") > 0 && cnt("정관") > 0;  // 상관이 정관을 친다 — 규범과 충돌
  const 군겁쟁재 = g.비겁 >= 2 && g.재성 < 1;           // 나눌 것보다 나눌 사람이 많다
  const 인다신왕 = g.인성 >= 2.5 && g.식상 < 1;         // 받아들이기만 하고 못 내놓는다

  const 감당력 = a.strengthScore;
  const avg = el.reduce((s, v) => s + v, 0) / 5;
  const sd = Math.sqrt(el.reduce((s, v) => s + (v - avg) ** 2, 0) / 5);
  const 균형도 = clamp(100 - sd * 45);

  return {
    표현성: clamp(w100(g.식상) + (has("문창귀인") ? 8 : 0) - (인다신왕 ? 12 : 0)),
    대인접근성: clamp(w100(g.비겁) * 0.5 + w100(g.재성) * 0.35 + (has("도화") ? 15 : 0) - (has("화개") ? 10 : 0)),
    자기주도: clamp(w100(g.비겁) * 0.55 + 감당력 * 0.45),
    관계확장: clamp(w100(g.재성) * 0.6 + (has("역마") ? 14 : 0) + (has("천을귀인") ? 10 : 0) - (군겁쟁재 ? 12 : 0)),
    정서개방: clamp(w100(g.식상) * 0.55 + w100(el[1], 3) * 0.3 + (a.dayStem % 2 === 1 ? 10 : 0)),

    책임성: clamp(w100(g.관성) + (재생관 ? 8 : 0)),
    일관성: clamp(n100(cnt("정관", "정재", "정인"), 5) * 0.7 + 균형도 * 0.3 - (상관견관 ? 15 : 0)),
    약속이행: clamp(n100(cnt("정관"), 3) * 0.6 + 감당력 * 0.4 - (상관견관 ? 10 : 0)),
    안정성: clamp(w100(g.인성) * 0.4 + w100(el[2], 3) * 0.35 + n100(rel("육합") + rel("삼합"), 3) * 0.25),
    관계지속성: clamp((dayAlive ? 62 : 40) + n100(rel("육합"), 2) * 0.3 - rel("충") * 10),

    현실감각: clamp(w100(g.재성)),
    실행력: clamp(w100(g.재성) * 0.4 + 감당력 * 0.4 + (식상생재 ? 20 : 0)),
    자기통제: clamp(w100(g.관성) * 0.5 + w100(g.인성) * 0.3 + (관인상생 ? 15 : 0)),
    지속성: clamp(w100(el[2], 3) * 0.35 + n100(cnt("정관", "정재"), 4) * 0.35 + (dayAlive ? 25 : 8)),
    의사결정력: clamp(w100(g.비겁) * 0.35 + w100(g.관성) * 0.25 + 감당력 * 0.4),

    외부의존도: clamp(w100(g.인성) * 0.55 + (100 - 감당력) * 0.45),
    감당력,
    균형도,
    구조안정: clamp(gyeokScore(a)),
    통로개방: clamp(w100(g.식상 + g.관성, 5) * 0.7 + (상관견관 ? 0 : 20) + (인다신왕 ? -15 : 10)),
  };
}

/** 격국이 제구실을 하는가 — 그 격이 필요로 하는 십신(guard)이 실제로 있는지.
 *  명리에서 격은 성격(成格)과 파격(破格)으로 갈린다. 재료가 있어야 격이 산다. */
function gyeokScore(a: Analysis): number {
  const g = a.groupWeight;
  const need: Record<string, keyof typeof g> = {
    정재격: "관성", 편재격: "비겁", 정관격: "재성", 편관격: "인성",
    식신격: "재성", 상관격: "재성", 정인격: "관성", 편인격: "재성",
    건록격: "재성", 양인격: "관성", 월겁격: "관성",
  };
  const k = need[a.gyeok.name];
  if (!k) return 55;
  const have = g[k];
  return 40 + Math.min(45, have * 18);
}
