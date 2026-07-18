"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Bubble from "@/components/Bubble";
import { SpoilerGuard } from "@/components/WorkPosts";
import { EMOTIONS, emotionOf, type Emotion } from "@/lib/emotions";
import { asinCover, asinLink, amazonLink, coverThumb } from "@/lib/affiliate";
import { useMeta } from "@/lib/useMeta";
import type { Post } from "@/lib/posts";

interface WorkLite {
  id: string;
  title: string;
  author?: string;
}

function usePosts(): Post[] {
  const [posts, setPosts] = useState<Post[]>([]);
  useEffect(() => {
    fetch("/api/posts", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then(setPosts)
      .catch(() => {});
  }, []);
  return posts;
}

function useWorks(): Map<string, WorkLite> {
  const [works, setWorks] = useState<Map<string, WorkLite>>(new Map());
  useEffect(() => {
    fetch("/api/works", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((list: WorkLite[]) => setWorks(new Map(list.map((w) => [w.id, w]))))
      .catch(() => {});
  }, []);
  return works;
}

// 位置ラベル(処方箋の「用法」部分)
function doseLabel(p: Post): string {
  const parts: string[] = [];
  if (p.volume) parts.push(`${p.volume}巻`);
  if (p.page) {
    if (p.page.includes("%")) parts.push(`位置${p.page}`);
    else if (/^\d+$/.test(p.page.trim())) parts.push(`p.${p.page.trim()}`);
    else parts.push(p.page);
  }
  if (p.panel) parts.push(p.panel);
  return parts.join(" · ");
}

/* ============ 感情ホーム(今夜は、どんな気分?) ============ */
export function FeelsHome() {
  const posts = usePosts();
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const p of posts) if (p.emotion) c[p.emotion] = (c[p.emotion] ?? 0) + 1;
    return c;
  }, [posts]);

  return (
    <div className="feels-grid">
      {EMOTIONS.map((e) => {
        const n = counts[e.id] ?? 0;
        return (
          <Link key={e.id} href={`/feels/${e.id}`} className="feels-card" style={{ ["--emo" as string]: e.color }}>
            <span className="fc-emoji">{e.emoji}</span>
            <span className="fc-catch">{e.catch}</span>
            <span className="fc-night">{e.night}</span>
            <span className="fc-count">{n > 0 ? `処方箋 ${n}件` : "調合中…"}</span>
          </Link>
        );
      })}
    </div>
  );
}

/* ============ 感情別ページ(処方箋の束) ============ */
export function FeelsDetail({ emotionId }: { emotionId: string }) {
  const emo = emotionOf(emotionId) as Emotion;
  const posts = usePosts();
  const works = useWorks();
  const meta = useMeta();

  const mine = useMemo(() => posts.filter((p) => p.emotion === emo.id), [posts, emo.id]);

  // 作品ごとにまとめ、語りが多い作品を先頭に
  const groups = useMemo(() => {
    const map = new Map<string, Post[]>();
    for (const p of mine) {
      const key = p.workId ?? `free:${p.freeTitle ?? "?"}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    return [...map.entries()].sort((a, b) => b[1].length - a[1].length);
  }, [mine]);

  // その語りの巻のアフィリエイトリンク(巻がなければ作品リンク)
  const buyLink = (p: Post): { href: string; label: string } | null => {
    if (!p.workId) return null;
    const vols = meta.works[p.workId]?.volumes ?? [];
    const vn = parseInt((p.volume || "").replace(/[^0-9]/g, ""), 10);
    const vol = Number.isFinite(vn) ? vols.find((x) => x.v === vn) : undefined;
    if (vol) return { href: asinLink(meta, vol.asin), label: `${vn}巻を手に入れる` };
    const az = amazonLink(meta, p.workId);
    return az ? { href: az, label: "この作品を手に入れる" } : null;
  };

  return (
    <>
      {/* 他の感情への切替 */}
      <div className="feels-switch">
        {EMOTIONS.map((e) =>
          e.id === emo.id ? (
            <span key={e.id} className="chip active" style={{ background: e.color, borderColor: e.color, color: "#fff" }}>
              {e.emoji} {e.label}
            </span>
          ) : (
            <Link key={e.id} href={`/feels/${e.id}`} className="chip" style={{ borderColor: e.color }}>
              {e.emoji} {e.label}
            </Link>
          )
        )}
      </div>

      {mine.length === 0 && (
        <div className="feels-empty">
          <div style={{ fontSize: 40 }}>{emo.emoji}</div>
          <p>
            この感情の処方箋は、まだ調合中です。
            <br />
            作品ページで「{emo.label}」タグ付きの語りが投稿されると、ここに並びます。
          </p>
          <Link className="btn" href="/works">
            作品図鑑から探しにいく
          </Link>
        </div>
      )}

      {groups.map(([key, list]) => {
        const isFree = key.startsWith("free:");
        const wk = isFree ? null : works.get(key);
        const title = isFree ? key.slice(5) : wk?.title ?? key;
        const cover = !isFree ? coverThumb(meta, key) : null;
        return (
          <section key={key} className="rx-work">
            <div className="rx-head" style={{ ["--emo" as string]: emo.color }}>
              {cover && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cover} alt={title} className="rx-cover" loading="lazy" />
              )}
              <div className="rx-head-body">
                <div className="rx-title">
                  {isFree ? (
                    <span>{title}</span>
                  ) : (
                    <Link href={`/works/${key}`}>{title}</Link>
                  )}
                  <span className="rx-badge">
                    {emo.emoji} ×{list.length}
                  </span>
                </div>
                {wk?.author && <div className="rx-author">{wk.author}</div>}
              </div>
            </div>

            {list.map((p) => {
              const dose = doseLabel(p);
              const buy = buyLink(p);
              return (
                <div key={p.id} className="rx-card">
                  <div className="rx-dose" style={{ ["--emo" as string]: emo.color }}>
                    <span className="rx-dose-label">用法</span>
                    {dose ? <strong>{dose}</strong> : <strong>作品全体</strong>}
                    {p.scene && <span className="rx-scene">🎬 {p.scene}</span>}
                  </div>
                  <SpoilerGuard post={p}>
                    <Bubble text={p.text} bubble={p.bubble} font={p.font} user={p.user} hideMeta />
                  </SpoilerGuard>
                  <div className="rx-foot">
                    <span className="rx-by">— {p.user}</span>
                    {buy && (
                      <a className="rx-buy" href={buy.href} target="_blank" rel="noopener sponsored">
                        📖 {buy.label} →
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </section>
        );
      })}
    </>
  );
}
