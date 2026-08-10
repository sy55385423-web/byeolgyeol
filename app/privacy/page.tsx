import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침 — 별:결",
};

export default function PrivacyPage() {
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
        <h1 className="font-serif text-2xl font-semibold">개인정보처리방침</h1>
        <p className="mt-2 text-sm text-ink-faint">최종 수정일: 2026년 8월 2일</p>

        <div className="mt-8 space-y-8 text-[15px] leading-[1.9] text-ink">
          <section>
            <h2 className="font-serif text-lg font-semibold">1. 수집하는 개인정보 항목</h2>
            <p className="mt-3">
              별:결(bazistar)은 서비스 제공에 필요한 최소한의 정보만 수집합니다.
            </p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-ink-soft">
              <li>이름 또는 애칭 (선택 — 입력하지 않아도 됩니다)</li>
              <li>생년월일 (필수 — 사주 명식 계산에 사용)</li>
              <li>태어난 시간 (선택)</li>
              <li>성별 (선택)</li>
              <li>결제 정보 (토스페이먼츠를 통해 처리 — 당사 서버에 저장하지 않습니다)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-lg font-semibold">2. 개인정보 수집 목적</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-ink-soft">
              <li>사주 명식 계산 및 운세 리포트 생성</li>
              <li>결제 처리 및 환불</li>
              <li>서비스 품질 개선</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-lg font-semibold">3. 개인정보 보유 및 이용 기간</h2>
            <p className="mt-3">
              입력하신 생년월일 등 정보는 리포트 URL에 암호화되어 저장되며, 당사 서버 데이터베이스에는 별도로 저장되지 않습니다. 리포트 링크를 삭제하면 정보에 접근할 수 없게 됩니다.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-semibold">4. 개인정보 제3자 제공</h2>
            <p className="mt-3">
              별:결은 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 단, 결제 처리를 위해 토스페이먼츠(주)에 결제 관련 정보가 전달됩니다.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-semibold">5. AI 분석 처리</h2>
            <p className="mt-3">
              리포트 생성에는 Anthropic의 AI 모델이 사용됩니다. 분석에 사용된 정보는 Anthropic의 개인정보처리방침에 따라 처리됩니다.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-semibold">6. 이용자의 권리</h2>
            <p className="mt-3">
              이용자는 언제든지 개인정보 열람, 정정, 삭제를 요청할 수 있습니다. 요청사항은 아래 이메일로 문의해주세요.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-semibold">7. 문의</h2>
            <p className="mt-3 text-ink-soft">
              개인정보 관련 문의: <span className="text-ink">help@bazistar.com</span>
            </p>
          </section>
        </div>

        <div className="mt-12 border-t border-line pt-6 text-center text-xs text-ink-faint">
          <Link href="/" className="hover:text-ink">홈으로 돌아가기</Link>
          {" · "}
          <Link href="/terms" className="hover:text-ink">이용약관</Link>
        </div>
      </main>
    </div>
  );
}
