"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CATEGORIES, EDGES, GENRES, WORKS, catOf, genreById, type GenreNode } from "@/lib/data";
import { coverThumb } from "@/lib/affiliate";
import { useMeta } from "@/lib/useMeta";

/* スマホ用ジャンル系統図(神マップ方式)。
 * 描画はCanvas: SVGを巨大な合成レイヤーとして持つとiOSがGPUに載せきれず
 * パンのたびに再ラスタライズして激重になるため、毎フレーム自前で描く。
 * ノード47+エッジ60程度ならCanvasの再描画は1ms未満で、ズームしても文字が
 * ボケない。Reactは選択シートの表示だけを担当する。 */

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
const INK = "#171310";
const PAPER = "#f6f1e4";

const yOf = (g: GenreNode) => ((g.ly ?? g.year) - Y0) * YS + 70;
const xOf = (g: GenreNode) => 40 + (COL_OF[catOf(g).colX] ?? 0) * COL_W;

interface View {
  tx: number;
  ty: number;
  k: number;
}

export default function GenreTreeMobile({ onSwitchList }: { onSwitchList: () => void }) {
  const meta = useMeta();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const selectedRef = useRef<string | null>(null);

  // ノードの描画情報を先に計算しておく(毎フレームのオブジェクト生成を避ける)
  const nodes = useMemo(() => {
    const count: Record<string, number> = {};
    for (const w of WORKS) for (const g of w.genres) count[g] = (count[g] ?? 0) + 1;
    return GENRES.map((g) => {
      const n = count[g.id] ?? 0;
      return {
        id: g.id,
        x: xOf(g),
        y: yOf(g),
        r: n >= 6 ? 13 : n >= 3 ? 11 : n >= 1 ? 9 : 7,
        color: catOf(g).color,
        label: SHORT[g.id] ?? g.name,
      };
    });
  }, []);
  const edges = useMemo(
    () =>
      EDGES.flatMap((e) => {
        const a = genreById(e.from);
        const b = genreById(e.to);
        if (!a || !b) return [];
        return [{ x1: xOf(a), y1: yOf(a), x2: xOf(b), y2: yOf(b), kind: e.kind }];
      }),
    []
  );

  /* ---- 描画(Canvas)。Reactを一切通さない ---- */
  const viewRef = useRef<View>({ tx: 0, ty: 0, k: 0.94 });
  const rafId = useRef(0);

  const draw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const dpr = Math.min(3, window.devicePixelRatio || 1);
    const { tx, ty, k } = viewRef.current;
    const sel = selectedRef.current;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(k * dpr, 0, 0, k * dpr, tx * dpr, ty * dpr);

    // 可視範囲(ワールド座標)
    const vT = -ty / k - 30;
    const vB = (canvas.height / dpr - ty) / k + 30;

    // 十年紀ガイド
    ctx.strokeStyle = "rgba(23,19,16,0.09)";
    ctx.fillStyle = "rgba(23,19,16,0.35)";
    ctx.lineWidth = 1;
    ctx.font = "700 8.5px 'Zen Kaku Gothic New', sans-serif";
    ctx.textAlign = "left";
    ctx.setLineDash([4, 5]);
    for (let d = 1900; d <= 2020; d += 10) {
      const y = (d - Y0) * YS + 70;
      if (y < vT || y > vB) continue;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(TREE_W, y);
      ctx.stroke();
      ctx.fillText(String(d), 4, y - 4);
    }
    ctx.setLineDash([]);

    // エッジ
    for (const e of edges) {
      if (Math.max(e.y1, e.y2) < vT || Math.min(e.y1, e.y2) > vB) continue;
      const my = (e.y1 + e.y2) / 2;
      ctx.strokeStyle = e.kind === "counter" ? "rgba(230,83,42,0.55)" : e.kind === "influence" ? "rgba(23,19,16,0.3)" : "rgba(23,19,16,0.5)";
      ctx.lineWidth = e.kind === "evolution" ? 1.6 : 1.1;
      ctx.setLineDash(e.kind === "influence" ? [4, 4] : e.kind === "counter" ? [2, 3] : []);
      ctx.beginPath();
      ctx.moveTo(e.x1, e.y1);
      ctx.bezierCurveTo(e.x1, my, e.x2, my, e.x2, e.y2);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // ノード + ラベル
    ctx.textAlign = "center";
    for (const n of nodes) {
      if (n.y < vT || n.y > vB) continue;
      const on = sel === n.id;
      const dim = sel && !on;
      ctx.globalAlpha = dim ? 0.42 : 1;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = n.color;
      ctx.fill();
      ctx.lineWidth = on ? 3 : 1.8;
      ctx.strokeStyle = INK;
      ctx.stroke();
      if (on) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + 5, 0, Math.PI * 2);
        ctx.strokeStyle = n.color;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.7;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      // ラベル(白フチ文字)
      ctx.font = "800 9.5px 'Zen Kaku Gothic New', sans-serif";
      ctx.lineWidth = 3;
      ctx.strokeStyle = PAPER;
      ctx.lineJoin = "round";
      ctx.strokeText(n.label, n.x, n.y + n.r + 11);
      ctx.fillStyle = INK;
      ctx.fillText(n.label, n.x, n.y + n.r + 11);
    }
    ctx.globalAlpha = 1;
  };

  const scheduleDraw = () => {
    if (!rafId.current) {
      rafId.current = requestAnimationFrame(() => {
        rafId.current = 0;
        draw();
      });
    }
  };

  const pushView = (fn: (v: View) => View) => {
    viewRef.current = fn(viewRef.current);
    scheduleDraw();
  };

  // キャンバスのサイズ合わせ + 初期ビュー(戦後1946〜から)
  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const fit = () => {
      const dpr = Math.min(3, window.devicePixelRatio || 1);
      canvas.width = Math.round(wrap.clientWidth * dpr);
      canvas.height = Math.round(wrap.clientHeight * dpr);
      canvas.style.width = wrap.clientWidth + "px";
      canvas.style.height = wrap.clientHeight + "px";
      draw();
    };
    const k = Math.min(1.1, wrap.clientWidth / TREE_W);
    viewRef.current = { tx: (wrap.clientWidth - TREE_W * k) / 2, ty: -((1946 - Y0) * YS + 40) * k + 10, k };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);
    // フォント読込後に描き直し(ラベルのフォールバック字形を置き換える)
    document.fonts?.ready.then(() => draw()).catch(() => {});
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 選択が変わったら描き直し
  useEffect(() => {
    selectedRef.current = selected;
    scheduleDraw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  /* ---- パン & ピンチ & タップ ---- */
  const drag = useRef<{ x: number; y: number; tx: number; ty: number; moved: boolean } | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchDist = useRef<number | null>(null);
  const flyAnim = useRef(0);

  const onPointerDown = (e: React.PointerEvent) => {
    cancelAnimationFrame(flyAnim.current);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) {
      const vc = viewRef.current;
      drag.current = { x: e.clientX, y: e.clientY, tx: vc.tx, ty: vc.ty, moved: false };
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
    if (Math.abs(dx) + Math.abs(dy) > 3) d0.moved = true;
    const ntx = d0.tx + dx;
    const nty = d0.ty + dy;
    pushView((v) => ({ ...v, tx: ntx, ty: nty }));
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const wasTap = drag.current && !drag.current.moved && pointers.current.size === 1;
    pointers.current.delete(e.pointerId);
    pinchDist.current = null;
    drag.current = null;
    if (!wasTap) return;
    // タップ: ワールド座標で最寄りノードを判定
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const { tx, ty, k } = viewRef.current;
    const wx = (e.clientX - rect.left - tx) / k;
    const wy = (e.clientY - rect.top - ty) / k;
    let best: string | null = null;
    let bestD = 22; // タップ許容半径(ワールドpx)
    for (const n of nodes) {
      const d = Math.hypot(n.x - wx, n.y - wy);
      if (d < bestD) {
        bestD = d;
        best = n.id;
      }
    }
    setSelected((cur) => (best ? (cur === best ? null : best) : null));
  };

  // ノードへセンタリング(つながりタップ)。rAFでスーッと飛ぶ
  const flyTo = (id: string) => {
    const g = genreById(id);
    const el = wrapRef.current;
    if (!g || !el) return;
    setSelected(id);
    const from = { ...viewRef.current };
    const k = from.k;
    const to = { k, tx: el.clientWidth / 2 - xOf(g) * k, ty: el.clientHeight * 0.35 - yOf(g) * k };
    const t0 = performance.now();
    const DUR = 350;
    cancelAnimationFrame(flyAnim.current);
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / DUR);
      const e = 1 - Math.pow(1 - t, 3); // ease-out
      viewRef.current = {
        k,
        tx: from.tx + (to.tx - from.tx) * e,
        ty: from.ty + (to.ty - from.ty) * e,
      };
      draw();
      if (t < 1) flyAnim.current = requestAnimationFrame(step);
    };
    flyAnim.current = requestAnimationFrame(step);
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

  // 方向と種類で自然な日本語に
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
        <canvas ref={canvasRef} style={{ display: "block" }} />
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
