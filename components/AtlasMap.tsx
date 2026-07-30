"use client";

// ============ 舞台マップ（全画面キャンバス版・2026-07-30 大工事） ============
// 設計:
//   ・ページ全体がマップ（記事の中の小窓をやめた）
//   ・LOD3段: L0=数字つきドット＋地名 / L1=小書影 / L2=大書影＋作品名
//   ・パン/ズーム中はReactを再レンダーしない（useMapCamera が transform を直書き）
//   ・重なりは束にまとめ、タップでズームしてほどく
//   ・PCもモバイルも同じ一枚（リストへ逃げない）

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { geoMercator, geoNaturalEarth1, geoPath, type GeoProjection } from "d3-geo";
import { feature } from "topojson-client";
import type { FeatureCollection } from "geojson";
import type { Topology, GeometryCollection } from "topojson-specification";
import { spotsOf, workById, type MapSpot } from "@/lib/data";
import { amazonLink, coverSrc, coverThumb } from "@/lib/affiliate";
import { useMeta } from "@/lib/useMeta";
import { useVoicesByWork } from "@/lib/usePosts";
import type { Post } from "@/lib/posts";
import { AmazonButton } from "@/components/Cover";
import MiniBubble from "@/components/MiniBubble";
import { useMapCamera } from "@/lib/useMapCamera";
import { bundleByScreen } from "@/lib/cluster";
import { t, lp, type Lang } from "@/lib/i18n";
import { spotPlace, spotNote } from "@/lib/content-en";

const VIEW = {
  world: { w: 1000, h: 520 },
  japan: { w: 620, h: 620 },
};

type MapKind = "world" | "japan";

// 束をつくるときの「占有面積」（画面px）。CSSの .mapstage[data-lod] のピン寸法と対にする。
const PIN: Record<number, { w: number; h: number }> = {
  0: { w: 30, h: 30 },
  1: { w: 40, h: 50 },
  2: { w: 62, h: 78 },
};

// ラベルの見た目の幅を見積もる（和文は約11px・欧文は約6px / font-size 10.5px bold）
function labelWidth(s: string): number {
  let px = 12;
  for (const ch of s) px += /[\x20-\x7e]/.test(ch) ? 6 : 11;
  return px;
}

/**
 * 地名ラベルの間引き。点は点の大きさで束ねる一方、ラベルは点より遥かに広いので
 * そのまま全部出すと文字だけが重なる。作品数の多い場所を優先して、重なるものは隠す。
 * 判定は「k倍したワールド座標」で行う＝パンでは変わらない（ズームでだけ変わる）。
 */
function thinLabels<T>(
  items: { wx: number; wy: number; text: string; weight: number; key: T }[],
  k: number,
  labelDy: number
): Set<T> {
  const rects: { x0: number; x1: number; y0: number; y1: number }[] = [];
  const keep = new Set<T>();
  const sorted = [...items].sort((a, b) => b.weight - a.weight);
  for (const it of sorted) {
    const cx = it.wx * k;
    const cy = it.wy * k + labelDy;
    const hw = labelWidth(it.text) / 2;
    const r = { x0: cx - hw, x1: cx + hw, y0: cy - 8, y1: cy + 8 };
    const hit = rects.some((o) => r.x0 < o.x1 && r.x1 > o.x0 && r.y0 < o.y1 && r.y1 > o.y0);
    if (!hit) {
      rects.push(r);
      keep.add(it.key);
    }
  }
  return keep;
}

/** 日本の地点を地方に振り分ける（一覧を地方別に並べるため） */
function regionOf(s: MapSpot): string {
  if (s.map === "world") return "atlas.region.world";
  if (s.lat >= 37.5) return "atlas.region.hokkaido";
  if (s.lon >= 138.6) return "atlas.region.kanto";
  if (s.lon >= 136.5) return "atlas.region.chubu";
  if (s.lon >= 134.4) return "atlas.region.kansai";
  return "atlas.region.west";
}

const REGION_ORDER = [
  "atlas.region.hokkaido",
  "atlas.region.kanto",
  "atlas.region.chubu",
  "atlas.region.kansai",
  "atlas.region.west",
  "atlas.region.world",
];

function useGeo(kind: MapKind): FeatureCollection | null {
  const [geo, setGeo] = useState<Record<MapKind, FeatureCollection | null>>({
    world: null,
    japan: null,
  });
  useEffect(() => {
    if (geo[kind]) return;
    const file = kind === "world" ? "/geo/countries-110m.json" : "/geo/japan.topojson";
    const objName = kind === "world" ? "countries" : "japan";
    fetch(file)
      .then((r) => r.json())
      .then((topo: Topology) => {
        const fc = feature(topo, topo.objects[objName] as GeometryCollection) as unknown as FeatureCollection;
        const features =
          kind === "world"
            ? fc.features.filter((f) => (f.properties as { name?: string })?.name !== "Antarctica")
            : fc.features;
        setGeo((g) => ({ ...g, [kind]: { type: "FeatureCollection", features } }));
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind]);
  return geo[kind];
}

export default function AtlasMap({ lang = "ja" }: { lang?: Lang }) {
  const [mapKind, setMapKind] = useState<MapKind>("japan");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const [introOpen, setIntroOpen] = useState(true);
  const [camK, setCamK] = useState(0); // 束の再計算に使う「止まったときの倍率」
  const [voiceIdx, setVoiceIdx] = useState(0);
  const firstRun = useRef(true);

  const fc = useGeo(mapKind);
  const meta = useMeta();
  const voices = useVoicesByWork();

  const { w, h } = VIEW[mapKind];
  const spots = useMemo(() => spotsOf(mapKind), [mapKind]);

  const onSettle = useCallback((cam: { k: number }) => setCamK(cam.k), []);

  // タップの受け口。clickに頼らず、離した位置の要素から自分で解決する
  // （指は必ず数px動くので、clickだとピンに届かない）
  const tapTargets = useRef(new Map<string, { wx: number; wy: number; members: MapSpot[] }>());
  const onTap = useCallback((el: Element | null) => {
    if (!el) return;
    const hit = el.closest<HTMLElement>("[data-tap]");
    if (hit) {
      const b = tapTargets.current.get(hit.dataset.tap ?? "");
      if (!b) return;
      if (b.members.length > 1) unbundleRef.current(b);
      else pickRef.current(b.members[0]);
      return;
    }
    // 何もない地図の上をタップしたら選択を解く（道具立ての上は無視）
    if (el.closest(".mapstage")) setSelectedId(null);
  }, []);

  const cam = useMapCamera({
    worldW: w,
    worldH: h,
    minR: 0.85,
    maxR: 22,
    lodAt: [1.5, 3.0],
    onSettle,
    onTap,
  });

  // ---- URLから初期状態を読む（?map= と ?spot=）----
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const m = q.get("map");
    if (m === "world" || m === "japan") setMapKind(m);
    const sp = q.get("spot");
    if (sp) {
      setSelectedId(sp);
      setIntroOpen(false);
      pendingFly.current = sp;
    }
  }, []);

  const pendingFly = useRef<string | null>(null);

  // ---- 投影 ----
  const { paths, project } = useMemo(() => {
    if (!fc) return { paths: [] as string[], project: null as ((s: MapSpot) => [number, number]) | null };
    const proj: GeoProjection =
      mapKind === "world"
        ? geoNaturalEarth1().fitExtent([[8, 8], [w - 8, h - 8]], fc)
        : geoMercator().fitExtent([[16, 16], [w - 16, h - 16]], fc);
    const gen = geoPath(proj);
    return {
      paths: fc.features.map((ft) => gen(ft) || ""),
      project: (s: MapSpot): [number, number] => {
        const p = proj([s.lon, s.lat]) || [0, 0];
        return [p[0] + (s.dx ?? 0) * 0.6, p[1] + (s.dy ?? 0) * 0.6];
      },
    };
  }, [fc, mapKind, w, h]);

  // 共有URLで開いたときは、その地点まで寄って着地する
  useEffect(() => {
    const id = pendingFly.current;
    if (!id || !cam.fitK || !project) return;
    pendingFly.current = null;
    const s = spots.find((x) => x.id === id);
    if (!s) return;
    const [wx, wy] = project(s);
    cam.flyTo(wx, wy, 3.6, cam.vw > 860 ? -140 : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cam.fitK, project, spots]);

  // ベース地図はパン/ズームで作り直さない。
  // 大きさはCSS（width/height = ワールド寸法 × --k）が決めるので、
  // ズームしてもベクタとして再描画され鮮明なまま。
  const baseLayer = useMemo(
    () => (
      <svg viewBox={`0 0 ${w} ${h}`} className="stage-svg" preserveAspectRatio="none" aria-hidden>
        <g
          fill="#ffffff"
          stroke="#171310"
          strokeWidth={mapKind === "world" ? 0.9 : 1.1}
          strokeLinejoin="round"
        >
          {paths.map((d, i) => (
            <path key={i} d={d} style={{ vectorEffect: "non-scaling-stroke" }} />
          ))}
        </g>
      </svg>
    ),
    [paths, w, h, mapKind]
  );

  // ---- 地図を切り替えたら全体フィットへ ----
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    setSelectedId(null);
    cam.fit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapKind]);

  // ---- 束（画面上で重なるピンをまとめる）----
  const lod = cam.lod;
  const placed = useMemo(() => {
    if (!project) return [];
    return spots.map((s) => {
      const [wx, wy] = project(s);
      return { item: s, wx, wy };
    });
  }, [spots, project]);

  // 選択中の地点は束に飲ませない（自分で選んだものが「◯◯ほか」に埋もれると迷子になる）
  const bundles = useMemo(() => {
    const k = camK || cam.fitK;
    const mine = placed.filter((p) => p.item.id === selectedId);
    const rest = placed.filter((p) => p.item.id !== selectedId);
    const out = bundleByScreen(rest, k, PIN[lod].w, PIN[lod].h, lod > 0);
    for (const m of mine) out.push({ wx: m.wx, wy: m.wy, members: [m] });
    return out;
  }, [placed, camK, cam.fitK, lod, selectedId]);

  // 束ごとの表示名と、ラベルを出すかどうか（重なるものは間引く）
  const labeled = useMemo(() => {
    const rows = bundles.map((b) => {
      const head = b.members[0].item;
      const many = b.members.length > 1;
      const text = many
        ? `${spotPlace(head, lang).split(/[・—-]/)[0].trim()} ${t("atlas.others", lang)}`
        : spotPlace(head, lang);
      return {
        wx: b.wx,
        wy: b.wy,
        text,
        weight:
          b.members.reduce((n, m) => n + m.item.works.length, 0) +
          // 選択中は最優先でラベルを残す
          (b.members.some((m) => m.item.id === selectedId) ? 1000 : 0),
        key: b,
      };
    });
    const dy = lod === 0 ? 13 : lod === 1 ? 6 : 8;
    const keep = thinLabels(rows, camK || cam.fitK, dy);
    return { rows, keep };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bundles, camK, cam.fitK, lod, lang, selectedId]);

  // ---- 選択 ----
  const selected = selectedId ? spots.find((s) => s.id === selectedId) ?? null : null;

  const syncUrl = useCallback(
    (spot: string | null, kind: MapKind) => {
      const q = new URLSearchParams();
      if (kind !== "japan") q.set("map", kind);
      if (spot) q.set("spot", spot);
      const qs = q.toString();
      history.replaceState(null, "", location.pathname + (qs ? `?${qs}` : ""));
    },
    []
  );

  useEffect(() => {
    syncUrl(selectedId, mapKind);
  }, [selectedId, mapKind, syncUrl]);

  const pickRef = useRef<(s: MapSpot) => void>(() => {});
  const unbundleRef = useRef<(b: { wx: number; wy: number }) => void>(() => {});

  const pickSpot = (s: MapSpot, fly = true) => {
    setSelectedId(s.id);
    setIntroOpen(false);
    setListOpen(false);
    if (fly && project) {
      const [wx, wy] = project(s);
      // シートに隠れない位置へ（PCは左寄りに置く）
      const off = cam.vw > 860 ? -140 : 0;
      cam.flyTo(wx, wy, Math.max(3.4, (camK || cam.fitK) / (cam.fitK || 1)), off);
    }
  };

  const unbundle = (b: { wx: number; wy: number }) => {
    const r = (camK || cam.fitK) / (cam.fitK || 1);
    cam.flyTo(b.wx, b.wy, Math.min(20, Math.max(r * 2.6, 3.2)));
  };

  pickRef.current = pickSpot;
  unbundleRef.current = unbundle;

  // ---- コメントのローテーション（地図の上に被せず、左下の専用枠に置く）----
  const voiceSpots = useMemo(() => {
    const out: { spot: MapSpot; workId: string; post: Post }[] = [];
    for (const s of spots) {
      let best: { workId: string; post: Post } | null = null;
      for (const wk of s.works) {
        const v = voices[wk.workId]?.latest;
        if (v && (!best || v.createdAt > best.post.createdAt)) best = { workId: wk.workId, post: v };
      }
      if (best) out.push({ spot: s, workId: best.workId, post: best.post });
    }
    return out;
  }, [spots, voices]);

  useEffect(() => {
    if (voiceSpots.length < 2) return;
    const timer = setInterval(() => setVoiceIdx((i) => (i + 1) % voiceSpots.length), 7000);
    return () => clearInterval(timer);
  }, [voiceSpots.length]);

  const voice = voiceSpots.length > 0 ? voiceSpots[voiceIdx % voiceSpots.length] : null;

  // ---- 一覧（地方別）----
  const grouped = useMemo(() => {
    const map = new Map<string, MapSpot[]>();
    for (const s of spots) {
      const key = regionOf(s);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    return REGION_ORDER.filter((k) => map.has(k)).map((k) => ({ key: k, list: map.get(k)! }));
  }, [spots]);

  return (
    <div className="mapstage-root">
      <div
        ref={cam.containerRef}
        className="mapstage-vp"
        {...cam.bind}
        onPointerDown={(e) => {
          setIntroOpen(false); // 触ったら見出しは引っ込む
          cam.bind.onPointerDown(e);
        }}
        role="application"
        aria-label={t(mapKind === "world" ? "atlas.world" : "atlas.japan", lang)}
      >
        <div
          ref={cam.stageRef}
          className="mapstage names-on"
          style={{ ["--w" as string]: w, ["--h" as string]: h }}
        >
          {baseLayer}

          {labeled.rows.map((row) => {
            const b = row.key;
            const many = b.members.length > 1;
            const head = b.members[0].item;
            const totalWorks = row.weight;
            const first = workById(head.works[0].workId);
            // L0では画像を読まない（初期表示を軽くする掟）
            const cover =
              lod === 0 || !first ? null : lod > 1 ? coverSrc(meta, first.id) : coverThumb(meta, first.id);
            const isOn = b.members.some((m) => m.item.id === selectedId);
            const label = row.text;
            const showName = labeled.keep.has(b) || isOn;
            const tapId = b.members.map((m) => m.item.id).join("+");
            tapTargets.current.set(tapId, {
              wx: b.wx,
              wy: b.wy,
              members: b.members.map((m) => m.item),
            });
            return (
              <div
                key={tapId}
                className={`mp ${many ? "multi" : ""} ${isOn ? "on" : ""} ${showName ? "" : "noname"}`}
                style={{ ["--wx" as string]: b.wx, ["--wy" as string]: b.wy }}
              >
                <div className="mp-in" data-tap={tapId} title={label}>
                  <div className="mp-body">
                    {cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cover} alt={first?.title ?? label} loading="lazy" />
                    ) : lod > 0 ? (
                      <span style={{ fontSize: 15 }}>📖</span>
                    ) : null}
                    <span className="mp-n">{many ? totalWorks : ""}</span>
                    {many && lod > 0 && <span className="mp-cnt">{totalWorks}</span>}
                  </div>
                  <i className="mp-tip" />
                  <b className="mp-name">{label}</b>
                </div>
              </div>
            );
          })}
        </div>

        {/* ---- 見出し（初回だけ・操作したら引っ込む） ---- */}
        {introOpen && (
          <div className="map-intro">
            <button className="sheet-close" onClick={() => setIntroOpen(false)} aria-label={t("close", lang)}>
              ×
            </button>
            <span className="en">{t("atlas.en", lang)}</span>
            <h1>{t("atlas.title", lang)}</h1>
            <p>{t("atlas.welcomeBody", lang)}</p>
          </div>
        )}

        {/* ---- 道具立て ---- */}
        <div className="map-toolbar">
          <button
            className={`chip ${mapKind === "japan" ? "active" : ""}`}
            onClick={() => setMapKind("japan")}
          >
            🗾 {t("atlas.japan", lang)}
          </button>
          <button
            className={`chip ${mapKind === "world" ? "active" : ""}`}
            onClick={() => setMapKind("world")}
          >
            🌏 {t("atlas.world", lang)}
          </button>
          {!selected && (
            <button className={`chip ${listOpen ? "active" : ""}`} onClick={() => setListOpen(!listOpen)}>
              ≡ {t("atlas.spots", lang)}（{spots.length}）
            </button>
          )}
          <span className="map-hint">
            {t(cam.vw > 0 && cam.vw < 700 ? "hint.touch" : "hint.pc", lang)}
          </span>
        </div>

        <div className="map-ctl">
          <button onClick={() => cam.zoomBy(1.6)} aria-label={t("cam.zoomIn", lang)}>
            ＋
          </button>
          <button onClick={() => cam.zoomBy(1 / 1.6)} aria-label={t("cam.zoomOut", lang)}>
            －
          </button>
          <button className="wide" onClick={() => cam.fit()}>
            {t("cam.whole", lang)}
          </button>
        </div>

        {/* ---- 読者の声（地図を覆わない専用枠） ---- */}
        {voice && !selected && (
          <div className="map-voicebar">
            <MiniBubble
              post={voice.post}
              cover={coverThumb(meta, voice.workId)}
              title={workById(voice.workId)?.title}
              href={lp(lang, `/works/${voice.workId}`)}
            />
          </div>
        )}

        {/* ---- 一覧（畳める） ---- */}
        {!selected && listOpen && (
          <div className="map-list">
            <button className="sheet-close" onClick={() => setListOpen(false)} aria-label={t("close", lang)}>
              ×
            </button>
            {grouped.map((g) => (
              <div key={g.key}>
                <h4>{t(g.key, lang)}</h4>
                <div className="row">
                  {g.list.map((s) => (
                    <button key={s.id} className={s.id === selectedId ? "on" : ""} onClick={() => pickSpot(s)}>
                      {spotPlace(s, lang)}
                      <b>{s.works.length}</b>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ---- 詳細シート ---- */}
        {selected && (
          <aside className="map-sheet">
            <button className="sheet-close" onClick={() => setSelectedId(null)} aria-label={t("close", lang)}>
              ×
            </button>
            <h3>📍 {spotPlace(selected, lang)}</h3>
            {selected.works.map(({ workId }) => {
              const wk = workById(workId);
              if (!wk) return null;
              const az = amazonLink(meta, wk.id);
              const cover = coverThumb(meta, wk.id);
              return (
                <div key={workId} className="sw" style={{ display: "flex", gap: 10 }}>
                  <div style={{ flex: "0 0 48px" }}>
                    {cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={cover}
                        alt={wk.title}
                        loading="lazy"
                        style={{
                          width: 48,
                          height: 68,
                          objectFit: "cover",
                          border: "2px solid #171310",
                          boxShadow: "2px 2px 0 #171310",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 48,
                          height: 68,
                          border: "2px solid #171310",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "#f1e9d6",
                        }}
                      >
                        📖
                      </div>
                    )}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <Link href={lp(lang, `/works/${wk.id}`)}>
                      <span className="t">
                        {wk.title}
                        <span style={{ fontWeight: 400, fontSize: 11, color: "#4a4238" }}> ({wk.year})</span>{" "}
                        {voices[wk.id] && <span className="cbadge">💬 {voices[wk.id].count}</span>}
                      </span>
                    </Link>
                    <span className="n">{spotNote(selected, workId, lang)}</span>
                    {voices[wk.id]?.latest && <MiniBubble post={voices[wk.id].latest!} />}
                    {az && (
                      <div style={{ marginTop: 6 }}>
                        <AmazonButton href={az} small />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </aside>
        )}
      </div>
    </div>
  );
}
