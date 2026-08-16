"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconTabHome, IconTabReport, IconTabTogether } from "@/components/ui/icons";

const tabs = [
  { href: "/", label: "별:결", Icon: IconTabHome },
  { href: "/reports", label: "리포트", Icon: IconTabReport },
  { href: "/together", label: "우리끼리", Icon: IconTabTogether },
] as const;

export default function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-paper/95 backdrop-blur-sm"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-5xl">
        {tabs.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-1 flex-col items-center gap-1 py-2.5 transition-colors"
            >
              <Icon className={`h-5 w-5 ${active ? "text-brass" : "text-ink-faint"}`} />
              <span className={`text-[11px] ${active ? "font-semibold text-ink" : "text-ink-faint"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
