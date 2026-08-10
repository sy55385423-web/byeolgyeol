"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function SuccessBody() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [message, setMessage] = useState("결제를 확인하는 중이에요…");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const paymentKey = searchParams.get("paymentKey");
    const orderId = searchParams.get("orderId");
    const amount = searchParams.get("amount");
    const reportId = searchParams.get("reportId");

    if (!paymentKey || !orderId || !amount || !reportId) {
      setMessage("결제 정보를 확인할 수 없어요.");
      setFailed(true);
      return;
    }

    fetch("/api/payment/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentKey, orderId, amount: Number(amount) }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          router.replace(`/report/${decodeURIComponent(reportId)}`);
        } else {
          setMessage("결제 검증에 실패했어요. 고객센터로 문의해주세요.");
          setFailed(true);
        }
      })
      .catch(() => {
        setMessage("오류가 발생했어요. 잠시 후 다시 시도해주세요.");
        setFailed(true);
      });
  }, [searchParams, router]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 px-5 text-center">
      {!failed ? (
        <>
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-brass" />
          <p className="font-serif text-lg">{message}</p>
        </>
      ) : (
        <>
          <p className="font-serif text-xl">{message}</p>
          <Link
            href="/"
            className="rounded-xl bg-ink px-6 py-3 text-sm font-semibold text-paper"
          >
            홈으로
          </Link>
        </>
      )}
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-brass" />
        </div>
      }
    >
      <SuccessBody />
    </Suspense>
  );
}
