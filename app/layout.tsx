import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "MANGA MAP — マンガの歴史とジャンルの進化マップ",
  description:
    "musicmapのマンガ版。ジャンル系統マップ、舞台マップ(世界/日本)、時代設定タイムラインでマンガの歴史を可視化。おすすめ投稿とコマ単位のコメントは吹き出しで。",
};

// マンガの組版慣習に沿ったフォントセット
// ・セリフ: アンチック体(かなアンチック+漢字ゴシック) = Shippori Antique B1
// ・モノローグ/回想: 明朝体 = Shippori Mincho
// ・叫び: 極太角ゴシック = Zen Kaku Gothic New 900
// ・欄外の手書きツッコミ = Yusei Magic / 少女マンガの手書きモノローグ = Klee One
// ・時代劇/ホラーの筆文字 = Yuji Boku ・ギャグのポップ体 = Mochiy Pop One
const GOOGLE_FONTS =
  "https://fonts.googleapis.com/css2?" +
  [
    "family=Zen+Kaku+Gothic+New:wght@500;700;900",
    "family=Reggae+One",
    "family=Mochiy+Pop+One",
    "family=Shippori+Antique+B1",
    "family=Shippori+Mincho:wght@500;700",
    "family=Klee+One:wght@400;600",
    "family=Yusei+Magic",
    "family=Yuji+Boku",
  ].join("&") +
  "&display=swap";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={GOOGLE_FONTS} />
      </head>
      <body>
        <header className="site-header">
          <Link href="/" className="site-logo">
            MANGA<span>MAP</span>
          </Link>
          <nav className="site-nav">
            <Link href="/">ジャンル系統図</Link>
            <Link href="/atlas">舞台マップ</Link>
            <Link href="/eras">時代設定マップ</Link>
            <Link href="/works">作品図鑑</Link>
            <Link href="/history">マンガ史年表</Link>
            <Link href="/community">みんなの投稿</Link>
          </nav>
        </header>
        <main>{children}</main>
        <footer
          style={{
            borderTop: "4px solid #171310",
            background: "#ffffff",
            padding: "18px 20px",
            fontSize: 11.5,
            color: "#4a4238",
            textAlign: "center",
            lineHeight: 1.9,
          }}
        >
          MANGA MAP — マンガの歴史とジャンルの進化を可視化するプロジェクト
          <br />
          Amazonのアソシエイトとして、当サイトは適格販売により収入を得ています。
        </footer>
      </body>
    </html>
  );
}
