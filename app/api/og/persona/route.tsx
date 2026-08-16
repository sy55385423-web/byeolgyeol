import { ImageResponse } from "next/og";
import { computePersona, decodePersona } from "@/lib/persona";

export const runtime = "nodejs";

const W = 1200;
const H = 630;

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
            color: "#FAF9F5",
          }}
        >
          <div style={{ display: "flex", fontSize: 72, fontWeight: 700 }}>별:결</div>
          <div style={{ display: "flex", fontSize: 30, color: "#c9a45c", marginTop: 16 }}>
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
          color: "#FAF9F5",
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
            color: "#c9a45c",
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
            width: 236,
            height: 236,
            borderRadius: "50%",
            background: type.badge.bg,
            border: `8px solid ${type.badge.ring}`,
            fontSize: 128,
            marginBottom: 36,
          }}
        >
          {type.emoji}
        </div>

        <div style={{ display: "flex", fontSize: 28, color: "rgba(250,249,245,0.55)" }}>{who}</div>
        <div style={{ display: "flex", fontSize: 72, fontWeight: 700, marginTop: 6 }}>{type.name}</div>
        <div style={{ display: "flex", fontSize: 32, color: "#c9a45c", marginTop: 16 }}>{type.tagline}</div>

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
