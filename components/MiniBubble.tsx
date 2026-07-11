"use client";

import type { Post } from "@/lib/posts";

const KIND_ICON: Record<string, string> = {
  shout: "💥",
  think: "💭",
  whisper: "…",
};

// カード・地図用のコンパクト吹き出し(横書き・2行クランプ)。
// フィードの中では読みやすさ優先で、本格的な縦書き吹き出しは投稿ページで使う
export default function MiniBubble({ post, style }: { post: Post; style?: React.CSSProperties }) {
  const icon = KIND_ICON[post.bubble ?? ""] ?? "";
  const loc =
    post.volume || post.page || post.panel
      ? ` (${[post.volume && `${post.volume}巻`, post.page && `${post.page}p`, post.panel].filter(Boolean).join("/")})`
      : "";
  return (
    <div className="qb" style={style}>
      <span className="qb-txt">
        {icon && <span style={{ marginRight: 2 }}>{icon}</span>}
        {post.text}
      </span>
      <span className="qb-who">
        — {post.user}
        {loc}
      </span>
    </div>
  );
}
