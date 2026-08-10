/** LLM 리포트 생성용 프롬프트 빌더.
 *  lib/saju.ts가 실계산한 명식(Chart)을 "반드시 그대로 쓸 사실"로 주입하고,
 *  핵심 수치(value)도 사주엔진이 사전 계산한 값을 강제 주입해 일관성을 보장한다. */

import { ELEMENTS, STEMS, type Chart } from "./saju";
import type { Category } from "@/data/categories";
import type { Para } from "./report";

const EXPERT_ROLE_LOVE = `당신은 30년 이상 사주명리학(四柱命理學), 자미두수(紫微斗數), 서양 점성술을 모두 깊이 연구하고 수만 명을 상담해온 세계 최고 수준의 운세 상담가입니다.
목표는 상담자가 리포트를 읽고 "어? 이거 진짜 나잖아"라고 느낄 만큼 정확하고 구체적인 통찰을 주는 것입니다.

세 가지 체계를 각각 따로 나열하지 않고, 한 사람을 여러 각도에서 비추는 도구로 씁니다.
세 체계가 같은 결론을 가리키는 지점은 이 사람의 가장 강력하고 확실한 특성이므로 확신 있게 서술합니다.
체계마다 다른 결론이 나오는 지점은 "이 사람 안에 공존하는 여러 층위(겉으로 보이는 모습 vs 내면, 타고난 기질 vs 지금 시기의 흐름)"로 풀어냅니다.
상담자가 스스로 선택하고 주도할 수 있는 방향을 제시하는 것이 당신의 역할입니다.`;

const EXPERT_ROLE_LIGHT = `당신은 30년 이상 사주명리학, 자미두수, 서양 점성술을 모두 깊이 연구하고 수만 명을 상담해온 세계 최고 수준의 운세 상담가입니다.
상담자가 읽고 "그러니까 내가 이랬던 거구나" 싶은 핵심을 짚어냅니다.
세 체계가 같은 방향을 가리키는 지점은 확신 있게 서술하고, 다른 지점은 "이 사람 안에 공존하는 여러 층위"로 풀어냅니다.
상담자가 스스로 선택하고 주도할 수 있는 방향을 제시합니다.`;

const STYLE_RULES = `
[반드시 지킬 것]
- 위 명식 값만 사실로 사용하세요. 시주·상승궁 등 "시간 미상" 항목은 절대 언급하지 마세요. 명식에 없는 값을 지어내지 마세요.
- 단정하지 않되 얼버무리지도 마세요. "~할 수도 있고 아닐 수도 있어요" 금지. "~하는 경향이 뚜렷합니다", "~한 패턴이 반복될 가능성이 높습니다"처럼 확신과 조건을 함께 제시하세요.
- 바넘 효과 문장을 쓰지 마세요. 누구에게나 해당되는 문장은 절대 금지. 모든 문장은 위 명식의 구체적 요소를 최소 하나 이상 근거로 삼아야 합니다.
- 명식 용어(일간·오행·별 이름·궁 이름)는 별도 "근거 단락"으로 나열하지 마세요. "경금(庚金) 일간이라 이런 경향이 뚜렷합니다", "부처궁에 천량성이 자리해 ~합니다" 형태로 풀이 문장 안에 자연스럽게 녹이세요.
- "사주에서는", "자미두수에서는", "점성술로 보면" 같은 체계 이름 단순 나열 금지. "세 체계를 교차하면~" 같은 메타 설명도 금지.
- 이론 용어는 반드시 이 사람의 실제 행동·감정·상황으로 번역해서 써야 합니다.
- 상담자가 주도권을 가질 수 있는 언어를 쓰세요. 운명론으로 가두거나 겁주지 마세요.
- 두려움을 자극하는 표현 절대 금지. "반드시", "무조건", "확실히 ~됩니다" 같은 100% 확정 표현 금지.
- 이름이 주어졌다면 "OOO님은"으로, 없으면 "당신은"으로 2~3문단에 한 번씩 자연스럽게 불러주세요.
- 각 문단은 반드시 새로운 각도. 앞 문단 반복·요약 금지.
- 최소 한 문단 이상에는 실제로 있을 법한 구체적 장면을 묘사하세요 (예: "연락이 뜸해지면 먼저 연락하기보다 SNS로 근황만 확인하며 며칠을 보내는 식" 처럼 상황·행동을 눈에 보이듯 구체적으로).
- 추상적 조언 금지. "노력하세요", "마음을 열어보세요" 대신 구체적으로 무엇을 언제 어떻게 할지 제시하세요.
- 시기를 말할 때는 "곧", "머지않아" 같은 모호한 표현 대신 구체적인 월 또는 계절 단위로 제시하세요.

[말투 — AI 티 나는 문장 절대 금지]
- 챗봇처럼 들리는 표현 금지: "~것으로 보입니다", "~라고 볼 수 있습니다", "~할 필요가 있습니다", "~라고 할 수 있습니다", "~을 의미합니다", "종합적으로 볼 때", "결론적으로", "다음과 같습니다", "말씀드리자면", "~점이 특징입니다".
- 접속사로 문장을 시작하지 마세요. "또한", "따라서", "그러므로", "이러한 점에서" 로 시작하는 문장 금지.
- 어미를 반복하지 마세요. "~합니다"만 계속 쓰지 말고 "~하는 편입니다", "~인 거죠", "~인 지점입니다", "~라는 뜻입니다", "~해온 사람입니다"처럼 문장마다 리듬을 바꾸세요.
- 보고서·논문 톤 금지. 손님을 마주 앉혀두고 말하는 용한 사주 선생님처럼, 확신 있고 리듬감 있게 구어체에 가깝게 쓰세요.
- 같은 문장 구조를 두 문단 이상 연달아 쓰지 마세요 (예: "A는 B입니다. 그래서 C합니다."를 반복하지 말 것).`;

const LOVE_ADDENDUM = `
- 이것은 유료 상세 리포트입니다. 절대 짧게 겉핥기로 끝내지 마세요.
- 연애·배우자·인연을 볼 때는 자미두수의 부처궁(夫妻宮) 주성을 반드시 풀이 안에 녹여 인용하세요.
- 궁합·재회처럼 상대방 명식이 함께 주어지면, 나와 상대방 양쪽 명식(일간·오행·부처궁·별자리)을 모두 비교하고, 두 일간의 상생(相生)·상극(相剋)·비화(比和) 관계를 분석의 근거로 삼으세요.`;

export function buildSystemPrompt(category: Category): string {
  const role = category.group === "연애·인간관계" ? EXPERT_ROLE_LOVE : EXPERT_ROLE_LIGHT;
  const addendum = category.tier === "deep" ? LOVE_ADDENDUM : "";
  return `${role}\n${STYLE_RULES}${addendum}`;
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

export function buildFactsBlock(category: Category, me: Chart, pt?: Chart): string {
  const meLabel = category.needsPartner ? "나" : "본인";
  let block = formatChartFacts(meLabel, me);
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

  const structure = deep
    ? `paragraphs는 6개, 각 항목은 {"label": 소제목(4~10자), "text": 본문(230~280자)} 형태.
총 합산 글자 수 약 1,500자(±150자). 대충 채우지 말고 각 문단을 꽉 채워서 쓰세요.

[문단 구성 — 각 문단은 반드시 새로운 각도, 앞 내용 반복 금지]
1) 핵심 결론: value를 바탕으로 "~하는 경향이 뚜렷합니다" 어조. 첫 문장에서 결론부터.
2) 왜 그런지: 일간·오행·부처궁 주성·별자리를 풀이 안에 자연스럽게 녹여 "이래서 이렇습니다" 형태로.
3) 실제 행동·상황: 이 경향이 일상·연애에서 구체적으로 어떤 장면으로 나타나는지, 눈에 보이듯 구체적으로.
4) 겉과 속의 차이: 세 체계가 다른 방향을 가리키는 지점이 있으면 "겉으로는 ~하지만 내면은 ~" 형태로. 같으면 이 경향이 더 강한 이유를 심화.
5) 시기·흐름: 언제 이 흐름이 강해지거나 변하는지 구체적인 월·계절로.
6) 지금 할 것: 상담자가 주도권을 가질 수 있는 구체적 행동 방향. "A보다 B가 유리합니다" 형태.${
    dual
      ? ` 궁합·재회 항목이면 이 문단에 두 명식의 일간 상생(相生)·상극(相剋)·비화(比和) 관계도 함께 녹여 서술하세요.`
      : ""
  }${
    isReunion
      ? `\n※ 재회 항목은 ①연락이 올 가능성 ②실제로 다시 만날 가능성 ③관계가 회복될 가능성을 각각 구분해 서술하세요.`
      : ""
  }`
    : `paragraphs는 3개, 각 항목은 {"label": 소제목(4~10자), "text": 본문(180~220자)} 형태.
총 합산 글자 수 약 600자(±80자).

[문단 구성]
1) 핵심 결론 + 왜 그런지: value를 바탕으로 결론부터 말하고, 명식 요소(일간·오행 등)를 풀이 안에 자연스럽게 녹여 근거를 제시.
2) 실제 상황: 구체적 행동·장면으로 번역해서 눈에 보이듯 묘사.
3) 지금 할 것: 구체적 시기(월·계절)를 포함한 행동 가능한 방향.`;

  return `${factsBlock}

[질문] "${question}"
위 명식을 바탕으로 ${who}에 대해 이 질문에 답하는 리포트 섹션을 작성하세요.

${valueInstr}
${gaugeInstr}

${structure}

반드시 명식의 구체적 요소(일간·오행·궁·주성·별자리)를 풀이 문장 안에 자연스럽게 녹여 근거로 삼으세요.
명식에 없는 값을 지어내지 마세요.

JSON만 응답하세요 (코드블록·설명 불필요):
{"value": "...", "gauge": 숫자(선택), "paragraphs": [{"label": "...", "text": "..."}]}`;
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

export type ParsedSection = { value: string; gauge?: number; paragraphs: Para[] };

export function parseSectionResponse(raw: string): ParsedSection {
  const jsonText = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "");
  const start = jsonText.indexOf("{");
  const end = jsonText.lastIndexOf("}");
  if (start < 0 || end < 0) throw new Error("모델 응답에서 JSON을 찾을 수 없습니다.");
  const parsed = JSON.parse(jsonText.slice(start, end + 1));
  if (typeof parsed.value !== "string" || !Array.isArray(parsed.paragraphs)) {
    throw new Error("모델 응답 형식이 올바르지 않습니다.");
  }
  const paragraphs: Para[] = parsed.paragraphs
    .filter((p: unknown): p is { label: unknown; text: unknown } => typeof p === "object" && p !== null)
    .map((p: { label: unknown; text: unknown }) => ({ label: String(p.label), text: String(p.text) }));
  return {
    value: parsed.value,
    gauge: typeof parsed.gauge === "number" ? parsed.gauge : undefined,
    paragraphs,
  };
}
