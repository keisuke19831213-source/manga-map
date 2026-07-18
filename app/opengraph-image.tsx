import { ImageResponse } from "next/og";
import { CATEGORIES, GENRES, WORKS } from "@/lib/data";
import { loadJPFont, OG_SIZE, OG_PAPER, OG_INK } from "@/lib/og";

// サイト全体のデフォルトOG画像。個別にopengraph-imageを持つルート(/feels等)以外の
// 全ページ(トップ・図鑑・年表・aboutなど)のシェアカードになる。
export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "MANGA MAP — マンガの歴史とジャンルの進化マップ";

export default async function Image() {
  const title = "マンガの歴史とジャンルの進化マップ";
  const sub = `${GENRES.length}ジャンル・${WORKS.length}作品 — 影響の系譜を一枚の地図で`;
  const text = title + sub + CATEGORIES.map((c) => c.name).join("") + "MANGAMAP";
  const font = await loadJPFont(text);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: OG_PAPER,
          backgroundImage: `radial-gradient(circle at 25% 25%, #17131018 2.5px, transparent 3px)`,
          backgroundSize: "26px 26px",
          padding: 34,
          fontFamily: "ZenKaku",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            border: `10px solid ${OG_INK}`,
            backgroundColor: "#fffdf4",
            boxShadow: `18px 18px 0 ${OG_INK}`,
            gap: 30,
            position: "relative",
          }}
        >
          <div style={{ display: "flex", fontSize: 56, fontWeight: 900, color: OG_INK, letterSpacing: 1 }}>
            {title}
          </div>
          <div style={{ display: "flex", gap: 11 }}>
            {CATEGORIES.map((c) => (
              <div
                key={c.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "10px 13px",
                  fontSize: 22,
                  fontWeight: 900,
                  color: OG_INK,
                  backgroundColor: "#fff",
                  border: `4px solid ${OG_INK}`,
                  borderTop: `8px solid ${c.color}`,
                  boxShadow: `4px 4px 0 ${OG_INK}`,
                }}
              >
                {c.name}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", fontSize: 28, fontWeight: 700, color: "#6b6257" }}>{sub}</div>
          <div
            style={{
              display: "flex",
              position: "absolute",
              bottom: 24,
              right: 36,
              fontSize: 36,
              fontWeight: 900,
              color: OG_INK,
              letterSpacing: 3,
            }}
          >
            MANGA<span style={{ color: "#e33b2e" }}>MAP</span>
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: [{ name: "ZenKaku", data: font, weight: 900, style: "normal" }] }
  );
}
