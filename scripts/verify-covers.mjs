// 設定済みの全ASINをopenBDで書名照合し、別作品を指すものを自動除去する品質チェック。
// 使い方: set -a && . ./.env.local && set +a && node scripts/verify-covers.mjs
import { writeFile } from "node:fs/promises";
import { put } from "@vercel/blob";
const API = "https://manga-map.vercel.app";
const norm = (s) => (s || "").toLowerCase().replace(/[\s・:：!！?？×☆△.,\/\-—’'"「」『』()（）=＝&+~〜【】]/g, "");
function isbn10to13(i) { i = i.replace(/[^0-9Xx]/g, ""); const c = "978" + i.slice(0, 9); let s = 0; for (let k = 0; k < 12; k++) s += (k % 2 ? 3 : 1) * +c[k]; return c + ((10 - (s % 10)) % 10); }
async function openbdTitle(a) { try { const d = await (await fetch("https://api.openbd.jp/v1/get?isbn=" + isbn10to13(a))).json(); return d[0]?.summary?.title || null; } catch { return null; } }
function match(work, ob) { if (!ob) return true; const w = norm(work), o = norm(ob); const core = w.slice(0, Math.min(5, w.length)); return o.includes(core) || w.includes(o.slice(0, Math.min(5, o.length))); }

(async () => {
  const works = await (await fetch(`${API}/api/works`)).json();
  const byId = Object.fromEntries(works.map((w) => [w.id, w]));
  const meta = await (await fetch(`${API}/api/meta`)).json();
  meta.works = meta.works || {};
  const dropped = [];
  for (const [id, m] of Object.entries(meta.works)) {
    if (!m.asin || m.coverUrl) continue;
    const ob = await openbdTitle(m.asin);
    if (ob && !match(byId[id]?.title || "", ob)) { dropped.push(`${byId[id]?.title}[${ob}]`); delete meta.works[id]; }
    await new Promise((r) => setTimeout(r, 100));
  }
  const json = JSON.stringify(meta, null, 2);
  await writeFile(new URL("../data/works-meta.json", import.meta.url), json + "\n");
  await put("manga-map/works-meta.json", json, { access: "public", addRandomSuffix: false, allowOverwrite: true, contentType: "application/json", cacheControlMaxAge: 0 });
  console.log("書影あり:", Object.keys(meta.works).length, "/", works.length);
  console.log("誤りで除去:", dropped.length, dropped.length ? "\n  " + dropped.join("\n  ") : "");
})();
