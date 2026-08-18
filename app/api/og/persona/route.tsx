import { ImageResponse } from "next/og";
import { computePersona, decodePersona } from "@/lib/persona";
import CreatureIcon from "@/components/persona/CreatureIcon";

export const runtime = "nodejs";

// 카카오톡 등에서 실제 결과 카드처럼 세로로 크게 보이도록 4:5 세로 비율로 만든다.
const W = 1080;
const H = 1350;
const PAPER = "#FAF9F5";
const GOLD = "#c9a45c";

function firstSentences(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  const cut = text.slice(0, maxLen);
  const lastDot = cut.lastIndexOf(". ");
  return (lastDot > 40 ? cut.slice(0, lastDot + 1) : cut.trim()) + "…";
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const p = searchParams.get("p");
  const decoded = p ? decodePersona(p) : null;

  if (!decoded) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#131622",
            color: PAPER,
          }}
        >
          <div style={{ display: "flex", fontSize: 64, fontWeight: 700 }}>별:결</div>
          <div style={{ display: "flex", fontSize: 28, color: GOLD, marginTop: 16 }}>
            나는 어떤 결의 사람일까요
          </div>
        </div>
      ),
      { width: W, height: H },
    );
  }

  const result = computePersona({ y: decoded.y, m: decoded.m, d: decoded.d, hourBranch: decoded.h });
  const { type } = result;
  const who = decoded.n ? `${decoded.n}님은` : "당신은";

  // 실제 카드(PersonaCard)와 같은 구성 — 오행별 배경색·배지·이모지 대신 크리처 아이콘·이름·태그라인 —
  // 을 세로로 쌓아서 링크 미리보기가 곧 결과 카드처럼 크게 보이게 한다.
  // next/og(Satori)는 SVG 안에서 커스텀 컴포넌트를 <Tag/> JSX로 쓰면 렌더링이 깨지므로
  // (CreatureIcon 내부에서 이미 순수 함수 호출 방식으로 정리해둠), 여기서도 함수 호출로 쓴다.
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: type.badge.dark,
          color: PAPER,
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 26,
            letterSpacing: 6,
            color: GOLD,
            fontWeight: 600,
          }}
        >
          MY 별:결
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 360,
            height: 360,
            borderRadius: "50%",
            background: type.badge.bg,
            border: `7px solid ${type.badge.ring}`,
            marginTop: 30,
          }}
        >
          {CreatureIcon({ sign: type.sign, size: 290 })}
        </div>

        <div style={{ display: "flex", fontSize: 28, color: "rgba(250,249,245,0.55)", marginTop: 30 }}>
          {who}
        </div>
        <div style={{ display: "flex", fontSize: 62, fontWeight: 700, marginTop: 8 }}>{type.name}</div>
        <div style={{ display: "flex", fontSize: 30, color: GOLD, marginTop: 14 }}>{type.tagline}</div>

        <div
          style={{
            display: "flex",
            marginTop: 30,
            maxWidth: 780,
            padding: "24px 30px",
            borderRadius: 22,
            background: "rgba(250,249,245,0.08)",
            fontSize: 24,
            lineHeight: 1.6,
            textAlign: "center",
            color: "rgba(250,249,245,0.75)",
          }}
        >
          {firstSentences(type.description, 110)}
        </div>

        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: 48,
            fontSize: 22,
            color: "rgba(250,249,245,0.4)",
          }}
        >
          무료로 내 유형 확인하고 궁합 % 비교하기 · 별:결
        </div>
      </div>
    ),
    { width: W, height: H },
  );
}
