"use client";

import Link from "next/link";
import { CATEGORIES, EDGES, GENRES, genreById, catOf } from "@/lib/data";
import { coverThumb, amazonLink } from "@/lib/affiliate";
import { useMeta } from "@/lib/useMeta";
import { useWorks } from "@/lib/useWorks";
import { AmazonButton } from "@/components/Cover";

const EDGE_LABEL: Record<string, string> = {
  evolution: "直系の進化",
  influence: "影響",
  counter: "対抗・反発",
};

// スマホ用: ジャンル系統図の縦スクロール版(カテゴリ別アコーディオン)
export default function GenreListMobile() {
  const meta = useMeta();
  const { works: allWorks } = useWorks();

  const jump = (id: string) => {
    const el = document.getElementById(`g-${id}`) as HTMLDetailsElement | null;
    if (el) {
      el.open = true;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="page" style={{ paddingTop: 20 }}>
      <div className="page-en">GENRE MAP</div>
      <h1>ジャンル系統図</h1>
      <p className="page-lead">
        マンガのジャンルがどう生まれ、影響し合ってきたかの系譜。ジャンルをタップすると解説・代表作・つながりが開きます。
        (PCでは一枚のズームマップで表示されます)
      </p>

      {CATEGORIES.map((c) => {
        const genres = GENRES.filter((g) => g.cat === c.id).sort((a, b) => a.year - b.year);
        if (genres.length === 0) return null;
        return (
          <section key={c.id} style={{ marginBottom: 26 }}>
            <div
              style={{
                display: "inline-block",
                background: c.color,
                color: "#fff",
                border: "2px solid var(--ink)",
                boxShadow: "2px 2px 0 var(--ink)",
                fontWeight: 900,
                fontSize: 14,
                padding: "3px 14px",
                marginBottom: 4,
              }}
            >
              {c.name}
            </div>
            <p style={{ fontSize: 11.5, color: "var(--ink-soft)", margin: "4px 0 10px" }}>{c.blurb}</p>

            {genres.map((g) => {
              const works = allWorks.filter((w) => w.genres.includes(g.id)).sort((a, b) => a.year - b.year);
              const inbound = EDGES.filter((e) => e.to === g.id);
              const outbound = EDGES.filter((e) => e.from === g.id);
              return (
                <details key={g.id} id={`g-${g.id}`} className="acc" style={{ borderLeftColor: c.color }}>
                  <summary>
                    <span className="acc-year">{g.year}</span>
                    <span className="acc-name">{g.name}</span>
                    <span className="acc-en">{g.en}</span>
                  </summary>
                  <div className="acc-body">
                    <p style={{ fontSize: 12.5, lineHeight: 1.9, margin: "6px 0 10px" }}>{g.desc}</p>

                    {works.length > 0 && (
                      <div className="acc-works">
                        {works.map((w) => (
                          <Link key={w.id} href={`/works/${w.id}`} className="acc-work">
                            {coverThumb(meta, w.id) ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={coverThumb(meta, w.id)!} alt={w.title} loading="lazy" />
                            ) : (
                              <span className="ph">📖</span>
                            )}
                            <span className="t">{w.title}</span>
                          </Link>
                        ))}
                      </div>
                    )}

                    {(inbound.length > 0 || outbound.length > 0) && (
                      <div style={{ marginTop: 10 }}>
                        {inbound.map((e, i) => {
                          const o = genreById(e.from);
                          if (!o) return null;
                          return (
                            <button key={`i${i}`} className="style-opt" style={{ margin: "0 6px 6px 0", borderColor: catOf(o).color }} onClick={() => jump(o.id)}>
                              ← {o.name} <small>({EDGE_LABEL[e.kind]})</small>
                            </button>
                          );
                        })}
                        {outbound.map((e, i) => {
                          const o = genreById(e.to);
                          if (!o) return null;
                          return (
                            <button key={`o${i}`} className="style-opt" style={{ margin: "0 6px 6px 0", borderColor: catOf(o).color }} onClick={() => jump(o.id)}>
                              → {o.name} <small>({EDGE_LABEL[e.kind]})</small>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {works[0] && amazonLink(meta, works[0].id) && (
                      <div style={{ marginTop: 8 }}>
                        <AmazonButton href={amazonLink(meta, works[0].id)} small />
                      </div>
                    )}
                  </div>
                </details>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}
