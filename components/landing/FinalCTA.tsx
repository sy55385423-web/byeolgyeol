import Link from "next/link";
import Reveal from "@/components/ui/Reveal";

export default function FinalCTA() {
  return (
    <>
      <section className="bg-night text-paper">
        <div className="mx-auto max-w-3xl px-5 py-24 text-center sm:py-32">
          <Reveal>
            <h2 className="font-serif text-3xl font-semibold leading-snug tracking-tight sm:text-5xl sm:leading-snug">
              한 가지 항목은
              <br />
              무료로 보여드릴게요
            </h2>
            <p className="mt-6 text-[15px] text-paper/50">
              타고난 인기가 상위 몇 %인지, 결제 없이 공개됩니다.
              <br />
              생년월일만 있으면 1분이면 충분해요.
            </p>
            <Link
              href="/reading/love/life"
              className="mt-10 inline-block rounded-xl bg-brass px-9 py-4 text-[15px] font-semibold text-night transition-transform hover:scale-[1.03] active:scale-[0.98]"
            >
              무료로 내 결과 확인하기
            </Link>
          </Reveal>
        </div>
      </section>
      <footer className="bg-night pb-10 text-paper/50">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 border-t border-night-line px-5 pt-8 text-xs sm:flex-row sm:justify-between">
          <span className="flex items-baseline gap-2">
            <span className="font-serif text-sm text-paper/50">별:결</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-paper/50">bazistar</span>
          </span>
          <span className="flex flex-wrap items-center gap-x-1 gap-y-1">
            <span className="mr-2">리딩 결과는 참고용이며, 중요한 결정은 스스로의 판단을 따르세요.</span>
            {/* 손가락으로 누르는 자리는 44px를 확보한다. 글자만 작게 두면
                옆 링크를 잘못 누르기 쉽다. */}
            <Link
              href="/privacy"
              className="inline-flex min-h-11 items-center px-2 underline-offset-2 hover:underline"
            >
              개인정보처리방침
            </Link>
            <Link
              href="/terms"
              className="inline-flex min-h-11 items-center px-2 underline-offset-2 hover:underline"
            >
              이용약관
            </Link>
          </span>
        </div>
      </footer>
    </>
  );
}
