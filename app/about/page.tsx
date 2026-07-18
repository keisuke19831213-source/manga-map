import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "このサイトについて — MANGA MAP",
  description:
    "MANGA MAPの制作動機、データへの姿勢、運営者について。マンガ100年の系譜を一枚の地図で眺めたい、という願望から生まれたサイトです。",
};

const X_URL = "https://x.com/emo_matsuishi";

export default function AboutPage() {
  return (
    <div className="page" style={{ maxWidth: 760 }}>
      <div className="page-en">ABOUT</div>
      <h1>このサイトについて</h1>
      <p className="page-lead">
        「あの作品はどこから来て、どこへ影響を残したのか」——
        マンガ100年の系譜を、一枚の地図で眺めたい。そんな個人的な願望から生まれたサイトです。
      </p>

      <h2 className="section-title">なにをするサイト?</h2>
      <p className="section-sub">マンガに「出会い直す」ための地図</p>
      <p style={{ fontSize: 14, lineHeight: 2, margin: "0 0 8px" }}>
        音楽ジャンルの系譜を一枚に可視化した{" "}
        <a href="https://musicmap.info" target="_blank" rel="noopener noreferrer">
          musicmap.info
        </a>{" "}
        に感銘を受けて、そのマンガ版を目指しました。ジャンルの系統樹、物語の舞台、時代設定、
        そして「心が動いたコマ」まで——いろんな入口からマンガに出会い直せる地図を、すこしずつ育てています。
      </p>

      <h2 className="section-title">データと正確さについて</h2>
      <p className="section-sub">この地図は「唯一の正解」ではなく、見晴らしのいい仮説です</p>
      <p style={{ fontSize: 14, lineHeight: 2, margin: "0 0 8px" }}>
        ジャンルの成立年や影響関係には諸説あります。ここに引いた線は資料をもとにした一つの見立てで、
        「ここは違うのでは?」という指摘は大歓迎です。詳しい方の声が入るほど、この地図は正確で面白くなります。
        お気づきの点は{" "}
        <a href={X_URL} target="_blank" rel="noopener noreferrer">
          X(@emo_matsuishi)
        </a>{" "}
        までお寄せください。
      </p>

      <h2 className="section-title">運営者</h2>
      <p className="section-sub">前面はMANGA MAP、奥にひとりの読者がいます</p>
      <div className="manga-panel" style={{ padding: "18px 20px", margin: "14px 0 8px" }}>
        <p style={{ fontSize: 14, lineHeight: 2, margin: 0 }}>
          <strong>松石圭介</strong>(まついし けいすけ)。マンガが好きな個人です。
          このサイトはAIとの共作で、企画とデータの取捨選択・最終判断は人間が、実装の多くはAIが担っています。
          個人がAIと組むとここまで作れる、という実演も兼ねています。
          <br />
          連絡先:{" "}
          <a href={X_URL} target="_blank" rel="noopener noreferrer">
            X @emo_matsuishi
          </a>
        </p>
      </div>

      <h2 className="section-title">書影とリンクについて</h2>
      <p className="section-sub">Amazonアソシエイト・プログラムを利用しています</p>
      <p style={{ fontSize: 14, lineHeight: 2, margin: "0 0 8px" }}>
        作品の書影と「読む」リンクはAmazonのデータを利用しており、当サイトは適格販売により収入を得ています。
        得られた収入はサイトの維持と地図の拡張に充てます。
      </p>
    </div>
  );
}
