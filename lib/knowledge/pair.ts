/** 궁합 · 재회 규칙 — 두 명식의 관계를 실제로 대조한다.
 *
 *  한 사람씩 따로 설명하고 끝내면 궁합이 아니다. 여기서는 두 명식 사이에서만 나오는 것을 본다.
 *    일간끼리   상생·상극·비화 — 관계의 기본 온도
 *    일지끼리   합·충 — 배우자궁끼리 붙는가 부딪히는가
 *    용신 교환  상대가 내 용신을 갖고 있는가 (실제 궁합에서 가장 크게 보는 자리)
 *    강약 조합  둘 다 강하면 부딪히고, 한쪽이 약하면 기울고, 둘 다 약하면 서로 못 받쳐 준다
 *    십신 관계  상대가 나에게 어떤 십신으로 오는가
 *
 *  ⚠️ 궁합은 "좋다·나쁘다"로 끊는 게 가장 위험한 영역이다. 여기서는 어느 자리가 잘 맞고
 *  어느 자리가 어긋나는지를 나눠 말하고, 총점으로 사람을 판정하지 않는다. */

import { ELEMENTS, BRANCHES, STEMS, STEM_EL, branchClash, branchSix, tenGod } from "../core/ganji";
import type { Rule, Facts } from "./types";
import { ga, eun, eul, wa, ro } from "./types";

const rel = (a: number, b: number) =>
  a === b ? "비화" : (a + 1) % 5 === b ? "생나→상대" : (b + 1) % 5 === a ? "생상대→나" : (a + 2) % 5 === b ? "극나→상대" : "극상대→나";

export const pairRules: Rule[] = [
  {
    id: "궁합-일간관계",
    topics: ["궁합", "재회"],
    when: (f) => !!f.other,
    weight: 97,
    tag: "궁합-일간",
    text: (f) => {
      const me = f.a.dayEl, pt = f.other!.a.dayEl;
      const r = rel(me, pt);
      const desc: Record<string, string> = {
        비화: `두 사람의 일간이 같은 ${ELEMENTS[me]} 기운입니다. 말이 잘 통하고 서로를 빨리 이해하는 대신, 같은 걸 원할 때 부딪힙니다. 친구로는 최고인데 이해가 걸리면 양보가 잘 안 되는 조합입니다`,
        "생나→상대": `${f.who}의 ${ELEMENTS[me]}${ga(ELEMENTS[me])} ${f.other!.who}의 ${ELEMENTS[pt]}${eul(ELEMENTS[pt])} 생해 주는 관계입니다. 주는 쪽이 ${f.who}이라, 챙기고 밀어 주는 역할을 자연스럽게 맡게 됩니다. 오래 이어지면 한쪽만 소모되지 않도록 균형을 봐야 합니다`,
        "생상대→나": `${f.other!.who}의 ${ELEMENTS[pt]}${ga(ELEMENTS[pt])} ${f.who}의 ${ELEMENTS[me]}${eul(ELEMENTS[me])} 생해 주는 관계입니다. 받는 쪽이 ${f.who}이라, 이 사람 곁에서 편안해지고 실제로 일이 잘 풀립니다. 고마움을 표현하지 않으면 상대가 먼저 지칩니다`,
        "극나→상대": `${f.who}의 ${ELEMENTS[me]}${ga(ELEMENTS[me])} ${f.other!.who}의 ${ELEMENTS[pt]}${eul(ELEMENTS[pt])} 극하는 관계입니다. 주도권이 ${f.who} 쪽으로 기웁니다. 이끄는 힘이 되기도 하지만, 상대 입장에서는 눌린다고 느낄 수 있어 말투와 결정 방식에서 차이가 납니다`,
        "극상대→나": `${f.other!.who}의 ${ELEMENTS[pt]}${ga(ELEMENTS[pt])} ${f.who}의 ${ELEMENTS[me]}${eul(ELEMENTS[me])} 극하는 관계입니다. 상대 앞에서 긴장이 생기는 배치라, 끌리면서도 편하지만은 않습니다. 그 긴장이 매력으로 작동하는 시기와 부담으로 남는 시기가 갈립니다`,
      };
      return `${desc[r]}.`;
    },
  },
  {
    id: "궁합-용신교환",
    topics: ["궁합", "재회"],
    when: (f) => !!f.other,
    weight: 95,
    tag: "궁합-용신",
    text: (f) => {
      const o = f.other!;
      const iNeed = f.a.useEl, oNeed = o.a.useEl;
      const oHas = o.a.dominant, iHas = f.a.dominant;
      const oGives = oHas === iNeed;
      const iGives = iHas === oNeed;
      if (oGives && iGives)
        return `궁합에서 가장 크게 보는 자리가 여기입니다. ${f.who}에게 필요한 기운은 ${ELEMENTS[iNeed]}인데 ${o.who}에게 그게 가장 두껍고, 반대로 ${o.who}에게 필요한 ${ELEMENTS[oNeed]}${eul(ELEMENTS[oNeed])} ${f.who}${ga(f.who)} 갖고 있습니다. 서로 없는 걸 채워 주는 구조라, 같이 있을 때 각자 혼자일 때보다 나아집니다.`;
      if (oGives)
        return `${f.who}에게 필요한 기운은 ${ELEMENTS[iNeed]}인데, ${o.who}의 명식에서 가장 두꺼운 것이 바로 ${ELEMENTS[oHas]}입니다. 이 관계에서 채워지는 쪽은 ${f.who}입니다. 상대 곁에서 실제로 일이 잘 풀리는 대신, 받는 만큼 돌려주지 않으면 관계가 한쪽으로 기웁니다.`;
      // 둘이 같은 기운을 필요로 하는 경우가 있다. 서로 채워 주지 못한다는 점에서는
      // 아래 기본 문장과 같지만, 원인이 다르다. 같은 것이 부족해 같은 데서 지친다.
      if (iNeed === oNeed && !oGives && !iGives)
        return `두 사람에게 필요한 기운이 ${ELEMENTS[iNeed]}${ro(ELEMENTS[iNeed])} 같습니다. 부족한 자리가 겹친다는 뜻이라, 서로를 채워 주기는 어렵습니다. 대신 같은 것이 아쉬운 처지라 서로를 잘 이해합니다. 힘든 시기가 같이 오는 구조이니, 둘 다 지쳤을 때 관계 자체를 문제로 보지 않는 것이 중요합니다.`;
      if (iGives)
        return `${o.who}에게 필요한 기운은 ${ELEMENTS[oNeed]}인데, ${f.who}의 명식에서 가장 두꺼운 것이 그것입니다. 이 관계에서 채워 주는 쪽은 ${f.who}입니다. 상대가 이 사람 곁에서 편안해지는 구조인데, 주는 쪽이 지치지 않도록 속도를 봐야 합니다.`;
      return `${f.who}에게 필요한 기운은 ${ELEMENTS[iNeed]}, ${o.who}에게 필요한 기운은 ${ELEMENTS[oNeed]}입니다. 서로가 서로의 부족한 자리를 직접 채워 주는 배치는 아닙니다. 나쁘다는 뜻이 아니라, 각자 알아서 채워야 하는 부분이 남는다는 뜻입니다. 기대는 방식보다 나란히 서는 방식이 이 조합에는 맞습니다.`;
    },
  },
  {
    id: "궁합-일지",
    topics: ["궁합", "재회"],
    when: (f) => !!f.other,
    weight: 92,
    tag: "궁합-일지",
    text: (f) => {
      const mb = f.a.pillars.일!.branch, ob = f.other!.a.pillars.일!.branch;
      const me = BRANCHES[mb], ot = BRANCHES[ob];
      if (branchSix(mb, ob))
        return `배우자 자리인 일지끼리 ${me}${ot} 육합을 이룹니다. 두 사람의 자리가 직접 묶이는 배치라 궁합에서 가장 좋게 보는 조합 중 하나입니다. 떨어져 있어도 다시 붙는 힘이 있어, 헤어지고도 연락이 이어지기 쉽습니다.`;
      if (branchClash(mb, ob))
        return `배우자 자리인 일지끼리 ${me}${ot} 충입니다. 서로의 자리를 정면으로 흔드는 배치라, 가까워질수록 부딪히는 지점이 선명해집니다. 다만 충은 끊는 힘인 동시에 움직이는 힘이라, 이 조합은 흐지부지 이어지기보다 결론이 분명하게 나는 쪽입니다.`;
      if (mb === ob)
        return `두 사람의 일지가 ${me}${ro(me)} 같습니다. 생활 리듬과 편안하게 느끼는 자리가 비슷해 같이 있을 때 힘이 덜 듭니다. 대신 약한 자리도 똑같아서, 둘 다 못 하는 일은 계속 미뤄집니다.`;
      return `일지끼리는 ${me}${wa(me)} ${ot}${ro(ot)}, 직접 합하지도 충하지도 않습니다. 급격히 붙거나 깨지는 배치가 아니라서, 이 관계는 사건보다 시간이 결과를 만듭니다.`;
    },
  },
  {
    id: "궁합-강약조합",
    topics: ["궁합", "재회"],
    when: (f) => !!f.other,
    weight: 88,
    tag: "궁합-강약",
    text: (f) => {
      const a = f.a.strong, b = f.other!.a.strong;
      const sa = f.a.strengthScore, sb = f.other!.a.strengthScore;
      if (a && b)
        return `두 사람 모두 일간이 힘을 얻은 쪽입니다(${f.who} ${sa}점 · ${f.other!.who} ${sb}점). 각자 자기 축이 뚜렷해 서로를 함부로 못 바꿉니다. 존중이 있으면 오래가는 대신, 한쪽이 상대를 맞추려 들기 시작하면 급격히 나빠집니다.`;
      if (!a && !b)
        return `두 사람 모두 일간을 받쳐 주는 힘이 얇습니다(${f.who} ${sa}점 · ${f.other!.who} ${sb}점). 서로 이해는 잘 되는데 힘든 시기에 서로를 받쳐 주기가 어렵습니다. 둘만의 관계에 갇히기보다 바깥에 기댈 자리를 같이 만들어 두는 편이 낫습니다.`;
      const strongOne = a ? f.who : f.other!.who;
      const weakOne = a ? f.other!.who : f.who;
      return `${strongOne}${eun(strongOne)} 일간이 힘을 얻은 쪽이고, ${weakOne}${eun(weakOne)} 받쳐 주는 힘이 얇습니다(${sa}점 대 ${sb}점). 자연스럽게 한쪽이 끌고 한쪽이 기대는 형태가 되는데, 역할이 분명하면 안정적으로 굴러갑니다. 다만 기대는 쪽이 스스로 결정할 자리를 잃지 않는 게 관건입니다.`;
    },
  },
  {
    id: "궁합-십신",
    topics: ["궁합"],
    when: (f) => !!f.other,
    weight: 84,
    tag: "궁합-십신",
    text: (f) => {
      const g = tenGod(f.a.dayStem, f.other!.a.dayStem);
      const desc: Record<string, string> = {
        비견: "대등한 친구처럼 옵니다. 편한 대신 설렘이 오래 가지는 않는 쪽이라, 관계를 유지하는 다른 이유가 필요합니다",
        겁재: "같은 편이면서 동시에 경쟁자로 옵니다. 서로 자극이 되지만 몫이 걸리면 다투기 쉽습니다",
        식신: "내가 편하게 풀어놓게 되는 상대입니다. 이 사람 앞에서 말이 많아지고 표현이 늘어납니다",
        상관: "내 안의 하고 싶은 말을 끌어내는 상대입니다. 재미있는 대신 내가 예민해지는 순간도 같이 늘어납니다",
        편재: "내가 챙기고 굴리고 싶어지는 상대입니다. 현실적인 것을 같이 도모하기 좋습니다",
        정재: "내가 지키고 싶어지는 상대입니다. 안정적이고 오래 가는 결이라 결혼 쪽으로 이어지기 쉽습니다",
        편관: "긴장을 주는 상대입니다. 끌리면서도 편하지 않아, 이 사람 앞에서 자꾸 자세를 고쳐 앉게 됩니다",
        정관: "기준이 되는 상대입니다. 이 사람 때문에 스스로를 다듬게 되는데, 지나치면 눈치를 보게 됩니다",
        편인: "생각을 흔드는 상대입니다. 관점이 넓어지는 대신 결정이 느려집니다",
        정인: "기대게 되는 상대입니다. 곁에 있으면 안심이 되는데, 관계가 보호자-피보호자로 기울 수 있습니다",
      };
      return `${f.who}에게 ${f.other!.who}${eun(f.other!.who)} ${g}${ro(g)} 옵니다. ${desc[g]}.`;
    },
  },

  /* ───────── 재회 ───────── */
  {
    id: "재회-일지",
    topics: ["재회"],
    when: (f) => !!f.other,
    weight: 94,
    tag: "궁합-일지",
    text: (f) => {
      const mb = f.a.pillars.일!.branch, ob = f.other!.a.pillars.일!.branch;
      if (branchSix(mb, ob))
        return `두 사람의 일지가 육합입니다. 자리끼리 서로 붙잡는 배치라, 끝났다고 생각한 뒤에도 다시 이어지는 힘이 남아 있습니다. 재회 자체의 가능성은 이 조합에서 가장 높게 봅니다. 다만 다시 붙는 힘과 오래 가는 힘은 다른 문제입니다.`;
      if (branchClash(mb, ob))
        return `두 사람의 일지가 충입니다. 끊는 힘이 강한 배치라, 한 번 정리되면 예전 상태로 그대로 돌아가기는 어렵습니다. 다시 만난다면 관계의 형태 자체가 달라져 있어야 이어집니다.`;
      return `일지끼리 직접 합하지도 충하지도 않습니다. 극적으로 다시 붙거나 완전히 끊기는 배치가 아니라, 재회 여부는 명식보다 두 사람이 그동안 무엇을 바꿨느냐에 더 크게 달려 있습니다.`;
    },
  },
  {
    id: "재회-용신",
    topics: ["재회"],
    when: (f) => !!f.other,
    weight: 90,
    tag: "궁합-용신",
    text: (f) => {
      const need = f.a.useEl;
      const oHas = f.other!.a.dominant;
      return oHas === need
        ? `${f.who}에게 필요한 ${ELEMENTS[need]} 기운을 ${f.other!.who}${ga(f.other!.who)} 두껍게 갖고 있습니다. 그래서 그 사람 곁에서 실제로 편했던 게 맞습니다. 그리움이 감정만은 아니라는 뜻인데, 반대로 말하면 그 기운을 다른 방식으로 채우면 미련의 크기도 달라집니다.`
        : `${f.who}에게 필요한 기운은 ${ELEMENTS[need]}인데, ${f.other!.who}의 명식에서 가장 두꺼운 것은 ${ELEMENTS[oHas]}입니다. 그 사람이 이 사람의 빈자리를 직접 채워 주던 구조는 아니었습니다. 미련이 남는 이유는 궁합보다 함께한 시간 쪽에 있을 가능성이 큽니다.`;
    },
  },
  {
    id: "재회-시기",
    topics: ["재회"],
    when: (f) => f.years.length > 0,
    weight: 86,
    tag: "재회-시기",
    text: (f) => {
      // 재회 시기는 오늘 이후만 답한다. 지나간 달을 알려 주면 쓸모가 없다.
      if (f.breakup?.reunion || f.breakup?.contact) {
        const b = f.breakup!;
        const c = b.contact ? `${b.contact.year}년 ${b.contact.month}월` : "";
        const r = b.reunion ? `${b.reunion.year}년 ${b.reunion.month}월` : "";
        const dayB = f.a.pillars.일!.branch;
        return `${b.y}년 ${b.m}월 이별을 기준으로 잡으면, 먼저 연락을 넣기 나은 자리는 ${c}입니다(이별 후 ${b.heal}개월의 회복 구간을 지나고 오는 달 중 흐름이 트이는 달). 실제로 다시 이어질 자리는 ${r}입니다 — 배우자궁인 일지 ${BRANCHES[dayB]}${eul(BRANCHES[dayB])} 묶어 주는 달이라 이때 관계가 형태를 갖춥니다. 두 시점 사이에는 결론을 재촉하지 않는 편이 낫습니다.`;
      }
      const best = [...f.years].sort((a, b) => b.score - a.score)[0];
      const clash = f.years.find((y) => y.clashes.some((c) => c.startsWith("일지")));
      return `흐름으로 보면 ${best.year}년(${best.ganji}, ${best.score}점)에 관계 쪽 운신의 폭이 가장 넓어집니다. ${
        clash ? `반대로 ${clash.year}년에는 배우자 자리가 충을 맞아, 이 시기의 연락은 결론을 앞당기는 쪽으로 작동합니다.` : "급하게 움직이기보다 이 구간을 기다리는 편이 결과가 낫습니다."
      }`;
    },
  },
  {
    id: "재회-강약",
    topics: ["재회"],
    when: (f) => !!f.other,
    weight: 80,
    tag: "궁합-강약",
    text: (f) =>
      f.a.strong
        ? `${f.who}${eun(f.who)} 일간이 힘을 얻은 쪽이라, 정리하기로 마음먹으면 스스로 끊어 냅니다. 지금 미련이 남아 있다면 아직 정리가 안 끝난 것이지, 못 끊는 성격이라서는 아닙니다.`
        : `${f.who}${eun(f.who)} 일간을 받쳐 주는 힘이 얇아, 관계가 끝난 뒤에도 마음이 오래 남습니다. 미련이 긴 건 감정의 크기 때문이 아니라 이 구조 때문이라, 스스로를 탓할 일은 아닙니다.`,
  },
];
