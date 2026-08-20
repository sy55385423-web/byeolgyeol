/** 계산 엔진의 결과를 규칙 엔진이 읽는 형태(Facts)로 묶는다.
 *  여기가 "계산"과 "해석" 사이의 유일한 접점이다. 규칙은 Chart를 직접 안 보고 Facts만 본다. */

import { computeChart, type Chart } from "../saju";
import { analyze } from "../core/analyze";
import { scoreYears } from "../core/luck";
import type { Facts } from "./types";

export function buildFacts(
  chart: Chart,
  name?: string,
  now = new Date(),
  other?: { chart: Chart; name?: string },
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

  return {
    a,
    chart,
    luck,
    luckStartAge: chart.luck.startAge,
    luckForward: chart.luck.forward,
    years,
    isMale: chart.isMale,
    genderKnown: chart.genderKnown,
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
