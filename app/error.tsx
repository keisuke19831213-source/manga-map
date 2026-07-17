"use client";

// クライアント例外時のフォールバック(素のApplication errorの代わり)
export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="page" style={{ textAlign: "center", paddingTop: 70 }}>
      <div style={{ fontSize: 44, marginBottom: 10 }}>📖💦</div>
      <h1 style={{ fontFamily: "var(--font-title)", fontSize: 26 }}>
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
      {/* 原因調査用にエラー内容を小さく表示 */}
      <pre
        style={{
          marginTop: 30,
          fontSize: 10,
          color: "var(--ink-soft)",
          whiteSpace: "pre-wrap",
          wordBreak: "break-all",
          textAlign: "left",
          maxWidth: 480,
          marginLeft: "auto",
          marginRight: "auto",
          opacity: 0.7,
        }}
      >
        {error?.message?.slice(0, 300)}
      </pre>
    </div>
  );
}
