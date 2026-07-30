"use client";

import { usePathname } from "next/navigation";
import { langFromPath, type Lang } from "@/lib/i18n";
import { emotionText } from "@/lib/content-en";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Bubble, { BUBBLE_OPTIONS, FONT_OPTIONS, PostMeta, fontClass } from "@/components/Bubble";
import { adminHeaders, useAdminKey } from "@/lib/useAdminKey";
import { asinCover, asinLink, coverThumb, type SiteMeta } from "@/lib/affiliate";
import { useMeta } from "@/lib/useMeta";
import { EMOTIONS, emotionOf, type EmotionId } from "@/lib/emotions";
import type { BubbleFont, BubbleStyle, Post } from "@/lib/posts";
import WorkTimeline, { posOf, volNum } from "@/components/WorkTimeline";

function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

// ページ/位置/コマの表示(巻は含めない)
function pageLabel(p: Post, lang: Lang = "ja"): string {
  if (!p.page) return "";
  if (p.page.includes("%")) return lang === "en" ? `at ${p.page}` : `位置${p.page}`;
  if (/^\d+$/.test(p.page.trim())) return `p.${p.page.trim()}`;
  return p.page;
}

// 巻を含む位置ラベル(地図・年表など、作品ページ外で使う)
// 投稿UIの文言（日英）。ここで完結するのでローカルに持つ
const WP = {
  ja: {
    lang: "ja" as const,
    tabRec: "👍 おすすめ", tabPanel: "💬 コマ語り",
    voicesFor: "この作品を推す声", panelTalk: "コマ語り",
    noneRec: "まだ投稿がありません。最初のおすすめを書いてみませんか?",
    nonePanel: "まだコメントがありません。心に残ったコマを語ってみましょう。",
    postVoice: "読者の声を投稿する",
    nick: "ニックネーム(省略可)", nickPh: "名無しの読者",
    vol: "巻", volNone: "巻の指定なし", page: "紙p.", panel: "コマ", panelOpt: "コマ(任意)",
    sceneName: "シーン名(任意) — 語りの見出しになります",
    section: "ページ内セクション", sectionHint: "1冊のどのあたりが語られているか",
    start: "はじまり", end: "おわり",
    recComment: "おすすめコメント",
    recPh: "どんな人に読んでほしい? どこから読むのがおすすめ?",
    panelPh: "演出、コマ割り、セリフ、線…このシーンの何に痺れたかを語ってください",
    scenePh: "例: 山王戦ラスト、左手はそえるだけ",
    whatGreat: "そのシーン・コマのどこが凄い?",
    bubble: "吹き出しの形", font: "文字の書体", preview: "プレビュー",
    spoilerNote: "ネタバレを含む投稿はぼかして表示されます",
    tapShow: "タップして表示",
    emotions: "💗 この作品が起こした感情",
    emotionHint: "感情をタップすると、同じ感情のコマを全作品から逆引きできます",
    busy: "投稿中…", submit: "投稿する!!", ok: "投稿しました!", fail: "投稿に失敗しました",
    shelf: "📚 巻をそろえる", tl: "🗺 タイムライン", emo: "💗 感情",
    volumes: "冊", spoilerChip: "⚠️ ネタバレを含む", spoilerTalk: "⚠️ ネタバレを含む語り",
    shelfSub: "書影をクリックするとAmazonでその巻が開きます。💬 はその巻への語りの数 — クリックで読めます。",
    panelMap: "コマ語りマップ", allRecs: "みんなのおすすめ", readVol: "この巻を読む →",
    panelMapSub: "名場面・名ゴマをピンポイントで語る。バーは1冊の読書位置 — ●をタップするとその語りへ飛びます",
  },
  en: {
    lang: "en" as const,
    tabRec: "👍 Recommend", tabPanel: "💬 Panel talk",
    voicesFor: "Voices for this work", panelTalk: "Panel talk",
    noneRec: "No posts yet. Want to write the first recommendation?",
    nonePanel: "No comments yet. Tell us about a panel that stayed with you.",
    postVoice: "Add your voice",
    nick: "Nickname (optional)", nickPh: "An anonymous reader",
    vol: "Vol.", volNone: "no volume given", page: "p.", panel: "Panel", panelOpt: "Panel (optional)",
    sceneName: "Scene name (optional) — becomes the heading",
    section: "Where in the volume", sectionHint: "roughly where in the book this is",
    start: "start", end: "end",
    recComment: "Your recommendation",
    recPh: "Who should read it? Where would you start?",
    panelPh: "Staging, panel layout, the lines, the linework — tell us what got you",
    scenePh: "e.g. the end of the Sannoh match",
    whatGreat: "What is great about that scene or panel?",
    bubble: "Balloon shape", font: "Typeface", preview: "Preview",
    spoilerNote: "Posts marked as spoilers are shown blurred",
    tapShow: "Tap to reveal",
    emotions: "💗 Feelings this work set off",
    emotionHint: "Tap a feeling to find panels with the same feeling across every work",
    busy: "Posting…", submit: "Post!!", ok: "Posted!", fail: "Could not post",
    shelf: "📚 Collect the volumes", tl: "🗺 Timeline", emo: "💗 Feelings",
    volumes: " volumes", spoilerChip: "⚠️ Contains spoilers", spoilerTalk: "⚠️ Contains spoilers",
    shelfSub: "Click a cover to open that volume on Amazon. 💬 is how many people have talked about that volume — click to read them.",
    panelMap: "Panel-talk map", allRecs: "Recommendations", readVol: "Read this volume →",
    panelMapSub: "Talk about one exact scene or panel. The bar is your position through a volume — tap a dot to jump to that post.",
  },
} as const;

export function locLabel(p: Post, lang: Lang = "ja") {
  const parts: string[] = [];
  if (p.volume) parts.push(lang === "en" ? `Vol.${p.volume}` : `${p.volume}巻`);
  const pl = pageLabel(p, lang);
  if (pl) parts.push(pl);
  if (p.panel) parts.push(`${p.panel}`);
  return parts.join(" · ");
}

// 巻グループ内で使う位置ラベル(巻は見出しにあるので省く)
function inVolLabel(p: Post): string {
  const parts: string[] = [];
  const pl = pageLabel(p);
  if (pl) parts.push(pl);
  if (p.panel) parts.push(p.panel);
  return parts.join(" · ");
}

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
  const wp = WP[langFromPath(usePathname() || "/")];
  const volumes = meta.works[workId]?.volumes ?? [];
  if (volumes.length === 0) return null;
  return (
    <>
      <h2 className="section-title">
        {wp.shelf} ({volumes.length}
        {wp.volumes})
      </h2>
      <p className="section-sub">
{wp.shelfSub}
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
export function SpoilerGuard({ post, children }: { post: Post; children: React.ReactNode }) {
  const wp = WP[langFromPath(usePathname() || "/")];
  const [open, setOpen] = useState(false);
  if (!post.spoiler || open) return <>{children}</>;
  return (
    <div className="spoiler-wrap">
      <div className="spoiler-inner">{children}</div>
      <button className="spoiler-cover" onClick={() => setOpen(true)}>
        {wp.spoilerTalk}
        <span>{wp.tapShow}</span>
      </button>
    </div>
  );
}

export default function WorkPosts({ workId, workTitle }: { workId: string; workTitle: string }) {
  const wp = WP[langFromPath(usePathname() || "/")];
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
  const [emotion, setEmotion] = useState<EmotionId | "">("");
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
          emotion: emotion || undefined,
          text,
          bubble,
          font,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || wp.fail);
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
      setEmotion("");
      setMsg({ ok: true, text: wp.ok });
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : wp.fail });
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

  // 感情の集計(この作品が起こした感情の地図の種)。多い順
  const emotionTally = useMemo(() => {
    const c: Record<string, number> = {};
    for (const p of posts) if (p.emotion) c[p.emotion] = (c[p.emotion] ?? 0) + 1;
    return EMOTIONS.map((e) => ({ e, n: c[e.id] ?? 0 })).filter((x) => x.n > 0).sort((a, b) => b.n - a.n);
  }, [posts]);
  const emotionTotal = emotionTally.reduce((s, x) => s + x.n, 0);

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
      {/* セクションジャンプ(長いページの回遊用) */}
      <nav className="wk-jump" aria-label="ページ内セクション">
        {volumes.length > 0 && <a href="#shelf">{wp.shelf}</a>}
        {comments.some((p) => volNum(p) > 0) && <a href="#timeline">{wp.tl}</a>}
        {emotionTotal > 0 && <a href="#emotions">{wp.emo}</a>}
        <a href="#talks">{wp.tabPanel}{comments.length > 0 ? ` (${comments.length})` : ""}</a>
        <a href="#recommends">{wp.tabRec}{recommends.length > 0 ? ` (${recommends.length})` : ""}</a>
      </nav>

      <div id="shelf" className="wk-anchor" />
      <VolumeShelf workId={workId} workTitle={workTitle} meta={meta} commentCounts={commentCounts} onJump={jumpToVolume} />

      <div id="timeline" className="wk-anchor" />
      <WorkTimeline
        comments={comments}
        shelfMaxVol={volumes.length > 0 ? Math.max(...volumes.map((x) => x.v)) : 0}
        onJump={jumpToPost}
      />

      <div id="emotions" className="wk-anchor" />
      {emotionTotal > 0 && (
        <div className="emotion-map">
          <div className="emotion-map-title">{wp.emotions}</div>
          <div className="emotion-bars">
            {emotionTally.map(({ e, n }) => (
              <a key={e.id} href={`/feels/${e.id}`} className="emotion-bar-row" title={emotionText(e.id, "label", e.label, wp.lang)}>
                <span className="eb-label" style={{ color: e.color }}>
                  {e.emoji} {emotionText(e.id, "label", e.label, wp.lang)}
                </span>
                <span className="eb-track">
                  <span className="eb-fill" style={{ width: `${(n / emotionTally[0].n) * 100}%`, background: e.color }} />
                </span>
                <span className="eb-n">{n}</span>
              </a>
            ))}
          </div>
          <div className="emotion-map-more">{wp.emotionHint}</div>
        </div>
      )}

      {adminKey ? (
      <>
      <h2 className="section-title">{wp.postVoice}</h2>
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
            <label>{wp.nick}</label>
            <input value={user} onChange={(e) => setUser(e.target.value)} placeholder={wp.nickPh} maxLength={30} />
          </div>
        </div>
        {mode === "comment" && (
          <>
            <div className="row">
              <div className="field small">
                <label>{wp.vol}</label>
                <input value={volume} onChange={(e) => setVolume(e.target.value)} placeholder="例: 31" maxLength={10} inputMode="numeric" />
              </div>
              <div className="field small">
                <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  位置
                  <span className="pos-toggle">
                    <button type="button" className={posKind === "page" ? "on" : ""} onClick={() => setPosKind("page")}>{wp.page}</button>
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
                <label>{wp.panelOpt}</label>
                <input value={panel} onChange={(e) => setPanel(e.target.value)} placeholder="例: 見開き" maxLength={20} />
              </div>
            </div>
            <div className="row">
              <div className="field">
                <label>{wp.sceneName}</label>
                <input value={scene} onChange={(e) => setScene(e.target.value)} placeholder={wp.scenePh} maxLength={50} />
              </div>
              <div className="field small" style={{ alignSelf: "flex-end" }}>
                <button
                  type="button"
                  className={`chip spoiler-chip ${spoiler ? "active" : ""}`}
                  onClick={() => setSpoiler(!spoiler)}
                  title={wp.spoilerNote}
                >
                  {wp.spoilerChip}
                </button>
              </div>
            </div>
          </>
        )}
        <div className="row">
          <div className="field">
            <label>{wp.bubble}</label>
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
            <label>{wp.font}</label>
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
            <label>この{mode === "recommend" ? "作品" : "コマ"}で、あなたは? (任意)</label>
            <div className="emotion-picker">
              {EMOTIONS.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  className={`emotion-opt ${emotion === e.id ? "on" : ""}`}
                  style={emotion === e.id ? { borderColor: e.color, background: e.color, color: "#fff" } : { borderColor: e.color }}
                  onClick={() => setEmotion(emotion === e.id ? "" : e.id)}
                >
                  {e.emoji} {e.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="row">
          <div className="field">
            <label>{mode === "recommend" ? "おすすめコメント" : wp.whatGreat}</label>
            <textarea
              className={fontClass(font)}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                mode === "recommend"
                  ? wp.recPh
                  : wp.panelPh
              }
              required
            />
          </div>
        </div>
        {text && (
          <div className="row">
            <div className="field">
              <label>{wp.preview}</label>
              <Bubble text={text} bubble={bubble} font={font} user={user || wp.nickPh} />
            </div>
          </div>
        )}
        <button className="btn" disabled={busy}>
          {busy ? wp.busy : wp.submit}
        </button>
        {msg && <div className={`form-msg ${msg.ok ? "ok" : "err"}`}>{msg.text}</div>}
      </form>
      </>
      ) : null}

      <div id="talks" className="wk-anchor" />
      <h2 className="section-title">{wp.panelMap} ({comments.length})</h2>
      <p className="section-sub">
        {wp.panelMapSub}
      </p>
      {comments.length === 0 && (
        <p style={{ color: "var(--ink-soft)", fontSize: 13 }}>{wp.nonePanel}</p>
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
              <img src={volCoverOf(v)!} alt={`${wp.vol}${v}`} className="vg-cover" loading="lazy" />
            )}
            <div className="vg-body">
              <div className="vg-title">
                {v > 0 ? `${wp.vol}${v}` : wp.volNone}
                <span className="vg-count">💬 {list.length}</span>
                {v > 0 && volumes.find((x) => x.v === v) && (
                  <a
                    className="vg-buy"
                    href={asinLink(meta, volumes.find((x) => x.v === v)!.asin)}
                    target="_blank"
                    rel="noopener sponsored"
                  >
                    {wp.readVol}
                  </a>
                )}
              </div>
              {/* 読書位置バー: コメントの位置に●を打つ */}
              {list.some((p) => posOf(p) !== null) && (
                <div className="pos-bar" title={wp.sectionHint}>
                  <span className="pos-s">{wp.start}</span>
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
                  <span className="pos-e">{wp.end}</span>
                </div>
              )}
            </div>
          </div>
          {list.map((p) => {
            const loc = inVolLabel(p);
            const emo = emotionOf(p.emotion);
            return (
              <div key={p.id} id={`post-${p.id}`} className={`talk-card ${flash === p.id ? "post-flash" : ""}`}>
                <div className="talk-head">
                  {p.scene ? (
                    <span className="talk-scene">🎬 {p.scene}</span>
                  ) : (
                    <span className="talk-scene talk-scene-plain">{wp.panelTalk}</span>
                  )}
                  {emo && (
                    <span className="emotion-chip" style={{ borderColor: emo.color, color: emo.color }}>
                      {emo.emoji} {emotionText(emo.id, "label", emo.label, wp.lang)}
                    </span>
                  )}
                  {loc && <span className="talk-pos">📖 {loc}</span>}
                </div>
                <SpoilerGuard post={p}>
                  <Bubble text={p.text} bubble={p.bubble} font={p.font} user={p.user} hideMeta />
                </SpoilerGuard>
                <div className="talk-by">
                  — {p.user} <span className="talk-date">· {fmtDate(p.createdAt)}</span>
                </div>
              </div>
            );
          })}
        </div>
      ))}

      <div id="recommends" className="wk-anchor" />
      <h2 className="section-title">{wp.allRecs} ({recommends.length})</h2>
      <p className="section-sub">{wp.voicesFor}</p>
      {recommends.length === 0 && (
        <p style={{ color: "var(--ink-soft)", fontSize: 13 }}>{wp.noneRec}</p>
      )}
      {recommends.map((p) => {
        const emo = emotionOf(p.emotion);
        return (
          <Bubble
            key={p.id}
            text={p.text}
            bubble={p.bubble}
            font={p.font}
            user={p.user}
            meta={
              <PostMeta
                type="recommend"
                date={fmtDate(p.createdAt)}
                emotion={
                  emo && (
                    <span className="emotion-chip" style={{ borderColor: emo.color, color: emo.color }}>
                      {emo.emoji} {emotionText(emo.id, "label", emo.label, wp.lang)}
                    </span>
                  )
                }
              />
            }
          />
        );
      })}
    </>
  );
}
