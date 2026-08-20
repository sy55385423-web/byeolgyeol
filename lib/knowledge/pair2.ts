/** 궁합 · 재회 규칙 2차 — 두 명식을 실제로 대조하는 자리를 넓힌다.
 *
 *  궁합과 재회는 문항이 스물여섯 개인데 두 명식을 대조하는 규칙이 열 개뿐이었다.
 *  앞 문항 두어 개가 다 쓰고 나면 나머지는 한 사람만 보는 규칙으로 채워져서,
 *  "궁합을 물었는데 내 성격 얘기만 나온다"는 인상이 됐다.
 *
 *  여기서는 두 사람이 있어야만 성립하는 자리만 읽는다.
 *    기둥별 대조   년지(배경) · 월지(환경과 가치관) · 일지(생활) · 시지(앞날)
 *    천간합        두 일간이 합하는가
 *    오행 보완도   다섯 기운의 분포를 겹쳐 어디가 비고 어디가 겹치는가
 *    십신 양방향   상대가 나에게 / 내가 상대에게 각각 무엇으로 오는가
 *    신살 대조     도화끼리 · 역마끼리 · 상대의 공망이 내 자리인가
 *    12운성 대조   상대의 일지에서 내 일간이 힘을 얻는가
 *    세운 동조     좋은 해가 겹치는가 — 겹치면 같이 오르고 어긋나면 엇박이 난다
 *
 *  ⚠️ 궁합은 "좋다·나쁘다"로 끊는 게 가장 위험한 영역이다. 어느 자리가 맞고 어느
 *  자리가 어긋나는지를 나눠 말하고, 총점으로 사람을 판정하지 않는다. */

import {
  ELEMENTS, BRANCHES, STEMS, STEM_EL, BRANCH_EL,
  branchClash, branchSix, stemCombo, twelveStage, tenGod, TRIPLE, type ElIdx,
} from "../core/ganji";
import type { Rule, Facts } from "./types";
import { ga, eun, eul, ro, wa } from "./types";

const O = (f: Facts) => f.other!;
const pil = (f: Facts, p: "년" | "월" | "일" | "시") => f.a.pillars[p];
const opil = (f: Facts, p: "년" | "월" | "일" | "시") => O(f).a.pillars[p];
/** 두 지지가 같은 삼합 무리인가 */
const sameTriple = (a: number, b: number) => TRIPLE.some((t) => t.members.includes(a) && t.members.includes(b));

export const pair2Rules: Rule[] = [
  {
    id: "궁합-월지",
    topics: ["궁합", "재회"],
    when: (f) => !!f.other,
    weight: 89,
    tag: "궁합-월지",
    prefer: ["가치관", "서로에게 주는 영향"],
    text: (f) => {
      const a = pil(f, "월")!.branch, b = opil(f, "월")!.branch;
      const ea = BRANCH_EL[a], eb = BRANCH_EL[b];
      const rel = ea === eb ? "같음" : (ea + 1) % 5 === eb || (eb + 1) % 5 === ea ? "상생" : (ea + 2) % 5 === eb || (eb + 2) % 5 === ea ? "상극" : "무관";
      return `월지는 자란 환경과 사회에서 쓰는 기준을 맡는 자리입니다. ${f.who}${eun(f.who)} ${BRANCHES[a]}(${ELEMENTS[ea]}), ${O(f).who}${eun(O(f).who)} ${BRANCHES[b]}(${ELEMENTS[eb]})입니다. ${
        rel === "같음"
          ? "같은 자리라 옳고 그름의 기준이 잘 안 부딪힙니다. 설명하지 않아도 통하는 대신, 둘 다 놓치는 지점도 같습니다."
          : rel === "상생"
            ? "서로를 돕는 관계라, 상대의 방식이 내 방식을 막지 않습니다. 생활 습관이 달라도 큰 갈등으로 번지지 않는 배치입니다."
            : rel === "상극"
              ? "부딪히는 관계입니다. 무엇이 옳은지에 대한 기본값이 달라서, 사소한 결정에서 자주 어긋납니다. 서로를 설득하려 들기보다 규칙을 정해 두는 편이 낫습니다."
              : "직접 부딪히지도 돕지도 않습니다. 서로의 방식에 관심이 덜한 대신 간섭도 적습니다."
      }`;
    },
  },
  {
    id: "궁합-년지",
    topics: ["궁합", "재회"],
    when: (f) => !!f.other,
    weight: 72,
    tag: "궁합-년지",
    prefer: ["결혼 시 주의점", "궁합과 인연"],
    text: (f) => {
      const a = pil(f, "년")!.branch, b = opil(f, "년")!.branch;
      return `년지는 집안과 뿌리를 보는 자리입니다. ${BRANCHES[a]}${wa(BRANCHES[a])} ${BRANCHES[b]}${ga(BRANCHES[b])} 만납니다. ${
        branchClash(a, b)
          ? "충하는 배치라 두 집안의 방식이 정면으로 다릅니다. 두 사람이 잘 맞아도 주변에서 오는 마찰이 따로 생기니, 가족 문제를 관계 문제로 옮겨 오지 않는 것이 중요합니다."
          : branchSix(a, b) || sameTriple(a, b)
            ? "묶이는 배치라 배경과 분위기가 닮았습니다. 양가가 서로를 어색해하지 않고, 주변의 반대가 적은 편입니다."
            : "크게 부딪히지도 묶이지도 않습니다. 배경의 차이가 관계를 좌우하지 않는 배치라, 결과는 두 사람 사이에서만 정해집니다."
      }`;
    },
  },
  {
    id: "궁합-시지",
    topics: ["궁합", "결혼시기"],
    when: (f) => !!f.other && !!pil(f, "시") && !!opil(f, "시"),
    weight: 70,
    tag: "궁합-시지",
    prefer: ["얼마나 오래 만날지", "결혼 가능성"],
    text: (f) => {
      const a = pil(f, "시")!.branch, b = opil(f, "시")!.branch;
      return `시지는 앞날과 자식 자리를 맡습니다. ${BRANCHES[a]}${wa(BRANCHES[a])} ${BRANCHES[b]}입니다. ${
        branchSix(a, b) || sameTriple(a, b)
          ? "묶이는 배치라 두 사람이 그리는 미래의 그림이 겹칩니다. 오래 볼수록 유리한 조합입니다."
          : branchClash(a, b)
            ? "충하는 배치라 원하는 미래가 다릅니다. 지금 잘 맞아도 몇 년 뒤 이야기를 꺼내면 어긋나는 지점이 나오니, 미루지 말고 일찍 맞춰 보는 편이 낫습니다."
            : "특별히 겹치지도 어긋나지도 않습니다. 미래는 명식보다 두 사람이 무엇을 합의하느냐로 정해집니다."
      }`;
    },
  },
  {
    id: "궁합-천간합",
    topics: ["궁합", "재회"],
    when: (f) => !!f.other && stemCombo(f.a.dayStem, O(f).a.dayStem) !== null,
    weight: 91,
    tag: "궁합-천간합",
    prefer: ["궁합 총점수", "궁합과 인연"],
    text: (f) => {
      const el = stemCombo(f.a.dayStem, O(f).a.dayStem)!;
      return `두 일간 ${STEMS[f.a.dayStem]}${wa(STEMS[f.a.dayStem])} ${STEMS[O(f).a.dayStem]}${ga(STEMS[O(f).a.dayStem])} 천간합을 이룹니다(${ELEMENTS[el]}${ro(ELEMENTS[el])} 화합). 명리에서 천간합은 두 사람이 서로에게 묶이는 자리로, 궁합에서 가장 크게 보는 배치 중 하나입니다. 이유를 설명하기 어려운 끌림이 여기서 나옵니다. 다만 합은 묶는 힘이라 좋을 때도 나쁠 때도 잘 안 놓입니다. 끝내야 할 관계도 오래 끄는 쪽이 이 배치입니다.`;
    },
  },
  {
    id: "궁합-오행보완",
    topics: ["궁합", "재회"],
    when: (f) => !!f.other,
    weight: 86,
    tag: "궁합-보완",
    prefer: ["서로에게 주는 영향", "둘의 연애가 어땠는지"],
    text: (f) => {
      const A = f.a.elementWeight, B = O(f).a.elementWeight;
      const gap = A.map((v, i) => B[i] - v);
      const fill = gap.map((v, i) => ({ i, v })).sort((x, y) => y.v - x.v)[0];
      const over = A.map((v, i) => ({ i, v: v + B[i] })).sort((x, y) => y.v - x.v)[0];
      return `다섯 기운의 분포를 겹쳐 봅니다. ${f.who}${eun(f.who)} 목 ${A[0].toFixed(1)} · 화 ${A[1].toFixed(1)} · 토 ${A[2].toFixed(1)} · 금 ${A[3].toFixed(1)} · 수 ${A[4].toFixed(1)}, ${O(f).who}${eun(O(f).who)} 목 ${B[0].toFixed(1)} · 화 ${B[1].toFixed(1)} · 토 ${B[2].toFixed(1)} · 금 ${B[3].toFixed(1)} · 수 ${B[4].toFixed(1)}입니다. ${O(f).who}${ga(O(f).who)} 가장 많이 채워 주는 것은 ${ELEMENTS[fill.i]}(${fill.v > 0 ? `+${fill.v.toFixed(1)}` : fill.v.toFixed(1)})이고, 둘을 합쳤을 때 가장 두꺼워지는 것은 ${ELEMENTS[over.i]}(${over.v.toFixed(1)})입니다. ${
        fill.i === f.a.useEl
          ? "채워 주는 자리가 마침 필요한 기운이라, 이 사람 곁에서 실제로 숨통이 트입니다."
          : over.i === f.a.avoidEl
            ? "다만 합쳐서 가장 두꺼워지는 기운이 부담이 되는 쪽이라, 같이 있는 시간이 길어질수록 그 쏠림이 커집니다."
            : "채우는 쪽과 겹치는 쪽이 뚜렷하게 갈리지 않습니다. 서로를 바꾸기보다 각자의 자리를 지키는 관계에 맞습니다."
      }`;
    },
  },
  {
    id: "궁합-십신역방향",
    topics: ["궁합", "재회"],
    when: (f) => !!f.other,
    weight: 84,
    tag: "궁합-십신역",
    prefer: ["상대방의 현재 마음", "서로에 대한 호감도"],
    text: (f) => {
      const toMe = tenGod(O(f).a.dayStem, f.a.dayStem); // 상대 입장에서 내가 무엇인가
      const desc: Record<string, string> = {
        비견: "대등한 상대로 봅니다. 편한 대신 특별하게 여기지는 않습니다",
        겁재: "같은 편이자 경쟁자로 봅니다. 가까운데 은근히 재는 마음이 섞입니다",
        식신: "편하게 풀어놓을 수 있는 상대로 봅니다. 이 사람 앞에서 말이 많아집니다",
        상관: "자기 안의 하고 싶은 말을 끌어내는 상대로 봅니다. 재미있는데 예민해지기도 합니다",
        편재: "챙기고 싶은 상대로 봅니다. 잘해 주고 싶은 마음이 크게 납니다",
        정재: "지키고 싶은 상대로 봅니다. 오래 두고 볼 사람으로 여깁니다",
        편관: "긴장을 주는 상대로 봅니다. 끌리면서도 편하지만은 않습니다",
        정관: "기준이 되는 상대로 봅니다. 이 사람 앞에서 스스로를 다듬게 됩니다",
        편인: "생각을 흔드는 상대로 봅니다. 관점이 넓어지는 대신 결정이 느려집니다",
        정인: "기대고 싶은 상대로 봅니다. 곁에 있으면 안심이 됩니다",
      };
      return `앞에서는 ${f.who} 입장에서 봤으니, 이번엔 반대로 봅니다. ${O(f).who}의 일간 ${STEMS[O(f).a.dayStem]}${eul(STEMS[O(f).a.dayStem])} 기준으로 하면 ${f.who}${eun(f.who)} ${toMe}에 해당합니다. ${desc[toMe]}. 같은 관계라도 두 사람이 서로를 다르게 느끼는 이유가 여기 있습니다.`;
    },
  },
  {
    id: "궁합-12운성대조",
    topics: ["궁합", "재회"],
    when: (f) => !!f.other,
    weight: 80,
    tag: "궁합-기세",
    prefer: ["지금 연인이 최선의 선택인지", "재회 가능성"],
    text: (f) => {
      const ob = opil(f, "일")!.branch;
      const st = twelveStage(f.a.dayStem, ob);
      const mb = pil(f, "일")!.branch;
      const st2 = twelveStage(O(f).a.dayStem, mb);
      const up = ["장생", "관대", "건록", "제왕"].includes(st);
      const up2 = ["장생", "관대", "건록", "제왕"].includes(st2);
      return `상대의 일지 자리에 내 일간을 놓아 봅니다. ${f.who}의 일간 ${STEMS[f.a.dayStem]}${eun(STEMS[f.a.dayStem])} ${O(f).who}의 일지 ${BRANCHES[ob]}에서 ${st}, 반대로 ${O(f).who}의 일간은 ${f.who}의 일지 ${BRANCHES[mb]}에서 ${st2}입니다. ${
        up && up2
          ? "둘 다 상대 옆에서 기운이 오르는 배치입니다. 같이 있을 때 각자 혼자일 때보다 나아지는 드문 조합입니다."
          : up
            ? `${f.who}${eun(f.who)} 상대 옆에서 힘을 얻는 쪽입니다. 받는 것이 더 많은 관계라, 고마움을 표현하지 않으면 상대가 먼저 지칩니다.`
            : up2
              ? `${O(f).who}${ga(O(f).who)} 이쪽 옆에서 힘을 얻는 쪽입니다. 주는 것이 더 많은 관계라, 소모되고 있지 않은지 스스로 살펴야 합니다.`
              : "둘 다 상대 옆에서 기운이 특별히 오르지는 않습니다. 서로를 키워 주는 관계라기보다 나란히 서는 관계에 가깝습니다."
      }`;
    },
  },
  {
    id: "궁합-도화대조",
    topics: ["궁합", "연애주의"],
    when: (f) => !!f.other && (f.a.sinsal.some((s) => s.name === "도화") || O(f).a.sinsal.some((s) => s.name === "도화")),
    weight: 76,
    tag: "궁합-도화",
    prefer: ["바람기 지수"],
    text: (f) => {
      const me = f.a.sinsal.some((s) => s.name === "도화");
      const ot = O(f).a.sinsal.some((s) => s.name === "도화");
      return `도화는 이성에게 눈에 띄는 자리입니다. ${
        me && ot
          ? `${f.who}${wa(f.who)} ${O(f).who} 모두 도화를 가졌습니다. 둘 다 밖에서 시선을 받는 쪽이라, 서로에 대한 확신이 없으면 의심이 자랄 자리가 많습니다. 나쁜 마음이 있어서가 아니라 상황이 자주 생기는 배치라고 보는 편이 정확합니다.`
          : me
            ? `${f.who}에게만 도화가 있습니다. 밖에서 관심을 받는 쪽이라, 상대가 불안해할 여지가 생깁니다. 본인은 아무렇지 않은 자리에서 상대는 신경이 쓰입니다.`
            : `${O(f).who}에게 도화가 있습니다. 상대가 밖에서 시선을 받는 쪽이라, 이 관계에서 신경이 쓰이는 쪽은 ${f.who}입니다. 근거 없는 불안이 아니라 배치가 그렇습니다.`
      }`;
    },
  },
  {
    id: "궁합-역마대조",
    topics: ["궁합", "재회"],
    when: (f) => !!f.other && (f.a.sinsal.some((s) => s.name === "역마") || O(f).a.sinsal.some((s) => s.name === "역마")),
    weight: 71,
    tag: "궁합-역마",
    prefer: ["얼마나 오래 만날지", "결혼 시 주의점"],
    text: (f) => {
      const me = f.a.sinsal.some((s) => s.name === "역마");
      const ot = O(f).a.sinsal.some((s) => s.name === "역마");
      return `역마는 한자리에 머물지 않는 자리입니다. ${
        me && ot
          ? "둘 다 역마를 가졌습니다. 같이 움직이면 잘 맞는데, 각자 다른 방향으로 움직이면 물리적인 거리가 관계를 밀어냅니다. 이 조합은 사는 곳을 어디로 할지가 실제 고비가 됩니다."
          : `${me ? f.who : O(f).who}에게 역마가 있습니다. 한쪽은 움직이려 하고 한쪽은 자리를 지키려 하는 배치라, 이사·이직·해외 같은 결정에서 부딪힙니다. 성향 차이로 볼 게 아니라 타고난 결이 다른 것입니다. 어디까지 움직일지를 숫자로 합의해 두면 이 자리가 갈등이 되지 않습니다.`
      }`;
    },
  },
  {
    id: "궁합-세운동조",
    topics: ["궁합", "재회", "연애시기"],
    when: (f) => !!f.other && f.years.length > 0,
    weight: 82,
    tag: "궁합-동조",
    prefer: ["얼마나 오래 만날지", "재회 시기", "결혼 가능성"],
    text: (f) => {
      const mine = [...f.years].sort((a, b) => b.score - a.score)[0];
      const oEl = O(f).a.useEl;
      const shared = f.years.filter((y) => STEM_EL[y.stem] === oEl || BRANCH_EL[y.branch] === oEl);
      const both = shared.find((y) => y.score >= 55);
      return `두 사람의 흐름이 같은 해에 오르는지도 봅니다. ${f.who}에게 가장 좋은 해는 ${mine.year}년(${mine.ganji}, ${mine.score}점)이고, ${O(f).who}의 용신 ${ELEMENTS[oEl]}${ga(ELEMENTS[oEl])} 드는 해는 ${shared.length ? shared.slice(0, 3).map((y) => `${y.year}년`).join(", ") : "앞으로 10년에 없습니다"}. ${
        both
          ? `${both.year}년은 두 사람 모두에게 나쁘지 않은 해라, 큰 결정을 붙이기에 이만한 자리가 자주 오지 않습니다.`
          : "두 사람의 좋은 해가 겹치지 않습니다. 한쪽이 오를 때 다른 쪽이 힘든 구간이 반복되는 배치라, 상대가 힘든 시기에 서운함을 쌓지 않는 것이 이 관계의 관건입니다."
      }`;
    },
  },
  {
    id: "궁합-공망대조",
    topics: ["궁합", "재회"],
    when: (f) => !!f.other && (f.chart.voidBranches ?? []).length > 0,
    weight: 68,
    tag: "궁합-공망",
    prefer: ["헤어진 진짜 이유", "상대방이 나를 기억하는 방식"],
    text: (f) => {
      const voids = f.chart.voidBranches ?? [];
      const ob = BRANCHES[opil(f, "일")!.branch];
      const hit = voids.includes(ob);
      return `공망은 있어도 손에 안 잡히는 자리입니다. ${f.who}의 공망은 ${voids.join("·")}입니다. ${
        hit
          ? `${O(f).who}의 일지 ${ob}${ga(ob)} 바로 그 자리에 듭니다. 아무리 가까워도 어딘가 비어 있다고 느끼는 배치라, 상대가 잘못해서가 아니라 구조가 그렇습니다. 이 관계에서 채워지지 않는 느낌을 상대 탓으로 돌리면 반드시 어긋납니다.`
          : `${O(f).who}의 일지 ${ob}${eun(ob)} 여기에 들지 않습니다. 관계 자체가 헛도는 배치는 아니라는 뜻이라, 문제가 생긴다면 자리가 아니라 방식에서 온 것입니다.`
      }`;
    },
  },
  {
    id: "궁합-일지삼합",
    topics: ["궁합", "재회"],
    when: (f) => !!f.other && sameTriple(pil(f, "일")!.branch, opil(f, "일")!.branch) && pil(f, "일")!.branch !== opil(f, "일")!.branch,
    weight: 87,
    tag: "궁합-삼합",
    prefer: ["궁합 총점수", "재회 가능성"],
    text: (f) => {
      const a = pil(f, "일")!.branch, b = opil(f, "일")!.branch;
      const t = TRIPLE.find((x) => x.members.includes(a) && x.members.includes(b))!;
      return `배우자 자리인 일지가 ${BRANCHES[a]}${wa(BRANCHES[a])} ${BRANCHES[b]}${ro(BRANCHES[b])} 같은 삼합 무리(${t.members.map((m) => BRANCHES[m]).join("·")})에 듭니다. 삼합은 셋이 모여 하나의 기운(${ELEMENTS[t.el]})을 이루는 자리라, 두 사람이 같은 방향을 보는 배치입니다. 육합만큼 강하게 묶이지는 않지만 목표와 취향이 자연스럽게 겹칩니다. 오래 볼수록 편해지는 조합입니다.`;
    },
  },
];
