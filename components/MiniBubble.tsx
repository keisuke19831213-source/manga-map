"use client";

import { BubbleBg, fontClass } from "@/components/Bubble";
import type { Post } from "@/lib/posts";

// カードや地図に埋め込む小さなマンガ吹き出し(SVG形状)
export default function MiniBubble({ post, style }: { post: Post; style?: React.CSSProperties }) {
  const kind = post.bubble === "shout" || post.bubble === "think" ? post.bubble : "speech";
  return (
    <div className={`bxm ${fontClass(post.font)}`} style={{ marginTop: 12, ...style }}>
      <BubbleBg kind={kind} />
      <div className="bx-content" style={kind !== "speech" ? { padding: "14px 26px 18px" } : undefined}>
        <span className="txt">{post.text}</span>
        <span className="who">
          — {post.user}
          {post.volume || post.page || post.panel
            ? ` (${[post.volume && `${post.volume}巻`, post.page && `${post.page}p`, post.panel].filter(Boolean).join("/")})`
            : ""}
        </span>
      </div>
    </div>
  );
}
