/** 남녀에 따라 갈리는 자리 — 배우자성(配偶星)으로 연애를 읽는다.
 *
 *  명리에서 이성운을 보는 자리는 성별로 완전히 갈린다.
 *    남명(男命)  재성(편재·정재)이 여자 — 내가 극해서 갖는 것
 *    여명(女命)  관성(편관·정관)이 남자 — 나를 극해서 나를 잡아 주는 것
 *
 *  그래서 같은 명식이라도 성별이 바뀌면 연애 해석이 통째로 달라진다. 예전에는
 *  이 사실이 "배우자" 주제 규칙 두어 개에만 걸려 있어서, 성별을 바꿔도 연애
 *  리포트가 9%밖에 안 달라졌다. 매력·끌림·인기·연애패턴에서도 이 자리를 읽는다.
 *
 *  여기서 보는 것
 *    배우자성의 무게        이성이 삶에 차지하는 비중 (숫자로 낸다)
 *    배우자성이 용신인가     이성운이 나에게 득인지 실인지 — 가장 크게 갈리는 자리
 *    일간이 감당하는가       남명 재다신약 / 여명 관살혼잡
 *    배우자성을 치는 자리     남명 비겁(경쟁자) / 여명 식상(남편을 누름)
 *    배우자성의 공망         있어도 손에 안 잡히는 배치
 *
 *  ⚠️ 이 분류는 전통 명리의 통설이다. 성별을 모르면(genderKnown false) 전부
 *  걸리지 않게 둔다. 틀린 전제로 쓴 문장보다 없는 편이 낫다. */

import {
  ELEMENTS, BRANCHES, STEM_EL, BRANCH_EL, twelveStage, branchSix, branchClash, type ElIdx,
} from "../core/ganji";
import type { Rule, Facts } from "./types";
import { ga, eun, eul, ro } from "./types";

/** 이 사람에게 배우자를 뜻하는 십신 갈래와 그 오행. */
function spouse(f: Facts) {
  const male = f.isMale;
  const group = male ? ("재성" as const) : ("관성" as const);
  const el = ((male ? f.a.dayEl + 2 : f.a.dayEl + 3) % 5) as ElIdx;
  return {
    male,
    group,
    el,
    weight: f.a.groupWeight[group],
    /** 배우자성을 치는 자리 — 남명은 비겁이 재성을 나눠 갖고, 여명은 식상이 관성을 친다 */
    rivalGroup: male ? ("비겁" as const) : ("식상" as const),
    rivalWeight: f.a.groupWeight[male ? "비겁" : "식상"],
    word: male ? "여자" : "남자",
    myung: male ? "남명" : "여명",
  };
}

const has = (f: Facts, n: string) => f.a.sinsal.find((s) => s.name === n);
const godsOf = (f: Facts) => f.a.tenGods.flatMap((t) => [t.stem, t.branch]);

export const genderRules: Rule[] = [
  /* ───────── 배우자성의 무게 — 이성이 삶에서 차지하는 비중 ───────── */
  {
    id: "성-배우자성무게",
    topics: ["연애패턴", "매력", "배우자"],
    when: (f) => f.genderKnown,
    weight: 90,
    tag: "성-무게",
    prefer: ["총 연애 횟수"],
    text: (f) => {
      const s = spouse(f);
      const total = Object.values(f.a.groupWeight).reduce((a, b) => a + b, 0);
      const pct = Math.round((s.weight / total) * 100);
      const heavy = s.weight >= 2.2, thin = s.weight < 1;
      return `${s.myung}에서 이성을 보는 자리는 ${s.group}(${ELEMENTS[s.el]})입니다. ${f.who}의 여덟 글자에서 ${s.group}${eun(s.group)} ${s.weight.toFixed(1)}, 전체의 ${pct}%를 차지합니다. ${
        heavy
          ? `다섯 갈래 중에서도 무거운 쪽이라, 인생에서 ${s.word} 문제가 차지하는 비중이 실제로 큽니다. 좋을 때도 나쁠 때도 관계가 삶 전체를 흔듭니다. 연애를 인생의 한 부분으로 묶어 두는 훈련이 이 명식에는 필요합니다.`
          : thin
            ? `얇은 쪽입니다. 관계가 삶의 중심에 오래 머물지 않는 배치라, 혼자 있는 시간이 남들만큼 괴롭지 않습니다. 인연이 없는 게 아니라 인연에 삶을 걸지 않는 구조입니다. 대신 관계를 키우려면 의식적으로 시간을 내야 합니다.`
            : `치우치지 않은 무게입니다. 연애가 삶을 삼키지도, 뒷전으로 밀리지도 않는 배치라 균형을 잡기 쉬운 쪽입니다.`
      }`;
    },
  },
  {
    id: "성-배우자성길흉",
    topics: ["끌림", "연애패턴", "배우자", "연애주의"],
    when: (f) => f.genderKnown,
    weight: 93,
    tag: "성-길흉",
    prefer: ["어떤 사람에게 끌릴까"],
    text: (f) => {
      const s = spouse(f);
      const good = s.el === f.a.useEl || s.el === f.a.helpEl;
      const bad = s.el === f.a.avoidEl;
      return `여기가 연애에서 가장 크게 갈리는 자리입니다. ${f.who}의 용신은 ${ELEMENTS[f.a.useEl]}이고, 이성을 뜻하는 ${s.group}${eun(s.group)} ${ELEMENTS[s.el]}입니다. ${
        good
          ? `이성운이 곧 용신운입니다. ${s.word}가 들어올 때 사람도 일도 같이 풀리는 배치라, 연애를 미루는 것이 실제로 손해입니다. 이 명식은 혼자 애쓰는 것보다 좋은 사람 옆에 서는 편이 훨씬 빠릅니다.`
          : bad
            ? `이성운이 기신에 걸립니다. 관계가 깊어질수록 몸이 무거워지고 일이 밀리는 배치라, 연애 자체가 나쁘다는 게 아니라 ${s.word}에게 기대는 방식이 안 맞는다는 뜻입니다. 각자의 자리를 지키는 관계라야 오래갑니다. 상대에게 삶을 옮겨 심으면 반드시 탈이 납니다.`
            : `이성운이 용신도 기신도 아닙니다. 관계가 삶을 크게 밀어 주지도, 발목을 잡지도 않는 배치라, 결과가 상대에 따라 크게 달라집니다. 누구를 만나느냐가 유독 중요한 명식입니다.`
      }`;
    },
  },

  /* ───────── 일간이 배우자성을 감당하는가 ───────── */
  {
    id: "성-재다신약",
    topics: ["연애주의", "연애패턴", "재물"],
    when: (f) => f.genderKnown && f.isMale && f.a.groupWeight.재성 >= 2 && !f.a.strong,
    weight: 87,
    tag: "성-감당",
    prefer: ["연애에서 주의할 점"],
    text: (f) =>
      `재다신약(財多身弱) 구조입니다. 재성이 ${f.a.groupWeight.재성.toFixed(1)}로 두꺼운데 일간을 받쳐 주는 힘은 ${(f.a.groupWeight.비겁 + f.a.groupWeight.인성).toFixed(1)}에 그칩니다(강약 ${f.a.strengthScore}점). 남명에서 재성은 여자이자 돈인데, 그 둘이 다 감당할 수 있는 크기를 넘어섭니다. 좋은 인연이 와도 끝까지 쥐기가 어렵고, 관계에서 쓰는 에너지가 유독 큽니다. 눈앞의 사람에게 전부를 걸기보다 자기 축을 먼저 세우는 순서가 이 명식에는 맞습니다.`,
  },
  {
    id: "성-관살혼잡",
    topics: ["연애주의", "연애패턴", "배우자"],
    when: (f) => {
      if (!f.genderKnown || f.isMale) return false;
      const g = godsOf(f);
      return g.includes("정관") && g.includes("편관");
    },
    weight: 87,
    tag: "성-감당",
    prefer: ["연애에서 주의할 점"],
    text: (f) => {
      const g = godsOf(f);
      const jeong = g.filter((x) => x === "정관").length;
      const pyeon = g.filter((x) => x === "편관").length;
      return `관살혼잡(官殺混雜)입니다. 여명에서 남자를 보는 관성이 정관 ${jeong}개, 편관 ${pyeon}개로 섞여 있습니다. 성격이 다른 두 종류의 남자가 명식 안에 같이 앉은 배치라, 반듯한 사람과 자극적인 사람 사이에서 마음이 오갑니다. 한쪽을 고르고 나서도 다른 쪽이 눈에 밟히는 구조입니다. 나쁜 명식이라는 뜻이 아니라, 기준을 남이 아니라 자기 안에서 세워야 흔들림이 줄어든다는 뜻입니다.`;
    },
  },

  /* ───────── 배우자성을 치는 자리 ───────── */
  {
    id: "성-경쟁자",
    topics: ["연애주의", "연애패턴", "인기"],
    when: (f) => f.genderKnown && spouse(f).rivalWeight >= 2,
    weight: 82,
    tag: "성-경쟁",
    prefer: ["안 되는 사람의 특징"],
    text: (f) => {
      const s = spouse(f);
      return s.male
        ? `비겁이 ${s.rivalWeight.toFixed(1)}로 실려 있습니다. 남명에서 비겁은 재성을 나눠 갖는 자리, 곧 같은 사람을 두고 겨루는 자리입니다. 마음에 든 상대에게 이미 다른 사람이 있거나, 친구와 취향이 겹치는 일이 남들보다 잦습니다. 먼저 표현하지 않으면 놓치는 구조라, 재는 동안 결판이 나 버립니다.`
        : `식상이 ${s.rivalWeight.toFixed(1)}로 실려 있습니다. 여명에서 식상은 관성을 치는 자리, 곧 남자를 누르는 자리입니다. 하고 싶은 말을 참지 못하는 쪽이라 표현이 시원한 대신, 상대의 방식에 자꾸 손을 대게 됩니다. 상대를 고치려는 순간부터 관계가 어려워지는 명식입니다. 말의 양보다 말의 순서를 조절하는 게 관건입니다.`;
    },
  },
  {
    id: "성-배우자성공망",
    topics: ["연애주의", "배우자", "끌림"],
    when: (f) => {
      if (!f.genderKnown) return false;
      const s = spouse(f);
      const voids = f.chart.voidBranches ?? [];
      return f.a.tenGods.some(
        (t) => (t.branch === (s.male ? "편재" : "편관") || t.branch === (s.male ? "정재" : "정관")) &&
          voids.includes(BRANCHES[f.a.pillars[t.pos]!.branch]),
      );
    },
    weight: 80,
    tag: "신살-공망",
    text: (f) => {
      const s = spouse(f);
      return `이성을 뜻하는 ${s.group}이 공망(空亡) 자리에 앉았습니다. 있는데 손에 안 잡히는 배치입니다. 인연이 없는 게 아니라, 기대한 만큼 채워지지 않는 느낌이 반복됩니다. 조건이 좋은 관계에서도 허전함이 남고, 그 허전함을 상대 탓으로 돌리면 관계가 계속 짧아집니다. 이 명식은 관계에서 채우려 하기보다 관계 밖에 자기 자리를 하나 더 두는 편이 훨씬 편합니다.`;
    },
  },

  /* ───────── 배우자성의 12운성 ───────── */
  {
    id: "성-배우자성왕쇠",
    topics: ["매력", "배우자", "인기"],
    when: (f) => f.genderKnown && f.a.tenGods.some((t) => t.branch === (f.isMale ? "정재" : "정관") || t.branch === (f.isMale ? "편재" : "편관")),
    weight: 78,
    tag: "성-왕쇠",
    text: (f) => {
      const s = spouse(f);
      const seat = f.a.tenGods.find(
        (t) => t.branch === (s.male ? "정재" : "정관") || t.branch === (s.male ? "편재" : "편관"),
      )!;
      const b = f.a.pillars[seat.pos]!.branch;
      const st = twelveStage(f.a.dayStem, b);
      const strong = ["장생", "관대", "건록", "제왕"].includes(st);
      return `${seat.pos}지 ${BRANCHES[b]}${ga(BRANCHES[b])} ${s.group}이 되는 자리인데, 일간이 여기서 ${st}에 놓입니다. ${
        strong
          ? `기운이 오른 자리에 이성운이 앉았습니다. ${s.word}를 만나는 자리에서 ${f.who}${ga(f.who)} 위축되지 않고 자기 모습으로 서는 배치라, 관계에서 주도권을 쥐기 쉽습니다. 다만 그 힘이 지나치면 상대가 맞추는 쪽이 됩니다.`
          : `힘이 빠지는 자리에 이성운이 앉았습니다. 좋아하는 사람 앞에서 유독 작아지고, 평소의 판단력이 잘 안 나옵니다. 성격 문제가 아니라 자리의 문제라, 중요한 결정은 상대와 떨어져 있을 때 내리는 편이 안전합니다.`
      }`;
    },
  },

  /* ───────── 대운 — 지금 구간이 연애에 어떤 판을 까는가 ───────── */
  {
    id: "성-대운배우자성",
    topics: ["연애시기", "연애패턴", "끌림"],
    when: (f) => f.genderKnown && !!f.luck,
    weight: 89,
    tag: "성-대운",
    prefer: ["연애운이 가장 좋은 시기"],
    text: (f) => {
      const s = spouse(f);
      const l = f.luck!;
      const hit = STEM_EL[l.stem] === s.el || BRANCH_EL[l.branch] === s.el;
      const now = new Date().getFullYear() - f.chart.birthYear + 1;
      const nextHit = (f.chart.luck?.list ?? []).find(
        (d) => d.age > now && (STEM_EL[d.stem] === s.el || BRANCH_EL[d.branch] === s.el),
      );
      return `지금 걷는 대운은 ${l.age}세부터 ${l.age + 9}세의 ${l.ko}입니다. ${
        hit
          ? `이 안에 이성을 뜻하는 ${ELEMENTS[s.el]}${ga(ELEMENTS[s.el])} 들어 있습니다. 10년 내내 사람이 붙는 판이 깔린 구간이라, 지금 움직인 만큼 결과가 납니다. 이런 구간이 평생 두세 번뿐이라는 걸 생각하면 미룰 이유가 없습니다.`
          : nextHit
            ? `여기에는 이성을 뜻하는 ${ELEMENTS[s.el]}${ga(ELEMENTS[s.el])} 없습니다. 인연이 아예 없다는 뜻이 아니라, 판이 밀어 주지 않아 본인이 움직인 만큼만 생긴다는 뜻입니다. ${ELEMENTS[s.el]}${ga(ELEMENTS[s.el])} 들어오는 다음 구간은 ${nextHit.age}세부터의 ${nextHit.ko} 대운입니다.`
            : `여기에는 이성을 뜻하는 ${ELEMENTS[s.el]}${ga(ELEMENTS[s.el])} 없고, 남은 대운에도 직접 들어오는 구간이 없습니다. 관계가 대운에 실려 오지 않는 명식이라, 시기를 기다리는 방식은 이 사람에게 맞지 않습니다. 세운(해)과 월운으로 잡는 편이 정확합니다.`
      }`;
    },
  },
  {
    id: "성-대운일지",
    topics: ["연애시기", "배우자", "결혼시기"],
    when: (f) => {
      if (!f.luck) return false;
      const b = f.a.pillars.일!.branch;
      return branchSix(b, f.luck.branch) || branchClash(b, f.luck.branch);
    },
    weight: 85,
    tag: "대운-일지",
    prefer: ["결혼 예상 나이"],
    text: (f) => {
      const b = f.a.pillars.일!.branch;
      const six = branchSix(b, f.luck!.branch);
      return `지금 대운의 지지 ${BRANCHES[f.luck!.branch]}${ga(BRANCHES[f.luck!.branch])} 배우자 자리인 일지 ${BRANCHES[b]}${eul(BRANCHES[b])} ${six ? "육합으로 묶습니다" : "충으로 흔듭니다"}. ${
        six
          ? `배우자궁이 직접 묶이는 10년이라, 이 구간에 만난 사람과 관계가 실제로 정해지는 경우가 많습니다. 결혼·동거처럼 자리를 합치는 결정이 이 안에서 납니다. ${f.luck!.age}세부터 ${f.luck!.age + 9}세 사이가 그 구간입니다.`
          : `배우자궁이 흔들리는 10년입니다. 있던 관계가 정리되거나 사는 자리가 바뀌는 일이 이 안에 몰립니다(${f.luck!.age}~${f.luck!.age + 9}세). 흔들림 자체를 막을 수는 없으니, 흔들릴 때 무엇을 남길지 미리 정해 두는 편이 낫습니다.`
      }`;
    },
  },
  {
    id: "성-대운용신연애",
    topics: ["연애시기", "연애주의"],
    when: (f) => !!f.luck,
    weight: 76,
    tag: "성-대운온도",
    text: (f) => {
      const l = f.luck!;
      const se = STEM_EL[l.stem], be = BRANCH_EL[l.branch];
      const good = se === f.a.useEl || be === f.a.useEl || se === f.a.helpEl || be === f.a.helpEl;
      const bad = se === f.a.avoidEl || be === f.a.avoidEl;
      return `같은 사람을 만나도 대운에 따라 결과가 달라집니다. ${l.ko} 대운은 용신 ${ELEMENTS[f.a.useEl]} 기준으로 ${
        good
          ? `순풍 쪽입니다(${ELEMENTS[se]}·${ELEMENTS[be]}). 이 구간에 시작한 관계는 무리 없이 굴러가고, 판단도 평소보다 정확합니다. 큰 결정을 내리기에 나쁘지 않은 자리입니다.`
          : bad
            ? `역풍 쪽입니다(${ELEMENTS[se]}·${ELEMENTS[be]}${ga(ELEMENTS[be])} 부담). 이 구간에는 사람이 안 들어오는 게 아니라, 판단이 흐려집니다. 평소라면 안 골랐을 사람을 고르기 쉬우니 조건보다 자기 상태를 먼저 보는 편이 안전합니다.`
            : `중립입니다(${ELEMENTS[se]}·${ELEMENTS[be]}). 밀어 주지도 막지도 않으니, 이 구간의 관계는 명식보다 본인의 선택이 결과를 정합니다.`
      }`;
    },
  },
];
