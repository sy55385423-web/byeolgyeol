/** 나의 별:결 — 무료 유형 진단 엔진.
 *  LLM 호출 없이 사주(오행 중 가장 강한 것) · 점성술(태양자리 + 능동궁/수용궁)을 실제
 *  만세력 엔진(computeChart)에서 그대로 뽑아 조합해 유형을 결정적으로 산출한다.
 *  오행 5개 × 별자리 12개 = 60가지 유형. 능동궁/수용궁은 성향(능력치·설명)에 녹아든다.
 *  자미두수 명궁 주성은 유형 산정에 관여하지 않지만, 카드에 참고 정보로 함께 표시한다.
 *  같은 생년월일이면 언제나 같은 유형·능력치가 나오므로, 링크(공유) 재현이 가능하다. */

import { computeChart, ELEMENTS, type Chart, type Birth, type Element } from "./saju";

export type { Element };

/* ───────────────────── 오행(사주) 콘텐츠 ───────────────────── */

type ElementMeta = {
  word: string; // 유형 이름 앞에 붙는 오행 수식어 (예: "포근한")
  color: { bg: string; ring: string }; // 캐릭터 배지 색
  flavor: string;
  strong: [string, string];
  weak: [string, string];
};

const ELEMENT_META: Record<Element, ElementMeta> = {
  0: {
    word: "쑥쑥",
    color: { bg: "#e8f2e2", ring: "#7a9c5f" },
    flavor:
      "새로운 걸 시도하고 배우는 데 거침이 없습니다. 관심이 생기면 일단 부딪혀보고, 실패해도 금방 툭툭 털고 다음 걸 찾아 나섭니다. 예를 들어 새로 생긴 모임에 혼자 불쑥 나가보거나, 낯선 분야의 강의를 충동적으로 신청하는 식입니다. 성장 속도가 빨라서, 얼마 전까지 초보였던 걸 어느새 능숙하게 해내고 있는 스스로를 발견하곤 합니다.",
    strong: ["성장지향", "친화력"],
    weak: ["꼼꼼함", "절제력"],
  },
  1: {
    word: "불꽃",
    color: { bg: "#fbe7de", ring: "#c76a41" },
    flavor:
      "감정 표현이 확실하고, 분위기를 이끄는 힘이 있습니다. 좋으면 좋다고, 신나면 신난다고 얼굴과 목소리에 다 드러나는 편이라 주변 사람들이 눈치 볼 필요가 없습니다. 예를 들어 모임 분위기가 어색해지면 먼저 나서서 농담을 던지거나, 다들 지쳐있을 때 혼자 텐션을 끌어올리는 역할을 맡곤 합니다. 타오르는 속도만큼 식는 것도 빨라서, 방금까지 열심이던 일에 갑자기 흥미를 잃기도 합니다.",
    strong: ["열정", "표현력"],
    weak: ["침착함", "인내심"],
  },
  2: {
    word: "포근한",
    color: { bg: "#f3ead9", ring: "#b78a3c" },
    flavor:
      "한번 믿은 사람과 상황은 끝까지 책임지는 편입니다. 급하게 결정 내리기보다 충분히 지켜보고 판단하며, 주변이 지치고 흔들릴 때 오히려 담담하게 자리를 지킵니다. 예를 들어 친구들 사이에 갈등이 생기면 중재자 역할을 자처하거나, 다들 손 놓은 궂은일을 묵묵히 떠맡는 쪽입니다. 다만 변화가 필요한 순간에도 익숙한 방식을 고수하려다 타이밍을 놓치기도 합니다.",
    strong: ["신뢰감", "포용력"],
    weak: ["순발력", "융통성"],
  },
  3: {
    word: "야무진",
    color: { bg: "#ececec", ring: "#8b8c92" },
    flavor:
      "기준이 분명하고, 정한 건 흔들림 없이 밀고 나갑니다. 대충 넘어가는 법이 없어서, 작은 디테일도 원칙대로 마무리해야 마음이 놓입니다. 예를 들어 모임 자리에서도 다음 일정을 미리 챙겨두거나, 문서 조항 하나하나를 놓치지 않고 확인하는 식으로 일 처리가 야무집니다. 그만큼 기준에 못 미치는 상황은 잘 못 넘기는 편이라, 스스로에게도 남에게도 살짝 깐깐하다는 말을 듣곤 합니다.",
    strong: ["결단력", "원칙"],
    weak: ["여유", "유연함"],
  },
  4: {
    word: "자유로운",
    color: { bg: "#e2ebf6", ring: "#4a6fa5" },
    flavor:
      "생각이 깊고, 상황을 유연하게 받아들입니다. 정해진 틀에 얽매이기보다 그때그때 흐름에 맞춰 방향을 바꾸는 걸 편하게 여기고, 남이 정해놓은 길보다 자기만의 속도를 더 신뢰합니다. 예를 들어 여행 계획을 세워도 세부 일정은 비워두고 즉흥적으로 채우거나, 정해진 틀보다 자유롭게 일할 수 있는 방식에 은근히 더 끌립니다. 다만 결정을 미루다 타이밍을 놓치거나, 마음이 자주 바뀌어 주변을 헷갈리게 만들기도 합니다.",
    strong: ["통찰력", "사고력"],
    weak: ["추진력", "사교성"],
  },
};

/* ───────────────────── 별자리(점성술) 콘텐츠 ───────────────────── */

type ZodiacMeta = {
  creature: string;
  emoji: string;
  short: string;
  flavor: string;
  strong: [string, string];
  weak: [string, string];
};

// ⚠️ strong/weak 단어는 ELEMENT_META·ACTIVE_META의 strong/weak 단어와 절대 겹치면 안 됨
// (같은 사람의 강한/약한 성향 목록에 같은 라벨이 중복 렌더링되는 걸 방지 — React key 충돌의 원인이었음)
const ZODIAC_META: Record<string, ZodiacMeta> = {
  양자리: {
    creature: "양",
    emoji: "🐏",
    short: "거침없이 돌진하는",
    flavor:
      "거침없이 돌진하는 양처럼, 하고 싶은 게 생기면 망설임이 짧습니다. 남들이 재고 따지는 동안 이미 첫걸음을 뗀 상태고, 시작이 빠른 만큼 부딪히고 배우는 것도 빠릅니다. 예를 들어 새 프로젝트 아이디어가 나오면 그 자리에서 바로 손을 들거나, 마음에 드는 사람이 생기면 먼저 연락하는 걸 주저하지 않습니다.",
    strong: ["박력", "용맹함"],
    weak: ["느긋함", "차분함"],
  },
  황소자리: {
    creature: "황소",
    emoji: "🐂",
    short: "한번 마음먹으면 끝까지 가는",
    flavor:
      "한번 마음먹으면 끝까지 가는 황소처럼, 시작한 일은 웬만해선 포기하지 않습니다. 속도는 느려도 방향을 잘 안 바꾸고, 편안하고 안정적인 환경에서 실력을 제대로 발휘합니다. 예를 들어 몇 년째 같은 루틴으로 운동을 이어가거나, 한번 정한 단골집·브랜드를 오래도록 고수하는 편입니다.",
    strong: ["끈기", "안정감"],
    weak: ["기민함", "신속함"],
  },
  쌍둥이자리: {
    creature: "여우",
    emoji: "🦊",
    short: "눈치 빠르고 재치있는",
    flavor:
      "눈치 빠르고 재치있는 여우처럼, 상황에 맞춰 대화를 잘 이끕니다. 정보를 빠르게 흡수하고 여러 관심사를 동시에 굴리는 데 능해서, 어떤 자리에서도 대화 소재가 마르지 않습니다. 예를 들어 처음 만난 사람과도 금세 공통 화제를 찾아내거나, 여러 개의 일을 동시에 진행하면서도 헷갈리지 않고 챙깁니다.",
    strong: ["재치", "임기응변"],
    weak: ["집중력", "꾸준함"],
  },
  게자리: {
    creature: "게",
    emoji: "🦀",
    short: "소중한 걸 지키는",
    flavor:
      "소중한 걸 집게로 지키는 게처럼, 가까운 사람을 살뜰히 챙깁니다. 겉으로는 무심한 척해도 속으로는 주변 사람들의 안부를 늘 신경 쓰고, 자기 사람이라고 느끼면 아낌없이 내어줍니다. 예를 들어 친구가 힘들어 보이면 먼저 연락해서 밥을 사거나, 가족·연인의 사소한 취향까지 기억해뒀다 챙기는 식입니다.",
    strong: ["공감력", "보호본능"],
    weak: ["냉정함", "거리두기"],
  },
  사자자리: {
    creature: "사자",
    emoji: "🦁",
    short: "당당하고 카리스마 있는",
    flavor:
      "무리 앞에 당당히 나서는 사자처럼, 주목받는 자리를 부담스러워하지 않습니다. 발표나 리드하는 역할을 맡으면 오히려 에너지가 올라가고, 사람들 앞에서 인정받을 때 가장 크게 동기부여됩니다. 예를 들어 회의에서 자연스럽게 진행을 맡거나, 모임의 분위기를 이끄는 역할을 자주 맡게 됩니다.",
    strong: ["자신감", "카리스마"],
    weak: ["겸손함", "수수함"],
  },
  처녀자리: {
    creature: "고양이",
    emoji: "🐱",
    short: "디테일을 놓치지 않는",
    flavor:
      "디테일을 놓치지 않는 고양이처럼, 마무리까지 꼼꼼하게 챙깁니다. 정리되지 않은 상태를 못 견디고, 남들이 대충 넘어가는 부분까지 다시 한번 확인해야 직성이 풀립니다. 예를 들어 문서를 제출하기 전 오탈자를 몇 번씩 다시 검토하거나, 물건의 위치를 자기만의 기준으로 정리해둡니다.",
    strong: ["세심함", "분석력"],
    weak: ["대범함", "즉흥성"],
  },
  천칭자리: {
    creature: "백조",
    emoji: "🦢",
    short: "우아하게 균형을 잡는",
    flavor:
      "우아하게 균형을 잡는 백조처럼, 어느 한쪽으로 치우치지 않으려 합니다. 갈등을 싫어해서 양쪽 입장을 다 들어보고 중재하려 하고, 관계에서도 형평성을 중요하게 여깁니다. 예를 들어 친구들 사이 다툼이 생기면 양쪽 말을 다 들어주는 역할을 자처하거나, 물건을 살 때도 여러 옵션을 끝까지 비교한 뒤에야 결정합니다.",
    strong: ["균형감", "조화력"],
    weak: ["과감함", "강단"],
  },
  전갈자리: {
    creature: "전갈",
    emoji: "🦂",
    short: "한번 꽂히면 깊이 파고드는",
    flavor:
      "한번 물면 놓지 않는 전갈처럼, 관심 있는 것에 깊이 몰입합니다. 겉으로는 무덤덤해 보여도 속으로는 강렬한 감정을 품고 있고, 한번 마음을 준 대상에게는 끝까지 진심입니다. 예를 들어 관심 분야가 생기면 며칠 밤을 새워서라도 파고들거나, 친해진 사람에게는 누구보다 깊은 신뢰를 보여줍니다.",
    strong: ["집중력", "예리함"],
    weak: ["개방성", "털털함"],
  },
  사수자리: {
    creature: "말",
    emoji: "🐴",
    short: "넓은 세상을 향해 내달리는",
    flavor:
      "넓은 초원을 내달리는 말처럼, 새로운 세상을 향한 호기심이 큽니다. 익숙한 곳에 오래 머무르기보다 늘 다음 목적지를 그리고, 낯선 경험 앞에서 주저함이 없습니다. 예를 들어 즉흥적으로 여행을 떠나거나, 남들이 안 가본 길을 오히려 더 반가워하며 뛰어듭니다.",
    strong: ["모험심", "낙천성"],
    weak: ["치밀함", "계획성"],
  },
  염소자리: {
    creature: "염소",
    emoji: "🐐",
    short: "묵묵히 정상을 향해 오르는",
    flavor:
      "한 걸음씩 정상을 향해 오르는 염소처럼, 목표를 향한 인내심이 강합니다. 화려한 지름길보다 확실한 방법을 택하고, 눈에 띄지 않아도 꾸준히 쌓아가는 걸 편안하게 여깁니다. 예를 들어 몇 년 단위의 장기 계획을 세워 차근차근 실행하거나, 남들이 지쳐 포기한 뒤에도 혼자 끝까지 완주합니다.",
    strong: ["책임감", "뚝심"],
    weak: ["돌발성", "자유분방함"],
  },
  물병자리: {
    creature: "부엉이",
    emoji: "🦉",
    short: "틀을 깨고 자기 방식을 만드는",
    flavor:
      "틀을 깨는 부엉이처럼, 남들과 다른 자기만의 방식을 좋아합니다. 유행이나 관습을 그대로 따르기보다 자기 나름의 기준으로 다시 해석하고, 혼자 있는 시간에서 오히려 생각을 정리합니다. 예를 들어 남들이 다 쓰는 방식 대신 자기만의 작업 루틴을 고집하거나, 모두가 당연하게 여기는 것에 '왜?'라는 질문을 던집니다.",
    strong: ["독창성", "개방성"],
    weak: ["친밀감", "일관성"],
  },
  물고기자리: {
    creature: "물고기",
    emoji: "🐟",
    short: "흐름에 따라 유연하게 움직이는",
    flavor:
      "흐름을 타고 유유히 헤엄치는 물고기처럼, 상황에 따라 유연하게 마음을 바꿉니다. 감수성이 풍부해서 주변 분위기와 사람들의 감정을 스펀지처럼 흡수하고, 상상하고 공감하는 능력이 남다릅니다. 예를 들어 영화나 소설 속 인물에게 깊이 몰입하거나, 친구의 고민을 들으면 마치 자기 일처럼 함께 아파합니다.",
    strong: ["감수성", "상상력"],
    weak: ["현실감", "냉철함"],
  },
};

const DEFAULT_SIGN = "사자자리";

// 능동궁(불·바람) — 앞장서는 편 / 수용궁(흙·물) — 지켜보다 움직이는 편
const ACTIVE_SIGNS = new Set([
  "양자리", "사자자리", "사수자리", "쌍둥이자리", "천칭자리", "물병자리",
]);

type ActiveMeta = { flavor: string; strong: [string, string]; weak: [string, string] };

const ACTIVE_META: [ActiveMeta, ActiveMeta] = [
  {
    flavor:
      "먼저 움직이고 먼저 표현하는 편이라, 가만히 있는 시간이 오히려 답답합니다. 예를 들어 모임 약속을 잡을 때도 먼저 나서서 날짜를 제안하고, 궁금한 게 생기면 그 자리에서 바로 물어봅니다.",
    strong: ["적응력", "직관력"],
    weak: ["관찰력", "지구력"],
  },
  {
    flavor:
      "지켜보다 확신이 서면 움직이는 편이라, 서두르기보다 확실한 쪽을 택합니다. 예를 들어 새로운 모임에 나가도 처음엔 분위기를 살피다 편해진 뒤에야 적극적으로 나서고, 중요한 결정 앞에서는 하루쯤 묵혀뒀다 답합니다.",
    strong: ["관찰력", "지구력"],
    weak: ["적응력", "직관력"],
  },
];

function activeGroupOf(sign: string): 0 | 1 {
  return ACTIVE_SIGNS.has(sign) ? 0 : 1;
}

/** 유형 선택 UI(드롭다운 등)를 위한 선택지 목록 */
export const ELEMENT_OPTIONS: { value: Element; label: string }[] = (
  Object.keys(ELEMENT_META) as unknown as Element[]
).map((el) => ({ value: Number(el) as Element, label: `${ELEMENT_META[Number(el) as Element].word} (${ELEMENTS[Number(el) as Element]})` }));

export const SIGN_OPTIONS: { value: string; label: string }[] = Object.keys(ZODIAC_META).map((sign) => ({
  value: sign,
  label: `${sign} (${ZODIAC_META[sign].creature}${ZODIAC_META[sign].emoji})`,
}));

/* ───────────────────── 유형 조립 ───────────────────── */

export type PersonaType = {
  element: Element;
  sign: string;
  activeGroup: 0 | 1;
  name: string;
  tagline: string;
  description: string;
  emoji: string;
  badge: { bg: string; ring: string };
};

function buildType(element: Element, sign: string): PersonaType {
  const em = ELEMENT_META[element];
  const zm = ZODIAC_META[sign] ?? ZODIAC_META[DEFAULT_SIGN];
  const activeGroup = activeGroupOf(sign);
  const am = ACTIVE_META[activeGroup];

  return {
    element,
    sign,
    activeGroup,
    name: `${em.word} ${zm.creature}`,
    tagline: `${zm.short} ${zm.creature}`,
    description: `${em.flavor} ${zm.flavor} ${am.flavor}`,
    emoji: zm.emoji,
    badge: em.color,
  };
}

/* ───────────────────── 능력치 (강한성향/약한성향) ───────────────────── */

export type PersonaStat = { label: string; value: number };

function seededValue(seed: number, salt: number, min: number, max: number): number {
  const n = Math.abs((seed * 131 + salt * 977) % 1000);
  return min + (n % (max - min + 1));
}

function statsOf(element: Element, sign: string, seed: number): { strong: PersonaStat[]; weak: PersonaStat[] } {
  const em = ELEMENT_META[element];
  const zm = ZODIAC_META[sign] ?? ZODIAC_META[DEFAULT_SIGN];
  const am = ACTIVE_META[activeGroupOf(sign)];
  const strongPairs = [em.strong, zm.strong, am.strong];
  const weakPairs = [em.weak, zm.weak, am.weak];

  const strong: PersonaStat[] = [];
  const weak: PersonaStat[] = [];
  strongPairs.forEach((pair, i) =>
    pair.forEach((label, j) => strong.push({ label, value: seededValue(seed, i * 2 + j + 1, 58, 92) })),
  );
  weakPairs.forEach((pair, i) =>
    pair.forEach((label, j) => weak.push({ label, value: seededValue(seed, i * 2 + j + 11, 14, 38) })),
  );
  return { strong, weak };
}

/* ───────────────────── 오행 상생상극 (궁합) ───────────────────── */

function relationOfElements(a: Element, b: Element): "생" | "비화" | "극" {
  const diff = ((b - a) % 5 + 5) % 5;
  if (diff === 0) return "비화";
  if (diff === 1 || diff === 4) return "생";
  return "극";
}

/* ───────────────────── 결과 ───────────────────── */

export type PersonaResult = {
  element: Element;
  sign: string;
  activeGroup: 0 | 1;
  mingStar: string; // 자미두수 명궁 주성 — 유형 산정에는 안 쓰이고 카드에 참고 정보로만 표시
  seed: number; // 궁합 % 계산용
  type: PersonaType;
  strong: PersonaStat[];
  weak: PersonaStat[];
};

export function computePersona(birth: Birth): PersonaResult {
  const chart: Chart = computeChart(birth);
  const { dominant, sun, mingStar, seed } = chart;
  const type = buildType(dominant, sun);
  const { strong, weak } = statsOf(dominant, sun, seed);

  return {
    element: dominant,
    sign: sun,
    activeGroup: activeGroupOf(sun),
    mingStar,
    seed,
    type,
    strong,
    weak,
  };
}

/** 생년월일 없이 "유형 선택"만으로 궁합을 확인할 때 쓰는 결정적 대체 seed. */
function pseudoSeedOf(element: Element, sign: string): number {
  let h = element * 131;
  for (let i = 0; i < sign.length; i++) h = (h * 31 + sign.charCodeAt(i)) % 100000;
  return h;
}

/** 생년월일 대신 오행·별자리를 직접 골라 만든 결과 — 궁합 확인용 미리보기. */
export function personaFromChoice(element: Element, sign: string): PersonaResult {
  const seed = pseudoSeedOf(element, sign);
  const type = buildType(element, sign);
  const { strong, weak } = statsOf(element, sign, seed);

  return {
    element,
    sign,
    activeGroup: activeGroupOf(sign),
    mingStar: "",
    seed,
    type,
    strong,
    weak,
  };
}

export { ELEMENTS };

/* ───────────────────── 두 사람 궁합 (0~100%) ─────────────────────
 * 오행 상생상극(최대 60점) + 별자리 4원소 그룹 궁합(최대 40점) + 생년월일 기반 미세 편차.
 * 같은 오행이라도 별자리가 다르면 점수가 달라지고, 같은 별자리라도 오행이 다르면 달라진다
 * — "같은 동물끼리만 잘 맞는다"는 편향 없이 60유형 어디서나 나올 수 있는 조합. */

const ZODIAC_GROUP: Record<string, 0 | 1 | 2 | 3> = {
  양자리: 0, 사자자리: 0, 사수자리: 0, // 불
  황소자리: 1, 처녀자리: 1, 염소자리: 1, // 흙
  쌍둥이자리: 2, 천칭자리: 2, 물병자리: 2, // 바람
  게자리: 3, 전갈자리: 3, 물고기자리: 3, // 물
};

function elementScore(a: Element, b: Element): number {
  const rel = relationOfElements(a, b);
  return rel === "생" ? 60 : rel === "비화" ? 40 : 15;
}

function zodiacScore(a: string, b: string): number {
  const ga = ZODIAC_GROUP[a], gb = ZODIAC_GROUP[b];
  if (ga === gb) return 40;
  const complementary =
    (ga === 0 && gb === 2) || (ga === 2 && gb === 0) || // 불 ↔ 바람
    (ga === 1 && gb === 3) || (ga === 3 && gb === 1); // 흙 ↔ 물
  return complementary ? 32 : 18;
}

export type CompatPerson = { element: Element; sign: string; seed: number };

/** 0~100 사이 궁합 점수. 순서를 바꿔도 같은 값(대칭)이 나오도록 설계. */
export function compatScore(a: CompatPerson, b: CompatPerson): number {
  const base = elementScore(a.element, b.element) + zodiacScore(a.sign, b.sign);
  const jitter = (Math.abs((a.seed + b.seed) * 131 + Math.abs(a.seed - b.seed) * 977) % 13) - 6;
  return Math.max(1, Math.min(100, base + jitter));
}

export function compatLabel(score: number): string {
  if (score >= 85) return "천생연분에 가까워요";
  if (score >= 70) return "잘 맞는 편이에요";
  if (score >= 50) return "무난한 편이에요";
  if (score >= 35) return "노력이 좀 필요해요";
  return "정반대라 부딪히기 쉬워요";
}

/* ───────────────────── 공유 링크 인코딩 ───────────────────── */

export type PersonaShare = { y: number; m: number; d: number; h?: number; n?: string };

export function encodePersona(p: PersonaShare): string {
  const json = JSON.stringify(p);
  const b64 = btoa(unescape(encodeURIComponent(json)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodePersona(id: string): PersonaShare | null {
  try {
    const b64 = id.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(escape(atob(b64)));
    const p = JSON.parse(json);
    if (!p || typeof p.y !== "number" || typeof p.m !== "number" || typeof p.d !== "number") return null;
    return p as PersonaShare;
  } catch {
    return null;
  }
}
