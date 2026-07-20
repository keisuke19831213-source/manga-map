// 書影・アフィリエイト設定のサーバーサイド読み書き。
// 【重要】以前は works-meta.json 単一ドキュメントで「全件読む→編集→全件書き戻す」を
// していたため、Blobの結果整合性で更新ロスト(古い読みで書き戻して他作品が消える)が
// 頻発した。投稿と同じく per-item(1作品1Blob) に変更し、更新は変更した作品だけに限定。
//
// 読みは頻繁(全ページのuseMeta・作品ページ)なので、per-itemの全件fetchを毎回やると
// 重い。短命の同一プロセス内キャッシュ(TTL)で、ビルドの200ページ生成や暖まった
// サーバーインスタンスでの連続読みを1回のfetch群に畳む。
import { normalizeMeta, type SiteMeta, type WorkMeta } from "@/lib/affiliate";
import { ensureCollection, listItems, putItem, delItem, readItem, readJson, writeJson } from "@/lib/storage";

interface WorkMetaItem extends WorkMeta {
  id: string;
}

const COLLECTION = "work-meta";
const SEED = "work-meta.json";
const TAG_DOC = "affiliate.json";
const CACHE_TTL_MS = 15_000;

let cache: { at: number; meta: SiteMeta } | null = null;

function itemsToWorks(items: WorkMetaItem[]): Record<string, WorkMeta> {
  const works: Record<string, WorkMeta> = {};
  for (const it of items) {
    if (!it || !it.id) continue;
    const { id, ...m } = it;
    works[id] = m;
  }
  return works;
}

async function buildMeta(): Promise<SiteMeta> {
  const [tagDoc, items] = await Promise.all([
    readJson<{ affiliateTag?: string } | null>(TAG_DOC, null),
    listItems<WorkMetaItem>(COLLECTION, SEED),
  ]);
  return normalizeMeta({ affiliateTag: tagDoc?.affiliateTag ?? "", works: itemsToWorks(items) });
}

export async function readMeta(): Promise<SiteMeta> {
  const now = Date.now();
  if (cache && now - cache.at < CACHE_TTL_MS) return cache.meta;
  const meta = await buildMeta();
  cache = { at: now, meta };
  return meta;
}

// 管理UIのフル置換(全作品を per-item で書き、タグは単一docへ)。手動保存のみで低頻度。
export async function writeMeta(meta: SiteMeta): Promise<void> {
  await writeJson(TAG_DOC, { affiliateTag: meta.affiliateTag });
  await Promise.all(Object.entries(meta.works).map(([id, m]) => putItem<WorkMetaItem>(COLLECTION, SEED, { id, ...m })));
  cache = null;
}

// 変更した作品「だけ」を部分マージで upsert する安全な更新。
// 各作品を独立Blobとして「1件読む→マージ→1件書く」だけなので、他作品を巻き込む
// 更新ロストが原理的に起きない。{asin}だけ / {volumes}だけ を送っても既存フィールドは保持。
export async function patchMeta(partialWorks: Record<string, WorkMeta>, affiliateTag?: string): Promise<string[]> {
  // 未初期化なら先にシードを取り込む(部分読みが旧単一docのデータを取りこぼさないため)
  await ensureCollection<WorkMetaItem>(COLLECTION, SEED);
  const updated: string[] = [];
  for (const [id, partial] of Object.entries(partialWorks)) {
    const cur = await readItem<WorkMetaItem>(COLLECTION, SEED, id);
    const merged: WorkMetaItem = { ...(cur ?? { id }), ...partial, id };
    await putItem<WorkMetaItem>(COLLECTION, SEED, merged);
    updated.push(id);
  }
  if (affiliateTag !== undefined) await writeJson(TAG_DOC, { affiliateTag: affiliateTag.trim() });
  cache = null;
  return updated;
}

// 1作品のメタを削除(登録作品の削除時)
export async function deleteWorkMeta(id: string): Promise<void> {
  await delItem<WorkMetaItem>(COLLECTION, SEED, id);
  cache = null;
}
