"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CATEGORIES, genreById, catOf, type CategoryId } from "@/lib/data";
import { coverThumb } from "@/lib/affiliate";
import { useMeta } from "@/lib/useMeta";
import { useVoicesByWork } from "@/lib/usePosts";
import { useWorks } from "@/lib/useWorks";
import Cover from "@/components/Cover";
import MiniBubble from "@/components/MiniBubble";

type SortKey = "year" | "kana" | "voices";

export default function WorksExplorer() {
  const [cat, setCat] = useState<CategoryId | "all">("all");
  const [sort, setSort] = useState<SortKey>("year");
  const meta = useMeta();
  const voices = useVoicesByWork();
  const { works: allWorks } = useWorks();

  const works = useMemo(() => {
    const list = cat === "all" ? allWorks : allWorks.filter((w) => w.genres.some((g) => genreById(g)?.cat === cat));
    const sorted = [...list];
    if (sort === "kana") sorted.sort((a, b) => a.title.localeCompare(b.title, "ja"));
    else if (sort === "voices") sorted.sort((a, b) => (voices[b.id]?.count ?? 0) - (voices[a.id]?.count ?? 0) || a.year - b.year);
    else sorted.sort((a, b) => a.year - b.year);
    return sorted;
  }, [cat, sort, allWorks, voices]);

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
      <div className="sort-row">
        <span className="sort-label">並び順</span>
        {(
          [
            ["year", "発表年"],
            ["kana", "五十音"],
            ["voices", "語りの多い順"],
          ] as [SortKey, string][]
        ).map(([k, label]) => (
          <button key={k} className={`sort-opt ${sort === k ? "on" : ""}`} onClick={() => setSort(k)}>
            {label}
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
                <Cover src={coverThumb(meta, w.id)} title={w.title} width={58} />
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
