"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

function FailBody() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const message = searchParams.get("message") ?? "결제가 취소됐어요.";

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 px-5 text-center">
      <p className="font-serif text-xl">{message}</p>
      <p className="text-sm text-ink-faint">다시 시도하거나 다른 결제 수단을 이용해주세요.</p>
      <button
        onClick={() => router.back()}
        className="rounded-xl bg-ink px-6 py-3 text-sm font-semibold text-paper"
      >
        돌아가기
      </button>
    </div>
  );
}

export default function PaymentFailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center">
          <p className="text-ink-faint">잠시만요…</p>
        </div>
      }
    >
      <FailBody />
    </Suspense>
  );
}
