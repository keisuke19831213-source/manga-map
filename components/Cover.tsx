"use client";

import { useState } from "react";

// 書影サムネイル。URLが無い/読み込めない場合は本の背表紙風プレースホルダを表示
export default function Cover({
  src,
  title,
  width = 72,
}: {
  src: string | null;
  title: string;
  width?: number;
}) {
  const [failed, setFailed] = useState(false);
  const height = Math.round(width * 1.45);

  if (!src || failed) {
    return (
      <div
        aria-hidden
        style={{
          width,
          height,
          flex: `0 0 ${width}px`,
          border: "2px solid #171310",
          background:
            "repeating-linear-gradient(45deg, #f1e9d6, #f1e9d6 6px, #e7ddc4 6px, #e7ddc4 12px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: Math.max(14, width * 0.3),
        }}
      >
        📖
      </div>
    );
  }

  return (
    // 外部書影のためnext/imageではなくimgを使用
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`${title} の書影`}
      loading="lazy"
      onError={() => setFailed(true)}
      style={{
        width,
        height,
        flex: `0 0 ${width}px`,
        objectFit: "cover",
        border: "2px solid #171310",
        background: "#fff",
        boxShadow: "2px 2px 0 #171310",
      }}
    />
  );
}

// Amazonボタン(小)。リンクが無ければ何も出さない
export function AmazonButton({ href, small }: { href: string | null; small?: boolean }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="nofollow sponsored noopener"
      onClick={(e) => e.stopPropagation()}
      style={{
        display: "inline-block",
        background: "#ff9900",
        color: "#171310",
        border: "2px solid #171310",
        boxShadow: small ? "2px 2px 0 #171310" : "3px 3px 0 #171310",
        fontWeight: 800,
        fontSize: small ? 11.5 : 14,
        padding: small ? "3px 10px" : "8px 18px",
        borderRadius: 4,
      }}
    >
      🛒 Amazonで見る
    </a>
  );
}
