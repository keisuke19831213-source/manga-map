"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { TIMELINE, TL_REGIONS, workById, type TimelineEntry } from "@/lib/data";
import { amazonLink, coverSrc } from "@/lib/affiliate";
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
const TRACK_H = 152;
const FANTASY_X = tlX(2125);

function useWidth(ref: React.RefObject<HTMLDivElement | null>): number {
  const [w, setW] = useState(1000);
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

// トラック内のレーン割り当て(近い作品を上下・二段に散らして重なり回避)
function assignLanes(entries: { e: TimelineEntry; x: number }[], minGap: number): Map<string, number> {
  const lanes: number[] = [-Infinity, -Infinity, -Infinity, -Infinity]; // 上0,下0,上1,下1 の最後のx
  const result = new Map<string, number>();
  const sorted = [...entries].sort((a, b) => a.x - b.x);
  for (const item of sorted) {
    let lane = lanes.findIndex((last) => item.x - last >= minGap);
    if (lane === -1) lane = 0;
    lanes[lane] = item.x;
    result.set(item.e.workId, lane);
  }
  return result;
}

export default function EraTimeline() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const cw = useWidth(wrapRef);
  const meta = useMeta();
  const voices = useVoicesByWork();
  const [view, setView] = useState<{ tx: number; k: number } | null>(null);
  const [selected, setSelected] = useState<TimelineEntry | null>(null);
  const [voiceIdx, setVoiceIdx] = useState(0);
  const drag = useRef<{ x: number; tx: number; moved: boolean } | null>(null);

  const H = AXIS_H + TL_REGIONS.length * TRACK_H;
  const kFit = cw / TL_W;

  // 初期表示: 全期間フィット
  useEffect(() => {
    if (cw > 0 && !view) setView({ tx: 0, k: cw / TL_W });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cw]);

  const k = view?.k ?? kFit;
  const tx = view?.tx ?? 0;
  const X = (year: number) => tlX(year) * k + tx;

  // ホイールズーム(横方向)
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      setView((v) => {
        const cur = v ?? { tx: 0, k: el.clientWidth / TL_W };
        const kMin = (el.clientWidth / TL_W) * 0.9;
        const nk = Math.min(kMin * 60, Math.max(kMin, cur.k * Math.exp(-e.deltaY * 0.0016)));
        return { k: nk, tx: mx - ((mx - cur.tx) * nk) / cur.k };
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const zoomBy = (factor: number) => {
    const mx = cw / 2;
    setView((v) => {
      const cur = v ?? { tx: 0, k: kFit };
      const kMin = kFit * 0.9;
      const nk = Math.min(kMin * 60, Math.max(kMin, cur.k * factor));
      return { k: nk, tx: mx - ((mx - cur.tx) * nk) / cur.k };
    });
  };

  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchDist = useRef<number | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) {
      drag.current = { x: e.clientX, tx, moved: false };
    } else {
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
        setView((v) => {
          const cur = v ?? { tx: 0, k: kFit };
          const kMin = kFit * 0.9;
          const nk = Math.min(kMin * 60, Math.max(kMin, cur.k * factor));
          return { k: nk, tx: mx - ((mx - cur.tx) * nk) / cur.k };
        });
      }
      pinchDist.current = d;
      return;
    }
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    if (Math.abs(dx) > 3) drag.current.moved = true;
    const ntx = drag.current.tx + dx;
    setView((v) => ({ k: v?.k ?? kFit, tx: ntx }));
  };
  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    pinchDist.current = null;
    drag.current = null;
  };

  // 地域ごとのエントリ + レーン
  const trackData = useMemo(() => {
    return TL_REGIONS.map((region, ti) => {
      const entries = TIMELINE.filter((e) => e.region === region.id).map((e) => ({ e, x: X(e.year) }));
      const lanes = assignLanes(entries, 56);
      return { region, ti, entries, lanes };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [k, tx, cw]);

  // コメントのある作品(吹き出しローテーション)
  const voiceEntries = useMemo(() => TIMELINE.filter((e) => voices[e.workId]?.latest), [voices]);
  useEffect(() => {
    if (voiceEntries.length < 2) return;
    const t = setInterval(() => setVoiceIdx((i) => (i + 1) % voiceEntries.length), 6500);
    return () => clearInterval(t);
  }, [voiceEntries.length]);
  const bubbleEntry =
    selected && voices[selected.workId]?.latest ? selected : voiceEntries.length > 0 ? voiceEntries[voiceIdx % voiceEntries.length] : null;

  const laneOffset = (lane: number): { above: boolean; dist: number } => {
    // 0:上近 1:下近 2:上遠 3:下遠
    const above = lane % 2 === 0;
    const dist = lane < 2 ? 12 : 66;
    return { above, dist };
  };

  const selWork = selected ? workById(selected.workId) : null;
  const selPosts = selected ? (voices[selected.workId]?.count ? voices[selected.workId] : null) : null;

  return (
    <>
      <div className="filter-row" style={{ marginBottom: 14 }}>
        <span style={{ fontSize: 11.5, color: "var(--ink-soft)", alignSelf: "center", fontWeight: 700 }}>
          横にドラッグで移動 / ホイール・ボタンで時間軸をズーム / 書影クリックで詳細
        </span>
      </div>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* ===== タイムライン本体 ===== */}
        <div style={{ flex: "1 1 560px", minWidth: 340 }}>
          <div
            ref={wrapRef}
            className="atlas-wrap"
            style={{ position: "relative", overflow: "hidden", height: H, cursor: drag.current ? "grabbing" : "grab", touchAction: "none", background: "#f4efe2" }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
            onDoubleClick={() => zoomBy(1.7)}
          >
            {/* 架空ゾーンの背景 */}
            <div
              style={{
                position: "absolute",
                left: FANTASY_X * k + tx,
                top: 0,
                width: Math.max(0, (TL_W - FANTASY_X) * k),
                height: H,
                background: "repeating-linear-gradient(-45deg, rgba(219,39,119,0.05), rgba(219,39,119,0.05) 8px, transparent 8px, transparent 16px)",
                borderLeft: "2px dashed #db277788",
              }}
            />

            {/* 年目盛り */}
            {TICKS.map((t) => {
              const x = X(t.year);
              if (x < -40 || x > cw + 40) return null;
              return (
                <div key={t.year} style={{ position: "absolute", left: x, top: 0, height: H, pointerEvents: "none" }}>
                  <div style={{ width: 1.5, height: "100%", background: "rgba(23,19,16,0.1)" }} />
                  <div style={{ position: "absolute", top: 6, left: 4, fontSize: 11, fontWeight: 900, color: "rgba(23,19,16,0.45)" }}>{t.label}</div>
                </div>
              );
            })}
            {/* 架空ゾーンラベル */}
            <div style={{ position: "absolute", left: FANTASY_X * k + tx + 10, top: 6, fontSize: 11, fontWeight: 900, color: "#db2777", pointerEvents: "none" }}>
              ⟵ここから先は時間軸の外(架空・異世界)
            </div>

            {/* トラック */}
            {trackData.map(({ region, ti, entries, lanes }) => {
              const top = AXIS_H + ti * TRACK_H;
              const cy = top + TRACK_H / 2;
              return (
                <div key={region.id}>
                  {/* 帯の背景と境界 */}
                  <div style={{ position: "absolute", left: 0, right: 0, top, height: TRACK_H, background: ti % 2 ? "rgba(23,19,16,0.025)" : "transparent", borderTop: "1.5px solid rgba(23,19,16,0.14)", pointerEvents: "none" }} />
                  {/* 日本トラックの時代帯 */}
                  {region.id === "japan" &&
                    JP_ERAS.map((era) => {
                      const x0 = X(era.from);
                      const x1 = X(era.to);
                      if (x1 < 0 || x0 > cw) return null;
                      return (
                        <div key={era.name} style={{ position: "absolute", left: x0, top: top + 2, width: x1 - x0, height: TRACK_H - 4, background: "rgba(212,61,46,0.055)", borderLeft: "1px solid rgba(212,61,46,0.3)", pointerEvents: "none" }}>
                          {x1 - x0 > 34 && (
                            <span style={{ position: "absolute", top: 2, left: 4, fontSize: 10, fontWeight: 900, color: "rgba(212,61,46,0.65)" }}>{era.name}</span>
                          )}
                        </div>
                      );
                    })}
                  {/* 中心線 */}
                  <div style={{ position: "absolute", left: 0, right: 0, top: cy - 1, height: 2, background: region.color, opacity: 0.5, pointerEvents: "none" }} />
                  {/* 歴史イベント(道しるべ) */}
                  {EVENTS.filter((ev) => ev.region === region.id).map((ev) => {
                    const ex = X(ev.year);
                    if (ex < -60 || ex > cw + 60) return null;
                    return (
                      <div key={ev.label} style={{ position: "absolute", left: ex, top: cy, zIndex: 1, pointerEvents: "none" }}>
                        <div style={{ position: "absolute", left: -4, top: -4, width: 8, height: 8, background: "#fff", border: `2px solid ${region.color}`, transform: "rotate(45deg)" }} />
                        <div style={{ position: "absolute", left: 7, top: 4, fontSize: 9.5, fontWeight: 700, color: "rgba(23,19,16,0.55)", whiteSpace: "nowrap" }}>
                          {ev.label}
                        </div>
                      </div>
                    );
                  })}
                  {/* 地域ラベル(固定) */}
                  <div
                    style={{
                      position: "absolute",
                      left: 10,
                      top: top + 8,
                      zIndex: 6,
                      background: region.color,
                      color: "#fff",
                      border: "2px solid var(--ink)",
                      boxShadow: "2px 2px 0 var(--ink)",
                      fontSize: 12,
                      fontWeight: 900,
                      padding: "2px 10px",
                      pointerEvents: "none",
                    }}
                  >
                    {region.name}
                  </div>

                  {/* 作品(書影 + 引き出し線) */}
                  {entries.map(({ e, x }) => {
                    if (x < -70 || x > cw + 70) return null;
                    const wk = workById(e.workId);
                    if (!wk) return null;
                    const lane = lanes.get(e.workId) ?? 0;
                    const { above, dist } = laneOffset(lane);
                    const cover = coverSrc(meta, wk.id);
                    const active = selected?.workId === e.workId && selected.region === e.region;
                    const coverH = 56;
                    const pinTop = above ? cy - dist - coverH : cy + dist;
                    return (
                      <div key={e.workId}>
                        {/* 引き出し線 */}
                        <div style={{ position: "absolute", left: x - 1, top: above ? pinTop + coverH - 2 : cy, width: 2, height: above ? cy - (pinTop + coverH) + 2 : pinTop - cy + 2, background: region.color, pointerEvents: "none" }} />
                        <div style={{ position: "absolute", left: x - 3.5, top: cy - 3.5, width: 7, height: 7, borderRadius: "50%", background: region.color, border: "1.5px solid var(--ink)", pointerEvents: "none" }} />
                        <div
                          className={`map-pin ${active ? "on" : ""}`}
                          style={{ left: x, top: pinTop + coverH, zIndex: active ? 8 : 5 }}
                          onClick={(ev) => {
                            ev.stopPropagation();
                            if (drag.current?.moved) return;
                            setSelected(active ? null : e);
                          }}
                          title={`${wk.title} — ${e.label}`}
                        >
                          <div className="map-pin-card">
                            {cover ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={cover} alt={wk.title} loading="lazy" style={{ width: 36, height: 52 }} />
                            ) : (
                              <span className="ph" style={{ width: 36, height: 52 }}>📖</span>
                            )}
                          </div>
                          <div className="map-pin-label" style={{ bottom: -18 }}>{wk.title}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {/* コメント吹き出し(該当作品の書影を指す) */}
            {bubbleEntry &&
              (() => {
                const x = X(bubbleEntry.year);
                if (x < 0 || x > cw) return null;
                const post = voices[bubbleEntry.workId]?.latest;
                if (!post) return null;
                const ti = TL_REGIONS.findIndex((r) => r.id === bubbleEntry.region);
                const cy = AXIS_H + ti * TRACK_H + TRACK_H / 2;
                const flip = x > cw - 240;
                return (
                  <div className="map-voice" style={{ left: flip ? x - 190 : x - 24, top: cy - 78 }}>
                    <MiniBubble post={post} style={{ marginTop: 0, width: 212 }} />
                  </div>
                );
              })()}

            {/* ズームコントロール */}
            <div style={{ position: "absolute", right: 10, bottom: 10, display: "flex", flexDirection: "column", gap: 6, zIndex: 10 }}>
              <button className="chip" style={{ width: 38, height: 38, padding: 0, fontSize: 17 }} onClick={(e) => { e.stopPropagation(); zoomBy(1.5); }} onPointerDown={(e) => e.stopPropagation()}>＋</button>
              <button className="chip" style={{ width: 38, height: 38, padding: 0, fontSize: 17 }} onClick={(e) => { e.stopPropagation(); zoomBy(1 / 1.5); }} onPointerDown={(e) => e.stopPropagation()}>－</button>
              <button className="chip" style={{ width: 38, height: 38, padding: 0, fontSize: 10 }} onClick={(e) => { e.stopPropagation(); setView({ tx: 0, k: kFit }); }} onPointerDown={(e) => e.stopPropagation()}>全体</button>
            </div>
          </div>
        </div>

        {/* ===== サイドパネル ===== */}
        <aside style={{ flex: "0 1 320px", minWidth: 280 }}>
          {selected && selWork ? (
            <div className="spot-popup">
              <h3>
                🕰️ {selected.label}
                <span style={{ display: "block", fontSize: 11, color: TL_REGIONS.find((r) => r.id === selected.region)?.color, marginTop: 2 }}>
                  {TL_REGIONS.find((r) => r.id === selected.region)?.name}のタイムライン
                </span>
              </h3>
              <div className="sw" style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: "0 0 56px" }}>
                  {coverSrc(meta, selWork.id) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={coverSrc(meta, selWork.id)!} alt={selWork.title} style={{ width: 56, height: 80, objectFit: "cover", border: "2px solid #171310", boxShadow: "2px 2px 0 #171310" }} />
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
