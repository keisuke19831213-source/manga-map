"use client";

import { MangaBubble, fontClass } from "@/components/Bubble";
import type { Post } from "@/lib/posts";

// カードや地図に埋め込む小さなマンガ吹き出し(実測ベースのSVG形状)
export default function MiniBubble({ post, style }: { post: Post; style?: React.CSSProperties }) {
  const kind = post.bubble === "narration" ? "speech" : (post.bubble ?? "speech");
  return (
    <div style={{ marginTop: 12, ...style }}>
      <MangaBubble kind={kind} className="mb-mini" textClassName={fontClass(post.font)} maxWidth={200}>
        <span className="txt">{post.text}</span>
        <span className="who">
          — {post.user}
          {post.volume || post.page || post.panel
            ? ` (${[post.volume && `${post.volume}巻`, post.page && `${post.page}p`, post.panel].filter(Boolean).join("/")})`
            : ""}
        </span>
      </MangaBubble>
    </div>
  );
}
