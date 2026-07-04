"use client";

import { useCallback, useEffect, useState } from "react";
import Bubble, { BUBBLE_OPTIONS, FONT_OPTIONS, PostMeta, fontClass } from "@/components/Bubble";
import type { BubbleFont, BubbleStyle, Post } from "@/lib/posts";

function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

export function locLabel(p: Post) {
  const parts: string[] = [];
  if (p.volume) parts.push(`${p.volume}巻`);
  if (p.page) parts.push(`${p.page}ページ`);
  if (p.panel) parts.push(`${p.panel}`);
  return parts.join(" / ");
}

export default function WorkPosts({ workId, workTitle }: { workId: string; workTitle: string }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [mode, setMode] = useState<"recommend" | "comment">("recommend");
  const [user, setUser] = useState("");
  const [volume, setVolume] = useState("");
  const [page, setPage] = useState("");
  const [panel, setPanel] = useState("");
  const [text, setText] = useState("");
  const [bubble, setBubble] = useState<BubbleStyle>("speech");
  const [font, setFont] = useState<BubbleFont>("antique");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

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
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: mode,
          user,
          workId,
          volume: mode === "comment" ? volume : undefined,
          page: mode === "comment" ? page : undefined,
          panel: mode === "comment" ? panel : undefined,
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
      setVolume("");
      setPage("");
      setPanel("");
      setMsg({ ok: true, text: "投稿しました!" });
      await load();
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "投稿に失敗しました" });
    } finally {
      setBusy(false);
    }
  };

  const recommends = posts.filter((p) => p.type === "recommend");
  const comments = posts.filter((p) => p.type === "comment");

  return (
    <>
      <h2 className="section-title">読者の声を投稿する</h2>
      <p className="section-sub">
        『{workTitle}』への熱いセリフをどうぞ。吹き出しの形と文字の書体も選べます。
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
            ページ・コマにコメント
          </button>
        </div>
        <div className="row">
          <div className="field">
            <label>ニックネーム(省略可)</label>
            <input value={user} onChange={(e) => setUser(e.target.value)} placeholder="名無しの読者" maxLength={30} />
          </div>
          {mode === "comment" && (
            <>
              <div className="field small">
                <label>巻</label>
                <input value={volume} onChange={(e) => setVolume(e.target.value)} placeholder="例: 31" maxLength={10} />
              </div>
              <div className="field small">
                <label>ページ</label>
                <input value={page} onChange={(e) => setPage(e.target.value)} placeholder="例: 152" maxLength={10} />
              </div>
              <div className="field small">
                <label>コマ</label>
                <input value={panel} onChange={(e) => setPanel(e.target.value)} placeholder="例: 3コマ目" maxLength={20} />
              </div>
            </>
          )}
        </div>
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
            <label>{mode === "recommend" ? "おすすめコメント" : "そのコマ・ページのどこが凄い?"}</label>
            <textarea
              className={fontClass(font)}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                mode === "recommend"
                  ? "どんな人に読んでほしい? どこから読むのがおすすめ?"
                  : "演出、コマ割り、セリフ、線…このページ・コマの何に痺れたかを語ってください"
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

      <h2 className="section-title">ページ・コマへのコメント ({comments.length})</h2>
      <p className="section-sub">名場面・名ゴマをピンポイントで語る</p>
      {comments.length === 0 && (
        <p style={{ color: "var(--ink-soft)", fontSize: 13 }}>まだコメントがありません。心に残ったコマを語ってみましょう。</p>
      )}
      {comments.map((p) => (
        <Bubble
          key={p.id}
          text={p.text}
          bubble={p.bubble}
          font={p.font}
          user={p.user}
          meta={<PostMeta type="comment" loc={locLabel(p)} date={fmtDate(p.createdAt)} />}
        />
      ))}
    </>
  );
}
