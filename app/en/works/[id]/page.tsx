import type { Metadata } from "next";
import WorkDetailBody from "@/components/WorkDetailBody";
import { findWork } from "@/lib/user-works";
import { workDesc, workTitle } from "@/lib/content-en";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  // カタログ作品だけでなくユーザー登録作品(uw-…)も引く。
  // 引けないと既定のサイトtitle（日本語）に落ちてしまう
  const w = await findWork(id);
  if (!w) return { title: "MANGA MAP — A Map of Manga History & Genres" };
  const title = `${workTitle(w, "en")} — MANGA MAP`;
  const d = workDesc(w, "en");
  const description = d.length > 120 ? d.slice(0, 119) + "…" : d;
  return {
    title,
    description,
    openGraph: { title, description, locale: "en_US" },
    twitter: { card: "summary_large_image" as const, title, description },
  };
}

export default async function EnWorkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <WorkDetailBody id={id} lang="en" />;
}
