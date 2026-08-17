import { MAX_AGE, MIN_AGE, describeTop1, lifeStageOf, type Top1Result } from "@/lib/top1";
import WeddingCharacter from "@/components/top1/WeddingCharacter";

export default function Top1Card({ result, name }: { result: Top1Result; name?: string }) {
  const who = name ? `${name}님의` : "나의";
  const speedPct = Math.round(((MAX_AGE - result.marriageAge) / (MAX_AGE - MIN_AGE)) * 100);
  const stage = lifeStageOf(result.marriageAge);

  return (
    <div
      className="overflow-hidden rounded-3xl border border-[#f3b8c8] p-8 text-center sm:p-10"
      style={{ background: "linear-gradient(160deg, #ffedf1 0%, #fff6e0 100%)" }}
    >
      <p className="text-xs font-semibold tracking-widest" style={{ color: "#d6467a" }}>
        우리중 TOP1
      </p>
      <h2 className="mt-2 font-serif text-[19px] font-bold leading-snug text-ink">
        {who} 예상 결혼 나이
      </h2>

      <div className="mx-auto mt-4 flex justify-center">
        <WeddingCharacter stage={stage} />
      </div>

      <p className="mt-2 font-serif text-[64px] font-black leading-none" style={{ color: "#e0356b" }}>
        {result.marriageAge}
        <span className="ml-1 text-2xl font-bold" style={{ color: "#e88aa5" }}>세</span>
      </p>
      <p className="mt-2 text-[12.5px] font-medium text-ink-soft">예상 결혼 나이</p>

      <div className="mx-auto mt-5 h-2 w-full max-w-[220px] overflow-hidden rounded-full bg-white/70">
        <div
          className="h-full rounded-full"
          style={{ width: `${speedPct}%`, background: "linear-gradient(90deg, #f6c667, #e0356b)" }}
        />
      </div>

      <p className="mx-auto mt-5 max-w-[280px] rounded-xl bg-white/60 px-4 py-3 text-[12.5px] leading-relaxed text-ink-soft">
        {describeTop1(result)}
      </p>
    </div>
  );
}
