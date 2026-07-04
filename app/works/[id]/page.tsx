import Link from "next/link";
import { notFound } from "next/navigation";
import { WORKS, genreById, catOf } from "@/lib/data";
import { findWork } from "@/lib/user-works";
import { amazonLink, coverSrc } from "@/lib/affiliate";
import { readMeta } from "@/lib/meta-server";
import WorkPosts from "@/components/WorkPosts";
import Cover, { AmazonButton } from "@/components/Cover";

// 静的カタログはビルド時に生成、登録作品(uw-*)はリクエスト時に描画される
export function generateStaticParams() {
  return WORKS.map((w) => ({ id: w.id }));
}

export default async function WorkDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const work = await findWork(id);
  if (!work) notFound();

  const meta = await readMeta();
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
