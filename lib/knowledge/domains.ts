/** 영역별 규칙 — 재물 · 직업 · 건강.
 *
 *  같은 명식이라도 어느 영역을 묻느냐에 따라 봐야 할 자리가 다르다.
 *    재물 — 재성의 양과 그것을 감당할 일간의 힘, 재백궁, 비겁의 경쟁
 *    직업 — 관성·식상·격국, 관록궁, 역마
 *    건강 — 약한 오행이 가리키는 장부, 기신이 몰리는 시기, 질액궁 */

import { ELEMENTS } from "../core/ganji";
import type { Rule, Facts } from "./types";
import { ga, eun, eul } from "./types";

const w = (f: Facts, g: "비겁" | "식상" | "재성" | "관성" | "인성") => f.a.groupWeight[g];

/** 오행이 가리키는 몸의 자리 — 전통적으로 보는 대응이다.
 *  ⚠️ 의학적 진단이 아니다. "이 계통을 남들보다 먼저 챙기라"는 정도로만 쓴다. */
const BODY: Record<number, { organ: string; sign: string; care: string }> = {
  0: { organ: "간과 담, 근육과 힘줄", sign: "눈이 먼저 피로해지고 아침에 몸이 뻣뻣합니다", care: "밤에 늦게 자는 습관이 이 계통을 가장 빨리 깎습니다" },
  1: { organ: "심장과 소장, 혈액순환", sign: "긴장하면 가슴이 먼저 답답해지고 잠들기가 어려워집니다", care: "카페인과 과로가 겹치는 구간을 특히 조심해야 합니다" },
  2: { organ: "위와 비장, 소화기", sign: "신경 쓰는 일이 생기면 먼저 속이 불편해집니다", care: "끼니를 거르거나 급하게 먹는 습관이 그대로 쌓입니다" },
  3: { organ: "폐와 대장, 피부와 호흡기", sign: "환절기에 목과 코가 먼저 반응하고 피부가 예민해집니다", care: "건조한 환경과 미세먼지에 남들보다 크게 영향을 받습니다" },
  4: { organ: "신장과 방광, 허리와 뼈", sign: "피로가 쌓이면 허리와 무릎에 먼저 옵니다", care: "찬 데서 오래 있는 것과 수분 부족이 이 계통에 직접 옵니다" },
};

export const domainRules: Rule[] = [
  /* ───────── 재물 ───────── */
  {
    id: "재물-그릇",
    topics: ["재물"],
    when: () => true,
    weight: 96,
    tag: "재물-그릇",
    prefer: ["타고난 재물의 그릇"],
    text: (f) => {
      const jae = w(f, "재성");
      const strong = f.a.strong;
      // 재물의 크기는 재성의 양이 아니라 "재성 × 그것을 감당할 일간의 힘"으로 본다.
      if (strong && jae >= 2.5)
        return `${f.who}${eun(f.who)} 재성이 두껍고(${jae.toFixed(1)}) 일간도 그걸 감당할 힘이 있습니다. 재물의 그릇이 큰 구조로, 판을 키워도 무너지지 않습니다. 규모를 줄이며 안전하게 가는 쪽이 오히려 이 명식에는 손해입니다.`;
      if (!strong && jae >= 2.5)
        return `${f.who}${eun(f.who)} 재성이 두꺼운데(${jae.toFixed(1)}) 일간이 그걸 다 감당하지 못합니다(신강·신약 ${f.a.strengthScore}점). 돈이 보이고 기회도 많은데 정작 손에 남는 게 적은 구조라, 재산을 불리는 것보다 새는 구멍을 막는 쪽이 훨씬 크게 남습니다.`;
      if (strong && jae < 1.2)
        return `${f.who}${eun(f.who)} 일간은 힘이 있는데 쓸 재성이 얇습니다(${jae.toFixed(1)}). 능력에 비해 돈으로 연결되는 통로가 좁은 구조라, 실력을 값으로 바꾸는 장치(가격·계약·유통)를 따로 만들어야 합니다.`;
      return `${f.who}${eun(f.who)} 재성이 얇고(${jae.toFixed(1)}) 일간도 강하지 않습니다. 큰돈을 한 번에 다루는 구조는 아니지만, 대신 크게 잃을 자리에도 잘 안 갑니다. 안정된 수입을 오래 유지하는 쪽이 이 명식의 강점입니다.`;
    },
  },
  {
    id: "재물-통로",
    topics: ["재물"],
    when: () => true,
    weight: 84,
    tag: "재물-통로",
    prefer: ["들어오는 방식과 통로"],
    text: (f) => {
      const seats = f.a.tenGods.filter((t) => ["편재", "정재"].includes(t.stem) || ["편재", "정재"].includes(t.branch));
      if (!seats.length)
        return `여덟 글자 어디에도 재성이 드러나지 않습니다. 정해진 수입보다 사람이나 기회를 통해 들어오는 쪽이라, 관계를 넓히는 것이 곧 재물 통로를 넓히는 일이 됩니다.`;
      const pos = seats[0].pos;
      const kind = ["편재", "정재"].includes(seats[0].stem as string) ? seats[0].stem : seats[0].branch;
      const where: Record<string, string> = {
        년: "이른 시기부터, 또는 집안·윗대와 연결된 통로에서",
        월: "직업과 사회생활 한가운데서",
        일: "가까운 사람이나 배우자와 얽힌 자리에서",
        시: "나이가 들수록, 또는 자식·후배 쪽과 연결된 자리에서",
      };
      return `재성이 ${pos}주에 ${kind}${ro(kind)} 자리합니다. ${where[pos]} 돈이 움직이는 구조입니다. ${
        kind === "편재"
          ? "편재라 들어오는 통로가 여럿이고 규모도 큰 대신, 나가는 폭도 같이 큽니다."
          : "정재라 한 번에 크게 들어오기보다 정해진 몫이 꾸준히 쌓이는 쪽입니다."
      }`;
    },
  },
  {
    id: "재물-비겁경쟁",
    topics: ["재물"],
    when: (f) => w(f, "비겁") >= 2.5 && w(f, "재성") >= 0.4,
    weight: 82,
    tag: "재물-비겁",
    text: (f) =>
      `비겁이 두꺼운데(${w(f, "비겁").toFixed(1)}) 재성도 있습니다. 비겁은 재를 나눠 갖는 자리라, 돈이 걸린 곳에 사람이 붙는 구조입니다. 동업·공동투자·보증처럼 몫이 섞이는 자리에서 특히 손실이 나기 쉬우니, 금액이 크면 반드시 문서로 정리해 두는 편이 낫습니다.`,
  },
  {
    id: "재물-시기",
    topics: ["재물"],
    when: (f) => f.years.length > 0,
    weight: 80,
    tag: "재물-시기",
    text: (f) => {
      const cand = [...f.years].sort((a, b) => b.score + (b.group === "재성" ? 12 : 0) - (a.score + (a.group === "재성" ? 12 : 0)));
      const top = cand[0];
      return `앞으로 10년 중 재물 쪽 흐름이 가장 좋은 해는 ${top.year}년(${top.ganji})입니다. ${
        top.group === "재성"
          ? `이 해에 들어오는 ${top.tenGodStem}${eun(top.tenGodStem)} 재물을 직접 가리키는 기운이라, 수입 구조가 바뀔 수 있는 구간입니다.`
          : `재를 직접 가리키는 해는 아니지만 전체 흐름이 가장 트여(${top.score}점), 이 시기에 벌인 일이 뒤에 결과로 돌아옵니다.`
      }`;
    },
  },

  /* ───────── 직업 ───────── */
  {
    id: "직업-관식",
    topics: ["직업"],
    when: () => true,
    weight: 94,
    tag: "직업-축",
    prefer: ["맞는 일의 방식"],
    text: (f) => {
      const gwan = w(f, "관성"), sik = w(f, "식상");
      if (gwan >= sik + 1)
        return `${f.who}${eun(f.who)} 관성(${gwan.toFixed(1)})이 식상(${sik.toFixed(1)})보다 확실히 무겁습니다. 조직 안에서 자리를 맡아 올라가는 구조가 맞습니다. 규칙과 직책이 있는 환경에서 오히려 안정되고, 반대로 모든 걸 스스로 정해야 하는 자리에서는 방향을 못 잡습니다.`;
      if (sik >= gwan + 1)
        return `${f.who}${eun(f.who)} 식상(${sik.toFixed(1)})이 관성(${gwan.toFixed(1)})보다 무겁습니다. 시키는 일을 반복하는 자리보다 만들어 내는 자리가 맞습니다. 조직에 있더라도 재량이 있는 역할이라야 하고, 통제가 촘촘해질수록 능률이 떨어집니다.`;
      return `${f.who}${eun(f.who)} 관성(${gwan.toFixed(1)})과 식상(${sik.toFixed(1)})이 엇비슷합니다. 조직에서도 버티고 혼자서도 굴릴 수 있는 구조라, 어느 쪽이든 갈 수 있는 대신 스스로 방향을 정해 주지 않으면 오래 헤맵니다.`;
    },
  },
  {
    id: "직업-관록궁",
    topics: ["직업"],
    when: (f) => !!f.chart.gongs.find((g) => g.name === "관록")?.star,
    weight: 78,
    tag: "직업-관록궁",
    text: (f) => {
      const star = f.chart.gongs.find((g) => g.name === "관록")!.star;
      return `자미두수로 보면 일을 관장하는 관록궁에 ${star}성이 들었습니다. 사주가 "무엇을 향해 움직이는가"를 말한다면, 이 별은 "어떤 자리에서 값이 매겨지는가"를 가리킵니다. 두 결이 같은 방향이면 진로가 일찍 잡히고, 어긋나면 하고 싶은 일과 잘하는 일이 계속 따로 놉니다.`;
    },
  },
  {
    id: "직업-역마",
    topics: ["직업"],
    when: (f) => f.a.sinsal.some((s) => s.name === "역마"),
    weight: 70,
    tag: "신살-역마",
    prefer: ["해외·이동"],
    text: () =>
      `역마가 붙어 있어 한자리에 오래 머무는 구조가 아닙니다. 출장·이동·해외·이직이 잦은 쪽인데, 이걸 불안정으로 보면 손해입니다. 움직임이 있는 일에서 오히려 성과가 나므로, 이동을 전제로 진로를 짜는 편이 맞습니다.`,
  },

  /* ───────── 건강 ───────── */
  {
    id: "건강-약한오행",
    topics: ["건강"],
    when: () => true,
    weight: 96,
    tag: "건강-약처",
    prefer: ["아껴야 할 몸"],
    text: (f) => {
      const weakEl = f.a.missing.length ? f.a.missing[0] : (f.a.elementWeight.indexOf(Math.min(...f.a.elementWeight)) as 0 | 1 | 2 | 3 | 4);
      const b = BODY[weakEl];
      return `여덟 글자에서 가장 얇은 기운은 ${ELEMENTS[weakEl]}입니다. 전통적으로 ${ELEMENTS[weakEl]}${eun(ELEMENTS[weakEl])} ${b.organ}에 대응한다고 봅니다. ${b.sign}. ${b.care}. 큰 병을 말하는 게 아니라, 무리가 쌓일 때 이 계통이 가장 먼저 신호를 보낸다는 뜻입니다.`;
    },
  },
  {
    id: "건강-강한오행과다",
    topics: ["건강"],
    when: (f) => Math.max(...f.a.elementWeight) >= 4.5,
    weight: 84,
    tag: "건강-과다",
    prefer: ["필요한 건강 관리법"],
    text: (f) => {
      const b = BODY[f.a.dominant];
      return `반대로 ${ELEMENTS[f.a.dominant]} 기운은 지나치게 두껍습니다(${f.a.elementWeight[f.a.dominant].toFixed(1)}). 부족한 것만 문제가 아니라 넘치는 것도 부담이 되는데, 이쪽은 ${b.organ} 계통에 과부하로 옵니다. 몰아서 쓰고 몰아서 쉬는 패턴을 줄이는 것만으로 체감이 달라집니다.`;
    },
  },
  {
    id: "건강-기신시기",
    topics: ["건강"],
    when: (f) => f.years.length > 0,
    weight: 78,
    tag: "건강-시기",
    text: (f) => {
      const worst = [...f.years].sort((a, b) => a.score - b.score)[0];
      return `앞으로 10년 중 몸이 가장 무거워지기 쉬운 해는 ${worst.year}년(${worst.ganji}, ${worst.score}점)입니다. ${
        worst.reasons.filter((r) => r.delta < 0).slice(0, 2).map((r) => r.text).join(", ") || "부담이 겹치는 구간"
      }입니다. 이 해에는 일정을 몰아 잡지 않는 것만으로 회복 속도가 달라집니다.`;
    },
  },
  {
    id: "건강-질액궁",
    topics: ["건강"],
    when: (f) => !!f.chart.gongs.find((g) => g.name === "질액")?.star,
    weight: 68,
    tag: "건강-질액궁",
    text: (f) => {
      const star = f.chart.gongs.find((g) => g.name === "질액")!.star;
      return `자미두수의 질액궁에는 ${star}성이 들었습니다. 몸의 약한 자리를 보는 궁인데, 사주에서 나온 결과와 겹치는 부분이 있으면 그쪽을 우선 챙기면 됩니다.`;
    },
  },
];

function ro(w: string) {
  for (let i = w.length - 1; i >= 0; i--) {
    const c = w.charCodeAt(i);
    if (c >= 0xac00 && c <= 0xd7a3) {
      const j = (c - 0xac00) % 28;
      return j === 0 || j === 8 ? "로" : "으로";
    }
  }
  return "로";
}
