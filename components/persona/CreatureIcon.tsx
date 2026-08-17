/** 별자리 12궁을 캐릭터 얼굴로 그린 마스코트 아이콘 — 이모지 대신 쓰는 손그림 스타일 SVG.
 *  전부 100x100 뷰박스, 얼굴 원(또는 물고기만 타원)을 공유하고 귀·뿔·무늬만 동물별로 다르다.
 *  next/og(Satori)로 공유 미리보기 이미지를 만들 때도 그대로 재사용하기 위해, 하위 조각은
 *  <Tag/> JSX 대신 일반 함수 호출로 실행하고 Fragment(<>)는 <g>로 쓴다 — Satori가 SVG 안에서
 *  커스텀 컴포넌트 태그와 Fragment를 제대로 처리하지 못해 렌더링이 깨지기 때문. */

type Props = { sign: string; size?: number };

const INK = "#20242c";

function Eyes({ cx1 = 40, cx2 = 60, cy = 52 }: { cx1?: number; cx2?: number; cy?: number }) {
  return (
    <g>
      <ellipse cx={cx1} cy={cy} rx="4.2" ry="5.5" fill={INK} />
      <ellipse cx={cx2} cy={cy} rx="4.2" ry="5.5" fill={INK} />
      <circle cx={cx1 - 1.4} cy={cy - 2} r="1.3" fill="#fff" />
      <circle cx={cx2 - 1.4} cy={cy - 2} r="1.3" fill="#fff" />
    </g>
  );
}

function Mouth({ cy = 66 }: { cy?: number }) {
  return <path d={`M 44 ${cy} Q 50 ${cy + 5} 56 ${cy}`} stroke={INK} strokeWidth="2.2" fill="none" strokeLinecap="round" />;
}

function Cheeks({ fill }: { fill: string }) {
  return (
    <g>
      <circle cx="30" cy="60" r="3.6" fill={fill} opacity="0.55" />
      <circle cx="70" cy="60" r="3.6" fill={fill} opacity="0.55" />
    </g>
  );
}

function Head({ fill, outline }: { fill: string; outline: string }) {
  return <circle cx="50" cy="56" r="32" fill={fill} stroke={outline} strokeWidth="2.5" />;
}

function creature(sign: string) {
  switch (sign) {
    case "양자리": {
      const fur = "#f6ecd9", outline = "#8a7550", horn = "#c9a45c";
      return (
        <g>
          <ellipse cx="21" cy="42" rx="10" ry="6" fill={horn} transform="rotate(-25 21 42)" />
          <ellipse cx="79" cy="42" rx="10" ry="6" fill={horn} transform="rotate(25 79 42)" />
          <ellipse cx="26" cy="53" rx="5.5" ry="8" fill={fur} stroke={outline} strokeWidth="2" />
          <ellipse cx="74" cy="53" rx="5.5" ry="8" fill={fur} stroke={outline} strokeWidth="2" />
          {Head({ fill: fur, outline })}
          <circle cx="36" cy="34" r="4" fill={fur} stroke={outline} strokeWidth="1.6" />
          <circle cx="50" cy="30" r="4.5" fill={fur} stroke={outline} strokeWidth="1.6" />
          <circle cx="64" cy="34" r="4" fill={fur} stroke={outline} strokeWidth="1.6" />
          {Cheeks({ fill: "#e8a97e" })}
          {Eyes({})}
          {Mouth({})}
        </g>
      );
    }
    case "황소자리": {
      const fur = "#e8c9a0", outline = "#a9764a", horn = "#f5f2ea";
      return (
        <g>
          <path d="M 22 38 Q 12 30 16 20" stroke={horn} strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M 78 38 Q 88 30 84 20" stroke={horn} strokeWidth="6" fill="none" strokeLinecap="round" />
          <ellipse cx="24" cy="56" rx="5" ry="7" fill={fur} stroke={outline} strokeWidth="2" />
          <ellipse cx="76" cy="56" rx="5" ry="7" fill={fur} stroke={outline} strokeWidth="2" />
          {Head({ fill: fur, outline })}
          <ellipse cx="50" cy="68" rx="13" ry="9" fill="#f3e2c6" stroke={outline} strokeWidth="2" />
          {Cheeks({ fill: "#d98f5a" })}
          {Eyes({ cy: 49 })}
          <circle cx="44" cy="68" r="1.6" fill={outline} />
          <circle cx="56" cy="68" r="1.6" fill={outline} />
        </g>
      );
    }
    case "쌍둥이자리": {
      const fur = "#f0a868", outline = "#b06a2e", light = "#fff6ea";
      return (
        <g>
          <polygon points="24,34 36,26 34,46" fill={fur} stroke={outline} strokeWidth="2" />
          <polygon points="76,34 64,26 66,46" fill={fur} stroke={outline} strokeWidth="2" />
          {Head({ fill: fur, outline })}
          <ellipse cx="50" cy="66" rx="15" ry="12" fill={light} />
          {Eyes({ cy: 50 })}
          {Mouth({ cy: 64 })}
        </g>
      );
    }
    case "게자리": {
      const fur = "#f08a72", outline = "#c0503a";
      return (
        <g>
          <line x1="38" y1="30" x2="34" y2="16" stroke={outline} strokeWidth="3" strokeLinecap="round" />
          <line x1="62" y1="30" x2="66" y2="16" stroke={outline} strokeWidth="3" strokeLinecap="round" />
          <circle cx="34" cy="14" r="4.5" fill={fur} stroke={outline} strokeWidth="2" />
          <circle cx="66" cy="14" r="4.5" fill={fur} stroke={outline} strokeWidth="2" />
          <ellipse cx="16" cy="58" rx="9" ry="7" fill={fur} stroke={outline} strokeWidth="2.5" transform="rotate(-20 16 58)" />
          <ellipse cx="84" cy="58" rx="9" ry="7" fill={fur} stroke={outline} strokeWidth="2.5" transform="rotate(20 84 58)" />
          {Head({ fill: fur, outline })}
          {Cheeks({ fill: "#c0503a" })}
          {Eyes({ cy: 54 })}
          {Mouth({ cy: 68 })}
        </g>
      );
    }
    case "사자자리": {
      const mane = "#e0932c", fur = "#f0c14b", outline = "#a5661a";
      const petals = Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const x = 50 + Math.cos(a) * 34, y = 56 + Math.sin(a) * 34;
        return <ellipse key={i} cx={x} cy={y} rx="9" ry="6" fill={mane} transform={`rotate(${(a * 180) / Math.PI} ${x} ${y})`} />;
      });
      return (
        <g>
          {petals}
          {Head({ fill: fur, outline })}
          {Cheeks({ fill: "#e0763a" })}
          {Eyes({})}
          {Mouth({})}
        </g>
      );
    }
    case "처녀자리": {
      const fur = "#cfd3da", outline = "#7c8290", inner = "#f2b8c6";
      return (
        <g>
          <polygon points="26,32 38,20 40,42" fill={fur} stroke={outline} strokeWidth="2" />
          <polygon points="30,32 38,25 39,40" fill={inner} />
          <polygon points="74,32 62,20 60,42" fill={fur} stroke={outline} strokeWidth="2" />
          <polygon points="70,32 62,25 61,40" fill={inner} />
          {Head({ fill: fur, outline })}
          {[54, 58, 62].map((y, i) => (
            <line key={`l${i}`} x1="16" y1={y} x2="30" y2={y - 2} stroke={outline} strokeWidth="1.4" strokeLinecap="round" />
          ))}
          {[54, 58, 62].map((y, i) => (
            <line key={`r${i}`} x1="84" y1={y} x2="70" y2={y - 2} stroke={outline} strokeWidth="1.4" strokeLinecap="round" />
          ))}
          {Cheeks({ fill: "#e8909f" })}
          {Eyes({})}
          {Mouth({})}
        </g>
      );
    }
    case "천칭자리": {
      const fur = "#fbfaf6", outline = "#c7c2b0", beak = "#f0a23c";
      return (
        <g>
          <path d="M 30 30 Q 50 8 70 30" stroke={fur} strokeWidth="7" fill="none" strokeLinecap="round" />
          {Head({ fill: fur, outline })}
          <polygon points="46,64 54,64 50,72" fill={beak} />
          {Eyes({ cy: 50 })}
        </g>
      );
    }
    case "전갈자리": {
      const fur = "#8a5a8f", outline = "#5c3960";
      return (
        <g>
          <path d="M 70 78 Q 92 78 90 56 Q 88 40 74 42" stroke={outline} strokeWidth="4" fill="none" strokeLinecap="round" />
          <polygon points="70,38 78,40 72,46" fill={outline} />
          <circle cx="24" cy="36" r="6" fill={fur} stroke={outline} strokeWidth="2" />
          <circle cx="76" cy="36" r="6" fill={fur} stroke={outline} strokeWidth="2" />
          {Head({ fill: fur, outline })}
          {Eyes({})}
          {Mouth({})}
        </g>
      );
    }
    case "사수자리": {
      const fur = "#b97a4a", outline = "#7a4f2c", mane = "#6b4226";
      return (
        <g>
          <polygon points="30,30 22,14 38,26" fill={mane} stroke={outline} strokeWidth="1.6" />
          <polygon points="70,30 78,14 62,26" fill={mane} stroke={outline} strokeWidth="1.6" />
          <ellipse cx="50" cy="24" rx="7" ry="10" fill={mane} />
          {Head({ fill: fur, outline })}
          <ellipse cx="50" cy="70" rx="11" ry="7" fill="#d9b088" stroke={outline} strokeWidth="2" />
          {Eyes({ cy: 50 })}
          <circle cx="45" cy="70" r="1.5" fill={outline} />
          <circle cx="55" cy="70" r="1.5" fill={outline} />
        </g>
      );
    }
    case "염소자리": {
      const fur = "#cbb99a", outline = "#8a7355";
      return (
        <g>
          <polygon points="30,34 14,22 26,42" fill={outline} />
          <polygon points="70,34 86,22 74,42" fill={outline} />
          {Head({ fill: fur, outline })}
          <polygon points="44,76 56,76 50,86" fill="#e8dcc4" stroke={outline} strokeWidth="1.6" />
          {Cheeks({ fill: "#c98f5a" })}
          {Eyes({})}
          {Mouth({})}
        </g>
      );
    }
    case "물병자리": {
      const fur = "#a9764a", outline = "#6b4a2c", belly = "#e8d3ae";
      return (
        <g>
          <polygon points="30,28 24,14 38,24" fill={fur} stroke={outline} strokeWidth="1.6" />
          <polygon points="70,28 76,14 62,24" fill={fur} stroke={outline} strokeWidth="1.6" />
          {Head({ fill: fur, outline })}
          <ellipse cx="50" cy="58" rx="20" ry="18" fill={belly} />
          <circle cx="40" cy="52" r="7" fill="#fff" stroke={INK} strokeWidth="1.6" />
          <circle cx="60" cy="52" r="7" fill="#fff" stroke={INK} strokeWidth="1.6" />
          <circle cx="40" cy="52" r="3.4" fill={INK} />
          <circle cx="60" cy="52" r="3.4" fill={INK} />
          <polygon points="46,66 54,66 50,72" fill={outline} />
        </g>
      );
    }
    case "물고기자리": {
      const fur = "#6fb3c9", outline = "#386f83", fin = "#4a8ca3";
      return (
        <g>
          <polygon points="86,56 68,44 68,68" fill={fin} stroke={outline} strokeWidth="2" />
          <ellipse cx="42" cy="56" rx="30" ry="24" fill={fur} stroke={outline} strokeWidth="2.5" />
          <polygon points="40,32 52,32 46,20" fill={fin} stroke={outline} strokeWidth="1.6" />
          <ellipse cx="30" cy="50" rx="4" ry="5" fill={INK} />
          <circle cx="28.8" cy="48" r="1.2" fill="#fff" />
          <path d="M 22 64 Q 30 68 38 64" stroke={outline} strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      );
    }
    default:
      return (
        <g>
          {Head({ fill: "#e8dcc4", outline: "#8a7355" })}
          {Eyes({})}
          {Mouth({})}
        </g>
      );
  }
}

export default function CreatureIcon({ sign, size = 64 }: Props) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={sign}>
      {creature(sign)}
    </svg>
  );
}
