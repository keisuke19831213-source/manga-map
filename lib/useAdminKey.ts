"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "mm_admin_key";

export function getAdminKey(): string {
  if (typeof window === "undefined") return "";
  try {
    // Safariの「すべてのCookieをブロック」設定ではlocalStorageアクセス自体が例外を投げる
    return window.localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

// 書き込み系APIに付ける認証ヘッダ
export function adminHeaders(): Record<string, string> {
  const k = getAdminKey();
  return k ? { "x-admin-key": k } : {};
}

// 管理キーの読み書きフック(localStorageに保存)
export function useAdminKey(): [string, (k: string) => void] {
  const [key, setKeyState] = useState("");
  useEffect(() => {
    setKeyState(getAdminKey());
  }, []);
  const setKey = (k: string) => {
    setKeyState(k);
    if (typeof window !== "undefined") {
      try {
        if (k) window.localStorage.setItem(STORAGE_KEY, k);
        else window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // 保存できない環境では状態のみ保持
      }
    }
  };
  return [key, setKey];
}
