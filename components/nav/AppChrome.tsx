"use client";

import { usePathname } from "next/navigation";
import BottomTabBar from "@/components/nav/BottomTabBar";

const TAB_ROUTES = ["/", "/reports", "/together"];

export default function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showTabBar = TAB_ROUTES.includes(pathname);

  return (
    <>
      <div style={showTabBar ? { paddingBottom: "56px" } : undefined}>{children}</div>
      {showTabBar && <BottomTabBar />}
    </>
  );
}
