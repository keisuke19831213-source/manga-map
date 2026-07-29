import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "このサイトについて — MANGA MAP",
  description:
    "MANGA MAPの制作動機、データへの姿勢、運営者について。マンガ100年の系譜を一枚の地図で眺めたい、という願望から生まれたサイトです。",
};

const X_URL = "https://x.com/emo_matsuishi";
// REGENの正のリンク先が決まったらここ1行を差し替える（判定待ち・2026-07-29）
const REGEN_URL = "https://mqri.or.jp";

// ★マップシリーズ共通の署名（神マップ／MUSIC MAP と同じ5行。文脈だけ差し替える）
const PROMISES = [
  "点数とランキングはつけません。文化は競技ではないので。",
  "作品へのリンクは、公式の販売・配信だけを使います。",
  "出典を示し、諸説あるものは諸説のまま書きます。",
  "まちがいは直します。見つけたら教えてください。",
  "選ぶのは人間です。AIは調べものを手伝いますが、敬意は人の仕事です。",
];

export default function AboutPage() {
  return (
    <div className="page" style={{ maxWidth: 760 }}>
      <div className="page-en">ABOUT</div>
      <h1>このサイトについて</h1>
      <p className="page-lead">
        「あの作品はどこから来て、どこへ影響を残したのか」——
        マンガ100年の系譜を、一枚の地図で眺めたい。そんな個人的な願望から生まれたサイトです。
      </p>

      <p
        style={{
          fontSize: 14,
          lineHeight: 2,
          margin: "22px 0 0",
          borderLeft: "2px solid currentColor",
          paddingLeft: 16,
        }}
      >
        マンガという表現をつくってきたすべての先人たち、そしていままさに前線で描き続ける作家たちへ、最大限のリスペクトを。
      </p>

      <h2 className="section-title">なぜつくっているか</h2>
      <p className="section-sub">好奇心から始めて、描き手に還るところまでを役目にする</p>
      <p style={{ fontSize: 14, lineHeight: 2, margin: "0 0 14px" }}>
        このマップは、好奇心から生まれました。好きな作品がどこから来て、どう繋がっているのか。
        一枚の地図にしてみたら、マンガは名作の寄せ集めではなく、大勢で100年かけて育ててきたひとつの流れに見えてきました。
      </p>
      <p style={{ fontSize: 14, lineHeight: 2, margin: "0 0 14px" }}>
        この地図の役目は、案内までです。ここで出会った作品を気に入ったら、ぜひ本物のところへ——読んで、買って、次の巻へ。
        描き手に注意とお金が還っていく入口になれたら、地図は役目を果たしています。
      </p>
      <p style={{ fontSize: 14, lineHeight: 2, margin: "0 0 8px" }}>
        文化を次の世代へ手渡していくことは、自然を手渡していくことと同じだと考えています。
        この地図で、誰かのプラスの感情が少しでも増えますように。
      </p>

      <h2 className="section-title">なにをするサイト?</h2>
      <p className="section-sub">マンガに「出会い直す」ための地図</p>
      <p style={{ fontSize: 14, lineHeight: 2, margin: "0 0 8px" }}>
        ジャンルの系統樹、物語の舞台、時代設定、そして「心が動いたコマ」まで——
        いろんな入口からマンガに出会い直せる地図を、すこしずつ育てています。
      </p>

      <h2 className="section-title">約束</h2>
      <p className="section-sub">この地図は「唯一の正解」ではなく、見晴らしのいい仮説です</p>
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: "0 0 14px",
          display: "flex",
          flexDirection: "column",
          gap: 9,
        }}
      >
        {PROMISES.map((t) => (
          <li key={t} style={{ display: "flex", gap: 10, fontSize: 14, lineHeight: 1.9 }}>
            <span aria-hidden="true" style={{ opacity: 0.5 }}>
              —
            </span>
            <span>{t}</span>
          </li>
        ))}
      </ul>
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
          <br />
          この地図は、人と自然と文化にプラスを増やす取り組み「REGEN」の一部としてつくっています。{" "}
          <a href={REGEN_URL} target="_blank" rel="noopener noreferrer">
            REGENについて
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
