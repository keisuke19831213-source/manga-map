// 各作品の「全巻」の書影ASINを収集して meta.works[id].volumes に保存する。
// 方式: NDLサーチで作品名が完全一致する巻付きレコードを全部拾い、
//       巻ごとに ISBN-10(=ASIN) に変換 → Amazon画像の実在を検証 → volumes[] へ。
// 巻抜けがあってもある分だけ保存する(シェルフはある巻だけ並べる)。
// 使い方: set -a && . ./.env.local && set +a && node scripts/fill-volumes.mjs [workId...]
const API = process.env.API || "https://manga-map.vercel.app";
const ADMIN_KEY = process.env.ADMIN_KEY;
if (!ADMIN_KEY) {
  console.error("ADMIN_KEY がありません (.env.local を読み込んでください)");
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const norm = (s) =>
  (s || "")
    .toLowerCase()
    .replace(/[\s・:：!！?？×☆△.,\/\-—’'"「」『』()（）=＝&+~〜・]/g, "");

function isbn13to10(i) {
  i = (i || "").replace(/[^0-9Xx]/g, "");
  if (i.length === 10) return i;
  if (i.length !== 13 || !i.startsWith("978")) return null;
  const c = i.slice(3, 12);
  let s = 0;
  for (let k = 0; k < 9; k++) s += (10 - k) * +c[k];
  const r = (11 - (s % 11)) % 11;
  return c + (r === 10 ? "X" : r);
}

async function amazonOK(asin) {
  try {
    const u = `https://images-na.ssl-images-amazon.com/images/P/${asin}.09._SL160_.jpg`;
    const r = await fetch(u);
    const b = await r.arrayBuffer();
    return r.ok && (r.headers.get("content-type") || "").includes("image") && b.byteLength > 1500;
  } catch {
    return false;
  }
}

// NDLから作品名完全一致の全巻 {巻番号 → ISBN-10候補[]} を収集
async function collectVolumes(title, author) {
  const a0 = (author || "").split(/[・&,／\/]/)[0].trim();
  const nt = norm(title);
  const byVol = new Map();
  for (const useCreator of [true, false]) {
    const url =
      "https://ndlsearch.ndl.go.jp/api/opensearch?title=" +
      encodeURIComponent(title) +
      (useCreator ? "&creator=" + encodeURIComponent(a0) : "") +
      "&cnt=500&mediatype=books";
    let xml;
    try {
      xml = await (await fetch(url)).text();
    } catch {
      continue;
    }
    for (const it of xml.split("<item>").slice(1)) {
      const dct = (it.match(/<dc:title>([^<]*)<\/dc:title>/) || [])[1] || "";
      const vol = (it.match(/<dcndl:volume>([^<]*)<\/dcndl:volume>/) || [])[1] || "";
      const isbn = (it.match(/dcndl:ISBN[^>]*>([0-9Xx-]+)</) || [])[1] || "";
      if (!isbn) continue;
      if (norm(dct) !== nt) continue; // 作品名 完全一致のみ(スピンオフ排除)
      const vn = parseInt((vol || "").replace(/[^0-9]/g, ""), 10);
      if (!Number.isFinite(vn) || vn <= 0 || vn > 300) continue;
      const a = isbn13to10(isbn.replace(/-/g, ""));
      if (!a) continue;
      if (!byVol.has(vn)) byVol.set(vn, new Set());
      byVol.get(vn).add(a);
    }
    if (byVol.size > 0) break; // 著者付きで取れたらそれを使う
  }
  return byVol;
}

async function main() {
  const onlyIds = process.argv.slice(2);
  const works = await (await fetch(`${API}/api/works`)).json();
  const meta = await (await fetch(`${API}/api/meta`)).json();
  meta.works = meta.works || {};

  const targets = works.filter((w) => (onlyIds.length ? onlyIds.includes(w.id) : true));
  let done = 0;

  for (const w of targets) {
    const cur = meta.works[w.id] || {};
    if (!onlyIds.length && Array.isArray(cur.volumes) && cur.volumes.length > 0) continue; // 済みはスキップ
    const byVol = await collectVolumes(w.title, w.author);
    if (byVol.size === 0) {
      console.log(`— ${w.title}: NDLで巻情報なし`);
      await sleep(700);
      continue;
    }
    const volumes = [];
    // 巻ごとに最初にAmazon画像が実在するASINを採用(検証は巻ごと最大2候補)
    // 巻番号は連続性チェック: 前の巻から+6を超えて飛ぶ値はNDLのノイズ(ページ数など)とみなし打ち切る
    const volsAll = [...byVol.keys()].sort((a, b) => a - b);
    const vols = [];
    for (const vn of volsAll) {
      if (vols.length > 0 && vn > vols[vols.length - 1] + 6) break;
      vols.push(vn);
    }
    for (const vn of vols) {
      const cands = [...byVol.get(vn)];
      for (let i = 0; i < Math.min(2, cands.length); i++) {
        if (await amazonOK(cands[i])) {
          volumes.push({ v: vn, asin: cands[i] });
          break;
        }
        await sleep(120);
      }
      await sleep(120);
    }
    if (volumes.length === 0) {
      console.log(`— ${w.title}: Amazon画像が1巻も見つからず`);
      await sleep(700);
      continue;
    }
    meta.works[w.id] = { ...cur, volumes };
    // 1作品ごとに保存(途中で落ちても進捗が残る)
    const res = await fetch(`${API}/api/meta`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-key": ADMIN_KEY },
      body: JSON.stringify(meta),
    });
    done++;
    console.log(`✓ ${w.title}: ${volumes.length}巻分 (${volumes[0].v}〜${volumes[volumes.length - 1].v}) ${res.ok ? "" : "※保存失敗"}`);
    await sleep(900);
  }
  console.log(`完了: ${done}作品にvolumes設定`);
}

main();
