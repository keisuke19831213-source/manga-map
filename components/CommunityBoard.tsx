"use client";

import { useCallback, useEffect, useState } from "react";
import { langFromPath } from "@/lib/i18n";
import { usePathname } from "next/navigation";
import Bubble, { BUBBLE_OPTIONS, FONT_OPTIONS, PostMeta, fontClass } from "@/components/Bubble";
import { SpoilerGuard, locLabel } from "@/components/WorkPosts";
import { emotionText, workTitle } from "@/lib/content-en";
import { workById } from "@/lib/data";
import { emotionOf } from "@/lib/emotions";
import { useWorks } from "@/lib/useWorks";
import { adminHeaders, useAdminKey } from "@/lib/useAdminKey";
import type { BubbleFont, BubbleStyle, Post } from "@/lib/posts";

function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

// 投稿フォームの文言（日英）。ここだけで完結するのでローカルに持つ
const CB = {
  ja: {
    nick: "ニックネーム(省略可)", nickPh: "名無しの読者",
    pick: "おすすめする作品", pickPh: "-- 選択してください --", free: "図鑑にない作品(自由入力)",
    titleLabel: "作品名", titlePh: "例: 寄生獣",
    bubble: "吹き出しの形", font: "文字の書体",
    comment: "おすすめコメント", commentPh: "この作品のどこが凄い? どんな人に読んでほしい?",
    preview: "プレビュー", busy: "投稿中…", submit: "おすすめを投稿する!!",
    ok: "投稿しました!", fail: "投稿に失敗しました", none: "まだ投稿がありません。",
  },
  en: {
    nick: "Nickname (optional)", nickPh: "An anonymous reader",
    pick: "Which work?", pickPh: "-- please choose --", free: "Not in the library (type it in)",
    titleLabel: "Title", titlePh: "e.g. Parasyte",
    bubble: "Balloon shape", font: "Typeface",
    comment: "Why you recommend it", commentPh: "What is great about it? Who should read it?",
    preview: "Preview", busy: "Posting…", submit: "Post your recommendation!!",
    ok: "Posted!", fail: "Could not post", none: "No posts yet.",
  },
} as const;

export default function CommunityBoard() {
  const lang = langFromPath(usePathname() || "/");
  const cb = CB[lang];
  const { works } = useWorks();
  const [adminKey] = useAdminKey();
  const [posts, setPosts] = useState<Post[]>([]);
  const [user, setUser] = useState("");
  const [workSel, setWorkSel] = useState("");
  const [freeTitle, setFreeTitle] = useState("");
  const [text, setText] = useState("");
  const [bubble, setBubble] = useState<BubbleStyle>("speech");
  const [font, setFont] = useState<BubbleFont>("antique");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/posts", { cache: "no-store" });
    if (res.ok) setPosts(await res.json());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...adminHeaders() },
        body: JSON.stringify({
          type: "recommend",
          user,
          workId: workSel && workSel !== "__free__" ? workSel : undefined,
          freeTitle: workSel === "__free__" ? freeTitle : undefined,
          text,
          bubble,
          font,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || cb.fail);
      }
      const created: Post = await res.json();
      // 楽観的に即反映(Blobは数秒で整合するため直後の再取得はしない)
      setPosts((prev) => [created, ...prev.filter((p) => p.id !== created.id)]);
      setText("");
      setFreeTitle("");
      setMsg({ ok: true, text: cb.ok });
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : cb.fail });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {adminKey ? (
      <form className="post-form" onSubmit={submit}>
        <div className="row">
          <div className="field">
            <label>{cb.nick}</label>
            <input value={user} onChange={(e) => setUser(e.target.value)} placeholder={cb.nickPh} maxLength={30} />
          </div>
          <div className="field">
            <label>{cb.pick}</label>
            <select value={workSel} onChange={(e) => setWorkSel(e.target.value)} required>
              <option value="">{cb.pickPh}</option>
              {[...works].sort((a, b) => a.year - b.year).map((w) => (
                <option key={w.id} value={w.id}>
                  {w.title} ({w.year})
                </option>
              ))}
              <option value="__free__">{cb.free}</option>
            </select>
          </div>
          {workSel === "__free__" && (
            <div className="field">
              <label>{cb.titleLabel}</label>
              <input value={freeTitle} onChange={(e) => setFreeTitle(e.target.value)} placeholder={cb.titlePh} required maxLength={60} />
            </div>
          )}
        </div>
        <div className="row">
          <div className="field">
            <label>{cb.bubble}</label>
            <div className="style-picker">
              {BUBBLE_OPTIONS.map((b) => (
                <button key={b.id} type="button" className={`style-opt ${bubble === b.id ? "on" : ""}`} onClick={() => setBubble(b.id)}>
                  {b.label}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <label>{cb.font}</label>
            <div className="style-picker">
              {FONT_OPTIONS.map((f) => (
                <button key={f.id} type="button" className={`style-opt ${f.css} ${font === f.id ? "on" : ""}`} onClick={() => setFont(f.id)}>
                  あ {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="row">
          <div className="field">
            <label>{cb.comment}</label>
            <textarea
              className={fontClass(font)}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={cb.commentPh}
              required
            />
          </div>
        </div>
        {text && (
          <div className="row">
            <div className="field">
              <label>{cb.preview}</label>
              <Bubble text={text} bubble={bubble} font={font} user={user || cb.nickPh} />
            </div>
          </div>
        )}
        <button className="btn" disabled={busy}>
          {busy ? cb.busy : cb.submit}
        </button>
        {msg && <div className={`form-msg ${msg.ok ? "ok" : "err"}`}>{msg.text}</div>}
      </form>
      ) : null}

      {posts.length === 0 && <p style={{ color: "var(--ink-soft)" }}>{cb.none}</p>}
      {posts.map((p) => {
        const work = p.workId ? works.find((w) => w.id === p.workId) : undefined;
        const emo = emotionOf(p.emotion);
        return (
          <SpoilerGuard key={p.id} post={p}>
            <Bubble
              text={p.text}
              bubble={p.bubble}
              font={p.font}
              user={p.user}
              meta={
                <PostMeta
                  type={p.type}
                  loc={locLabel(p, lang)}
                  date={fmtDate(p.createdAt)}
                  workTitle={
                    work ? (workById(work.id) ? workTitle(workById(work.id)!, lang) : work.title) : undefined
                  }
                  workId={work?.id}
                  freeTitle={p.freeTitle}
                  emotion={
                    emo && (
                      <span className="emotion-chip" style={{ borderColor: emo.color, color: emo.color }}>
                        {emo.emoji} {emotionText(emo.id, "label", emo.label, lang)}
                      </span>
                    )
                  }
                />
              }
            />
          </SpoilerGuard>
        );
      })}
    </>
  );
}
