import ReportView from "@/components/report/ReportView";

/** 리포트 ID = 인코딩된 주문 페이로드 → 어느 기기에서든 결정적으로 재생성 */
export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ReportView id={id} />;
}
