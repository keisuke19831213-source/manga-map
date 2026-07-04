// works-meta.json のサーバーサイド読み書き
import { promises as fs } from "fs";
import path from "path";
import { EMPTY_META, normalizeMeta, type SiteMeta } from "@/lib/affiliate";

const META_FILE = path.join(process.cwd(), "data", "works-meta.json");

export async function readMeta(): Promise<SiteMeta> {
  try {
    const raw = await fs.readFile(META_FILE, "utf-8");
    return normalizeMeta(JSON.parse(raw));
  } catch {
    return { ...EMPTY_META, works: {} };
  }
}

export async function writeMeta(meta: SiteMeta): Promise<void> {
  await fs.mkdir(path.dirname(META_FILE), { recursive: true });
  await fs.writeFile(META_FILE, JSON.stringify(meta, null, 2), "utf-8");
}
