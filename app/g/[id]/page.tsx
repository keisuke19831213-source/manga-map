import type { Metadata } from "next";
import GenrePage from "@/components/GenrePage";
import { GENRES, genreById } from "@/lib/data";

// 静的に全ジャンル分を出す（45ページ。共有・検索・OGの入口になる発射台）
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
  if (!g) return { title: "ジャンル — MANGA MAP" };
  const title = `${g.name}（${g.en}） — MANGA MAP`;
  const description = g.desc.slice(0, 110);
  return {
    title,
    description,
    openGraph: { title, description, siteName: "MANGA MAP", type: "article", locale: "ja_JP" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <GenrePage id={id} lang="ja" />;
}
