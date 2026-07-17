"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Bubble, { BUBBLE_OPTIONS, FONT_OPTIONS, PostMeta, fontClass } from "@/components/Bubble";
import { adminHeaders, useAdminKey } from "@/lib/useAdminKey";
import { asinCover, asinLink, coverThumb, type SiteMeta } from "@/lib/affiliate";
import { useMeta } from "@/lib/useMeta";
import type { BubbleFont, BubbleStyle, Post } from "@/lib/posts";

function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

export function locLabel(p: Post) {
  const parts: string[] = [];
  if (p.volume) parts.push(`${p.volume}巻`);
  if (p.page) {
    // "37%"=Kindle位置 / 数値=紙のページ / それ以外(「終盤」など)はそのまま
    if (p.page.includes("%")) parts.push(`位置${p.page}`);
    else if (/^\d+$/.test(p.page.trim())) parts.push(`p.${p.page.trim()}`);
    else parts.push(p.page);
  }
  if (p.panel) parts.push(`${p.panel}`);
  return parts.join(" · ");
}

// 巻内の読書位置(0-100)。Kindle%はそのまま、ページは1冊≈220pとして換算
function posOf(p: Post): number | null {
  if (!p.page) return null;
  const n = parseFloat(p.page);
  if (!Number.isFinite(n)) return null;
  if (p.page.includes("%")) return Math.max(0, Math.min(100, n));
  return Math.max(0, Math.min(98, (n / 220) * 100));
}

const volNum = (p: Post): number => {
  const n = parseInt((p.volume || "").replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(n) && n > 0 ? n : 0; // 0 = 巻の指定なし
};

/* ================= 全巻書影シェルフ ================= */
function VolumeShelf({
  workId,
  workTitle,
  meta,
  commentCounts,
  onJump,
}: {
  workId: string;
  workTitle: string;
  meta: SiteMeta;
  commentCounts: Record<number, number>;
  onJump: (v: number) => void;
}) {
  const volumes = meta.works[workId]?.volumes ?? [];
  if (volumes.length === 0) return null;
  return (
    <>
      <h2 className="section-title">📚 巻をそろえる ({volumes.length}冊)</h2>
      <p className="section-sub">
        書影をクリックするとAmazonでその巻が開きます。💬 はその巻への語りの数 — クリックで読めます。
      </p>
      <div className="vol-shelf" role="list">
        {volumes.map((vol) => {
          const cnt = commentCounts[vol.v] ?? 0;
          return (
            <div key={vol.v} className="vol-card" role="listitem">
              <a
                href={asinLink(meta, vol.asin)}
                target="_blank"
                rel="noopener sponsored"
                title={`${workTitle} ${vol.v}巻をAmazonで見る`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={asinCover(vol.asin)} alt={`${workTitle} ${vol.v}巻`} loading="lazy" />
                <span className="vol-num">{vol.v}</span>
              </a>
              {cnt > 0 && (
                <button className="vol-cbadge" onClick={() => onJump(vol.v)} title={`${vol.v}巻への語り ${cnt}件を読む`}>
                  💬{cnt}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ================= ネタバレぼかし ================= */
function SpoilerGuard({ post, children }: { post: Post; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  if (!post.spoiler || open) return <>{children}</>;
  return (
    <div className="spoiler-wrap">
      <div className="spoiler-inner">{children}</div>
      <button className="spoiler-cover" onClick={() => setOpen(true)}>
        ⚠️ ネタバレを含む語り
        <span>タップして表示</span>
      </button>
    </div>
  );
}

export default function WorkPosts({ workId, workTitle }: { workId: string; workTitle: string }) {
  const [adminKey] = useAdminKey();
  const meta = useMeta();
  const [posts, setPosts] = useState<Post[]>([]);
  const [mode, setMode] = useState<"recommend" | "comment">("recommend");
  const [user, setUser] = useState("");
  const [volume, setVolume] = useState("");
  const [posKind, setPosKind] = useState<"page" | "pct">("page");
  const [pos, setPos] = useState("");
  const [panel, setPanel] = useState("");
  const [scene, setScene] = useState("");
  const [spoiler, setSpoiler] = useState(false);
  const [text, setText] = useState("");
  const [bubble, setBubble] = useState<BubbleStyle>("speech");
  const [font, setFont] = useState<BubbleFont>("antique");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const groupRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const load = useCallback(async () => {
    const res = await fetch(`/api/posts?workId=${encodeURIComponent(workId)}`, { cache: "no-store" });
    if (res.ok) setPosts(await res.json());
  }, [workId]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const page = mode === "comment" && pos.trim() ? (posKind === "pct" ? `${parseFloat(pos)}%` : pos.trim()) : undefined;
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...adminHeaders() },
        body: JSON.stringify({
          type: mode,
          user,
          workId,
          volume: mode === "comment" ? volume : undefined,
          page,
          panel: mode === "comment" ? panel : undefined,
          scene: mode === "comment" ? scene : undefined,
          spoiler: mode === "comment" ? spoiler : undefined,
          text,
          bubble,
          font,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "投稿に失敗しました");
      }
      const created: Post = await res.json();
      // 楽観的に即反映(Blobは数秒で整合するため直後の再取得はしない)
      setPosts((prev) => [created, ...prev.filter((p) => p.id !== created.id)]);
      setText("");
      setVolume("");
      setPos("");
      setPanel("");
      setScene("");
      setSpoiler(false);
      setMsg({ ok: true, text: "投稿しました!" });
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "投稿に失敗しました" });
    } finally {
      setBusy(false);
    }
  };

  const recommends = posts.filter((p) => p.type === "recommend");
  const comments = posts.filter((p) => p.type === "comment");

  // 巻ごとにグルーピング(巻番号昇順、番号なしは最後)。巻内は読書位置順
  const groups = useMemo(() => {
    const map = new Map<number, Post[]>();
    for (const p of comments) {
      const v = volNum(p);
      if (!map.has(v)) map.set(v, []);
      map.get(v)!.push(p);
    }
    for (const list of map.values()) {
      list.sort((a, b) => {
        const pa = posOf(a) ?? 999;
        const pb = posOf(b) ?? 999;
        return pa - pb;
      });
    }
    return [...map.entries()].sort((a, b) => (a[0] === 0 ? 1 : b[0] === 0 ? -1 : a[0] - b[0]));
  }, [comments]);

  const commentCounts = useMemo(() => {
    const c: Record<number, number> = {};
    for (const p of comments) {
      const v = volNum(p);
      if (v > 0) c[v] = (c[v] ?? 0) + 1;
    }
    return c;
  }, [comments]);

  const jumpToVolume = (v: number) => {
    groupRefs.current[v]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const jumpToPost = (id: string) => {
    document.getElementById(`post-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    setFlash(id);
    setTimeout(() => setFlash(null), 1600);
  };

  const volumes = meta.works[workId]?.volumes ?? [];
  const volCoverOf = (v: number): string | null => {
    const found = volumes.find((x) => x.v === v);
    return found ? asinCover(found.asin) : coverThumb(meta, workId);
  };

  return (
    <>
      <VolumeShelf workId={workId} workTitle={workTitle} meta={meta} commentCounts={commentCounts} onJump={jumpToVolume} />

      {adminKey ? (
      <>
      <h2 className="section-title">読者の声を投稿する</h2>
      <p className="section-sub">
        『{workTitle}』への熱いセリフをどうぞ。巻・ページ(Kindleなら位置%)・コマまで指定して、マニアックに語れます。
      </p>

      <form className="post-form" onSubmit={submit}>
        <div className="row">
          <button
            type="button"
            className={`chip ${mode === "recommend" ? "active" : ""}`}
            onClick={() => setMode("recommend")}
          >
            おすすめを書く
          </button>
          <button
            type="button"
            className={`chip ${mode === "comment" ? "active" : ""}`}
            onClick={() => setMode("comment")}
          >
            シーン・コマに語る
          </button>
        </div>
        <div className="row">
          <div className="field">
            <label>ニックネーム(省略可)</label>
            <input value={user} onChange={(e) => setUser(e.target.value)} placeholder="名無しの読者" maxLength={30} />
          </div>
        </div>
        {mode === "comment" && (
          <>
            <div className="row">
              <div className="field small">
                <label>巻</label>
                <input value={volume} onChange={(e) => setVolume(e.target.value)} placeholder="例: 31" maxLength={10} inputMode="numeric" />
              </div>
              <div className="field small">
                <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  位置
                  <span className="pos-toggle">
                    <button type="button" className={posKind === "page" ? "on" : ""} onClick={() => setPosKind("page")}>紙p.</button>
                    <button type="button" className={posKind === "pct" ? "on" : ""} onClick={() => setPosKind("pct")}>Kindle%</button>
                  </span>
                </label>
                <input
                  value={pos}
                  onChange={(e) => setPos(e.target.value)}
                  placeholder={posKind === "page" ? "例: 152" : "例: 37"}
                  maxLength={6}
                  inputMode="decimal"
                />
              </div>
              <div className="field small">
                <label>コマ(任意)</label>
                <input value={panel} onChange={(e) => setPanel(e.target.value)} placeholder="例: 見開き" maxLength={20} />
              </div>
            </div>
            <div className="row">
              <div className="field">
                <label>シーン名(任意) — 語りの見出しになります</label>
                <input value={scene} onChange={(e) => setScene(e.target.value)} placeholder="例: 山王戦ラスト、左手はそえるだけ" maxLength={50} />
              </div>
              <div className="field small" style={{ alignSelf: "flex-end" }}>
                <button
                  type="button"
                  className={`chip spoiler-chip ${spoiler ? "active" : ""}`}
                  onClick={() => setSpoiler(!spoiler)}
                  title="ネタバレを含む投稿はぼかして表示されます"
                >
                  ⚠️ ネタバレを含む
                </button>
              </div>
            </div>
          </>
        )}
        <div className="row">
          <div className="field">
            <label>吹き出しの形</label>
            <div className="style-picker">
              {BUBBLE_OPTIONS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  className={`style-opt ${bubble === b.id ? "on" : ""}`}
                  onClick={() => setBubble(b.id)}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="row">
          <div className="field">
            <label>文字の書体</label>
            <div className="style-picker">
              {FONT_OPTIONS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`style-opt ${f.css} ${font === f.id ? "on" : ""}`}
                  onClick={() => setFont(f.id)}
                >
                  あ {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="row">
          <div className="field">
            <label>{mode === "recommend" ? "おすすめコメント" : "そのシーン・コマのどこが凄い?"}</label>
            <textarea
              className={fontClass(font)}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                mode === "recommend"
                  ? "どんな人に読んでほしい? どこから読むのがおすすめ?"
                  : "演出、コマ割り、セリフ、線…このシーンの何に痺れたかを語ってください"
              }
              required
            />
          </div>
        </div>
        {text && (
          <div className="row">
            <div className="field">
              <label>プレビュー</label>
              <Bubble text={text} bubble={bubble} font={font} user={user || "名無しの読者"} />
            </div>
          </div>
        )}
        <button className="btn" disabled={busy}>
          {busy ? "投稿中…" : "投稿する!!"}
        </button>
        {msg && <div className={`form-msg ${msg.ok ? "ok" : "err"}`}>{msg.text}</div>}
      </form>
      </>
      ) : null}

      <h2 className="section-title">コマ語りマップ ({comments.length})</h2>
      <p className="section-sub">
        名場面・名ゴマをピンポイントで語る。バーは1冊の読書位置 — ●をタップするとその語りへ飛びます
      </p>
      {comments.length === 0 && (
        <p style={{ color: "var(--ink-soft)", fontSize: 13 }}>まだコメントがありません。心に残ったコマを語ってみましょう。</p>
      )}
      {groups.map(([v, list]) => (
        <div
          key={v}
          className="vol-group"
          ref={(el) => {
            groupRefs.current[v] = el;
          }}
        >
          <div className="vol-group-head">
            {v > 0 && volCoverOf(v) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={volCoverOf(v)!} alt={`${v}巻`} className="vg-cover" loading="lazy" />
            )}
            <div className="vg-body">
              <div className="vg-title">
                {v > 0 ? `第${v}巻` : "巻の指定なし"}
                <span className="vg-count">💬 {list.length}</span>
                {v > 0 && volumes.find((x) => x.v === v) && (
                  <a
                    className="vg-buy"
                    href={asinLink(meta, volumes.find((x) => x.v === v)!.asin)}
                    target="_blank"
                    rel="noopener sponsored"
                  >
                    この巻を読む →
                  </a>
                )}
              </div>
              {/* 読書位置バー: コメントの位置に●を打つ */}
              {list.some((p) => posOf(p) !== null) && (
                <div className="pos-bar" title="1冊のどのあたりが語られているか">
                  <span className="pos-s">はじまり</span>
                  {list.map((p) => {
                    const pp = posOf(p);
                    if (pp === null) return null;
                    return (
                      <button
                        key={p.id}
                        className="pos-dot"
                        style={{ left: `${pp}%` }}
                        title={`${p.scene || locLabel(p)} — タップで語りへ`}
                        onClick={() => jumpToPost(p.id)}
                      />
                    );
                  })}
                  <span className="pos-e">おわり</span>
                </div>
              )}
            </div>
          </div>
          {list.map((p) => (
            <div key={p.id} id={`post-${p.id}`} className={flash === p.id ? "post-flash" : ""}>
              {p.scene && <div className="scene-tag">🎬 {p.scene}</div>}
              <SpoilerGuard post={p}>
                <Bubble
                  text={p.text}
                  bubble={p.bubble}
                  font={p.font}
                  user={p.user}
                  meta={<PostMeta type="comment" loc={locLabel(p)} date={fmtDate(p.createdAt)} />}
                />
              </SpoilerGuard>
            </div>
          ))}
        </div>
      ))}

      <h2 className="section-title">みんなのおすすめ ({recommends.length})</h2>
      <p className="section-sub">この作品を推す声</p>
      {recommends.length === 0 && (
        <p style={{ color: "var(--ink-soft)", fontSize: 13 }}>まだ投稿がありません。最初のおすすめを書いてみませんか?</p>
      )}
      {recommends.map((p) => (
        <Bubble
          key={p.id}
          text={p.text}
          bubble={p.bubble}
          font={p.font}
          user={p.user}
          meta={<PostMeta type="recommend" date={fmtDate(p.createdAt)} />}
        />
      ))}
    </>
  );
}
