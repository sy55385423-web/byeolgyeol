/** 만세력·오행·자미두수·점성술 계산 엔진.
 *  - 사주(연/월/일/시주), 오행, 자미두수 12궁·명궁·주성: iztro(정통 만세력 라이브러리) 기반 실계산.
 *  - 태양/달/상승궁 및 나머지 행성: circular-natal-horoscope-js 기반 실제 천문 계산.
 *  - 출생지는 서울 좌표를 기본값으로 사용(앱에서 출생지를 따로 받지 않음) — 상승궁 정밀도에만 영향.
 *  - 시간을 모르면(hourBranch undefined) 시주·자미두수 궁위별 배치·상승궁은 근사치이며,
 *    이 사실은 Chart 자체가 아니라 리포트 생성 프롬프트 쪽에서 "시간 미상"으로 별도 처리한다. */

import { astro } from "iztro";
import { getVoidBranches, getLuckPillars, calculateFourPillars } from "manseryeok";
import { Origin, Horoscope } from "circular-natal-horoscope-js";
import { analyze } from "./core/analyze";
import { yearFortunes, type YearFortune } from "./core/ziwei";

export const STEMS = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"];
export const STEMS_HANJA = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
export const BRANCHES = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];
export const BRANCHES_HANJA = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

// 천간/지지 → 오행 (0목 1화 2토 3금 4수)
export const STEM_ELEMENT = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4];
export const BRANCH_ELEMENT = [4, 2, 0, 0, 2, 1, 1, 2, 3, 3, 2, 4];
export const ELEMENTS = ["목", "화", "토", "금", "수"] as const;
export type Element = 0 | 1 | 2 | 3 | 4;

// 오행 색 — lib/persona.ts의 캐릭터 배지 색과 동일한 팔레트를 써서 앱 전체에서
// "이 색 = 이 오행" 시각 언어가 어긋나지 않게 한다.
export const ELEMENT_COLOR: Record<Element, { bg: string; text: string }> = {
  0: { bg: "#e8f2e2", text: "#5c7a4a" },
  1: { bg: "#fbe7de", text: "#c76a41" },
  2: { bg: "#f3ead9", text: "#a97a2e" },
  3: { bg: "#ececec", text: "#75767c" },
  4: { bg: "#e2ebf6", text: "#4a6fa5" },
};

export type Pillar = { stem: number; branch: number; ko: string; hanja: string };

export type Birth = {
  y: number;
  m: number;
  d: number;
  hourBranch?: number; // 0(자)~11(해), 모르면 undefined
  /** 정확한 출생 시각(24시간제). 알면 진태양시 보정에 쓴다. 모르면 hourBranch만 쓴다. */
  hour?: number;
  minute?: number;
  /** 출생지 경도(동경). 서울 126.978, 부산 129.075. 모르면 한반도 평균 127.5 */
  lon?: number;
  // 대운의 순역과 자미두수 대한이 성별에 따라 달라진다. 밝히지 않으면 남성 기준으로 계산하고,
  // Chart.genderKnown이 false가 되어 리포트가 그 한계를 밝힐 수 있게 한다.
  gender?: "male" | "female" | "none";
};

export type Chart = {
  pillars: { year: Pillar; month: Pillar; day: Pillar; hour: Pillar | null };
  dayMaster: Element;          // 일간 오행 — 성격·해석의 축
  elementCount: number[];      // 오행 분포 (8글자 기준)
  dominant: Element;
  /** 원국에서 글자 수가 가장 적은 오행. "이 기운이 얇다"는 사실 서술에만 쓴다. */
  lacking: Element;
  /** 용신 — 이 사람에게 실제로 필요한 기운. lacking과 다르다.
   *  글자 수가 적다고 그게 필요한 기운은 아니다. 신강이면 힘을 빼 주는 쪽이,
   *  신약이면 받쳐 주는 쪽이 용신이다. "나를 채워 주는 사람"은 여기서 나온다. */
  useEl: Element;
  avoidEl: Element;
  mingStar: string;            // 자미두수 명궁 주성
  gongs: { name: string; star: string; isMing: boolean; branch: string }[];
  sun: string;
  moon: string;
  asc: string | null;          // 시간 있을 때만
  seed: number;                // 결정적 파생값 생성용 (프리뷰 훅 등 비핵심 콘텐츠에만 사용)
  timeKnown: boolean;
  birthYear: number;           // 대한(大限) 구간을 나이로 찾을 때 쓴다
  // 자미두수 대한 — iztro가 궁마다 계산해 주는 10년 단위 구간. lib/timing.ts가
  // 현재 나이로 해당 구간을 찾아 "지금 어떤 흐름에 있는지"를 판단한다.
  decadals: { from: number; to: number; stem: string; branch: string; branchIdx: number }[];
  voidBranches: string[]; // 공망 지지 두 개 — manseryeok 계산값
  isMale: boolean;        // 대운 순역 계산에 쓰는 값 (미입력 시 남성으로 가정)
  genderKnown: boolean;   // 사용자가 실제로 성별을 밝혔는지
  // 사주 대운 — 절입 시각까지 계산해 시작 나이를 정한다(manseryeok).
  // 자미두수 대한(decadals)과는 다른 체계라 따로 싣는다.
  luck: { startAge: number; forward: boolean; list: { age: number; stem: number; branch: number; ko: string }[] };
  /** 자미두수 유년(流年) — 올해부터 10년. 그해 명궁이 어느 궁 자리에 앉고
   *  화록·화기가 어느 궁에 드는지. 대한(10년)만으로는 "올해"를 못 말한다. */
  yearly: YearFortune[];
};

const ZODIAC_KO_FROM_EN: Record<string, string> = {
  Aries: "양자리",
  Taurus: "황소자리",
  Gemini: "쌍둥이자리",
  Cancer: "게자리",
  Leo: "사자자리",
  Virgo: "처녀자리",
  Libra: "천칭자리",
  Scorpio: "전갈자리",
  Sagittarius: "사수자리",
  Capricorn: "염소자리",
  Aquarius: "물병자리",
  Pisces: "물고기자리",
};

const ZODIAC = [
  { name: "염소자리", from: [12, 22] }, { name: "물병자리", from: [1, 20] },
  { name: "물고기자리", from: [2, 19] }, { name: "양자리", from: [3, 21] },
  { name: "황소자리", from: [4, 20] }, { name: "쌍둥이자리", from: [5, 21] },
  { name: "게자리", from: [6, 22] }, { name: "사자자리", from: [7, 23] },
  { name: "처녀자리", from: [8, 23] }, { name: "천칭자리", from: [9, 23] },
  { name: "전갈자리", from: [10, 23] }, { name: "사수자리", from: [11, 22] },
] as const;

// 서울 — 앱이 출생지를 받지 않으므로 기본 좌표로 사용. 상승궁·행성 정밀도에만 영향.
const DEFAULT_LATITUDE = 37.5665;
/** 기본 출생 경도 — 서울. 사주의 진태양시 보정과 점성술 계산이 같은 기준을 쓴다. */
const DEFAULT_LONGITUDE = 126.978;

export function sunSign(m: number, d: number) {
  for (let i = ZODIAC.length - 1; i >= 0; i--) {
    const [fm, fd] = ZODIAC[i].from;
    if (m > fm || (m === fm && d >= fd)) return ZODIAC[i].name;
  }
  return ZODIAC[0].name;
}

function mkPillarFromKo(ko: string): Pillar {
  const s = STEMS.indexOf(ko[0]);
  const b = BRANCHES.indexOf(ko[1]);
  return { stem: s, branch: b, ko, hanja: STEMS_HANJA[s] + BRANCHES_HANJA[b] };
}

/** 시진 한가운데 시각 — 정확한 시각을 모를 때 그 시진의 대표값으로 쓴다.
 *  자시는 23~01시라 한가운데가 자정이므로 0시를 쓴다. */
const MID_HOUR = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];

/** 이 앱의 hourBranch(0~11)를 iztro의 시진 index(0~12, 자시가 조/야로 분리됨)로 변환.
 * 두 인덱스는 인(2)~해(11) 구간에서 그대로 대응하고, 자시(0)는 iztro idx 0을 쓰면 된다
 * (오서둔 공식은 시지만으로 시간을 정하므로 idx0/idx12 어느 쪽이든 결과가 같다). */
function toIztroTimeIndex(hourBranch: number | undefined): number {
  return hourBranch ?? 0;
}

/** hourBranch(0~11)를 점성술 계산용 대략적인 시각(0~23시)으로 변환. 모르면 정오로 근사. */
function toClockHour(hourBranch: number | undefined): number {
  if (hourBranch === undefined) return 12;
  return hourBranch === 0 ? 0 : hourBranch * 2;
}

/** 같은 생년월일시는 항상 같은 명반이 나오는 순수 계산인데, 실제로는 한 요청 안에서
 *  여러 번 반복 호출된다 (API 라우트에서 한 번 → generateReport/values/radarStats에서 또,
 *  화면 쪽은 Flow·ReportView·SajuCharts가 각자 렌더마다). 이 함수의 99%는 iztro의
 *  만세력 계산(약 13ms)이라, 중복 호출이 그대로 응답 지연이 된다.
 *  반환된 Chart는 앱 전체에서 읽기 전용으로만 쓰이므로(변형하는 코드 없음) 그대로 공유한다.
 *  ⚠️ Chart를 수정하는 코드를 새로 추가하면 캐시가 오염된다 — 필요하면 복사해서 쓸 것. */
const chartCache = new Map<string, Chart>();
const CHART_CACHE_MAX = 500;

export function computeChart(b: Birth): Chart {
  const key = `${b.y}-${b.m}-${b.d}-${b.hourBranch ?? "x"}-${b.hour ?? "x"}:${b.minute ?? "x"}-${b.lon ?? "x"}-${b.gender ?? "x"}`;
  const hit = chartCache.get(key);
  if (hit) return hit;
  const chart = computeChartUncached(b);
  // 단순 상한 — 넘으면 가장 오래된 항목부터 버린다(Map은 삽입 순서를 유지한다).
  if (chartCache.size >= CHART_CACHE_MAX) {
    const oldest = chartCache.keys().next().value;
    if (oldest !== undefined) chartCache.delete(oldest);
  }
  chartCache.set(key, chart);
  return chart;
}

function computeChartUncached(b: Birth): Chart {
  const { y, m, d } = b;
  const timeKnown = b.hourBranch !== undefined;
  const isMale = b.gender !== "female";
  const genderKnown = b.gender === "male" || b.gender === "female";
  const gender = isMale ? "男" : "女"; // 자미두수 대한의 순역이 성별에 달려 있다
  const dateStr = `${y}-${m}-${d}`;
  const timeIndex = toIztroTimeIndex(b.hourBranch);

  let yearlyCache: YearFortune[] | undefined;
  const astrolabe = astro.bySolar(dateStr, timeIndex, gender, true, "ko-KR");

  // 사주 네 기둥은 만세력(manseryeok)에서 받는다.
  //
  //  예전에는 iztro의 chineseDate를 그대로 썼는데, 절기 경계 판정이 며칠씩 어긋났다.
  //  300건을 대조하니 19%에서 월주가 달랐고, 절입 시각으로 확인해 보면 전부 iztro가
  //  틀렸다(1982-07-11은 소서(7/7 19:55 KST) 이후라 미월인데 오월로 나왔다).
  //  월주는 사주에서 가장 무거운 자리라 격국·용신·강약이 전부 여기서 나온다.
  //
  //  manseryeok은 KASI 절기 데이터를 쓰고, 진태양시·과거 표준시·서머타임까지 다룬다.
  //  자미두수는 음력과 시진으로 따로 계산되므로 iztro를 그대로 쓴다.
  const ms = calculateFourPillars({
    year: y, month: m, day: d,
    hour: b.hour ?? MID_HOUR[b.hourBranch ?? 6],
    minute: b.minute ?? 0,
    trueSolarTime: { longitude: b.lon ?? DEFAULT_LONGITUDE },
  });
  const mkP = (x: { heavenlyStem: string; earthlyBranch: string }) => mkPillarFromKo(x.heavenlyStem + x.earthlyBranch);

  const year = mkP(ms.year);
  const month = mkP(ms.month);
  const day = mkP(ms.day);
  const hour = timeKnown ? mkP(ms.hour) : null;

  const chars = [year, month, day, ...(hour ? [hour] : [])];
  const elementCount = [0, 0, 0, 0, 0];
  for (const p of chars) {
    elementCount[STEM_ELEMENT[p.stem]]++;
    elementCount[BRANCH_ELEMENT[p.branch]]++;
  }
  const dominant = elementCount.indexOf(Math.max(...elementCount)) as Element;
  const lacking = elementCount.indexOf(Math.min(...elementCount)) as Element;
  const dayMaster = STEM_ELEMENT[day.stem] as Element;

  const gongs = astrolabe.palaces.map((p) => ({
    name: p.name,
    star: p.majorStars[0]?.name ?? "",
    isMing: p.name === "명궁",
    branch: p.earthlyBranch,
  }));
  const mingStar = gongs.find((g) => g.isMing)?.star || gongs[0]?.star || "자미";

  // 서양 점성술 — 실제 천문 계산 (circular-natal-horoscope-js)
  const origin = new Origin({
    year: y,
    month: m - 1,
    date: d,
    hour: toClockHour(b.hourBranch),
    minute: 0,
    latitude: DEFAULT_LATITUDE,
    longitude: DEFAULT_LONGITUDE,
  });
  const horoscope = new Horoscope({
    origin,
    houseSystem: "whole-sign",
    zodiac: "tropical",
    aspectPoints: [],
    aspectWithPoints: [],
    aspectTypes: [],
    language: "en",
  });
  const bodies = horoscope.CelestialBodies as Record<string, { Sign: { label: string } }>;
  const toKo = (label: string) => ZODIAC_KO_FROM_EN[label] ?? label;
  const moon = toKo(bodies.moon.Sign.label);
  const asc = timeKnown
    ? toKo((horoscope.Ascendant as { Sign: { label: string } }).Sign.label)
    : null;

  const seed = y * 372 + m * 31 + d + (b.hourBranch ?? 0) * 7;

  // 사주 대운 — 출생에서 다음(순행)/이전(역행) 절(節)까지의 일수로 시작 나이를 정한다.
  // 순역은 성별에 달려 있다(양남·음녀 순행 / 음남·양녀 역행).
  let luck = { startAge: 0, forward: true, list: [] as { age: number; stem: number; branch: number; ko: string }[] };
  try {
    const instantUTCms = Date.UTC(y, m - 1, d, toClockHour(b.hourBranch) - 9, 0); // KST = UTC+9
    const lp = getLuckPillars({
      instantUTCms,
      birthYear: y,
      monthPillar: { heavenlyStem: STEMS[month.stem], earthlyBranch: BRANCHES[month.branch] } as Parameters<typeof getLuckPillars>[0]["monthPillar"],
      sajuYearStemIndex: year.stem,
      gender: (isMale ? "male" : "female") as Parameters<typeof getLuckPillars>[0]["gender"],
      count: 9,
    });
    luck = {
      startAge: lp.startAge,
      forward: lp.forward,
      list: lp.pillars.map((pp) => ({
        age: pp.age,
        stem: STEMS.indexOf(pp.pillar.heavenlyStem),
        branch: BRANCHES.indexOf(pp.pillar.earthlyBranch),
        ko: pp.korean,
      })),
    };
  } catch {
    // 절기 데이터 범위 밖의 연도 등 — 대운이 없어도 나머지 분석은 그대로 유효하다.
  }

  // 공망 — 일주가 속한 순(旬)에서 빠지는 지지 두 개. manseryeok이 계산해 준다.
  let voidBranches: string[] = [];
  try {
    voidBranches = getVoidBranches(
      STEMS[day.stem] as Parameters<typeof getVoidBranches>[0],
      BRANCHES[day.branch] as Parameters<typeof getVoidBranches>[1],
    ) as string[];
  } catch {
    voidBranches = [];
  }

  // 대한 — 궁마다 [시작나이, 끝나이]와 간지가 붙어 있다. 나이로 찾을 수 있게 펼쳐 둔다.
  const decadals = astrolabe.palaces
    .map((p) => {
      const dc = (p as { decadal?: { range?: number[]; heavenlyStem?: string; earthlyBranch?: string } }).decadal;
      if (!dc?.range || dc.range.length < 2) return null;
      const branch = dc.earthlyBranch ?? "";
      return {
        from: dc.range[0],
        to: dc.range[1],
        stem: dc.heavenlyStem ?? "",
        branch,
        branchIdx: Math.max(0, BRANCHES.indexOf(branch)),
      };
    })
    .filter((x): x is NonNullable<typeof x> => !!x)
    .sort((a2, b2) => a2.from - b2.from);

  // 용신은 글자 수가 아니라 강약에서 나온다. 지장간을 일수 비중으로 펼치고 득령·득지·득세를
  // 함께 보는 core/analyze가 판정한다. 리포트 전체가 이 하나를 기준으로 말해야 어긋나지 않는다.
  const analysis = analyze(
    {
      year: { stem: year.stem, branch: year.branch },
      month: { stem: month.stem, branch: month.branch },
      day: { stem: day.stem, branch: day.branch },
      hour: hour ? { stem: hour.stem, branch: hour.branch } : null,
    },
    voidBranches,
  );

  return {
    pillars: { year, month, day, hour },
    dayMaster,
    elementCount,
    dominant,
    lacking,
    useEl: analysis.useEl as Element,
    avoidEl: analysis.avoidEl as Element,
    mingStar,
    gongs,
    sun: sunSign(m, d),
    moon,
    asc,
    seed,
    timeKnown,
    birthYear: y,
    decadals,
    voidBranches,
    isMale,
    genderKnown,
    luck,
    // 유년은 열 해를 iztro로 각각 세워야 해서 명식 하나에 100ms 넘게 든다.
    // 쓰는 규칙이 걸릴 때만 계산하고, 한 번 계산하면 그 값을 붙들어 둔다.
    get yearly() {
      if (!yearlyCache) yearlyCache = yearFortunes(dateStr, timeIndex, gender, new Date().getFullYear(), 10);
      return yearlyCache;
    },
  };
}

/** 무료 공개용 "타고난 인기 상위 %" — Flow와 리포트가 같은 값을 쓰도록 중앙화 (마케팅 훅용 결정적 값) */
export function popularityPct(y: number, m: number, d: number) {
  const n = y * 372 + m * 31 + d;
  return 3 + (n % 28);
}

/** 시간 라벨("자시 (23:30~01:29)") → 지지 index */
export function hourBranchFromLabel(label?: string): number | undefined {
  if (!label) return undefined;
  const i = BRANCHES.findIndex((b) => label.startsWith(b + "시"));
  return i >= 0 ? i : undefined;
}
