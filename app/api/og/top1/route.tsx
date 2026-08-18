import { ImageResponse } from "next/og";
import { computeTop1, describeTop1, lifeStageOf, MAX_AGE, MIN_AGE } from "@/lib/top1";
import { decodePersona } from "@/lib/persona";
import WeddingCharacter from "@/components/top1/WeddingCharacter";

export const runtime = "nodejs";

const W = 1200;
const H = 630;
const PINK = "#e0356b";
const BG = "linear-gradient(160deg, #ffedf1 0%, #fff6e0 100%)";

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
            background: BG,
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
  const who = decoded.n ? `${decoded.n}님의` : "나의";
  const stage = lifeStageOf(result.marriageAge);
  const speedPct = Math.round(((MAX_AGE - result.marriageAge) / (MAX_AGE - MIN_AGE)) * 100);

  // 실제 카드(Top1Card)와 같은 구성 — 캐릭터·숫자·게이지·코멘트 — 을 그대로 미리보기 이미지로 써서
  // 카톡 등으로 공유했을 때 링크 미리보기가 곧 카드처럼 보이게 한다.
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: BG,
          color: "#17181c",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 48,
            left: 64,
            fontSize: 24,
            letterSpacing: 6,
            color: PINK,
            fontWeight: 600,
          }}
        >
          우리중 TOP1
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 72 }}>
          {/* next/og(Satori)는 SVG 안에서 커스텀 컴포넌트를 <Tag/> JSX로 호출하면 렌더링이 깨지므로
              (WeddingCharacter 내부에서 이미 순수 함수 호출 방식으로 정리해둠), 여기서도 반드시
              <WeddingCharacter/> 태그가 아니라 함수 호출로 써야 한다. */}
          {WeddingCharacter({ stage, size: 300 })}

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <div style={{ display: "flex", fontSize: 34, fontWeight: 700 }}>{who} 예상 결혼 나이</div>

            <div style={{ display: "flex", alignItems: "baseline", marginTop: 18 }}>
              <div style={{ display: "flex", fontSize: 148, fontWeight: 800, color: PINK, lineHeight: 1 }}>
                {result.marriageAge}
              </div>
              <div style={{ display: "flex", fontSize: 44, fontWeight: 700, color: "#e88aa5", marginLeft: 10 }}>
                세
              </div>
            </div>

            <div
              style={{
                display: "flex",
                width: 340,
                height: 14,
                borderRadius: 999,
                background: "rgba(255,255,255,0.7)",
                marginTop: 8,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "flex",
                  width: `${speedPct}%`,
                  height: "100%",
                  borderRadius: 999,
                  background: "linear-gradient(90deg, #f6c667, #e0356b)",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                marginTop: 22,
                maxWidth: 420,
                padding: "18px 22px",
                borderRadius: 18,
                background: "rgba(255,255,255,0.6)",
                fontSize: 21,
                lineHeight: 1.5,
                color: "rgba(23,24,28,0.72)",
              }}
            >
              {describeTop1(result)}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: 40,
            fontSize: 20,
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
