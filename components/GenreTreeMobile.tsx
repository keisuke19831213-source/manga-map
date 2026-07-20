"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CATEGORIES, EDGES, GENRES, WORKS, catOf, genreById, type GenreNode } from "@/lib/data";
import { coverThumb } from "@/lib/affiliate";
import { useMeta } from "@/lib/useMeta";

/* スマホ用ジャンル系統図(神マップ方式)。
 * PCの箱型ノードはスマホでは読めないので、円ノード+外側ラベルにして
 * 樹形(どこから来てどこへ影響したか)そのものを小さな画面で見せる。
 * 縦=年代 / 横=カテゴリ列。パン+ピンチ、タップでボトムシート。 */

// 表示用の短縮名(ビュー都合なのでここで持つ)
const SHORT: Record<string, string> = {
  emaki: "絵巻",
  edo_giga: "江戸戯画",
  ponchi: "ポンチ絵",
  newspaper: "新聞連載",
  kodomo: "子ども",
  kamishibai: "紙芝居",
  akahon: "赤本",
  story: "ストーリー",
  kashihon: "貸本",
  gekkan: "月刊誌",
  weekly: "週刊誌",
  yokai: "妖怪",
  spokon: "スポ根",
  lovecome: "ラブコメ",
  jump_battle: "バトル",
  shonen_mystery: "ミステリ",
  dark_fantasy: "ダークF",
  isekai: "異世界",
  shojo_dawn: "少女黎明",
  kashihon_shojo: "貸本少女",
  year24: "24年組",
  shojo_romance: "少女恋愛",
  bl: "BL",
  ladies: "レディース",
  shojo_horror: "少女ホラー",
  battle_bishojo: "戦う美少女",
  gekiga: "劇画",
  seinen_mag: "青年誌",
  gekiga_jidai: "歴史劇画",
  seinen_sf: "SF",
  gourmet: "グルメ",
  business: "ビジネス",
  gamble: "ギャンブル",
  shakai: "社会派",
  akatsuka: "赤塚ギャグ",
  nonsense: "ナンセンス",
  yonkoma: "4コマ",
  fujori: "不条理",
  moe_yonkoma: "萌え4コマ",
  garo: "ガロ",
  com: "COM",
  newwave: "ニューウェーブ",
  subculture: "サブカル",
  essay: "エッセイ",
  webcomic: "Webマンガ",
  webtoon: "webtoon",
  sns: "SNS",
};

// PCのcolX(6列)→モバイル列インデックス
const COL_OF: Record<number, number> = { 170: 0, 445: 1, 720: 2, 995: 3, 1270: 4, 1500: 5 };
const COL_W = 62;
const TREE_W = 40 + 5 * COL_W + 44; // ≈394
const Y0 = 1893;
const YS = 10; // 1年=10px
const TREE_H = (2028 - Y0) * YS + 140;

const yOf = (g: GenreNode) => ((g.ly ?? g.year) - Y0) * YS + 70;
const xOf = (g: GenreNode) => 40 + (COL_OF[catOf(g).colX] ?? 0) * COL_W;

export default function GenreTreeMobile({ onSwitchList }: { onSwitchList: () => void }) {
  const meta = useMeta();
  const wrapRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<string | null>(null);

  /* パン/ピンチはReactを通さない(神マップが軽い理由)。
   * setStateを毎フレーム呼ぶとSVG全体をReactが毎フレーム再構築してしまうので、
   * 変形はrefで持ち、rAFでDOMのtransformに直接書く。Reactは選択状態だけを扱う */
  const viewRef = useRef({ tx: 0, ty: 0, k: 0.94 });
  const rafId = useRef(0);
  const applyView = () => {
    const el = innerRef.current;
    if (!el) return;
    const v = viewRef.current;
    el.style.transform = `translate3d(${v.tx}px, ${v.ty}px, 0) scale(${v.k})`;
  };
  const pushView = (fn: (v: { tx: number; ty: number; k: number }) => { tx: number; ty: number; k: number }) => {
    viewRef.current = fn(viewRef.current);
    if (!rafId.current) {
      rafId.current = requestAnimationFrame(() => {
        rafId.current = 0;
        applyView();
      });
    }
  };

  // 初期ビュー: 横は全列フィット、縦は戦後(1946〜)から
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const k = Math.min(1.1, el.clientWidth / TREE_W);
    viewRef.current = { tx: (el.clientWidth - TREE_W * k) / 2, ty: -((1946 - Y0) * YS + 40) * k + 10, k };
    applyView();
  }, []);

  // 代表作数でノード半径
  const sizeOf = useMemo(() => {
    const count: Record<string, number> = {};
    for (const w of WORKS) for (const g of w.genres) count[g] = (count[g] ?? 0) + 1;
    return (id: string) => {
      const n = count[id] ?? 0;
      return n >= 6 ? 13 : n >= 3 ? 11 : n >= 1 ? 9 : 7;
    };
  }, []);

  /* ---- パン & ピンチ(deferred capture: タップを殺さない) ---- */
  const drag = useRef<{ x: number; y: number; tx: number; ty: number; moved: boolean } | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchDist = useRef<number | null>(null);
  const captured = useRef(false);
  const captureNow = (e: React.PointerEvent) => {
    if (captured.current) return;
    try {
      (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
      captured.current = true;
    } catch {}
  };
  const onPointerDown = (e: React.PointerEvent) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) {
      const vc = viewRef.current;
      drag.current = { x: e.clientX, y: e.clientY, tx: vc.tx, ty: vc.ty, moved: false };
    } else {
      captureNow(e);
      drag.current = null;
      pinchDist.current = null;
    }
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];
    if (pts.length >= 2) {
      const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const rect = wrapRef.current?.getBoundingClientRect();
      if (!rect) return;
      const mx = (pts[0].x + pts[1].x) / 2 - rect.left;
      const my = (pts[0].y + pts[1].y) / 2 - rect.top;
      if (pinchDist.current) {
        const f = d / pinchDist.current;
        pushView((v) => {
          const k = Math.min(3, Math.max(0.5, v.k * f));
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
      captureNow(e);
    }
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

  // ノードへセンタリング(つながりタップで移動)。CSS transitionでスーッと飛ぶ
  const flyTo = (id: string) => {
    const g = genreById(id);
    const el = wrapRef.current;
    const inner = innerRef.current;
    if (!g || !el || !inner) return;
    setSelected(id);
    const k = viewRef.current.k;
    viewRef.current = {
      k,
      tx: el.clientWidth / 2 - xOf(g) * k,
      ty: el.clientHeight * 0.35 - yOf(g) * k,
    };
    inner.style.transition = "transform 0.35s ease-out";
    applyView();
    setTimeout(() => {
      if (innerRef.current) innerRef.current.style.transition = "";
    }, 380);
  };

  const sel = selected ? genreById(selected) : null;
  const selWorks = sel ? WORKS.filter((w) => w.genres.includes(sel.id)).slice(0, 4) : [];
  const selEdges = sel
    ? EDGES.filter((e) => e.from === sel.id || e.to === sel.id).map((e) => ({
        other: e.from === sel.id ? e.to : e.from,
        dir: e.from === sel.id ? "→" : "←",
        kind: e.kind,
      }))
    : [];
  // 方向と種類で自然な日本語に(「←対抗された」のような機械的表現を避ける)
  const edgeLabel = (dir: string, kind: string, name: string) => {
    if (dir === "→") {
      if (kind === "evolution") return <>進化して → <strong>{name}</strong></>;
      if (kind === "counter") return <>反発されて → <strong>{name}</strong> が誕生</>;
      return <>影響を与えた → <strong>{name}</strong></>;
    }
    if (kind === "evolution") return <><strong>{name}</strong> から進化</>;
    if (kind === "counter") return <><strong>{name}</strong> への反発から誕生</>;
    return <><strong>{name}</strong> の影響を受けた</>;
  };

  // 静的レイヤ(パン中に再構築しない)
  const staticLayer = useMemo(() => {
    return (
      <>
        {/* 十年紀ガイド */}
        {Array.from({ length: 13 }, (_, i) => 1900 + i * 10).map((d) => (
          <g key={d}>
            <line x1={0} y1={(d - Y0) * YS + 70} x2={TREE_W} y2={(d - Y0) * YS + 70} stroke="#17131018" strokeWidth={1} strokeDasharray="4 5" />
            <text x={4} y={(d - Y0) * YS + 66} fontSize={8.5} fontWeight={700} fill="#17131055">
              {d}
            </text>
          </g>
        ))}
        {/* エッジ */}
        {EDGES.map((e, i) => {
          const a = genreById(e.from);
          const b = genreById(e.to);
          if (!a || !b) return null;
          const x1 = xOf(a);
          const y1 = yOf(a);
          const x2 = xOf(b);
          const y2 = yOf(b);
          const my = (y1 + y2) / 2;
          const stroke = e.kind === "counter" ? "#e6532a" : "#171310";
          const dash = e.kind === "influence" ? "4 4" : e.kind === "counter" ? "2 3" : undefined;
          const op = e.kind === "evolution" ? 0.5 : 0.3;
          return (
            <path
              key={i}
              d={`M ${x1} ${y1} C ${x1} ${my}, ${x2} ${my}, ${x2} ${y2}`}
              fill="none"
              stroke={stroke}
              strokeWidth={e.kind === "evolution" ? 1.6 : 1.1}
              strokeDasharray={dash}
              opacity={op}
            />
          );
        })}
      </>
    );
  }, []);

  // ノード層もメモ化: パン中は再構築ゼロ、選択が変わった時だけ作り直す
  const nodesLayer = useMemo(() => {
    return GENRES.map((g) => {
      const x = xOf(g);
      const y = yOf(g);
      const c = catOf(g).color;
      const r = sizeOf(g.id);
      const on = selected === g.id;
      return (
        <g
          key={g.id}
          onClick={(ev) => {
            ev.stopPropagation();
            if (drag.current?.moved) return;
            setSelected(on ? null : g.id);
          }}
          style={{ cursor: "pointer" }}
        >
          {/* タップ領域を広げる透明円 */}
          <circle cx={x} cy={y} r={18} fill="transparent" />
          <circle cx={x} cy={y} r={r} fill={c} stroke="#171310" strokeWidth={on ? 3 : 1.8} opacity={selected && !on ? 0.45 : 1} />
          {on && <circle cx={x} cy={y} r={r + 5} fill="none" stroke={c} strokeWidth={1.5} opacity={0.6} />}
          <text
            x={x}
            y={y + r + 11}
            textAnchor="middle"
            fontSize={9.5}
            fontWeight={800}
            fill="#171310"
            opacity={selected && !on ? 0.4 : 1}
            style={{ paintOrder: "stroke", stroke: "#f6f1e4", strokeWidth: 3 }}
          >
            {SHORT[g.id] ?? g.name}
          </text>
        </g>
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, sizeOf]);

  return (
    <div className="gt-outer">
      {/* 凡例 + リスト切替 */}
      <div className="gt-legend">
        {CATEGORIES.filter((c, i, arr) => arr.findIndex((x) => x.name === c.name) === i).map((c) => (
          <span key={c.id} className="gt-cat">
            <i style={{ background: c.color }} />
            {c.name}
          </span>
        ))}
        <button className="gt-list-btn" onClick={onSwitchList}>
          ☰ リスト表示
        </button>
      </div>

      <div
        ref={wrapRef}
        className="gt-wrap"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div ref={innerRef} style={{ position: "absolute", left: 0, top: 0, transformOrigin: "0 0", willChange: "transform" }}>
          <svg width={TREE_W} height={TREE_H} style={{ display: "block", overflow: "visible" }}>
            {staticLayer}
            {nodesLayer}
          </svg>
        </div>

        <div className="gt-hint">ドラッグで移動 · ピンチで拡大 · ●をタップ</div>
      </div>

      {/* ボトムシート */}
      {sel && (
        <div className="gt-sheet" role="dialog" aria-label={sel.name}>
          <button className="sheet-close" onClick={() => setSelected(null)} aria-label="閉じる">
            ×
          </button>
          <div className="gt-sheet-cat" style={{ color: catOf(sel).color }}>
            {catOf(sel).name} · {sel.year}年頃〜
          </div>
          <h2>{sel.name}</h2>
          <p className="gt-sheet-desc">{sel.desc}</p>
          {selWorks.length > 0 && (
            <div className="gt-sheet-works">
              {selWorks.map((w) => (
                <Link key={w.id} href={`/works/${w.id}`} className="gt-w">
                  {coverThumb(meta, w.id) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={coverThumb(meta, w.id)!} alt={w.title} loading="lazy" />
                  ) : (
                    <span className="ph">📖</span>
                  )}
                  <span>{w.title}</span>
                </Link>
              ))}
            </div>
          )}
          {selEdges.length > 0 && (
            <div className="gt-sheet-edges">
              {selEdges.map((e, i) => {
                const other = genreById(e.other);
                if (!other) return null;
                return (
                  <button key={i} onClick={() => flyTo(e.other)}>
                    {edgeLabel(e.dir, e.kind, other.name)}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
