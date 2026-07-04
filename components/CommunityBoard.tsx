"use client";

import { useCallback, useEffect, useState } from "react";
import Bubble, { BUBBLE_OPTIONS, FONT_OPTIONS, PostMeta, fontClass } from "@/components/Bubble";
import { WORKS, workById } from "@/lib/data";
import type { BubbleFont, BubbleStyle, Post } from "@/lib/posts";

function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

function locLabel(p: Post) {
  const parts: string[] = [];
  if (p.volume) parts.push(`${p.volume}巻`);
  if (p.page) parts.push(`${p.page}ページ`);
  if (p.panel) parts.push(`${p.panel}`);
  return parts.join(" / ");
}

export default function CommunityBoard() {
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
        headers: { "Content-Type": "application/json" },
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
        throw new Error(err.error || "投稿に失敗しました");
      }
      setText("");
      setFreeTitle("");
      setMsg({ ok: true, text: "投稿しました!" });
      await load();
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "投稿に失敗しました" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <form className="post-form" onSubmit={submit}>
        <div className="row">
          <div className="field">
            <label>ニックネーム(省略可)</label>
            <input value={user} onChange={(e) => setUser(e.target.value)} placeholder="名無しの読者" maxLength={30} />
          </div>
          <div className="field">
            <label>おすすめする作品</label>
            <select value={workSel} onChange={(e) => setWorkSel(e.target.value)} required>
              <option value="">-- 選択してください --</option>
              {[...WORKS].sort((a, b) => a.year - b.year).map((w) => (
                <option key={w.id} value={w.id}>
                  {w.title} ({w.year})
                </option>
              ))}
              <option value="__free__">図鑑にない作品(自由入力)</option>
            </select>
          </div>
          {workSel === "__free__" && (
            <div className="field">
              <label>作品名</label>
              <input value={freeTitle} onChange={(e) => setFreeTitle(e.target.value)} placeholder="例: 寄生獣" required maxLength={60} />
            </div>
          )}
        </div>
        <div className="row">
          <div className="field">
            <label>吹き出しの形</label>
            <div className="style-picker">
              {BUBBLE_OPTIONS.map((b) => (
                <button key={b.id} type="button" className={`style-opt ${bubble === b.id ? "on" : ""}`} onClick={() => setBubble(b.id)}>
                  {b.label}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <label>文字の書体</label>
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
            <label>おすすめコメント</label>
            <textarea
              className={fontClass(font)}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="この作品のどこが凄い? どんな人に読んでほしい?"
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
          {busy ? "投稿中…" : "おすすめを投稿する!!"}
        </button>
        {msg && <div className={`form-msg ${msg.ok ? "ok" : "err"}`}>{msg.text}</div>}
      </form>

      {posts.length === 0 && <p style={{ color: "var(--ink-soft)" }}>まだ投稿がありません。</p>}
      {posts.map((p) => {
        const work = p.workId ? workById(p.workId) : undefined;
        return (
          <Bubble
            key={p.id}
            text={p.text}
            bubble={p.bubble}
            font={p.font}
            user={p.user}
            meta={
              <PostMeta
                type={p.type}
                loc={locLabel(p)}
                date={fmtDate(p.createdAt)}
                workTitle={work?.title}
                workId={work?.id}
                freeTitle={p.freeTitle}
              />
            }
          />
        );
      })}
    </>
  );
}
