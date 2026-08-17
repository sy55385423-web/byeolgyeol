import type { LifeStage } from "@/lib/top1";

/** 결혼 나이 농담용 일러스트 — 생애 단계(아기/학생/어른/노인)에 맞춰 결혼식을 올리는
 *  캐릭터가 바뀐다. 진지한 사주 해석이 아니라 순전히 재미 요소.
 *  팔·다리·머리결까지 그려서 단순 아이콘보다 실제 캐릭터에 가깝게, 단계별 소품으로 웃음 포인트를 더했다. */

const INK = "#3a2f28";
const GOLD = "#d4af37";
const SHOE = "#6b4a3a";
const DRESS_WHITE = "#fdfbf6"; // 웨딩드레스는 단계 상관없이 흰색/아이보리 — 단계 구분은 허리 새시 색으로만

const STAGE_COLOR: Record<LifeStage, { sash: string; suit: string; skin: string; hair: string }> = {
  baby: { sash: "#ffb3c6", suit: "#bfe8d4", skin: "#ffe0c2", hair: "#5b4636" },
  student: { sash: "#ff8fb5", suit: "#9fd6e0", skin: "#f5d7b8", hair: "#2b2118" },
  adult: { sash: "#e8748f", suit: "#6fa8dc", skin: "#f5d7b8", hair: "#2b2118" },
  elder: { sash: "#8f4a63", suit: "#454b58", skin: "#f0d3b0", hair: "#e6e6ec" },
};

function GradCap({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <polygon points={`${cx},${cy - 7} ${cx + 22},${cy} ${cx},${cy + 7} ${cx - 22},${cy}`} fill="#2b2118" />
      <circle cx={cx} cy={cy} r="2.6" fill="#2b2118" />
      <line x1={cx + 20} y1={cy} x2={cx + 24} y2={cy + 10} stroke={GOLD} strokeWidth="1.5" />
      <circle cx={cx + 24} cy={cy + 11} r="1.8" fill={GOLD} />
    </g>
  );
}

function HairStrands({ x }: { x: number }) {
  return (
    <g>
      <path d={`M${x - 16} 44 Q${x - 12} 39 ${x - 8} 43`} stroke="#00000030" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d={`M${x + 6} 41 Q${x + 10} 37 ${x + 14} 41`} stroke="#00000030" strokeWidth="1" fill="none" strokeLinecap="round" />
    </g>
  );
}

function Bouquet({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <path d={`M${x} ${y} L${x} ${y + 9}`} stroke="#7dd3a8" strokeWidth="2" strokeLinecap="round" />
      <circle cx={x - 4} cy={y - 4} r="3.2" fill="#f2879e" />
      <circle cx={x + 4} cy={y - 5} r="3.2" fill="#f6c667" />
      <circle cx={x} cy={y - 7} r="3.2" fill="#ef5f83" />
    </g>
  );
}

function Rattle({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <line x1={x} y1={y} x2={x} y2={y + 11} stroke="#e8a23c" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx={x} cy={y - 5} r="5.5" fill="#f6c667" stroke={INK} strokeWidth="1.2" />
      <circle cx={x - 1.6} cy={y - 6.6} r="1.1" fill="#fff" opacity="0.85" />
    </g>
  );
}

function Books({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x - 10} y={y - 2} width="20" height="5.5" rx="1" fill="#7ab8e0" stroke={INK} strokeWidth="1" />
      <rect x={x - 9} y={y - 8} width="18" height="5.5" rx="1" fill="#f2879e" stroke={INK} strokeWidth="1" />
      <rect x={x - 8} y={y - 14} width="16" height="5.5" rx="1" fill="#7dd3a8" stroke={INK} strokeWidth="1" />
    </g>
  );
}

function CoffeeCup({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <path d={`M${x - 6} ${y - 9} L${x - 5} ${y + 5} Q${x} ${y + 8} ${x + 5} ${y + 5} L${x + 6} ${y - 9} Z`} fill="#fff" stroke={INK} strokeWidth="1.2" />
      <path d={`M${x + 6} ${y - 6} Q${x + 12} ${y - 6} ${x + 11} ${y - 1} Q${x + 10} ${y + 2} ${x + 5} ${y + 1}`} fill="none" stroke={INK} strokeWidth="1.2" />
      <path d={`M${x - 2} ${y - 13} Q${x - 3} ${y - 16} ${x - 1} ${y - 18}`} stroke="#c9c9c9" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d={`M${x + 2} ${y - 13} Q${x + 1} ${y - 16} ${x + 3} ${y - 18}`} stroke="#c9c9c9" strokeWidth="1" fill="none" strokeLinecap="round" />
    </g>
  );
}

function Cane({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <line x1={x} y1={y - 6} x2={x} y2={y + 24} stroke="#8b5e3c" strokeWidth="3" strokeLinecap="round" />
      <path d={`M${x} ${y - 6} Q${x - 9} ${y - 9} ${x - 9} ${y - 1}`} fill="none" stroke="#8b5e3c" strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

type FigureProps = {
  cx: number; // 머리 중심 x
  dress?: boolean; // true=드레스(보디스+스커트), false=수트(재킷+옷깃)
  color: string;
  skin: string;
  hair: string;
  stage: LifeStage;
  outerProp?: "bouquet" | "rattle" | "books" | "coffee" | "cane";
};

function Figure({ cx, dress = true, color, skin, hair, stage, outerProp }: FigureProps) {
  const isBaby = stage === "baby";
  const isElder = stage === "elder";
  const isStudent = stage === "student";
  const headCy = 58;
  const legY = dress ? 128 : 128;
  const inX = dress ? cx + 12 : cx - 12; // 안쪽(맞잡는) 팔 방향
  const outX = dress ? cx - 12 : cx + 12; // 바깥쪽(소품 든) 팔 방향
  const handIn = dress ? { x: cx + 31, y: 105 } : { x: cx - 27, y: 106 };
  const handOut = dress ? { x: cx - 26, y: 104 } : { x: cx + 26, y: 104 };

  return (
    <g>
      {/* 다리/신발 — 몸통보다 먼저 그려서 밑단 아래로만 살짝 보이게 */}
      <ellipse cx={cx - 8} cy={legY} rx="6" ry="4" fill={SHOE} />
      <ellipse cx={cx + 8} cy={legY} rx="6" ry="4" fill={SHOE} />

      {/* 몸통 — 드레스는 흰색 고정, 새시(허리띠) 색으로만 단계 구분 */}
      {dress ? (
        <g>
          <path d={`M${cx - 12} 78 Q${cx} 74 ${cx + 12} 78 L${cx + 10} 98 Q${cx} 102 ${cx - 10} 98 Z`} fill={DRESS_WHITE} stroke={INK} strokeWidth="2" />
          <path d={`M${cx - 10} 96 Q${cx} 92 ${cx + 10} 96 L${cx + 20} 124 Q${cx} 132 ${cx - 20} 124 Z`} fill={DRESS_WHITE} stroke={INK} strokeWidth="2" />
          <path d={`M${cx - 10} 96 Q${cx} 100 ${cx + 10} 96`} stroke={color} strokeWidth="5" fill="none" strokeLinecap="round" />
        </g>
      ) : (
        <g>
          <path d={`M${cx - 18} 78 L${cx + 18} 78 L${cx + 22} 124 L${cx - 22} 124 Z`} fill={color} stroke={INK} strokeWidth="2" />
          <polygon points={`${cx - 8},78 ${cx},88 ${cx - 4},78`} fill="#00000022" />
          <polygon points={`${cx + 8},78 ${cx},88 ${cx + 4},78`} fill="#00000022" />
          <circle cx={cx} cy={100} r="1.8" fill={INK} />
          <circle cx={cx} cy={110} r="1.8" fill={INK} />
          <polygon points={`${cx},80 ${cx - 5},90 ${cx + 5},90`} fill="#ef5f83" />
        </g>
      )}

      {/* 팔 — 안쪽(맞잡기) + 바깥쪽(소품). 드레스는 흰 소매(배경에 묻히지 않게 외곽선 먼저), 수트는 각 단계 색 */}
      <path d={`M${inX} 80 Q${(inX + handIn.x) / 2} 92 ${handIn.x} ${handIn.y}`} stroke={INK} strokeWidth="11" fill="none" strokeLinecap="round" />
      <path d={`M${outX} 80 Q${(outX + handOut.x) / 2} 90 ${handOut.x} ${handOut.y}`} stroke={INK} strokeWidth="11" fill="none" strokeLinecap="round" />
      <path d={`M${inX} 80 Q${(inX + handIn.x) / 2} 92 ${handIn.x} ${handIn.y}`} stroke={dress ? DRESS_WHITE : color} strokeWidth="9" fill="none" strokeLinecap="round" />
      <path d={`M${outX} 80 Q${(outX + handOut.x) / 2} 90 ${handOut.x} ${handOut.y}`} stroke={dress ? DRESS_WHITE : color} strokeWidth="9" fill="none" strokeLinecap="round" />
      <circle cx={handOut.x} cy={handOut.y} r="6" fill={skin} stroke={INK} strokeWidth="1.4" />

      {/* 소품 — next/og(Satori)가 SVG 안에서 커스텀 컴포넌트를 <Tag/> JSX로 쓰면 렌더링이 깨져서
          (빈 화면 또는 파싱 에러), 순수 함수 호출로 직접 실행해 결과 엘리먼트만 끼워넣는다.
          Bouquet 등은 상태·훅이 없는 순수 함수라 일반 React 렌더링에서도 동일하게 동작한다. */}
      {outerProp === "bouquet" && Bouquet({ x: handOut.x, y: handOut.y - 4 })}
      {outerProp === "rattle" && Rattle({ x: handOut.x, y: handOut.y - 6 })}
      {outerProp === "books" && Books({ x: handOut.x, y: handOut.y - 8 })}
      {outerProp === "coffee" && CoffeeCup({ x: handOut.x, y: handOut.y - 8 })}
      {outerProp === "cane" && Cane({ x: handOut.x, y: handOut.y })}

      {/* 아기 전용: 턱받이 */}
      {isBaby && (
        <path d={`M${cx - 10} 78 Q${cx} 86 ${cx + 10} 78 Q${cx} 84 ${cx - 10} 78 Z`} fill="#ffffff" opacity="0.9" stroke={INK} strokeWidth="1" />
      )}

      {/* 웨딩 베일 — 드레스 쪽은 단계 상관없이 항상 착용, 머리 뒤에서 은은하게 비치도록 */}
      {dress && <ellipse cx={cx} cy={76} rx="27" ry="35" fill="#ffffff" opacity="0.45" />}

      {/* 머리카락 */}
      {!isBaby && (
        <path
          d={`M${cx - 20} 46 Q${cx} 30 ${cx + 20} 46 Q${cx + 20} 56 ${cx} 58 Q${cx - 20} 56 ${cx - 20} 46 Z`}
          fill={hair}
          stroke={INK}
          strokeWidth="1.2"
        />
      )}
      {(isStudent || stage === "adult") && HairStrands({ x: cx })}
      {isStudent && GradCap({ cx, cy: 35 })}

      {/* 머리(피부) */}
      <circle cx={cx} cy={headCy} r="19" fill={skin} stroke={INK} strokeWidth="2" />

      {/* 눈썹 */}
      {!isBaby && (
        <g>
          <path d={`M${cx - 11} 50 Q${cx - 7} 47 ${cx - 3} 50`} stroke={INK} strokeWidth="1.3" fill="none" strokeLinecap="round" />
          <path d={`M${cx + 3} 50 Q${cx + 7} 47 ${cx + 11} 50`} stroke={INK} strokeWidth="1.3" fill="none" strokeLinecap="round" />
        </g>
      )}

      {/* 눈/볼/입 — 단계별 */}
      {isBaby ? (
        <g>
          <path d={`M${cx - 3} 41 Q${cx} 35 ${cx + 3} 40`} stroke={hair} strokeWidth="4" fill="none" strokeLinecap="round" />
          <circle cx={cx - 7} cy={58} r="5" fill={INK} />
          <circle cx={cx + 7} cy={58} r="5" fill={INK} />
          <circle cx={cx - 8.7} cy={56} r="1.6" fill="#fff" />
          <circle cx={cx + 5.3} cy={56} r="1.6" fill="#fff" />
          <circle cx={cx - 13} cy={66} r="4" fill="#ff9fb0" opacity="0.7" />
          <circle cx={cx + 13} cy={66} r="4" fill="#ff9fb0" opacity="0.7" />
          <path d={`M${cx - 4} 70 Q${cx} 74 ${cx + 4} 70`} stroke={INK} strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </g>
      ) : isElder ? (
        <g>
          <path d={`M${cx - 7} 58 Q${cx - 4} 55 ${cx - 1} 58`} stroke={INK} strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <path d={`M${cx + 1} 58 Q${cx + 4} 55 ${cx + 7} 58`} stroke={INK} strokeWidth="1.6" fill="none" strokeLinecap="round" />
          {!dress && (
            <g>
              <circle cx={cx - 7} cy={59} r="6.5" fill="none" stroke={INK} strokeWidth="1.4" />
              <circle cx={cx + 7} cy={59} r="6.5" fill="none" stroke={INK} strokeWidth="1.4" />
              <line x1={cx - 0.5} y1={59} x2={cx + 0.5} y2={59} stroke={INK} strokeWidth="1.4" />
            </g>
          )}
          <path d={`M${cx - 16} 64 L${cx - 13} 66`} stroke={INK} strokeWidth="1.2" strokeLinecap="round" />
          <path d={`M${cx + 16} 64 L${cx + 13} 66`} stroke={INK} strokeWidth="1.2" strokeLinecap="round" />
          <path d={`M${cx - 7} 70 Q${cx} 74 ${cx + 7} 70`} stroke={INK} strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </g>
      ) : (
        <g>
          <ellipse cx={cx - 7} cy={58} rx="3.2" ry="4" fill={INK} />
          <ellipse cx={cx + 7} cy={58} rx="3.2" ry="4" fill={INK} />
          <circle cx={cx - 8.2} cy={56.3} r="1.1" fill="#fff" />
          <circle cx={cx + 5.8} cy={56.3} r="1.1" fill="#fff" />
          <path d={`M${cx - 6} 70 Q${cx} 74 ${cx + 6} 70`} stroke={INK} strokeWidth="1.6" fill="none" strokeLinecap="round" />
          {isStudent && <circle cx={cx - 2} cy={65} r="0.9" fill="#e8a2a2" />}
        </g>
      )}
    </g>
  );
}

export default function WeddingCharacter({ stage, size = 168 }: { stage: LifeStage; size?: number }) {
  const c = STAGE_COLOR[stage];
  const bProp = stage === "baby" ? "rattle" : stage === "student" ? "books" : stage === "adult" ? "coffee" : "cane";

  return (
    <svg
      viewBox="0 0 200 148"
      width={size}
      height={(size * 148) / 200}
      role="img"
      aria-label={`${stage} 캐릭터 결혼식`}
    >
      {/* 컨페티 */}
      <circle cx="18" cy="16" r="4" fill="#f6c667" />
      <circle cx="40" cy="6" r="3" fill="#7dd3a8" />
      <circle cx="164" cy="10" r="3.5" fill="#f2879e" />
      <circle cx="184" cy="22" r="3" fill="#7ab8e0" />
      <circle cx="100" cy="2" r="3" fill="#f6c667" />
      <circle cx="8" cy="38" r="2.5" fill="#7ab8e0" />
      <circle cx="192" cy="44" r="2.5" fill="#7dd3a8" />

      {/* 가운데 하트 */}
      <path
        d="M100 28 C96 22 87 23 87 31 C87 38 100 47 100 47 C100 47 113 38 113 31 C113 23 104 22 100 28 Z"
        fill="#ef5f83"
      />

      {Figure({ cx: 70, dress: true, color: c.sash, skin: c.skin, hair: c.hair, stage, outerProp: "bouquet" })}
      {Figure({ cx: 130, dress: false, color: c.suit, skin: c.skin, hair: c.hair, stage, outerProp: bProp })}
    </svg>
  );
}
