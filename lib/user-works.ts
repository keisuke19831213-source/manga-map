// 管理画面(将来的には会員)から登録された作品のストア
// 静的カタログ(lib/data.ts の WORKS)とマージして全ページで使う
import { promises as fs } from "fs";
import path from "path";
import { WORKS, type Work } from "@/lib/data";

export interface UserWork extends Work {
  submittedBy: string; // 登録者。いまは "admin" 固定、会員機能導入後はユーザーIDに
  createdAt: string;
}

const DATA_FILE = path.join(process.cwd(), "data", "user-works.json");

export async function readUserWorks(): Promise<UserWork[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? (arr as UserWork[]) : [];
  } catch {
    return [];
  }
}

export async function writeUserWorks(works: UserWork[]): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(works, null, 2), "utf-8");
}

// 静的カタログ + 登録作品(重複IDは静的優先)
export async function getAllWorks(): Promise<Work[]> {
  const user = await readUserWorks();
  const staticIds = new Set(WORKS.map((w) => w.id));
  return [...WORKS, ...user.filter((w) => !staticIds.has(w.id))];
}

export async function findWork(id: string): Promise<Work | undefined> {
  const all = await getAllWorks();
  return all.find((w) => w.id === id);
}
