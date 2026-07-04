// works-meta.json のサーバーサイド読み書き
import { EMPTY_META, normalizeMeta, type SiteMeta } from "@/lib/affiliate";
import { readJson, writeJson } from "@/lib/storage";

export async function readMeta(): Promise<SiteMeta> {
  const raw = await readJson<unknown>("works-meta.json", null);
  return raw ? normalizeMeta(raw) : { ...EMPTY_META, works: {} };
}

export async function writeMeta(meta: SiteMeta): Promise<void> {
  await writeJson("works-meta.json", meta);
}
