"use client";

import { useEffect, useState } from "react";
import { EMPTY_META, normalizeMeta, type SiteMeta } from "@/lib/affiliate";

// クライアントコンポーネントから書影・アフィリエイト設定を読むためのフック
export function useMeta(): SiteMeta {
  const [meta, setMeta] = useState<SiteMeta>(EMPTY_META);
  useEffect(() => {
    let alive = true;
    fetch("/api/meta", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (alive && j) setMeta(normalizeMeta(j));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return meta;
}
