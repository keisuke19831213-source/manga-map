"use client";

import { useState } from "react";
import { EMOTIONS } from "@/lib/emotions";
import { useWorks } from "@/lib/useWorks";
import { adminHeaders } from "@/lib/useAdminKey";
import { VOICE_TAGS, sourceFromUrl, type Voice } from "@/lib/voices";

// 管理人が「よそで生まれた声」を1件登録するフォーム。
// URLを貼ると配信元(X/note/YouTube)は自動判定されるので、入力は最小限。
export default function VoiceAdminForm({
  defaultWorkId,
  onAdded,
}: {
  defaultWorkId?: string;
  onAdded: (v: Voice) => void;
}) {
  const { works } = useWorks();
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [author, setAuthor] = useState("");
  const [workId, setWorkId] = useState(defaultWorkId ?? "");
  const [emotion, setEmotion] = useState("");
  const [tag, setTag] = useState("");
  const [note, setNote] = useState("");
  const [featured, setFeatured] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const src = url.trim() ? sourceFromUrl(url.trim()) : null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/voices", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...adminHeaders() },
        body: JSON.stringify({ url, title, excerpt, author, workId, emotion, tag, note, featured }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "登録に失敗しました");
      }
      const created: Voice = await res.json();
      onAdded(created);
      setUrl("");
      setTitle("");
      setExcerpt("");
      setAuthor("");
      setNote("");
      setFeatured(false);
      setMsg({ ok: true, text: "登録しました!" });
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "登録に失敗しました" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="post-form" style={{ ["--form-label" as string]: '"声を1件ひろう"' }} onSubmit={submit}>
      <div className="row">
        <div className="field">
          <label>URL(X・note・YouTubeなど) {src && <span className="voice-src-hint">→ {src.toUpperCase()} として登録</span>}</label>
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://x.com/... / https://note.com/..." required />
        </div>
      </div>
      <div className="row">
        <div className="field">
          <label>作品</label>
          <select value={workId} onChange={(e) => setWorkId(e.target.value)}>
            <option value="">-- 作品に紐づけない --</option>
            {[...works].sort((a, b) => a.year - b.year).map((w) => (
              <option key={w.id} value={w.id}>
                {w.title} ({w.year})
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>感情</label>
          <select value={emotion} onChange={(e) => setEmotion(e.target.value)}>
            <option value="">-- なし --</option>
            {EMOTIONS.map((e) => (
              <option key={e.id} value={e.id}>
                {e.emoji} {e.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>切り口</label>
          <select value={tag} onChange={(e) => setTag(e.target.value)}>
            <option value="">-- なし --</option>
            {VOICE_TAGS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="row">
        <div className="field">
          <label>タイトル(note・YouTube用・省略可)</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
        </div>
        <div className="field">
          <label>書き手・チャンネル名(省略可)</label>
          <input value={author} onChange={(e) => setAuthor(e.target.value)} maxLength={60} />
        </div>
      </div>
      <div className="row">
        <div className="field">
          <label>紹介文(自分の言葉で。転載しない・省略可)</label>
          <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} maxLength={200} />
        </div>
      </div>
      <div className="row">
        <div className="field">
          <label>管理人の一言(付箋・ここがキュレーションの核)</label>
          <input className="f-shojo" value={note} onChange={(e) => setNote(e.target.value)} maxLength={120} placeholder="例: 音の消し方の話は、これが一番" />
        </div>
        <div className="field">
          <label>今夜の一本</label>
          <label className="voice-featured-check">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} /> 特集として一番上に出す
          </label>
        </div>
      </div>
      <button className="btn" disabled={busy}>
        {busy ? "登録中…" : "この声をひろう!!"}
      </button>
      {msg && <div className={`form-msg ${msg.ok ? "ok" : "err"}`}>{msg.text}</div>}
    </form>
  );
}
