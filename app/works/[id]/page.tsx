import type { Metadata } from "next";
import WorkDetailBody from "@/components/WorkDetailBody";
import { WORKS } from "@/lib/data";

// 作品ページはリクエスト時にSSR(force-dynamic)。全作品(200超)をビルド時に生成すると
// 各ページが書影メタ(Blob)を読むためビルドが不安定になる。書影は動的に変わるので
// 都度生成が理にかなう。
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const w = WORKS.find((x) => x.id === id);
  if (!w) return {};
  const title = `${w.title} — MANGA MAP`;
  const description = w.desc.length > 120 ? w.desc.slice(0, 119) + "…" : w.desc;
  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { card: "summary_large_image" as const, title, description },
  };
}

export default async function WorkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <WorkDetailBody id={id} lang="ja" />;
}
