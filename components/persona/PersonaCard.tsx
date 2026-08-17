import { ELEMENTS, type PersonaResult, type PersonaType } from "@/lib/persona";
import CreatureIcon from "./CreatureIcon";

export function PersonaBadge({ type, size = 220 }: { type: PersonaType; size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full border-2"
      style={{
        width: size,
        height: size,
        background: type.badge.bg,
        borderColor: type.badge.ring,
      }}
    >
      <CreatureIcon sign={type.sign} size={size * 0.82} />
    </div>
  );
}

function StatBar({ label, value, tone }: { label: string; value: number; tone: "strong" | "weak" }) {
  return (
    <div className="rounded-xl border border-line bg-white p-3">
      <div className="flex items-center justify-between text-[12px]">
        <span className="font-medium text-ink">{label}</span>
        <span className={tone === "strong" ? "font-serif font-bold text-brass" : "font-serif font-bold text-ink-faint"}>
          {value}
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-paper-warm">
        <div
          className={`h-full rounded-full ${tone === "strong" ? "bg-brass" : "bg-ink-faint/50"}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default function PersonaCard({ result, name }: { result: PersonaResult; name?: string }) {
  const { type, element, sign, activeGroup, mingStar, strong, weak } = result;
  const chips = [
    `사주 — ${ELEMENTS[element]} 기운`,
    `점성술 — ${sign} (${activeGroup === 0 ? "능동궁" : "수용궁"})`,
    ...(mingStar ? [`자미두수 — ${mingStar}성`] : []),
  ];

  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-white">
      <div className="px-6 py-7 text-paper sm:px-8" style={{ background: type.badge.dark }}>
        <p className="text-xs font-medium tracking-widest text-brass-soft">MY 별:결</p>
        <div className="mt-4 flex justify-center">
          <PersonaBadge type={type} />
        </div>
        <p className="mt-5 text-center text-[13px] text-paper/60">{name ? `${name}님은` : "당신은"}</p>
        <h2 className="mt-1 text-center font-serif text-3xl font-bold tracking-tight">{type.name}</h2>
        <p className="mt-2 text-center text-[14.5px] text-brass-soft">{type.tagline}</p>
        <p className="mt-4 text-[13.5px] leading-relaxed text-paper/75">{type.description}</p>
        <div className="mt-5 flex flex-wrap gap-1.5">
          {chips.map((l) => (
            <span key={l} className="rounded-full border border-paper/20 px-2.5 py-1 text-[10.5px] text-paper/70">
              {l}
            </span>
          ))}
        </div>
      </div>

      <div className="p-6 sm:p-8" style={{ background: type.badge.bg }}>
        <p className="text-xs font-medium text-brass">강한 성향</p>
        <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {strong.map((s) => (
            <StatBar key={s.label} label={s.label} value={s.value} tone="strong" />
          ))}
        </div>

        <p className="mt-6 text-xs font-medium text-ink-faint">약한 성향</p>
        <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {weak.map((s) => (
            <StatBar key={s.label} label={s.label} value={s.value} tone="weak" />
          ))}
        </div>

      </div>
    </div>
  );
}
