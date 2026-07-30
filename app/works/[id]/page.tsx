import type { Metadata } from "next";
import WorkDetailBody from "@/components/WorkDetailBody";
import { findWork } from "@/lib/user-works";

// 作品ページはリクエスト時にSSR(force-dynamic)。全作品(200超)をビルド時に生成すると
// 各ページが書影メタ(Blob)を読むためビルドが不安定になる。
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const w = await findWork(id); // ユーザー登録作品(uw-…)も引く
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
