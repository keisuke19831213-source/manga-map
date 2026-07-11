// 全作品の書影+Amazonリンクを一括設定する。
// 方式: 国立国会図書館サーチ(NDL)で「作品名が完全一致」する巻1のISBNを引き、
//       ISBN-10(=ASIN)に変換 → Amazon画像が実在するか検証 → meta.works[id].asin に設定。
// ASINを入れると app 側が書影(Amazon画像)とアフィリエイトリンクを自動生成する。
// 完全一致に絞ることで、スピンオフ/ガイド本の誤ヒットを避ける(外れたものは未設定=プレースホルダ)。
// 使い方: set -a && . ./.env.local && set +a && node scripts/fill-covers.mjs
import { writeFile } from "node:fs/promises";
import { put } from "@vercel/blob";

const API = "https://manga-map.vercel.app";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const norm = (s) =>
  (s || "")
    .toLowerCase()
    .replace(/[\s・:：!！?？×☆△.,\/\-—’'"「」『』()（）=＝&+~〜・]/g, "");

function isbn13to10(i) {
  i = (i || "").replace(/[^0-9Xx]/g, "");
  if (i.length !== 13 || !i.startsWith("978")) return null;
  const c = i.slice(3, 12);
  let s = 0;
  for (let k = 0; k < 9; k++) s += (10 - k) * +c[k];
  const r = (11 - (s % 11)) % 11;
  return c + (r === 10 ? "X" : r);
}

async function amazonOK(asin) {
  try {
    const u = `https://images-na.ssl-images-amazon.com/images/P/${asin}.09._SCLZZZZZZZ_.jpg`;
    const r = await fetch(u);
    const b = await r.arrayBuffer();
    return r.ok && (r.headers.get("content-type") || "").includes("image") && b.byteLength > 3000;
  } catch {
    return false;
  }
}

// 手動オーバーライド(NDLで取れない/romaji題名などの著名作の巻1 ISBN-10)
const OVERRIDE = {
  dragonball: "4088518314", // ドラゴンボール 1
  doraemon: "4091400019", // ドラえもん 1
  naruto: "4088728408", // NARUTO 1
  slam: "4088716116", // SLAM DUNK 新装再編版1
};

async function findAsin(title, author) {
  const a0 = (author || "").split(/[・&,／\/]/)[0].trim();
  const nt = norm(title);
  for (const useCreator of [true, false]) {
    const url =
      "https://ndlsearch.ndl.go.jp/api/opensearch?title=" +
      encodeURIComponent(title) +
      (useCreator ? "&creator=" + encodeURIComponent(a0) : "") +
      "&cnt=100&mediatype=books";
    let xml;
    try {
      xml = await (await fetch(url)).text();
    } catch {
      continue;
    }
    const items = xml.split("<item>").slice(1);
    const cands = [];
    for (const it of items) {
      const dct = (it.match(/<dc:title>([^<]*)<\/dc:title>/) || [])[1] || "";
      const vol = (it.match(/<dcndl:volume>([^<]*)<\/dcndl:volume>/) || [])[1] || "";
      const isbn = (it.match(/dcndl:ISBN[^>]*>([0-9Xx-]+)</) || [])[1] || "";
      if (!isbn) continue;
      if (norm(dct) !== nt) continue; // 作品名 完全一致のみ
      const vn = parseInt((vol || "").replace(/[^0-9]/g, ""), 10);
      cands.push({ vn: isNaN(vn) ? 0 : vn, isbn: isbn.replace(/-/g, "") });
    }
    cands.sort((x, y) => x.vn - y.vn); // 巻1(または単巻=0)優先
    let checked = 0;
    for (const c of cands) {
      const a = isbn13to10(c.isbn);
      if (!a) continue;
      if (await amazonOK(a)) return a;
      if (++checked >= 4) break;
    }
  }
  return null;
}

async function main() {
  const works = await (await fetch(`${API}/api/works`)).json();
  const meta = await (await fetch(`${API}/api/meta`)).json();
  meta.works = meta.works || {};

  const missing = [];
  let filled = 0;

  for (const w of works) {
    const existing = meta.works[w.id];
    if (existing && (existing.coverUrl || existing.asin || existing.amazonUrl)) continue;

    let asin = OVERRIDE[w.id];
    if (asin && !(await amazonOK(asin))) asin = null;
    if (!asin) asin = await findAsin(w.title, w.author);

    if (asin) {
      meta.works[w.id] = { ...existing, asin };
      filled++;
      console.log(`✓ ${w.title} -> ${asin}`);
    } else {
      missing.push(w.title);
      console.log(`✗ ${w.title}`);
    }
    await sleep(200);
  }

  const json = JSON.stringify(meta, null, 2);
  await writeFile(new URL("../data/works-meta.json", import.meta.url), json + "\n");
  await put("manga-map/works-meta.json", json, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 0,
  });

  console.log(`\n完了: ${filled}/${works.length}件に書影+リンクを設定。未取得 ${missing.length}件`);
  if (missing.length) console.log("未取得:", missing.join(", "));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
