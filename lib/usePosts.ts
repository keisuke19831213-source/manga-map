"use client";

import { useEffect, useMemo, useState } from "react";
import type { Post } from "@/lib/posts";

// 全投稿をクライアントから読むフック(新しい順で返る)
export function useAllPosts(): Post[] {
  const [posts, setPosts] = useState<Post[]>([]);
  useEffect(() => {
    let alive = true;
    fetch("/api/posts", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((j) => {
        if (alive && Array.isArray(j)) setPosts(j);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return posts;
}

export interface WorkVoices {
  count: number;
  latest?: Post;
}

// 作品ごとのコメント数と最新投稿
export function useVoicesByWork(): Record<string, WorkVoices> {
  const posts = useAllPosts();
  return useMemo(() => {
    const map: Record<string, WorkVoices> = {};
    for (const p of posts) {
      if (!p.workId) continue;
      const v = (map[p.workId] ??= { count: 0 });
      v.count += 1;
      if (!v.latest) v.latest = p; // postsは新しい順
    }
    return map;
  }, [posts]);
}
