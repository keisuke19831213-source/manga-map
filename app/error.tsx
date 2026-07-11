"use client";

// クライアント例外時のフォールバック(素のApplication errorの代わり)
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="page" style={{ textAlign: "center", paddingTop: 70 }}>
      <div style={{ fontSize: 44, marginBottom: 10 }}>📖💦</div>
      <h1 style={{ fontFamily: "var(--font-title)", fontSize: 26, textShadow: "2px 2px 0 var(--yellow)" }}>
        ページの表示に失敗しました
      </h1>
      <p style={{ color: "var(--ink-soft)", fontSize: 13.5, lineHeight: 2, margin: "14px 0 24px" }}>
        一時的な不具合の可能性があります。
        <br />
        下のボタンで再読み込みをお試しください。
      </p>
      <button className="btn" onClick={() => reset()}>
        もう一度読み込む
      </button>
      <div style={{ marginTop: 14 }}>
        <button
          className="chip"
          onClick={() => {
            window.location.href = "/";
          }}
        >
          トップへもどる
        </button>
      </div>
    </div>
  );
}
