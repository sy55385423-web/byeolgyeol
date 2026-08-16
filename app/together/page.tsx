import type { Metadata } from "next";
import { IconTabTogether } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "우리끼리 — 별:결",
};

export default function TogetherPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-5xl flex-col items-center justify-center px-5 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brass-faint text-brass">
        <IconTabTogether className="h-6 w-6" />
      </span>
      <h1 className="mt-5 font-serif text-xl font-semibold tracking-tight">우리끼리</h1>
      <p className="mt-2 max-w-xs text-[14px] leading-relaxed text-ink-soft">
        곧 새로운 기능이 이곳에 채워집니다.
      </p>
    </main>
  );
}
