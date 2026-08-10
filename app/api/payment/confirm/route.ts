import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { paymentKey, orderId, amount } = (await req.json()) as {
    paymentKey: string;
    orderId: string;
    amount: number;
  };

  const secretKey = process.env.TOSS_SECRET_KEY;
  if (!secretKey) {
    console.error("[payment/confirm] TOSS_SECRET_KEY가 설정되지 않았습니다.");
    return NextResponse.json({ ok: false, error: "서버 설정 오류" }, { status: 500 });
  }

  const auth = Buffer.from(`${secretKey}:`).toString("base64");

  const res = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  });

  if (res.ok) {
    return NextResponse.json({ ok: true });
  }

  const err = await res.json().catch(() => ({}));
  console.error("[payment/confirm] Toss 결제 검증 실패:", err);
  return NextResponse.json({ ok: false, error: err }, { status: 400 });
}
