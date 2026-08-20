import type { PreviewStat } from "@/data/categories";
import { fixJosa } from "@/lib/report";

/** 카드뉴스 스타일 미리보기 스탯 그리드.
 *  revealed 항목은 그대로 보여주고, 나머지는 값만 blur 처리한다.
 *  값은 Flow에서 실제 명반 엔진(values())으로 채워 넣는다. 그래서 결제 후 리포트와
 *  같은 답이 나온다. 값이 사람마다 달라지므로 접미사의 조사도 값에 맞춰야 한다
 *  ("추진형이에요" / "리더형이에요"는 되지만 값이 바뀌면 어긋나는 자리가 생긴다). */
export default function StatGrid({
  stats,
  name,
  partnerName,
  compact = false,
}: {
  stats: PreviewStat[];
  name?: string;
  partnerName?: string;
  compact?: boolean;
}) {
  const who = name ? `${name}님의 ` : "";
  const pWho = partnerName ? `${partnerName}님의 ` : "상대방의 ";
  return (
    <div className={`grid gap-3 ${compact ? "grid-cols-2" : "sm:grid-cols-2"}`}>
      {stats.map((s) => {
        const revealed = !!s.revealed;
        return (
          <div
            key={s.label}
            className={`relative flex flex-col rounded-2xl border ${
              compact ? "p-4" : "p-5 sm:p-6"
            } ${
              revealed
                ? "border-brass/60 bg-night text-paper"
                : "border-line bg-white"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <p
                className={`font-medium ${compact ? "text-[10.5px]" : "text-[11.5px]"} ${
                  revealed ? "text-paper/50" : "text-ink-faint"
                }`}
              >
                {s.label}
              </p>
              {revealed ? (
                <span className="shrink-0 rounded-full bg-brass px-2 py-0.5 text-[10px] font-bold text-night">
                  공개
                </span>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  className={`shrink-0 ${compact ? "h-3 w-3" : "h-3.5 w-3.5"} ${"text-ink-faint"}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                >
                  <rect x="5" y="11" width="14" height="9" rx="2" />
                  <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                </svg>
              )}
            </div>

            <p
              className={`${compact ? "mt-2 text-[11.5px]" : "mt-3 text-[13px]"} ${
                revealed ? "text-paper/60" : "text-ink-soft"
              }`}
            >
              {s.subject === "shared" ? "" : s.subject === "partner" ? pWho : who}
              {s.prefix.replace(/\s+$/, "")}
            </p>

            <p className={`${compact ? "mt-0.5" : "mt-1"} leading-tight`}>
              <span
                aria-hidden
                className={`font-serif font-bold ${
                  compact ? "text-xl" : "text-2xl sm:text-3xl"
                } ${
                  revealed
                    ? "text-brass-soft"
                    : "select-none text-brass blur-[7px]"
                }`}
              >
                {s.value}
              </span>
              {s.suffix && (
                <span
                  className={`${compact ? "text-[11.5px]" : "text-[13.5px]"} ${
                    revealed ? "text-paper/70" : "text-ink-soft"
                  }`}
                >
                  {fixJosa(s.suffix, s.value)}
                </span>
              )}
            </p>

            {s.gauge !== undefined && (
              <div
                className={`mt-auto ${compact ? "pt-2.5" : "pt-4"}`}
              >
                <div
                  className={`h-1.5 overflow-hidden rounded-full ${
                    revealed ? "bg-night-line" : "bg-paper-warm"
                  }`}
                >
                  <div
                    className="h-full rounded-full bg-brass"
                    style={{ width: `${s.gauge}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
