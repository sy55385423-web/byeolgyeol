/** 재물 · 직업 · 건강 — 도메인 규칙 보강.
 *
 *  domains.ts가 각 영역의 뼈대(재성 무게·관식 비교·약한 오행)를 잡는다. 여기서는
 *  그 위에 실제 판단에 쓰이는 자리를 얹는다. 문항이 영역당 아홉 개인데 규칙이
 *  서너 개뿐이라 나머지를 템플릿이 채우고 있었다.
 *
 *  재물   식상생재 / 재성의 길흉 / 재성이 앉은 기둥과 12운성 / 군겁쟁재 / 인다재약 / 대운 재성운
 *  직업   인성·재성 기반 적성 / 관성 부재 / 식상 부재 / 양인·화개 / 대운 관성운 / 일지 12운성
 *  건강   조후(한난조습) / 충이 걸린 자리 / 형 / 일간 총량 / 식상 과다 / 대운 기신 구간
 *
 *  모든 문장이 숫자나 글자를 근거로 댄다. "재물운이 좋습니다" 같은 말은 쓰지 않는다. */

import {
  ELEMENTS, BRANCHES, STEMS, STEM_EL, BRANCH_EL, twelveStage, type ElIdx,
} from "../core/ganji";
import type { Rule, Facts } from "./types";
import { ga, eun, eul, ro } from "./types";

/** 일간 기준 십신 갈래별 오행 */
const els = (d: ElIdx) => ({
  비겁: d,
  식상: ((d + 1) % 5) as ElIdx,
  재성: ((d + 2) % 5) as ElIdx,
  관성: ((d + 3) % 5) as ElIdx,
  인성: ((d + 4) % 5) as ElIdx,
});

/** 월지로 보는 계절 — 조후(調候)의 출발점 */
const season = (b: number) =>
  [2, 3, 4].includes(b) ? "봄" : [5, 6, 7].includes(b) ? "여름" : [8, 9, 10].includes(b) ? "가을" : "겨울";

/** 오행별 장부 */
const ORGAN = ["간·담·눈·근육", "심장·혈관·소장", "위장·비장·소화기", "폐·대장·기관지·피부", "신장·방광·생식기·귀"];
const gods = (f: Facts) => f.a.tenGods.flatMap((t) => [t.stem, t.branch]);
const count = (f: Facts, ...n: string[]) => gods(f).filter((g) => n.includes(g as string)).length;
const has = (f: Facts, n: string) => f.a.sinsal.some((s) => s.name === n);

export const domain2Rules: Rule[] = [
  /* ═══════════ 재물 ═══════════ */
  {
    id: "재물-식상생재",
    topics: ["재물", "직업"],
    when: (f) => f.a.groupWeight.식상 >= 1.2 && f.a.groupWeight.재성 >= 1.2,
    weight: 88,
    tag: "재물-생재",
    text: (f) => {
      const E = els(f.a.dayEl);
      return `식상(${ELEMENTS[E.식상]}) ${f.a.groupWeight.식상.toFixed(1)}, 재성(${ELEMENTS[E.재성]}) ${f.a.groupWeight.재성.toFixed(1)}로 둘 다 실려 있습니다. 식상이 재성을 생하는 식상생재(食傷生財) 구조입니다. 명리에서 돈이 가장 안정적으로 들어오는 배치로 봅니다. 남의 돈을 옮겨 받는 게 아니라 자기가 만들어 낸 것이 값이 되는 방식이라, 기술·콘텐츠·제작처럼 결과물이 남는 일에서 특히 잘 굴러갑니다. 월급만 받는 구조에서는 이 회로가 놀고 있는 셈입니다.`;
    },
  },
  {
    id: "재물-재성길흉",
    topics: ["재물"],
    when: () => true,
    weight: 92,
    tag: "재물-길흉",
    text: (f) => {
      const E = els(f.a.dayEl);
      const jae = E.재성;
      const good = jae === f.a.useEl || jae === f.a.helpEl;
      const bad = jae === f.a.avoidEl;
      return `${f.who}의 용신은 ${ELEMENTS[f.a.useEl]}이고, 돈을 뜻하는 재성은 ${ELEMENTS[jae]}입니다. ${
        good
          ? `재성이 곧 용신 쪽입니다. 돈을 벌수록 몸도 마음도 같이 풀리는 배치라, 아끼는 것보다 버는 쪽으로 움직이는 게 이 명식에는 맞습니다. 돈이 붙는 시기에 다른 일도 같이 잘 풀립니다.`
          : bad
            ? `재성이 기신에 걸립니다. 돈이 들어올수록 오히려 몸이 무거워지고 일이 꼬이는 배치라, 크게 벌리는 방식이 안 맞습니다. 규모를 키우는 것보다 새는 곳을 막고 지키는 쪽이 실제로 더 남습니다. 큰돈이 들어온 뒤에 탈이 나는 패턴이 반복된다면 이 자리 때문입니다.`
            : `재성이 용신도 기신도 아닙니다. 돈 자체가 이 사람의 운을 좌우하지 않는다는 뜻이라, 얼마를 버느냐보다 어떻게 버느냐가 삶의 질을 정합니다.`
      }`;
    },
  },
  {
    id: "재물-재성자리",
    topics: ["재물", "인생흐름"],
    when: (f) => f.a.tenGods.some((t) => t.stem === "정재" || t.stem === "편재" || t.branch === "정재" || t.branch === "편재"),
    weight: 84,
    tag: "재물-자리",
    text: (f) => {
      const seats = f.a.tenGods
        .filter((t) => ["정재", "편재"].includes(t.stem as string) || ["정재", "편재"].includes(t.branch as string))
        .map((t) => t.pos);
      const seat = seats[0];
      const when: Record<string, string> = {
        년: "년주에 놓였습니다. 인생 앞쪽에 재물이 붙는 자리라, 집안의 도움이 있었거나 이른 나이에 돈을 만져 봤을 가능성이 큽니다. 다만 앞에서 쓴 것은 뒤에 다시 쌓아야 합니다",
        월: "월주에 놓였습니다. 월주는 사회 활동의 자리라, 직업을 통해 돈이 들어오는 정통 배치입니다. 부업이나 투자보다 본업을 키우는 쪽이 이 명식에는 훨씬 효율이 좋습니다",
        일: "일주에 놓였습니다. 배우자 자리와 재물 자리가 겹치는 배치라, 결혼과 재물이 서로 얽힙니다. 배우자가 실제로 재물에 영향을 주고, 반대로 돈 문제가 관계에 바로 옮겨붙습니다",
        시: "시주에 놓였습니다. 인생 뒤쪽에 재물이 실리는 자리라, 늦게 자리 잡는 대신 말년이 안정적입니다. 30대에 조급해할 필요가 없는 구조입니다",
      };
      return `재성이 ${seats.join("·")}주에 있습니다. ${when[seat]}.`;
    },
  },
  {
    id: "재물-재성왕쇠",
    topics: ["재물"],
    when: (f) => f.a.tenGods.some((t) => t.branch === "정재" || t.branch === "편재"),
    weight: 76,
    tag: "재물-왕쇠",
    text: (f) => {
      const seat = f.a.tenGods.find((t) => t.branch === "정재" || t.branch === "편재")!;
      const b = f.a.pillars[seat.pos]!.branch;
      const st = twelveStage(f.a.dayStem, b);
      const up = ["장생", "관대", "건록", "제왕"].includes(st);
      return `재성이 앉은 ${seat.pos}지 ${BRANCHES[b]}에서 일간은 ${st} 자리에 놓입니다. ${
        up
          ? `돈을 다루는 자리에서 기운이 오르는 배치입니다. 금액이 커질수록 오히려 판단이 또렷해지는 쪽이라, 큰 건을 맡아도 흔들리지 않습니다.`
          : `돈을 다루는 자리에서 기운이 빠지는 배치입니다. 금액이 커지면 판단이 흐려지기 쉬우니, 큰 결정은 혼자 하지 말고 숫자를 종이에 적어 놓고 하루 묵히는 습관이 이 명식에는 실제로 돈이 됩니다.`
      }`;
    },
  },
  {
    id: "재물-군겁쟁재",
    topics: ["재물", "연애주의"],
    when: (f) => f.a.groupWeight.비겁 >= 2.5 && f.a.groupWeight.재성 < f.a.groupWeight.비겁 / 2,
    weight: 86,
    tag: "재물-쟁재",
    text: (f) =>
      `군겁쟁재(群劫爭財) 구조입니다. 비겁이 ${f.a.groupWeight.비겁.toFixed(1)}로 두꺼운데 재성은 ${f.a.groupWeight.재성.toFixed(1)}에 그칩니다. 나눠 가질 사람은 많은데 나눌 것이 적은 배치라, 동업·공동투자·보증에서 특히 손해가 납니다. 사람이 나쁜 게 아니라 구조가 그렇습니다. 돈과 사람을 같은 자리에 두지 않는 것 하나만 지켜도 이 명식은 크게 달라집니다.`,
  },
  {
    id: "재물-인다재약",
    topics: ["재물", "직업"],
    when: (f) => f.a.groupWeight.인성 >= 2.5 && f.a.groupWeight.식상 < 1,
    weight: 78,
    tag: "재물-인다",
    text: (f) =>
      `인성이 ${f.a.groupWeight.인성.toFixed(1)}로 두꺼운데 식상은 ${f.a.groupWeight.식상.toFixed(1)}에 그칩니다. 인성은 받아들이는 힘, 식상은 내보내는 힘입니다. 들어오는 문은 넓은데 나가는 문이 좁은 배치라, 아는 것과 배운 것에 비해 실제로 만들어 낸 결과가 적습니다. 돈은 아는 만큼이 아니라 내놓은 만큼 붙습니다. 완성도를 낮추더라도 밖으로 내보내는 횟수를 늘리는 쪽이 이 명식에는 정확한 처방입니다.`,
  },
  {
    id: "재물-대운재성",
    topics: ["재물", "전성기"],
    when: (f) => !!f.luck,
    weight: 82,
    tag: "재물-대운",
    text: (f) => {
      const E = els(f.a.dayEl);
      const l = f.luck!;
      const now = new Date().getFullYear() - f.chart.birthYear + 1;
      const inNow = STEM_EL[l.stem] === E.재성 || BRANCH_EL[l.branch] === E.재성;
      const next = (f.chart.luck?.list ?? []).find(
        (d) => d.age > now && (STEM_EL[d.stem] === E.재성 || BRANCH_EL[d.branch] === E.재성),
      );
      return `재물은 대운으로 판이 깔립니다. 재성 ${ELEMENTS[E.재성]} 기준으로 보면, ${
        inNow
          ? `지금 걷는 ${l.ko} 대운(${l.age}~${l.age + 9}세)에 재성이 들어 있습니다. 돈이 실제로 움직이는 10년이라, 벌이든 투자든 이 구간에 벌여 두는 것이 뒤로 남습니다.`
          : next
            ? `지금 ${l.ko} 대운(${l.age}~${l.age + 9}세)에는 재성이 없습니다. 재성이 들어오는 다음 구간은 ${next.age}세부터의 ${next.ko} 대운입니다. 그 전까지는 크게 벌리기보다 실력과 자본을 모아 두는 편이 유리합니다.`
            : `앞으로의 대운 어디에도 재성이 실려 오지 않습니다. 십 년 단위로 판이 바뀌길 기다리는 방식은 이 명식에 안 맞습니다. 해마다 오는 세운에서 좋은 해를 골라 쌓아 올리는 쪽이 정확합니다.`
      }`;
    },
  },

  /* ═══════════ 직업 ═══════════ */
  {
    id: "직업-인성기반",
    topics: ["직업"],
    when: (f) => f.a.groupWeight.인성 >= 2,
    weight: 84,
    tag: "직업-인성",
    text: (f) =>
      `인성이 ${f.a.groupWeight.인성.toFixed(1)}로 실려 있습니다. 인성은 자격·문서·배움의 자리입니다. 이 명식은 자격증이나 학위처럼 종이로 증명되는 것이 실제 수입으로 이어집니다. 반대로 아무 근거 없이 몸으로 부딪히는 일에서는 남들만큼 성과가 안 납니다. 커리어가 막혔다고 느낄 때 이 사람이 손대야 할 것은 이직이 아니라 자격입니다.`,
  },
  {
    id: "직업-재성기반",
    topics: ["직업"],
    when: (f) => f.a.groupWeight.재성 >= 2 && f.a.groupWeight.재성 > f.a.groupWeight.인성,
    weight: 84,
    tag: "직업-재성",
    text: (f) =>
      `재성이 ${f.a.groupWeight.재성.toFixed(1)}로 인성(${f.a.groupWeight.인성.toFixed(1)})보다 무겁습니다. 재성은 실물과 숫자를 다루는 자리입니다. 이론을 정리하는 일보다 실제로 사고팔고 굴리는 일, 결과가 숫자로 찍히는 일에서 힘이 붙습니다. 영업·유통·금융·자영업 쪽이 여기 해당합니다. 자격증을 늘리는 것보다 거래를 늘리는 쪽이 이 명식에는 빠릅니다.`,
  },
  {
    id: "직업-관성없음",
    topics: ["직업", "인생흐름"],
    when: (f) => f.a.groupWeight.관성 < 0.6,
    weight: 86,
    tag: "직업-무관",
    text: (f) =>
      `관성이 ${f.a.groupWeight.관성.toFixed(1)}로 거의 없습니다. 관성은 나를 눌러 자리를 잡아 주는 틀입니다. 이게 얇으면 조직의 규칙이 유독 불편하게 느껴집니다. 참을성이 없어서가 아니라 눌러 줄 자리가 명식에 없어서입니다. 큰 조직에서 오래 버티는 방식은 이 사람에게 비용이 큽니다. 대신 스스로 마감과 규칙을 만들어 두면 그 자리를 대신할 수 있습니다.`,
  },
  {
    id: "직업-식상없음",
    topics: ["직업", "매력"],
    when: (f) => f.a.groupWeight.식상 < 0.6,
    weight: 80,
    tag: "직업-무식",
    text: (f) =>
      `식상이 ${f.a.groupWeight.식상.toFixed(1)}로 거의 없습니다. 식상은 밖으로 내놓는 힘, 곧 표현과 영업의 자리입니다. 이게 없으면 실력이 있어도 알려지는 속도가 느립니다. 일 자체는 잘하는데 평가가 늦게 따라오는 패턴이 반복됩니다. 이 명식은 결과물을 남이 대신 말해 주는 구조 — 팀, 에이전트, 기록 — 를 만들어 두는 것이 실력을 올리는 것만큼 중요합니다.`,
  },
  {
    id: "직업-양인",
    topics: ["직업", "건강"],
    when: (f) => has(f, "양인"),
    weight: 74,
    tag: "직업-양인",
    text: (f) => {
      const s = f.a.sinsal.find((x) => x.name === "양인")!;
      return `${s.where.join("·")}지에 양인(羊刃)이 있습니다. 칼과 날의 기운입니다. 결단이 필요한 자리, 남들이 망설이는 순간에 손이 나가는 일에서 이 힘이 제값을 합니다. 의료·기술·수사·현장직처럼 정확도와 결단이 동시에 필요한 쪽이 여기 해당합니다. 반대로 눈치와 조율이 핵심인 자리에서는 이 기운이 계속 부딪힙니다.`;
    },
  },
  {
    id: "직업-대운관성",
    topics: ["직업", "전성기"],
    when: (f) => !!f.luck,
    weight: 81,
    tag: "직업-대운",
    text: (f) => {
      const E = els(f.a.dayEl);
      const l = f.luck!;
      const now = new Date().getFullYear() - f.chart.birthYear + 1;
      const inNow = STEM_EL[l.stem] === E.관성 || BRANCH_EL[l.branch] === E.관성;
      const next = (f.chart.luck?.list ?? []).find(
        (d) => d.age > now && (STEM_EL[d.stem] === E.관성 || BRANCH_EL[d.branch] === E.관성),
      );
      return `직함과 자리는 관성이 쥡니다. 이 명식의 관성은 ${ELEMENTS[E.관성]}입니다. ${
        inNow
          ? `지금 ${l.ko} 대운(${l.age}~${l.age + 9}세)에 관성이 들어 있습니다. 책임이 무거워지는 대신 자리가 올라가는 10년입니다. 이 구간에 맡겨지는 일은 웬만하면 받는 편이 뒤에 남습니다.`
          : next
            ? `관성이 들어오는 구간은 ${next.age}세부터의 ${next.ko} 대운입니다. 지금(${l.ko} 대운)은 자리보다 실력을 쌓는 시기라, 승진이 더디다고 느껴도 방향이 틀린 게 아닙니다.`
            : `앞으로 직함을 밀어 주는 대운이 보이지 않습니다. 조직이 자리를 만들어 주기를 기다리는 방식보다, 자기 이름으로 쌓아 그 이름이 곧 직함이 되게 하는 쪽이 이 명식의 길입니다.`
      }`;
    },
  },
  {
    id: "직업-일지기세",
    topics: ["직업", "인생흐름"],
    when: () => true,
    weight: 70,
    tag: "직업-기세",
    text: (f) => {
      const b = f.a.pillars.일!.branch;
      const st = twelveStage(f.a.dayStem, b);
      const early = ["장생", "목욕", "관대", "건록"].includes(st);
      return `일간이 일지 ${BRANCHES[b]}에서 ${st}에 놓입니다. 12운성은 기운의 사이클을 열두 단계로 본 것인데, ${
        early
          ? `${st}${eun(st)} 올라가는 구간에 속합니다. 일을 시작하고 벌이는 데 힘이 실리는 쪽이라, 이미 굴러가는 판을 지키는 자리보다 새로 여는 자리에서 값이 매겨집니다.`
          : `${st}${eun(st)} 내려가거나 안으로 접히는 구간에 속합니다. 새로 벌이기보다 있는 것을 다듬고 완성하는 데 힘이 실리는 쪽이라, 창업보다 전문성으로 승부하는 자리가 맞습니다.`
      }`;
    },
  },

  /* ═══════════ 건강 ═══════════ */
  {
    id: "건강-조후",
    topics: ["건강", "성격"],
    when: () => true,
    weight: 87,
    tag: "건강-조후",
    text: (f) => {
      const mb = f.a.pillars.월!.branch;
      const se = season(mb);
      const hwa = f.a.elementWeight[1], su = f.a.elementWeight[4];
      const cold = se === "겨울" || (se === "가을" && su > hwa);
      const hot = se === "여름" || (se === "봄" && hwa > su);
      return `태어난 달의 지지가 ${BRANCHES[mb]}, ${se}입니다. 명리에서 조후(調候)라 부르는 자리로, 몸의 기본 온도를 정합니다. 이 명식의 화 기운은 ${hwa.toFixed(1)}, 수 기운은 ${su.toFixed(1)}입니다. ${
        cold
          ? `찬 쪽으로 기웁니다. 몸이 식으면 회복이 느려지는 체질이라, 겨울과 새벽에 컨디션이 크게 떨어집니다. 따뜻한 것을 몸에 넣는 습관 — 찬 음료를 줄이고 아랫배와 발을 덥게 하는 것 — 이 이 명식에는 영양제보다 효과가 큽니다.`
          : hot
            ? `더운 쪽으로 기웁니다. 열이 위로 몰리는 체질이라 잠이 얕고, 스트레스가 두통·눈·피부로 먼저 나옵니다. 여름과 밤에 특히 그렇습니다. 몸을 식히고 수분을 채우는 쪽이 맞고, 자기 전 화면을 보는 습관이 이 명식에는 유독 손해가 큽니다.`
            : `치우치지 않은 편입니다. 계절을 크게 타지 않는 체질이라, 문제는 온도보다 리듬에서 옵니다. 자는 시간이 흔들릴 때 가장 먼저 무너집니다.`
      }`;
    },
  },
  {
    id: "건강-충자리",
    topics: ["건강"],
    when: (f) => f.a.relations.some((r) => r.kind === "충"),
    weight: 83,
    tag: "건강-충",
    text: (f) => {
      const r = f.a.relations.find((x) => x.kind === "충")!;
      const [p1, p2] = r.between;
      const b1 = f.a.pillars[p1]!.branch, b2 = f.a.pillars[p2]!.branch;
      const e1 = BRANCH_EL[b1], e2 = BRANCH_EL[b2];
      return `${p1}지 ${BRANCHES[b1]}${wa2(BRANCHES[b1])} ${p2}지 ${BRANCHES[b2]}${ga(BRANCHES[b2])} 충합니다(${r.chars}). 충은 두 기운이 정면으로 부딪히는 자리인데, 몸에서는 그 오행이 맡은 부위에 먼저 신호가 옵니다. 여기서는 ${ELEMENTS[e1]}(${ORGAN[e1]})${wa2(ELEMENTS[e1])} ${ELEMENTS[e2]}(${ORGAN[e2]}) 쪽입니다. 평소에는 티가 안 나다가 무리한 시기에 이 부위부터 무너지는 패턴이 반복됩니다.`;
    },
  },
  {
    id: "건강-형",
    topics: ["건강", "연애주의"],
    when: (f) => f.a.relations.some((r) => r.kind === "형"),
    weight: 75,
    tag: "건강-형",
    text: (f) => {
      const r = f.a.relations.find((x) => x.kind === "형")!;
      return `${r.between.join("·")}지에 형(刑)이 걸립니다(${r.chars}). 형은 충처럼 한 번에 깨지는 게 아니라 안에서 서서히 갈리는 자리로 봅니다. 몸으로는 만성적인 통증이나 반복되는 염증처럼 오래 끄는 형태로 나오고, 관계에서는 같은 문제로 계속 부딪히는 형태로 나옵니다. 급성보다 만성을 조심해야 하는 명식입니다.`;
    },
  },
  {
    id: "건강-체력총량",
    topics: ["건강"],
    when: () => true,
    weight: 85,
    tag: "건강-총량",
    text: (f) => {
      const sup = f.a.groupWeight.비겁 + f.a.groupWeight.인성;
      const drain = f.a.groupWeight.식상 + f.a.groupWeight.재성 + f.a.groupWeight.관성;
      return `일간을 받쳐 주는 힘이 ${sup.toFixed(1)}, 빼 가는 힘이 ${drain.toFixed(1)}입니다(강약 ${f.a.strengthScore}점, ${f.a.strong ? "신강" : "신약"}). ${
        f.a.strong
          ? `체력의 총량이 큰 쪽입니다. 웬만해선 안 지치는 대신, 지쳤다는 신호를 늦게 알아챕니다. 남들이 쉬는 지점에서 계속 밀어붙이다가 한 번에 크게 무너지는 형태라, 이 명식에는 "피곤하면 쉰다"가 아니라 "정해 둔 시간에 쉰다"가 맞습니다.`
          : `체력의 총량이 크지 않은 쪽입니다. 몰아서 쓰면 회복에 남들보다 오래 걸립니다. 대신 신호가 일찍 오는 편이라, 그 신호를 무시하지만 않으면 큰 병으로 가지 않습니다. 밤을 새워 만회하는 방식이 이 명식에는 가장 비쌉니다.`
      }`;
    },
  },
  {
    id: "건강-식상과다",
    topics: ["건강"],
    when: (f) => f.a.groupWeight.식상 >= 2.5 && !f.a.strong,
    weight: 77,
    tag: "건강-소모",
    text: (f) => {
      const E = els(f.a.dayEl);
      return `식상이 ${f.a.groupWeight.식상.toFixed(1)}로 두꺼운데 일간은 받쳐 주는 힘이 얇습니다(${f.a.strengthScore}점). 식상은 밖으로 내보내는 자리라, 이 배치는 늘 자기 그릇보다 많이 쏟아붓는 구조입니다. 재미있어서 하는 일에서 특히 그렇습니다. 하고 나면 좋은데 그다음 이삼 일이 무너지는 패턴이 반복된다면 이 자리 때문입니다. ${ELEMENTS[E.식상]}(${ORGAN[E.식상]}) 쪽에 먼저 신호가 옵니다.`;
    },
  },
  {
    id: "건강-대운기신",
    topics: ["건강", "대운"],
    when: (f) => !!f.luck,
    weight: 79,
    tag: "건강-대운",
    text: (f) => {
      const l = f.luck!;
      const se = STEM_EL[l.stem], be = BRANCH_EL[l.branch];
      const bad = se === f.a.avoidEl || be === f.a.avoidEl;
      const now = new Date().getFullYear() - f.chart.birthYear + 1;
      const nextBad = (f.chart.luck?.list ?? []).find(
        (d) => d.age > now && (STEM_EL[d.stem] === f.a.avoidEl || BRANCH_EL[d.branch] === f.a.avoidEl),
      );
      return `건강도 대운을 탑니다. 이 명식의 기신은 ${ELEMENTS[f.a.avoidEl]}(${ORGAN[f.a.avoidEl]})입니다. ${
        bad
          ? `지금 걷는 ${l.ko} 대운(${l.age}~${l.age + 9}세)에 그 기운이 들어 있습니다. 같은 생활을 해도 회복이 더딘 10년이라, 검진 주기를 평소보다 짧게 잡는 것만으로 차이가 큽니다.`
          : nextBad
            ? `지금 ${l.ko} 대운에는 기신이 직접 들지 않습니다. 기신이 들어오는 구간은 ${nextBad.age}세부터의 ${nextBad.ko} 대운이라, 그 무렵부터 관리의 기준을 한 단계 올려 두면 됩니다.`
            : `부담이 되는 기운이 대운으로 크게 들어오는 자리는 없습니다. 십 년 단위로 몸이 크게 꺾이는 자리는 안 보인다는 뜻이라, 큰 걱정보다 해마다의 컨디션 관리로 충분합니다.`
      }`;
    },
  },
];

/** 와/과 — 이 파일에서만 쓰는 지역 헬퍼 */
function wa2(w: string) {
  const c = w.charCodeAt(w.length - 1);
  return (c - 0xac00) % 28 !== 0 ? "과" : "와";
}
