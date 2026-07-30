import { notFound } from "next/navigation";
import { EMOTIONS, emotionOf } from "@/lib/emotions";
import FeelsDetailBody from "@/components/FeelsDetailBody";

export function generateStaticParams() {
  return EMOTIONS.map((e) => ({ emotion: e.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ emotion: string }> }) {
  const { emotion } = await params;
  const e = emotionOf(emotion);
  if (!e) return {};
  return {
    title: `${e.catch} — MANGA MAP`,
    description: `${e.night}。読者が実際に「${e.label}」コマだけを、巻・ページ付きで。`,
  };
}

export default async function FeelsEmotionPage({ params }: { params: Promise<{ emotion: string }> }) {
  const { emotion } = await params;
  if (!emotionOf(emotion)) notFound();
  return <FeelsDetailBody id={emotion} lang="ja" />;
}
