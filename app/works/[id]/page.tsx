import Link from "next/link";
import { notFound } from "next/navigation";
import { WORKS, genreById, catOf } from "@/lib/data";
import { findWork } from "@/lib/user-works";
import { amazonLink, coverSrc } from "@/lib/affiliate";
import { readWorkMeta } from "@/lib/meta-server";
import WorkPosts from "@/components/WorkPosts";
import Cover, { AmazonButton } from "@/components/Cover";

// 作品ページはリクエスト時にSSR(force-dynamic)。全作品(200超)をビルド時に生成すると
// 各ページが書影メタ(Blob)を読むためビルドが不安定になる。書影は動的に変わるので
// 都度生成が理にかなう。読みは readWorkMeta で1作品分だけ(+15s キャッシュ)なので軽い。
export const dynamic = "force-dynamic";

// シェア時のタイトル・説明文(静的カタログのみ。登録作品はサイト共通のまま)
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
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


export default async function WorkDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const work = await findWork(id);
  if (!work) notFound();

  const meta = await readWorkMeta(work.id); // この作品1件分だけ(全200作品を読まない)
  const cover = coverSrc(meta, work.id);
  const az = amazonLink(meta, work.id);

  return (
    <div className="page">
      <div style={{ marginBottom: 14, fontSize: 13 }}>
        <Link href="/works" style={{ color: "var(--ink-soft)" }}>
          ← 作品図鑑にもどる
        </Link>
      </div>

      <div className="work-hero" style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
        <Cover src={cover} title={work.title} width={130} />
        <div style={{ flex: "1 1 300px" }}>
          <h1>{work.title}</h1>
          <div className="meta">
            {work.author} · {work.year}年{work.magazine ? ` · 掲載: ${work.magazine}` : ""}
          </div>
          <p>{work.desc}</p>
          <div className="badges" style={{ marginBottom: az ? 14 : 0 }}>
            {work.genres.map((gid) => {
              const g = genreById(gid);
              if (!g) return null;
              const c = catOf(g).color;
              return (
                <Link key={gid} href="/" className="badge" style={{ borderColor: c, color: c }}>
                  {g.name} をマップで見る
                </Link>
              );
            })}
          </div>
          {az && <AmazonButton href={az} />}
        </div>
      </div>

      <WorkPosts workId={work.id} workTitle={work.title} />
    </div>
  );
}
