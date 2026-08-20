/** 구조 규칙 — 신강·신약, 용신, 12운성, 합충형파해, 신살, 대운·세운.
 *
 *  십신이 "무엇을 향하는가"라면 여기는 "어떤 판 위에 서 있는가"에 해당한다.
 *  강약과 용신은 사주에서 가장 먼저 잡는 뼈대라 가중치를 높게 뒀다. */

import { ELEMENTS, BRANCHES, STEMS } from "../core/ganji";
import type { Rule, Facts } from "./types";
import { ga, eun, eul, ro } from "./types";

export const structureRules: Rule[] = [
  /* ───────── 신강 · 신약 ───────── */
  {
    id: "신강",
    topics: ["성격", "인생흐름", "직업", "연애패턴"],
    when: (f) => f.a.strong,
    weight: 98,
    tag: "강약",
    text: (f) => {
      const got = [f.a.득령 && "월령", f.a.득지 && "일지", f.a.득세 && "천간"].filter(Boolean) as string[];
      return `${f.who}${eun(f.who)} 여덟 글자를 재 보면 일간 ${STEMS[f.a.dayStem]}${ELEMENTS[f.a.dayEl]}${ga(ELEMENTS[f.a.dayEl])} 힘을 얻은 쪽입니다(신강, ${f.a.strengthScore}점). ${
        got.length ? `${got.join("·")}에서 받쳐 주는 힘을 얻었습니다. ` : ""
      }밀어붙이는 힘이 있어 스스로 결정하고 스스로 감당하는 데 익숙한데, 그만큼 남의 속도에 맞추는 일이 유독 피곤합니다. 이 명식은 채워 주는 것보다 덜어 주는 것이 필요합니다.`;
    },
  },
  {
    id: "신약",
    topics: ["성격", "인생흐름", "직업", "연애패턴", "건강"],
    when: (f) => !f.a.strong,
    weight: 98,
    tag: "강약",
    text: (f) => {
      const lack = [!f.a.득령 && "월령", !f.a.득지 && "일지", !f.a.득세 && "천간"].filter(Boolean) as string[];
      return `${f.who}${eun(f.who)} 여덟 글자를 재 보면 일간 ${STEMS[f.a.dayStem]}${ELEMENTS[f.a.dayEl]}${eul(ELEMENTS[f.a.dayEl])} 받쳐 주는 글자가 적은 쪽입니다(신약, ${f.a.strengthScore}점). ${
        lack.length ? `${lack.join("·")}에서 힘을 못 얻었습니다. ` : ""
      }혼자 밀어붙이는 방식보다 사람과 환경을 빌려 쓰는 방식이 훨씬 잘 맞습니다. 버티는 힘이 약한 게 아니라, 혼자 다 감당하려 할 때만 무너지는 구조입니다.`;
    },
  },

  /* ───────── 용신 ───────── */
  {
    id: "용신",
    topics: ["인생흐름", "성격", "직업", "재물", "건강", "전성기"],
    when: () => true,
    weight: 95,
    tag: "용신",
    text: (f) =>
      `${f.who}의 명식이 필요로 하는 기운은 ${ELEMENTS[f.a.useEl]}입니다. ${f.a.useReason[0]}. ${
        f.a.useReason[1] ? `${f.a.useReason[1]}.` : ""
      } 그래서 ${ELEMENTS[f.a.useEl]} 기운이 들어오는 자리와 시기에 일이 수월하게 풀리고, ${ELEMENTS[f.a.avoidEl]}${ga(ELEMENTS[f.a.avoidEl])} 두꺼워지는 구간에서는 같은 일도 더 무겁게 걸립니다.`,
  },

  /* ───────── 오행 편중 ───────── */
  {
    id: "오행-없음",
    topics: ["성격", "건강", "인생흐름"],
    when: (f) => f.a.missing.length > 0,
    weight: 80,
    tag: "오행편중",
    text: (f) => {
      const m = f.a.missing.map((e) => ELEMENTS[e]).join("·");
      const how: Record<number, string> = {
        0: "새로 시작하고 뻗어 나가는 힘",
        1: "드러내고 표현하는 힘",
        2: "버티고 중심을 잡는 힘",
        3: "끊고 정리하는 힘",
        4: "물러나 생각을 정리하는 힘",
      };
      return `여덟 글자 안에 ${m} 기운이 들어 있지 않습니다. ${how[f.a.missing[0]]}이 얇다는 뜻이라, 그 자리에 해당하는 일만 유독 남들보다 크게 힘이 듭니다. 못 하는 게 아니라 애초에 안 갖고 태어난 쪽이라, 억지로 채우기보다 그 몫을 대신해 줄 사람이나 장치를 곁에 두는 편이 실질적입니다.`;
    },
  },

  /* ───────── 12운성 ───────── */
  {
    id: "12운성-일지-왕",
    topics: ["성격", "매력", "인생흐름"],
    when: (f) => ["건록", "제왕", "관대"].includes(f.a.twelve.find((t) => t.pos === "일")?.stage ?? ""),
    weight: 70,
    tag: "12운성",
    text: (f) =>
      `일간이 일지에서 ${f.a.twelve.find((t) => t.pos === "일")!.stage} 자리에 앉았습니다. 기세가 오른 자리라 자기 힘으로 서는 데 익숙하고, 남의 도움을 받는 걸 오히려 불편해합니다.`,
  },
  {
    id: "12운성-일지-쇠",
    topics: ["성격", "건강", "연애패턴"],
    when: (f) => ["묘", "절", "태", "병", "사"].includes(f.a.twelve.find((t) => t.pos === "일")?.stage ?? ""),
    weight: 70,
    tag: "12운성",
    text: (f) =>
      `일간이 일지에서 ${f.a.twelve.find((t) => t.pos === "일")!.stage} 자리에 앉았습니다. 겉으로 드러내며 밀어붙이는 방식보다 안에서 조용히 쌓는 방식이 맞는 구조라, 속도를 남과 비교할수록 손해입니다.`,
  },

  /* ───────── 합·충 ───────── */
  {
    id: "일지충",
    topics: ["배우자", "결혼시기", "연애주의", "궁합", "재회"],
    when: (f) => f.a.relations.some((r) => r.kind === "충" && r.between.includes("일")),
    weight: 88,
    tag: "일지관계",
    text: (f) => {
      const r = f.a.relations.find((x) => x.kind === "충" && x.between.includes("일"))!;
      return `배우자 자리인 일지가 ${r.between.filter((b) => b !== "일")[0]}지와 충(${r.chars})을 이룹니다. 관계가 한 번에 정리되거나 크게 방향이 바뀌는 일이 반복되기 쉬운 배치입니다. 나쁜 인연이라는 뜻이 아니라, 흐지부지 이어지지 않고 결론이 분명하게 난다는 뜻으로 보는 편이 맞습니다.`;
    },
  },
  {
    id: "일지합",
    topics: ["배우자", "궁합", "연애패턴"],
    when: (f) => f.a.relations.some((r) => (r.kind === "육합" || r.kind === "삼합") && r.between.includes("일")),
    weight: 84,
    tag: "일지관계",
    text: (f) => {
      const r = f.a.relations.find((x) => (x.kind === "육합" || x.kind === "삼합") && x.between.includes("일"))!;
      return `일지가 ${r.chars} ${r.kind}${eul(r.kind)} 이룹니다. 한번 맺은 관계를 잘 놓지 않는 배치라, 정리해야 할 때도 시간이 오래 걸립니다. 붙잡는 힘이 강한 만큼 끝맺음이 늦습니다.`;
    },
  },
  {
    id: "삼합",
    topics: ["인생흐름", "성격", "전성기"],
    when: (f) => f.a.relations.some((r) => r.kind === "삼합"),
    weight: 82,
    tag: "합국",
    text: (f) => {
      const r = f.a.relations.find((x) => x.kind === "삼합")!;
      const helps = r.el === f.a.useEl;
      return `지지에 ${r.chars} 삼합이 서 있어 ${ELEMENTS[r.el!]} 기운이 통째로 커집니다. ${
        helps
          ? "마침 이 명식이 필요로 하는 기운이라, 이 조합이 작동할 때 흐름이 크게 열립니다."
          : "다만 이 명식에 필요한 기운은 아니라서, 이 조합이 강해질 때 오히려 한쪽으로 쏠립니다."
      }`;
    },
  },
  {
    id: "형",
    topics: ["연애주의", "건강", "인생흐름"],
    when: (f) => f.a.relations.some((r) => r.kind === "형"),
    weight: 62,
    tag: "형",
    text: (f) => {
      const r = f.a.relations.find((x) => x.kind === "형")!;
      return `지지에 ${r.chars} 형이 걸려 있습니다. 같은 지점에서 문제가 되풀이되는 자리로 보는데, 대개 사건 자체보다 그 상황을 다루는 방식이 반복되는 쪽입니다. 미리 알아 두면 세 번째부터는 달라집니다.`;
    },
  },

  /* ───────── 신살 ───────── */
  {
    id: "신살-도화",
    topics: ["매력", "인기", "연애패턴"],
    when: (f) => f.a.sinsal.some((s) => s.name === "도화"),
    weight: 76,
    tag: "신살-도화",
    text: (f) => {
      const s = f.a.sinsal.find((x) => x.name === "도화")!;
      return `${s.where.join("·")}지에 도화가 붙었습니다. ${s.meaning}`;
    },
  },
  {
    id: "신살-역마",
    topics: ["인생흐름", "직업", "연애패턴"],
    when: (f) => f.a.sinsal.some((s) => s.name === "역마"),
    weight: 72,
    tag: "신살-역마",
    text: (f) => {
      const s = f.a.sinsal.find((x) => x.name === "역마")!;
      return `${s.where.join("·")}지에 역마가 붙었습니다. ${s.meaning}`;
    },
  },
  {
    id: "신살-화개",
    topics: ["성격", "인생흐름"],
    when: (f) => f.a.sinsal.some((s) => s.name === "화개"),
    weight: 68,
    tag: "신살-화개",
    text: (f) => {
      const s = f.a.sinsal.find((x) => x.name === "화개")!;
      return `${s.where.join("·")}지에 화개가 붙었습니다. ${s.meaning}`;
    },
  },
  {
    id: "신살-귀인",
    topics: ["인생흐름", "직업", "전성기"],
    when: (f) => f.a.sinsal.some((s) => s.name === "천을귀인"),
    weight: 78,
    tag: "신살-귀인",
    text: (f) => {
      const s = f.a.sinsal.find((x) => x.name === "천을귀인")!;
      return `${s.where.join("·")}지에 천을귀인이 있습니다. ${s.meaning}`;
    },
  },
  {
    id: "신살-공망",
    topics: ["인생흐름", "성격", "재물"],
    when: (f) => f.a.sinsal.some((s) => s.name === "공망"),
    weight: 66,
    tag: "신살-공망",
    text: (f) => {
      const s = f.a.sinsal.find((x) => x.name === "공망")!;
      return `${s.where.join("·")}지가 공망에 듭니다. ${s.meaning}`;
    },
  },
];

/* ───────── 시기 (대운 · 세운) ───────── */
export const timingRules: Rule[] = [
  {
    id: "대운-현재",
    topics: ["인생흐름", "전성기", "직업", "재물", "결혼시기", "연애시기"],
    when: (f) => !!f.luck,
    weight: 93,
    tag: "대운",
    text: (f) => {
      const d = f.luck!;
      const el = ["목", "화", "토", "금", "수"];
      const branchEl = [4, 2, 0, 0, 2, 1, 1, 2, 3, 3, 2, 4][d.branch];
      const good = branchEl === f.a.useEl;
      const bad = branchEl === f.a.avoidEl;
      return `${f.who}${ga(f.who)} 지금 걷고 있는 대운은 ${d.age}세부터 시작된 ${d.ko}입니다. 대운은 10년 단위로 판을 바꾸는 자리라, 이 구간의 성격이 그 사이 벌어지는 일의 바탕이 됩니다. ${
        good
          ? `지지 ${BRANCHES[d.branch]}의 ${el[branchEl]}${ga(el[branchEl])} 이 명식에 필요한 기운이라, 애쓴 것이 결과로 남기 쉬운 10년입니다.`
          : bad
            ? `다만 지지 ${BRANCHES[d.branch]}의 ${el[branchEl]}${eun(el[branchEl])} 이 명식에 부담이 되는 기운이라, 벌이는 것보다 지키고 다듬는 쪽이 유리한 10년입니다.`
            : `지지 ${BRANCHES[d.branch]}${eun(BRANCHES[d.branch])} 크게 돕지도 누르지도 않는 자리라, 이 구간은 본인이 어디에 힘을 싣느냐가 결과를 가릅니다.`
      }`;
    },
  },
  {
    id: "세운-좋은해",
    topics: ["전성기", "인생흐름", "직업", "재물", "결혼시기", "연애시기"],
    when: (f) => f.years.length > 0 && Math.max(...f.years.map((y) => y.score)) >= 62,
    weight: 90,
    tag: "세운",
    text: (f) => {
      const best = [...f.years].sort((a, b) => b.score - a.score).slice(0, 2);
      const worst = [...f.years].sort((a, b) => a.score - b.score)[0];
      return `${f.who} 기준으로 앞으로 10년 중 흐름이 가장 열리는 해는 ${best
        .map((b) => `${b.year}년(${b.ganji}, ${b.score}점)`)
        .join("과 ")}입니다. ${best[0].reasons
        .filter((r) => r.delta > 0)
        .slice(0, 2)
        .map((r) => r.text)
        .join(", ")}${best[0].reasons.some((r) => r.delta > 0) ? " — 이 조건들이 겹치는 해입니다. " : ""}반대로 ${worst.year}년(${worst.ganji}, ${worst.score}점)은 ${
        worst.reasons.filter((r) => r.delta < 0).slice(0, 2).map((r) => r.text).join(", ") || "부담이 겹치는 구간"
      }이라, 큰 결정을 이 해에 몰아 두지 않는 편이 낫습니다.`;
    },
  },
  {
    id: "세운-충년",
    topics: ["연애주의", "인생흐름", "결혼시기"],
    when: (f) => f.years.some((y) => y.clashes.length > 0),
    weight: 74,
    tag: "세운-충",
    text: (f) => {
      const y = f.years.find((x) => x.clashes.length > 0)!;
      return `${f.who}의 경우 ${y.year}년(${y.ganji})에 원국의 ${y.clashes.join("·")}가 충을 맞습니다. 자리가 흔들리는 해라 이동·이직·관계 변화가 겹치기 쉬운데, 미리 알고 맞으면 흔들림의 크기가 확 줄어듭니다.`;
    },
  },
  {
    id: "성별미상",
    topics: ["인생흐름", "전성기"],
    when: (f) => !f.genderKnown,
    weight: 30,
    tag: "한계",
    text: () =>
      `참고로 성별을 밝히지 않으셔서 대운의 진행 방향은 남성 기준으로 계산했습니다. 대운은 성별에 따라 순행과 역행이 갈리므로, 정확히 보시려면 성별을 입력해 주세요.`,
  },
];
