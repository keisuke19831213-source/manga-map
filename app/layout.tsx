import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "MANGA MAP — マンガの歴史とジャンルの進化マップ",
  description:
    "musicmapのマンガ版。マンガのジャンルがどう生まれ、影響し合い、進化してきたかを一枚のマップで可視化。おすすめ作品の投稿や、ページ・コマ単位のコメントも。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <header className="site-header">
          <Link href="/" className="site-logo">
            MANGA<span>MAP</span>
          </Link>
          <nav className="site-nav">
            <Link href="/">ジャンルマップ</Link>
            <Link href="/works">作品図鑑</Link>
            <Link href="/history">マンガ史年表</Link>
            <Link href="/community">みんなの投稿</Link>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
