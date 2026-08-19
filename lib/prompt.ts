/** 저비용 LLM 보완용 프롬프트. 기본 리포트는 lib/report.ts의 결정론적 엔진이 생성한다. */

import type { Category } from "@/data/categories";
import type { Chart } from "./saju";

/**
 * 리뷰 후 추가 질문에만 쓰는 짧은 프롬프트.
 * 전체 리포트의 12궁 목록·장문 출력 규칙을 반복 전송하지 않아 입력·출력 토큰을 제한한다.
 */
export function buildCompactFollowUpPrompt(params: {
  category: Category;
  question: string;
  me: Chart;
  partner?: Chart;
  name?: string;
  partnerName?: string;
}): string {
  void params.category;
  const compactFacts = (label: string, chart: Chart) =>
    `${label}: 일주 ${chart.pillars.day.ko}, 오행 목${chart.elementCount[0]} 화${chart.elementCount[1]} 토${chart.elementCount[2]} 금${chart.elementCount[3]} 수${chart.elementCount[4]}, 명궁 ${chart.mingStar}, 부처궁 ${chart.gongs.find((g) => g.name === "부처")?.star || "공궁"}, 태양 ${chart.sun}, 달 ${chart.moon}${chart.asc ? `, 상승 ${chart.asc}` : ""}`;
  const meLabel = params.name ? `${params.name}님` : "본인";
  const partnerFacts = params.partner
    ? `\n${compactFacts(params.partnerName ? `${params.partnerName}님` : "상대방", params.partner)}`
    : "";

  return `당신은 한국어 운세 상담가입니다. 주어진 사실만 근거로, 과장·단정 없이 존댓말로 답하세요.\n${compactFacts(meLabel, params.me)}${partnerFacts}\n질문: ${params.question}\n결론부터 3~5문장, 450자 이내로 답하세요. 실천할 행동 하나를 포함하고 제목·목록·JSON은 쓰지 마세요.`;
}
