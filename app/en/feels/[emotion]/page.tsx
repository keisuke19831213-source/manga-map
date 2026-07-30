import { notFound } from "next/navigation";
import { EMOTIONS, emotionOf } from "@/lib/emotions";
import FeelsDetailBody from "@/components/FeelsDetailBody";
import { emotionText } from "@/lib/content-en";

export function generateStaticParams() {
  return EMOTIONS.map((e) => ({ emotion: e.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ emotion: string }> }) {
  const { emotion } = await params;
  const e = emotionOf(emotion);
  if (!e) return {};
  const c = emotionText(e.id, "catch", e.catch, "en");
  return { title: `${c} — MANGA MAP`, description: emotionText(e.id, "night", e.night, "en") };
}

export default async function EnFeelsEmotionPage({ params }: { params: Promise<{ emotion: string }> }) {
  const { emotion } = await params;
  if (!emotionOf(emotion)) notFound();
  return <FeelsDetailBody id={emotion} lang="en" />;
}
