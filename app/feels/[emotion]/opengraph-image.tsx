import { ImageResponse } from "next/og";
import { EMOTIONS, emotionOf } from "@/lib/emotions";
import { loadJPFont, OG_SIZE, OG_PAPER, OG_INK } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return EMOTIONS.map((e) => ({ emotion: e.id }));
}

export async function generateImageMetadata({ params }: { params: Promise<{ emotion: string }> }) {
  const { emotion } = await params;
  const e = emotionOf(emotion);
  return [{ id: "og", size: OG_SIZE, alt: e ? `${e.catch} — MANGA MAP 感情の処方箋` : "MANGA MAP", contentType: "image/png" }];
}

export default async function Image({ params }: { params: Promise<{ emotion: string }> }) {
  const { emotion } = await params;
  const e = emotionOf(emotion) ?? EMOTIONS[0];
  const text = `${e.catch}${e.night}${e.label}感情の処方箋読者の実測データからMANGAMAP・`;
  const font = await loadJPFont(text);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: OG_PAPER,
          backgroundImage: `radial-gradient(circle at 25% 25%, ${e.color}22 2.5px, transparent 3px)`,
          backgroundSize: "26px 26px",
          padding: 34,
          fontFamily: "ZenKaku",
        }}
      >
        {/* 外枠(マンガのコマ) */}
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            border: `10px solid ${OG_INK}`,
            backgroundColor: "#fffdf4",
            boxShadow: `18px 18px 0 ${OG_INK}`,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* 上の感情色バンド */}
          <div style={{ display: "flex", height: 26, backgroundColor: e.color, borderBottom: `6px solid ${OG_INK}` }} />

          <div style={{ display: "flex", flex: 1, alignItems: "center", padding: "0 64px", gap: 48 }}>
            {/* 巨大emoji */}
            <div style={{ display: "flex", fontSize: 210, lineHeight: 1 }}>{e.emoji}</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 18, flex: 1 }}>
              <div style={{ display: "flex", fontSize: 30, fontWeight: 900, color: e.color, letterSpacing: 2 }}>
                感情の処方箋
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: e.catch.length > 11 ? 56 : 66,
                  fontWeight: 900,
                  color: OG_INK,
                  lineHeight: 1.2,
                  letterSpacing: -1,
                  whiteSpace: "nowrap",
                }}
              >
                {e.catch}
              </div>
              <div style={{ display: "flex", fontSize: 27, fontWeight: 700, color: "#6b6257", lineHeight: 1.5 }}>
                {e.night} — 読者の実測データから
              </div>
            </div>
          </div>

          {/* 下部: ロゴ */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "18px 40px",
              borderTop: `5px solid ${OG_INK}`,
              backgroundColor: OG_PAPER,
            }}
          >
            <div style={{ display: "flex", fontSize: 34, fontWeight: 900, color: OG_INK, letterSpacing: 3 }}>
              MANGA<span style={{ color: "#e33b2e" }}>MAP</span>
            </div>
            <div style={{ display: "flex", fontSize: 24, fontWeight: 900, color: "#fff", backgroundColor: e.color, padding: "6px 26px", borderRadius: 999, border: `4px solid ${OG_INK}` }}>
              {e.emoji} {e.label}
            </div>
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: [{ name: "ZenKaku", data: font, weight: 900, style: "normal" }] }
  );
}
