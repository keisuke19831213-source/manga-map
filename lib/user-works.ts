// 管理画面(将来的には会員)から登録された作品のストア
// 静的カタログ(lib/data.ts の WORKS)とマージして全ページで使う
import { WORKS, type Work } from "@/lib/data";
import { delItem, listItems, putItem } from "@/lib/storage";

export interface UserWork extends Work {
  submittedBy: string; // 登録者。いまは "admin" 固定、会員機能導入後はユーザーIDに
  createdAt: string;
}

export async function readUserWorks(): Promise<UserWork[]> {
  const arr = await listItems<UserWork>("user-works", "user-works.json");
  return Array.isArray(arr) ? arr : [];
}

export async function addUserWork(work: UserWork): Promise<void> {
  await putItem<UserWork>("user-works", "user-works.json", work);
}

export async function deleteUserWork(id: string): Promise<boolean> {
  return delItem<UserWork>("user-works", "user-works.json", id);
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
