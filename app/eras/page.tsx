import Link from "next/link";
import { STORY_ERAS, workById } from "@/lib/data";
import { coverSrc } from "@/lib/affiliate";
import { readMeta } from "@/lib/meta-server";
import { readPosts } from "@/lib/posts";
import Cover from "@/components/Cover";

export const metadata = { title: "時代設定マップ — MANGA MAP" };

// 書影(Blob)の更新を反映するため定期的に再生成
export const revalidate = 60;

export default async function ErasPage() {
  const meta = await readMeta();
  const posts = await readPosts();
  const counts: Record<string, number> = {};
  for (const p of posts) {
    if (p.workId) counts[p.workId] = (counts[p.workId] ?? 0) + 1;
  }
  return (
    <div className="page">
      <div className="page-en">STORY ERA TIMELINE</div>
      <h1>時代設定マップ</h1>
      <p className="page-lead">
        「いつの時代の物語か」でマンガを並べた歴史時系列マップ。江戸から近未来、そして時間軸の外の異世界まで。
        発表年ではなく<strong>物語の中の時代</strong>で旅する年表です。
      </p>
      <div>
        {STORY_ERAS.map((era, i) => (
          <div key={era.id}>
            {i > 0 && <div className="era-connector" aria-hidden />}
            <section className="era-block">
              <span className="era-span">{era.span}</span>
              <h2>{era.label}</h2>
              <p className="era-desc">{era.desc}</p>
              <div className="era-works">
                {era.works.map(({ workId, note }) => {
                  const w = workById(workId);
                  if (!w) return null;
                  return (
                    <Link key={workId} href={`/works/${w.id}`} className="era-work" style={{ display: "flex", gap: 10 }}>
                      <Cover src={coverSrc(meta, w.id)} title={w.title} width={40} />
                      <span style={{ minWidth: 0 }}>
                        <span className="t">
                          {w.title} {counts[w.id] ? <span className="cbadge">💬 {counts[w.id]}</span> : null}
                        </span>
                        <span className="n">{note}</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          </div>
        ))}
      </div>
    </div>
  );
}
