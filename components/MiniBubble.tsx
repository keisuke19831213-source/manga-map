"use client";

import { MangaBubble, fontClass } from "@/components/Bubble";
import type { Post } from "@/lib/posts";

// カードや地図に埋め込む小さなマンガ吹き出し(縦書き・実測ベースのSVG形状)
export default function MiniBubble({ post, style }: { post: Post; style?: React.CSSProperties }) {
  const kind = post.bubble === "narration" ? "speech" : (post.bubble ?? "speech");
  const text = post.text.length > 56 ? post.text.slice(0, 55) + "…" : post.text;
  const loc =
    post.volume || post.page || post.panel
      ? `(${[post.volume && `${post.volume}巻`, post.page && `${post.page}p`, post.panel].filter(Boolean).join("/")})`
      : "";
  return (
    <div style={{ marginTop: 12, ...style }}>
      <MangaBubble kind={kind} className="mb-mini" textClassName={fontClass(post.font)} maxHeight={104}>
        {text}
        <span className="who">
          — {post.user}
          {loc}
        </span>
      </MangaBubble>
    </div>
  );
}
