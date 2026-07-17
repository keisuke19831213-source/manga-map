"use client";

import Link from "next/link";
import type { Post } from "@/lib/posts";

const KIND_ICON: Record<string, string> = {
  shout: "💥",
  think: "💭",
  whisper: "…",
};

// カード・地図用のコンパクト吹き出し(横書き・2行クランプ)。
// フィードの中では読みやすさ優先で、本格的な縦書き吹き出しは投稿ページで使う。
// cover/title/href を渡すと、どの作品のコメントか分かる表紙付き & クリックで作品ページへ。
export default function MiniBubble({
  post,
  style,
  cover,
  title,
  href,
}: {
  post: Post;
  style?: React.CSSProperties;
  cover?: string | null;
  title?: string;
  href?: string;
}) {
  const icon = KIND_ICON[post.bubble ?? ""] ?? "";
  const loc =
    post.volume || post.page || post.panel
      ? ` (${[post.volume && `${post.volume}巻`, post.page && `${post.page}p`, post.panel].filter(Boolean).join("/")})`
      : "";

  const inner = (
    <>
      {cover !== undefined && (
        <span className="qb-cover">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt={title ?? ""} loading="lazy" />
          ) : (
            <span className="qb-cover-ph">📖</span>
          )}
        </span>
      )}
      <span className="qb-body">
        {title && <span className="qb-title">{title}</span>}
        <span className="qb-txt">
          {post.spoiler ? (
            <span style={{ color: "var(--ink-soft)" }}>⚠️ ネタバレを含む語り(作品ページで開示)</span>
          ) : (
            <>
              {icon && <span style={{ marginRight: 2 }}>{icon}</span>}
              {post.text}
            </>
          )}
        </span>
        <span className="qb-who">
          — {post.user}
          {loc}
        </span>
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={`qb ${cover !== undefined ? "qb-rich" : ""} qb-link`} style={style}>
        {inner}
      </Link>
    );
  }
  return (
    <div className={`qb ${cover !== undefined ? "qb-rich" : ""}`} style={style}>
      {inner}
    </div>
  );
}
