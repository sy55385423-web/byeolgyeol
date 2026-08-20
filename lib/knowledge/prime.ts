/** 전성기 · 연애시기 규칙 — 대운(大運)에서 읽는다.
 *
 *  "몇 살이 전성기냐"는 질문에 원국만으로 답할 수는 없다. 원국은 타고난 배치이고,
 *  그게 언제 열리는지는 대운이 정한다. 10년마다 바뀌는 간지를 용신·기신과 대조하면
 *  어느 구간이 순풍이고 어느 구간이 역풍인지 실제 나이로 나온다.
 *
 *  점수 매기는 법 — 그 대운의 천간·지지가 각각
 *    용신이면 +3, 희신이면 +2, 기신이면 −3, 기신을 생하면 −1
 *  지지는 계절을 쥐고 있어 천간보다 무겁게 본다.
 *
 *  ⚠️ 대운은 유파에 따라 지지만 보기도, 천간·지지를 5년씩 나눠 보기도 한다.
 *  여기서는 10년을 한 덩어리로 두되 지지에 가중치를 준다. */

import { ELEMENTS, STEMS, BRANCHES, STEM_EL, BRANCH_EL, tenGod, branchClash, branchSix, type ElIdx } from "../core/ganji";
import { scoreDecadals, elementScore, type DecadalScore } from "../core/luck";
import type { Rule, Facts } from "./types";
import { ga, eun, ro, wa } from "./types";

/** 대운 점수는 lib/core/luck.ts가 낸다. 리포트 값 계산 쪽에서도 같은 함수를 쓰므로
 *  제목의 나이와 본문의 나이가 어긋날 수 없다. */
export const decadalScores = (f: Facts) =>
  scoreDecadals(f.a, f.chart.luck?.list ?? []);

type Span = DecadalScore;

const span = (s: Span) => `${s.age}세부터 ${s.age + 9}세`;

export const primeRules: Rule[] = [
  {
    id: "전성기-대운",
    topics: ["전성기"],
    when: (f) => decadalScores(f).some((s) => s.score > 0),
    weight: 93,
    tag: "전성기-구간",
    prefer: ["전성기"],
    text: (f) => {
      const all = decadalScores(f);
      const best = [...all].sort((a, b) => b.score - a.score)[0];
      const now = new Date().getFullYear() - f.chart.birthYear + 1;
      const cur = all.find((s) => now >= s.age && now < s.age + 10);
      const when = best.age + 9 < now ? "지나왔습니다." : best.age > now ? "아직 앞에 있습니다." : "지금 걷고 있는 구간입니다.";
      // 최고 구간이 한참 뒤면 그 사실만 말해 봐야 쓸모가 없다. 앞으로 30년 안에서
      // 가장 나은 구간을 같이 짚어 준다. 둘 다 같은 기준(용신)으로 고르므로 어긋나지 않는다.
      const near = all
        .filter((sp) => sp.age + 9 >= now && sp.age <= now + 30 && sp.age !== best.age)
        .sort((a, b) => b.score - a.score)[0];
      const nearLine =
        best.age > now + 30 && near
          ? ` 그 전까지로 좁히면 ${span(near)}의 ${near.ko} 대운이 가장 낫습니다(${near.why.join(", ") || "크게 거스르는 자리가 없음"}).`
          : "";
      return `대운 여덟 구간을 용신 ${ELEMENTS[f.a.useEl]} 기준으로 재 보면, 가장 순풍인 자리는 ${span(best)}의 ${best.ko} 대운입니다(${best.why.join(", ")}). 이 구간은 ${when}${
        cur && cur.age !== best.age ? ` 지금은 ${span(cur)}의 ${cur.ko} 대운을 지나는 중입니다.` : ""
      }${nearLine} 전성기란 능력이 갑자기 늘어나는 때가 아니라, 원래 갖고 있던 것이 마침 통하는 환경을 만나는 때입니다.`;
    },
  },
  {
    id: "전성기-역풍",
    topics: ["전성기", "대운", "건강"],
    when: (f) => decadalScores(f).some((s) => s.score <= -3),
    weight: 81,
    tag: "전성기-역풍",
    prefer: ["전성기"],
    text: (f) => {
      const all = decadalScores(f);
      const worst = [...all].sort((a, b) => a.score - b.score)[0];
      const now = new Date().getFullYear() - f.chart.birthYear + 1;
      const passed = worst.age + 9 < now;
      return `반대로 ${span(worst)}의 ${worst.ko} 대운은 기신 ${ELEMENTS[f.a.avoidEl]} 쪽으로 기웁니다(${worst.why.join(", ")}). ${
        passed
          ? "이미 지나온 구간입니다. 그 시기에 유독 안 풀렸던 일이 있었다면 능력 문제가 아니라 환경이 반대로 불던 때였습니다."
          : "무엇을 해도 안 되는 시기라는 뜻은 아닙니다. 다만 이 구간에는 새로 벌이기보다 이미 있는 것을 지키는 쪽이 남는 장사입니다."
      }`;
    },
  },
  {
    id: "전성기-지금대운",
    topics: ["대운", "전성기", "직업"],
    when: (f) => !!f.luck,
    weight: 88,
    tag: "전성기-현재",
    text: (f) => {
      const l = f.luck!;
      const se = STEM_EL[l.stem], be = BRANCH_EL[l.branch];
      const ss = elementScore(f.a, se), bs = elementScore(f.a, be);
      const tot = ss + bs * 1.5;
      const tone =
        tot >= 3 ? "순풍입니다. 하고 싶은 일을 벌이기에 이만한 구간이 자주 오지 않습니다. 미루던 것을 이 안에서 시작하는 편이 낫습니다."
        : tot > 0 ? "나쁘지 않습니다. 크게 밀어주지는 않아도 막지도 않는 구간이라, 결과가 노력에 비례해서 나옵니다."
        : tot === 0 ? "중립입니다. 외부에서 밀어주는 힘이 약하니 판을 키우기보다 실력을 쌓아 두는 쪽이 다음 구간에 유리합니다."
        : "역풍 쪽입니다. 같은 일을 해도 품이 더 들어가는 구간이라, 성과가 안 나는 걸 자기 탓으로만 돌리지 않는 게 중요합니다.";
      return `지금 걷는 대운은 ${l.age}세부터 시작된 ${l.ko}입니다. 천간 ${STEMS[l.stem]}${eun(STEMS[l.stem])} ${ELEMENTS[se]}, 지지 ${BRANCHES[l.branch]}${eun(BRANCHES[l.branch])} ${ELEMENTS[be]}${ro(ELEMENTS[be])}, 용신 ${ELEMENTS[f.a.useEl]} 기준으로 보면 ${tone}`;
    },
  },
  {
    id: "전성기-대운방향",
    topics: ["대운", "전성기", "인생흐름"],
    when: (f) => f.genderKnown,
    weight: 64,
    tag: "전성기-방향",
    prefer: ["대운이 바뀌는"],
    text: (f) => {
      // 년주 천간이 양간(갑·병·무·경·임)이면 양년이다. 서기 연도의 홀짝으로 어림하면
      // 안 된다 — 1998년은 무인년이라 양년인데 짝수 해다. 실제 간지를 본다.
      const yang = f.a.pillars.년!.stem % 2 === 0;
      return `대운은 ${f.luckStartAge}세부터 ${f.luckForward ? "순행" : "역행"}합니다. ${
        f.isMale ? "남명" : "여명"
      }이고 태어난 해가 ${yang ? "양년" : "음년"}이라 방향이 이렇게 정해집니다. ${
        f.luckForward
          ? "월주에서 앞으로 나아가는 흐름이라, 태어난 계절이 다음 계절로 넘어가는 결을 따라갑니다."
          : "월주에서 거슬러 올라가는 흐름이라, 태어난 계절 이전으로 되짚어 가는 결을 따라갑니다."
      } 대운이 바뀌는 ${f.luckStartAge}세·${f.luckStartAge + 10}세·${f.luckStartAge + 20}세 언저리는 환경이 실제로 바뀌는 자리라, 이 무렵의 선택이 다음 10년을 정합니다.`;
    },
  },

  {
    id: "대운-십신",
    topics: ["대운", "인생흐름", "직업"],
    when: (f) => !!f.luck,
    weight: 82,
    tag: "대운-십신",
    prefer: ["대운이 바뀌는"],
    text: (f) => {
      const g = tenGod(f.a.dayStem, f.luck!.stem);
      const desc: Record<string, string> = {
        비견: "같은 편이 늘어나는 구간입니다. 동료·동업·비슷한 처지의 사람이 붙는데, 그만큼 몫을 나눠야 하는 일도 같이 생깁니다",
        겁재: "경쟁이 붙는 구간입니다. 자극이 되는 대신 돈과 사람을 두고 부딪히기 쉬워, 계산이 필요한 자리에서 정을 앞세우면 손해가 납니다",
        식신: "내보내는 힘이 커지는 구간입니다. 만들고 표현하고 가르치는 일에서 결과가 잘 나옵니다",
        상관: "하고 싶은 말이 많아지는 구간입니다. 재능이 크게 드러나는 대신 윗사람과 부딪히기 쉬워, 어디서 말할지를 고르는 게 관건입니다",
        편재: "판이 커지는 구간입니다. 큰돈과 큰 기회가 오가는데, 들어오는 만큼 나가기도 해서 남는 걸 따로 챙겨야 합니다",
        정재: "차곡차곡 쌓이는 구간입니다. 크게 터지지는 않아도 실제로 남는 것이 생기는 시기입니다",
        편관: "압력이 들어오는 구간입니다. 책임이 무거워지고 긴장이 상시화되는데, 버텨 내면 이 구간 이후로 급이 달라집니다",
        정관: "자리가 잡히는 구간입니다. 조직·직함·공적인 인정이 붙습니다. 대신 규칙에 매이는 답답함도 같이 옵니다",
        편인: "생각이 깊어지는 구간입니다. 공부와 자격에 인연이 있는데, 실행이 늦어져 기회를 놓치기도 합니다",
        정인: "받쳐 주는 힘이 들어오는 구간입니다. 도움과 문서운이 붙습니다. 다만 기대는 데 익숙해지면 스스로 여는 힘이 줄어듭니다",
      };
      return `지금 대운의 천간 ${STEMS[f.luck!.stem]}${eun(STEMS[f.luck!.stem])} 일간에게 ${g}입니다. ${desc[g]}. 대운은 환경이지 성격이 아닙니다. 이 10년 동안 자기가 달라진 것처럼 느껴진다면, 달라진 건 사람이 아니라 판입니다.`;
    },
  },
  {
    id: "대운-일지충합",
    topics: ["대운", "인생흐름", "연애주의"],
    when: (f) => {
      if (!f.luck) return false;
      const b = f.a.pillars.일!.branch;
      return branchClash(b, f.luck.branch) || branchSix(b, f.luck.branch);
    },
    weight: 80,
    tag: "대운-일지",
    text: (f) => {
      const b = f.a.pillars.일!.branch;
      const clash = branchClash(b, f.luck!.branch);
      return `지금 대운의 지지 ${BRANCHES[f.luck!.branch]}${ga(BRANCHES[f.luck!.branch])} 원국 일지 ${BRANCHES[b]}${wa(BRANCHES[b])} ${clash ? "충합니다" : "육합합니다"}. 일지는 배우자 자리이자 이 사람이 편안하게 느끼는 자리라, ${
        clash
          ? "이 10년은 사는 자리와 가까운 관계가 흔들리는 구간입니다. 이사·이직·관계 정리가 이 안에서 몰리기 쉽습니다. 흔들림 자체는 막을 수 없으니, 흔들릴 때 무엇을 남길지 미리 정해 두는 편이 낫습니다."
          : "이 10년은 자리가 묶이는 구간입니다. 관계가 실제로 정해지거나 한곳에 오래 머무는 결정이 이 안에서 나기 쉽습니다. 안정되는 대신 새로 벌이는 일은 뒤로 밀립니다."
      }`;
    },
  },

  /* ───────── 연애시기 ───────── */
  {
    id: "연애시기-대운도화",
    topics: ["연애시기", "결혼시기"],
    when: (f) => f.chart.luck?.list?.some((d) => [0, 3, 6, 9].includes(d.branch)) ?? false,
    weight: 79,
    tag: "연애시기-대운",
    text: (f) => {
      const now = new Date().getFullYear() - f.chart.birthYear + 1;
      const hits = f.chart.luck!.list.filter((d) => [0, 3, 6, 9].includes(d.branch));
      const next = hits.find((d) => d.age + 9 >= now) ?? hits[hits.length - 1];
      return `대운 지지에 자·묘·오·유가 드는 구간은 사람이 붙는 자리로 봅니다. ${f.who}의 경우 ${next.age}세부터 ${next.age + 9}세의 ${next.ko} 대운이 여기 해당합니다. ${
        next.age > now
          ? "아직 오지 않은 구간이라, 지금 인연이 뜸하다고 해서 앞으로도 그럴 거라고 볼 이유는 없습니다."
          : next.age + 9 < now
            ? "이미 지나온 구간입니다. 그때 만난 사람이 유독 많았다면 우연이 아니었습니다."
            : "지금 그 안에 있습니다. 이 10년 동안은 움직인 만큼 사람이 붙습니다."
      }`;
    },
  },
  {
    id: "연애시기-배우자성운",
    topics: ["연애시기", "결혼시기", "배우자"],
    when: (f) => f.genderKnown && f.years.length > 0,
    weight: 86,
    tag: "연애시기-세운",
    text: (f) => {
      const target = f.isMale ? "재성" : "관성";
      // 배우자성에 해당하는 오행 — 남명은 일간이 극하는 것, 여명은 일간을 극하는 것
      const el = (f.isMale ? (f.a.dayEl + 2) % 5 : (f.a.dayEl + 3) % 5) as ElIdx;
      const hit = f.years.filter((y) => {
        const g = STEM_EL[y.stem] === el || BRANCH_EL[y.branch] === el;
        return g;
      });
      if (!hit.length)
        return `${f.isMale ? "남명" : "여명"}에서 인연을 보는 ${target}은 ${ELEMENTS[el]}입니다. 앞으로 10년 세운에는 ${ELEMENTS[el]}${ga(ELEMENTS[el])} 직접 드는 해가 없습니다. 인연이 없다는 뜻이 아니라, 해가 밀어주기보다 본인이 움직여야 하는 10년이라는 뜻입니다.`;
      const ys = hit.slice(0, 3).map((y) => `${y.year}년(${y.ganji})`).join(", ");
      return `${f.isMale ? "남명" : "여명"}에서 인연을 보는 ${target}은 ${ELEMENTS[el]}입니다. 앞으로 10년 중 ${ELEMENTS[el]}${ga(ELEMENTS[el])} 드는 해는 ${ys}입니다. 이 해들은 사람을 만날 자리가 늘어나는 시기라, 소개나 모임을 미루지 않는 편이 낫습니다. 특히 ${hit[0].year}년은 ${hit[0].score >= 55 ? "전체 운도 같이 받쳐 주는 해라 결과까지 이어지기 쉽습니다" : "사람은 붙는데 조건이 어수선한 해라, 만나는 건 좋아도 큰 결정은 한 박자 늦추는 편이 안전합니다"}.`;
    },
  },
];
