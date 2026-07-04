import Link from "next/link";
import { notFound } from "next/navigation";
import { WORKS, workById, genreById, catOf } from "@/lib/data";
import WorkPosts from "@/components/WorkPosts";

export function generateStaticParams() {
  return WORKS.map((w) => ({ id: w.id }));
}

export default async function WorkDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const work = workById(id);
  if (!work) notFound();

  return (
    <div className="page">
      <div style={{ marginBottom: 14, fontSize: 13 }}>
        <Link href="/works" style={{ color: "var(--text-dim)" }}>
          ← 作品図鑑にもどる
        </Link>
      </div>

      <div className="work-hero">
        <h1>{work.title}</h1>
        <div className="meta">
          {work.author} · {work.year}年{work.magazine ? ` · 掲載: ${work.magazine}` : ""}
        </div>
        <p>{work.desc}</p>
        <div className="badges">
          {work.genres.map((gid) => {
            const g = genreById(gid);
            if (!g) return null;
            const c = catOf(g).color;
            return (
              <Link key={gid} href="/" className="badge" style={{ borderColor: c + "99", color: c }}>
                {g.name} をマップで見る
              </Link>
            );
          })}
        </div>
      </div>

      <WorkPosts workId={work.id} workTitle={work.title} />
    </div>
  );
}
