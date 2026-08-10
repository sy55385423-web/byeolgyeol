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
    </div>
  );
}
