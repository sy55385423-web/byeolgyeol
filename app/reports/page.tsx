import type { Metadata } from "next";
import Link from "next/link";
import { categories, categoryHref } from "@/data/categories";
import { categoryIcons, IconArrow } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "리포트 — 별:결",
  description: "연애, 궁합, 재회, 커리어, 재물, 건강. 지금 가장 궁금한 것부터 선택하세요.",
};

const groups = ["연애·인간관계", "커리어", "재물", "건강"] as const;

export default function ReportsPage() {
  return (
    <main className="mx-auto max-w-5xl px-5 pb-16 pt-10 sm:pt-14">
      <p className="text-sm font-medium tracking-widest text-brass">REPORT</p>
      <h1 className="mt-3 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
        지금 궁금한 것 하나를 고르세요
      </h1>

      <div className="mt-8 space-y-8">
        {groups.map((group) => {
          const items = categories.filter((c) => c.group === group);
          if (items.length === 0) return null;
          return (
            <section key={group}>
              <h2 className="text-xs font-medium tracking-wide text-ink-faint">{group}</h2>
              <div className="mt-3 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white/70">
                {items.map((c) => {
                  const Icon = categoryIcons[c.id];
                  return (
                    <Link
                      key={c.id}
                      href={categoryHref(c)}
                      className="group flex items-center gap-4 p-4 transition-colors hover:bg-paper-warm/60 sm:p-5"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brass-faint text-brass">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-serif text-[15.5px] font-semibold">{c.name}</span>
                        <span className="mt-0.5 block truncate text-[13px] text-ink-soft">{c.short}</span>
                      </span>
                      <span className="flex shrink-0 items-center gap-2">
                        <span className="text-[13px] font-semibold text-brass">
                          {c.price.toLocaleString("ko-KR")}원
                        </span>
                        <IconArrow className="h-4 w-4 text-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:text-ink" />
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
