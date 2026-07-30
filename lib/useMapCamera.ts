"use client";

// ============ 地図カメラ（シリーズ共通の心臓部） ============
// 設計の要点は一つ: パン/ズーム中に React を再レンダーしない。
//
//   ・カメラの値は ref に持ち、毎フレーム stage の style.transform を直接書く
//   ・ピンは stage の中（ワールド座標）に置き、CSS変数 --inv-k で逆スケールして
//     画面上の大きさを一定に保つ → パンもズームも「1つのコンテナのtransform」だけが動く
//   ・LOD は stage の data-lod 属性を直接書き替える（CSSが見た目を切り替える）
//   ・React state を触るのは「慣性が止まったとき」と「LODが変わったとき」だけ
//
// これで音楽マップ 41_操作仕様 §7（性能の掟）を構造として満たす。

import { useCallback, useEffect, useRef, useState } from "react";

export type Cam = { tx: number; ty: number; k: number };

export type CameraOpts = {
  worldW: number;
  worldH: number;
  /**
   * 倍率の基準(=r 1.0)をどう決めるか。
   * "both"  … 全体が収まる倍率（地図向き）
   * "width" … 横幅が収まる倍率（縦長の時間軸向き。縦はスクロールで旅する）
   */
  fitAxis?: "both" | "width";
  /** 表示倍率の範囲。fit(全体が入る倍率)=1 を基準にした相対値 */
  minR?: number;
  maxR?: number;
  /** LODの境界（fit基準の相対倍率）。[L0→L1, L1→L2] */
  lodAt?: [number, number];
  /** 初期表示。r=相対倍率、cx/cy=中心にしたいワールド座標（省略時は全体フィット） */
  home?: { r: number; cx: number; cy: number };
  /** 端の余白（ビューポートに対する割合）。パンで world を追い出せる量 */
  slack?: number;
  /**
   * 画面端に貼りつく道具立て（地層カラム・ミニマップ・帯バーなど）の厚み。
   * ここを避けて fit / clamp / flyTo するので、中身が道具立ての下に隠れない。
   */
  inset?: { left?: number; right?: number; top?: number; bottom?: number };
  /** 毎フレーム呼ばれる。DOMを直接書きたい消費者向け（Reactは再レンダーされない） */
  onFrame?: (cam: Cam, r: number) => void;
  /** 動きが止まったとき。画像の差し替えなどReactに反映したいもの用 */
  onSettle?: (cam: Cam, r: number) => void;
};

const EASE_OUT = (t: number) => 1 - Math.pow(1 - t, 3);
const FRICTION = 0.92; // 慣性の減衰（41_操作仕様 §1）
const HYST = 0.92; // LOD境界のヒステリシス（行きと帰りで閾値をずらす）

export type MapCamera = {
  /** クリップする外枠。ここにポインタ操作をバインドする */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** 変形されるステージ。この中にワールド座標で中身を置く */
  stageRef: React.RefObject<HTMLDivElement | null>;
  bind: {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerMove: (e: React.PointerEvent) => void;
    onPointerUp: (e: React.PointerEvent) => void;
    onPointerCancel: (e: React.PointerEvent) => void;
    onDoubleClick: (e: React.MouseEvent) => void;
  };
  /** ビューポートの実測サイズ（0のあいだは未計測） */
  vw: number;
  vh: number;
  /** 現在のLOD（0/1/2）。React state なので描画の出し分けにも使える */
  lod: number;
  /** 全体が入る倍率（絶対スケール）。0 なら未計測 */
  fitK: number;
  /** ドラッグで動いた直後か（クリックとドラッグの区別用） */
  didDrag: () => boolean;
  /** いまのカメラ（refの生値） */
  getCam: () => Cam;
  /** ワールド座標 → 画面座標 */
  toScreen: (wx: number, wy: number) => [number, number];
  /** 指定倍率へ（画面中心基準） */
  zoomBy: (factor: number) => void;
  /** ワールド座標を画面中心に置く。r省略で倍率そのまま。offsetX でパネル分ずらせる */
  flyTo: (wx: number, wy: number, r?: number, offsetX?: number) => void;
  /** 全体フィットへ戻る */
  fit: () => void;
  /** homeへ戻る */
  home: () => void;
};

export function useMapCamera(opts: CameraOpts): MapCamera {
  const {
    worldW,
    worldH,
    fitAxis = "both",
    minR = 0.85,
    maxR = 18,
    lodAt = [1.55, 3.1],
    slack = 0.28,
    inset,
    onFrame,
    onSettle,
  } = opts;

  const insL = inset?.left ?? 0;
  const insR = inset?.right ?? 0;
  const insT = inset?.top ?? 0;
  const insB = inset?.bottom ?? 0;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  const [vw, setVw] = useState(0);
  const [vh, setVh] = useState(0);
  const [lod, setLod] = useState(0);

  // 道具立てを除いた「中身の置ける領域」
  const availW = Math.max(1, vw - insL - insR);
  const availH = Math.max(1, vh - insT - insB);

  // fitK は倍率の基準（r=1.0 のときの絶対スケール）
  const containK = vw > 0 && vh > 0 ? Math.min(availW / worldW, availH / worldH) : 0;
  const fitK = vw > 0 && vh > 0 ? (fitAxis === "width" ? availW / worldW : containK) : 0;
  const fitRef = useRef(0);
  fitRef.current = fitK;

  const camRef = useRef<Cam>({ tx: 0, ty: 0, k: 0 });
  const lodRef = useRef(0);
  const rafRef = useRef(0);
  const runningRef = useRef(false);

  // ---- ビューポートの実測 ----
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setVw(el.clientWidth);
      setVh(el.clientHeight);
    });
    ro.observe(el);
    setVw(el.clientWidth);
    setVh(el.clientHeight);
    return () => ro.disconnect();
  }, []);

  // ---- 境界クランプ（world を画面から追い出しすぎない） ----
  const clamp = useCallback(
    (c: Cam): Cam => {
      const f = fitRef.current;
      if (!f) return c;
      const k = Math.min(f * maxR, Math.max(f * minR, c.k));
      const cw = worldW * k;
      const ch = worldH * k;
      const mx = availW * slack;
      const my = availH * slack;
      let tx = c.tx;
      let ty = c.ty;
      // 領域より小さい軸は中央に寄せる。大きい軸は余白ぶんまで動かせる
      if (cw <= availW) tx = insL + (availW - cw) / 2;
      else tx = Math.min(insL + mx, Math.max(insL + availW - cw - mx, tx));
      if (ch <= availH) ty = insT + (availH - ch) / 2;
      else ty = Math.min(insT + my, Math.max(insT + availH - ch - my, ty));
      return { tx, ty, k };
    },
    [availW, availH, insL, insT, worldW, worldH, minR, maxR, slack]
  );

  // ---- 1フレーム分の書き込み（ここがReactを通らない唯一の道） ----
  const write = useCallback(() => {
    const st = stageRef.current;
    const c = camRef.current;
    if (!st || !c.k) return;
    st.style.transform = `translate3d(${c.tx}px, ${c.ty}px, 0) scale(${c.k})`;
    st.style.setProperty("--inv-k", String(1 / c.k));
    const f = fitRef.current || 1;
    const r = c.k / f;
    // LOD（ヒステリシスつき）。data属性だけ書き替え、CSSが見た目を切り替える
    const cur = lodRef.current;
    let next = cur;
    if (cur === 0 && r > lodAt[0]) next = 1;
    else if (cur === 1 && r < lodAt[0] * HYST) next = 0;
    else if (cur === 1 && r > lodAt[1]) next = 2;
    else if (cur === 2 && r < lodAt[1] * HYST) next = 1;
    if (next !== cur) {
      lodRef.current = next;
      st.dataset.lod = String(next);
      setLod(next); // 稀にしか起きないのでReactに流してよい
    }
    onFrame?.(c, r);
  }, [lodAt, onFrame]);

  // ---- 初期配置 ----
  const placedRef = useRef(false);
  useEffect(() => {
    if (!fitK || placedRef.current) return;
    placedRef.current = true;
    const h = opts.home;
    if (h) {
      const k = fitK * h.r;
      camRef.current = clamp({
        k,
        tx: insL + availW / 2 - h.cx * k,
        ty: insT + availH / 2 - h.cy * k,
      });
    } else {
      camRef.current = clamp({ k: fitK, tx: 0, ty: 0 });
    }
    const st = stageRef.current;
    if (st) st.dataset.lod = "0";
    write();
    // 初期配置も「動きが止まった状態」として通知する（書影の読み込み判断に使う）
    onSettle?.(camRef.current, camRef.current.k / fitK);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitK]);

  // ビューポートが変わったら（回転・リサイズ）はみ出しを直す
  useEffect(() => {
    if (!fitK || !placedRef.current) return;
    camRef.current = clamp(camRef.current);
    write();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vw, vh]);

  // ---- 慣性ループ ----
  const velRef = useRef({ x: 0, y: 0 });
  const startLoop = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    const step = () => {
      const v = velRef.current;
      const speed = Math.hypot(v.x, v.y);
      if (speed < 0.06) {
        runningRef.current = false;
        rafRef.current = 0;
        velRef.current = { x: 0, y: 0 };
        const f = fitRef.current || 1;
        onSettle?.(camRef.current, camRef.current.k / f);
        return;
      }
      const c = camRef.current;
      camRef.current = clamp({ ...c, tx: c.tx + v.x, ty: c.ty + v.y });
      // クランプで止まったら慣性も殺す（壁で震えない）
      if (camRef.current.tx === c.tx) v.x = 0;
      if (camRef.current.ty === c.ty) v.y = 0;
      v.x *= FRICTION;
      v.y *= FRICTION;
      write();
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  }, [clamp, write, onSettle]);

  // ---- flyTo（イージングつき） ----
  const flyRef = useRef(0);
  const animateTo = useCallback(
    (target: Cam, ms = 360) => {
      cancelAnimationFrame(flyRef.current);
      cancelAnimationFrame(rafRef.current);
      runningRef.current = false;
      velRef.current = { x: 0, y: 0 };
      const from = { ...camRef.current };
      const to = clamp(target);
      const t0 = performance.now();
      const step = () => {
        const p = Math.min(1, (performance.now() - t0) / ms);
        const e = EASE_OUT(p);
        camRef.current = {
          tx: from.tx + (to.tx - from.tx) * e,
          ty: from.ty + (to.ty - from.ty) * e,
          k: from.k + (to.k - from.k) * e,
        };
        write();
        if (p < 1) flyRef.current = requestAnimationFrame(step);
        else {
          flyRef.current = 0;
          const f = fitRef.current || 1;
          onSettle?.(camRef.current, camRef.current.k / f);
        }
      };
      flyRef.current = requestAnimationFrame(step);
    },
    [clamp, write, onSettle]
  );

  useEffect(
    () => () => {
      cancelAnimationFrame(rafRef.current);
      cancelAnimationFrame(flyRef.current);
    },
    []
  );

  // ---- ズーム（指定した画面座標を固定点にして拡大縮小） ----
  const zoomAt = useCallback(
    (sx: number, sy: number, factor: number, animate = false) => {
      const c = camRef.current;
      const f = fitRef.current;
      if (!f) return;
      const k = Math.min(f * maxR, Math.max(f * minR, c.k * factor));
      const s = k / c.k;
      const next = { k, tx: sx - (sx - c.tx) * s, ty: sy - (sy - c.ty) * s };
      if (animate) animateTo(next, 300);
      else {
        camRef.current = clamp(next);
        write();
      }
    },
    [clamp, write, animateTo, minR, maxR]
  );

  // ---- ホイールズーム（非passiveで登録する必要があるのでeffectで） ----
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      cancelAnimationFrame(rafRef.current);
      runningRef.current = false;
      velRef.current = { x: 0, y: 0 };
      zoomAt(e.clientX - rect.left, e.clientY - rect.top, Math.exp(-e.deltaY * 0.0018));
      // ホイールが止まったら settle（画像の差し替え用）
      clearTimeout(wheelTimer.current);
      wheelTimer.current = setTimeout(() => {
        const f = fitRef.current || 1;
        onSettle?.(camRef.current, camRef.current.k / f);
      }, 140) as unknown as number;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt, onSettle]);
  const wheelTimer = useRef(0);

  // ---- ポインタ（ドラッグ＋ピンチ） ----
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const dragRef = useRef<{ x: number; y: number; tx: number; ty: number; moved: boolean } | null>(null);
  const pinchRef = useRef<number | null>(null);
  const capturedRef = useRef(false);
  const lastMove = useRef<{ t: number; x: number; y: number } | null>(null);
  const movedRecently = useRef(false);

  const capture = (e: React.PointerEvent) => {
    if (capturedRef.current) return;
    try {
      (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
      capturedRef.current = true;
    } catch {
      /* 取れなくても致命的ではない */
    }
  };

  const onPointerDown = (e: React.PointerEvent) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    cancelAnimationFrame(rafRef.current);
    cancelAnimationFrame(flyRef.current);
    runningRef.current = false;
    velRef.current = { x: 0, y: 0 };
    if (pointers.current.size === 1) {
      const c = camRef.current;
      dragRef.current = { x: e.clientX, y: e.clientY, tx: c.tx, ty: c.ty, moved: false };
      lastMove.current = { t: performance.now(), x: e.clientX, y: e.clientY };
      movedRecently.current = false;
    } else {
      capture(e);
      dragRef.current = null;
      pinchRef.current = null;
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    if (pts.length >= 2) {
      const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const mx = (pts[0].x + pts[1].x) / 2 - rect.left;
      const my = (pts[0].y + pts[1].y) / 2 - rect.top;
      if (pinchRef.current) zoomAt(mx, my, d / pinchRef.current);
      pinchRef.current = d;
      movedRecently.current = true;
      return;
    }

    const d0 = dragRef.current;
    if (!d0) return;
    const dx = e.clientX - d0.x;
    const dy = e.clientY - d0.y;
    if (!d0.moved && Math.abs(dx) + Math.abs(dy) > 3) {
      d0.moved = true;
      movedRecently.current = true;
      capture(e);
    }
    if (!d0.moved) return;
    // 速度をとる（慣性用）
    const now = performance.now();
    const lm = lastMove.current;
    if (lm && now - lm.t > 8) {
      const dt = now - lm.t;
      velRef.current = { x: ((e.clientX - lm.x) / dt) * 16, y: ((e.clientY - lm.y) / dt) * 16 };
      lastMove.current = { t: now, x: e.clientX, y: e.clientY };
    }
    camRef.current = clamp({ ...camRef.current, tx: d0.tx + dx, ty: d0.ty + dy });
    write();
  };

  const endPointer = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    pinchRef.current = null;
    const wasDrag = dragRef.current?.moved;
    dragRef.current = null;
    if (pointers.current.size === 0) {
      capturedRef.current = false;
      if (wasDrag && Math.hypot(velRef.current.x, velRef.current.y) > 0.6) startLoop();
      else {
        velRef.current = { x: 0, y: 0 };
        const f = fitRef.current || 1;
        onSettle?.(camRef.current, camRef.current.k / f);
      }
      // クリック判定のため、ドラッグ直後フラグを次のtickまで残す
      if (wasDrag) setTimeout(() => (movedRecently.current = false), 60);
      else movedRecently.current = false;
    }
  };

  const onDoubleClick = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    zoomAt(e.clientX - rect.left, e.clientY - rect.top, 1.9, true);
  };

  // ---- 公開API ----
  const toScreen = useCallback((wx: number, wy: number): [number, number] => {
    const c = camRef.current;
    return [wx * c.k + c.tx, wy * c.k + c.ty];
  }, []);

  const zoomBy = useCallback(
    (factor: number) => zoomAt(insL + availW / 2, insT + availH / 2, factor, true),
    [zoomAt, insL, insT, availW, availH]
  );

  const flyTo = useCallback(
    (wx: number, wy: number, r?: number, offsetX = 0) => {
      const f = fitRef.current;
      if (!f) return;
      const k = r ? Math.min(f * maxR, Math.max(f * minR, f * r)) : camRef.current.k;
      animateTo({
        k,
        tx: insL + availW / 2 + offsetX - wx * k,
        ty: insT + availH / 2 - wy * k,
      });
    },
    [animateTo, insL, insT, availW, availH, minR, maxR]
  );

  // 「全体」は常に world 全部が入る倍率（fitAxis="width" でも全期間へ引く）
  const fit = useCallback(() => {
    const f = fitRef.current;
    if (!f || !containK) return;
    const k = Math.max(f * minR, containK);
    animateTo({
      k,
      tx: insL + (availW - worldW * k) / 2,
      ty: insT + (availH - worldH * k) / 2,
    });
  }, [animateTo, insL, insT, availW, availH, worldW, worldH, containK, minR]);

  const goHome = useCallback(() => {
    const h = opts.home;
    if (!h) return fit();
    flyTo(h.cx, h.cy, h.r);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flyTo, fit, opts.home]);

  return {
    containerRef,
    stageRef,
    bind: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endPointer,
      onPointerCancel: endPointer,
      onDoubleClick,
    },
    vw,
    vh,
    lod,
    fitK,
    didDrag: () => movedRecently.current,
    getCam: () => camRef.current,
    toScreen,
    zoomBy,
    flyTo,
    fit,
    home: goHome,
  };
}
