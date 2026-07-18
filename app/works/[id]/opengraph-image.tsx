import { ImageResponse } from "next/og";
import { WORKS, genreById, catOf } from "@/lib/data";
import { loadJPFont, OG_SIZE, OG_PAPER, OG_INK } from "@/lib/og";

// 作品ごとのOG画像。静的カタログ(WORKS)のみ対象で、
// ユーザー登録作品(uw-*)はサイト共通カードにフォールバックする。
export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "作品紹介 — MANGA MAP";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const work = WORKS.find((w) => w.id === id);

  const title = work ? work.title : "作品図鑑";
  const meta = work
    ? `${work.author} · ${work.year}年${work.magazine ? ` · ${work.magazine}` : ""}`
    : "マンガ史の節目となった作品たち";
  const desc = work ? (work.desc.length > 46 ? work.desc.slice(0, 45) + "…" : work.desc) : "";
  const genres = work
    ? work.genres
        .map((gid) => genreById(gid))
        .filter((g) => !!g)
        .slice(0, 3)
    : [];
  const accent = genres[0] ? catOf(genres[0]).color : "#e33b2e";

  const text = title + meta + desc + genres.map((g) => g!.name).join("") + "MANGAMAP作品図鑑";
  const font = await loadJPFont(text);
  const titleSize = title.length <= 8 ? 84 : title.length <= 14 ? 66 : 52;

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
            alignItems: "flex-start",
            justifyContent: "center",
            border: `10px solid ${OG_INK}`,
            borderLeft: `26px solid ${accent}`,
            backgroundColor: "#fffdf4",
            boxShadow: `18px 18px 0 ${OG_INK}`,
            gap: 22,
            position: "relative",
            padding: "40px 56px",
          }}
        >
          <div style={{ display: "flex", fontSize: 26, fontWeight: 900, color: "#e33b2e", letterSpacing: 4 }}>
            作品図鑑
          </div>
          <div style={{ display: "flex", fontSize: titleSize, fontWeight: 900, color: OG_INK, lineHeight: 1.2 }}>
            {title}
          </div>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 700, color: "#4a4238" }}>{meta}</div>
          {desc ? (
            <div style={{ display: "flex", fontSize: 26, fontWeight: 700, color: "#6b6257" }}>{desc}</div>
          ) : null}
          {genres.length > 0 ? (
            <div style={{ display: "flex", gap: 14, marginTop: 6 }}>
              {genres.map((g) => (
                <div
                  key={g!.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "8px 18px",
                    fontSize: 24,
                    fontWeight: 900,
                    color: OG_INK,
                    backgroundColor: "#fff",
                    border: `4px solid ${catOf(g!).color}`,
                    borderRadius: 999,
                  }}
                >
                  {g!.name}
                </div>
              ))}
            </div>
          ) : null}
          <div
            style={{
              display: "flex",
              position: "absolute",
              bottom: 24,
              right: 36,
              fontSize: 34,
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
