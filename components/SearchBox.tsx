"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useWorks } from "@/lib/useWorks";

// ヘッダーの作品検索(タイトル・作者名でインクリメンタルサーチ)
export default function SearchBox() {
  const { works } = useWorks();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(0);
  const router = useRouter();
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hits = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return works
      .filter((w) => w.title.toLowerCase().includes(s) || w.author.toLowerCase().includes(s))
      .slice(0, 8);
  }, [q, works]);

  const go = (id: string) => {
    setQ("");
    setOpen(false);
    router.push(`/works/${id}`);
  };

  return (
    <div className="searchbox">
      <input
        value={q}
        placeholder="🔍 作品・作者をさがす"
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
          setCursor(0);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          blurTimer.current = setTimeout(() => setOpen(false), 150);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setCursor((c) => Math.min(c + 1, hits.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setCursor((c) => Math.max(c - 1, 0));
          } else if (e.key === "Enter" && hits[cursor]) {
            go(hits[cursor].id);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        aria-label="作品検索"
      />
      {open && hits.length > 0 && (
        <div className="searchbox-drop">
          {hits.map((w, i) => (
            <button
              key={w.id}
              className={`searchbox-item ${i === cursor ? "on" : ""}`}
              onMouseDown={(e) => {
                e.preventDefault();
                if (blurTimer.current) clearTimeout(blurTimer.current);
                go(w.id);
              }}
              onMouseEnter={() => setCursor(i)}
            >
              <span className="t">{w.title}</span>
              <span className="a">
                {w.author} · {w.year}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
