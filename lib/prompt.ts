/** LLM 리포트 생성용 프롬프트 빌더.
 *  lib/saju.ts가 실계산한 명식(Chart)을 "반드시 그대로 쓸 사실"로 주입하고,
 *  핵심 수치(value)도 사주엔진이 사전 계산한 값을 강제 주입해 일관성을 보장한다. */

import { ELEMENTS, STEMS, type Chart } from "./saju";
import type { Category } from "@/data/categories";

/* 아래 EXPERT_ROLE / STYLE_RULES / LOVE_STYLE_ADDENDUM / SECTION_HINTS는
 * 별:결(클로드 앱) lib/prompt.ts의 문구를 그대로 가져온 것 — "내용까지 이전 버전과 동일하게"
 * 요청에 따라 임의로 다시 쓰지 않고 원문을 유지한다. */

const EXPERT_ROLE = `당신은 사주명리학(四柱命理學), 서양 점성술(Astrology), 자미두수(紫微斗數)를 종합하여 연애와 인간관계의 흐름을 읽는 최고 수준의 운세 상담가입니다.
당신의 역할은 명식 수치를 나열하며 장황하게 늘어놓는 것이 아닙니다. 상담자가 실제로 궁금해하는 것을 정확히 짚되, 그 답을 짧게 던지고 끝내지 말고 구체적인 상황·행동·시기까지 촘촘하게 채워서 풀어내는 사람입니다. 마치 오랫동안 그 사람의 연애 패턴을 지켜본 사람처럼, 왜 그런지·언제 그런지·무엇을 해야 하는지를 하나하나 근거를 들어 답합니다.
답변을 읽은 상담자가 "어떻게 이걸 알았지?", "그래서 내가 계속 그랬던 거구나", "지금 내가 어떻게 해야 하는지 알겠다"고 느껴야 합니다.`;

const STYLE_RULES = `- 위 명식(사주팔자, 자미두수 명반, 별자리·행성 배치)은 이미 정확히 계산되어 제공됩니다. 반드시 그 값만 사용하세요. 절대 스스로 다른 간지, 궁위, 별자리를 계산하거나 지어내지 말고, 제공된 값과 다른 사주/명반을 언급하지 마세요. "시간 미상"으로 표시된 항목은 언급하지 마세요.
- 지나치게 불안을 조장하는 단정적 흉사 예언은 피하고, 주의할 점은 대비책과 함께 제시합니다.
- 반드시 한국어 존댓말로, 막힘없는 줄글(prose)로 작성합니다.
- 마크다운 제목(#, ##), 굵게(**), 목록 기호 없이 자연스러운 문단으로만 작성합니다. 문단은 필요하면 줄바꿈으로 나눕니다.
- 주제에서 벗어나거나 다른 주제와 내용이 겹치지 않도록, 요청받은 주제 하나에만 집중합니다.
- 서두에 "네, 알겠습니다" 같은 인사말이나 맺음말 없이 바로 본문 내용으로 시작하고 끝냅니다.`;

const LOVE_STYLE_ADDENDUM = `[답변 원칙]
- 결론부터 말하세요. 항목이 묻는 질문에 가장 직접적으로 답하는 한 문장을 첫 문장으로 씁니다. "일간이 ○○이고 배우자궁에 ○○가 있으며" 식으로 원국을 먼저 설명하고 결론을 나중에 내지 마세요.
- 사주, 점성술, 자미두수를 각각 따로, 순서대로 설명하지 마세요. 세 체계에서 공통으로 반복되는 신호를 찾아 그것을 핵심 근거로 삼으세요. 근거 설명은 1~2문장으로 제한합니다. 세 체계의 결과가 서로 다르면 억지로 하나의 결론으로 뭉개지 말고 "끌림은 강한데 관계를 안정적으로 이어가는 힘은 약합니다" 처럼 그 긴장을 그대로 말하세요.
- 짧지만 구체적으로 말하세요. "좋은 인연이 들어올 가능성이 있습니다" 대신 "초반에 강하게 끌리는 사람보다, 두세 번 만난 뒤 편해지는 사람이 오래 갑니다"처럼 실제 상황과 행동으로 바꿔 말하세요.
- 누구에게나 적용되는 범용적인 문장("상처받기 싫어한다", "사랑받고 싶어 한다", "신중한 성격이다", "때로는 외로움을 느낀다")은 쓰지 마세요. 반드시 그 사람만의 구체적인 연애 행동이나 상황으로 바꿔 말하세요. 예: "상처받기 싫어합니다" 대신 "상대가 조금만 차가워져도 먼저 연락을 줄입니다. 관심이 없어서가 아니라 버림받기 전에 마음을 거두는 쪽입니다."
- 예측에는 강도를 구분해서 표현하세요. 강한 신호는 "가능성이 높습니다", "이 흐름은 꽤 분명합니다"로, 중간 신호는 "가능성이 있습니다", "이쪽으로 흐르기 쉽습니다"로, 불확실한 경우는 "아직 한쪽으로 단정하기 어렵습니다", "현재로서는 두 가능성이 함께 보입니다"로 표현하세요. 근거가 약한 내용을 사실처럼 확정하지 마세요.
- "운명적으로 반드시", "100%", "무조건"처럼 검증할 수 없는 미래를 단정하는 표현은 쓰지 마세요.
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

export function buildFactsBlock(category: Category, me: Chart, pt?: Chart, name?: string): string {
  const meLabel = category.needsPartner ? "나" : "본인";
  const nameLine = name ? `이름/애칭: ${name}\n` : "";
  let block = `${nameLine}${formatChartFacts(meLabel, me)}`;
  if (pt) block += "\n\n" + formatChartFacts("상대방", pt);
  return block;
}

export function buildQuestionPrompt(params: {
  category: Category;
  question: string;
  factsBlock: string;
  name?: string;
  forcedValue?: string;   // 사주엔진이 사전 계산한 확정 값 — LLM이 이 값을 value 필드에 그대로 써야 함
  forcedGauge?: number;   // 사전 계산된 게이지 값 (있을 때만)
}): string {
  const { category, question, factsBlock, name, forcedValue, forcedGauge } = params;
  const who = name ? `${name}님` : "이 사람";

  // 값 지시문 — 사전 계산된 값은 반드시 그대로, 없으면 LLM이 판단
  const valueInstr = forcedValue
    ? `"value" 필드에는 반드시 "${forcedValue}"를 그대로 쓰세요. 수정·재계산 금지. 이 값이 이 질문의 핵심 결론입니다.`
    : `"value" 필드는 이 질문의 핵심 답을 압축한 짧은 구(5~15자)로 쓰세요.`;

  const gaugeInstr = forcedGauge !== undefined
    ? `"gauge" 필드에는 ${forcedGauge}을 그대로 쓰세요.`
    : `"gauge" 필드는 이 항목에 수치(확률·점수·%)가 있으면 0~100 정수로, 없으면 아예 넣지 마세요.`;

  const deep = category.tier === "deep";
  const dual = category.needsPartner;
  const isReunion = category.id === "love-reunion";
  const hint = SECTION_HINTS[question];

  const [min, max] = deep ? [1300, 1700] : [800, 1100];

  // 별:결 buildSectionPrompt와 동일한 흐름 지시문(한 줄 결론 → 핵심 해석 → 흐름 → 조언 / 일반 항목용 서술)
  const structure = deep
    ? `[한 줄 결론 — 이 질문에 대한 가장 직접적인 답] → [핵심 해석 — 명식의 공통 신호를 근거로, 왜 그런지] → [앞으로의 흐름 — 시기와 변화] → [행동 조언] 순서로, 각 부분을 자연스러운 문단으로 이어서 쓰세요. 분량을 채우기 위해 뻔한 말을 반복하지 말고, 구체적인 상황·시기·행동을 더 추가해서 채우세요.${
        dual
          ? ` 두 명식이 함께 주어졌다면 일간의 상생(相生)·상극(相剋)·비화(比和) 관계도 근거로 녹여 서술하세요.`
          : ""
      }${
        isReunion
          ? ` 재회 항목은 ①연락이 올 가능성 ②실제로 다시 만날 가능성 ③관계가 회복될 가능성을 각각 구분해 서술하세요.`
          : ""
      }`
    : `표면적인 이야기가 아니라 구체적인 사주 요소(일간, 오행 등), 자미두수 궁위 배치, 별자리와 행성 배치를 실제로 언급하며 설명하고, 그 근거가 ${who}의 실생활에 어떻게 나타나는지까지 풀어서 서술하세요.`;

  const hintBlock = hint ? `\n\n이 항목 전용 지침: ${hint}` : "";

  return `${factsBlock}

[질문] "${question}"
위 정보를 바탕으로 이 항목에 대해서만 최소 ${min}자, 최대 ${max}자 분량으로 답하세요. ${min}자에 못 미치는 답변은 안 됩니다 — 짧게 요약하듯 끝내지 말고, 구체적인 상황·근거·시기를 더 채워 넣어서 분량을 반드시 채우세요. ${structure}${hintBlock}

${valueInstr}
${gaugeInstr}

"content"는 막힘없이 이어지는 하나의 줄글(prose)이어야 합니다. 마크다운 제목·소제목·굵게·목록 기호 없이, 문단이 바뀔 때만 줄바꿈 두 번(\\n\\n)으로 구분하세요. 소제목이나 번호를 쓰지 마세요.

JSON만 응답하세요 (코드블록·설명 불필요). content 안의 줄바꿈은 반드시 \\n으로, 큰따옴표는 이스케이프해서 올바른 JSON으로 반환하세요:
{"value": "...", "gauge": 숫자(선택), "content": "..."}`;
}

/** 무료로 공개되는 짧은 요약 — 별:결 buildSummaryPrompt와 동일한 지시문 */
export function buildSummaryPrompt(category: Category, factsBlock: string, name?: string): string {
  void name;
  return `${factsBlock}

위 정보를 바탕으로 "${category.name}" 상담의 핵심 흐름만 2~3문장으로 짧게 요약해 주세요. 호기심을 자극하되 구체적인 결론은 밝히지 마세요.`;
}

/** 모든 섹션을 종합한 마무리 조언 — 별:결 buildAdvicePrompt와 동일한 지시문 */
export function buildAdvicePrompt(
  category: Category,
  factsBlock: string,
  name: string | undefined,
  sectionQuestions: string[],
): string {
  void name;
  const deep = category.tier === "deep";
  const [min, max] = deep ? [1100, 1500] : [850, 1150];
  return `${factsBlock}

지금까지 다음 항목들에 대한 상세 분석을 작성했습니다: ${sectionQuestions.join(", ")}.

이 모든 내용을 종합해서 상담자가 지금 실천할 수 있는 구체적인 조언을 최소 ${min}자, 최대 ${max}자 분량으로 작성해 주세요. ${min}자에 못 미치면 안 됩니다 — 각 조언마다 구체적인 상황과 이유를 붙여 분량을 채우세요. 자연스러운 줄글로, 목록 기호 없이 문단으로 서술하되, 항목별로 줄을 바꿔 구분해 주세요.`;
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
