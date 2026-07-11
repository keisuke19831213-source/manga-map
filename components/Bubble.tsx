"use client";

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

/* ================= SVG吹き出し形状 =================
 * 吹き出しは viewBox 240x130 のパスで描き、preserveAspectRatio="none" で
 * コンテンツサイズに追従させる。vector-effect: non-scaling-stroke で
 * 線の太さは常に一定 = どのサイズでも「ペンで引いた」線になる。
 * しっぽは輪郭と一体のパスなので、貼り付け感のない本物の吹き出しになる。 */

// セリフ: なめらかな楕円 + 左下に流れる一体のしっぽ
const SPEECH_PATH =
  "M 10 63 C 10 22 58 6 120 6 C 184 6 232 24 232 64 C 232 95 196 111 140 114 " +
  "C 114 115.5 90 114 68 108 C 61 119 48 126 30 130 C 41 121 46 112 47 102 " +
  "C 24 95 10 82 10 63 Z";

// ぼそっ(点線): しっぽ無しの楕円ブロブ
const WHISPER_PATH =
  "M 12 65 C 12 24 60 8 120 8 C 182 8 230 26 230 65 C 230 96 194 112 138 115 " +
  "C 80 118 12 104 12 65 Z";
const WHISPER_TAIL = "M 52 113 Q 46 122 36 128";

// 叫び: 不揃いなトゲの爆発型(決め打ちの疑似乱数で毎回同じ形)
function burstPath(): string {
  const cx = 120, cy = 65;
  const spikes = 13;
  const vary = [1.0, 1.3, 0.92, 1.22, 1.06, 0.86, 1.25, 0.95, 1.32, 0.9, 1.12, 0.84, 1.2];
  const pts: string[] = [];
  for (let i = 0; i < spikes; i++) {
    const a = (i / spikes) * Math.PI * 2 - Math.PI / 2;
    const b = ((i + 0.5) / spikes) * Math.PI * 2 - Math.PI / 2;
    const ox = cx + Math.cos(a) * 90 * vary[i];
    const oy = cy + Math.sin(a) * 46 * vary[i];
    const ix = cx + Math.cos(b) * 68;
    const iy = cy + Math.sin(b) * 33;
    pts.push(`${i === 0 ? "M" : "L"} ${ox.toFixed(1)} ${oy.toFixed(1)} L ${ix.toFixed(1)} ${iy.toFixed(1)}`);
  }
  return pts.join(" ") + " Z";
}
const SHOUT_PATH = burstPath();

// 心の声: もくもくの雲形(外向きの弧の連続)
function cloudPath(): string {
  const cx = 120, cy = 65, rx = 96, ry = 46;
  const n = 11;
  const pt = (i: number) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry];
  };
  const ctrl = (i: number) => {
    const a = ((i + 0.5) / n) * Math.PI * 2 - Math.PI / 2;
    return [cx + Math.cos(a) * rx * 1.24, cy + Math.sin(a) * ry * 1.3];
  };
  let d = `M ${pt(0)[0].toFixed(1)} ${pt(0)[1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const c = ctrl(i);
    const p = pt(i + 1);
    d += ` Q ${c[0].toFixed(1)} ${c[1].toFixed(1)} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
  }
  return d + " Z";
}
const THINK_PATH = cloudPath();

export function BubbleBg({ kind }: { kind: string }) {
  let d = SPEECH_PATH;
  let dash: string | undefined;
  let tail: string | undefined;
  if (kind === "shout") d = SHOUT_PATH;
  else if (kind === "think") d = THINK_PATH;
  else if (kind === "whisper") {
    d = WHISPER_PATH;
    dash = "7 6";
    tail = WHISPER_TAIL;
  }
  return (
    <svg className="bx-bg" viewBox="0 0 240 130" preserveAspectRatio="none" aria-hidden>
      <path
        d={d}
        fill="#ffffff"
        stroke="#171310"
        strokeWidth={2.6}
        strokeLinejoin="round"
        strokeDasharray={dash}
        style={{ vectorEffect: "non-scaling-stroke" }}
      />
      {tail && (
        <path
          d={tail}
          fill="none"
          stroke="#171310"
          strokeWidth={2.2}
          strokeDasharray="5 5"
          style={{ vectorEffect: "non-scaling-stroke" }}
        />
      )}
    </svg>
  );
}

interface BubbleProps {
  text: string;
  bubble?: string;
  font?: string;
  user: string;
  meta?: React.ReactNode; // タグ・日付・作品リンクなど
}

export default function Bubble({ text, bubble = "speech", font = "antique", user, meta }: BubbleProps) {
  const fc = fontClass(font);
  return (
    <div className="bubble-wrap">
      <div className="bubble-meta">
        <span className="name">{user}</span>
        {meta}
      </div>
      {bubble === "narration" ? (
        <div className={`bx bx-narration ${fc}`}>{text}</div>
      ) : (
        <div className={`bx bx-${bubble}`}>
          <BubbleBg kind={bubble} />
          {bubble === "think" && (
            <>
              <span className="bx-dot bx-dot1" />
              <span className="bx-dot bx-dot2" />
            </>
          )}
          <div className={`bx-content ${fc}`}>{text}</div>
        </div>
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
