"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CATEGORIES, genreById, catOf, type CategoryId } from "@/lib/data";
import { coverSrc } from "@/lib/affiliate";
import { useMeta } from "@/lib/useMeta";
import { useVoicesByWork } from "@/lib/usePosts";
import { useWorks } from "@/lib/useWorks";
import Cover from "@/components/Cover";
import MiniBubble from "@/components/MiniBubble";

export default function WorksExplorer() {
  const [cat, setCat] = useState<CategoryId | "all">("all");
  const meta = useMeta();
  const voices = useVoicesByWork();
  const { works: allWorks } = useWorks();

  const works = useMemo(() => {
    const list = cat === "all" ? allWorks : allWorks.filter((w) => w.genres.some((g) => genreById(g)?.cat === cat));
    return [...list].sort((a, b) => a.year - b.year);
  }, [cat, allWorks]);

  return (
    <>
      <div className="filter-row">
        <button
          className={`chip ${cat === "all" ? "active" : ""}`}
          style={cat === "all" ? { background: "#e7ecf5", borderColor: "#e7ecf5" } : {}}
          onClick={() => setCat("all")}
        >
          すべて ({allWorks.length})
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            className={`chip ${cat === c.id ? "active" : ""}`}
            style={cat === c.id ? { background: c.color, borderColor: c.color } : { borderColor: c.color + "88" }}
            onClick={() => setCat(c.id)}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="works-grid">
        {works.map((w) => {
          const primary = genreById(w.genres[0]);
          const color = primary ? catOf(primary).color : "#94a3b8";
          return (
            <Link key={w.id} href={`/works/${w.id}`} className="work-card" style={{ borderTopColor: color }}>
              <div style={{ display: "flex", gap: 12 }}>
                <Cover src={coverSrc(meta, w.id)} title={w.title} width={58} />
                <div style={{ minWidth: 0 }}>
                  <h3>{w.title}</h3>
                  <div className="meta">
                    {w.author} · {w.year}年{w.magazine ? ` · ${w.magazine}` : ""}
                  </div>
                </div>
              </div>
              <p style={{ marginTop: 10 }}>{w.desc}</p>
              {voices[w.id]?.latest && <MiniBubble post={voices[w.id].latest!} />}
              <div className="badges" style={{ marginTop: 10 }}>
                {voices[w.id] && (
                  <span className="cbadge">💬 読者の声 {voices[w.id].count}</span>
                )}
                {w.genres.map((gid) => {
                  const g = genreById(gid);
                  if (!g) return null;
                  const c = catOf(g).color;
                  return (
                    <span key={gid} className="badge" style={{ borderColor: c + "99", color: c }}>
                      {g.name}
                    </span>
                  );
                })}
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
