/** 자미두수 유년(流年) 규칙 — "올해·내년이 어떤 해인가"를 명반으로 답한다.
 *
 *  사주의 세운이 오행으로 그해를 재는 자리라면, 자미두수의 유년은 열두 궁 중
 *  어느 영역이 그해의 주제가 되는지를 짚는 자리다. 둘은 다른 각도라 서로를 대신하지
 *  못한다. 세운은 "잘 풀리는 해인가", 유년은 "무엇이 걸리는 해인가"를 말한다.
 *
 *    유년 명궁   그해의 명궁이 원국의 어느 궁 자리에 앉는가 → 그해의 주제
 *    화록(祿)    재물·기회가 열리는 궁
 *    화기(忌)    막히고 손실이 나는 궁
 *
 *  ⚠️ 사화 배정은 유파에 따라 조금씩 다르다. iztro가 쓰는 통용 배정을 따른다. */

import { PALACE_AREA } from "../core/ziwei";
import type { Rule, Facts } from "./types";
import { ga, eun, eul, ro } from "./types";

const area = (p?: string) => (p ? PALACE_AREA[p] ?? p : undefined);
const yrs = (f: Facts) => f.chart.yearly ?? [];

export const ziweiYearRules: Rule[] = [
  {
    id: "유년-올해주제",
    topics: ["인생흐름", "전성기", "대운"],
    when: (f) => yrs(f).length > 0,
    weight: 86,
    tag: "유년-주제",
    prefer: ["대운이 바뀌는", "전성기"],
    text: (f) => {
      const [now, next] = yrs(f);
      return `자미두수로 올해를 보면, ${now.year}년(${now.ganji})의 유년 명궁이 원국 ${now.seat}궁 자리에 앉습니다. ${now.seat}궁은 ${area(now.seat)}를 맡는 자리라, 올해 이 사람의 관심과 사건이 그쪽으로 몰립니다.${
        next ? ` 내년 ${next.year}년(${next.ganji})에는 ${next.seat}궁으로 옮겨 가 주제가 ${area(next.seat)} 쪽으로 바뀝니다.` : ""
      } 사주의 세운이 "잘 풀리는 해인가"를 재는 자리라면, 유년은 "무엇이 걸리는 해인가"를 짚는 자리입니다.`;
    },
  },
  {
    id: "유년-화록",
    topics: ["재물", "전성기", "직업"],
    when: (f) => yrs(f).some((y) => y.lucky),
    weight: 84,
    tag: "유년-화록",
    prefer: ["모이는 시기", "유리한 시기"],
    text: (f) => {
      const list = yrs(f).filter((y) => y.lucky).slice(0, 3);
      const first = list[0];
      const m = first.mutagens.find((x) => x.kind === "화록")!;
      return `자미두수에서 그해의 기회가 어디서 열리는지는 화록(化祿)이 어느 궁에 드는지로 봅니다. ${first.year}년(${first.ganji})에는 화록이 ${m.star}에 붙어 ${first.lucky}궁에 듭니다. ${first.lucky}궁은 ${area(first.lucky)}를 맡는 자리라, 그해에는 그쪽에서 실제로 길이 열립니다.${
        list.length > 1
          ? ` 이어지는 해로는 ${list.slice(1).map((y) => `${y.year}년 ${y.lucky}궁`).join(", ")}입니다.`
          : ""
      }`;
    },
  },
  {
    id: "유년-화기",
    topics: ["연애주의", "건강", "재물"],
    when: (f) => yrs(f).some((y) => y.blocked),
    weight: 83,
    tag: "유년-화기",
    prefer: ["잃기 쉬운", "흔들리기 쉬운", "주의할 시기와 선택"],
    text: (f) => {
      const list = yrs(f).filter((y) => y.blocked).slice(0, 3);
      const first = list[0];
      const m = first.mutagens.find((x) => x.kind === "화기")!;
      return `반대로 막히는 자리는 화기(化忌)가 짚습니다. ${first.year}년(${first.ganji})에는 화기가 ${m.star}에 붙어 ${first.blocked}궁에 듭니다. ${first.blocked}궁은 ${area(first.blocked)}를 맡습니다. 그해에 그 영역에서 손이 많이 가고 뜻대로 안 되는 일이 겹칩니다. 나쁜 일이 정해져 있다는 뜻이 아니라, 그 자리에 힘을 쏟아도 남는 게 적으니 큰 결정을 그 영역에 몰아 두지 말라는 뜻입니다.${
        list.length > 1 ? ` 같은 방식으로 ${list.slice(1).map((y) => `${y.year}년은 ${y.blocked}궁`).join(", ")}이 걸립니다.` : ""
      }`;
    },
  },
  {
    id: "유년-연애해",
    topics: ["연애시기", "결혼시기", "배우자"],
    when: (f) => yrs(f).some((y) => y.seat === "부처" || y.lucky === "부처"),
    weight: 85,
    tag: "유년-연애",
    prefer: ["연애운이 가장 좋은 시기", "결혼 예상 나이", "새로운 인연이 들어오는"],
    text: (f) => {
      const seat = yrs(f).find((y) => y.seat === "부처");
      const lucky = yrs(f).find((y) => y.lucky === "부처");
      const bad = yrs(f).find((y) => y.blocked === "부처");
      const parts: string[] = [];
      if (seat) parts.push(`${seat.year}년(${seat.ganji})은 유년 명궁이 부처궁 자리에 앉습니다. 그해의 주제가 관계 자체가 된다는 뜻이라, 만남이든 정리든 이 영역에서 사건이 납니다`);
      if (lucky && lucky.year !== seat?.year) parts.push(`${lucky.year}년에는 화록이 부처궁에 들어 관계 쪽이 열립니다`);
      if (bad) parts.push(`반대로 ${bad.year}년에는 화기가 부처궁에 들어, 애써도 관계가 잘 안 풀리는 해로 봅니다`);
      return `자미두수에서 연애와 배우자를 보는 자리는 부처궁입니다. ${parts.join(". ")}. 사주의 세운과 겹쳐 보면, 두 체계가 같은 해를 가리킬 때 그 시기의 신호가 가장 뚜렷합니다.`;
    },
  },
  {
    id: "유년-일해",
    topics: ["직업", "전성기"],
    when: (f) => yrs(f).some((y) => y.seat === "관록" || y.lucky === "관록" || y.blocked === "관록"),
    weight: 82,
    tag: "유년-직업",
    prefer: ["승진 운의 흐름", "커리어 전환에 유리한 시기"],
    text: (f) => {
      const seat = yrs(f).find((y) => y.seat === "관록");
      const lucky = yrs(f).find((y) => y.lucky === "관록");
      const bad = yrs(f).find((y) => y.blocked === "관록");
      const parts: string[] = [];
      if (seat) parts.push(`${seat.year}년(${seat.ganji})은 유년 명궁이 관록궁 자리에 앉아, 일이 그해의 중심이 됩니다`);
      if (lucky) parts.push(`${lucky.year}년에는 화록이 관록궁에 들어 자리와 기회가 열립니다`);
      if (bad) parts.push(`${bad.year}년에는 화기가 관록궁에 들어, 이직이나 승진을 이 해에 밀어붙이면 품만 들기 쉽습니다`);
      return `일과 직위는 관록궁이 맡습니다. ${parts.join(". ")}. 자미두수는 어느 영역이 걸리는지를 짚고, 사주 세운은 그 영역이 잘 풀릴지를 잽니다. 둘을 겹쳐 보는 편이 정확합니다.`;
    },
  },
  {
    id: "유년-몸해",
    topics: ["건강"],
    when: (f) => yrs(f).some((y) => y.seat === "질액" || y.blocked === "질액"),
    weight: 80,
    tag: "유년-건강",
    prefer: ["흔들리기 쉬운", "시기별 관리 포인트"],
    text: (f) => {
      const seat = yrs(f).find((y) => y.seat === "질액");
      const bad = yrs(f).find((y) => y.blocked === "질액");
      const parts: string[] = [];
      if (seat) parts.push(`${seat.year}년(${seat.ganji})은 유년 명궁이 질액궁 자리에 앉습니다. 몸이 그해의 주제가 된다는 뜻이라, 미뤄 둔 검진이나 치료가 이 해에 몰리기 쉽습니다`);
      if (bad) parts.push(`${bad.year}년에는 화기가 질액궁에 들어, 컨디션이 특히 무거운 해로 봅니다`);
      return `건강을 보는 자리는 질액궁입니다. ${parts.join(". ")}. 사주 쪽에서 기신이 드는 해와 겹치면 그 해는 일정을 확실히 줄이는 편이 낫습니다.`;
    },
  },
];
