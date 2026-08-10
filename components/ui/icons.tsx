/** 커스텀 라인 아이콘 — 이모지/스톡 아이콘 대체. stroke 1.5, 절제된 기하학 형태. */

type P = { className?: string };
const base = "w-6 h-6";

export function IconLoveLife({ className = base }: P) {
  // 달의 위상 — 평생의 흐름
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 3.5a8.5 8.5 0 0 1 0 17 6.5 6.5 0 0 0 0-17z" fill="currentColor" fillOpacity="0.12" stroke="none" />
      <path d="M12 3.5a8.5 8.5 0 0 1 0 17" />
    </svg>
  );
}

export function IconCompat({ className = base }: P) {
  // 겹치는 두 궤도
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.5">
      <circle cx="9.5" cy="12" r="6.5" />
      <circle cx="14.5" cy="12" r="6.5" />
    </svg>
  );
}

export function IconReunion({ className = base }: P) {
  // 되돌아오는 궤적
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M19 12a7 7 0 1 1-2.05-4.95" />
      <path d="M17 3.5v3.7h3.7" />
    </svg>
  );
}

export function IconCareer({ className = base }: P) {
  // 오르는 계단식 선
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19h4v-4h4v-4h4V7h4" />
    </svg>
  );
}

export function IconWealth({ className = base }: P) {
  // 그릇에 모이는 획
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M5 10c0 5 2.5 8.5 7 8.5s7-3.5 7-8.5" />
      <path d="M12 3v7" />
      <path d="M8.5 6.5 12 10l3.5-3.5" />
    </svg>
  );
}

export function IconHealth({ className = base }: P) {
  // 고요한 맥박선
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12h4l2.5-5 4 10 2.5-5h5" />
    </svg>
  );
}

export function IconCheck({ className = "w-4 h-4" }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 13l4 4 10-10" />
    </svg>
  );
}

export function IconArrow({ className = "w-4 h-4" }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export const categoryIcons: Record<string, (p: P) => React.ReactElement> = {
  "love-life": IconLoveLife,
  "love-compatibility": IconCompat,
  "love-reunion": IconReunion,
  career: IconCareer,
  wealth: IconWealth,
  health: IconHealth,
};
