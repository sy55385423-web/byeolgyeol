import type { Metadata, Viewport } from "next";
import "./globals.css";
import AppChrome from "@/components/nav/AppChrome";

export const metadata: Metadata = {
  title: "별:결 (bazistar) — 태어난 날에 새겨진 결을 읽다 | 사주 자미두수 점성술",
  description:
    "자미두수·사주명리·서양점성술을 교차해 연애, 궁합, 재회, 커리어, 재물, 건강의 흐름을 읽습니다. 생년월일 하나로 1분 안에 나의 결을 확인하세요.",
  applicationName: "bazistar",
  keywords: ["별:결", "bazistar", "사주", "자미두수", "점성술", "궁합", "재회운", "연애운", "재물운"],
  openGraph: {
    title: "별:결 (bazistar) — 태어난 날에 새겨진 결을 읽다",
    description: "자미두수·사주명리·점성술 교차 분석. 생년월일 하나로 1분 안에.",
    siteName: "bazistar",
    type: "website",
    locale: "ko_KR",
  },
};

export const viewport: Viewport = {
  themeColor: "#faf9f5",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body>
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
