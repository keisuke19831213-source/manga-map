// データ保存層。Vercel Blobのトークンがあれば Blob、なければ data/*.json に読み書き。
//
// - 単一ドキュメント(設定など): readJson / writeJson (全体上書き)
// - コレクション(投稿・登録作品): 1件1Blob で保存し list() で一覧取得。
//   「全件読む→追記→全件書き戻す」を避けることで、Blobの結果整合性による
//   更新ロスト(読みが古いまま上書きして新規が消える)を根本的に防ぐ。
import { promises as fs } from "fs";
import path from "path";
import { del, head, list, put } from "@vercel/blob";

const PREFIX = "manga-map/";

function useBlob(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

async function readLocalFile<T>(name: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(path.join(process.cwd(), "data", name), "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeLocalFile(name: string, data: unknown): Promise<void> {
  const file = path.join(process.cwd(), "data", name);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(data, null, 2), "utf-8");
}

function bust(url: string): string {
  return `${url}${url.includes("?") ? "&" : "?"}_=${Date.now()}`;
}

// ============ 単一ドキュメント ============
export async function readJson<T>(name: string, fallback: T): Promise<T> {
  if (useBlob()) {
    try {
      const h = await head(PREFIX + name);
      const res = await fetch(bust(h.url), { cache: "no-store" });
      if (res.ok) return (await res.json()) as T;
    } catch {
      // 未初期化 → シードへフォールバック
    }
  }
  return readLocalFile(name, fallback);
}

export async function writeJson(name: string, data: unknown): Promise<void> {
  if (useBlob()) {
    await put(PREFIX + name, JSON.stringify(data, null, 2), {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
      cacheControlMaxAge: 0,
    });
    return;
  }
  await writeLocalFile(name, data);
}

// ============ コレクション(1件1Blob) ============
interface HasId {
  id: string;
}

function itemPath(collection: string, id: string): string {
  return `${PREFIX}${collection}/${id}.json`;
}

// blob未初期化のときシードファイルの各要素を個別Blobとして取り込む
async function seedCollection<T extends HasId>(collection: string, seedFile: string): Promise<T[]> {
  const seeds = await readLocalFile<T[]>(seedFile, []);
  await Promise.all(
    seeds.map((item) =>
      put(itemPath(collection, item.id), JSON.stringify(item), {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "application/json",
        cacheControlMaxAge: 0,
      })
    )
  );
  return seeds;
}

export async function listItems<T extends HasId>(collection: string, seedFile: string): Promise<T[]> {
  if (!useBlob()) return readLocalFile<T[]>(seedFile, []);

  const { blobs } = await list({ prefix: `${PREFIX}${collection}/` });
  if (blobs.length === 0) {
    // 初回: シードを個別Blobへ取り込み、メモリ上のシードをそのまま返す
    return seedCollection<T>(collection, seedFile);
  }
  const fetched = await Promise.all(
    blobs.map(async (b) => {
      try {
        const res = await fetch(bust(b.url), { cache: "no-store" });
        return res.ok ? await res.json() : null;
      } catch {
        return null;
      }
    })
  );
  return (fetched as (T | null)[]).filter((x): x is T => x !== null);
}

export async function putItem<T extends HasId>(collection: string, seedFile: string, item: T): Promise<void> {
  if (!useBlob()) {
    const arr = await readLocalFile<T[]>(seedFile, []);
    const next = [...arr.filter((x) => x.id !== item.id), item];
    await writeLocalFile(seedFile, next);
    return;
  }
  await put(itemPath(collection, item.id), JSON.stringify(item), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 0,
  });
}

export async function delItem<T extends HasId>(collection: string, seedFile: string, id: string): Promise<boolean> {
  if (!useBlob()) {
    const arr = await readLocalFile<T[]>(seedFile, []);
    const next = arr.filter((x) => x.id !== id);
    if (next.length === arr.length) return false;
    await writeLocalFile(seedFile, next);
    return true;
  }
  const suffix = `/${collection}/${id}.json`;
  const { blobs } = await list({ prefix: `${PREFIX}${collection}/` });
  const target = blobs.find((b) => b.pathname.endsWith(suffix));
  if (!target) return false;
  await del(target.url);
  return true;
}
