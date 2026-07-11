"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { BubbleFont, BubbleStyle } from "@/lib/posts";

export const BUBBLE_OPTIONS: { id: BubbleStyle; label: string }[] = [
  { id: "speech", label: "💬 セリフ" },
  { id: "shout", label: "💥 叫び" },
  { id: "think", label: "☁️ 心の声" },
  { id: "whisper", label: "…ぼそっ(点線)" },
  { id: "narration", label: "▭ ナレーション" },
];

// マンガの組版慣習に対応した書体セット
export const FONT_OPTIONS: { id: BubbleFont; label: string; css: string }[] = [
  { id: "antique", label: "セリフ(アンチック体)", css: "f-antique" },
  { id: "mincho", label: "モノローグ(明朝体)", css: "f-mincho" },
  { id: "sakebi", label: "叫び(極太ゴシック)", css: "f-sakebi" },
  { id: "tegaki", label: "手描きツッコミ", css: "f-tegaki" },
  { id: "shojo", label: "少女マンガ風", css: "f-shojo" },
  { id: "fude", label: "筆文字(時代劇・ホラー)", css: "f-fude" },
  { id: "pop", label: "ギャグ(ポップ体)", css: "f-pop" },
];

export function fontClass(font?: string): string {
  if (font === "dot") return "f-pop"; // 旧データ互換
  return FONT_OPTIONS.find((f) => f.id === font)?.css ?? "f-antique";
}

// 縦中横: 縦書きの中の半角数字(1〜3桁)や「!!」「!?」を横組みにする(マンガ写植の慣習)
// ※正規表現の後読みは旧iOS Safariで構文エラーになるため使わない
const TCY_RE = /\d+|!!|!\?|\?!/g;

export function tcy(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const m of text.matchAll(TCY_RE)) {
    const idx = m.index ?? 0;
    const token = m[0];
    // 4桁以上の数字(西暦など)は縦組みのまま
    if (/^\d+$/.test(token) && token.length > 3) continue;
    if (idx > last) parts.push(text.slice(last, idx));
    parts.push(
      <span key={i++} className="tcy">
        {token}
      </span>
    );
    last = idx + token.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length > 0 ? parts : text;
}

/* ================= 実測ベースのマンガ吹き出しエンジン =================
 * テキストの実寸を測ってから、そのサイズにぴったりの吹き出しをSVGパスで生成する。
 * ・引き伸ばしを一切しないので形が歪まない
 * ・テキストは楕円の内接領域に必ず収まる(はみ出しゼロ)
 * ・本物のマンガのように文字の周囲へたっぷり余白をとる
 */

interface Shape {
  d: string;
  dash?: string;
  sw?: number;
  fill?: string;
}

interface Geom {
  W: number;
  H: number;
  shapes: Shape[];
  dots?: { cx: number; cy: number; r: number }[];
  tx: number;
  ty: number;
}

const f1 = (n: number) => n.toFixed(1);

function pt(cx: number, cy: number, rx: number, ry: number, deg: number): [number, number] {
  const a = (deg * Math.PI) / 180;
  return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)];
}

// セリフ: 楕円と一体のしっぽ(輪郭は一筆書きの単一パス)
function speechGeom(tw: number, th: number): Geom {
  const rx = Math.max((tw + 6) * 0.72, 32);
  const ry = Math.max((th + 6) * 0.73, 22);
  const pad = 3;
  const tailH = 20;
  const cx = rx + pad;
  const cy = ry + pad;
  const W = 2 * (rx + pad);
  const H = 2 * ry + pad * 2 + tailH;
  const [ax, ay] = pt(cx, cy, rx, ry, 97); // しっぽ右付け根
  const [bx, by] = pt(cx, cy, rx, ry, 128); // しっぽ左付け根
  const tipX = cx - rx * 0.68;
  const tipY = H - 2;
  const d =
    `M ${f1(bx)} ${f1(by)} A ${f1(rx)} ${f1(ry)} 0 1 1 ${f1(ax)} ${f1(ay)}` +
    ` Q ${f1(ax - rx * 0.05)} ${f1(ay + tailH * 0.66)} ${f1(tipX)} ${f1(tipY)}` +
    ` Q ${f1(bx - rx * 0.01)} ${f1(by + tailH * 0.3)} ${f1(bx)} ${f1(by)} Z`;
  return { W, H, shapes: [{ d }], tx: cx - tw / 2, ty: cy - th / 2 };
}

// ぼそっ: 破線の楕円 + 破線のしっぽ
function whisperGeom(tw: number, th: number): Geom {
  const rx = Math.max((tw + 6) * 0.72, 32);
  const ry = Math.max((th + 6) * 0.73, 22);
  const pad = 3;
  const cx = rx + pad;
  const cy = ry + pad;
  const W = 2 * (rx + pad);
  const H = 2 * (ry + pad) + 14;
  const [p0x, p0y] = pt(cx, cy, rx, ry, 0);
  const [p1x, p1y] = pt(cx, cy, rx, ry, 180);
  const d =
    `M ${f1(p0x)} ${f1(p0y)} A ${f1(rx)} ${f1(ry)} 0 1 1 ${f1(p1x)} ${f1(p1y)}` +
    ` A ${f1(rx)} ${f1(ry)} 0 1 1 ${f1(p0x)} ${f1(p0y)} Z`;
  const tail = `M ${f1(cx - rx * 0.45)} ${f1(cy + ry * 0.9)} Q ${f1(cx - rx * 0.56)} ${f1(cy + ry + 7)} ${f1(cx - rx * 0.68)} ${f1(cy + ry + 14)}`;
  return {
    W,
    H,
    shapes: [
      { d, dash: "7 5" },
      { d: tail, dash: "4 4", fill: "none", sw: 2 },
    ],
    tx: cx - tw / 2,
    ty: cy - th / 2,
  };
}

// 叫び: 不揃いなトゲの爆発型
function burstGeom(tw: number, th: number): Geom {
  const rxI = Math.max((tw + 8) * 0.68, 40);
  const ryI = Math.max((th + 8) * 0.72, 26);
  const n = Math.max(11, Math.min(19, Math.round((rxI + ryI) / 22)));
  const vary = [1.35, 0.72, 1.1, 0.9, 1.5, 0.8, 1.2, 1.0, 1.55, 0.85, 1.25, 0.95, 1.4, 0.78, 1.15, 1.02, 1.3, 0.88, 1.45];
  const ext = 14;
  const maxExt = ext * 1.55;
  const pad = 3;
  const cx = rxI + maxExt + pad;
  const cy = ryI + maxExt * 0.78 + pad;
  const W = 2 * cx;
  const H = 2 * cy;
  const parts: string[] = [];
  for (let i = 0; i < n; i++) {
    const e = ext * vary[i % vary.length];
    const [ox, oy] = pt(cx, cy, rxI + e, ryI + e * 0.78, (i / n) * 360 - 90);
    const [ix, iy] = pt(cx, cy, rxI * 0.97, ryI * 0.97, ((i + 0.5) / n) * 360 - 90);
    parts.push(`${i ? "L" : "M"} ${f1(ox)} ${f1(oy)} L ${f1(ix)} ${f1(iy)}`);
  }
  return { W, H, shapes: [{ d: parts.join(" ") + " Z", sw: 2.7 }], tx: cx - tw / 2, ty: cy - th / 2 };
}

// 心の声: もくもく雲形 + 泡のしっぽ
function cloudGeom(tw: number, th: number): Geom {
  const rx = Math.max((tw + 8) * 0.7, 36);
  const ry = Math.max((th + 8) * 0.73, 24);
  const n = Math.max(9, Math.min(16, Math.round((rx + ry) / 24)));
  const bump = 1.11;
  const pad = 3;
  const cx = rx * bump + pad;
  const cy = ry * bump + pad;
  const W = 2 * cx;
  const H = 2 * cy + 24;
  const p0 = pt(cx, cy, rx, ry, -90);
  let d = `M ${f1(p0[0])} ${f1(p0[1])}`;
  for (let i = 0; i < n; i++) {
    const c = pt(cx, cy, rx * bump * 1.09, ry * bump * 1.12, ((i + 0.5) / n) * 360 - 90);
    const p = pt(cx, cy, rx, ry, ((i + 1) / n) * 360 - 90);
    d += ` Q ${f1(c[0])} ${f1(c[1])} ${f1(p[0])} ${f1(p[1])}`;
  }
  d += " Z";
  const dots = [
    { cx: cx - rx * 0.5, cy: cy + ry * bump + 7, r: 5 },
    { cx: cx - rx * 0.65, cy: cy + ry * bump + 17, r: 3.2 },
  ];
  return { W, H, shapes: [{ d }], dots, tx: cx - tw / 2, ty: cy - th / 2 };
}

function computeGeom(kind: string, tw: number, th: number): Geom {
  if (kind === "shout") return burstGeom(tw, th);
  if (kind === "think") return cloudGeom(tw, th);
  if (kind === "whisper") return whisperGeom(tw, th);
  return speechGeom(tw, th);
}

export function MangaBubble({
  kind = "speech",
  maxHeight = 240,
  className = "",
  textClassName = "",
  children,
}: {
  kind?: string;
  maxHeight?: number; // 縦書きの1列の最大長(これを超えると次の列へ折り返す)
  className?: string;
  textClassName?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [sz, setSz] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setSz((prev) =>
        prev && Math.abs(prev.w - r.width) < 0.6 && Math.abs(prev.h - r.height) < 0.6 ? prev : { w: r.width, h: r.height }
      );
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();
    // Webフォント読込後に再測定
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(measure).catch(() => {});
    }
    return () => ro.disconnect();
  }, []);

  const g = sz ? computeGeom(kind, Math.max(sz.w, 24), Math.max(sz.h, 16)) : null;

  return (
    <div className={`mb mb-${kind} ${className}`} style={{ width: g?.W, height: g?.H }}>
      {g && (
        <svg className="mb-svg" width={g.W} height={g.H} aria-hidden>
          {g.shapes.map((s, i) => (
            <path
              key={i}
              d={s.d}
              fill={s.fill ?? "#ffffff"}
              stroke="#171310"
              strokeWidth={s.sw ?? 2.4}
              strokeLinejoin={kind === "shout" ? "miter" : "round"}
              strokeLinecap="round"
              strokeDasharray={s.dash}
            />
          ))}
          {g.dots?.map((c, i) => (
            <circle key={i} cx={c.cx} cy={c.cy} r={c.r} fill="#fff" stroke="#171310" strokeWidth={2.2} />
          ))}
        </svg>
      )}
      <div
        ref={ref}
        className={`mb-text ${textClassName}`}
        style={{ maxHeight, left: g?.tx ?? 0, top: g?.ty ?? 0, visibility: g ? "visible" : "hidden" }}
      >
        {children}
      </div>
    </div>
  );
}

interface BubbleProps {
  text: string;
  bubble?: string;
  font?: string;
  user: string;
  meta?: React.ReactNode;
}

export default function Bubble({ text, bubble = "speech", font = "antique", user, meta }: BubbleProps) {
  const fc = fontClass(font);
  // 文章量と画面幅から縦書きの列長を決める。
  // 列が増えすぎて吹き出しが画面からはみ出さないよう、幅の予算から逆算する
  const len = Math.max(text.length, 4);
  const fs = 14.5;
  const colW = fs * 1.7;
  const vw = typeof window !== "undefined" ? window.innerWidth : 480;
  const textBudget = Math.min(300, Math.max(150, vw - 120));
  let mhRaw = Math.sqrt(len) * 24;
  if (Math.ceil((len * fs) / mhRaw) * colW > textBudget) {
    mhRaw = (len * fs * colW) / textBudget;
  }
  const mh = Math.min(300, Math.max(90, Math.round(mhRaw)));
  return (
    <div className="bubble-wrap">
      <div className="bubble-meta">
        <span className="name">{user}</span>
        {meta}
      </div>
      {bubble === "narration" ? (
        <div className={`bx-narration ${fc}`} style={{ maxHeight: mh + 60 }}>
          {tcy(text)}
        </div>
      ) : (
        <MangaBubble kind={bubble} className="mb-post" textClassName={fc} maxHeight={mh}>
          {tcy(text)}
        </MangaBubble>
      )}
    </div>
  );
}

export function PostMeta({
  type,
  loc,
  date,
  workTitle,
  workId,
  freeTitle,
}: {
  type: "recommend" | "comment";
  loc?: string;
  date: string;
  workTitle?: string;
  workId?: string;
  freeTitle?: string;
}) {
  return (
    <>
      <span className={`type-tag ${type === "comment" ? "type-comment-tag" : ""}`}>
        {type === "recommend" ? "おすすめ" : "コマ語り"}
      </span>
      {workTitle && workId && (
        <Link className="worklink" href={`/works/${workId}`}>
          『{workTitle}』
        </Link>
      )}
      {freeTitle && <span className="worklink">『{freeTitle}』</span>}
      {loc && <span className="loc">📍 {loc}</span>}
      <span>{date}</span>
    </>
  );
}
