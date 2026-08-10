import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이용약관 — 별:결",
};

export default function TermsPage() {
  return (
    <div className="min-h-dvh bg-paper">
      <header className="border-b border-line bg-paper/90">
        <div className="mx-auto flex h-14 max-w-2xl items-center px-5">
          <Link href="/" className="font-serif text-lg font-semibold">
            별:결
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-5 py-12">
        <h1 className="font-serif text-2xl font-semibold">이용약관</h1>
        <p className="mt-2 text-sm text-ink-faint">최종 수정일: 2026년 8월 2일</p>

        <div className="mt-8 space-y-8 text-[15px] leading-[1.9] text-ink">
          <section>
            <h2 className="font-serif text-lg font-semibold">제1조 (목적)</h2>
            <p className="mt-3">
              이 약관은 별:결(bazistar, 이하 "서비스")이 제공하는 온라인 운세·사주 리포트 서비스의 이용 조건 및 절차, 이용자와 서비스 간의 권리·의무를 규정하는 것을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-semibold">제2조 (서비스 내용)</h2>
            <p className="mt-3">
              별:결은 사주명리학, 자미두수, 서양 점성술을 기반으로 AI가 생성하는 운세 리포트를 제공합니다. 리포트는 오락·참고 목적의 콘텐츠이며, 실제 사건·결과를 보장하지 않습니다.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-semibold">제3조 (결제)</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-ink-soft">
              <li>연애·궁합·재회 리포트: 8,900원</li>
              <li>커리어·재물·건강 리포트: 2,990원</li>
              <li>결제는 토스페이먼츠를 통해 처리됩니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-lg font-semibold">제4조 (환불 정책)</h2>
            <p className="mt-3">
              디지털 콘텐츠의 특성상, 리포트가 생성·제공된 이후에는 청약 철회 및 환불이 어렵습니다(전자상거래법 제17조 제2항 제5호). 단, 다음의 경우 환불을 요청할 수 있습니다:
            </p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-ink-soft">
              <li>결제 후 리포트가 생성되지 않은 경우</li>
              <li>서비스 오류로 인해 정상적인 리포트를 받지 못한 경우</li>
            </ul>
            <p className="mt-3">
              환불 요청: help@bazistar.com으로 주문 내역과 함께 문의해주세요.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-semibold">제5조 (리뷰 추가 질문권)</h2>
            <p className="mt-3">
              연애·궁합·재회 리포트 이용 후 5자 이상의 리뷰를 작성하면 추가 질문 1회가 활성화됩니다. 추가 질문은 리포트 하단에서 사용할 수 있으며, 이전 리뷰를 삭제·수정하는 경우 추가 질문권이 취소될 수 있습니다. 부적절하거나 허위 리뷰는 혜택 대상에서 제외됩니다.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-semibold">제6조 (면책)</h2>
            <p className="mt-3">
              별:결이 제공하는 리포트는 오락 및 참고 목적의 콘텐츠입니다. 리포트 내용을 근거로 한 중요한 결정(투자, 의료, 법률 등)에 대해 서비스는 책임을 지지 않습니다. 중요한 결정은 전문가와 상담하시기 바랍니다.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-semibold">제7조 (문의)</h2>
            <p className="mt-3 text-ink-soft">
              이메일: <span className="text-ink">help@bazistar.com</span>
            </p>
          </section>
        </div>

        <div className="mt-12 border-t border-line pt-6 text-center text-xs text-ink-faint">
          <Link href="/" className="hover:text-ink">홈으로 돌아가기</Link>
          {" · "}
          <Link href="/privacy" className="hover:text-ink">개인정보처리방침</Link>
        </div>
      </main>
    </div>
  );
}
