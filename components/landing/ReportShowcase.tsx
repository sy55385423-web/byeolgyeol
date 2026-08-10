import { categories } from "@/data/categories";
import { computeChart } from "@/lib/saju";
import { radarStats, type Ctx, type ReportInput } from "@/lib/report";
import SajuCharts from "@/components/ui/SajuCharts";
import StatGrid from "@/components/ui/StatGrid";
import RadarCard from "@/components/ui/RadarCard";
import Reveal from "@/components/ui/Reveal";

/** 리포트 예시 섹션 — 무료 미리보기와 결제 후 상세 리포트를 나란히 보여줌 */
export default function ReportShowcase() {
  const loveLife = categories.find((c) => c.id === "love-life")!;

  // 샘플 인물(지수, 2000-08-03) 기준 레이더 다이어그램
  const sampleMe = { y: 2000, m: 8, d: 3 };
  const sampleInput: ReportInput = { categoryId: "love-life", name: "지수", me: sampleMe, tier: "basic" };
  const sampleCtx: Ctx = { me: computeChart(sampleMe), c: loveLife, input: sampleInput };

  return (
    <section className="border-t border-line">
      <div className="mx-auto max-w-5xl px-5 py-20 sm:py-28">
        <Reveal>
          <p className="text-sm font-medium tracking-widest text-brass">REPORT</p>
          <h2 className="mt-3 font-serif text-3xl font-semibold leading-snug tracking-tight sm:text-4xl">
            리포트 미리보기
          </h2>
          <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-ink-soft">
            모든 리포트는 당신의 만세력·자미두수 명반·점성술 지표를 직접 세우는
            것부터 시작합니다. 어디서 나온 해석인지 근거를 눈으로 확인하세요.
          </p>
        </Reveal>

        {/* 명반 3표 샘플 */}
        <Reveal delay={0.08}>
          <div className="mt-10 rounded-2xl border border-line bg-paper-warm/50 p-5">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs text-ink-faint">2000년 8월 3일생 예시</span>
              <span className="rounded-full border border-line bg-white px-2.5 py-0.5 text-[11px] text-ink-faint">
                샘플
              </span>
            </div>
            <SajuCharts me={{ y: 2000, m: 8, d: 3, knowsTime: false }} name="지수" />
          </div>
        </Reveal>

        {/* 종합 지수 + 레이더 샘플 */}
        <Reveal delay={0.1}>
          <div className="mt-6">
            <RadarCard stats={radarStats(sampleCtx)} />
          </div>
        </Reveal>

        {/* 미리보기 vs 상세 리포트 */}
        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <Reveal>
            <div className="flex h-full flex-col rounded-2xl border border-line bg-white/70 p-6">
              <p className="text-xs font-medium text-brass">STEP 1 · 미리보기 (결제 전)</p>
              <h3 className="mt-2 font-serif text-xl font-semibold">
                전 항목 요약, 수치만 가려서
              </h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">
                한 가지 항목은 실제 결과를 공개하고, 나머지도 어떤 답이 나왔는지
                전부 보여드려요.
              </p>
              <div className="mt-5">
                <StatGrid stats={loveLife.previewStats!.slice(0, 4)} compact />
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="flex h-full flex-col rounded-2xl border border-brass/40 bg-white p-6">
              <p className="text-xs font-medium text-brass">STEP 2 · 상세 리포트 (결제 후)</p>
              <h3 className="mt-2 font-serif text-xl font-semibold">
                항목마다 이만큼 깊게
              </h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">
                수치 공개는 시작일 뿐 — 왜 그런지, 언제 조심해야 하는지까지
                항목마다 상세 풀이가 붙습니다.
              </p>
              <div className="mt-5 rounded-xl bg-paper-warm/60 p-5">
                <p className="text-[11px] font-medium text-ink-faint">운명의 상대의 특징과 외모 · 상세 풀이 일부</p>
                <p className="mt-2 font-serif text-[14.5px] leading-[1.9] text-ink">
                  지수님에게 맞는 인연은 목(木) 기운을 가진 사람이에요. 선이 부드럽고 편안한 인상이라
                  표정이 자연스럽고, 꾸미지 않아도 정돈돼 보이는 스타일을 하고 있습니다. 자미두수
                  부처궁의 천량성은 자유와 신뢰를 중요하게 여기는 성향이라, 지수님을 다그치지 않고
                  곁에서 묵묵히 받아주는 쪽과 오래 갑니다. 첫눈에 강하게 끌리는 타입은 아닐
                  가능성이 높아요. 오히려 처음엔 '이성으로는 아닌데' 했던 사람, 일이나 지인을 통해
                  자연스럽게 반복해서 보게 되는 사람일 확률이 큽니다…
                </p>
                <p className="mt-2 text-[11px] text-brass">— 이 뒤로 항목당 약 1,500자 이상 이어져요 (연애·궁합·재회 총 1만자+)</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-[11.5px] text-ink-soft">
                {/* ⚠️ 분량 수치는 실측치로 교체 */}
                <span className="rounded-full border border-line bg-white px-3 py-1">연애·궁합·재회 1만자 이상</span>
                <span className="rounded-full border border-line bg-white px-3 py-1">리뷰 작성 시 추가 질문 1회</span>
                <span className="rounded-full border border-line bg-white px-3 py-1">링크 저장 · 공유</span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
