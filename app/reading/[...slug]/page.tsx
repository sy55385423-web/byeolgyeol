import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { categories, findCategory } from "@/data/categories";
import Flow from "@/components/reading/Flow";

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = findCategory(slug);
  if (!category) return {};
  return {
    title: `${category.name} — 별:결 | 사주 자미두수 점성술`,
    description: `${category.short} ${category.questions.slice(0, 3).join(" · ")}`,
  };
}

export default async function ReadingPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const category = findCategory(slug);
  if (!category) notFound();
  return <Flow category={category} />;
}
