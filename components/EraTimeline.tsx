"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { TIMELINE, TL_REGIONS, workById, type TimelineEntry } from "@/lib/data";
import { amazonLink, coverSrc, coverThumb } from "@/lib/affiliate";
import { useMeta } from "@/lib/useMeta";
import { useVoicesByWork } from "@/lib/usePosts";
import { AmazonButton } from "@/components/Cover";
import Bubble, { PostMeta } from "@/components/Bubble";
import MiniBubble from "@/components/MiniBubble";

/* ================= 時間スケール =================
 * 紀元前1100年〜2400年(架空ゾーン含む)をピースワイズ線形で圧縮。
 * 古代は詰めて、作品が密集する近現代に幅を割く。 */
const TL_W = 3000; // 論理幅
const STOPS: [number, number][] = [
  [-1100, 0],
  [0, 0.08],
  [1000, 0.15],
  [1600, 0.22],
  [1850, 0.32],
  [1900, 0.42],
  [1950, 0.54],
  [2000, 0.66],
  [2050, 0.74],
  [2100, 0.79],
  [2400, 1.0],
];

function tlX(year: number): number {
  const y = Math.max(STOPS[0][0], Math.min(2400, year));
  for (let i = 1; i < STOPS.length; i++) {
    if (y <= STOPS[i][0]) {
      const [y0, f0] = STOPS[i - 1];
      const [y1, f1] = STOPS[i];
      return (f0 + ((y - y0) / (y1 - y0)) * (f1 - f0)) * TL_W;
    }
  }
  return TL_W;
}

const TICKS: { year: number; label: string }[] = [
  { year: -1000, label: "BC1000" },
  { year: -500, label: "BC500" },
  { year: 0, label: "紀元" },
  { year: 500, label: "500" },
  { year: 1000, label: "1000" },
  { year: 1500, label: "1500" },
  { year: 1700, label: "1700" },
  { year: 1800, label: "1800" },
  { year: 1850, label: "1850" },
  { year: 1900, label: "1900" },
  { year: 1950, label: "1950" },
  { year: 2000, label: "2000" },
  { year: 2050, label: "2050" },
  { year: 2100, label: "2100" },
];

// 各トラックに添える歴史イベント(時代の道しるべ)
const EVENTS: { region: string; year: number; label: string }[] = [
  { region: "japan", year: 1603, label: "江戸幕府成立" },
  { region: "japan", year: 1868, label: "明治維新" },
  { region: "japan", year: 1923, label: "関東大震災" },
  { region: "japan", year: 1945, label: "終戦" },
  { region: "japan", year: 1964, label: "東京五輪" },
  { region: "japan", year: 1991, label: "バブル崩壊" },
  { region: "japan", year: 2011, label: "東日本大震災" },
  { region: "asia", year: -221, label: "秦が中華統一" },
  { region: "asia", year: 618, label: "唐の建国" },
  { region: "asia", year: 1912, label: "清の滅亡" },
  { region: "europe", year: -334, label: "アレクサンドロス東征" },
  { region: "europe", year: 793, label: "ヴァイキング時代はじまる" },
  { region: "europe", year: 1789, label: "フランス革命" },
  { region: "europe", year: 1914, label: "第一次世界大戦" },
  { region: "europe", year: 1989, label: "ベルリンの壁崩壊" },
  { region: "world", year: 1776, label: "アメリカ独立" },
  { region: "world", year: 1929, label: "世界恐慌" },
  { region: "world", year: 1969, label: "人類、月に立つ" },
];

// 日本トラックの時代帯
const JP_ERAS: { from: number; to: number; name: string }[] = [
  { from: 1603, to: 1868, name: "江戸" },
  { from: 1868, to: 1912, name: "明治" },
  { from: 1912, to: 1926, name: "大正" },
  { from: 1926, to: 1989, name: "昭和" },
  { from: 1989, to: 2019, name: "平成" },
  { from: 2019, to: 2100, name: "令和" },
];

const AXIS_H = 46;
const TRACK_PAD = 22; // トラック内の上下の余白
const MIN_ABOVE = 32; // 中心線の上に最低限あける(地域ラベル用)
const MIN_TH = 96; // トラックの最小高さ
const FANTASY_X = tlX(2125);

function useWidth(ref: React.RefObject<HTMLDivElement | null>): number {
  const [w, setW] = useState(0); // 実測まで0(誤った幅で初期ズームしない)
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

// トラック内のレーン割り当て + 横ずらし(dodge)。
// 密集地帯でも書影が重ならないよう、レーンに空きが無ければ最小間隔まで右へずらす。
// dispX が書影の表示位置、true位置(x)へは引き出し線でつなぐ。
function assignLanes(
  entries: { e: TimelineEntry; x: number }[],
  minGap: number
): Map<string, { lane: number; dispX: number }> {
  const N = 4; // 上近/下近/上遠/下遠
  const lastX: number[] = new Array(N).fill(-Infinity);
  const result = new Map<string, { lane: number; dispX: number }>();
  const sorted = [...entries].sort((a, b) => a.x - b.x);
  for (const item of sorted) {
    // そのまま置けるレーン(重ならない)を優先
    let lane = lastX.findIndex((lx) => item.x - lx >= minGap);
    let dispX = item.x;
    if (lane === -1) {
      // どのレーンも詰まっている → 最も空いているレーンへ右ずらしで配置
      lane = lastX.indexOf(Math.min(...lastX));
      dispX = lastX[lane] + minGap;
    }
    lastX[lane] = dispX;
    result.set(item.e.workId, { lane, dispX });
  }
  return result;
}

export default function EraTimeline() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const cw = useWidth(wrapRef);
  const meta = useMeta();
  const voices = useVoicesByWork();
  const [view, setView] = useState<{ tx: number; ty: number; k: number } | null>(null);
  const [selected, setSelected] = useState<TimelineEntry | null>(null);
  const [voiceIdx, setVoiceIdx] = useState(0);
  const drag = useRef<{ x: number; y: number; tx: number; ty: number; moved: boolean } | null>(null);

  const isMobile = cw < 700;
  const kFit = cw / TL_W;

  // 初期表示: PCは全期間フィット、モバイルは作品が密集する近現代へズーム
  useEffect(() => {
    if (cw > 0 && !view) {
      if (cw < 700) {
        const k0 = cw / (TL_W * 0.72);
        setView({ tx: -tlX(1790) * k0, ty: 0, k: k0 });
      } else {
        setView({ tx: 0, ty: 0, k: cw / TL_W });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cw]);

  const k = view?.k ?? kFit;
  const tx = view?.tx ?? 0;
  const ty = view?.ty ?? 0;

  // ドラッグ/ピンチ中の更新をフレーム毎1回に間引く(モバイルの描画詰まり対策)
  const viewRef = useRef(view);
  useEffect(() => {
    viewRef.current = view;
  }, [view]);
  const pendingView = useRef<{ tx: number; ty: number; k: number } | null>(null);
  const rafId = useRef(0);
  const pushView = (fn: (v: { tx: number; ty: number; k: number }) => { tx: number; ty: number; k: number }) => {
    const base = pendingView.current ?? viewRef.current ?? { tx: 0, ty: 0, k: kFit };
    pendingView.current = fn(base);
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
  const X = (year: number) => tlX(year) * k + tx;

  // ズームに連動して書影も拡大
  const s = Math.min(2.7, Math.max(1, Math.pow(k / (kFit || 1e-6), 0.55)));
  const coverW = Math.round((isMobile ? 46 : 36) * s);
  const coverH = Math.round((isMobile ? 66 : 52) * s);
  const showYears = s > 1.3;

  // 物語内年代のコンパクト表示
  const yearChip = (e: TimelineEntry): string => {
    if (e.region === "fantasy") return "時間外";
    return e.year < 0 ? `BC${-e.year}` : `${e.year}`;
  };

  // ホイールズーム(横方向)
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      pushView((cur) => {
        const kMin = (el.clientWidth / TL_W) * 0.9;
        const nk = Math.min(kMin * 60, Math.max(kMin, cur.k * Math.exp(-e.deltaY * 0.0016)));
        return { k: nk, ty: cur.ty, tx: mx - ((mx - cur.tx) * nk) / cur.k };
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const zoomBy = (factor: number) => {
    const mx = cw / 2;
    setView((v) => {
      const cur = v ?? { tx: 0, ty: 0, k: kFit };
      const kMin = kFit * 0.9;
      const nk = Math.min(kMin * 60, Math.max(kMin, cur.k * factor));
      return { k: nk, ty: cur.ty, tx: mx - ((mx - cur.tx) * nk) / cur.k };
    });
  };

  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchDist = useRef<number | null>(null);

  const captured = useRef(false);
  const captureNow = (e: React.PointerEvent) => {
    // キャプチャはドラッグ開始後にだけ取得(pointerdownで取得するとclickが書影に届かない)
    if (captured.current) return;
    try {
      (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
      captured.current = true;
    } catch {}
  };

  const onPointerDown = (e: React.PointerEvent) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) {
      const vc = pendingView.current ?? viewRef.current ?? { tx: 0, ty: 0, k: kFit };
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
      // ピンチで時間軸をズーム(2本指の中点基準)
      const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const rect = wrapRef.current?.getBoundingClientRect();
      if (!rect) return;
      const mx = (pts[0].x + pts[1].x) / 2 - rect.left;
      if (pinchDist.current) {
        const factor = d / pinchDist.current;
        pushView((cur) => {
          const kMin = kFit * 0.9;
          const nk = Math.min(kMin * 60, Math.max(kMin, cur.k * factor));
          return { k: nk, ty: cur.ty, tx: mx - ((mx - cur.tx) * nk) / cur.k };
        });
      }
      pinchDist.current = d;
      return;
    }
    const d0 = drag.current;
    if (!d0) return;
    const dx = e.clientX - d0.x;
    const dy = e.clientY - d0.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) {
      d0.moved = true;
      captureNow(e);
    }
    const ntx = d0.tx + dx;
    const nty = Math.max(minTy, Math.min(0, d0.ty + dy));
    pushView((cur) => ({ k: cur.k, tx: ntx, ty: nty }));
  };
  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    pinchDist.current = null;
    drag.current = null;
    if (pointers.current.size === 0) captured.current = false;
  };

  // 書影1枚分の実際の描画高さ。書影 + カードの枠線と余白(8px) + 年チップ(16px)。
  // ここが実寸とずれると、吹き出しと引き出し線が書影を指さなくなる
  const CARD_CHROME = 8;
  const boxH = coverH + CARD_CHROME + (showYears ? 16 : 0);
  const labelPad = s > 1.6 ? 20 : 0; // 下レーンは作品名ラベルのぶんだけ余分に要る
  const laneOffset = (lane: number): { above: boolean; dist: number } => {
    // 0:上近 1:下近 2:上遠 3:下遠 (書影サイズに追従)
    const above = lane % 2 === 0;
    const dist = lane < 2 ? 13 : 13 + coverH * 0.72 + 14;
    return { above, dist };
  };

  // 地域ごとのエントリ + レーン + トラックの実寸
  // レーンはtxに依存しない座標(tlX*k)で計算 → パン中は再計算不要。
  // トラック高さは固定値ではなく「実際に使われたレーンの張り出し」から逆算する。
  // 固定152pxだと2段レーンの書影(上に最大116px、ズーム時は280px超)がはみ出し、
  // 先頭の日本トラックが軸バーに切られていた
  const tracks = useMemo(() => {
    let y = AXIS_H;
    return TL_REGIONS.map((region) => {
      const entries = TIMELINE.filter((e) => e.region === region.id).map((e) => ({ e, x: tlX(e.year) * k }));
      const lanes = assignLanes(entries, coverW + 6);
      // このトラックが中心線の上下それぞれに必要とする高さ
      let aboveExt = MIN_ABOVE; // 地域ラベルのぶんは最低限あける
      let belowExt = 0;
      for (const { e } of entries) {
        const la = lanes.get(e.workId);
        if (!la) continue;
        const { above, dist } = laneOffset(la.lane);
        const ext = dist + boxH + (above ? 0 : labelPad);
        if (above) aboveExt = Math.max(aboveExt, ext);
        else belowExt = Math.max(belowExt, ext);
      }
      const th = Math.max(MIN_TH, aboveExt + belowExt + TRACK_PAD);
      const top = y;
      const cy = top + TRACK_PAD / 2 + aboveExt;
      y += th;
      return { region, entries, lanes, th, top, cy };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [k, coverW, coverH, showYears, s]);

  const H = tracks[tracks.length - 1].top + tracks[tracks.length - 1].th; // コンテンツ全体の高さ
  const VH = Math.min(H, isMobile ? 500 : 660); // 表示枠(はみ出す分は縦ドラッグで移動)
  const minTy = Math.min(0, VH - H);

  // コメントのある作品(吹き出しローテーション)
  const voiceEntries = useMemo(() => TIMELINE.filter((e) => voices[e.workId]?.latest), [voices]);
  useEffect(() => {
    if (voiceEntries.length < 2) return;
    const t = setInterval(() => setVoiceIdx((i) => (i + 1) % voiceEntries.length), 6500);
    return () => clearInterval(t);
  }, [voiceEntries.length]);
  const bubbleEntry =
    selected && voices[selected.workId]?.latest ? selected : voiceEntries.length > 0 ? voiceEntries[voiceIdx % voiceEntries.length] : null;

  // 吹き出しの位置。「その年の中心線上」ではなく、実際に描かれている書影
  // (重なり回避で横にずらしたdispX + レーンの上下)にぴったり合わせる
  const BUBBLE_W = 216;
  const bubbleLayout = (() => {
    if (!bubbleEntry) return null;
    const post = voices[bubbleEntry.workId]?.latest;
    if (!post) return null;
    const tr = tracks.find((t) => t.region.id === bubbleEntry.region);
    const la = tr?.lanes.get(bubbleEntry.workId);
    if (!tr || !la) return null;
    const { above, dist } = laneOffset(la.lane);
    const cx = la.dispX + tx; // 書影の中心X(画面座標)
    const cy = tr.cy + ty;
    const coverTop = above ? cy - dist - boxH : cy + dist;
    const coverBottom = coverTop + boxH;
    if (cx < -30 || cx > cw + 30 || coverBottom < 0 || coverTop > VH) return null;
    // 書影のあるレーン側に出す。枠外にはみ出すなら反対側へ
    let placeAbove = above;
    if (placeAbove && coverTop - 12 < AXIS_H + 44) placeAbove = false;
    if (!placeAbove && coverBottom + 64 > VH) placeAbove = true;
    const top = placeAbove ? coverTop - 9 : coverBottom + 9;
    const left = Math.max(4, Math.min(cw - BUBBLE_W - 4, cx - 26));
    return { post, top, left, tailX: Math.max(12, Math.min(BUBBLE_W - 14, cx - left)), placeAbove };
  })();

  // 可動コンテンツをメモ化: パン(tx/ty)では再構築せず、ズーム(k)時のみ再計算。
  // パン中はコンテナのtransform(GPU)だけが動くので、モバイルでも滑らか
  const tlContent = useMemo(() => {
    return (
      <>
        {/* 架空ゾーンの背景 */}
        <div style={{ position: "absolute", left: FANTASY_X * k, top: 0, width: Math.max(0, (TL_W - FANTASY_X) * k), height: H, background: "repeating-linear-gradient(-45deg, rgba(219,39,119,0.05), rgba(219,39,119,0.05) 8px, transparent 8px, transparent 16px)", borderLeft: "2px dashed #db277788", pointerEvents: "none" }} />
        {tracks.map(({ region, entries, lanes, th, top, cy }) => {
          return (
            <div key={region.id}>
              {/* 日本トラックの時代帯 */}
              {region.id === "japan" &&
                JP_ERAS.map((era) => {
                  const x0 = tlX(era.from) * k;
                  const x1 = tlX(era.to) * k;
                  return (
                    <div key={era.name} style={{ position: "absolute", left: x0, top: top + 2, width: x1 - x0, height: th - 4, background: "rgba(212,61,46,0.055)", borderLeft: "1px solid rgba(212,61,46,0.3)", pointerEvents: "none" }}>
                      {x1 - x0 > 34 && (
                        <span style={{ position: "absolute", top: 2, left: 4, fontSize: 10, fontWeight: 900, color: "rgba(212,61,46,0.65)" }}>{era.name}</span>
                      )}
                    </div>
                  );
                })}
              {/* 歴史イベント(道しるべ) */}
              {EVENTS.filter((ev) => ev.region === region.id).map((ev) => {
                const ex = tlX(ev.year) * k;
                return (
                  <div key={ev.label} style={{ position: "absolute", left: ex, top: cy, zIndex: 1, pointerEvents: "none" }}>
                    <div style={{ position: "absolute", left: -4, top: -4, width: 8, height: 8, background: "#fff", border: `2px solid ${region.color}`, transform: "rotate(45deg)" }} />
                    <div style={{ position: "absolute", left: 7, top: 4, fontSize: 9.5, fontWeight: 700, color: "rgba(23,19,16,0.55)", whiteSpace: "nowrap" }}>
                      {ev.label}
                    </div>
                  </div>
                );
              })}
              {/* 作品(書影 + 引き出し線)。dispX=表示位置, x=本来の年 */}
              {entries.map(({ e, x }) => {
                const wk = workById(e.workId);
                if (!wk) return null;
                const la = lanes.get(e.workId) ?? { lane: 0, dispX: x };
                const dispX = la.dispX;
                const { above, dist } = laneOffset(la.lane);
                const cover = s > 1.7 ? coverSrc(meta, wk.id) : coverThumb(meta, wk.id);
                const active = selected?.workId === e.workId && selected.region === e.region;
                const pinTop = above ? cy - dist - boxH : cy + dist;
                const edgeY = above ? cy - dist : cy + dist; // 書影の内側エッジのY
                const lx = Math.min(x, dispX);
                const lw = Math.abs(dispX - x);
                return (
                  <div key={e.workId}>
                    {/* 引き出し線: 本来の年から縦、書影エッジで横に折れてL字に */}
                    <div style={{ position: "absolute", left: x - 0.75, top: Math.min(cy, edgeY), width: 1.5, height: dist, background: region.color, opacity: 0.75, pointerEvents: "none" }} />
                    {lw > 1 && (
                      <div style={{ position: "absolute", left: lx, top: edgeY - 0.75, width: lw, height: 1.5, background: region.color, opacity: 0.75, pointerEvents: "none" }} />
                    )}
                    <div style={{ position: "absolute", left: x - 3.5, top: cy - 3.5, width: 7, height: 7, borderRadius: "50%", background: region.color, border: "1.5px solid var(--ink)", pointerEvents: "none" }} />
                    <div
                      className={`map-pin ${active ? "on" : ""}`}
                      style={{ left: dispX, top: pinTop + boxH, zIndex: active ? 8 : 5 }}
                      onClick={(ev) => {
                        ev.stopPropagation();
                        if (drag.current?.moved) return;
                        setSelected(active ? null : e);
                      }}
                      title={`${wk.title} — ${e.label}`}
                    >
                      {showYears && (
                        <div className="tl-year" style={{ borderColor: region.color, color: region.color }}>
                          {yearChip(e)}
                        </div>
                      )}
                      <div className="map-pin-card">
                        {cover ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={cover} alt={wk.title} loading="lazy" style={{ width: coverW, height: coverH }} />
                        ) : (
                          <span className="ph" style={{ width: coverW, height: coverH, fontSize: 13 + s * 3 }}>📖</span>
                        )}
                      </div>
                      <div className={`map-pin-label ${s > 1.6 ? "show" : ""}`} style={{ bottom: -18 }}>{wk.title}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracks, k, H, coverW, coverH, boxH, s, showYears, meta, selected]);

  // ミニマップの分布ドット(完全に静的)
  const mmDots = useMemo(
    () =>
      TIMELINE.map((e) => {
        const region = TL_REGIONS.find((r) => r.id === e.region);
        return (
          <span
            key={`${e.region}-${e.workId}`}
            style={{ position: "absolute", left: `${(tlX(e.year) / TL_W) * 100}%`, top: `${18 + TL_REGIONS.findIndex((r) => r.id === e.region) * 11}%`, width: 5, height: 5, marginLeft: -2.5, borderRadius: "50%", background: region?.color }}
          />
        );
      }),
    []
  );

  const selWork = selected ? workById(selected.workId) : null;
  const selPosts = selected ? (voices[selected.workId]?.count ? voices[selected.workId] : null) : null;

  return (
    <>
      <div className="filter-row" style={{ marginBottom: 14 }}>
        <span style={{ fontSize: 11.5, color: "var(--ink-soft)", alignSelf: "center", fontWeight: 700 }}>
          ドラッグで縦横に移動 / ホイール・ボタンで時間軸をズーム / 書影クリックで詳細
        </span>
      </div>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* ===== タイムライン本体 ===== */}
        <div style={{ flex: "1 1 560px", minWidth: 340 }}>
          <div
            ref={wrapRef}
            className="atlas-wrap"
            style={{
              position: "relative",
              overflow: "hidden",
              height: VH,
              cursor: drag.current ? "grabbing" : "grab",
              touchAction: "none",
              backgroundColor: "#f6f1e4",
              backgroundImage: "radial-gradient(rgba(23,19,16,0.055) 1px, transparent 1.3px)",
              backgroundSize: "10px 10px",
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
            onPointerCancel={onPointerUp}
            onDoubleClick={() => zoomBy(1.7)}
          >
            {/* 年代軸(定規バー) */}
            <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: AXIS_H, background: "#fffdf4", borderBottom: "2.5px solid var(--ink)", zIndex: 9, pointerEvents: "none" }} />
            {TICKS.map((t) => {
              const x = X(t.year);
              if (x < -40 || x > cw + 40) return null;
              return (
                <div key={t.year} style={{ position: "absolute", left: x, top: 0, height: VH, pointerEvents: "none" }}>
                  <div style={{ position: "absolute", top: AXIS_H, width: 1.5, height: VH - AXIS_H, background: "rgba(23,19,16,0.09)" }} />
                  <div style={{ position: "absolute", top: AXIS_H - 12, width: 2, height: 12, background: "var(--ink)", zIndex: 10 }} />
                  <div style={{ position: "absolute", top: 8, left: 5, fontSize: 11.5, fontWeight: 900, color: "var(--ink)", zIndex: 10, fontFamily: "var(--font-base)" }}>{t.label}</div>
                </div>
              );
            })}
            {/* 架空ゾーンラベル */}
            <div style={{ position: "absolute", left: FANTASY_X * k + tx + 10, top: 12, fontSize: 11, fontWeight: 900, color: "#db2777", zIndex: 10, pointerEvents: "none", whiteSpace: "nowrap" }}>
              ⟵ここから先は時間軸の外(架空・異世界)
            </div>

            {/* トラックの帯・中心線・地域ラベル(横幅いっぱい・縦のみ追従) */}
            {tracks.map(({ region, th, top: t0, cy: c0 }) => {
              const top = t0 + ty;
              const cy = c0 + ty;
              if (top > VH || top + th < 0) return null;
              return (
                <div key={region.id}>
                  <div style={{ position: "absolute", left: 0, right: 0, top, height: th, background: `${region.color}09`, borderTop: "1.5px solid rgba(23,19,16,0.16)", pointerEvents: "none" }} />
                  <div style={{ position: "absolute", left: 0, right: 0, top: cy - 1, height: 2, background: region.color, opacity: 0.5, pointerEvents: "none" }} />
                  <div style={{ position: "absolute", left: 10, top: top + 8, zIndex: 1, background: region.color, color: "#fff", border: "2px solid var(--ink)", boxShadow: "2px 2px 0 var(--ink)", fontSize: 12, fontWeight: 900, padding: "2px 10px", pointerEvents: "none" }}>
                    {region.name}
                  </div>
                </div>
              );
            })}

            {/* 可動コンテンツ(時代帯・イベント・作品)。パン中はGPU変形のみで動く */}
            <div style={{ position: "absolute", left: 0, top: 0, width: 0, height: 0, transform: `translate3d(${tx}px, ${ty}px, 0)`, willChange: "transform" }}>
              {tlContent}
            </div>

            {/* コメント吹き出し(しっぽが該当作品の書影を指す) */}
            {bubbleLayout && (
              <div
                className={`map-voice ${bubbleLayout.placeAbove ? "above" : "below"}`}
                style={{ left: bubbleLayout.left, top: bubbleLayout.top, ["--tail-x" as string]: `${bubbleLayout.tailX}px` }}
              >
                <MiniBubble post={bubbleLayout.post} />
              </div>
            )}

            {/* ズームコントロール */}
            <div style={{ position: "absolute", right: 10, bottom: 10, display: "flex", flexDirection: "column", gap: 6, zIndex: 10 }}>
              <button className="chip" style={{ width: 38, height: 38, padding: 0, fontSize: 17 }} onClick={(e) => { e.stopPropagation(); zoomBy(1.5); }} onPointerDown={(e) => e.stopPropagation()}>＋</button>
              <button className="chip" style={{ width: 38, height: 38, padding: 0, fontSize: 17 }} onClick={(e) => { e.stopPropagation(); zoomBy(1 / 1.5); }} onPointerDown={(e) => e.stopPropagation()}>－</button>
              <button className="chip" style={{ width: 38, height: 38, padding: 0, fontSize: 10 }} onClick={(e) => { e.stopPropagation(); setView({ tx: 0, ty: 0, k: kFit }); }} onPointerDown={(e) => e.stopPropagation()}>全体</button>
            </div>
          </div>

          {/* ミニマップ(全期間ナビ: クリック/ドラッグで移動) */}
          <div
            className="tl-minimap"
            onPointerDown={(e) => {
              const bar = e.currentTarget.getBoundingClientRect();
              const jump = (clientX: number) => {
                const fx = Math.max(0, Math.min(1, (clientX - bar.left) / bar.width));
                setView((v) => {
                  const cur = v ?? { tx: 0, ty: 0, k: kFit };
                  return { ...cur, tx: cw / 2 - fx * TL_W * cur.k };
                });
              };
              jump(e.clientX);
              const move = (ev: PointerEvent) => jump(ev.clientX);
              const up = () => {
                window.removeEventListener("pointermove", move);
                window.removeEventListener("pointerup", up);
              };
              window.addEventListener("pointermove", move);
              window.addEventListener("pointerup", up);
            }}
          >
            {/* 架空ゾーン */}
            <div
              style={{
                position: "absolute",
                left: `${(FANTASY_X / TL_W) * 100}%`,
                right: 0,
                top: 0,
                bottom: 0,
                background: "repeating-linear-gradient(-45deg, rgba(219,39,119,0.12), rgba(219,39,119,0.12) 4px, transparent 4px, transparent 8px)",
              }}
            />
            {/* 作品の分布ドット */}
            {mmDots}
            {/* 現在の表示範囲 */}
            <div
              style={{
                position: "absolute",
                left: `${Math.max(0, ((-tx) / (TL_W * k)) * 100)}%`,
                width: `${Math.min(100, (cw / (TL_W * k)) * 100)}%`,
                top: 0,
                bottom: 0,
                border: "2px solid var(--accent)",
                background: "rgba(227,59,46,0.09)",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        {/* ===== サイドパネル ===== */}
        <aside style={{ flex: "0 1 320px", minWidth: 280 }}>
          {selected && selWork ? (
            <div className="spot-popup sheet-m">
              <button className="sheet-close" onClick={() => setSelected(null)} aria-label="閉じる">×</button>
              <h3>
                🕰️ {selected.label}
                <span style={{ display: "block", fontSize: 11, color: TL_REGIONS.find((r) => r.id === selected.region)?.color, marginTop: 2 }}>
                  {TL_REGIONS.find((r) => r.id === selected.region)?.name}のタイムライン
                </span>
              </h3>
              <div className="sw" style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: "0 0 56px" }}>
                  {coverThumb(meta, selWork.id) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={coverThumb(meta, selWork.id)!} alt={selWork.title} style={{ width: 56, height: 80, objectFit: "cover", border: "2px solid #171310", boxShadow: "2px 2px 0 #171310" }} />
                  ) : (
                    <div style={{ width: 56, height: 80, border: "2px solid #171310", display: "flex", alignItems: "center", justifyContent: "center", background: "#f1e9d6" }}>📖</div>
                  )}
                </div>
                <div style={{ minWidth: 0 }}>
                  <Link href={`/works/${selWork.id}`}>
                    <span className="t">
                      {selWork.title}
                      <span style={{ fontWeight: 400, fontSize: 11, color: "#4a4238" }}> ({selWork.year}年発表)</span>
                    </span>
                  </Link>
                  <span className="n">{selected.note}</span>
                  {amazonLink(meta, selWork.id) && (
                    <div style={{ marginTop: 6 }}>
                      <AmazonButton href={amazonLink(meta, selWork.id)} small />
                    </div>
                  )}
                </div>
              </div>
              {selPosts?.latest && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 900, marginBottom: 4 }}>💬 読者の声</div>
                  <Bubble
                    text={selPosts.latest.text}
                    bubble={selPosts.latest.bubble}
                    font={selPosts.latest.font}
                    user={selPosts.latest.user}
                    meta={<PostMeta type={selPosts.latest.type} date="" />}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="spot-popup" style={{ background: "#fdf6d8" }}>
              <h3>物語の中の時代で旅する</h3>
              <p style={{ fontSize: 13, lineHeight: 1.9, margin: 0 }}>
                紀元前の中国からヴァイキングの北欧、大正の東京、そして時間軸の外の異世界まで。
                <strong>発表年ではなく「物語の舞台の年代」</strong>で全人類史にマンガをマッピングしました。
                地域ごとのタイムラインから引き出し線で書影がつながっています。
                ズームすると密集した近現代もくっきり見えます。
              </p>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
