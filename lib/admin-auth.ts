import type { NextRequest } from "next/server";

// 書き込み系APIの管理者チェック。
// リクエストヘッダ x-admin-key が環境変数 ADMIN_KEY と一致すれば許可。
// ADMIN_KEY未設定の場合は開発環境のみ許可(本番は常に拒否)。
export function isAdmin(req: NextRequest): boolean {
  const key = process.env.ADMIN_KEY;
  if (!key) return process.env.NODE_ENV !== "production";
  return req.headers.get("x-admin-key") === key;
}

export const ADMIN_ERROR = { error: "現在、投稿・登録は管理者のみ受け付けています。" };
