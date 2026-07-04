"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "mm_admin_key";

export function getAdminKey(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(STORAGE_KEY) ?? "";
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
      if (k) window.localStorage.setItem(STORAGE_KEY, k);
      else window.localStorage.removeItem(STORAGE_KEY);
    }
  };
  return [key, setKey];
}
