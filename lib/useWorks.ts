"use client";

import { useCallback, useEffect, useState } from "react";
import { WORKS, type Work } from "@/lib/data";

// 静的カタログ+登録作品の一覧をクライアントから読むフック。
// 取得完了までは静的カタログを即座に返すので表示がブロックされない。
export function useWorks(): { works: Work[]; reload: () => void } {
  const [works, setWorks] = useState<Work[]>(WORKS);

  const reload = useCallback(() => {
    fetch("/api/works", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (Array.isArray(j) && j.length > 0) setWorks(j);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { works, reload };
}
