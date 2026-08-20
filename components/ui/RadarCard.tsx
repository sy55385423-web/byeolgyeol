import type { RadarStats } from "@/lib/report";

/** 원형 게이지(핵심 점수) + 5축 레이더 다이어그램. 카테고리별 radarStats() 값을 그대로 그림. */
export default function RadarCard({ stats }: { stats: RadarStats }) {
  const { title, score, caption, axes } = stats;

  // 원형 게이지
  const R = 50;
  const C = 2 * Math.PI * R;
  const offset = C * (1 - score / 100);

  // 레이더 — 5축 정오각형, 중심(120,120), 최대 반경 80
  const cx = 120, cy = 120, maxR = 80;
  const n = axes.length;
  const angleFor = (i: number) => (360 / n) * i - 90;
  const pointAt = (i: number, r: number) => {
    const rad = (angleFor(i) * Math.PI) / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)] as const;
  };
  const ringLevels = [0.33, 0.66, 1];
  const ringPoints = (level: number) =>
    axes.map((_, i) => pointAt(i, maxR * level).join(",")).join(" ");
  const dataPoints = axes.map((a, i) => pointAt(i, (Math.max(0, Math.min(100, a.value)) / 100) * maxR).join(",")).join(" ");

  return (
    <div className="rounded-2xl border border-line bg-white p-6">
      {/* 원형 게이지 */}
      <div className="flex flex-col items-center">
        <div className="relative h-[120px] w-[120px]">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <circle cx="60" cy="60" r={R} fill="none" stroke="#e7e4dc" strokeWidth="10" />
            <circle
              cx="60"
              cy="60"
              r={R}
              fill="none"
              stroke="#b78a3c"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-serif text-3xl font-bold text-ink">{Math.round(score)}</span>
          </div>
        </div>
        <p className="mt-3 text-[15px] font-medium text-ink">{title}</p>
        {caption && <p className="text-[13px] text-ink-faint">{caption}</p>}
      </div>

      {/* 레이더 */}
      <div className="mt-6 px-6">
        <svg viewBox="0 0 240 240" className="mx-auto w-full max-w-[260px] overflow-visible">
          {ringLevels.map((level) => (
            <polygon key={level} points={ringPoints(level)} fill="none" stroke="#e7e4dc" strokeWidth="1" />
          ))}
          {axes.map((_, i) => {
            const [x, y] = pointAt(i, maxR);
            return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#e7e4dc" strokeWidth="1" />;
          })}
          <polygon points={dataPoints} fill="#b78a3c" fillOpacity="0.22" stroke="#b78a3c" strokeWidth="2" />
          {axes.map((a, i) => {
            const [x, y] = pointAt(i, (Math.max(0, Math.min(100, a.value)) / 100) * maxR);
            return <circle key={i} cx={x} cy={y} r="3" fill="#b78a3c" />;
          })}
          {axes.map((a, i) => {
            const [x, y] = pointAt(i, maxR + 20);
            const anchor = x < cx - 4 ? "end" : x > cx + 4 ? "start" : "middle";
            const dy = y < cy - 4 ? -2 : y > cy + 4 ? 10 : 4;
            return (
              <text
                key={i}
                x={x}
                y={y + dy}
                textAnchor={anchor}
                className="fill-[#8a8478] text-[12px]"
              >
                {a.label}
              </text>
            );
          })}
        </svg>
      </div>

      {/* 축마다 무엇으로 계산했는지 밝힌다.
          이 그림은 명리 개념을 심리 척도로 한 번 더 옮긴 것이라 본문보다 해석이
          많이 들어간다. 근거를 감추기보다 숫자를 그대로 보여 주고 판단을 맡긴다. */}
      {axes.some((a) => a.basis) && (
        <div className="mt-5 border-t border-line pt-4">
          <p className="mb-2 text-[11px] font-medium text-brass">이 수치는 이렇게 나왔어요</p>
          <ul className="space-y-1.5">
            {axes.map((a) => (
              <li key={a.label} className="flex items-baseline gap-2 text-[11.5px] leading-relaxed">
                <span className="w-[62px] shrink-0 text-ink-soft">{a.label}</span>
                <span className="w-[26px] shrink-0 text-right font-medium tabular-nums text-ink">
                  {a.value}
                </span>
                <span className="text-ink-faint">{a.basis}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2.5 text-[10.5px] leading-relaxed text-ink-faint">
            십신의 무게와 강약(감당하는 힘)으로 계산한 뒤, 같은 항목을 가진 사람들
            사이에서 어디쯤인지로 환산한 값이에요.
          </p>
        </div>
      )}
    </div>
  );
}
