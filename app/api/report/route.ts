import { NextRequest, NextResponse } from "next/server";
import { generateReport, type ReportInput } from "@/lib/report";

export const runtime = "nodejs";

/**
 * 리포트의 수치·본문은 모두 로컬 명식 엔진에서 결정적으로 생성한다.
 *
 * 이전에는 질문마다 긴 LLM 호출을 병렬로 실행했다. deep 리포트는 최대 14개 문항과
 * 종합 조언까지 있어 한 건에서 4만 토큰 이상을 소비할 수 있었고, 같은 링크를 다시
 * 열 때도 동일한 비용이 반복됐다. 이제 URL의 입력값만으로 항상 같은 결과를 재생성한다.
 */
export async function POST(req: NextRequest) {
  try {
    const input = (await req.json()) as ReportInput;
    const report = generateReport(input);
    if (!report) {
      return NextResponse.json({ error: "알 수 없는 카테고리입니다." }, { status: 400 });
    }
    return NextResponse.json(report);
  } catch (error) {
    console.error("[api/report] 리포트 생성 실패:", error);
    return NextResponse.json({ error: "리포트 생성에 실패했습니다." }, { status: 500 });
  }
}
