"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CATEGORIES, genreById, catOf, type CategoryId } from "@/lib/data";
import { coverThumb } from "@/lib/affiliate";
import { useMeta } from "@/lib/useMeta";
import { useVoicesByWork } from "@/lib/usePosts";
import { useWorks } from "@/lib/useWorks";
import { buildDoc, fold, scoreDoc, strip, SEARCH_ALIASES } from "@/lib/search";
import Cover from "@/components/Cover";
import MiniBubble from "@/components/MiniBubble";
import { lp, t, type Lang } from "@/lib/i18n";
import { catName, magazineName, workDesc, workTitle } from "@/lib/content-en";

type SortKey = "year" | "kana" | "voices";

export default function WorksExplorer({ lang = "ja" }: { lang?: Lang }) {
  const [cat, setCat] = useState<CategoryId | "all">("all");
  const [sort, setSort] = useState<SortKey>("year");
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get("q") ?? "");
  const meta = useMeta();
  const voices = useVoicesByWork();
  const { works: allWorks } = useWorks();

  // ヘッダー検索から /works?q=… で飛んできたときに反映(図鑑表示中の再検索も拾う)
  useEffect(() => {
    setQ(sp.get("q") ?? "");
  }, [sp]);

  const works = useMemo(() => {
    let list = cat === "all" ? allWorks : allWorks.filter((w) => w.genres.some((g) => genreById(g)?.cat === cat));
    const query = q.trim();
    if (query) {
      const qF = fold(query);
      const qS = strip(query);
      list = list.filter(
        (w) =>
          scoreDoc(
            // 英題も検索語に入れる（英語で来た人が Attack on Titan で引ける）
            buildDoc(w, w.title, w.author, [...(SEARCH_ALIASES[w.id] ?? []), workTitle(w, "en")]),
            qF,
            qS
          ) >= 0
      );
    }
    const sorted = [...list];
    if (sort === "kana")
      sorted.sort((a, b) =>
        lang === "en"
          ? workTitle(a, "en").localeCompare(workTitle(b, "en"), "en")
          : a.title.localeCompare(b.title, "ja")
      );
    else if (sort === "voices") sorted.sort((a, b) => (voices[b.id]?.count ?? 0) - (voices[a.id]?.count ?? 0) || a.year - b.year);
    else sorted.sort((a, b) => a.year - b.year);
    return sorted;
  }, [cat, sort, q, allWorks, voices]);

  return (
    <>
      <div className="works-search">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("lib.search", lang)}
          aria-label={t("lib.searchAria", lang)}
        />
        {q && (
          <button className="works-search-clear" aria-label={t("lib.clear", lang)} onClick={() => setQ("")}>
            ×
          </button>
        )}
        {q.trim() && (
          <span className="works-search-count">
            {lang === "en" ? `${works.length} found` : `${works.length}件`}
          </span>
        )}
      </div>
      <div className="filter-row">
        <button
          className={`chip ${cat === "all" ? "active" : ""}`}
          style={cat === "all" ? { background: "#e7ecf5", borderColor: "#e7ecf5" } : {}}
          onClick={() => setCat("all")}
        >
          {t("lib.all", lang)} ({allWorks.length})
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            className={`chip ${cat === c.id ? "active" : ""}`}
            style={cat === c.id ? { background: c.color, borderColor: c.color } : { borderColor: c.color + "88" }}
            onClick={() => setCat(c.id)}
          >
            {catName(c, lang)}
          </button>
        ))}
      </div>
      <div className="sort-row">
        <span className="sort-label">{t("lib.sort", lang)}</span>
        {(
          [
            ["year", t("lib.sort.year", lang)],
            ["kana", t("lib.sort.kana", lang)],
            ["voices", t("lib.sort.voices", lang)],
          ] as [SortKey, string][]
        ).map(([k, label]) => (
          <button key={k} className={`sort-opt ${sort === k ? "on" : ""}`} onClick={() => setSort(k)}>
            {label}
          </button>
        ))}
      </div>

      {works.length === 0 && (
        <div className="works-empty">
          <div style={{ fontSize: 34 }}>🔍</div>
          <p>
            {q.trim() ? (
              <>
                {lang === "en" ? `"${q.trim()}" ` : `「${q.trim()}」`}
                {t("lib.noneQ", lang)}
              </>
            ) : (
              <>{t("lib.none", lang)}</>
            )}
          </p>
        </div>
      )}
      <div className="works-grid">
        {works.map((w) => {
          const primary = genreById(w.genres[0]);
          const color = primary ? catOf(primary).color : "#94a3b8";
          return (
            // カード全体を <a> にすると中のジャンル名をリンクにできない（aの入れ子は不可）。
            // 本体だけをリンクにして、ジャンルのバッジは外に出しジャンルページへ繋ぐ。
            <div key={w.id} className="work-card" style={{ borderTopColor: color }}>
              <Link href={lp(lang, `/works/${w.id}`)} className="work-card-main">
                <div style={{ display: "flex", gap: 12 }}>
                  <Cover src={coverThumb(meta, w.id)} title={workTitle(w, lang)} width={58} />
                  <div style={{ minWidth: 0 }}>
                    <h3>{workTitle(w, lang)}</h3>
                    <div className="meta">
                      {w.author} · {w.year}
                      {lang === "ja" ? "年" : ""}
                      {w.magazine ? ` · ${magazineName(w.magazine, lang)}` : ""}
                    </div>
                  </div>
                </div>
                <p style={{ marginTop: 10 }}>{workDesc(w, lang)}</p>
              </Link>
              {voices[w.id]?.latest && <MiniBubble post={voices[w.id].latest!} />}
              <div className="badges" style={{ marginTop: 10 }}>
                {voices[w.id] && (
                  <span className="cbadge">💬 {lang === "en" ? `${voices[w.id].count} voices` : `読者の声 ${voices[w.id].count}`}</span>
                )}
                {w.genres.map((gid) => {
                  const g = genreById(gid);
                  if (!g) return null;
                  const c = catOf(g).color;
                  return (
                    <Link
                      key={gid}
                      href={lp(lang, `/g/${gid}`)}
                      className="badge badge-link"
                      style={{ borderColor: c + "99", color: c }}
                    >
                      {lang === "en" ? g.en : g.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
