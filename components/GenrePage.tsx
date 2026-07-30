"use client";

// ============ ジャンルページ（/g/<id>）============
// マップ＝泳ぐ入口、このページ＝腰を据えて読む部屋。音楽マップ GenrePage の
// 実証済み7ブロック（見出し/解説/つながり/代表作/帯を歩く/地図で見る/この記事について）を
// マンガ版に移植した。材料は lib/data.ts に既にあるものを並べ直している。

import Link from "next/link";
import {
  CATEGORIES,
  EDGES,
  GENRES,
  catOf,
  genreById,
  worksOfGenre,
  type EdgeKind,
  type GenreNode,
} from "@/lib/data";
import { amazonLink, coverThumb } from "@/lib/affiliate";
import { useMeta } from "@/lib/useMeta";
import { useVoicesByWork } from "@/lib/usePosts";
import { t, lp, type Lang } from "@/lib/i18n";
import { catBlurb, catName, genreDesc, genreName, hasEnGenre, workTitle } from "@/lib/content-en";

const EDGE_KEY: Record<EdgeKind, string> = {
  evolution: "edge.evolution",
  influence: "edge.influence",
  counter: "edge.counter",
};

const EDGE_MARK: Record<EdgeKind, string> = {
  evolution: "━━",
  influence: "╌╌",
  counter: "┄┄",
};

export default function GenrePage({ id, lang = "ja" }: { id: string; lang?: Lang }) {
  const meta = useMeta();
  const voices = useVoicesByWork();
  const g = genreById(id);

  if (!g) {
    return (
      <div className="page">
        <h1>{t("genre.notFound", lang)}</h1>
        <p>
          <Link href={lp(lang, "/")} className="glink">
            {t("genre.backToMap", lang)}
          </Link>
        </p>
      </div>
    );
  }

  const cat = catOf(g);
  const works = worksOfGenre(g.id);
  const upstream = EDGES.filter((e) => e.to === g.id);
  const downstream = EDGES.filter((e) => e.from === g.id);
  // 同じ帯を年の順に（＝帯を歩く）
  const band = GENRES.filter((x) => x.cat === g.cat).sort((a, b) => a.year - b.year);
  const bandIdx = band.findIndex((x) => x.id === g.id);

  const chip = (other: GenreNode, kind: EdgeKind) => (
    <Link key={`${other.id}-${kind}`} href={lp(lang, `/g/${other.id}`)} className="gchip" style={{ borderColor: catOf(other).color }}>
      <span className="gchip-mark" style={{ color: catOf(other).color }}>
        {EDGE_MARK[kind]}
      </span>
      {genreName(other, lang)}
      <span className="gchip-kind">{t(EDGE_KEY[kind], lang)}</span>
    </Link>
  );

  return (
    <div className="page genre-page">
      {/* ---- 1. 見出し ---- */}
      <div className="gp-head" style={{ borderTopColor: cat.color }}>
        <Link href={lp(lang, "/")} className="gp-back">
          {t("genre.backToMap", lang)}
        </Link>
        <div className="gp-cat" style={{ color: cat.color }}>
          {catName(cat, lang)}
        </div>
        <h1>{genreName(g, lang)}</h1>
        <div className="gp-en">{lang === "en" ? g.name : g.en}</div>
        <div className="gp-meta">
          <span>
            {t("genre.year", lang)}：<b>{g.year}</b>
            {lang === "ja" ? "年ごろ" : ""}
          </span>
          <span>
            {t("genre.band", lang)}：<b style={{ color: cat.color }}>{catName(cat, lang)}</b>
          </span>
          {works.length > 0 && (
            <span>
              {t("genre.works", lang)}：<b>{works.length}</b>
            </span>
          )}
        </div>
        <Link href={lp(lang, `/?g=${g.id}`)} className="gp-onmap">
          🗺 {t("genre.showOnMap", lang)} →
        </Link>
      </div>

      {/* ---- 2. 解説 ---- */}
      <section className="gp-sec">
        <h2>{t("genre.desc", lang)}</h2>
        {lang === "en" && !hasEnGenre(g) && <p className="gp-untranslated">{t("genre.untranslated", lang)}</p>}
        <p className="gp-desc">{genreDesc(g, lang)}</p>
        <p className="gp-blurb" style={{ borderLeftColor: cat.color }}>
          {catName(cat, lang)}
          {lang === "ja" ? "の帯について：" : " — about this band: "}
          {catBlurb(cat, lang)}
        </p>
      </section>

      {/* ---- 3. つながり ---- */}
      {(upstream.length > 0 || downstream.length > 0) && (
        <section className="gp-sec">
          <h2>{t("genre.rel", lang)}</h2>
          <p className="gp-note">{t("genre.relNote", lang)}</p>
          {upstream.length > 0 && (
            <>
              <h3>↓ {t("genre.upstream", lang)}</h3>
              <div className="gp-chips">
                {upstream.map((e) => {
                  const other = genreById(e.from);
                  return other ? chip(other, e.kind) : null;
                })}
              </div>
            </>
          )}
          {downstream.length > 0 && (
            <>
              <h3>↑ {t("genre.downstream", lang)}</h3>
              <div className="gp-chips">
                {downstream.map((e) => {
                  const other = genreById(e.to);
                  return other ? chip(other, e.kind) : null;
                })}
              </div>
            </>
          )}
        </section>
      )}

      {/* ---- 4. 代表作 ---- */}
      <section className="gp-sec">
        <h2>{t("genre.works", lang)}</h2>
        {works.length === 0 ? (
          <p className="gp-note">{t("genre.worksNone", lang)}</p>
        ) : (
          <div className="gp-works">
            {works.map((w) => {
              const cover = coverThumb(meta, w.id);
              const az = amazonLink(meta, w.id);
              return (
                <div key={w.id} className="gw">
                  <Link href={lp(lang, `/works/${w.id}`)} className="gw-cover">
                    {cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cover} alt={workTitle(w, lang)} loading="lazy" />
                    ) : (
                      <span className="ph">📖</span>
                    )}
                  </Link>
                  <div className="gw-body">
                    <Link href={lp(lang, `/works/${w.id}`)} className="gw-title">
                      {workTitle(w, lang)}
                      <span className="y"> ({w.year})</span>
                    </Link>
                    <div className="gw-au">
                      {w.author}
                      {w.magazine ? ` / ${w.magazine}` : ""}
                    </div>
                    <p>{w.desc}</p>
                    <div className="gw-foot">
                      {voices[w.id] && (
                        <span className="cbadge">
                          💬 {voices[w.id].count}
                        </span>
                      )}
                      {az && (
                        <a href={az} target="_blank" rel="noopener noreferrer nofollow sponsored" className="gw-az">
                          {t("work.buy", lang)}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ---- 5. 帯を歩く ---- */}
      {band.length > 1 && (
        <section className="gp-sec">
          <h2>
            {catName(cat, lang)}
            {lang === "ja" ? "の帯を歩く" : " — walk the band"}
          </h2>
          <p className="gp-note">{t("genre.walkNote", lang)}</p>
          <ol className="gp-walk">
            {band.map((x, i) => (
              <li key={x.id} className={x.id === g.id ? "here" : ""}>
                {x.id === g.id ? (
                  <span style={{ background: cat.color }}>
                    {x.year} {genreName(x, lang)}
                    <b>（{t("genre.here", lang)}）</b>
                  </span>
                ) : (
                  <Link href={lp(lang, `/g/${x.id}`)}>
                    {x.year} {genreName(x, lang)}
                  </Link>
                )}
                {i < band.length - 1 && <i className="arrow">↓</i>}
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* ---- 6. 地図で見る / ほかの帯へ ---- */}
      <section className="gp-sec">
        <h2>{t("genre.all", lang)}</h2>
        <div className="gp-chips">
          {CATEGORIES.map((c) => (
            <Link
              key={c.id}
              href={lp(lang, `/?g=${GENRES.find((x) => x.cat === c.id)?.id ?? ""}`)}
              className="gchip"
              style={{ borderColor: c.color, background: c.id === cat.id ? `${c.color}18` : "#fff" }}
            >
              {catName(c, lang)}
            </Link>
          ))}
        </div>
      </section>

      {/* ---- 7. この記事について ---- */}
      <section className="gp-sec gp-about">
        <h2>{t("genre.sources", lang)}</h2>
        <p className="gp-note">
          {lang === "en"
            ? "Genre boundaries are drawn where the network of manga happens to concentrate, not by decree. Years are approximate. Where opinions differ, this page says so rather than picking a winner."
            : "ジャンルの線引きは断定ではなく「マンガのネットワークの中で濃くなっているところ」を示したものです。年は目安で、諸説あるものは諸説あると書きます。"}
        </p>
      </section>
    </div>
  );
}
