import { notFound } from "next/navigation";
import Link from "next/link";
import { EMOTIONS, emotionOf } from "@/lib/emotions";
import { FeelsDetail } from "@/components/FeelsPage";

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
  const e = emotionOf(emotion);
  if (!e) notFound();

  return (
    <div className="page feels-page" style={{ ["--emo" as string]: e.color }}>
      <div style={{ marginBottom: 14, fontSize: 13 }}>
        <Link href="/feels" style={{ color: "var(--ink-soft)" }}>
          ← 気分をえらびなおす
        </Link>
      </div>
      <div className="page-en">EMOTION PHARMACY</div>
      <h1>
        <span className="feels-h1-emoji">{e.emoji}</span> {e.catch}
      </h1>
      <p className="page-lead">
        {e.night}。ここに並ぶのは、読者が実際に「{e.label}」と記録したコマだけ —
        <strong>巻とページまで</strong>効き目の場所つきです。
      </p>
      <FeelsDetail emotionId={e.id} />
    </div>
  );
}
