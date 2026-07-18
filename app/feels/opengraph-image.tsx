import { ImageResponse } from "next/og";
import { EMOTIONS } from "@/lib/emotions";
import { loadJPFont, OG_SIZE, OG_PAPER, OG_INK } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "今夜は、どんな気分? — MANGA MAP 感情の処方箋";

export default async function Image() {
  const text = "今夜は、どんな気分?感情の処方箋読者の実測データからマンガを逆引きMANGAMAP・" + EMOTIONS.map((e) => e.label).join("");
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
            gap: 26,
            position: "relative",
          }}
        >
          <div style={{ display: "flex", fontSize: 30, fontWeight: 900, color: "#e33b2e", letterSpacing: 4 }}>
            感情の処方箋
          </div>
          <div style={{ display: "flex", fontSize: 84, fontWeight: 900, color: OG_INK, letterSpacing: -1 }}>
            今夜は、どんな気分?
          </div>
          <div style={{ display: "flex", gap: 22, marginTop: 8 }}>
            {EMOTIONS.map((e) => (
              <div
                key={e.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 104,
                  height: 104,
                  fontSize: 58,
                  backgroundColor: "#fff",
                  border: `5px solid ${OG_INK}`,
                  borderTop: `10px solid ${e.color}`,
                  boxShadow: `6px 6px 0 ${OG_INK}`,
                }}
              >
                {e.emoji}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", fontSize: 26, fontWeight: 700, color: "#6b6257", marginTop: 6 }}>
            読者の実測データからマンガを逆引き
          </div>
          <div
            style={{
              display: "flex",
              position: "absolute",
              bottom: 24,
              right: 36,
              fontSize: 32,
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
