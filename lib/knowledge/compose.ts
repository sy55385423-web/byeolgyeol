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

export const ALL_RULES: Rule[] = [
  ...structureRules, ...gyeokRules, ...tenGodRules, ...loveRules, ...domainRules, ...pairRules, ...timingRules,
];

/** 리포트 한 부 동안 어떤 규칙을 이미 썼는지 기억한다.
 *  같은 규칙이 문항마다 반복되면 "엔진이 돌려막는다"는 인상을 준다. */
export type ComposeLedger = Set<string>;
export const newLedger = (): ComposeLedger => new Set();

export type Composed = { id: string; tag: string; text: string; weight: number };

export function compose(
  facts: Facts,
  topic: Topic,
  count: number,
  ledger?: ComposeLedger,
  rules: Rule[] = ALL_RULES,
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
  const sorted = matched
    .filter((r) => !ledger?.has(r.id))
    .sort((a, b) => b.weight - a.weight);

  const out: Composed[] = [];
  const usedTags = new Set<string>();
  for (const r of sorted) {
    if (out.length >= count) break;
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
