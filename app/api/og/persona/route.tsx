import { ImageResponse } from "next/og";
import { computePersona, decodePersona } from "@/lib/persona";
import CreatureIcon from "@/components/persona/CreatureIcon";

export const runtime = "nodejs";

const W = 1200;
const H = 630;
const PAPER = "#FAF9F5";
const GOLD = "#c9a45c";

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
          <div style={{ display: "flex", fontSize: 72, fontWeight: 700 }}>별:결</div>
          <div style={{ display: "flex", fontSize: 30, color: GOLD, marginTop: 16 }}>
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
  // 을 그대로 미리보기 이미지로 써서 공유했을 때 링크 미리보기가 곧 카드처럼 보이게 한다.
  // next/og(Satori)는 SVG 안에서 커스텀 컴포넌트를 <Tag/> JSX로 쓰면 렌더링이 깨지므로
  // (CreatureIcon 내부에서 이미 순수 함수 호출 방식으로 정리해둠), 여기서도 함수 호출로 쓴다.
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
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
            position: "absolute",
            top: 56,
            left: 72,
            fontSize: 26,
            letterSpacing: 6,
            color: GOLD,
            fontWeight: 600,
          }}
        >
          MY 별:결
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 72 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 260,
              height: 260,
              borderRadius: "50%",
              background: type.badge.bg,
              border: `6px solid ${type.badge.ring}`,
            }}
          >
            {CreatureIcon({ sign: type.sign, size: 210 })}
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <div style={{ display: "flex", fontSize: 28, color: "rgba(250,249,245,0.55)" }}>{who}</div>
            <div style={{ display: "flex", fontSize: 68, fontWeight: 700, marginTop: 8 }}>{type.name}</div>
            <div style={{ display: "flex", fontSize: 30, color: GOLD, marginTop: 14 }}>{type.tagline}</div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: 44,
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
