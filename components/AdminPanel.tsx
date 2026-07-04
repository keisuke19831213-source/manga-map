"use client";

import { useEffect, useState } from "react";
import { WORKS } from "@/lib/data";
import { amazonLink, coverSrc, normalizeMeta, type SiteMeta, type WorkMeta } from "@/lib/affiliate";
import Cover, { AmazonButton } from "@/components/Cover";

export default function AdminPanel() {
  const [meta, setMeta] = useState<SiteMeta>({ affiliateTag: "", works: {} });
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/meta", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setMeta(normalizeMeta(j)))
      .finally(() => setLoaded(true));
  }, []);

  const setWork = (workId: string, patch: Partial<WorkMeta>) => {
    setMeta((m) => ({
      ...m,
      works: { ...m.works, [workId]: { ...m.works[workId], ...patch } },
    }));
  };

  const save = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/meta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(meta),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "保存に失敗しました");
      }
      setMsg({ ok: true, text: "保存しました! git push すると本番に反映されます。" });
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "保存に失敗しました" });
    } finally {
      setBusy(false);
    }
  };

  if (!loaded) return <p>読み込み中…</p>;

  return (
    <>
      <div
        className="post-form"
        style={{ position: "sticky", top: 70, zIndex: 20, ["--form-label" as string]: '"アフィリエイト設定"' }}
      >
        <div className="row" style={{ alignItems: "flex-end" }}>
          <div className="field">
            <label>AmazonアソシエイトのトラッキングID (例: yourname-22)</label>
            <input
              value={meta.affiliateTag}
              onChange={(e) => setMeta((m) => ({ ...m, affiliateTag: e.target.value }))}
              placeholder="xxxx-22"
              maxLength={40}
            />
          </div>
          <div>
            <button className="btn" onClick={save} disabled={busy}>
              {busy ? "保存中…" : "すべて保存する"}
            </button>
          </div>
        </div>
        {msg && <div className={`form-msg ${msg.ok ? "ok" : "err"}`}>{msg.text}</div>}
      </div>

      {[...WORKS]
        .sort((a, b) => a.year - b.year)
        .map((w) => {
          const wm = meta.works[w.id] ?? {};
          const cover = coverSrc(meta, w.id);
          const link = amazonLink(meta, w.id);
          return (
            <div key={w.id} className="manga-panel" style={{ padding: "14px 16px", marginBottom: 14, display: "flex", gap: 14, flexWrap: "wrap" }}>
              <Cover src={cover} title={w.title} width={64} />
              <div style={{ flex: "1 1 400px" }}>
                <div style={{ fontWeight: 900, fontFamily: "var(--font-pop)", marginBottom: 6 }}>
                  {w.title}
                  <span style={{ fontWeight: 400, fontSize: 11.5, color: "var(--ink-soft)" }}>
                    {" "}
                    — {w.author} ({w.year})
                  </span>
                </div>
                <div className="post-form no-ribbon" style={{ padding: 0, border: "none", boxShadow: "none", margin: 0 }}>
                  <div className="row" style={{ marginBottom: 0 }}>
                    <div className="field small" style={{ flexBasis: 160 }}>
                      <label>ASIN</label>
                      <input
                        value={wm.asin ?? ""}
                        onChange={(e) => setWork(w.id, { asin: e.target.value })}
                        placeholder="B00XXXXXXX"
                        maxLength={20}
                      />
                    </div>
                    <div className="field">
                      <label>AmazonリンクURL(任意・ASINより優先)</label>
                      <input
                        value={wm.amazonUrl ?? ""}
                        onChange={(e) => setWork(w.id, { amazonUrl: e.target.value })}
                        placeholder="https://www.amazon.co.jp/dp/..."
                      />
                    </div>
                    <div className="field">
                      <label>書影URL(任意・ASINより優先)</label>
                      <input
                        value={wm.coverUrl ?? ""}
                        onChange={(e) => setWork(w.id, { coverUrl: e.target.value })}
                        placeholder="https://.../cover.jpg"
                      />
                    </div>
                  </div>
                </div>
                {link && (
                  <div style={{ marginTop: 8 }}>
                    <AmazonButton href={link} small />
                    <span style={{ fontSize: 11, color: "var(--ink-soft)", marginLeft: 8 }}>{link}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

      <div style={{ position: "sticky", bottom: 16, textAlign: "right" }}>
        <button className="btn" onClick={save} disabled={busy}>
          {busy ? "保存中…" : "すべて保存する"}
        </button>
      </div>
    </>
  );
}
