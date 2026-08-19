/** LLM 리포트 생성용 프롬프트 빌더.
 *  lib/saju.ts가 실계산한 명식(Chart)을 "반드시 그대로 쓸 사실"로 주입하고,
 *  핵심 수치(value)도 사주엔진이 사전 계산한 값을 강제 주입해 일관성을 보장한다. */

import { ELEMENTS, STEMS, type Chart } from "./saju";
import type { Category } from "@/data/categories";

/* LOVE_STYLE_ADDENDUM / SECTION_HINTS는 별:결(클로드 앱) lib/prompt.ts의 문구를 그대로
 * 가져온 것 — "내용까지 이전 버전과 동일하게" 요청에 따라 원문을 유지한다.
 * EXPERT_ROLE / STYLE_RULES는 사용자가 직접 준 새 프롬프트(정체성·해석 원칙·금지사항)의
 * 톤과 원칙을 이식해 다시 썼다 — 출력 형식(문항별 JSON, 길이 지시문)은 UI가 그대로 쓰므로
 * 건드리지 않고, 정체성·해석 태도·금지사항만 반영했다. */

const EXPERT_ROLE = `당신은 30년 이상 사주명리학(四柱命理學), 자미두수(紫微斗數), 서양 점성술(Astrology)을 모두 깊이 연구하고 수만 명을 상담해온 세계 최고 수준의 운세 상담가입니다. 당신의 목표는 예쁜 말이 아니라, 사용자가 리포트를 읽고 "어? 이거 진짜 나잖아"라고 소름 돋을 만큼 정확하고 구체적인 통찰을 주는 것입니다.
당신의 역할은 명식 수치를 나열하며 장황하게 늘어놓는 것이 아닙니다. 상담자가 실제로 궁금해하는 것을 정확히 짚되, 그 답을 짧게 던지고 끝내지 말고 구체적인 상황·행동·시기까지 촘촘하게 채워서 풀어내는 사람입니다. 마치 오랫동안 그 사람을 곁에서 지켜본 사람처럼, 왜 그런지·언제 그런지·무엇을 해야 하는지를 하나하나 근거를 들어 답합니다.
답변을 읽은 상담자가 "어떻게 이걸 알았지?", "그래서 내가 계속 그랬던 거구나", "지금 내가 어떻게 해야 하는지 알겠다"고 느껴야 합니다.`;

const STYLE_RULES = `- 위 명식(사주팔자, 자미두수 명반, 별자리·행성 배치)은 이미 정확히 계산되어 제공됩니다. 반드시 그 값만 사용하세요. 절대 스스로 다른 간지, 궁위, 별자리를 계산하거나 지어내지 말고, 제공된 값과 다른 사주/명반을 언급하지 마세요. "시간 미상"으로 표시된 항목은 언급하지 마세요.
- 사주명리, 자미두수, 서양 점성술을 각각 따로 나열하지 말고, 하나의 사람을 여러 각도에서 비추는 도구로 쓰세요. 세 체계가 같은 결론을 가리키면 그것이 가장 강력하고 확실한 특성이라는 뜻이니 가장 자신 있게 서술하고, 체계마다 다른 결론이 나오면 겉으로 보이는 모습과 내면, 혹은 타고난 기질과 지금 시기의 흐름처럼 이 사람 안에 공존하는 여러 층위로 풀어내세요.
- 모든 문장은 반드시 위 명식 데이터의 구체적 요소(오행 비율, 십신, 자미두수 궁·주성, 별자리·행성 배치, 대운·세운 등) 중 최소 하나를 근거로 삼아야 합니다. 근거를 댈 수 없는 문장은 쓰지 마세요.
- 누구에게나 해당되는 범용적인 문장(예: "당신은 겉으로는 강해 보이지만 속으로는 여립니다")은 쓰지 마세요. "~할 수도 있고 아닐 수도 있어요" 같은 애매한 얼버무림도 쓰지 마세요. 대신 "~하는 경향이 뚜렷합니다", "~한 패턴이 반복될 가능성이 높습니다", "다만 ~한 상황에서는 다르게 나타날 수 있습니다"처럼 확신과 조건을 함께 제시하는 화법을 쓰세요.
- 지나치게 불안을 조장하는 단정적 흉사 예언은 피하고, 주의할 점은 대비책과 함께 제시합니다. 죽음, 중대 질병, 이혼, 파산처럼 두려움을 자극하는 내용을 직접적으로 예언하듯 언급하지 마세요. 특정 부적, 굿, 유료 상담, 특정 상품 구매를 유도하는 내용도 쓰지 마세요.
- "운명적으로 반드시", "100%", "무조건", "확실히 ~됩니다"처럼 검증할 수 없는 미래를 단정하는 표현은 쓰지 마세요.
- 반드시 한국어 존댓말로, 막힘없는 줄글(prose)로 작성합니다.
- 마크다운 제목(#, ##), 굵게(**), 목록 기호 없이 자연스러운 문단으로만 작성합니다. 문단은 필요하면 줄바꿈으로 나눕니다.
- 주제에서 벗어나거나 다른 주제와 내용이 겹치지 않도록, 요청받은 주제 하나에만 집중합니다.
- 서두에 "네, 알겠습니다" 같은 인사말이나 맺음말 없이 바로 본문 내용으로 시작하고 끝냅니다.`;

const LOVE_STYLE_ADDENDUM = `[답변 원칙]
- 결론부터 말하세요. 항목이 묻는 질문에 가장 직접적으로 답하는 한 문장을 첫 문장으로 씁니다. "일간이 ○○이고 배우자궁에 ○○가 있으며" 식으로 원국을 먼저 설명하고 결론을 나중에 내지 마세요. 세 체계 근거 설명은 1~2문장으로 제한합니다.
- 짧지만 구체적으로 말하세요. "좋은 인연이 들어올 가능성이 있습니다" 대신 "초반에 강하게 끌리는 사람보다, 두세 번 만난 뒤 편해지는 사람이 오래 갑니다"처럼 실제 상황과 행동으로 바꿔 말하세요. 범용적인 문장을 피할 때도 반드시 그 사람만의 구체적인 연애 행동이나 상황으로 바꿔 말하세요. 예: "상처받기 싫어합니다" 대신 "상대가 조금만 차가워져도 먼저 연락을 줄입니다. 관심이 없어서가 아니라 버림받기 전에 마음을 거두는 쪽입니다."
- 사주 원국이나 별자리·행성, 자미두수 명궁의 의미를 교과서나 백과사전처럼 나열하지 마세요.
- 같은 결론을 표현만 바꿔 반복하지 마세요. 지나치게 신비주의적인 말을 남발하지 마세요.
- 상담자나 상대방의 이름/애칭이 주어진 경우, "상담자님", "상대방" 같은 일반 지칭 대신 반드시 이름 뒤에 "님"을 붙여 부르세요 (예: "채서연님은 ~합니다"). 이름이 주어지지 않은 쪽만 "상담자님" 또는 "상대방"으로 지칭하세요.
- 다음과 같은 표현을 자연스럽게, 그러나 매번 반복하지 않고 활용할 수 있습니다: "이건 분명합니다.", "지금은 아닙니다.", "마음은 있습니다. 다만…", "이 사람은 놓치는 쪽을 더 무서워합니다.", "여기서 먼저 움직이면 관계가 오히려 꼬입니다.", "문제는 감정이 아니라 타이밍입니다.", "다시 연락할 가능성은 있습니다. 하지만 재회와 연락은 다른 문제입니다."`;

/** 특정 질문에서 답이 뭉뚱그려지기 쉬운 지점을 짚어주는 전용 지침. 별:결과 동일한 질문 문구는
 * 그대로, bazistar에만 있는 질문은 같은 취지로 대응시켰다. */
const SECTION_HINTS: Partial<Record<string, string>> = {
  "운명의 상대의 특징과 외모":
    "성격적 특징뿐 아니라 외모의 인상(예: 선한 인상, 화사한 인상, 세련된 스타일, 분위기 있는 인상 등)도 구체적으로 함께 묘사하세요. 오행이나 자미두수 별의 기운과 자연스럽게 연결해 설명하고, 인상착의를 나열하듯 딱딱하게 쓰지 말고 실제 마주쳤을 때의 느낌으로 그리세요.",
  "나와 상대방의 타고난 특징":
    "이 항목은 반드시 두 사람 모두를 다뤄야 합니다. 상담자의 타고난 특징과 상대방의 타고난 특징을 각각 분명히 나누어 설명하세요. 한쪽만 설명하고 끝내지 마세요.",
  "상대방의 현재 마음":
    "'마음이 있다/없다'로 뭉뚱그리지 마세요. 호감, 미련, 그리움, 소유욕, 외로움, 실제 연애 의지, 관계를 책임질 의지를 구분해서 설명하세요. 예: '마음은 남아 있습니다. 하지만 다시 만나고 싶은 마음보다 당신을 완전히 놓치기 싫은 마음이 더 큽니다.'",
  "재회 가능성":
    "다시 연락할 가능성, 다시 만날 가능성, 실제로 관계가 회복될 가능성을 구분해서 설명하세요. 이 셋은 다른 문제입니다. 예: '연락은 다시 올 가능성이 있습니다. 하지만 연락이 온다고 바로 재회로 이어지는 흐름은 아닙니다.'",
  "궁합과 인연":
    "총점이나 등급으로 뭉뚱그리지 말고, 끌림, 감정 안정성, 소통 방식, 갈등 패턴, 두 사람이 다시 만날 경우의 장기 가능성을 구분해서 설명하세요. 예: '끌림은 강한 궁합입니다. 문제는 싸운 뒤입니다.'",
  "궁합 총점수":
    "점수만 던지지 말고 그 점수 뒤의 구조를 설명하세요. 끌림, 감정 안정성, 소통, 갈등 패턴, 장기 연애 가능성 중 어디서 점수가 깎이고 어디서 높은지 구체적으로 짚으세요.",
  "타고난 내 모습과 타인이 보는 내 모습":
    "반드시 두 가지를 구분해서 설명하세요 — 본인 스스로 느끼는 내면의 기질과, 타인의 눈에 비치는 인상·평판. 이 둘이 같은지 다른지, 다르다면 왜 다른지도 짚으세요.",
  "나의 초년운":
    "유년기부터 20대 초반까지의 흐름에 집중하세요. 이 시기 특유의 기회나 어려움을 구체적으로 짚고, 다른 인생 시기(청년운·중년운·말년운)와 내용이 겹치지 않게 하세요.",
  "나의 청년운":
    "20대~30대 초중반 무렵의 흐름에 집중하세요. 다른 인생 시기와 겹치지 않게, 이 시기만의 특징(도전, 확장, 시행착오 등)을 구체적으로 짚으세요.",
  "나의 중년운":
    "30대 후반~50대 무렵의 흐름에 집중하세요. 다른 인생 시기와 겹치지 않게, 이 시기 특유의 전환·안정·책임의 문제를 구체적으로 짚으세요.",
  "나의 말년운":
    "50대 후반 이후의 흐름에 집중하세요. 다른 인생 시기와 겹치지 않게, 이 시기 특유의 결실·관계·건강의 문제를 구체적으로 짚으세요.",
  "대운이 바뀌는 시기":
    "삶의 방향이나 환경이 크게 전환되는 구체적인 시기(나이·연도)를 짚고, 그 전후로 무엇이 달라지는지 설명하세요.",
  "나의 전성기, 주의가 필요한 시기":
    "인생에서 가장 잘 풀리는 전성기 시점과, 특히 조심해야 할 시기를 각각 구분해서 짚으세요. 하나로 뭉뚱그리지 마세요.",
};

export function buildSystemPrompt(category: Category): string {
  const tone = category.tier === "deep" ? `\n\n${LOVE_STYLE_ADDENDUM}` : "";
  return `${EXPERT_ROLE}\n\n${STYLE_RULES}${tone}`;
}

function pillarStr(p: { ko: string; hanja: string }) {
  return `${p.ko}(${p.hanja})`;
}

function formatChartFacts(label: string, c: Chart): string {
  const dm = ELEMENTS[c.dayMaster];
  const gongLines = c.gongs.map((g) => `${g.name}${g.isMing ? "★명궁" : ""}: ${g.star || "—"}`).join(", ");
  return `[${label} — 정확히 계산된 명식 (반드시 이 값만 사용, 절대 스스로 재계산하지 말 것)]
사주팔자: 년주 ${pillarStr(c.pillars.year)} · 월주 ${pillarStr(c.pillars.month)} · 일주 ${pillarStr(c.pillars.day)} · 시주 ${
    c.pillars.hour ? pillarStr(c.pillars.hour) : "시간 미상(정보 없음 — 시주 관련 언급 금지)"
  }
일간(日干): ${STEMS[c.pillars.day.stem]}${dm} — 이 사람 기질 해석의 축
오행 분포(8자 기준): 목${c.elementCount[0]} 화${c.elementCount[1]} 토${c.elementCount[2]} 금${c.elementCount[3]} 수${c.elementCount[4]} → 강한 오행 ${ELEMENTS[c.dominant]}, 약한 오행 ${ELEMENTS[c.lacking]}
자미두수 12궁·주성: ${gongLines}
서양 점성술: 태양자리 ${c.sun} · 달자리 ${c.moon} · 상승궁 ${c.asc ?? "시간 미상(제공 불가 — 언급 금지)"}`;
}

export function buildFactsBlock(category: Category, me: Chart, pt?: Chart, name?: string, partnerName?: string): string {
  const meLabel = category.needsPartner ? "나" : "본인";
  const nameLine = name ? `이름/애칭: ${name}\n` : "";
  let block = `${nameLine}${formatChartFacts(meLabel, me)}`;
  if (pt) block += "\n\n" + formatChartFacts(partnerName ? `상대방(${partnerName})` : "상대방", pt);
  return block;
}

/** 딥/라이트 티어별 흐름 지시문 — 별:결 buildSectionPrompt와 동일한 구조.
 *  문항 단독 호출과 배치 호출 양쪽에서 공유한다 (문항마다 값이 같아 배치에서는 한 번만 넣으면 됨). */
function structureFor(category: Category, who: string): string {
  const deep = category.tier === "deep";
  const dual = category.needsPartner;
  const isReunion = category.id === "love-reunion";
  // 문항당 목표 글자수를 줄인 만큼(딥 ~1500자 평균 → ~950자, 라이트 ~950자 평균 → ~560자)
  // 최소 문장 수도 같은 비율로 낮춘다 — 예전 글자수 기준 문장 수를 그대로 두면 한 문장이
  // 지나치게 짧아져 나열식으로 끊기는 문체가 된다.
  return deep
    ? `[한 줄 결론 — 이 질문에 대한 가장 직접적인 답, 1~2문장] → [핵심 해석 — 명식의 공통 신호를 근거로, 왜 그런지, 최소 2문장] → [실제 상황 — 이 경향이 일상에서 구체적으로 어떻게 드러나는지 눈에 보이듯 장면으로, 최소 2문장] → [앞으로의 흐름 — 구체적 시기·변화, 최소 1문장] → [행동 조언 — 지금 무엇을 하면 좋을지, 최소 1문장] 순서로, 각 부분을 자연스러운 문단으로 이어서 쓰세요. 각 파트를 위에 적힌 최소 문장 수 이상으로 채우지 않으면 전체 분량이 부족해집니다. 뻔한 말을 반복해서 채우지 말고, 구체적인 상황·시기·행동을 매번 새로 추가해서 채우세요.${
        dual
          ? ` 두 명식이 함께 주어졌다면 일간의 상생(相生)·상극(相剋)·비화(比和) 관계도 근거로 녹여 서술하세요.`
          : ""
      }${
        isReunion
          ? ` 재회 항목은 ①연락이 올 가능성 ②실제로 다시 만날 가능성 ③관계가 회복될 가능성을 각각 구분해 서술하세요.`
          : ""
      }`
    : `[한 줄 결론, 1~2문장] → [왜 그런지 — 구체적인 사주 요소(일간, 오행 등)·자미두수 궁위 배치·별자리와 행성 배치를 실제로 언급하며, 최소 2문장] → [실제 상황 — 그 근거가 ${who}의 실생활에 구체적으로 어떻게 나타나는지 장면으로, 최소 2문장] → [지금 할 것 — 구체적 행동·시기, 최소 1문장] 순서로 풀어서 서술하세요. 각 파트를 위 최소 문장 수 이상으로 채우세요.`;
}

function valueInstrFor(forcedValue?: string): string {
  return forcedValue
    ? `"value" 필드에는 반드시 "${forcedValue}"를 그대로 쓰세요. 수정·재계산 금지. 이 값이 이 질문의 핵심 결론입니다.`
    : `"value" 필드는 이 질문의 핵심 답을 압축한 짧은 구(5~15자)로 쓰세요.`;
}

function gaugeInstrFor(forcedGauge?: number): string {
  return forcedGauge !== undefined
    ? `"gauge" 필드에는 ${forcedGauge}을 그대로 쓰세요.`
    : `"gauge" 필드는 이 항목에 수치(확률·점수·%)가 있으면 0~100 정수로, 없으면 아예 넣지 마세요.`;
}

export function buildQuestionPrompt(params: {
  category: Category;
  question: string;
  name?: string;
  forcedValue?: string;   // 사주엔진이 사전 계산한 확정 값 — LLM이 이 값을 value 필드에 그대로 써야 함
  forcedGauge?: number;   // 사전 계산된 게이지 값 (있을 때만)
}): string {
  const { category, question, name, forcedValue, forcedGauge } = params;
  const who = name ? `${name}님` : "이 사람";
  const deep = category.tier === "deep";
  const hint = SECTION_HINTS[question];
  const [min, max] = deep ? [850, 1050] : [500, 620];
  const hintBlock = hint ? `\n\n이 항목 전용 지침: ${hint}` : "";

  return `[질문] "${question}"
위 정보를 바탕으로 이 항목에 대해서만 최소 ${min}자, 최대 ${max}자 분량으로 답하세요. ${min}자에 못 미치는 답변은 안 됩니다 — 짧게 요약하듯 끝내지 말고, 구체적인 상황·근거·시기를 더 채워 넣어서 분량을 반드시 채우세요. ${structureFor(category, who)}${hintBlock}

${valueInstrFor(forcedValue)}
${gaugeInstrFor(forcedGauge)}

"content"는 막힘없이 이어지는 하나의 줄글(prose)이어야 합니다. 마크다운 제목·소제목·굵게·목록 기호 없이, 문단이 바뀔 때만 줄바꿈 두 번(\\n\\n)으로 구분하세요. 소제목이나 번호를 쓰지 마세요.

JSON만 응답하세요 (코드블록·설명 불필요). content 안의 줄바꿈은 반드시 \\n으로, 큰따옴표는 이스케이프해서 올바른 JSON으로 반환하세요:
{"value": "...", "gauge": 숫자(선택), "content": "..."}`;
}

/** 문항 여러 개를 한 호출에 묶어 답변받는 배치 프롬프트. 문항당 개별 호출 대비 반복되는
 *  흐름 지시문·JSON 포맷 지시문을 1번만 보내 토큰을 아낀다. 그룹당 3~4문항 정도가
 *  한 응답 안에서 모델이 문항별 분량·품질을 지키는 상한선으로 확인됨 — 그 이상 묶으면
 *  문항당 분량이 목표 미달로 떨어지는 경향이 있어 route.ts에서 그룹 크기를 제한한다. */
export function buildBatchQuestionPrompt(params: {
  category: Category;
  questions: string[];
  name?: string;
  forced: Record<string, { value?: string; gauge?: number }>;
}): string {
  const { category, questions, name, forced } = params;
  const who = name ? `${name}님` : "이 사람";
  const deep = category.tier === "deep";
  const [min, max] = deep ? [850, 1050] : [500, 620];

  const questionBlocks = questions
    .map((q, i) => {
      const f = forced[q];
      const hint = SECTION_HINTS[q];
      return `${i + 1}. [질문] "${q}"
${valueInstrFor(f?.value)}
${gaugeInstrFor(f?.gauge)}${hint ? `\n이 항목 전용 지침: ${hint}` : ""}`;
    })
    .join("\n\n");

  return `아래 ${questions.length}개 질문 각각에 대해 독립적으로 답하세요. 각 질문은 최소 ${min}자, 최대 ${max}자 분량이어야 합니다. ${min}자에 못 미치는 답변은 안 됩니다. 같은 근거·표현·문장을 여러 질문 답변에 재사용하지 말고, 질문마다 그 질문에만 해당하는 구체적인 내용으로 채우세요.

${structureFor(category, who)}

${questionBlocks}

"content"는 막힘없이 이어지는 하나의 줄글(prose)이어야 합니다. 마크다운 제목·소제목·굵게·목록 기호 없이, 문단이 바뀔 때만 줄바꿈 두 번(\\n\\n)으로 구분하세요. 소제목이나 번호를 쓰지 마세요.

JSON 객체 하나만 응답하세요 (코드블록·설명 불필요). 키는 위 질문 문구를 정확히 그대로 사용하고, 질문 개수만큼 키가 있어야 합니다. content 안의 줄바꿈은 반드시 \\n으로, 큰따옴표는 이스케이프해서 올바른 JSON으로 반환하세요. 예시 형태:
{"${questions[0]}": {"value": "...", "gauge": 숫자(선택), "content": "..."}${questions.length > 1 ? ", ..." : ""}}`;
}

/** 종합 조언 — 문항마다 개별 호출하는 구조에서, 모든 섹션을 종합하는 조언만 별도로 1콜.
 *  별:결(클로드 앱) buildAdvicePrompt와 동일하게 JSON이 아닌 순수 텍스트로 응답받는다. */
export function buildAdvicePrompt(category: Category, name?: string): string {
  void name;
  const [min, max] = category.tier === "deep" ? [800, 1000] : [450, 550];
  return `지금까지 다음 항목들에 대한 상세 분석을 작성했습니다: ${category.questions.join(", ")}.

이 모든 내용을 종합해서 상담자가 지금 실천할 수 있는 구체적인 조언을 최소 ${min}자, 최대 ${max}자 분량으로 작성해 주세요. ${min}자 미만은 안 됩니다 — 각 조언마다 구체적인 상황과 이유를 붙여 분량을 채우세요. 목록 기호 없이 자연스러운 줄글로 서술하되, 항목별로 줄바꿈 두 번으로 구분해 주세요.

다른 설명이나 코드블록 없이, 본문 텍스트만 응답하세요.`;
}

/** 접미사에 이미 있는 단위를 모델이 value 끝에 중복으로 붙이는 경우 방어적으로 제거 */
export function stripRedundantUnit(value: string, suffix?: string): string {
  if (!suffix) return value;
  let v = value.trim();
  const s = suffix.trim();
  const multiUnits = ["%p", "%"];
  for (const u of multiUnits) {
    if (s.startsWith(u) && v.endsWith(u)) {
      return v.slice(0, -u.length).trim();
    }
  }
  const suffixFirstChar = s[0];
  if (suffixFirstChar && /[가-힣]/.test(suffixFirstChar) && v.endsWith(suffixFirstChar)) {
    v = v.slice(0, -1).trim();
  }
  return v;
}

export type ParsedSection = { value: string; gauge?: number; content: string };

export function parseSectionResponse(raw: string): ParsedSection {
  const jsonText = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "");
  const start = jsonText.indexOf("{");
  const end = jsonText.lastIndexOf("}");
  if (start < 0 || end < 0) throw new Error("모델 응답에서 JSON을 찾을 수 없습니다.");
  const parsed = JSON.parse(jsonText.slice(start, end + 1));
  if (typeof parsed.value !== "string" || typeof parsed.content !== "string") {
    throw new Error("모델 응답 형식이 올바르지 않습니다.");
  }
  return {
    value: parsed.value,
    gauge: typeof parsed.gauge === "number" ? parsed.gauge : undefined,
    content: parsed.content,
  };
}

/** 배치 호출 응답 파싱. JSON 자체가 깨지면(코드블록 누락, 중괄호 짝 안 맞음 등) 던져서
 *  호출부가 그룹 전체를 결정론적 텍스트로 대체하게 한다. 다만 개별 질문 키가 하나 빠지거나
 *  형식이 안 맞는 경우는 그 키만 결과에서 빼고 나머지는 그대로 살려서, 모델이 그룹 중 한
 *  문항만 실수해도 그룹 전체가 폴백되지 않게 한다. */
export function parseBatchResponse(raw: string): Record<string, ParsedSection> {
  const jsonText = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "");
  const start = jsonText.indexOf("{");
  const end = jsonText.lastIndexOf("}");
  if (start < 0 || end < 0) throw new Error("모델 응답에서 JSON을 찾을 수 없습니다.");
  const parsed = JSON.parse(jsonText.slice(start, end + 1));
  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("배치 응답이 JSON 객체가 아닙니다.");
  }
  const result: Record<string, ParsedSection> = {};
  for (const [key, item] of Object.entries(parsed as Record<string, unknown>)) {
    if (
      item &&
      typeof item === "object" &&
      typeof (item as Record<string, unknown>).value === "string" &&
      typeof (item as Record<string, unknown>).content === "string"
    ) {
      const v = item as { value: string; gauge?: number; content: string };
      result[key] = {
        value: v.value,
        gauge: typeof v.gauge === "number" ? v.gauge : undefined,
        content: v.content,
      };
    }
  }
  return result;
}
