"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

const INK = "#171310";
const ACCENT = "#e33b2e";

const VIEW = {
  world: { w: 1000, h: 520 },
  japan: { w: 620, h: 620 },
};

type MapKind = "world" | "japan";

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

// コンテナ幅の監視
function useWidth(ref: React.RefObject<HTMLDivElement | null>): number {
  const [w, setW] = useState(800);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    setW(el.clientWidth);
    return () => ro.disconnect();
  }, [ref]);
  return w;
}

export default function AtlasMap() {
  const [mapKind, setMapKind] = useState<MapKind>("japan");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState({ tx: 0, ty: 0, k: 1 });
  // ドラッグ/ピンチ中の更新をフレーム毎1回に間引く(モバイルの描画詰まり対策)
  const viewRef = useRef(view);
  useEffect(() => {
    viewRef.current = view;
  }, [view]);
  const pendingView = useRef<{ tx: number; ty: number; k: number } | null>(null);
  const rafId = useRef(0);
  const pushView = (fn: (v: { tx: number; ty: number; k: number }) => { tx: number; ty: number; k: number }) => {
    pendingView.current = fn(pendingView.current ?? viewRef.current);
    if (!rafId.current) {
      rafId.current = requestAnimationFrame(() => {
        rafId.current = 0;
        if (pendingView.current) {
          setView(pendingView.current);
          pendingView.current = null;
        }
      });
    }
  };
  const [voiceIdx, setVoiceIdx] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; tx: number; ty: number; moved: boolean } | null>(null);

  const fc = useGeo(mapKind);
  const meta = useMeta();
  const voices = useVoicesByWork();
  const cw = useWidth(wrapRef);

  const spots = useMemo(() => spotsOf(mapKind), [mapKind]);
  const selected: MapSpot | undefined = spots.find((s) => s.id === selectedId);
  const { w, h } = VIEW[mapKind];
  const f = cw / w; // svg単位 → 画面px

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

  // ベース地図(50前後のパス)はメモ化し、パン/ズーム中の再構築を避ける
  const baseLayer = useMemo(
    () => (
      <g fill="#ffffff" stroke={INK} strokeWidth={mapKind === "world" ? 0.6 : 0.9} strokeLinejoin="round" style={{ vectorEffect: "non-scaling-stroke" }}>
        {paths.map((d, i) => (
          <path key={i} d={d} style={{ vectorEffect: "non-scaling-stroke" }} />
        ))}
      </g>
    ),
    [paths, mapKind]
  );

  // マップ切替時にビューをリセット
  useEffect(() => {
    setView({ tx: 0, ty: 0, k: 1 });
    setSelectedId(null);
  }, [mapKind]);

  // ホイールズーム(カーソル基準・svg単位系)
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const fx = el.clientWidth / VIEW[mapKind].w;
      const mx = (e.clientX - rect.left) / fx;
      const my = (e.clientY - rect.top) / fx;
      pushView((v) => {
        const k = Math.min(12, Math.max(1, v.k * Math.exp(-e.deltaY * 0.0016)));
        const s = k / v.k;
        return { k, tx: mx - (mx - v.tx) * s, ty: my - (my - v.ty) * s };
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [mapKind]);

  const zoomBy = (factor: number) => {
    const mx = w / 2;
    const my = (h / 2) * 0.9;
    setView((v) => {
      const k = Math.min(12, Math.max(1, v.k * factor));
      const s = k / v.k;
      return { k, tx: mx - (mx - v.tx) * s, ty: my - (my - v.ty) * s };
    });
  };

  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchDist = useRef<number | null>(null);

  const captured = useRef(false);
  const captureNow = (e: React.PointerEvent) => {
    // キャプチャはドラッグ開始後にだけ取得(pointerdownで取得するとclickがピンに届かない)
    if (captured.current) return;
    try {
      (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
      captured.current = true;
    } catch {}
  };

  const onPointerDown = (e: React.PointerEvent) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) {
      const vc = pendingView.current ?? viewRef.current;
      drag.current = { x: e.clientX, y: e.clientY, tx: vc.tx, ty: vc.ty, moved: false };
    } else {
      captureNow(e); // ピンチは即キャプチャ
      drag.current = null;
      pinchDist.current = null;
    }
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];
    if (pts.length >= 2) {
      // ピンチズーム(2本指の中点を基準に拡大縮小)
      const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const rect = wrapRef.current?.getBoundingClientRect();
      if (!rect) return;
      const mx = ((pts[0].x + pts[1].x) / 2 - rect.left) / f;
      const my = ((pts[0].y + pts[1].y) / 2 - rect.top) / f;
      if (pinchDist.current) {
        const factor = d / pinchDist.current;
        pushView((v) => {
          const k = Math.min(12, Math.max(1, v.k * factor));
          const s = k / v.k;
          return { k, tx: mx - (mx - v.tx) * s, ty: my - (my - v.ty) * s };
        });
      }
      pinchDist.current = d;
      return;
    }
    const d0 = drag.current;
    if (!d0) return;
    const dx = (e.clientX - d0.x) / f;
    const dy = (e.clientY - d0.y) / f;
    if (Math.abs(dx) + Math.abs(dy) > 3) {
      d0.moved = true;
      captureNow(e);
    }
    // 更新関数の実行が遅延した後に指が離れてdrag.currentがnullになっても
    // 落ちないよう、値はここでキャプチャしておく
    const ntx = d0.tx + dx;
    const nty = d0.ty + dy;
    pushView((v) => ({ ...v, tx: ntx, ty: nty }));
  };
  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    pinchDist.current = null;
    drag.current = null;
    if (pointers.current.size === 0) captured.current = false;
  };

  // スポット位置(画面px)
  const screenPos = (s: MapSpot): [number, number] | null => {
    if (!project) return null;
    const [px, py] = project(s);
    return [(px * view.k + view.tx) * f, (py * view.k + view.ty) * f];
  };

  // スポットごとの最新コメント
  const spotVoice = useMemo(() => {
    const map: Record<string, Post> = {};
    for (const s of spots) {
      for (const wk of s.works) {
        const v = voices[wk.workId]?.latest;
        if (v && (!map[s.id] || v.createdAt > map[s.id].createdAt)) map[s.id] = v;
      }
    }
    return map;
  }, [spots, voices]);

  const voiceSpots = useMemo(() => spots.filter((s) => spotVoice[s.id]), [spots, spotVoice]);

  // 地図上のコメント吹き出しをローテーション
  useEffect(() => {
    if (voiceSpots.length < 2) return;
    const t = setInterval(() => setVoiceIdx((i) => (i + 1) % voiceSpots.length), 6500);
    return () => clearInterval(t);
  }, [voiceSpots.length]);

  // 表示する吹き出し: 選択中スポット優先、なければローテーション
  const bubbleSpot = selected && spotVoice[selected.id] ? selected : voiceSpots.length > 0 ? voiceSpots[voiceIdx % voiceSpots.length] : null;
  const BUBBLE_W = 244;

  const mapH = cw * (h / w);
  // ズームに連動して書影も拡大(見上げるほど大きく、上限あり)
  const cs = Math.min(3.4, Math.pow(view.k, 0.72));
  const pinW = Math.round(34 * cs);
  const pinH = Math.round(48 * cs);
  const showLabels = view.k > 2.1;

  // ===== 重なり検知クラスタリング =====
  // 画面上でピン同士が重なる場合は1つの「束」にまとめ、クリックでズームしてほどく。
  // 最大ズーム付近でもほどけない超近接スポット(京都と大津など)は、
  // 扇状に展開して引き出し線で本来の位置につなぐ(spiderfy)。
  // スポット数は高々数十なので毎レンダーの全ペア判定で十分軽い
  type RenderPin =
    | { kind: "single"; spot: MapSpot; x: number; y: number; tx: number; ty: number }
    | { kind: "cluster"; x: number; y: number; members: MapSpot[] };
  const clusters = useMemo<RenderPin[]>(() => {
    if (!project) return [];
    type Cluster = { x: number; y: number; members: { s: MapSpot; sx: number; sy: number }[] };
    const list: Cluster[] = [];
    for (const s of spots) {
      const [px, py] = project(s);
      const sx = (px * view.k + view.tx) * f;
      const sy = (py * view.k + view.ty) * f;
      if (sx < -80 || sx > cw + 80 || sy < -100 || sy > mapH + 60) continue;
      // ピンは下端アンカーなので、横は幅・縦は高さでつぶれ具合を判定(楕円距離)
      const hit = list.find((c) => {
        const dx = (sx - c.x) / (pinW * 0.95);
        const dy = (sy - c.y) / (pinH * 0.8);
        return dx * dx + dy * dy < 1;
      });
      if (hit) {
        // 位置は平均に寄せて、束の見た目が安定するように
        hit.x = (hit.x * hit.members.length + sx) / (hit.members.length + 1);
        hit.y = (hit.y * hit.members.length + sy) / (hit.members.length + 1);
        hit.members.push({ s, sx, sy });
      } else {
        list.push({ x: sx, y: sy, members: [{ s, sx, sy }] });
      }
    }
    const out: RenderPin[] = [];
    const spiderfy = view.k >= 9.5; // これ以上ズームしてもほどけない密度 → 展開表示
    for (const c of list) {
      if (c.members.length === 1) {
        const m = c.members[0];
        out.push({ kind: "single", spot: m.s, x: m.sx, y: m.sy, tx: m.sx, ty: m.sy });
      } else if (spiderfy) {
        // 横一列(多い時は格子)に展開し、引き出し線で本来の位置を指す
        const n = c.members.length;
        const cols = Math.min(n, 4);
        c.members.forEach((m, i) => {
          const col = i % cols;
          const row = Math.floor(i / cols);
          const rows = Math.ceil(n / cols);
          out.push({
            kind: "single",
            spot: m.s,
            x: c.x + (col - (cols - 1) / 2) * (pinW + 14),
            y: c.y + (row - (rows - 1) / 2) * (pinH + 22),
            tx: m.sx,
            ty: m.sy,
          });
        });
      } else {
        out.push({ kind: "cluster", x: c.x, y: c.y, members: c.members.map((m) => m.s) });
      }
    }
    return out;
  }, [spots, project, view, f, cw, mapH, pinW, pinH]);

  // 吹き出しの位置。スポットの緯度経度ではなく、束や展開表示で実際に
  // 描かれているピンの位置に合わせる(でないと吹き出しだけ別の場所を指す)
  const bubbleLayout = (() => {
    if (!bubbleSpot) return null;
    const post = spotVoice[bubbleSpot.id];
    if (!post || !post.workId) return null;
    const pin = clusters.find((c) =>
      c.kind === "single" ? c.spot.id === bubbleSpot.id : c.members.some((m) => m.id === bubbleSpot.id)
    );
    if (!pin) return null; // 画面外
    const { x: cx, y: cy } = pin; // ピンは下端(cy)が地点、書影はその上に立つ
    // 実際の描画高さ: カード(書影+枠線余白8) or 束のスタック、その下に三角のしっぽとドット
    const TIP_H = 17;
    const cardH =
      pin.kind === "cluster" ? pinH + 5 * (Math.min(pin.members.length, 3) - 1) + 4 : pinH + 8;
    const cardTop = cy - TIP_H - cardH;
    // 上に出すと枠外なら下へ
    const placeAbove = cardTop - 84 > 0;
    const top = placeAbove ? cardTop - 6 : cy + 12;
    const left = Math.max(4, Math.min(cw - BUBBLE_W - 4, cx - 26));
    const workId = post.workId;
    const wk = workById(workId);
    return {
      post,
      top,
      left,
      tailX: Math.max(12, Math.min(BUBBLE_W - 14, cx - left)),
      placeAbove,
      cover: coverThumb(meta, workId),
      title: wk?.title,
      workId,
    };
  })();

  // 束をクリック → その中心へスマートズーム(ほどけるまで繰り返せる)
  const zoomInto = (members: MapSpot[]) => {
    if (!project) return;
    let cx = 0;
    let cy = 0;
    for (const s of members) {
      const [px, py] = project(s);
      cx += px;
      cy += py;
    }
    cx /= members.length;
    cy /= members.length;
    setView((v) => {
      const k = Math.min(12, v.k * 2.4);
      return { k, tx: w / 2 - cx * k, ty: h / 2 - cy * k };
    });
  };

  return (
    <>
      <div className="filter-row" style={{ marginBottom: 14 }}>
        <button className={`chip ${mapKind === "japan" ? "active" : ""}`} onClick={() => setMapKind("japan")}>
          🗾 日本地図
        </button>
        <button className={`chip ${mapKind === "world" ? "active" : ""}`} onClick={() => setMapKind("world")}>
          🌏 世界地図
        </button>
        <span style={{ fontSize: 11.5, color: "var(--ink-soft)", alignSelf: "center", fontWeight: 700 }}>
          ドラッグで移動 / ホイール・ボタンで拡大縮小 / 書影クリックで詳細
        </span>
      </div>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* ===== 地図本体 ===== */}
        <div style={{ flex: "1 1 480px", minWidth: 320, position: "relative" }}>
          <div
            ref={wrapRef}
            className="atlas-wrap"
            style={{ position: "relative", overflow: "hidden", height: mapH, cursor: drag.current ? "grabbing" : "grab", touchAction: "none" }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
            onPointerCancel={onPointerUp}
            onDoubleClick={() => zoomBy(1.7)}
          >
            <svg viewBox={`0 0 ${w} ${h}`} className="atlas-svg" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} role="img" aria-label={mapKind === "world" ? "世界地図" : "日本地図"}>
              {!fc && (
                <text x={w / 2} y={h / 2} textAnchor="middle" fontSize={16} fill="#8a93a3">
                  地図を読み込み中…
                </text>
              )}
              <g transform={`translate(${view.tx},${view.ty}) scale(${view.k})`}>{baseLayer}</g>
            </svg>

            {/* ===== 書影ピン(HTMLオーバーレイ・ズームしても大きさ一定) =====
                 重なるピンは束(クラスタ)にまとめ、ホバーで情報カードを表示 */}
            {clusters.map((c) => {
              const [sx, sy] = [c.x, c.y];
              const popBelow = sy < 170; // 画面上端に近い時はカードを下に出す(はみ出し防止)

              if (c.kind === "single") {
                const s = c.spot;
                const active = s.id === selectedId;
                // 展開表示でずらされたピンは、本来の位置へ引き出し線を伸ばす
                const lead = Math.hypot(sx - c.tx, sy - c.ty) > 4 ? { len: Math.hypot(sx - c.tx, sy - c.ty), ang: (Math.atan2(sy - c.ty, sx - c.tx) * 180) / Math.PI } : null;
                const first = workById(s.works[0].workId);
                // 通常は軽量サムネ、ズームで大きく表示される時だけ大判に切替
                const cover = first ? (cs > 2 ? coverSrc(meta, first.id) : coverThumb(meta, first.id)) : null;
                return (
                  <div key={s.id} style={{ display: "contents" }}>
                    {lead && (
                      <>
                        <div className="map-pin-lead" style={{ left: c.tx, top: c.ty, width: lead.len, transform: `rotate(${lead.ang}deg)` }} />
                        <div className="map-pin-truedot" style={{ left: c.tx, top: c.ty }} />
                      </>
                    )}
                  <div
                    className={`map-pin ${active ? "on" : ""}`}
                    style={{ left: sx, top: sy }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (drag.current?.moved) return;
                      setSelectedId(active ? null : s.id);
                    }}
                  >
                    <div className="map-pin-card">
                      {cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={cover} alt={first?.title ?? s.place} loading="lazy" style={{ width: pinW, height: pinH }} />
                      ) : (
                        <span className="ph" style={{ width: pinW, height: pinH, fontSize: 14 + cs * 4 }}>📖</span>
                      )}
                      {s.works.length > 1 && <span className="cnt">{s.works.length}</span>}
                    </div>
                    <div className="map-pin-tip" />
                    <div className="map-pin-dot" />
                    <div className={`map-pin-label ${showLabels ? "show" : ""}`}>{s.place}</div>
                    {/* ホバー情報カード */}
                    <div className={`map-pin-pop ${popBelow ? "below" : ""}`}>
                      <b>📍 {s.place}</b>
                      <ul>
                        {s.works.slice(0, 3).map(({ workId }) => (
                          <li key={workId}>{workById(workId)?.title}</li>
                        ))}
                      </ul>
                      {s.works.length > 3 && <span className="more">ほか{s.works.length - 3}作品</span>}
                      <span className="hint">クリックで詳細</span>
                    </div>
                  </div>
                  </div>
                );
              }

              // ===== 束ピン(重なった複数スポット) =====
              const totalWorks = c.members.reduce((n, s) => n + s.works.length, 0);
              const stack = c.members.slice(0, 3).map((s) => {
                const first = workById(s.works[0].workId);
                return { id: s.id, cover: first ? coverThumb(meta, first.id) : null, title: first?.title ?? s.place };
              });
              const hasSelected = c.members.some((s) => s.id === selectedId);
              return (
                <div
                  key={`cl-${c.members.map((s) => s.id).join("-")}`}
                  className={`map-pin cluster ${hasSelected ? "on" : ""}`}
                  style={{ left: sx, top: sy }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (drag.current?.moved) return;
                    zoomInto(c.members);
                  }}
                >
                  <div className="map-stack" style={{ width: pinW + 8 * (stack.length - 1) + 4, height: pinH + 5 * (stack.length - 1) + 4 }}>
                    {stack.map((it, i) =>
                      it.cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={it.id}
                          src={it.cover}
                          alt={it.title}
                          loading="lazy"
                          style={{ width: pinW, height: pinH, left: i * 8, top: (stack.length - 1 - i) * 5, transform: `rotate(${(i - 1) * 3}deg)`, zIndex: i + 1 }}
                        />
                      ) : (
                        <span key={it.id} className="ph" style={{ width: pinW, height: pinH, left: i * 8, top: (stack.length - 1 - i) * 5, zIndex: i + 1 }}>📖</span>
                      )
                    )}
                    <span className="cnt">{totalWorks}</span>
                  </div>
                  <div className="map-pin-tip" />
                  <div className="map-pin-dot" />
                  <div className={`map-pin-label ${showLabels ? "show" : ""}`}>{c.members[0].place.split("・")[0]} ほか</div>
                  {/* ホバー情報カード */}
                  <div className={`map-pin-pop ${popBelow ? "below" : ""}`}>
                    <b>🔍 {c.members.length}つの舞台が重なっています</b>
                    <ul>
                      {c.members.slice(0, 4).map((s) => (
                        <li key={s.id}>{s.place} ({s.works.length})</li>
                      ))}
                    </ul>
                    {c.members.length > 4 && <span className="more">ほか{c.members.length - 4}か所</span>}
                    <span className="hint">クリックでズームしてほどく</span>
                  </div>
                </div>
              );
            })}

            {/* ===== 地図上のコメント吹き出し(しっぽがピンを指す) ===== */}
            {bubbleLayout && (
              <div
                className={`map-voice ${bubbleLayout.placeAbove ? "above" : "below"}`}
                style={{ left: bubbleLayout.left, top: bubbleLayout.top, ["--tail-x" as string]: `${bubbleLayout.tailX}px` }}
              >
                <MiniBubble
                  post={bubbleLayout.post}
                  cover={bubbleLayout.cover}
                  title={bubbleLayout.title}
                  href={`/works/${bubbleLayout.workId}`}
                />
              </div>
            )}

            {/* ズームコントロール */}
            <div style={{ position: "absolute", right: 10, bottom: 10, display: "flex", flexDirection: "column", gap: 6 }}>
              <button className="chip" style={{ width: 38, height: 38, padding: 0, fontSize: 17 }} onClick={(e) => { e.stopPropagation(); zoomBy(1.5); }} onPointerDown={(e) => e.stopPropagation()}>＋</button>
              <button className="chip" style={{ width: 38, height: 38, padding: 0, fontSize: 17 }} onClick={(e) => { e.stopPropagation(); zoomBy(1 / 1.5); }} onPointerDown={(e) => e.stopPropagation()}>－</button>
              <button className="chip" style={{ width: 38, height: 38, padding: 0, fontSize: 10 }} onClick={(e) => { e.stopPropagation(); setView({ tx: 0, ty: 0, k: 1 }); }} onPointerDown={(e) => e.stopPropagation()}>全体</button>
            </div>
          </div>
        </div>

        {/* ===== サイドパネル ===== */}
        <aside style={{ flex: "0 1 340px", minWidth: 280 }}>
          {selected ? (
            <div className="spot-popup sheet-m">
              <button className="sheet-close" onClick={() => setSelectedId(null)} aria-label="閉じる">×</button>
              <h3>📍 {selected.place}</h3>
              {selected.works.map(({ workId, note }) => {
                const wk = workById(workId);
                if (!wk) return null;
                const az = amazonLink(meta, wk.id);
                const cover = coverThumb(meta, wk.id);
                return (
                  <div key={workId} className="sw" style={{ display: "flex", gap: 10 }}>
                    <div style={{ flex: "0 0 46px" }}>
                      {cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={cover} alt={wk.title} style={{ width: 46, height: 66, objectFit: "cover", border: "2px solid #171310", boxShadow: "2px 2px 0 #171310" }} />
                      ) : (
                        <div style={{ width: 46, height: 66, border: "2px solid #171310", display: "flex", alignItems: "center", justifyContent: "center", background: "#f1e9d6" }}>📖</div>
                      )}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <Link href={`/works/${wk.id}`}>
                        <span className="t">
                          {wk.title}
                          <span style={{ fontWeight: 400, fontSize: 11, color: "#4a4238" }}> ({wk.year})</span>{" "}
                          {voices[wk.id] && <span className="cbadge">💬 {voices[wk.id].count}</span>}
                        </span>
                      </Link>
                      <span className="n">{note}</span>
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
            </div>
          ) : (
            <div className="spot-popup" style={{ background: "#fdf6d8" }}>
              <h3>マンガの聖地を旅する</h3>
              <p style={{ fontSize: 13, lineHeight: 1.9, margin: 0 }}>
                地図の上の<strong>書影</strong>がマンガの舞台。カーソルを乗せると作品名がひと目でわかり、クリックで「聖地メモ」と読者の声が出ます。
                重なった書影は<strong>束</strong>になっています — クリックすると、そこへズームしてほどけます。
              </p>
            </div>
          )}

          <div style={{ marginTop: 16 }}>
            {spots.map((s) => (
              <button
                key={s.id}
                className="style-opt"
                style={{ margin: "0 6px 6px 0", ...(s.id === selectedId ? { background: "var(--yellow)" } : {}) }}
                onClick={() => setSelectedId(s.id === selectedId ? null : s.id)}
              >
                {s.place} ({s.works.length})
              </button>
            ))}
          </div>
        </aside>
      </div>
    </>
  );
}
