import type { Metadata } from "next";
import { headers } from "next/headers";
import { computePersona, decodePersona } from "@/lib/persona";
import PersonaPageClient from "@/components/persona/PersonaPageClient";

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
      title: "나의 별:결 — 사주 자미두수 점성술",
      description: "사주(오행)와 점성술(별자리)로 알아보는 나의 유형. 무료로 확인하고 친구와 궁합을 %로 비교해보세요.",
    };
  }

  const decoded = decodePersona(p);
  if (!decoded) return {};

  const result = computePersona({ y: decoded.y, m: decoded.m, d: decoded.d, hourBranch: decoded.h });
  const who = decoded.n ? `${decoded.n}님은` : "이 사람은";
  const title = `${who} "${result.type.name}" — 별:결`;
  const description = `${result.type.tagline}. 나도 무료로 유형을 확인하고 궁합을 %로 비교해보세요.`;
  const ogImage = `${origin}/api/og/persona?p=${encodeURIComponent(p)}`;

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

export default function PersonaPage() {
  return <PersonaPageClient />;
}
