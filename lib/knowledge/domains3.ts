/** 재물 · 직업 · 건강 — 문항 수를 감당하기 위한 보강 2차.
 *
 *  영역마다 문항이 아홉 개인데 규칙이 모자라 뒤쪽 문항이 굶었다("시기별 관리
 *  포인트" 0개). 여기서는 앞선 규칙이 안 쓴 자리를 읽는다.
 *
 *  재물  재고(財庫) / 재생관 / 인성이 재성을 가리는 자리 / 재성 대 일간 비율 /
 *        시주 재성 / 세운 합 = 계약운 / 재성 공망
 *  직업  식신과 상관의 차이 / 정관과 편관의 차이 / 정인과 편인의 차이 /
 *        합국이 만드는 팀 성향 / 천간 투출 / 비겁 동업
 *  건강  오행 편중도 / 용신 오행별 관리법 / 일지 회복력 / 관성 과다 /
 *        재성 과다 과로 / 계절별 취약기 */

import {
  ELEMENTS, BRANCHES, STEMS, STEM_EL, BRANCH_EL, twelveStage, type ElIdx,
} from "../core/ganji";
import type { Rule, Facts } from "./types";
import { ga, eun, eul, ro } from "./types";

const el5 = (d: ElIdx) => ({
  비겁: d, 식상: ((d + 1) % 5) as ElIdx, 재성: ((d + 2) % 5) as ElIdx,
  관성: ((d + 3) % 5) as ElIdx, 인성: ((d + 4) % 5) as ElIdx,
});
const gods = (f: Facts) => f.a.tenGods.flatMap((t) => [t.stem, t.branch]);
const cnt = (f: Facts, ...n: string[]) => gods(f).filter((g) => n.includes(g as string)).length;
const ORGAN = ["간·담·눈·근육", "심장·혈관·소장", "위장·비장·소화기", "폐·대장·기관지·피부", "신장·방광·생식기·귀"];
/** 진술축미 — 사고(四庫). 창고 자리다. */
const STORE = [4, 10, 1, 7];

export const domain3Rules: Rule[] = [
  /* ═══════════ 재물 ═══════════ */
  {
    id: "재물-재고",
    topics: ["재물"],
    when: (f) => Object.values(f.a.pillars).some((p) => p && STORE.includes(p.branch)),
    weight: 79,
    tag: "재물-창고",
    prefer: ["부동산운"],
    text: (f) => {
      const seats = (["년", "월", "일", "시"] as const).filter((p) => f.a.pillars[p] && STORE.includes(f.a.pillars[p]!.branch));
      const bs = seats.map((p) => BRANCHES[f.a.pillars[p]!.branch]);
      return `${seats.join("·")}지에 ${bs.join("·")}${ga(bs[bs.length - 1])} 있습니다. 진·술·축·미는 명리에서 창고(庫)로 봅니다. 흘러가는 것이 아니라 쌓아 두는 자리라, 이 명식은 현금으로 굴리는 것보다 형태가 있는 것으로 묶어 두는 쪽에 맞습니다. 부동산·실물·장기 적립처럼 잠기는 자산에서 실제로 남습니다. 대신 창고는 열려야 쓸 수 있어서, 충이 오는 해에 큰 자산이 움직이는 일이 잦습니다.`;
    },
  },
  {
    id: "재물-재생관",
    topics: ["재물", "직업"],
    when: (f) => f.a.groupWeight.재성 >= 1.2 && f.a.groupWeight.관성 >= 1.2,
    weight: 80,
    tag: "재물-재생관",
    prefer: ["재물운의 큰 흐름"],
    text: (f) => {
      const E = el5(f.a.dayEl);
      return `재성 ${f.a.groupWeight.재성.toFixed(1)}, 관성 ${f.a.groupWeight.관성.toFixed(1)}로 둘 다 서 있습니다. 재성이 관성을 생하는 재생관(財生官) 구조입니다. 돈이 자리를 만들고 자리가 다시 돈을 지키는 회로라, 벌이가 늘면 사회적 위치도 같이 올라갑니다. 이 명식에서 돈은 숫자가 아니라 신용입니다. 반대로 신용에 금이 가면 재물 쪽이 먼저 무너집니다.`;
    },
  },
  {
    id: "재물-인성가림",
    topics: ["재물"],
    when: (f) => f.a.groupWeight.인성 >= 2 && f.a.groupWeight.재성 >= 1.5,
    weight: 72,
    tag: "재물-인재",
    prefer: ["돈 관리 방식"],
    text: (f) =>
      `인성 ${f.a.groupWeight.인성.toFixed(1)}과 재성 ${f.a.groupWeight.재성.toFixed(1)}이 함께 서 있습니다. 명리에서 재성은 인성을 극합니다. 돈을 좇으면 공부와 명분이 흔들리고, 명분을 세우면 돈이 밀리는 배치라 둘 사이에서 자주 저울질하게 됩니다. 답은 둘 중 하나를 버리는 게 아니라 시기를 나누는 것입니다. 배우는 시기와 버는 시기를 겹치지 않게 두면 이 갈등이 크게 줄어듭니다.`,
  },
  {
    id: "재물-비율",
    topics: ["재물"],
    when: () => true,
    weight: 75,
    tag: "재물-비율",
    prefer: ["투자운"],
    text: (f) => {
      const E = el5(f.a.dayEl);
      const self = f.a.groupWeight.비겁 + f.a.groupWeight.인성;
      const jae = f.a.groupWeight.재성;
      const ratio = self > 0 ? jae / self : jae;
      return `일간을 받쳐 주는 힘 ${self.toFixed(1)}에 재성 ${jae.toFixed(1)} — 비율로 ${ratio.toFixed(2)}배입니다. 명리에서 투자의 크기는 이 비율로 봅니다. ${
        ratio >= 1.2
          ? "감당할 수 있는 것보다 벌여 놓은 판이 큰 쪽이라, 레버리지를 쓰면 수익보다 변동에 먼저 잡아먹힙니다. 원금을 지키는 방식이 이 명식에는 수익률보다 중요합니다."
          : ratio >= 0.6
            ? "감당할 만한 크기입니다. 무리하지 않는 선에서 굴리면 결과가 노력에 비례해서 나옵니다. 한 번에 크게 걸지 않는 것만 지키면 됩니다."
            : "받쳐 주는 힘에 비해 벌여 놓은 것이 적습니다. 지나치게 몸을 사리는 쪽이라, 안 잃는 대신 안 늘어납니다. 잃어도 되는 크기를 정해 두고 그만큼은 굴려 보는 편이 이 명식에는 낫습니다."
      }`;
    },
  },
  {
    id: "재물-시주재성",
    topics: ["재물", "인생흐름"],
    when: (f) => !!f.a.pillars.시 && (["정재", "편재"] as string[]).includes(
      f.a.tenGods.find((t) => t.pos === "시")?.stem as string ?? "",
    ),
    weight: 71,
    tag: "재물-말년",
    prefer: ["재물운의 큰 흐름"],
    text: (f) =>
      `시주 천간이 재성입니다. 시주는 인생 뒤쪽과 자식·노후를 맡는 자리라, 재물이 늦게 자리 잡는 배치입니다. 젊을 때 크게 모이지 않아도 방향이 틀린 게 아닙니다. 오히려 이른 나이에 크게 벌면 지키기가 어렵고, 40대 이후에 붙는 것이 끝까지 남습니다. 노후 자산을 일찍부터 따로 떼어 두는 방식이 이 명식과 잘 맞습니다.`,
  },
  {
    id: "재물-계약운",
    topics: ["재물", "직업"],
    when: (f) => f.years.some((y) => y.combos.length > 0),
    weight: 73,
    tag: "재물-계약",
    prefer: ["소비·투자 습관"],
    text: (f) => {
      const y = f.years.find((x) => x.combos.length > 0)!;
      return `${y.year}년(${y.ganji}, ${y.age}세)에 원국의 ${y.combos.join("·")}${wa3(y.combos[y.combos.length - 1])} 합을 이룹니다. 합은 묶는 자리라 계약·동업·매매처럼 서명이 오가는 일이 이 해에 몰립니다. 좋은 계약도 나쁜 계약도 같이 잘 성사되는 해라는 뜻이라, 이 해에는 조건을 평소보다 한 번 더 읽어 보는 편이 안전합니다.`;
    },
  },

  /* ═══════════ 직업 ═══════════ */
  {
    id: "직업-식신상관",
    topics: ["직업", "매력"],
    when: (f) => cnt(f, "식신", "상관") > 0,
    weight: 82,
    tag: "직업-식상종류",
    prefer: ["성공하기 쉬운"],
    text: (f) => {
      const sik = cnt(f, "식신"), sang = cnt(f, "상관");
      return sik >= sang
        ? `식신이 ${sik}개로 상관(${sang}개)보다 많습니다. 같은 표현이라도 식신은 쌓아서 내놓는 결입니다. 꾸준히 만들고 다듬어 완성도로 승부하는 쪽이라, 오래 파는 일에서 값이 매겨집니다. 반짝이는 아이디어보다 끝까지 끌고 가는 힘이 이 사람의 무기입니다.`
        : `상관이 ${sang}개로 식신(${sik}개)보다 많습니다. 상관은 기존의 틀을 건드려서 내놓는 결입니다. 남들이 당연하게 여기는 지점에서 "왜 이렇게 하지?"가 먼저 나오는 쪽이라, 개선하고 바꾸는 자리에서 재능이 드러납니다. 대신 그 힘이 사람을 향하면 마찰이 되니, 대상이 일이어야 합니다.`;
    },
  },
  {
    id: "직업-정관편관",
    topics: ["직업"],
    when: (f) => cnt(f, "정관", "편관") > 0,
    weight: 81,
    tag: "직업-관종류",
    prefer: ["맞는 일의 방식"],
    text: (f) => {
      const j = cnt(f, "정관"), p = cnt(f, "편관");
      return j >= p
        ? `정관이 ${j}개로 편관(${p}개)보다 많습니다. 정관은 정해진 규칙 안에서 인정받는 자리입니다. 절차가 분명하고 평가 기준이 공개된 조직에서 실력이 제값을 받습니다. 반대로 규칙이 수시로 바뀌는 곳에서는 능률이 크게 떨어집니다.`
        : `편관이 ${p}개로 정관(${j}개)보다 많습니다. 편관은 압력으로 사람을 세우는 자리입니다. 평온한 환경보다 마감과 위기가 있는 자리에서 오히려 능력이 나옵니다. 응급·수사·현장·영업처럼 긴장이 상시인 곳이 여기 해당하고, 편한 자리에 오래 있으면 스스로 지루해서 무너집니다.`;
    },
  },
  {
    id: "직업-정인편인",
    topics: ["직업", "성격"],
    when: (f) => cnt(f, "정인", "편인") > 0,
    weight: 76,
    tag: "직업-인종류",
    prefer: ["직업 적성과 일의 그릇"],
    text: (f) => {
      const j = cnt(f, "정인"), p = cnt(f, "편인");
      return j >= p
        ? `정인이 ${j}개로 편인(${p}개)보다 많습니다. 정인은 정통으로 배우는 자리입니다. 커리큘럼이 있고 스승이 있는 방식에서 가장 빨리 늡니다. 학위·자격·공인된 과정이 실제 수입으로 바뀌는 명식이라, 독학으로 돌아가는 길은 이 사람에게 비용이 큽니다.`
        : `편인이 ${p}개로 정인(${j}개)보다 많습니다. 편인은 남들이 안 가는 길로 배우는 자리입니다. 정해진 과정보다 스스로 파고드는 방식이 맞고, 그래서 전공과 다른 데서 밥을 먹는 경우가 많습니다. 기술·분석·틈새 전문 쪽에서 값이 매겨집니다.`;
    },
  },
  {
    id: "직업-합국",
    topics: ["직업", "인생흐름"],
    when: (f) => f.a.relations.some((r) => r.kind === "삼합" || r.kind === "방합"),
    weight: 74,
    tag: "직업-합국",
    prefer: ["시너지가 나는"],
    text: (f) => {
      const r = f.a.relations.find((x) => x.kind === "삼합" || x.kind === "방합")!;
      return `${r.between.join("·")}지가 ${r.chars} ${r.kind}을 이룹니다${r.el !== undefined ? `(${ELEMENTS[r.el]} 국)` : ""}. 여러 글자가 하나로 뭉치는 자리라, 이 사람은 혼자보다 판이 짜였을 때 힘이 배로 나옵니다. 팀·조합·연대가 실제로 성과를 키우는 구조입니다. 다만 뭉친 기운이 ${r.el !== undefined && r.el === f.a.avoidEl ? "부담이 되는 쪽이라, 사람이 몰릴수록 오히려 소모가 큽니다. 규모보다 사람을 고르는 게 중요합니다." : "쓸 만한 쪽이라, 사람을 모으는 자리에 서면 그만큼 결과가 커집니다."}`;
    },
  },
  {
    id: "직업-투출",
    topics: ["직업", "매력"],
    when: (f) => f.a.tenGods.some((t) => t.pos !== "일" && t.stem !== "일간"),
    weight: 68,
    tag: "직업-투출",
    prefer: ["직업 적성과 일의 그릇"],
    text: (f) => {
      const out = f.a.tenGods.filter((t) => t.pos !== "일").map((t) => `${t.pos}간 ${t.stem}`);
      return `천간에 드러난 십신은 ${out.join(", ")}입니다. 천간은 밖으로 보이는 자리라, 여기 뜬 것이 남들이 아는 이 사람의 재능입니다. 지지에만 있고 천간에 안 뜬 능력은 본인만 알고 남은 모르는 힘으로 남습니다. 커리어에서 저평가된다고 느낀다면, 없는 능력을 만들 게 아니라 이미 있는 이 자리들을 밖으로 보이게 만드는 쪽이 빠릅니다.`;
    },
  },
  {
    id: "직업-비겁동업",
    topics: ["직업", "재물"],
    when: (f) => f.a.groupWeight.비겁 >= 1.8,
    weight: 70,
    tag: "직업-동업",
    prefer: ["시너지가 나는"],
    text: (f) =>
      `비겁이 ${f.a.groupWeight.비겁.toFixed(1)}로 실려 있습니다. 비겁은 나와 같은 편, 곧 동료이자 경쟁자입니다. 사람이 늘 곁에 있는 구조라 혼자 일하는 방식은 이 명식에 답답합니다. 다만 같은 편은 몫을 나누는 쪽이기도 해서, 역할과 배분을 문서로 정해 두지 않으면 반드시 그 지점에서 갈립니다. 친할수록 계약서를 쓰는 편이 관계를 지킵니다.`,
  },

  /* ═══════════ 건강 ═══════════ */
  {
    id: "건강-편중도",
    topics: ["건강", "성격"],
    when: () => true,
    weight: 82,
    tag: "건강-편중",
    prefer: ["타고난 체질"],
    text: (f) => {
      const w = f.a.elementWeight;
      const avg = w.reduce((a, b) => a + b, 0) / 5;
      const sd = Math.sqrt(w.reduce((a, b) => a + (b - avg) ** 2, 0) / 5);
      const max = w.indexOf(Math.max(...w)), min = w.indexOf(Math.min(...w));
      return `오행 분포는 목 ${w[0].toFixed(1)} · 화 ${w[1].toFixed(1)} · 토 ${w[2].toFixed(1)} · 금 ${w[3].toFixed(1)} · 수 ${w[4].toFixed(1)}입니다. 고르기의 척도로 보면 편차가 ${sd.toFixed(2)}입니다. ${
        sd >= 1.2
          ? `한쪽으로 크게 쏠린 편입니다. ${ELEMENTS[max]}${eun(ELEMENTS[max])} 넘치고 ${ELEMENTS[min]}${eun(ELEMENTS[min])} 비어서, 잘하는 것과 못하는 것의 차이가 극단적으로 납니다. 몸에서도 ${ORGAN[max]} 쪽 과부하와 ${ORGAN[min]} 쪽 결핍이 동시에 나타나기 쉽습니다.`
          : `비교적 고른 편입니다. 극단적으로 약한 자리가 없어 큰 병으로 가는 경우가 드문 대신, 특별히 강한 자리도 없어 무리하면 여기저기 동시에 신호가 옵니다.`
      }`;
    },
  },
  {
    id: "건강-용신관리",
    topics: ["건강"],
    when: () => true,
    weight: 84,
    tag: "건강-처방",
    prefer: ["필요한 건강 관리법"],
    text: (f) => {
      const HOW = [
        "몸을 펴고 움직이는 것 — 스트레칭·걷기처럼 뻗는 동작이 이 기운을 불러옵니다. 아침 햇빛과 초록을 가까이 두는 것도 같은 자리에 듭니다",
        "몸을 덥히고 순환을 올리는 것 — 가벼운 유산소, 따뜻한 음식, 사람과 웃는 자리가 이 기운을 채웁니다",
        "규칙적으로 먹고 소화를 지키는 것 — 끼니 시간을 고정하는 것 하나가 이 명식에는 영양제보다 큽니다",
        "정리하고 비우는 것 — 호흡 운동, 정돈된 공간, 매운 것과 자극을 줄이는 식단이 이 기운을 세웁니다",
        "쉬고 잠기는 것 — 수분, 충분한 수면, 혼자 있는 시간이 이 기운을 회복시킵니다",
      ];
      return `이 명식에 필요한 기운은 ${ELEMENTS[f.a.useEl]}(${ORGAN[f.a.useEl]})입니다. 건강 관리도 여기에 맞춥니다. ${HOW[f.a.useEl]}. 반대로 기신인 ${ELEMENTS[f.a.avoidEl]}(${ORGAN[f.a.avoidEl]}) 쪽을 더 자극하는 습관은 같은 노력으로 손해가 납니다.`;
    },
  },
  {
    id: "건강-회복력",
    topics: ["건강"],
    when: () => true,
    weight: 73,
    tag: "건강-회복",
    prefer: ["맞는 생활 리듬"],
    text: (f) => {
      const b = f.a.pillars.일!.branch;
      const st = twelveStage(f.a.dayStem, b);
      const fast = ["장생", "관대", "건록", "제왕", "목욕"].includes(st);
      return `일지 ${BRANCHES[b]}에서 일간은 ${st}에 놓입니다. 회복 속도를 보는 자리입니다. ${
        fast
          ? `기운이 올라 있는 구간이라 회복이 빠른 편입니다. 하루 자고 나면 웬만한 건 돌아옵니다. 문제는 그 회복력을 믿고 계속 몰아붙이다가 누적이 임계를 넘는 것이라, 이 명식에는 회복력보다 총량 관리가 중요합니다.`
          : `기운이 내려간 구간이라 회복이 더딘 편입니다. 무리한 다음 날 하루로 안 돌아옵니다. 대신 리듬을 지키면 큰 병 없이 오래 가는 쪽이라, 몰아 쓰고 몰아 쉬는 방식보다 매일 조금씩이 훨씬 잘 맞습니다.`
      }`;
    },
  },
  {
    id: "건강-관성압박",
    topics: ["건강", "직업"],
    when: (f) => f.a.groupWeight.관성 >= 2.5 && !f.a.strong,
    weight: 78,
    tag: "건강-압박",
    prefer: ["스트레스 관리법"],
    text: (f) => {
      const E = el5(f.a.dayEl);
      return `관성이 ${f.a.groupWeight.관성.toFixed(1)}로 두꺼운데 일간은 받쳐 주는 힘이 얇습니다(${f.a.strengthScore}점). 관성은 나를 누르는 자리라, 이 배치는 늘 감당보다 큰 책임을 지고 있는 구조입니다. 스트레스가 성격이 아니라 명식에서 옵니다. ${ELEMENTS[E.관성]}(${ORGAN[E.관성]}) 쪽에 먼저 신호가 오고, 잠과 소화에서 티가 납니다. 이 명식에 필요한 건 견디는 법이 아니라 짐을 덜어내는 결정입니다.`;
    },
  },
  {
    id: "건강-재성과로",
    topics: ["건강", "재물"],
    when: (f) => f.a.groupWeight.재성 >= 2.5 && !f.a.strong,
    weight: 74,
    tag: "건강-과로",
    prefer: ["시기별 관리 포인트"],
    text: (f) =>
      `재성이 ${f.a.groupWeight.재성.toFixed(1)}로 두꺼운데 일간이 그걸 감당할 힘은 ${(f.a.groupWeight.비겁 + f.a.groupWeight.인성).toFixed(1)}입니다. 재성은 몸을 써서 얻는 자리라, 이 차이는 곧 과로로 나타납니다. 일이 많아서가 아니라 쉬는 법을 모르는 쪽입니다. 벌 수 있을 때 벌어 두자는 생각이 이 명식에서는 가장 비싼 판단이 됩니다. 수입이 늘어나는 구간일수록 검진 주기를 짧게 잡아야 합니다.`,
  },
  {
    id: "건강-취약계절",
    topics: ["건강"],
    when: () => true,
    weight: 70,
    tag: "건강-계절",
    prefer: ["시기별 관리 포인트"],
    text: (f) => {
      const SEASON_EL: Record<number, string> = { 0: "봄(2~4월)", 1: "여름(5~7월)", 2: "환절기(3·6·9·12월)", 3: "가을(8~10월)", 4: "겨울(11~1월)" };
      return `기신은 ${ELEMENTS[f.a.avoidEl]}${ira3(ELEMENTS[f.a.avoidEl])} ${SEASON_EL[f.a.avoidEl]}에 컨디션이 가장 크게 흔들립니다. 반대로 용신 ${ELEMENTS[f.a.useEl]}에 해당하는 ${SEASON_EL[f.a.useEl]}에는 같은 강도로 움직여도 덜 지칩니다. 큰 일정과 무리한 계획은 이 두 구간을 기준으로 배치하는 것만으로 한 해 전체의 체력 운용이 달라집니다.`;
    },
  },
];

function ira3(w: string) {
  const c = w.charCodeAt(w.length - 1);
  return (c - 0xac00) % 28 !== 0 ? "이라" : "라";
}

function wa3(w: string) {
  const c = w.charCodeAt(w.length - 1);
  return (c - 0xac00) % 28 !== 0 ? "과" : "와";
}
