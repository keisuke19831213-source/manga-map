"use client";

import { useMemo } from "react";
import { EMOTIONS, emotionOf } from "@/lib/emotions";
import type { Post } from "@/lib/posts";

// 巻内の読書位置(0-100)。Kindle%はそのまま、ページは1冊≈220pとして換算
export function posOf(p: Post): number | null {
  if (!p.page) return null;
  const n = parseFloat(p.page);
  if (!Number.isFinite(n)) return null;
  if (p.page.includes("%")) return Math.max(0, Math.min(100, n));
  return Math.max(0, Math.min(98, (n / 220) * 100));
}

export const volNum = (p: Post): number => {
  const n = parseInt((p.volume || "").replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(n) && n > 0 ? n : 0; // 0 = 巻の指定なし
};

const LANE_H = 22; // 重なった●を縦にずらす1段の高さ
const MIN_GAP = 3.4; // 同一レーンに置ける●同士の最小距離(%)

interface TlPoint {
  post: Post;
  x: number; // 0-100 (全巻を通した位置)
  lane: number;
}

export default function WorkTimeline({
  comments,
  shelfMaxVol,
  onJump,
}: {
  comments: Post[];
  shelfMaxVol: number; // 全巻棚から分かる最終巻(なければ0)
  onJump: (postId: string) => void;
}) {
  const { points, maxVol, lanes } = useMemo(() => {
    const located = comments.filter((p) => volNum(p) > 0);
    const maxVol = Math.max(shelfMaxVol, ...located.map(volNum), 0);
    if (maxVol === 0 || located.length === 0) return { points: [] as TlPoint[], maxVol: 0, lanes: 0 };
    // 巻の中の位置が不明な語りは巻の中央(50%)に置く
    const pts: TlPoint[] = located
      .map((post) => ({ post, x: ((volNum(post) - 1 + (posOf(post) ?? 50) / 100) / maxVol) * 100, lane: 0 }))
      .sort((a, b) => a.x - b.x);
    // 近すぎる●は上のレーンへ逃がす
    const laneLastX: number[] = [];
    for (const pt of pts) {
      let lane = laneLastX.findIndex((last) => pt.x - last >= MIN_GAP);
      if (lane === -1) lane = laneLastX.length;
      laneLastX[lane] = pt.x;
      pt.lane = lane;
    }
    return { points: pts, maxVol, lanes: laneLastX.length };
  }, [comments, shelfMaxVol]);

  if (points.length === 0) return null;

  // 目盛りは12本以下になる間隔で(1,2,5,10…巻刻み)
  const step = [1, 2, 5, 10, 20, 50].find((s) => maxVol / s <= 12) ?? 100;
  const ticks: number[] = [];
  for (let v = 1; v <= maxVol; v += step) ticks.push(v);

  const usedEmotions = EMOTIONS.filter((e) => points.some((pt) => pt.post.emotion === e.id));
  const hasPlain = points.some((pt) => !emotionOf(pt.post.emotion));

  return (
    <div className="wtl">
      <div className="wtl-title">🗺 名場面タイムライン</div>
      <div className="wtl-sub">
        全{maxVol}巻のどこで心が動いたか。●をタップするとその語りへ飛びます
      </div>
      <div className="wtl-track" style={{ height: 28 + lanes * LANE_H }}>
        {ticks.map((v) => (
          <div key={v} className="wtl-tick" style={{ left: `${((v - 1) / maxVol) * 100}%` }}>
            <span>{v === 1 ? "1巻" : v}</span>
          </div>
        ))}
        {points.map(({ post, x, lane }) => {
          const emo = emotionOf(post.emotion);
          const page = !post.page
            ? ""
            : post.page.includes("%")
              ? ` 位置${post.page}`
              : /^\d+$/.test(post.page.trim())
                ? ` p.${post.page.trim()}`
                : ` ${post.page}`;
          const label = post.spoiler
            ? `${volNum(post)}巻 · ⚠️ ネタバレを含む語り — タップで読む`
            : `${volNum(post)}巻${page}${post.scene ? ` · ${post.scene}` : ""} — タップで語りへ`;
          return (
            <button
              key={post.id}
              className="wtl-dot"
              style={{ left: `${x}%`, bottom: 4 + lane * LANE_H, borderColor: emo?.color ?? "var(--ink)" }}
              title={label}
              onClick={() => onJump(post.id)}
            >
              {emo ? emo.emoji : "💬"}
            </button>
          );
        })}
      </div>
      <div className="wtl-legend">
        {usedEmotions.map((e) => (
          <span key={e.id} style={{ color: e.color }}>
            {e.emoji} {e.label}
          </span>
        ))}
        {hasPlain && <span style={{ color: "var(--ink-soft)" }}>💬 コマ語り</span>}
      </div>
    </div>
  );
}
