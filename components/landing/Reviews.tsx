import { reviews } from "@/data/site";
import Reveal from "@/components/ui/Reveal";

export default function Reviews() {
  return (
    <section className="mx-auto max-w-5xl px-5 py-20 sm:py-24">
      <Reveal>
        <p className="text-sm font-medium tracking-widest text-brass">VOICES</p>
        <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight">
          먼저 읽어본 사람들
        </h2>
      </Reveal>
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {reviews.map((r, i) => (
          <Reveal key={r.meta} delay={i * 0.07}>
            <figure className="h-full rounded-2xl border border-line bg-white/70 p-6">
              <blockquote className="text-[15px] leading-relaxed text-ink-soft">
                {r.body}
              </blockquote>
              <figcaption className="mt-4 text-xs text-ink-faint">{r.meta}</figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
      {/* ⚠️ 실제 후기 데이터 연동 전까지 예시임을 명시 — 허위 후기 금지 */}
      <p className="mt-4 text-xs text-ink-faint">* 후기 문구는 예시이며, 실제 후기로 순차 교체됩니다.</p>
    </section>
  );
}
