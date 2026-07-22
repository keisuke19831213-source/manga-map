"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useWorks } from "@/lib/useWorks";
import { useMeta } from "@/lib/useMeta";
import { coverThumb } from "@/lib/affiliate";
import { buildDoc, fold, scoreDoc, strip, SEARCH_ALIASES, type SearchDoc } from "@/lib/search";
import type { Work } from "@/lib/data";

// ヘッダーの作品検索。
// ・かな/カナ・全角/半角・記号ゆれを吸収(「じょじょ」「はがれん」「らきすた」でもヒット)
// ・書影サムネイル付きの結果、マッチ箇所ハイライト
// ・空欄フォーカスで「今日のおすすめ」(日替わり)
// ・0件時の案内、末尾に「作品図鑑でさがす」
// ・「/」or ⌘K でどこからでもフォーカス
type Row = { kind: "work"; w: Work } | { kind: "all" };

export default function SearchBox() {
  const { works } = useWorks();
  const meta = useMeta();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const docs = useMemo<SearchDoc<Work>[]>(
    () => works.map((w) => buildDoc(w, w.title, w.author, SEARCH_ALIASES[w.id])),
    [works],
  );

  const query = q.trim();
  const qF = useMemo(() => fold(query), [query]);
  const qS = useMemo(() => strip(query), [query]);

  const hits = useMemo(() => {
    if (!qF) return [];
    return docs
      .map((d) => ({ d, s: scoreDoc(d, qF, qS) }))
      .filter((x) => x.s >= 0)
      .sort((a, b) => a.s - b.s || a.d.item.year - b.d.item.year)
      .slice(0, 8);
  }, [docs, qF, qS]);

  // 日替わりおすすめ(空欄フォーカス時)。日付シードで1日固定シャッフル。
  const featured = useMemo(() => {
    const day = new Date();
    let seed = (day.getFullYear() * 372 + day.getMonth() * 31 + day.getDate()) >>> 0;
    const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0), seed / 2 ** 32);
    const arr = [...works];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, 6);
  }, [works]);

  const rows = useMemo<Row[]>(() => {
    if (!query) return featured.map((w) => ({ kind: "work" as const, w }));
    const r: Row[] = hits.map((x) => ({ kind: "work" as const, w: x.d.item }));
    if (hits.length > 0) r.push({ kind: "all" });
    return r;
  }, [query, hits, featured]);

  const close = () => {
    setOpen(false);
    setCursor(0);
  };

  const act = (row: Row | undefined) => {
    if (!row) return;
    if (blurTimer.current) clearTimeout(blurTimer.current);
    if (row.kind === "work") router.push(`/works/${row.w.id}`);
    else router.push(`/works?q=${encodeURIComponent(query)}`);
    setQ("");
    close();
    inputRef.current?.blur();
  };

  // 「/」・⌘K でフォーカス(入力中は無視)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if ((e.key === "/" && !typing) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")) {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // マッチ箇所ハイライト(foldは1文字→1文字なので元文字列のindexがそのまま使える)
  const renderTitle = (w: Work) => {
    if (!qF) return w.title;
    const idx = fold(w.title).indexOf(qF);
    if (idx < 0) return w.title;
    return (
      <>
        {w.title.slice(0, idx)}
        <mark>{w.title.slice(idx, idx + qF.length)}</mark>
        {w.title.slice(idx + qF.length)}
      </>
    );
  };

  const showDrop = open && rows.length > 0;
  const showEmpty = open && !!query && hits.length === 0;

  return (
    <div className="searchbox">
      <input
        ref={inputRef}
        value={q}
        placeholder="🔍 作品・作者をさがす"
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
          setCursor(0);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          blurTimer.current = setTimeout(close, 150);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setCursor((c) => Math.min(c + 1, rows.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setCursor((c) => Math.max(c - 1, 0));
          } else if (e.key === "Enter") {
            act(rows[cursor]);
          } else if (e.key === "Escape") {
            close();
            inputRef.current?.blur();
          }
        }}
        aria-label="作品検索"
      />
      {q && (
        <button
          className="searchbox-clear"
          aria-label="検索をクリア"
          onMouseDown={(e) => {
            e.preventDefault();
            setQ("");
            setCursor(0);
            inputRef.current?.focus();
          }}
        >
          ×
        </button>
      )}
      {(showDrop || showEmpty) && (
        <div className="searchbox-drop">
          {!query && <div className="searchbox-sec">📚 今日のおすすめ</div>}
          {rows.map((row, i) =>
            row.kind === "work" ? (
              <button
                key={row.w.id}
                className={`searchbox-item ${i === cursor ? "on" : ""}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  act(row);
                }}
                onMouseEnter={() => setCursor(i)}
              >
                {coverThumb(meta, row.w.id) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="th" src={coverThumb(meta, row.w.id)!} alt="" loading="lazy" />
                ) : (
                  <span className="th ph">📕</span>
                )}
                <span className="tx">
                  <span className="t">{renderTitle(row.w)}</span>
                  <span className="a">
                    {row.w.author} · {row.w.year}年
                  </span>
                </span>
              </button>
            ) : (
              <button
                key="all"
                className={`searchbox-item all ${i === cursor ? "on" : ""}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  act(row);
                }}
                onMouseEnter={() => setCursor(i)}
              >
                「{query}」を作品図鑑でさがす →
              </button>
            ),
          )}
          {showEmpty && (
            <div className="searchbox-none">
              <div className="ne">「{query}」に合う作品が見つかりません</div>
              <div className="nh">かな・略称でも検索できます(例: はがれん、こち亀)</div>
              <button
                className="searchbox-item all"
                onMouseDown={(e) => {
                  e.preventDefault();
                  if (blurTimer.current) clearTimeout(blurTimer.current);
                  router.push("/works");
                  setQ("");
                  close();
                }}
              >
                作品図鑑をながめる →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
