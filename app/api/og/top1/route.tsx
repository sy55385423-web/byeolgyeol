import { ImageResponse } from "next/og";
import { computeTop1 } from "@/lib/top1";
import { decodePersona } from "@/lib/persona";

export const runtime = "nodejs";

const W = 1200;
const H = 630;
const PINK = "#e0356b";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const p = searchParams.get("p");
  const decoded = p ? decodePersona(p) : null;

  const bg = "linear-gradient(160deg, #ffedf1 0%, #fff6e0 100%)";

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
            background: bg,
            color: "#17181c",
          }}
        >
          <div style={{ display: "flex", fontSize: 64, fontWeight: 700 }}>우리중 TOP1</div>
          <div style={{ display: "flex", fontSize: 28, color: PINK, marginTop: 16 }}>
            우리중 결혼 가장 먼저 하는 사람은?
          </div>
        </div>
      ),
      { width: W, height: H },
    );
  }

  const result = computeTop1({ y: decoded.y, m: decoded.m, d: decoded.d, hourBranch: decoded.h });
  const who = decoded.n ? `${decoded.n}님은` : "나는";

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
          background: bg,
          color: "#17181c",
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
            color: PINK,
            fontWeight: 600,
          }}
        >
          우리중 TOP1
        </div>

        <div style={{ display: "flex", fontSize: 26, color: "rgba(23,24,28,0.55)" }}>
          {who} 우리 중 결혼을 가장 먼저 할까요?
        </div>

        <div style={{ display: "flex", alignItems: "baseline", marginTop: 28 }}>
          <div style={{ display: "flex", fontSize: 160, fontWeight: 800, color: PINK, lineHeight: 1 }}>
            {result.marriageAge}
          </div>
          <div style={{ display: "flex", fontSize: 48, fontWeight: 700, color: "#e88aa5", marginLeft: 10 }}>세</div>
        </div>
        <div style={{ display: "flex", fontSize: 24, color: "rgba(23,24,28,0.5)", marginTop: 8 }}>
          예상 결혼 나이
        </div>

        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: 44,
            fontSize: 22,
            color: "rgba(23,24,28,0.4)",
          }}
        >
          무료로 내 결혼 나이 확인하고 친구들과 순위 비교하기 · 별:결
        </div>
      </div>
    ),
    { width: W, height: H },
  );
}
