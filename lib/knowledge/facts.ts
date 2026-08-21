/** 계산 엔진의 결과를 규칙 엔진이 읽는 형태(Facts)로 묶는다.
 *  여기가 "계산"과 "해석" 사이의 유일한 접점이다. 규칙은 Chart를 직접 안 보고 Facts만 본다. */

import { computeChart, type Chart } from "../saju";
import { analyze } from "../core/analyze";
import { scoreYears } from "../core/luck";
import { comingMonths } from "../core/month";
import { reunionTiming } from "../core/reunion";
import type { Facts } from "./types";

export function buildFacts(
  chart: Chart,
  name?: string,
  now = new Date(),
  other?: { chart: Chart; name?: string },
  breakup?: { y: number; m: number },
): Facts {
  const a = analyze(
    {
      year: { stem: chart.pillars.year.stem, branch: chart.pillars.year.branch },
      month: { stem: chart.pillars.month.stem, branch: chart.pillars.month.branch },
      day: { stem: chart.pillars.day.stem, branch: chart.pillars.day.branch },
      hour: chart.pillars.hour ? { stem: chart.pillars.hour.stem, branch: chart.pillars.hour.branch } : null,
    },
    chart.voidBranches,
  );

  // 대운은 명반 계산 시점(생년월일을 아는 자리)에서 이미 구해 뒀다.
  const age = now.getFullYear() - chart.birthYear + 1;
  let luck: Facts["luck"];
  for (let i2 = chart.luck.list.length - 1; i2 >= 0; i2--) {
    if (age >= chart.luck.list[i2].age) { luck = chart.luck.list[i2]; break; }
  }

  const years = scoreYears(a, chart.birthYear, now.getFullYear(), 10, chart.luck.list);
  // 앞으로 14개월. 해를 넘겨서 봐야 "올해 남은 달"만 보고 답하는 일이 없다.
  const months = comingMonths(a, 14, (y) => years.find((x) => x.year === y)?.score ?? 50, now);

  return {
    a,
    chart,
    luck,
    luckStartAge: chart.luck.startAge,
    luckForward: chart.luck.forward,
    years,
    months,
    isMale: chart.isMale,
    genderKnown: chart.genderKnown,
    breakup: breakup
      ? (() => {
          const t = reunionTiming(a, breakup, (y) => years.find((x) => x.year === y)?.score ?? 50, now);
          return {
            ...breakup,
            monthsSince: t.monthsSince,
            heal: t.healMonths,
            settle: t.settle && { year: t.settle.year, month: t.settle.month },
            contact: t.contact && { year: t.contact.year, month: t.contact.month },
            reunion: t.reunion && { year: t.reunion.year, month: t.reunion.month },
          };
        })()
      : undefined,
    who: name ? `${name}님` : "당신",
    other: other
      ? {
          a: analyze(
            {
              year: { stem: other.chart.pillars.year.stem, branch: other.chart.pillars.year.branch },
              month: { stem: other.chart.pillars.month.stem, branch: other.chart.pillars.month.branch },
              day: { stem: other.chart.pillars.day.stem, branch: other.chart.pillars.day.branch },
              hour: other.chart.pillars.hour
                ? { stem: other.chart.pillars.hour.stem, branch: other.chart.pillars.hour.branch }
                : null,
            },
            other.chart.voidBranches,
          ),
          who: other.name ? `${other.name}님` : "상대방",
          isMale: other.chart.isMale,
        }
      : undefined,
  };
}


export { computeChart };
