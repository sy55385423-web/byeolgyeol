/** 자미두수 유년(流年) 엔진.
 *
 *  지금까지 자미두수는 원국 12궁과 대한(10년)만 쓰고 있었다. 정작 "올해 어떤가"를
 *  답하는 자리는 유년인데 그게 빠져 있었다.
 *
 *  유년에서 실제로 읽는 것은 두 가지다.
 *
 *    유년 명궁   그해의 명궁이 원국의 어느 궁 자리에 앉는가.
 *                재백궁 자리에 앉으면 그해는 돈이 주제가 되고,
 *                부처궁 자리에 앉으면 관계가 주제가 된다.
 *
 *    사화(四化)  그해의 천간이 네 별에 화록·화권·화과·화기를 붙인다.
 *                화록 재물과 기회 · 화권 권한과 주도 · 화과 명예와 문서 · 화기 막힘과 손실
 *                그 별이 원국의 어느 궁에 앉아 있느냐로 어느 영역이 열리고 막히는지 본다.
 *
 *  ⚠️ 사화는 유파에 따라 별 배정이 조금씩 다르다. 여기서는 iztro가 쓰는 통용 배정을
 *  그대로 따른다. 문창·문곡 같은 보조성에 붙는 경우는 궁을 특정하지 않는다. */

import { astro } from "iztro";

export type MutagenHit = {
  kind: "화록" | "화권" | "화과" | "화기";
  star: string;
  /** 그 별이 원국에서 앉은 궁. 주성이 아니면 undefined */
  palace?: string;
};

export type YearFortune = {
  year: number;
  ganji: string;
  /** 유년 명궁이 앉은 원국 궁 이름 */
  seat: string;
  mutagens: MutagenHit[];
  /** 화록이 든 궁 / 화기가 든 궁 — 문장에서 가장 많이 쓴다 */
  lucky?: string;
  blocked?: string;
};

const KIND = ["화록", "화권", "화과", "화기"] as const;

/** 앞으로 count년치 유년을 뽑는다. 같은 명식이면 늘 같은 값이 나온다. */
export function yearFortunes(
  solarDate: string,
  timeIndex: number,
  gender: "男" | "女",
  fromYear: number,
  count: number,
): YearFortune[] {
  let a: ReturnType<typeof astro.bySolar>;
  try {
    a = astro.bySolar(solarDate, timeIndex, gender, true, "ko-KR");
  } catch {
    return [];
  }
  // 원국 12궁 — 주성이 어느 궁에 앉았는지 미리 색인해 둔다
  const starPalace = new Map<string, string>();
  for (const p of a.palaces) {
    for (const s of p.majorStars ?? []) starPalace.set(s.name, p.name);
  }
  const palaceAt = a.palaces.map((p) => p.name);

  const out: YearFortune[] = [];
  for (let i = 0; i < count; i++) {
    const y = fromYear + i;
    try {
      const h = a.horoscope(`${y}-6-15`);
      const yr = h.yearly;
      const mutagens: MutagenHit[] = (yr.mutagen ?? []).map((star: string, k: number) => ({
        kind: KIND[k],
        star,
        palace: starPalace.get(star),
      }));
      out.push({
        year: y,
        ganji: `${yr.heavenlyStem}${yr.earthlyBranch}`,
        seat: palaceAt[yr.index] ?? "명궁",
        mutagens,
        lucky: mutagens.find((m) => m.kind === "화록")?.palace,
        blocked: mutagens.find((m) => m.kind === "화기")?.palace,
      });
    } catch {
      // 한 해가 실패해도 나머지는 낸다
    }
  }
  return out;
}

/** 궁 이름 → 그 궁이 맡는 영역. 문장에서 "재백궁이 열린다"를 사람 말로 바꿀 때 쓴다. */
export const PALACE_AREA: Record<string, string> = {
  명궁: "자기 자신과 방향",
  형제: "형제·동료·가까운 또래",
  부처: "배우자와 연애",
  자녀: "자녀·아랫사람·창작",
  재백: "돈이 들어오고 나가는 자리",
  질액: "건강과 몸",
  천이: "이동·바깥 활동·해외",
  노복: "친구와 사람 관계",
  관록: "일과 직위",
  전택: "집·부동산·가정",
  복덕: "마음과 취향, 정신적 여유",
  부모: "부모·윗사람·문서",
};
