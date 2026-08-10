import { metrics } from "@/data/site";
import CountUp from "@/components/ui/CountUp";
import Reveal from "@/components/ui/Reveal";

export default function TrustBar() {
  return (
    <section className="border-y border-line bg-paper-warm/60">
      <Reveal className="mx-auto grid max-w-5xl grid-cols-3 divide-x divide-line px-5">
        {metrics.map((m) => (
          <div key={m.label} className="py-8 text-center sm:py-10">
            <div className="font-serif text-2xl font-semibold sm:text-4xl">
              <CountUp value={m.value} suffix={m.suffix} decimals={m.decimals ?? 0} />
            </div>
            <div className="mt-1.5 text-xs text-ink-faint sm:text-sm">{m.label}</div>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
