/** 시기 규칙 — "언제"를 묻는 문항은 반드시 연도와 나이를 댄다.
 *
 *  "좋은 시기가 옵니다" 같은 말은 아무것도 말하지 않은 것과 같다. 세운(歲運)은
 *  10년 치가 이미 계산돼 있으므로(lib/core/luck.ts), 영역마다 어느 해가 왜 좋은지
 *  실제 간지와 점수를 인용한다.
 *
 *  세운 점수는 아래를 합산한 값이다.
 *    세운 천간·지지가 용신인가 기신인가
 *    지금 대운과의 관계
 *    원국 지지와의 충·합·파해
 *
 *  영역별로는 그 영역을 쥔 십신이 드는 해에 가점을 준다.
 *    재물 재성 · 직업 관성 · 연애 재성(남)/관성(여) · 공부 인성 · 창업 식상 */

import { ELEMENTS, BRANCHES, STEM_EL, BRANCH_EL, branchSix, type ElIdx } from "../core/ganji";
import type { Rule, Facts } from "./types";
import { ga, eun, eul } from "./types";

/** 십신 갈래별 오행 */
const el5 = (d: ElIdx) => ({
  비겁: d,
  식상: ((d + 1) % 5) as ElIdx,
  재성: ((d + 2) % 5) as ElIdx,
  관성: ((d + 3) % 5) as ElIdx,
  인성: ((d + 4) % 5) as ElIdx,
});

/** 그 갈래가 드는 해만 추린다. */
const yearsWith = (f: Facts, el: ElIdx) =>
  f.years.filter((y) => STEM_EL[y.stem] === el || BRANCH_EL[y.branch] === el);

/** "2027년 8월" 꼴. 연도를 빼면 어느 해인지 알 수 없다. */
const mm = (x: { year: number; month: number }) => `${x.year}년 ${x.month}월`;

const fmt = (y: { year: number; age: number; ganji: string; score: number }) =>
  `${y.year}년(${y.ganji}, ${y.age}세, ${y.score}점)`;

/** 왜 그 점수인지 — 계산이 남긴 이유를 그대로 인용한다. */
const why = (y: { reasons: { text: string; delta: number }[] }, sign: 1 | -1) => {
  const r = y.reasons.filter((x) => (sign > 0 ? x.delta > 0 : x.delta < 0)).slice(0, 2).map((x) => x.text);
  return r.length ? r.join(", ") : sign > 0 ? "크게 거스르는 자리가 없음" : "특별히 어긋나는 자리는 없음";
};

export const timing2Rules: Rule[] = [
  {
    id: "시기-재물좋은해",
    topics: ["재물", "전성기"],
    when: (f) => f.years.length > 0,
    weight: 89,
    tag: "시기-재물+",
    prefer: ["모이는 시기"],
    text: (f) => {
      const E = el5(f.a.dayEl);
      const cand = yearsWith(f, E.재성);
      const best = (cand.length ? cand : f.years).slice().sort((a, b) => b.score - a.score)[0];
      const second = (cand.length ? cand : f.years).slice().sort((a, b) => b.score - a.score)[1];
      return `앞으로 10년 세운을 재성 ${ELEMENTS[E.재성]} 기준으로 재면, 돈이 가장 크게 움직이는 해는 ${fmt(best)}입니다(${why(best, 1)}). ${
        second ? `그다음이 ${fmt(second)}입니다. ` : ""
      }${cand.length ? "두 해 모두 재성이 직접 드는 해라, 벌이를 늘리거나 판을 키우는 결정은 여기에 맞추는 편이 유리합니다." : "앞으로 10년에 재성이 직접 드는 해는 없습니다. 큰 건을 노리기보다 이 해들의 전체 흐름을 이용해 쌓는 쪽이 맞습니다."}`;
    },
  },
  {
    id: "시기-재물잃는해",
    topics: ["재물", "연애주의"],
    when: (f) => f.years.length > 0,
    weight: 86,
    tag: "시기-재물-",
    prefer: ["잃기 쉬운"],
    text: (f) => {
      const E = el5(f.a.dayEl);
      const rival = yearsWith(f, E.비겁);
      const worst = f.years.slice().sort((a, b) => a.score - b.score)[0];
      const pick = rival.length ? rival.slice().sort((a, b) => a.score - b.score)[0] : worst;
      return `반대로 돈이 새기 쉬운 해는 ${fmt(pick)}입니다(${why(pick, -1)}). ${
        rival.length
          ? `비겁 ${ELEMENTS[E.비겁]}${ga(ELEMENTS[E.비겁])} 드는 해라, 명리에서는 재물을 나눠 갖는 자리로 봅니다. 큰 지출·동업·보증·투자 결정을 이 해 밖으로 미루는 것만으로 손실의 상당 부분이 줄어듭니다.`
          : `기신이 겹치는 해라 판단이 흐려지기 쉽습니다. 확신 없는 지출과 급하게 맺는 계약을 이 해에 몰아 두지 않는 편이 안전합니다.`
      }`;
    },
  },
  {
    id: "시기-직업좋은해",
    topics: ["직업", "전성기"],
    when: (f) => f.years.length > 0,
    weight: 88,
    tag: "시기-직업+",
    prefer: ["유리한 시기"],
    text: (f) => {
      const E = el5(f.a.dayEl);
      const cand = yearsWith(f, E.관성);
      const best = (cand.length ? cand : f.years).slice().sort((a, b) => b.score - a.score)[0];
      return `직함과 자리는 관성 ${ELEMENTS[E.관성]}${ga(ELEMENTS[E.관성])} 쥡니다. 앞으로 10년 중 ${
        cand.length
          ? `관성이 드는 해는 ${cand.map((y) => `${y.year}년(${y.ganji})`).join(", ")}입니다. 그중 ${fmt(best)}이 가장 낫습니다(${why(best, 1)}). 이직·승진·시험처럼 자리를 바꾸는 결정은 이 해에 붙이는 편이 통과율이 높습니다.`
          : `관성이 직접 드는 해가 없습니다. 자리가 밀어 주는 흐름이 아니라는 뜻이라, 조직 안에서의 승진보다 실력을 쌓아 다음 대운에 쓰는 쪽이 낫습니다. 전체 흐름만 보면 ${fmt(best)}이 가장 수월합니다.`
      }`;
    },
  },
  {
    id: "시기-직업주의해",
    topics: ["직업", "대운"],
    when: (f) => f.years.some((y) => y.clashes.length > 0 || y.score < 45),
    weight: 84,
    tag: "시기-직업-",
    prefer: ["주의할 시기와 선택"],
    text: (f) => {
      const clash = f.years.find((y) => y.clashes.length > 0);
      const low = f.years.slice().sort((a, b) => a.score - b.score)[0];
      const y = clash ?? low;
      return `주의할 해는 ${fmt(y)}입니다. ${
        clash
          ? `원국의 ${y.clashes.join("·")}${eun(y.clashes[y.clashes.length - 1])} 충을 맞는 해라, 자리와 환경이 흔들립니다. 이동·이직이 실제로 잦아지는 구간인데, 밀려서 옮기는 것과 골라서 옮기는 것은 결과가 크게 다릅니다. 이 해가 오기 전에 갈 곳을 만들어 두는 것이 이 명식의 대비책입니다.`
          : `${why(y, -1)}. 성과가 노력만큼 안 나오는 해라, 새로 벌이기보다 이미 맡은 것을 지키는 쪽이 남습니다.`
      }`;
    },
  },
  {
    id: "시기-건강주의해",
    topics: ["건강", "대운"],
    when: (f) => f.years.length > 0,
    weight: 87,
    tag: "시기-건강-",
    prefer: ["흔들리기 쉬운"],
    text: (f) => {
      const bad = f.years.filter((y) => STEM_EL[y.stem] === f.a.avoidEl || BRANCH_EL[y.branch] === f.a.avoidEl);
      const worst = (bad.length ? bad : f.years).slice().sort((a, b) => a.score - b.score)[0];
      const good = f.years.slice().sort((a, b) => b.score - a.score)[0];
      return `컨디션은 기신 ${ELEMENTS[f.a.avoidEl]}${ga(ELEMENTS[f.a.avoidEl])} 드는 해에 가장 크게 흔들립니다. 앞으로 10년 중 ${
        bad.length
          ? `${bad.map((y) => `${y.year}년(${y.ganji})`).join(", ")}이 여기 해당하고, 그중 ${fmt(worst)}이 가장 무겁습니다.`
          : `기신이 직접 드는 해는 없습니다. 전체 점수가 가장 낮은 ${fmt(worst)}만 챙기면 됩니다.`
      } 반대로 ${fmt(good)}은 회복이 빠른 해라, 미뤄 둔 치료나 체력 회복을 여기에 붙이면 효율이 다릅니다.`;
    },
  },
  {
    id: "시기-새인연",
    topics: ["연애시기", "끌림", "재회"],
    when: (f) => f.years.length > 0,
    weight: 88,
    tag: "시기-새인연",
    prefer: ["새로운 인연이 들어오는", "가장 좋은 시기"],
    text: (f) => {
      const E = el5(f.a.dayEl);
      const target = f.genderKnown ? (f.isMale ? E.재성 : E.관성) : E.재성;
      const label = f.genderKnown ? (f.isMale ? "재성" : "관성") : "재성";
      const cand = yearsWith(f, target);
      const peach = f.years.filter((y) => [0, 3, 6, 9].includes(y.branch));
      const best = (cand.length ? cand : peach.length ? peach : f.years).slice().sort((a, b) => b.score - a.score)[0];
      const parts: string[] = [];
      if (cand.length) parts.push(`${label} ${ELEMENTS[target]}${ga(ELEMENTS[target])} 드는 해는 ${cand.map((y) => `${y.year}년`).join(", ")}`);
      if (peach.length) parts.push(`도화(자·묘·오·유)가 드는 해는 ${peach.map((y) => `${y.year}년`).join(", ")}`);
      return `새 인연이 들어오는 자리를 세운에서 보면, ${parts.length ? parts.join("이고, ") + "입니다. " : "앞으로 10년에 인연을 직접 밀어 주는 해는 없습니다. "}가장 가능성이 큰 해는 ${fmt(best)}입니다(${why(best, 1)}). 이 해에는 소개나 모임을 미루지 않는 편이 낫습니다.`;
    },
  },
  {
    id: "시기-관계정리",
    topics: ["재회", "연애시기", "연애주의"],
    when: (f) => f.years.length > 0,
    weight: 83,
    tag: "시기-정리",
    prefer: ["마음이 정리되는", "연락 타이밍"],
    text: (f) => {
      const clash = f.years.find((y) => y.clashes.some((c) => c.startsWith("일지")));
      const combo = f.years.find((y) => y.combos.length > 0);
      const good = f.years.slice().sort((a, b) => b.score - a.score)[0];
      if (clash)
        return `마음이 실제로 정리되는 자리는 배우자궁이 흔들리는 해입니다. ${fmt(clash)}에 원국의 ${clash.clashes.join("·")}${ga(clash.clashes[clash.clashes.length - 1])} 충을 맞습니다. 이 해에 관계의 형태가 한 번 바뀝니다. 붙잡고 있던 것을 놓게 되든, 반대로 결론을 내게 되든 흐지부지 넘어가지는 않습니다.`;
      if (combo)
        return `${fmt(combo)}에 원국의 ${combo.combos.join("·")}${ga(combo.combos[combo.combos.length - 1])} 합을 이룹니다. 합은 묶는 자리라, 끊어 내기보다 다시 이어지는 쪽으로 기웁니다. 정리하려 해도 잘 안 되는 해라고 보는 편이 정확합니다.`;
      return `앞으로 10년 세운에 배우자궁을 직접 흔드는 충도, 묶는 합도 없습니다. 관계가 사건으로 정리되는 명식이 아니라는 뜻이라, 시간이 답을 만듭니다. 전체 흐름이 가장 나은 ${fmt(good)} 무렵이면 지금의 무게가 확실히 가벼워져 있습니다.`;
    },
  },
  {
    id: "시기-가치관",
    topics: ["성격", "궁합"],
    when: () => true,
    weight: 74,
    tag: "가치관-근거",
    prefer: ["가치관"],
    text: (f) => {
      const g = f.a.groupWeight;
      const top = (Object.entries(g) as [string, number][]).sort((a, b) => b[1] - a[1])[0];
      const desc: Record<string, string> = {
        비겁: "대등함입니다. 위아래가 생기는 관계를 못 견디고, 손해를 보더라도 무시당하지 않는 쪽을 고릅니다",
        식상: "솔직함입니다. 감정을 숨기고 유지하는 관계가 이 사람에게는 관계가 아닙니다. 말이 막히면 마음이 먼저 식습니다",
        재성: "현실적인 결과입니다. 말보다 실제로 무엇이 달라졌는지를 봅니다. 약속이 지켜지는지로 사람을 판단합니다",
        관성: "신뢰와 약속입니다. 규칙이 흔들리는 걸 가장 싫어해서, 한 번의 거짓말이 열 번의 다정함을 지웁니다",
        인성: "이해받는 느낌입니다. 잘해 주는 것보다 알아주는 것에 마음이 열리고, 설명이 필요 없는 관계를 찾습니다",
      };
      return `가치관은 여덟 글자에서 가장 무거운 십신 갈래가 정합니다. ${f.who}의 경우 ${top[0]}이 ${top[1].toFixed(1)}로 가장 두껍습니다(비겁 ${g.비겁.toFixed(1)} · 식상 ${g.식상.toFixed(1)} · 재성 ${g.재성.toFixed(1)} · 관성 ${g.관성.toFixed(1)} · 인성 ${g.인성.toFixed(1)}). 그래서 이 사람이 관계에서 가장 크게 치는 것은 ${desc[top[0]]}.`;
    },
  },

  {
    id: "평생-반복패턴",
    topics: ["성격", "인생흐름", "연애주의"],
    when: () => true,
    weight: 86,
    tag: "평생-패턴",
    prefer: ["평생 피해야 할"],
    text: (f) => {
      const g = f.a.groupWeight;
      const top = (Object.entries(g) as [string, number][]).sort((a, b) => b[1] - a[1])[0];
      const bot = (Object.entries(g) as [string, number][]).sort((a, b) => a[1] - b[1])[0];
      const HOW: Record<string, string> = {
        비겁: "몫을 따지지 않고 같이 벌이는 자리에서 반복해서 손해를 봅니다. 사람이 나빠서가 아니라 나눌 것보다 나눌 사람이 많은 배치입니다",
        식상: "말과 결정이 먼저 나가고 수습이 뒤따릅니다. 재능이 있는 자리인데, 같은 힘이 안 걸러지면 관계와 자리를 깎습니다",
        재성: "확인 없이 밀어붙이다 뒤늦게 되돌립니다. 판을 키우는 힘이 있는 만큼 무너질 때의 크기도 같이 큽니다",
        관성: "손해를 감수하고 참다가 한 번에 무너집니다. 책임을 지는 자리가 무거워, 못 하겠다고 말하는 것이 이 명식에는 가장 어려운 일입니다",
        인성: "생각이 행동을 앞질러 때를 놓칩니다. 준비가 부족해서가 아니라 준비만 하다가 지나갑니다",
      };
      return `평생 반복되는 패턴은 가장 무거운 갈래에서 나옵니다. ${f.who}의 경우 ${top[0]}이 ${top[1].toFixed(1)}로 가장 두껍고 ${bot[0]}이 ${bot[1].toFixed(1)}로 가장 얇습니다(비겁 ${g.비겁.toFixed(1)} · 식상 ${g.식상.toFixed(1)} · 재성 ${g.재성.toFixed(1)} · 관성 ${g.관성.toFixed(1)} · 인성 ${g.인성.toFixed(1)}). ${HOW[top[0]]}. 성격을 고치라는 말이 아니라, 이 자리가 과해지는 순간을 알아채면 같은 실수가 반쯤 줄어든다는 뜻입니다.`;
    },
  },
  {
    id: "평생-약한자리",
    topics: ["성격", "인생흐름"],
    when: (f) => f.a.missing.length > 0 || Math.min(...f.a.elementWeight) < 0.5,
    weight: 78,
    tag: "평생-약점",
    prefer: ["평생 피해야 할", "본성과 성격"],
    text: (f) => {
      const w2 = f.a.elementWeight;
      const min = w2.indexOf(Math.min(...w2));
      const LACK = [
        "새로 벌이고 밀고 나가는 힘",
        "먼저 다가가 분위기를 데우는 힘",
        "버티고 받쳐 주는 힘",
        "선을 긋고 정리하는 힘",
        "속도를 늦추고 여백을 두는 힘",
      ];
      return `가장 얇은 자리는 ${ELEMENTS[min]}(${w2[min].toFixed(1)})입니다. ${LACK[min]}이 기본값으로 부족하다는 뜻이라, 그 힘이 필요한 국면마다 남들보다 크게 힘이 듭니다. 못 하는 게 아니라 안 갖고 태어난 쪽입니다. 억지로 채우려 애쓰는 것이 이 명식에서 가장 비싼 선택이고, 그 몫을 대신해 줄 사람이나 장치를 곁에 두는 편이 실질적입니다.`;
    },
  },

  {
    id: "결혼시기-혼인자리",
    topics: ["결혼시기", "배우자"],
    when: (f) => f.years.length > 0,
    weight: 91,
    tag: "결혼-자리",
    prefer: ["결혼 예상 나이", "결혼 가능성"],
    text: (f) => {
      const now = new Date().getFullYear() - f.chart.birthYear + 1;
      const el = f.genderKnown ? ((f.isMale ? f.a.dayEl + 2 : f.a.dayEl + 3) % 5) : f.a.useEl;
      const label = f.genderKnown ? (f.isMale ? "재성" : "관성") : "용신";
      const day = f.a.pillars.일!.branch;
      // 앞으로 10년 안에서 혼인 기운이 실리는 해
      const hits = f.years.filter(
        (y) => STEM_EL[y.stem] === el || BRANCH_EL[y.branch] === el || branchSix(day, y.branch),
      );
      const six = f.years.find((y) => branchSix(day, y.branch));
      return `혼인 시기는 두 자리를 겹쳐 봅니다. 하나는 배우자를 뜻하는 ${label}(${ELEMENTS[el]})이 드는 해, 다른 하나는 배우자 자리인 일지 ${BRANCHES[day]}${ga(BRANCHES[day])} 육합으로 묶이는 해입니다. 일지가 묶이는 해를 고전에서 가장 크게 봅니다. ${
        six
          ? `${f.who}의 경우 ${six.year}년(${six.ganji}, ${six.age}세)에 일지가 ${BRANCHES[six.branch]}${wa2(BRANCHES[six.branch])} 육합합니다. 앞으로 10년 중 그 자리가 가장 뚜렷합니다.`
          : hits.length
            ? `앞으로 10년 중 ${label}이 드는 해는 ${hits.slice(0, 3).map((y) => `${y.year}년(${y.age}세)`).join(", ")}입니다. 일지가 직접 묶이는 해는 이 구간에 없어, 사건보다 준비가 결과를 정합니다.`
            : `앞으로 10년에는 두 자리 모두 직접 들지 않습니다. 시기를 기다리는 방식보다 관계를 만드는 쪽이 이 명식에 맞습니다.`
      }${
        now > 40 ? " 나이가 이미 그 자리를 지났다면, 명식이 가리키는 것은 결혼 여부가 아니라 관계의 성질입니다." : ""
      }`;
    },
  },

  /* ───────── 월운 — 연·월을 함께 댄다 ───────── */
  {
    id: "월운-좋은달",
    topics: ["연애시기", "전성기", "재물", "직업"],
    when: (f) => f.months.length > 0,
    weight: 90,
    tag: "월운+",
    prefer: ["가장 좋은 시기", "유리한 시기", "모이는 시기"],
    text: (f) => {
      const s2 = [...f.months].sort((a, b) => b.score - a.score);
      const top = s2.slice(0, 2);
      const t = top[0];
      return `달 단위로 좁히면 앞으로 14개월 중 ${mm(t)}(${t.ganji})이 가장 낫습니다(${t.score}점, ${t.reasons.join(", ") || "거스르는 자리가 없음"}). ${
        top[1] ? `그다음이 ${mm(top[1])}(${top[1].ganji}, ${top[1].score}점)입니다. ` : ""
      }달의 간지는 절기로 정해지므로 같은 5월이라도 해마다 다릅니다. 여기 적은 달은 그 해의 그 달을 가리킵니다.`;
    },
  },
  {
    id: "월운-주의달",
    topics: ["연애주의", "건강", "재물", "직업"],
    when: (f) => f.months.length > 0,
    weight: 87,
    tag: "월운-",
    prefer: ["주의할 점", "흔들리기 쉬운", "잃기 쉬운", "주의할 시기와 선택"],
    text: (f) => {
      const s2 = [...f.months].sort((a, b) => a.score - b.score);
      const w = s2[0];
      const clash = f.months.find((x) => x.clashes.length > 0);
      return `반대로 조심할 달은 ${mm(w)}(${w.ganji})입니다(${w.score}점, ${w.reasons.join(", ") || "받쳐 주는 자리가 없음"}).${
        clash && clash.month !== w.month
          ? ` ${mm(clash)}에는 원국의 ${clash.clashes.join("·")}${ga(clash.clashes[clash.clashes.length - 1])} 충을 맞아 자리가 흔들립니다.`
          : ""
      } 한 달 전체가 나쁘다는 뜻은 아니고, 그 구간에 큰 결정을 몰아 두지 않는 편이 낫다는 뜻입니다.`;
    },
  },
];

function wa2(w: string) {
  const c = w.charCodeAt(w.length - 1);
  return (c - 0xac00) % 28 !== 0 ? "과" : "와";
}
