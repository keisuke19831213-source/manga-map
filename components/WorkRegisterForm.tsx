"use client";

import { useState } from "react";
import { CATEGORIES, GENRES } from "@/lib/data";
import { adminHeaders } from "@/lib/useAdminKey";

// 作品登録フォーム。いまは管理者用、将来は会員のマイページに載せる想定
export default function WorkRegisterForm({ onRegistered }: { onRegistered?: () => void }) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [year, setYear] = useState("");
  const [magazine, setMagazine] = useState("");
  const [desc, setDesc] = useState("");
  const [asin, setAsin] = useState("");
  const [genres, setGenres] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const toggleGenre = (id: string) => {
    setGenres((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/works", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...adminHeaders() },
        body: JSON.stringify({
          title,
          author,
          year: Number(year),
          magazine,
          desc,
          genres: [...genres],
          asin,
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || "登録に失敗しました");
      setMsg({ ok: true, text: `『${j.title}』を登録しました! サイトに即時反映されます。` });
      setTitle("");
      setAuthor("");
      setYear("");
      setMagazine("");
      setDesc("");
      setAsin("");
      setGenres(new Set());
      onRegistered?.();
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "登録に失敗しました" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      className="post-form"
      style={{ ["--form-label" as string]: '"新しい作品を登録"' }}
      onSubmit={submit}
    >
      <div className="row">
        <div className="field">
          <label>作品名 *</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例: 寄生獣" required maxLength={80} />
        </div>
        <div className="field">
          <label>作者 *</label>
          <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="例: 岩明均" required maxLength={60} />
        </div>
        <div className="field small">
          <label>発表年 *</label>
          <input value={year} onChange={(e) => setYear(e.target.value)} placeholder="1988" required inputMode="numeric" maxLength={4} />
        </div>
        <div className="field">
          <label>掲載誌(任意)</label>
          <input value={magazine} onChange={(e) => setMagazine(e.target.value)} placeholder="例: モーニングオープン増刊" maxLength={60} />
        </div>
      </div>

      <div className="row">
        <div className="field">
          <label>ジャンル * (複数選択可 — ジャンル系統図・図鑑の分類に使われます)</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {CATEGORIES.map((c) => {
              const list = GENRES.filter((g) => g.cat === c.id);
              if (list.length === 0) return null;
              return (
                <div key={c.id} style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: 900, color: c.color, width: 92, flex: "0 0 92px" }}>
                    {c.name}
                  </span>
                  {list.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      className={`style-opt ${genres.has(g.id) ? "on" : ""}`}
                      style={{ fontSize: 11.5, padding: "3px 10px", borderColor: genres.has(g.id) ? "#171310" : c.color + "aa" }}
                      onClick={() => toggleGenre(g.id)}
                    >
                      {g.name}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="row">
        <div className="field">
          <label>紹介文 * (図鑑・作品ページに表示されます)</label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="どんな作品か、マンガ史のどこが凄いかを2〜3文で"
            required
            maxLength={500}
          />
        </div>
        <div className="field small" style={{ flexBasis: 200 }}>
          <label>ASIN(任意)</label>
          <input value={asin} onChange={(e) => setAsin(e.target.value)} placeholder="書影+リンク自動生成" maxLength={20} />
        </div>
      </div>

      <button className="btn" disabled={busy}>
        {busy ? "登録中…" : "作品を登録する!!"}
      </button>
      {msg && <div className={`form-msg ${msg.ok ? "ok" : "err"}`}>{msg.text}</div>}
    </form>
  );
}
