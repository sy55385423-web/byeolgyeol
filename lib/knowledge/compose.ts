/** 문장 생성 엔진 — 조건이 맞는 규칙을 골라 문단으로 조립한다.
 *
 *  순서
 *    1) 이 주제(topic)에 해당하는 규칙만 추린다
 *    2) when()이 참인 것만 남긴다      ← 여기서 사람마다 결과가 갈린다
 *    3) weight 순으로 정렬한다          ← 명식의 뼈대가 먼저 나온다
 *    4) 같은 tag는 하나만 남긴다        ← 같은 얘기를 두 번 하지 않는다
 *    5) 이미 다른 문항에서 쓴 규칙은 제외한다 ← 리포트 전체에서 같은 문단이 두 번 안 나온다
 *    6) 필요한 개수만 잘라 낸다
 *
 *  랜덤이 하나도 없다. 같은 명식이면 항상 같은 문단이, 다른 명식이면 다른 문단이 나온다. */

import type { Facts, Rule, Topic } from "./types";
import { tenGodRules } from "./tenGods";
import { structureRules, timingRules } from "./structure";
import { loveRules } from "./love";
import { gyeokRules } from "./gyeokguk";
import { domainRules } from "./domains";
import { pairRules } from "./pair";
import { pair2Rules } from "./pair2";
import { attractionRules } from "./attraction";
import { primeRules } from "./prime";
import { genderRules } from "./gender";
import { domain2Rules } from "./domains2";
import { timing2Rules } from "./timing2";
import { domain3Rules } from "./domains3";
import { ziweiYearRules } from "./ziweiYear";
import { astroRules } from "./astro";

export const ALL_RULES: Rule[] = [
  ...structureRules, ...gyeokRules, ...tenGodRules, ...loveRules, ...attractionRules,
  ...domainRules, ...domain2Rules, ...domain3Rules, ...pairRules, ...pair2Rules, ...primeRules, ...genderRules, ...ziweiYearRules, ...astroRules, ...timing2Rules, ...timingRules,
];

/** 리포트 한 부 동안 어떤 규칙을 이미 썼는지 기억한다.
 *  같은 규칙이 문항마다 반복되면 "엔진이 돌려막는다"는 인상을 준다. */
export type ComposeLedger = Set<string>;
export const newLedger = (): ComposeLedger => new Set();

export type Composed = { id: string; tag: string; text: string; weight: number };

/** 주제가 마르면 어디서 더 가져올지.
 *
 *  한 규칙은 리포트 안에서 한 번만 쓴다(돌려막는 인상을 주지 않으려고). 그런데
 *  재회 카테고리는 열세 문항이 거의 다 "재회" 주제라, 재회 규칙 아홉 개를 다 쓰고
 *  나면 나머지 문단이 전부 템플릿으로 떨어졌다(요청 53문단 중 규칙이 채운 것 9개).
 *
 *  인접 주제로 내려가며 채운다. 재회를 묻는 사람에게 "이 사람은 신약이라 …"는
 *  동떨어진 말이 아니다. 두 사람 중 한 명이 이 사람이기 때문이다.
 *  단, 순서가 있다. 가까운 주제부터 쓰고 먼 주제는 마지막에 쓴다. */
const FALLBACK: Record<Topic, Topic[]> = {
  // 연애 계열 — 연애 안에서만 돈다
  재회: ["궁합", "연애패턴", "배우자", "연애주의"],
  궁합: ["연애패턴", "배우자", "끌림", "연애주의"],
  매력: ["인기", "끌림", "연애패턴"],
  끌림: ["연애패턴", "배우자", "매력"],
  인기: ["매력", "끌림", "연애패턴"],
  연애패턴: ["연애주의", "끌림", "매력"],
  연애주의: ["연애패턴", "배우자", "끌림"],
  배우자: ["결혼시기", "끌림", "연애패턴"],
  결혼시기: ["배우자", "연애시기", "연애패턴"],
  연애시기: ["결혼시기", "배우자", "연애패턴"],
  // 인생 계열
  성격: ["인생흐름", "전성기"],
  인생흐름: ["성격", "전성기", "대운"],
  전성기: ["대운", "인생흐름"],
  대운: ["전성기", "인생흐름"],
  // 일·돈
  직업: ["재물", "인생흐름"],
  재물: ["직업", "인생흐름"],
  // 건강 → 성격·인생흐름은 열어 둔다. 체질과 성격은 같은 명식에서 나오니 어색하지 않다.
  // 반대 방향(연애 문항이 건강 규칙을 끌어오는 것)은 연애 계열 체인에 건강이 없어서 막힌다.
  건강: ["성격", "인생흐름"],
};

export function compose(
  facts: Facts,
  topic: Topic,
  count: number,
  ledger?: ComposeLedger,
  rules: Rule[] = ALL_RULES,
  /** 문항 제목 — prefer 키워드와 맞으면 그 규칙을 먼저 쓴다 */
  question?: string,
  /** 이 카테고리의 전체 문항 — 뒤 문항 몫을 앞 문항이 가져가지 않게 한다 */
  siblings?: string[],
): Composed[] {
  const matched = rules
    .filter((r) => r.topics.includes(topic))
    .filter((r) => {
      try {
        return r.when(facts);
      } catch {
        // 규칙 하나가 깨져도 리포트 전체가 죽으면 안 된다.
        return false;
      }
    });

  // 한 리포트 안에서 같은 규칙은 한 번만 쓴다. 같은 문단이 문항마다 다시 나오면
  // "엔진이 돌려막는다"는 인상을 주기 때문에, 후보가 모자라면 문단 수를 줄이는 쪽을 택한다.
  // 문항 제목과 규칙의 prefer를 맞춰 본다.
  //
  //  맞으면        +40 — 이 문항이 이 규칙의 제자리다
  //  안 맞는데
  //  다른 문항엔 맞으면 −60 — 그 문항 몫이니 여기서 쓰지 않는다
  //
  //  두 번째가 없으면 "재물을 잃기 쉬운 시기"에 정작 연도를 대는 규칙이 안 나간다.
  //  앞 문항이 weight 순으로 이미 가져가 버리기 때문이다.
  const fits = (r: Rule, q?: string) => !!q && !!r.prefer?.some((k) => q.includes(k));
  /** 아직 오지 않은 문항 몫으로 잡아 둔 규칙인가.
   *
   *  감점만으로는 부족하다 — 후보가 모자라면 결국 뽑혀 나가서 정작 그 문항이
   *  빈손이 된다. 그렇다고 무조건 막으면, 이미 지나간 문항이 안 쓰고 넘긴
   *  규칙까지 영영 못 쓰게 된다. 그래서 "뒤에 올 문항" 것만 잠근다. */
  const here = question && siblings ? siblings.indexOf(question) : -1;
  const reserved = (r: Rule) => {
    if (!r.prefer || fits(r, question)) return false;
    if (!siblings) return false;
    return siblings.some((q, i) => i > here && q !== question && fits(r, q));
  };

  const avail = matched.filter((r) => !ledger?.has(r.id));
  const sorted = avail
    .filter((r) => !reserved(r))
    .sort((a, b) => b.weight + (fits(b, question) ? 40 : 0) - (a.weight + (fits(a, question) ? 40 : 0)));

  const out: Composed[] = [];
  const usedTags = new Set<string>();
  const take = (list: Rule[]) => {
    for (const r of list) {
      if (out.length >= count) return;
      if (usedTags.has(r.tag)) continue;
      let text: string;
      try {
        text = r.text(facts);
      } catch {
        continue;
      }
      if (!text || text.trim().length < 10) continue;
      usedTags.add(r.tag);
      ledger?.add(r.id);
      out.push({ id: r.id, tag: r.tag, text: text.trim(), weight: r.weight });
    }
  };
  take(sorted);

  // 이 주제 규칙을 다 썼는데 문단이 모자라면 인접 주제에서 채운다.
  // (예약해 둔 규칙은 마지막까지 남겨 둔다 — 아래 최후 보루에서만 쓴다)
  // 템플릿으로 떨어뜨리는 것보다 명식에서 나온 문장 하나가 낫다.
  if (out.length < count) {
    for (const alt of FALLBACK[topic] ?? []) {
      if (out.length >= count) break;
      const more = rules
        .filter((r) => r.topics.includes(alt))
        .filter((r) => !ledger?.has(r.id) && !usedTags.has(r.tag))
        .filter((r) => {
          try {
            return r.when(facts);
          } catch {
            return false;
          }
        })
        .sort((a, b) => b.weight - a.weight);
      take(more.filter((r) => !reserved(r)));
    }
  }

  // 예약분은 끝까지 건드리지 않는다. 여기서 한 문단을 더 채우려고 뒤 문항의
  // 답을 가져오면, 그 문항이 통째로 빈손이 된다. 문단 하나가 비는 편이 낫다.
  return out;
}

/** 이 명식에서 조건이 걸리는 규칙이 몇 개인지 — 커버리지 점검용.
 *  특정 명식에서 나올 문단이 지나치게 적으면 규칙 DB에 구멍이 있다는 신호다. */
export function coverage(facts: Facts, topics: Topic[], rules: Rule[] = ALL_RULES) {
  return topics.map((t) => ({
    topic: t,
    matched: rules.filter((r) => r.topics.includes(t)).filter((r) => {
      try { return r.when(facts); } catch { return false; }
    }).length,
  }));
}
