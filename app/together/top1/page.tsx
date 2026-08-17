import type { Metadata } from "next";
import { headers } from "next/headers";
import { computeTop1 } from "@/lib/top1";
import { decodePersona } from "@/lib/persona";
import Top1PageClient from "@/components/top1/Top1PageClient";

async function originOf() {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ p?: string }>;
}): Promise<Metadata> {
  const { p } = await searchParams;
  const origin = await originOf();

  if (!p) {
    return {
      title: "우리중 TOP1 — 별:결",
      description: "우리중 결혼 가장 먼저 하는 사람은? 생년월일로 무료로 확인하고 친구들과 순위를 비교해보세요.",
    };
  }

  const decoded = decodePersona(p);
  if (!decoded) return {};

  const result = computeTop1({ y: decoded.y, m: decoded.m, d: decoded.d, hourBranch: decoded.h });
  const who = decoded.n ? `${decoded.n}님의` : "이 사람의";
  const title = `${who} 예상 결혼 나이는 ${result.marriageAge}세 — 별:결`;
  const description = `우리중 결혼 가장 먼저 하는 사람은? 나도 무료로 확인하고 순위를 비교해보세요.`;
  const ogImage = `${origin}/api/og/top1?p=${encodeURIComponent(p)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default function Top1Page() {
  return <Top1PageClient />;
}
