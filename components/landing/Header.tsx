import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-serif text-lg font-semibold tracking-tight">별:결</span>
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-faint">
            bazistar
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm text-ink-soft">
          <a href="#readings" className="hidden transition-colors hover:text-ink sm:block">
            리딩
          </a>
          <a href="#why" className="hidden transition-colors hover:text-ink sm:block">
            분석 방식
          </a>
          <a href="#faq" className="hidden transition-colors hover:text-ink sm:block">
            자주 묻는 질문
          </a>
          <a
            href="#readings"
            className="rounded-full bg-ink px-4 py-1.5 text-sm font-medium text-paper transition-transform hover:scale-[1.03] active:scale-[0.98]"
          >
            리딩 시작
          </a>
        </nav>
      </div>
    </header>
  );
}
