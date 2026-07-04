"use client";

import { useEffect, useState } from "react";
import { amazonLink, coverSrc, normalizeMeta, type SiteMeta, type WorkMeta } from "@/lib/affiliate";
import { useWorks } from "@/lib/useWorks";
import Cover, { AmazonButton } from "@/components/Cover";
import WorkRegisterForm from "@/components/WorkRegisterForm";

export default function AdminPanel() {
  const { works, reload } = useWorks();
  const [meta, setMeta] = useState<SiteMeta>({ affiliateTag: "", works: {} });
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const loadMeta = () =>
    fetch("/api/meta", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setMeta(normalizeMeta(j)));

  useEffect(() => {
    loadMeta().finally(() => setLoaded(true));
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

  const removeWork = async (id: string, title: string) => {
    if (!window.confirm(`『${title}』を削除しますか? (投稿されたコメントは残ります)`)) return;
    const res = await fetch(`/api/works?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (res.ok) {
      reload();
      loadMeta();
    } else {
      const err = await res.json().catch(() => ({}));
      window.alert(err.error || "削除に失敗しました");
    }
  };

  if (!loaded) return <p>読み込み中…</p>;

  return (
    <>
      <h2 className="section-title" style={{ marginTop: 0 }}>作品登録</h2>
      <p className="section-sub">図鑑・ジャンル系統図・投稿対象に自動で追加されます。</p>
      <WorkRegisterForm onRegistered={reload} />

      <h2 className="section-title">書影とアフィリエイトリンク</h2>
      <p className="section-sub">ASINを入れると書影とアソシエイトリンクが全ページに自動反映されます(書籍はISBN-10がASINとして使えます)。</p>

      <div
        className="post-form"
        style={{ position: "sticky", top: 70, zIndex: 20, ["--form-label" as string]: '"アフィリエイト設定"' }}
      >
        <div className="row" style={{ alignItems: "flex-end", marginBottom: 0 }}>
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

      {[...works]
        .sort((a, b) => a.year - b.year)
        .map((w) => {
          const wm = meta.works[w.id] ?? {};
          const cover = coverSrc(meta, w.id);
          const link = amazonLink(meta, w.id);
          const isUserWork = w.id.startsWith("uw-");
          return (
            <div
              key={w.id}
              className="manga-panel"
              style={{ padding: "14px 16px", marginBottom: 14, display: "flex", gap: 14, flexWrap: "wrap" }}
            >
              <Cover src={cover} title={w.title} width={64} />
              <div style={{ flex: "1 1 400px" }}>
                <div style={{ fontWeight: 900, fontFamily: "var(--font-pop)", marginBottom: 6 }}>
                  {w.title}
                  <span style={{ fontWeight: 400, fontSize: 11.5, color: "var(--ink-soft)" }}>
                    {" "}
                    — {w.author} ({w.year})
                  </span>
                  {isUserWork && (
                    <>
                      {" "}
                      <span className="cbadge" style={{ background: "#bfe3ff" }}>登録作品</span>{" "}
                      <button
                        onClick={() => removeWork(w.id, w.title)}
                        style={{
                          border: "2px solid #171310",
                          background: "#fff",
                          color: "#b91c1c",
                          fontSize: 11,
                          fontWeight: 700,
                          borderRadius: 4,
                          padding: "1px 8px",
                          cursor: "pointer",
                          fontFamily: "var(--font-base)",
                        }}
                      >
                        削除
                      </button>
                    </>
                  )}
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
