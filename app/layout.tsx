import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: "MANGA MAP — マンガの歴史とジャンルの進化マップ",
  description:
    "マンガ100年の系譜を一枚の地図に。ジャンル系統マップ、舞台マップ(世界/日本)、時代設定タイムラインでマンガの歴史を可視化。おすすめ投稿とコマ単位のコメントは吹き出しで。",
  openGraph: {
    title: "MANGA MAP — マンガの歴史とジャンルの進化マップ",
    description:
      "171作品のマンガをジャンル系統図・舞台マップ・時代設定タイムラインで可視化。読者の声はマンガの吹き出しで。",
    siteName: "MANGA MAP",
    type: "website",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "MANGA MAP — マンガの歴史とジャンルの進化マップ",
    description: "マンガの歴史・ジャンル・舞台・時代を1つのサイトで可視化",
  },
};

// マンガの組版慣習に沿ったフォントセット
// ・タイトル/見出し: 立体コミック調 = Rampart One
// ・セリフ: アンチック体(かなアンチック+漢字ゴシック) = Shippori Antique B1
// ・モノローグ/回想: 明朝体 = Shippori Mincho
// ・叫び: 極太角ゴシック = Zen Kaku Gothic New 900
// ・欄外の手書きツッコミ = Yusei Magic / 少女マンガの手書きモノローグ = Klee One
// ・時代劇/ホラーの筆文字 = Yuji Boku ・ギャグのポップ体 = Mochiy Pop One
const GOOGLE_FONTS =
  "https://fonts.googleapis.com/css2?" +
  [
    "family=Zen+Kaku+Gothic+New:wght@500;700;900",
    "family=Rampart+One",
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
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
