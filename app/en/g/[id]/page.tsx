import type { Metadata } from "next";
import GenrePage from "@/components/GenrePage";
import { GENRES, genreById } from "@/lib/data";

export function generateStaticParams() {
  return GENRES.map((g) => ({ id: g.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const g = genreById(id);
  if (!g) return { title: "Genre — MANGA MAP" };
  const title = `${g.en} (${g.name}) — MANGA MAP`;
  return {
    title,
    openGraph: { title, siteName: "MANGA MAP", type: "article", locale: "en_US" },
    twitter: { card: "summary_large_image", title },
  };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <GenrePage id={id} lang="en" />;
}
