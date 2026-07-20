"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CATEGORIES, EDGES, GENRES, WORKS, catOf, genreById, type GenreNode } from "@/lib/data";
import { coverThumb } from "@/lib/affiliate";
import { useMeta } from "@/lib/useMeta";

/* スマホ用ジャンル系統図(神マップ方式・Canvas描画)。
 * 巨大SVGレイヤーはiOSで再ラスタライズ地獄になるため、毎フレーム自前で描く。
 * 気持ちよさの演出(すべてCanvasなので追加コストは微小):
 *  - フリックの慣性パン(減衰)
 *  - タップした●がバネで弾む + リングが広がる
 *  - 選択中はその系譜だけ色づき、破線が流れて影響の方向が見える
 *  - 初回はノードが年代順にポポポッと咲く(ブルーム)
 *  - マンガ風ハードシャドウ
 * アニメーションループは動きがある時だけ回す(省電力)。 */

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

const easeOutBack = (t: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

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
  const [sheetFull, setSheetFull] = useState(false); // シートは最初コンパクト(地図が主役)
  const selectedRef = useRef<string | null>(null);

  // ノード/エッジ/隣接を先に計算(毎フレームのオブジェクト生成を避ける)
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
        return [{ from: e.from, to: e.to, x1: xOf(a), y1: yOf(a), x2: xOf(b), y2: yOf(b), kind: e.kind }];
      }),
    []
  );
  const adjacency = useMemo(() => {
    const m = new Map<string, Set<string>>();
    for (const e of edges) {
      if (!m.has(e.from)) m.set(e.from, new Set());
      if (!m.has(e.to)) m.set(e.to, new Set());
      m.get(e.from)!.add(e.to);
      m.get(e.to)!.add(e.from);
    }
    return m;
  }, [edges]);

  /* ---- 描画エンジン(Reactを一切通さない) ---- */
  const viewRef = useRef<View>({ tx: 0, ty: 0, k: 0.94 });
  const bloomT0 = useRef(0); // 初回ブルーム開始時刻
  const pop = useRef<{ id: string; t0: number } | null>(null); // タップの弾み
  const vel = useRef<{ x: number; y: number } | null>(null); // 慣性速度(px/ms)
  const lastFrame = useRef(0);

  const draw = (now: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const dpr = Math.min(3, window.devicePixelRatio || 1);
    const { tx, ty, k } = viewRef.current;
    const sel = selectedRef.current;
    const neigh = sel ? adjacency.get(sel) : null;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(k * dpr, 0, 0, k * dpr, tx * dpr, ty * dpr);

    // 可視範囲(ワールド座標)
    const vT = -ty / k - 40;
    const vB = (canvas.height / dpr - ty) / k + 40;

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

    // エッジ(選択中はその系譜だけ色づき、破線が流れる)
    for (const e of edges) {
      if (Math.max(e.y1, e.y2) < vT || Math.min(e.y1, e.y2) > vB) continue;
      const hot = sel && (e.from === sel || e.to === sel);
      if (sel && !hot) {
        ctx.strokeStyle = "rgba(23,19,16,0.08)";
        ctx.lineWidth = 1;
        ctx.setLineDash([]);
      } else if (hot) {
        const selNode = nodes.find((n) => n.id === sel);
        ctx.strokeStyle = e.kind === "counter" ? "rgba(230,83,42,0.9)" : selNode?.color ?? INK;
        ctx.lineWidth = e.kind === "evolution" ? 2.4 : 1.8;
        // 流れる破線: from→to の向きに流れて影響の方向が見える
        ctx.setLineDash([7, 5]);
        ctx.lineDashOffset = -(now / 28) % 12;
      } else {
        ctx.strokeStyle = e.kind === "counter" ? "rgba(230,83,42,0.55)" : e.kind === "influence" ? "rgba(23,19,16,0.3)" : "rgba(23,19,16,0.5)";
        ctx.lineWidth = e.kind === "evolution" ? 1.6 : 1.1;
        ctx.setLineDash(e.kind === "influence" ? [4, 4] : e.kind === "counter" ? [2, 3] : []);
      }
      const my = (e.y1 + e.y2) / 2;
      ctx.beginPath();
      ctx.moveTo(e.x1, e.y1);
      ctx.bezierCurveTo(e.x1, my, e.x2, my, e.x2, e.y2);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;

    // ノード + ラベル
    const bloomP = bloomT0.current ? (now - bloomT0.current) / 1000 : 1; // 全体進行(秒)
    ctx.textAlign = "center";
    for (const n of nodes) {
      if (n.y < vT || n.y > vB) continue;
      const on = sel === n.id;
      const related = on || (neigh?.has(n.id) ?? false);
      const dim = sel && !related;

      // 初回ブルーム: 年代順(y座標)に遅延して咲く
      let s = 1;
      if (bloomP < 1.4) {
        const delay = (n.y / (YS * 140)) * 0.5; // 上から順に最大0.5s遅延
        s = Math.max(0, Math.min(1, (bloomP - delay) / 0.45));
        if (s <= 0) continue;
        s = easeOutBack(s);
      }
      // タップの弾み(バネ)
      if (pop.current?.id === n.id) {
        const t = (now - pop.current.t0) / 1000;
        if (t < 0.6) s *= 1 + 0.38 * Math.exp(-5 * t) * Math.sin(14 * t);
      }
      const r = n.r * s;

      ctx.globalAlpha = dim ? 0.2 : 1;
      // マンガ風ハードシャドウ
      ctx.beginPath();
      ctx.arc(n.x + 1.8, n.y + 2.4, r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(23,19,16,0.32)";
      ctx.fill();
      // 本体
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.fillStyle = n.color;
      ctx.fill();
      ctx.lineWidth = on ? 3 : 1.8;
      ctx.strokeStyle = INK;
      ctx.stroke();
      // 選択リング(2本、ふわっと広がって消える)
      if (on && pop.current?.id === n.id) {
        const t = (now - pop.current.t0) / 1000;
        for (const [d0, dur] of [
          [0, 0.7],
          [0.14, 0.7],
        ] as const) {
          const tt = (t - d0) / dur;
          if (tt > 0 && tt < 1) {
            const rp = r + 4 + tt * 40;
            ctx.beginPath();
            ctx.arc(n.x, n.y, rp, 0, Math.PI * 2);
            ctx.strokeStyle = n.color;
            ctx.lineWidth = 2.2;
            ctx.globalAlpha = (1 - tt) * 0.75;
            ctx.stroke();
          }
        }
        ctx.globalAlpha = dim ? 0.2 : 1;
      }
      // ラベル(白フチ文字)
      ctx.font = "800 9.5px 'Zen Kaku Gothic New', sans-serif";
      ctx.lineWidth = 3;
      ctx.strokeStyle = PAPER;
      ctx.lineJoin = "round";
      ctx.globalAlpha = dim ? 0.25 : Math.min(1, s);
      ctx.strokeText(n.label, n.x, n.y + n.r + 11);
      ctx.fillStyle = INK;
      ctx.fillText(n.label, n.x, n.y + n.r + 11);
    }
    ctx.globalAlpha = 1;
  };

  /* アニメーションループ: 動きがある時だけ回す */
  const loopId = useRef(0);
  const loopOn = useRef(false);
  const ensureLoop = () => {
    if (loopOn.current) return;
    loopOn.current = true;
    lastFrame.current = performance.now();
    const step = (now: number) => {
      const dt = Math.min(50, now - lastFrame.current);
      lastFrame.current = now;
      let active = false;

      // 慣性パン
      if (vel.current) {
        const v = vel.current;
        viewRef.current = { ...viewRef.current, tx: viewRef.current.tx + v.x * dt, ty: viewRef.current.ty + v.y * dt };
        const decay = Math.pow(0.93, dt / 16.7);
        v.x *= decay;
        v.y *= decay;
        if (Math.hypot(v.x, v.y) < 0.02) vel.current = null;
        else active = true;
      }
      if (bloomT0.current && now - bloomT0.current < 1400) active = true;
      if (pop.current && now - pop.current.t0 < 900) active = true;
      if (selectedRef.current) active = true; // 系譜の流れる破線

      draw(now);
      if (active) loopId.current = requestAnimationFrame(step);
      else loopOn.current = false;
    };
    loopId.current = requestAnimationFrame(step);
  };

  const rafOnce = useRef(0);
  const scheduleDraw = () => {
    if (loopOn.current) return; // ループが描いてくれる
    if (!rafOnce.current) {
      rafOnce.current = requestAnimationFrame((now) => {
        rafOnce.current = 0;
        draw(now);
      });
    }
  };

  const pushView = (fn: (v: View) => View) => {
    viewRef.current = fn(viewRef.current);
    scheduleDraw();
  };

  // キャンバスのサイズ合わせ + 初期ビュー + ブルーム開始
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
      scheduleDraw();
    };
    const k = Math.min(1.1, wrap.clientWidth / TREE_W);
    viewRef.current = { tx: (wrap.clientWidth - TREE_W * k) / 2, ty: -((1946 - Y0) * YS + 40) * k + 10, k };
    fit();
    // ブルームはマップが実際に画面へ入った瞬間に開始(見逃させない)
    let bloomed = false;
    const startBloom = () => {
      if (bloomed) return;
      bloomed = true;
      bloomT0.current = performance.now();
      ensureLoop();
    };
    let io: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        (es) => {
          if (es.some((x) => x.isIntersecting)) {
            startBloom();
            io?.disconnect();
          }
        },
        { threshold: 0.35 }
      );
      io.observe(wrap);
    } else {
      startBloom();
    }
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);
    document.fonts?.ready.then(() => scheduleDraw()).catch(() => {});
    return () => {
      io?.disconnect();
      ro.disconnect();
      cancelAnimationFrame(loopId.current);
      cancelAnimationFrame(rafOnce.current);
      loopOn.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 選択が変わったら描き直し(選択中はループが流れる破線を描き続ける)
  useEffect(() => {
    selectedRef.current = selected;
    if (selected) ensureLoop();
    else scheduleDraw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  /* ---- パン & ピンチ & タップ ---- */
  const drag = useRef<{ x: number; y: number; tx: number; ty: number; moved: boolean } | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchDist = useRef<number | null>(null);
  const flyAnim = useRef(0);
  const samples = useRef<{ t: number; x: number; y: number }[]>([]);
  const lastTap = useRef<{ t: number; x: number; y: number } | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    cancelAnimationFrame(flyAnim.current);
    vel.current = null; // 慣性中のタッチで停止
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) {
      const vc = viewRef.current;
      drag.current = { x: e.clientX, y: e.clientY, tx: vc.tx, ty: vc.ty, moved: false };
      samples.current = [{ t: performance.now(), x: e.clientX, y: e.clientY }];
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
    // 慣性用の速度サンプル(直近80msだけ保持)
    const now = performance.now();
    samples.current.push({ t: now, x: e.clientX, y: e.clientY });
    while (samples.current.length > 2 && now - samples.current[0].t > 80) samples.current.shift();
    const ntx = d0.tx + dx;
    const nty = d0.ty + dy;
    pushView((v) => ({ ...v, tx: ntx, ty: nty }));
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const wasTap = drag.current && !drag.current.moved && pointers.current.size === 1;
    const wasDrag = drag.current?.moved && pointers.current.size === 1;
    pointers.current.delete(e.pointerId);
    pinchDist.current = null;
    drag.current = null;

    if (wasDrag) {
      // フリックの慣性: 直近サンプルから速度を出す
      const s = samples.current;
      if (s.length >= 2) {
        const a = s[0];
        const b = s[s.length - 1];
        const dt = b.t - a.t;
        if (dt > 5) {
          const vx = (b.x - a.x) / dt;
          const vy = (b.y - a.y) / dt;
          if (Math.hypot(vx, vy) > 0.25) {
            vel.current = { x: vx, y: vy };
            ensureLoop();
          }
        }
      }
      return;
    }
    if (!wasTap) return;

    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const now = performance.now();

    // ダブルタップズーム(同じ場所を320ms以内に2度)
    if (lastTap.current && now - lastTap.current.t < 320 && Math.hypot(e.clientX - lastTap.current.x, e.clientY - lastTap.current.y) < 30) {
      lastTap.current = null;
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      zoomAt(mx, my, 1.7);
      return;
    }
    lastTap.current = { t: now, x: e.clientX, y: e.clientY };

    // タップ: ワールド座標で最寄りノードを判定
    const { tx, ty, k } = viewRef.current;
    const wx = (e.clientX - rect.left - tx) / k;
    const wy = (e.clientY - rect.top - ty) / k;
    let best: string | null = null;
    let bestD = 22;
    for (const n of nodes) {
      const d = Math.hypot(n.x - wx, n.y - wy);
      if (d < bestD) {
        bestD = d;
        best = n.id;
      }
    }
    if (best) {
      pop.current = { id: best, t0: now };
      ensureLoop();
    }
    setSheetFull(false);
    setSelected((cur) => {
      const next = best ? (cur === best ? null : best) : null;
      // 新しく選んだ時: ノードをシートに隠れない画面上部1/3へスッと寄せる
      // (弾み・リング・流れる系譜がちゃんと見えるように)
      if (next && next !== cur) {
        const g = genreById(next);
        const el = wrapRef.current;
        if (g && el) {
          const v = viewRef.current;
          animateView({ ...v }, { k: v.k, tx: el.clientWidth / 2 - xOf(g) * v.k, ty: el.clientHeight * 0.3 - yOf(g) * v.k }, 320);
        }
      }
      return next;
    });
  };

  // 焦点を保ったままズーム(ダブルタップ)
  const zoomAt = (mx: number, my: number, factor: number) => {
    const from = { ...viewRef.current };
    const to = (() => {
      const k = Math.min(3, Math.max(0.5, from.k * factor));
      const s = k / from.k;
      return { k, tx: mx - (mx - from.tx) * s, ty: my - (my - from.ty) * s };
    })();
    animateView(from, to, 230);
  };

  const animateView = (from: View, to: View, dur: number) => {
    const t0 = performance.now();
    cancelAnimationFrame(flyAnim.current);
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - t, 3);
      viewRef.current = {
        k: from.k + (to.k - from.k) * e,
        tx: from.tx + (to.tx - from.tx) * e,
        ty: from.ty + (to.ty - from.ty) * e,
      };
      draw(now);
      if (t < 1) flyAnim.current = requestAnimationFrame(step);
    };
    flyAnim.current = requestAnimationFrame(step);
  };

  // ノードへセンタリング(つながりタップ)
  const flyTo = (id: string) => {
    const g = genreById(id);
    const el = wrapRef.current;
    if (!g || !el) return;
    setSelected(id);
    setSheetFull(false); // 地図を主役に戻して移動を見せる
    pop.current = { id, t0: performance.now() + 220 };
    ensureLoop();
    const from = { ...viewRef.current };
    const k = from.k;
    animateView(from, { k, tx: el.clientWidth / 2 - xOf(g) * k, ty: el.clientHeight * 0.3 - yOf(g) * k }, 350);
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
        <div className="gt-hint">ドラッグで移動 · ピンチ/2度タップで拡大 · ●をタップ</div>
      </div>

      {/* ボトムシート: 最初はコンパクト(地図の系譜アニメが主役)、「詳しく」で全開 */}
      {sel && (
        <div className={`gt-sheet ${sheetFull ? "" : "gt-peek"}`} role="dialog" aria-label={sel.name}>
          <button className="sheet-close" onClick={() => setSelected(null)} aria-label="閉じる">
            ×
          </button>
          <div className="gt-sheet-head">
            <div style={{ minWidth: 0 }}>
              <div className="gt-sheet-cat" style={{ color: catOf(sel).color }}>
                {catOf(sel).name} · {sel.year}年頃〜
              </div>
              <h2>{sel.name}</h2>
            </div>
            <button className="gt-more" onClick={() => setSheetFull(!sheetFull)}>
              {sheetFull ? "たたむ ▾" : "詳しく ▴"}
            </button>
          </div>

          {/* つながりチップ(ピーク時も横一列で系譜を辿れる) */}
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
        </div>
      )}
    </div>
  );
}
