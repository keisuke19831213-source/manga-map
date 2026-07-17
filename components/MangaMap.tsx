"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  CATEGORIES,
  EDGES,
  GENRES,
  MAP_H,
  MAP_W,
  NODE_H,
  NODE_W,
  YEAR_MAX,
  YEAR_MIN,
  catOf,
  genreById,
  nodePos,
  yearToY,
  type CategoryId,
  type EdgeKind,
} from "@/lib/data";
import { amazonLink, coverThumb } from "@/lib/affiliate";
import { useMeta } from "@/lib/useMeta";
import { useAllPosts } from "@/lib/usePosts";
import { useWorks } from "@/lib/useWorks";
import Cover, { AmazonButton } from "@/components/Cover";
import MiniBubble from "@/components/MiniBubble";

const EDGE_STYLE: Record<EdgeKind, { dash?: string; label: string; opacity: number }> = {
  evolution: { label: "直系の進化", opacity: 0.75 },
  influence: { dash: "6 5", label: "影響", opacity: 0.5 },
  counter: { dash: "2 4", label: "対抗・反発", opacity: 0.8 },
};

export default function MangaMap() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState({ tx: 0, ty: 0, k: 0.8 });
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
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [activeCats, setActiveCats] = useState<Set<CategoryId>>(new Set());
  const drag = useRef<{ x: number; y: number; tx: number; ty: number; moved: boolean } | null>(null);
  const meta = useMeta();
  const posts = useAllPosts();
  const { works: allWorks } = useWorks();
  const [voiceIdx, setVoiceIdx] = useState(0);
  const voicePosts = useMemo(() => posts.filter((p) => p.workId).slice(0, 6), [posts]);

  // 最新の読者の声をローテーション表示
  useEffect(() => {
    if (voicePosts.length < 2) return;
    const t = setInterval(() => setVoiceIdx((i) => (i + 1) % voicePosts.length), 6000);
    return () => clearInterval(t);
  }, [voicePosts.length]);

  // 初期表示: PCは横幅フィット、モバイルは源流の列を読めるズームで
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    if (el.clientWidth < 700) {
      const k = 0.52;
      setView({ tx: el.clientWidth / 2 - 720 * k, ty: 12, k });
    } else {
      const k = Math.min(el.clientWidth / MAP_W, 1);
      setView({ tx: (el.clientWidth - MAP_W * k) / 2, ty: 12, k });
    }
  }, []);

  // ホイールズーム(カーソル位置基準)。preventDefaultのためpassive:falseで登録
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      pushView((v) => {
        const factor = Math.exp(-e.deltaY * 0.0015);
        const k = Math.min(3, Math.max(0.25, v.k * factor));
        const scale = k / v.k;
        return {
          k,
          tx: mx - (mx - v.tx) * scale,
          ty: my - (my - v.ty) * scale,
        };
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchDist = useRef<number | null>(null);

  const captured = useRef(false);
  const captureNow = (e: React.PointerEvent) => {
    // キャプチャはドラッグ開始後にだけ取得する。
    // pointerdown時点で取得すると click がキャプチャ先へ流れ、ノードのクリックが死ぬ
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
      captureNow(e); // ピンチは即キャプチャ(クリック不要)
      drag.current = null;
      pinchDist.current = null;
    }
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];
    if (pts.length >= 2) {
      // ピンチズーム(2本指の中点基準)
      const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const rect = wrapRef.current?.getBoundingClientRect();
      if (!rect) return;
      const mx = (pts[0].x + pts[1].x) / 2 - rect.left;
      const my = (pts[0].y + pts[1].y) / 2 - rect.top;
      if (pinchDist.current) {
        const factor = d / pinchDist.current;
        pushView((v) => {
          const k = Math.min(3, Math.max(0.25, v.k * factor));
          const s = k / v.k;
          return { k, tx: mx - (mx - v.tx) * s, ty: my - (my - v.ty) * s };
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
      captureNow(e); // ここで初めてキャプチャ(以降のドラッグを追従)
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

  const focusId = hovered ?? selected;
  const neighborIds = useMemo(() => {
    if (!focusId) return null;
    const s = new Set<string>([focusId]);
    for (const e of EDGES) {
      if (e.from === focusId) s.add(e.to);
      if (e.to === focusId) s.add(e.from);
    }
    return s;
  }, [focusId]);

  const catVisible = (c: CategoryId) => activeCats.size === 0 || activeCats.has(c);

  const nodeDim = (id: string, cat: CategoryId) => {
    if (!catVisible(cat)) return true;
    if (neighborIds && !neighborIds.has(id)) return true;
    return false;
  };

  const selectedGenre = selected ? genreById(selected) : null;

  const decades: number[] = [];
  for (let y = 1900; y <= 2020; y += 10) decades.push(y);

  // 静的レイヤー(年代帯・エッジ・ノード・見出し)をメモ化。
  // ドラッグ/ズーム中の毎フレーム再構築を避け、モバイルでも滑らかに動かす
  const mapLayers = useMemo(
    () => (
      <>
            {/* 年代の帯 */}
            {decades.map((d) => (
              <g key={d}>
                <line x1={0} y1={yearToY(d)} x2={MAP_W} y2={yearToY(d)} stroke="#17131022" strokeWidth={1.5} strokeDasharray="8 6" />
                <text x={10} y={yearToY(d) - 6} fill="#17131055" fontSize={16} fontWeight={900}>
                  {d}s
                </text>
              </g>
            ))}

            {/* エッジ */}
            {EDGES.map((e, i) => {
              const from = genreById(e.from)!;
              const to = genreById(e.to)!;
              const p1 = nodePos(from);
              const p2 = nodePos(to);
              const x1 = p1.x;
              const y1 = p1.y + NODE_H / 2;
              const x2 = p2.x;
              const y2 = p2.y - NODE_H / 2;
              const midY = (y1 + y2) / 2;
              const style = EDGE_STYLE[e.kind];
              const fromCat = catOf(from);
              const isFocused = focusId !== null && (e.from === focusId || e.to === focusId);
              const dimmed =
                (neighborIds && !isFocused) ||
                !catVisible(from.cat) ||
                !catVisible(to.cat);
              const stroke = e.kind === "counter" ? "#dc2626" : fromCat.color;
              return (
                <path
                  key={i}
                  d={`M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`}
                  fill="none"
                  stroke={stroke}
                  strokeWidth={isFocused ? 3 : 1.8}
                  strokeDasharray={style.dash}
                  opacity={dimmed ? 0.05 : isFocused ? 1 : style.opacity * 0.8}
                />
              );
            })}

            {/* ノード */}
            {GENRES.map((g) => {
              const { x, y } = nodePos(g);
              const cat = catOf(g);
              const dimmed = nodeDim(g.id, g.cat);
              const isSel = selected === g.id;
              return (
                <g
                  key={g.id}
                  transform={`translate(${x - NODE_W / 2},${y - NODE_H / 2})`}
                  opacity={dimmed ? 0.15 : 1}
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHovered(g.id)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => {
                    if (drag.current?.moved) return;
                    setSelected((s) => (s === g.id ? null : g.id));
                  }}
                >
                  <rect
                    x={3}
                    y={3}
                    width={NODE_W}
                    height={NODE_H}
                    rx={7}
                    fill="#171310"
                    opacity={isSel ? 1 : 0.9}
                  />
                  <rect
                    width={NODE_W}
                    height={NODE_H}
                    rx={7}
                    fill={isSel ? cat.color : "#ffffff"}
                    stroke="#171310"
                    strokeWidth={2.5}
                  />
                  <text
                    x={NODE_W / 2}
                    y={20}
                    textAnchor="middle"
                    fill={isSel ? "#ffffff" : "#171310"}
                    fontSize={13}
                    fontWeight={800}
                  >
                    {g.name}
                  </text>
                  <text
                    x={NODE_W / 2}
                    y={37}
                    textAnchor="middle"
                    fill={isSel ? "#ffffffcc" : "#6b6257"}
                    fontSize={10.5}
                  >
                    {g.year} · {g.en}
                  </text>
                </g>
              );
            })}

            {/* カテゴリ見出し(マップ上端) */}
            {CATEGORIES.filter((c) => c.id !== "gag").map((c) => (
              <text
                key={c.id}
                x={c.colX}
                y={52}
                textAnchor="middle"
                fill={c.color}
                fontSize={17}
                fontWeight={800}
                letterSpacing={2}
              >
                {c.id === "roots" ? "源流 → ギャグ" : c.name}
              </text>
            ))}
      </>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [focusId, neighborIds, activeCats, selected]
  );

  return (
    <div className="gm-wrap">
      {/* カテゴリフィルタ */}
      <div className="gm-filters">
        {CATEGORIES.filter((c) => c.id !== "roots").concat(CATEGORIES.filter((c) => c.id === "roots")).map((c) => {
          const active = activeCats.has(c.id);
          return (
            <button
              key={c.id}
              className={`chip ${active ? "active" : ""}`}
              style={active ? { background: c.color, borderColor: c.color } : { borderColor: c.color + "88" }}
              onClick={() =>
                setActiveCats((prev) => {
                  const next = new Set(prev);
                  if (next.has(c.id)) next.delete(c.id);
                  else next.add(c.id);
                  return next;
                })
              }
            >
              {c.name}
            </button>
          );
        })}
      </div>

      {/* ズームコントロール */}
      <div style={{ position: "absolute", bottom: 18, left: 12, zIndex: 10, display: "flex", flexDirection: "column", gap: 6 }}>
        {[
          { label: "＋", f: 1.35 },
          { label: "－", f: 1 / 1.35 },
        ].map((b) => (
          <button
            key={b.label}
            className="chip"
            style={{ width: 40, height: 40, fontSize: 17, padding: 0 }}
            onClick={() => {
              const el = wrapRef.current;
              if (!el) return;
              const mx = el.clientWidth / 2;
              const my = el.clientHeight / 2;
              setView((v) => {
                const k = Math.min(3, Math.max(0.25, v.k * b.f));
                const scale = k / v.k;
                return { k, tx: mx - (mx - v.tx) * scale, ty: my - (my - v.ty) * scale };
              });
            }}
          >
            {b.label}
          </button>
        ))}
        <button
          className="chip"
          style={{ width: 40, height: 40, fontSize: 11, padding: 0 }}
          onClick={() => {
            const el = wrapRef.current;
            if (!el) return;
            const k = Math.min(el.clientWidth / MAP_W, 1);
            setView({ tx: (el.clientWidth - MAP_W * k) / 2, ty: 12, k });
          }}
        >
          全体
        </button>
      </div>

      {/* 凡例 */}
      <div
        className="gm-legend"
        style={{
          position: "absolute",
          bottom: 18,
          left: 64,
          zIndex: 10,
          background: "#fff",
          border: "3px solid #171310",
          boxShadow: "4px 4px 0 #171310",
          padding: "10px 14px",
          fontSize: 11.5,
          color: "#4a4238",
          fontWeight: 700,
          lineHeight: 2,
        }}
      >
        <div><svg width="34" height="8"><line x1="0" y1="4" x2="34" y2="4" stroke="#171310" strokeWidth="2.5" /></svg> 直系の進化</div>
        <div><svg width="34" height="8"><line x1="0" y1="4" x2="34" y2="4" stroke="#171310" strokeWidth="2.5" strokeDasharray="6 5" /></svg> 影響を与えた</div>
        <div><svg width="34" height="8"><line x1="0" y1="4" x2="34" y2="4" stroke="#dc2626" strokeWidth="2.5" strokeDasharray="2 4" /></svg> 対抗・反発から誕生</div>
      </div>

      {/* マップ本体 */}
      <div
        ref={wrapRef}
        style={{ width: "100%", height: "100%", cursor: drag.current ? "grabbing" : "grab", touchAction: "none" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
            onPointerCancel={onPointerUp}
      >
        <svg width="100%" height="100%" style={{ display: "block" }}>
          <g transform={`translate(${view.tx},${view.ty}) scale(${view.k})`}>
            {mapLayers}
          </g>
        </svg>
      </div>

      {/* 詳細パネル(モバイルではボトムシート) */}
      {selectedGenre && (
        <aside
          className="gm-panel"
          style={{
            background: "#ffffff",
            border: "3px solid #171310",
            borderTop: `10px solid ${catOf(selectedGenre).color}`,
            boxShadow: "5px 5px 0 #171310",
            padding: "18px 20px",
          }}
        >
          <button
            onClick={() => setSelected(null)}
            style={{ position: "absolute", top: 10, right: 12, background: "none", border: "none", color: "#6b6257", fontSize: 20, fontWeight: 900, cursor: "pointer" }}
            aria-label="閉じる"
          >
            ×
          </button>
          <div style={{ fontSize: 11.5, fontWeight: 800, color: catOf(selectedGenre).color, letterSpacing: 1 }}>
            {catOf(selectedGenre).name} · {selectedGenre.year}年頃〜
          </div>
          <h2 style={{ margin: "4px 0 2px", fontSize: 22, fontFamily: "var(--font-base)", fontWeight: 900 }}>{selectedGenre.name}</h2>
          <div style={{ fontSize: 12, color: "#6b6257", fontWeight: 700, marginBottom: 12 }}>{selectedGenre.en}</div>
          <p style={{ fontSize: 13, lineHeight: 1.9, color: "#4a4238" }}>{selectedGenre.desc}</p>

          {(() => {
            const works = allWorks
              .filter((w) => w.genres.includes(selectedGenre.id))
              .sort((a, b) => a.year - b.year);
            if (works.length === 0) return null;
            return (
              <>
                <h3 style={{ fontSize: 13.5, margin: "18px 0 8px" }}>代表作品</h3>
                {works.map((w) => {
                  const az = amazonLink(meta, w.id);
                  return (
                    <div
                      key={w.id}
                      style={{
                        display: "flex",
                        gap: 10,
                        background: "var(--paper)",
                        border: "2px solid #171310",
                        boxShadow: "2px 2px 0 #171310",
                        padding: "8px 12px",
                        marginBottom: 8,
                        fontSize: 13,
                      }}
                    >
                      <Cover src={coverThumb(meta, w.id)} title={w.title} width={42} />
                      <div style={{ minWidth: 0 }}>
                        <Link href={`/works/${w.id}`} style={{ display: "block" }}>
                          <strong>{w.title}</strong>
                          <span style={{ color: "#6b6257", fontSize: 11.5 }}> — {w.author} ({w.year})</span>
                        </Link>
                        {az && (
                          <div style={{ marginTop: 4 }}>
                            <AmazonButton href={az} small />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </>
            );
          })()}

          {(() => {
            const inbound = EDGES.filter((e) => e.to === selectedGenre.id);
            const outbound = EDGES.filter((e) => e.from === selectedGenre.id);
            const renderList = (list: typeof EDGES, dir: "in" | "out") =>
              list.map((e, i) => {
                const other = genreById(dir === "in" ? e.from : e.to)!;
                return (
                  <button
                    key={i}
                    onClick={() => setSelected(other.id)}
                    style={{
                      display: "inline-block",
                      margin: "0 6px 8px 0",
                      background: "#fff",
                      border: `2px solid ${catOf(other).color}`,
                      color: "#171310",
                      fontWeight: 700,
                      borderRadius: 999,
                      padding: "4px 12px",
                      fontSize: 12,
                      cursor: "pointer",
                      fontFamily: "var(--font-base)",
                    }}
                  >
                    {other.name}
                    <span style={{ color: "#6b6257", fontSize: 10.5 }}> · {EDGE_STYLE[e.kind].label}</span>
                  </button>
                );
              });
            return (
              <>
                {inbound.length > 0 && (
                  <>
                    <h3 style={{ fontSize: 13.5, margin: "18px 0 8px" }}>ルーツ(ここから生まれた)</h3>
                    <div>{renderList(inbound, "in")}</div>
                  </>
                )}
                {outbound.length > 0 && (
                  <>
                    <h3 style={{ fontSize: 13.5, margin: "18px 0 8px" }}>その後の展開(ここへ繋がる)</h3>
                    <div>{renderList(outbound, "out")}</div>
                  </>
                )}
              </>
            );
          })()}
        </aside>
      )}

      {/* イントロ(未選択時) */}
      {!selectedGenre && (
        <div
          className="gm-intro"
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 10,
            width: 300,
            background: "#ffffff",
            border: "3px solid #171310",
            boxShadow: "5px 5px 0 #171310",
            padding: "16px 18px",
            fontSize: 12.5,
            lineHeight: 1.9,
            color: "#4a4238",
          }}
        >
          <strong style={{ color: "#171310", fontSize: 15, fontFamily: "var(--font-pop)" }}>マンガの系統樹へようこそ</strong>
          <br />
          上が1900年、下が現在。ノード(ジャンル)をクリックすると解説と代表作が出ます。線はジャンル同士の影響関係。ドラッグで移動、ホイールで拡大縮小。
        </div>
      )}

      {/* 最新の読者の声(吹き出しローテーション) */}
      {!selectedGenre && voicePosts.length > 0 && (() => {
        const p = voicePosts[voiceIdx % voicePosts.length];
        const w = p.workId ? allWorks.find((x) => x.id === p.workId) : undefined;
        if (!w) return null;
        return (
          <Link href={`/works/${w.id}`} className="gm-voice">
            <div
              style={{
                fontSize: 11,
                fontWeight: 900,
                marginBottom: 2,
                paddingLeft: 6,
                color: "var(--ink-soft, #4a4238)",
              }}
            >
              💬 読者の声 — 『{w.title}』
            </div>
            <MiniBubble post={p} />
          </Link>
        );
      })()}
    </div>
  );
}
