"use client";

// ============ 時代設定マップ（縦時間×横地域帯・2026-07-30 大工事） ============
// 横時間から縦時間へ回転した。効く理由:
//   ・作品は近現代の日本に密集する。縦時間なら密集は縦に伸びるだけで、
//     スクロールという一番安い操作が吸収してくれる
//   ・モバイルの縦年表と骨格が同じになる（同じ一枚を指で泳げる）
//   ・音楽マップ/アニメマップと同じ「縦時間×横帯＋LOD＋束」に合流する
// dodge（横ずらし）は廃止。近接作品は束にまとめ、タップでズームしてほどく。

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { TIMELINE, TL_REGIONS, workById, type TimelineEntry } from "@/lib/data";
import { amazonLink, coverSrc, coverThumb } from "@/lib/affiliate";
import { useMeta } from "@/lib/useMeta";
import { useVoicesByWork } from "@/lib/usePosts";
import type { Post } from "@/lib/posts";
import { AmazonButton } from "@/components/Cover";
import MiniBubble from "@/components/MiniBubble";
import { useMapCamera, type Cam } from "@/lib/useMapCamera";
import { bundleByScreen } from "@/lib/cluster";
import { t, lp, type Lang } from "@/lib/i18n";
import { regionName, tlLabel, tlNote, workTitle } from "@/lib/content-en";

/* ============ 時間スケール（縦） ============
 * 紀元前1100年〜2400年をピースワイズ線形で圧縮。古代は詰めて、
 * 作品が密集する近現代に幅を割く（横時間版から継承した配分）。 */
const TL_H = 3400;
const STOPS: [number, number][] = [
  [-1100, 0],
  [0, 0.075],
  [1000, 0.145],
  [1600, 0.215],
  [1850, 0.315],
  [1900, 0.415],
  [1950, 0.535],
  [2000, 0.655],
  [2050, 0.735],
  [2100, 0.785],
  [2400, 1],
];

function tlY(year: number): number {
  const y = Math.max(STOPS[0][0], Math.min(2400, year));
  for (let i = 1; i < STOPS.length; i++) {
    if (y <= STOPS[i][0]) {
      const [y0, f0] = STOPS[i - 1];
      const [y1, f1] = STOPS[i];
      return (f0 + ((y - y0) / (y1 - y0)) * (f1 - f0)) * TL_H;
    }
  }
  return TL_H;
}

/** 逆変換（画面のどこが何年か = 年インジケータ用） */
function yToYear(py: number): number {
  const f = Math.max(0, Math.min(1, py / TL_H));
  for (let i = 1; i < STOPS.length; i++) {
    if (f <= STOPS[i][1]) {
      const [y0, f0] = STOPS[i - 1];
      const [y1, f1] = STOPS[i];
      return Math.round(y0 + ((f - f0) / (f1 - f0)) * (y1 - y0));
    }
  }
  return 2400;
}

// ---- 地域帯（左から右）。cols = 帯の中の列数（作品数に応じた幅） ----
const COL_W = 118;
// jaS/enS は狭い画面用の短縮名。スマホでは帯の幅が40px弱になるので、
// フルの帯名（60〜90px）だと隣の帯へ食い込んで「地域タグが崩れる」ように見える。
const BAND_DEF: { id: string; cols: number; jaS: string; enS: string }[] = [
  { id: "japan", cols: 4, jaS: "日本", enS: "JP" },
  { id: "asia", cols: 2, jaS: "中国", enS: "Asia" },
  { id: "europe", cols: 2, jaS: "欧州", enS: "EU" },
  { id: "world", cols: 2, jaS: "世界", enS: "World" },
  { id: "future", cols: 2, jaS: "未来", enS: "Future" },
  { id: "fantasy", cols: 2, jaS: "架空", enS: "Other" },
];

const BANDS = (() => {
  let x = 0;
  return BAND_DEF.map((b) => {
    const w = b.cols * COL_W;
    const out = { ...b, x0: x, w, cx: x + w / 2 };
    x += w;
    return out;
  });
})();
const WORLD_W = BANDS[BANDS.length - 1].x0 + BANDS[BANDS.length - 1].w;

// ---- 時代の地層（左端に貼りつく時間の目盛り） ----
// jaS/enS は狭い画面用の短縮名。レールの幅で折り返すと隣の罫線とぶつかるので、
// 折り返さずに収まる長さを別に持つ。
const STRATA: { from: number; to: number; ja: string; en: string; jaS: string; enS: string }[] = [
  { from: -1100, to: 0, ja: "紀元前", en: "BCE", jaS: "紀元前", enS: "BCE" },
  { from: 0, to: 1185, ja: "古代", en: "Antiquity", jaS: "古代", enS: "Antiq." },
  { from: 1185, to: 1600, ja: "中世", en: "Middle Ages", jaS: "中世", enS: "Medieval" },
  { from: 1600, to: 1868, ja: "江戸", en: "Edo", jaS: "江戸", enS: "Edo" },
  { from: 1868, to: 1926, ja: "明治・大正", en: "Meiji–Taisho", jaS: "明治大正", enS: "Meiji" },
  { from: 1926, to: 1989, ja: "昭和", en: "Showa", jaS: "昭和", enS: "Showa" },
  { from: 1989, to: 2019, ja: "平成", en: "Heisei", jaS: "平成", enS: "Heisei" },
  { from: 2019, to: 2100, ja: "令和〜近未来", en: "Reiwa & near future", jaS: "令和〜", enS: "Reiwa" },
  { from: 2100, to: 2400, ja: "時間軸の外", en: "Outside time", jaS: "時間外", enS: "No era" },
];

const FANTASY_Y = tlY(2125);

// 年の目盛り
const TICKS = [-1000, -500, 0, 500, 1000, 1500, 1700, 1800, 1900, 1950, 2000, 2050, 2100];

// 歴史イベント（時代の道しるべ）。帯ごとに横線で置く
const EVENTS: { region: string; year: number; ja: string; en: string }[] = [
  { region: "japan", year: 1603, ja: "江戸幕府成立", en: "Edo shogunate founded" },
  { region: "japan", year: 1868, ja: "明治維新", en: "Meiji Restoration" },
  { region: "japan", year: 1923, ja: "関東大震災", en: "Great Kanto Earthquake" },
  { region: "japan", year: 1945, ja: "終戦", en: "End of the war" },
  { region: "japan", year: 1964, ja: "東京五輪", en: "Tokyo Olympics" },
  { region: "japan", year: 1991, ja: "バブル崩壊", en: "The bubble bursts" },
  { region: "japan", year: 2011, ja: "東日本大震災", en: "Great East Japan Earthquake" },
  { region: "asia", year: -221, ja: "秦が中華統一", en: "Qin unifies China" },
  { region: "asia", year: 618, ja: "唐の建国", en: "Tang dynasty founded" },
  { region: "asia", year: 1912, ja: "清の滅亡", en: "Fall of the Qing" },
  { region: "europe", year: -334, ja: "アレクサンドロス東征", en: "Alexander marches east" },
  { region: "europe", year: 793, ja: "ヴァイキング時代はじまる", en: "The Viking age begins" },
  { region: "europe", year: 1789, ja: "フランス革命", en: "French Revolution" },
  { region: "europe", year: 1914, ja: "第一次世界大戦", en: "First World War" },
  { region: "europe", year: 1989, ja: "ベルリンの壁崩壊", en: "The Berlin Wall falls" },
  { region: "world", year: 1776, ja: "アメリカ独立", en: "American independence" },
  { region: "world", year: 1929, ja: "世界恐慌", en: "The Great Depression" },
  { region: "world", year: 1969, ja: "人類、月に立つ", en: "Humans walk on the Moon" },
];

// LODごとのピンの画面上サイズ（CSSの .mapstage[data-lod] と対）
const PIN: Record<number, { w: number; h: number }> = {
  0: { w: 26, h: 26 },
  1: { w: 40, h: 54 },
  2: { w: 62, h: 84 },
};

/** 帯の中の列を決める（起動時に1回だけ・実行中は動かさない） */
function assignColumns(): Map<string, { x: number; y: number; band: (typeof BANDS)[number] }> {
  const out = new Map<string, { x: number; y: number; band: (typeof BANDS)[number] }>();
  const MIN_GAP = 92; // これ以上近いと同じ列には置かない（ワールド単位）
  for (const band of BANDS) {
    const rows = TIMELINE.filter((e) => e.region === band.id)
      .map((e) => ({ e, y: tlY(e.year) }))
      .sort((a, b) => a.y - b.y);
    const lastY: number[] = new Array(band.cols).fill(-Infinity);
    for (const r of rows) {
      let col = lastY.findIndex((ly) => r.y - ly >= MIN_GAP);
      if (col === -1) {
        // どの列も詰まっている → いちばん古い列へ（重なりは束が吸収する）
        col = lastY.indexOf(Math.min(...lastY));
      }
      lastY[col] = r.y;
      out.set(`${r.e.region}:${r.e.workId}`, {
        x: band.x0 + (col + 0.5) * (band.w / band.cols),
        y: r.y,
        band,
      });
    }
  }
  return out;
}

const LAYOUT = assignColumns();
const keyOf = (e: TimelineEntry) => `${e.region}:${e.workId}`;

// 貼りつく道具立ての厚み（camera の inset と対にする）
const STICK_TOP = 28;
const STICK_LEFT = 86;

function labelWidth(s: string): number {
  let px = 12;
  for (const ch of s) px += /[\x20-\x7e]/.test(ch) ? 6 : 11;
  return px;
}

export default function EraTimeline({ lang = "ja" }: { lang?: Lang }) {
  const meta = useMeta();
  const voices = useVoicesByWork();
  const [selected, setSelected] = useState<TimelineEntry | null>(null);
  const [filter, setFilter] = useState<string | null>(null);
  const [introOpen, setIntroOpen] = useState(true);
  const [camK, setCamK] = useState(0);
  const [voiceIdx, setVoiceIdx] = useState(0);
  const pendingFly = useRef<string | null>(null);

  // 貼りつく道具立て（毎フレームDOMを直接書く＝Reactを通らない）
  const strataRefs = useRef<(HTMLDivElement | null)[]>([]);
  const bandRefs = useRef<(HTMLDivElement | null)[]>([]);
  const strataHostRef = useRef<HTMLDivElement | null>(null);
  const bandHostRef = useRef<HTMLDivElement | null>(null);
  const yearRef = useRef<HTMLSpanElement | null>(null);
  const mmRef = useRef<HTMLDivElement | null>(null);
  const lastYear = useRef<number>(NaN);

  const onFrame = useCallback((cam: Cam) => {
    const { tx, ty, k } = cam;
    // 時代の地層ラベル: 画面上端に貼りつく（iOSのセクション見出しと同じ挙動）。
    // 帯が画面をまたいでいるときだけ上端へ寄せ、そうでなければ本来の位置に置く。
    const vpH = strataHostRef.current?.clientHeight ?? 9999;
    STRATA.forEach((s, i) => {
      const el = strataRefs.current[i];
      if (!el) return;
      const top = tlY(s.from) * k + ty;
      const bottom = tlY(s.to) * k + ty;
      if (bottom < STICK_TOP || top > vpH) {
        el.style.opacity = "0";
        return;
      }
      el.style.opacity = "1";
      const y = top < STICK_TOP ? Math.min(STICK_TOP, bottom - 30) : top;
      el.style.transform = `translateY(${y}px)`;
    });
    // 地域帯の名前: 画面左端に貼りつく（横パンで迷子にならない）。
    // ラベルは帯の幅を超えないように制限する＝隣の帯に食い込ませない。
    // 読み（offsetWidth）と書き（style）を分けてレイアウトスラッシングを避ける。
    const vpW = bandHostRef.current?.clientWidth ?? 9999;
    const plan: { el: HTMLDivElement; x: number; max: number; show: boolean }[] = [];
    for (let i = 0; i < BANDS.length; i++) {
      const el = bandRefs.current[i];
      if (!el) continue;
      const b = BANDS[i];
      const x0 = b.x0 * k + tx;
      const x1 = (b.x0 + b.w) * k + tx;
      const bandW = Math.max(26, x1 - x0 - 2);
      const wpx = Math.min(el.offsetWidth || 60, bandW);
      const show = x1 > STICK_LEFT && x0 < vpW;
      const x = x0 < STICK_LEFT ? Math.min(STICK_LEFT, x1 - wpx) : x0;
      plan.push({ el, x, max: bandW, show });
    }
    for (const q of plan) {
      q.el.style.opacity = q.show ? "1" : "0";
      q.el.style.maxWidth = `${q.max}px`;
      if (q.show) q.el.style.transform = `translateX(${q.x}px)`;
    }
    // 年インジケータ（整数年が変わったときだけ書く）
    const yr = yToYear((-ty + 46) / k);
    if (yr !== lastYear.current && yearRef.current) {
      lastYear.current = yr;
      yearRef.current.textContent = yr < 0 ? `BC${-yr}` : `${yr}`;
    }
    // ミニマップの現在位置
    const mm = mmRef.current;
    if (mm) {
      const host = mm.parentElement;
      const H = host?.clientHeight ?? 0;
      const vhpx = host?.clientHeight ?? 0;
      const total = TL_H * k;
      mm.style.top = `${Math.max(0, (-ty / total) * H)}px`;
      mm.style.height = `${Math.max(6, Math.min(H, ((vhpx || 1) / total) * H))}px`;
    }
  }, []);

  const onSettle = useCallback((cam: Cam) => setCamK(cam.k), []);

  // タップの受け口（clickに頼らない理由は useMapCamera のコメント参照）
  const tapTargets = useRef(new Map<string, { wx: number; wy: number; members: TimelineEntry[] }>());
  const pickRef = useRef<(e: TimelineEntry) => void>(() => {});
  const unbundleRef = useRef<(b: { wx: number; wy: number }) => void>(() => {});
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
    if (el.closest(".mapstage")) setSelected(null);
  }, []);

  const cam = useMapCamera({
    worldW: WORLD_W,
    worldH: TL_H,
    fitAxis: "width",
    minR: 0.26,
    maxR: 9,
    lodAt: [0.92, 1.75],
    slack: 0.18,
    // 左=時代の地層カラム / 右=ミニマップ / 上=地域帯バー を避ける
    inset: { left: 86, right: 28, top: 28 },
    home: { r: 1, cx: WORLD_W / 2, cy: tlY(1935) },
    onFrame,
    onSettle,
    onTap,
  });

  // ---- URL（?w=workId）----
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const w = q.get("w");
    if (w) {
      const e = TIMELINE.find((x) => x.workId === w);
      if (e) {
        setSelected(e);
        setIntroOpen(false);
        pendingFly.current = keyOf(e);
      }
    }
    const r = q.get("region");
    if (r && TL_REGIONS.some((x) => x.id === r)) setFilter(r);
  }, []);

  useEffect(() => {
    const q = new URLSearchParams();
    if (filter) q.set("region", filter);
    if (selected) q.set("w", selected.workId);
    const qs = q.toString();
    history.replaceState(null, "", location.pathname + (qs ? `?${qs}` : ""));
  }, [selected, filter]);

  useEffect(() => {
    const key = pendingFly.current;
    if (!key || !cam.fitK) return;
    pendingFly.current = null;
    const pos = LAYOUT.get(key);
    if (pos) cam.flyTo(pos.x, pos.y, 2.4, cam.vw > 860 ? -140 : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cam.fitK]);

  // ---- 下地（パン/ズームで作り直さない静的SVG）----
  const chrome = useMemo(
    () => (
      <svg
        viewBox={`0 0 ${WORLD_W} ${TL_H}`}
        className="stage-svg"
        preserveAspectRatio="none"
        aria-hidden
      >
        {/* 時代の地層（一段ごとに地色を変える） */}
        {STRATA.map((s, i) => (
          <rect
            key={s.ja}
            x={0}
            y={tlY(s.from)}
            width={WORLD_W}
            height={tlY(s.to) - tlY(s.from)}
            fill={i % 2 === 0 ? "rgba(23,19,16,0.045)" : "transparent"}
          />
        ))}
        {/* 地域帯 */}
        {BANDS.map((b) => {
          const reg = TL_REGIONS.find((r) => r.id === b.id);
          return (
            <g key={b.id}>
              <rect x={b.x0} y={0} width={b.w} height={TL_H} fill={`${reg?.color ?? "#000"}0d`} />
              <line
                x1={b.x0}
                y1={0}
                x2={b.x0}
                y2={TL_H}
                stroke="rgba(23,19,16,0.22)"
                strokeWidth={1}
                style={{ vectorEffect: "non-scaling-stroke" }}
              />
            </g>
          );
        })}
        {/* 時代の境界線 */}
        {STRATA.map((s) => (
          <line
            key={`d${s.from}`}
            x1={0}
            y1={tlY(s.from)}
            x2={WORLD_W}
            y2={tlY(s.from)}
            stroke="rgba(23,19,16,0.28)"
            strokeWidth={1.5}
            style={{ vectorEffect: "non-scaling-stroke" }}
          />
        ))}
        {/* 年の目盛り */}
        {TICKS.map((y) => (
          <line
            key={y}
            x1={0}
            y1={tlY(y)}
            x2={WORLD_W}
            y2={tlY(y)}
            stroke="rgba(23,19,16,0.1)"
            strokeWidth={1}
            style={{ vectorEffect: "non-scaling-stroke" }}
          />
        ))}
        {/* 架空ゾーン */}
        <defs>
          <pattern id="fzone" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
            <rect width="14" height="14" fill="rgba(219,39,119,0.05)" />
            <rect width="7" height="14" fill="rgba(219,39,119,0.11)" />
          </pattern>
        </defs>
        <rect x={0} y={FANTASY_Y} width={WORLD_W} height={TL_H - FANTASY_Y} fill="url(#fzone)" />
        <line
          x1={0}
          y1={FANTASY_Y}
          x2={WORLD_W}
          y2={FANTASY_Y}
          stroke="#db2777"
          strokeWidth={2}
          strokeDasharray="7 5"
          style={{ vectorEffect: "non-scaling-stroke" }}
        />
        {/* 歴史イベント（帯の中だけを横切る細線） */}
        {EVENTS.map((ev) => {
          const b = BANDS.find((x) => x.id === ev.region);
          if (!b) return null;
          const reg = TL_REGIONS.find((r) => r.id === ev.region);
          return (
            <line
              key={`${ev.region}${ev.year}`}
              x1={b.x0 + 2}
              y1={tlY(ev.year)}
              x2={b.x0 + b.w - 2}
              y2={tlY(ev.year)}
              stroke={reg?.color ?? "#000"}
              strokeWidth={1.2}
              strokeDasharray="4 3"
              opacity={0.65}
              style={{ vectorEffect: "non-scaling-stroke" }}
            />
          );
        })}
      </svg>
    ),
    []
  );

  // ---- 束 ----
  const lod = cam.lod;
  const placed = useMemo(
    () =>
      TIMELINE.filter((e) => !filter || e.region === filter)
        .map((e) => {
          const pos = LAYOUT.get(keyOf(e));
          return pos ? { item: e, wx: pos.x, wy: pos.y } : null;
        })
        .filter(Boolean) as { item: TimelineEntry; wx: number; wy: number }[],
    [filter]
  );

  const selKey = selected ? keyOf(selected) : null;
  const bundles = useMemo(() => {
    const k = camK || cam.fitK;
    const mine = placed.filter((p) => keyOf(p.item) === selKey);
    const rest = placed.filter((p) => keyOf(p.item) !== selKey);
    const out = bundleByScreen(rest, k, PIN[lod].w, PIN[lod].h, lod > 0);
    for (const m of mine) out.push({ wx: m.wx, wy: m.wy, members: [m] });
    return out;
  }, [placed, camK, cam.fitK, lod, selKey]);

  // 作品名ラベル（L2のみ・重なるものは間引く）
  const nameKeep = useMemo(() => {
    if (lod < 2) return new Set<unknown>();
    const k = camK || cam.fitK;
    const rects: { x0: number; x1: number; y0: number; y1: number }[] = [];
    const keep = new Set<unknown>();
    const rows = bundles
      .map((b) => {
        const head = b.members[0].item;
        const wk = workById(head.workId);
        return { b, text: wk ? workTitle(wk, lang) : "", weight: b.members.length };
      })
      .sort((a, z) => z.weight - a.weight);
    for (const r of rows) {
      const cx = r.b.wx * k;
      const cy = r.b.wy * k + 10;
      const hw = labelWidth(r.text) / 2;
      const rect = { x0: cx - hw, x1: cx + hw, y0: cy - 9, y1: cy + 9 };
      if (!rects.some((o) => rect.x0 < o.x1 && rect.x1 > o.x0 && rect.y0 < o.y1 && rect.y1 > o.y0)) {
        rects.push(rect);
        keep.add(r.b);
      }
    }
    return keep;
  }, [bundles, camK, cam.fitK, lod, lang]);

  // ---- 読者の声 ----
  const voiceRows = useMemo(() => {
    const out: { e: TimelineEntry; post: Post }[] = [];
    for (const e of TIMELINE) {
      const v = voices[e.workId]?.latest;
      if (v) out.push({ e, post: v });
    }
    return out;
  }, [voices]);

  useEffect(() => {
    if (voiceRows.length < 2) return;
    const timer = setInterval(() => setVoiceIdx((i) => (i + 1) % voiceRows.length), 7000);
    return () => clearInterval(timer);
  }, [voiceRows.length]);
  const voice = voiceRows.length > 0 ? voiceRows[voiceIdx % voiceRows.length] : null;

  const pick = (e: TimelineEntry) => {
    setSelected(e);
    setIntroOpen(false);
    const pos = LAYOUT.get(keyOf(e));
    if (pos) {
      const r = Math.max(2.2, (camK || cam.fitK) / (cam.fitK || 1));
      cam.flyTo(pos.x, pos.y, r, cam.vw > 860 ? -140 : 0);
    }
  };

  const unbundle = (b: { wx: number; wy: number }) => {
    const r = (camK || cam.fitK) / (cam.fitK || 1);
    cam.flyTo(b.wx, b.wy, Math.min(9, Math.max(r * 2.4, 2.2)));
  };

  pickRef.current = pick;
  unbundleRef.current = unbundle;

  // 狭い画面では短縮ラベル・短い操作ヒントに切り替える
  const narrow = cam.vw > 0 && cam.vw < 700;

  const selWork = selected ? workById(selected.workId) : null;
  const selRegion = selected ? TL_REGIONS.find((r) => r.id === selected.region) : null;

  return (
    <div className="mapstage-root">
      <div
        ref={cam.containerRef}
        className="mapstage-vp paper"
        {...cam.bind}
        onPointerDown={(e) => {
          setIntroOpen(false);
          cam.bind.onPointerDown(e);
        }}
        role="application"
        aria-label={t("eras.title", lang)}
      >
        <div
          ref={cam.stageRef}
          className="mapstage"
          style={{ ["--w" as string]: WORLD_W, ["--h" as string]: TL_H }}
        >
          {chrome}

          {/* 歴史イベントのラベル（逆スケールで文字サイズ一定） */}
          {EVENTS.map((ev) => {
            const b = BANDS.find((x) => x.id === ev.region);
            if (!b || (filter && filter !== ev.region)) return null;
            const reg = TL_REGIONS.find((r) => r.id === ev.region);
            return (
              <div
                key={`el-${ev.region}${ev.year}`}
                className="ev"
                style={{ ["--wx" as string]: b.x0, ["--wy" as string]: tlY(ev.year) }}
              >
                <span className="ev-in" style={{ color: reg?.color }}>
                  {ev.year < 0 ? `BC${-ev.year}` : ev.year} {lang === "en" ? ev.en : ev.ja}
                </span>
              </div>
            );
          })}

          {/* 作品ピン */}
          {bundles.map((b) => {
            const many = b.members.length > 1;
            const head = b.members[0].item;
            const wk = workById(head.workId);
            const reg = TL_REGIONS.find((r) => r.id === head.region);
            const cover =
              lod === 0 || !wk ? null : lod > 1 ? coverSrc(meta, wk.id) : coverThumb(meta, wk.id);
            const isOn = b.members.some((m) => keyOf(m.item) === selKey);
            const title = wk ? workTitle(wk, lang) : "";
            const showName = nameKeep.has(b) || isOn;
            const tapId = b.members.map((m) => keyOf(m.item)).join("+");
            tapTargets.current.set(tapId, {
              wx: b.wx,
              wy: b.wy,
              members: b.members.map((m) => m.item),
            });
            const yearChip =
              head.region === "fantasy"
                ? t("eras.fantasyChip", lang)
                : head.year < 0
                  ? `BC${-head.year}`
                  : `${head.year}`;
            return (
              <div
                key={tapId}
                className={`mp ${many ? "multi" : ""} ${isOn ? "on" : ""} ${showName ? "" : "noname"}`}
                style={{
                  ["--wx" as string]: b.wx,
                  ["--wy" as string]: b.wy,
                  ["--pin" as string]: reg?.color,
                }}
              >
                <div className="mp-in" data-tap={tapId} title={`${title} — ${tlLabel(head, lang)}`}>
                  <span className="mp-year" style={{ borderColor: reg?.color, color: reg?.color }}>
                    {yearChip}
                  </span>
                  <div className="mp-body">
                    {cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cover} alt={title} loading="lazy" />
                    ) : lod > 0 ? (
                      <span style={{ fontSize: 15 }}>📖</span>
                    ) : null}
                    <span className="mp-n">{many ? b.members.length : ""}</span>
                    {many && lod > 0 && <span className="mp-cnt">{b.members.length}</span>}
                  </div>
                  <i className="mp-tip" />
                  <b className="mp-name">{many ? `${title} ほか` : title}</b>
                </div>
              </div>
            );
          })}
        </div>

        {/* ---- 時代の地層（左端に貼りつく） ---- */}
        <div className="era-strata" ref={strataHostRef} data-map-ui>
          <div className="es-head">
            <span className="es-year" ref={yearRef}>
              —
            </span>
          </div>
          {STRATA.map((s, i) => (
            <div
              key={s.ja}
              className="es-row"
              ref={(el) => {
                strataRefs.current[i] = el;
              }}
            >
              {lang === "en" ? (narrow ? s.enS : s.en) : narrow ? s.jaS : s.ja}
            </div>
          ))}
        </div>

        {/* ---- 地域帯の名前（上端に貼りつく） ---- */}
        <div className="era-bandbar" ref={bandHostRef} data-map-ui>
          {BANDS.map((b, i) => {
            const reg = TL_REGIONS.find((r) => r.id === b.id);
            return (
              <div
                key={b.id}
                className={`eb-name ${filter && filter !== b.id ? "dim" : ""}`}
                style={{ background: reg?.color }}
                ref={(el) => {
                  bandRefs.current[i] = el;
                }}
                onClick={() => setFilter(filter === b.id ? null : b.id)}
                role="button"
              >
                {narrow ? (lang === "en" ? b.enS : b.jaS) : reg ? regionName(reg, lang) : b.id}
              </div>
            );
          })}
        </div>

        {/* ---- ミニマップ（全期間ナビ） ---- */}
        <div
          data-map-ui
          className="era-mm"
          onPointerDown={(e) => {
            const bar = e.currentTarget.getBoundingClientRect();
            const jump = (clientY: number) => {
              const f = Math.max(0, Math.min(1, (clientY - bar.top) / bar.height));
              cam.flyTo(cam.getCam().k ? (-cam.getCam().tx + cam.vw / 2) / cam.getCam().k : WORLD_W / 2, f * TL_H);
            };
            jump(e.clientY);
            const move = (ev: PointerEvent) => jump(ev.clientY);
            const up = () => {
              window.removeEventListener("pointermove", move);
              window.removeEventListener("pointerup", up);
            };
            window.addEventListener("pointermove", move);
            window.addEventListener("pointerup", up);
          }}
        >
          {TIMELINE.map((e) => {
            const reg = TL_REGIONS.find((r) => r.id === e.region);
            const bi = BANDS.findIndex((b) => b.id === e.region);
            return (
              <span
                key={keyOf(e)}
                style={{
                  top: `${(tlY(e.year) / TL_H) * 100}%`,
                  left: `${12 + bi * 13}%`,
                  background: reg?.color,
                }}
              />
            );
          })}
          <div
            className="era-mm-hatch"
            style={{ top: `${(FANTASY_Y / TL_H) * 100}%` }}
          />
          <div className="era-mm-vp" ref={mmRef} />
        </div>

        {/* ---- 見出し ---- */}
        {introOpen && (
          <div className="map-intro eras" data-map-ui>
            <button className="sheet-close" onClick={() => setIntroOpen(false)} aria-label={t("close", lang)}>
              ×
            </button>
            <span className="en">{t("eras.en", lang)}</span>
            <h1>{t("eras.title", lang)}</h1>
            <p>{t("eras.welcomeBody", lang)}</p>
          </div>
        )}

        {/* ---- 道具立て ---- */}
        {/* 絞り込みは上端の帯の名前をタップして行う（下にチップを並べると地図を食う） */}
        <div className="map-toolbar" data-map-ui>
          {filter ? (
            <button
              className="chip active"
              style={{
                background: TL_REGIONS.find((r) => r.id === filter)?.color,
                borderColor: TL_REGIONS.find((r) => r.id === filter)?.color,
                color: "#fff",
              }}
              onClick={() => setFilter(null)}
            >
              {regionName(TL_REGIONS.find((r) => r.id === filter)!, lang)}
              {lang === "ja" ? "だけ表示中" : " only"} ×
            </button>
          ) : (
            <span className="map-hint">
              {t(narrow ? "eras.hintFilterShort" : "eras.hintFilter", lang)}
            </span>
          )}
        </div>

        <div className="map-ctl" data-map-ui>
          <button onClick={() => cam.zoomBy(1.6)} aria-label={t("cam.zoomIn", lang)}>
            ＋
          </button>
          <button onClick={() => cam.zoomBy(1 / 1.6)} aria-label={t("cam.zoomOut", lang)}>
            －
          </button>
          <button className="wide" onClick={() => cam.fit()}>
            {t("cam.whole", lang)}
          </button>
          <button className="wide opt" onClick={() => cam.home()}>
            {t("cam.home", lang)}
          </button>
        </div>

        {/* ---- 読者の声 ---- */}
        {voice && !selected && (
          <div className="map-voicebar" data-map-ui>
            <MiniBubble
              post={voice.post}
              cover={coverThumb(meta, voice.e.workId)}
              title={workById(voice.e.workId) ? workTitle(workById(voice.e.workId)!, lang) : undefined}
              href={lp(lang, `/works/${voice.e.workId}`)}
            />
          </div>
        )}

        {/* ---- 詳細シート ---- */}
        {selected && selWork && (
          <aside className="map-sheet" data-map-ui>
            <button className="sheet-close" onClick={() => setSelected(null)} aria-label={t("close", lang)}>
              ×
            </button>
            <h3>
              🕰️ {tlLabel(selected, lang)}
              <span className="sub" style={{ color: selRegion?.color }}>
                {selRegion ? regionName(selRegion, lang) : ""}
                {t("eras.timelineOf", lang)}
              </span>
            </h3>
            <div className="sw" style={{ display: "flex", gap: 10 }}>
              <div style={{ flex: "0 0 56px" }}>
                {coverThumb(meta, selWork.id) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={coverThumb(meta, selWork.id)!}
                    alt={workTitle(selWork, lang)}
                    style={{
                      width: 56,
                      height: 80,
                      objectFit: "cover",
                      border: "2px solid #171310",
                      boxShadow: "2px 2px 0 #171310",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 56,
                      height: 80,
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
                <Link href={lp(lang, `/works/${selWork.id}`)}>
                  <span className="t">
                    {workTitle(selWork, lang)}
                    <span style={{ fontWeight: 400, fontSize: 11, color: "#4a4238" }}>
                      {" "}
                      ({selWork.year}
                      {lang === "ja" ? t("eras.published", lang) : ""})
                    </span>
                  </span>
                </Link>
                <span className="n">{tlNote(selected, lang)}</span>
                {amazonLink(meta, selWork.id) && (
                  <div style={{ marginTop: 6 }}>
                    <AmazonButton href={amazonLink(meta, selWork.id)} small />
                  </div>
                )}
              </div>
            </div>
            {voices[selWork.id]?.latest && (
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 11.5, fontWeight: 900, marginBottom: 4 }}>
                  💬 {t("eras.voices", lang)}
                </div>
                <MiniBubble post={voices[selWork.id].latest!} />
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
