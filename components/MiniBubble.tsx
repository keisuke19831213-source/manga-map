"use client";

import { fontClass } from "@/components/Bubble";
import type { Post } from "@/lib/posts";

// カードや地図に埋め込む小さな吹き出し(最新の読者の声)
export default function MiniBubble({ post }: { post: Post }) {
  return (
    <div className={`mini-bubble ${fontClass(post.font)}`}>
      <span className="txt">{post.text}</span>
      <span className="who">
        — {post.user}
        {post.volume || post.page || post.panel
          ? ` (${[post.volume && `${post.volume}巻`, post.page && `${post.page}p`, post.panel].filter(Boolean).join("/")})`
          : ""}
      </span>
    </div>
  );
}
