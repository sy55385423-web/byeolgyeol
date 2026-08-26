import { reviews } from "@/data/site";
import Reveal from "@/components/ui/Reveal";

export default function Reviews() {
  return (
    <section className="mx-auto max-w-5xl px-5 py-20 sm:py-24">
      <Reveal>
        <p className="text-sm font-medium tracking-widest text-brass-ink">VOICES</p>
        <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight">
          이런 대목에서 멈칫하게 됩니다
        </h2>
        <p className="mt-3 max-w-lg text-[14.5px] leading-relaxed text-ink-soft">
          아직 후기가 쌓이는 중이라, 리포트에서 사람들이 자주 캡처해 가는 대목의
          결을 예시로 적어 두었습니다.
        </p>
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
      <p className="mt-4 text-xs text-ink-faint">
        위 문구는 실제 후기가 아니라 예시입니다. 후기가 쌓이면 실제 문장으로 교체합니다.
      </p>
    </section>
  );
}
