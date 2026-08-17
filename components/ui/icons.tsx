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

export function IconLifeOverview({ className = base }: P) {
  // 오르내리는 인생의 굴곡 — 평생 총론
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 16c2 0 2-9 5-9s2 12 5 12 2-11 5-11 2 5 3 5" />
    </svg>
  );
}

export function IconRing({ className = base }: P) {
  // 맞물린 두 반지 — 결혼
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="15" r="5" />
      <circle cx="15" cy="15" r="5" />
      <path d="M9 10 11 4h2l2 6" />
    </svg>
  );
}

export function IconPersonaBadge({ className = base }: P) {
  // 원 안의 별 — 나의 유형 배지
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.2 13.3 10.6 17 11.1 14.3 13.5 15 17.2 12 15.3 9 17.2 9.7 13.5 7 11.1 10.7 10.6z" />
    </svg>
  );
}

export function IconTabHome({ className = base }: P) {
  // 별 하나 — 별:결의 '별'
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <path d="M12 3.5c.6 3.1 1.4 5 2.9 6.5s3.4 2.3 6.6 3c-3.2.7-5.1 1.5-6.6 3s-2.3 3.4-2.9 6.5c-.6-3.1-1.4-5-2.9-6.5S5.7 13.7 2.5 13c3.2-.7 5.1-1.5 6.6-3s2.3-3.4 2.9-6.5z" />
    </svg>
  );
}

export function IconTabReport({ className = base }: P) {
  // 접힌 모서리의 문서 — 리포트
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 3.5h8l3 3v14a.5.5 0 0 1-.5.5h-10.5a.5.5 0 0 1-.5-.5v-16.5a.5.5 0 0 1 .5-.5z" />
      <path d="M14.5 3.5v3h3" />
      <path d="M9 13h6M9 16.5h6" />
    </svg>
  );
}

export function IconTabTogether({ className = base }: P) {
  // 나란한 두 사람 — 우리끼리
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8.5" cy="8" r="2.6" />
      <circle cx="16" cy="9.2" r="2.1" />
      <path d="M3.5 19.5c.4-3.4 2.4-5.2 5-5.2s4.6 1.8 5 5.2" />
      <path d="M14.3 14.8c1.9.2 3.3 1.7 3.7 4.7" />
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
  "life-overview": IconLifeOverview,
};
