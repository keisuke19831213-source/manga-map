import type { Lang } from "@/lib/i18n";

const X_URL = "https://x.com/emo_matsuishi";
// REGENの正のリンク先が決まったらここ1行を差し替える（判定待ち・2026-07-29）
const REGEN_URL = "https://mqri.or.jp";

// 文章そのものが声なので、日英を並べて持つ（辞書に散らすより読める）
const TEXT = {
  ja: {
    h1: "このサイトについて",
    lead: "「あの作品はどこから来て、どこへ影響を残したのか」——マンガ100年の系譜を、一枚の地図で眺めたい。そんな個人的な願望から生まれたサイトです。",
    dedication:
      "マンガという表現をつくってきたすべての先人たち、そしていままさに前線で描き続ける作家たちへ、最大限のリスペクトを。",
    whyH: "なぜつくっているか",
    whySub: "好奇心から始めて、描き手に還るところまでを役目にする",
    why1: "このマップは、好奇心から生まれました。好きな作品がどこから来て、どう繋がっているのか。一枚の地図にしてみたら、マンガは名作の寄せ集めではなく、大勢で100年かけて育ててきたひとつの流れに見えてきました。",
    why2: "この地図の役目は、案内までです。ここで出会った作品を気に入ったら、ぜひ本物のところへ——読んで、買って、次の巻へ。描き手に注意とお金が還っていく入口になれたら、地図は役目を果たしています。",
    why3: "文化を次の世代へ手渡していくことは、自然を手渡していくことと同じだと考えています。この地図で、誰かのプラスの感情が少しでも増えますように。",
    whatH: "なにをするサイト?",
    whatSub: "マンガに「出会い直す」ための地図",
    what1:
      "ジャンルの系統樹、物語の舞台、時代設定、そして「心が動いたコマ」まで——いろんな入口からマンガに出会い直せる地図を、すこしずつ育てています。",
    promiseH: "約束",
    promiseSub: "この地図は「唯一の正解」ではなく、見晴らしのいい仮説です",
    promises: [
      "点数とランキングはつけません。文化は競技ではないので。",
      "作品へのリンクは、公式の販売・配信だけを使います。",
      "出典を示し、諸説あるものは諸説のまま書きます。",
      "まちがいは直します。見つけたら教えてください。",
      "選ぶのは人間です。AIは調べものを手伝いますが、敬意は人の仕事です。",
    ],
    correct1:
      "ジャンルの成立年や影響関係には諸説あります。ここに引いた線は資料をもとにした一つの見立てで、「ここは違うのでは?」という指摘は大歓迎です。詳しい方の声が入るほど、この地図は正確で面白くなります。お気づきの点は ",
    correct2: " までお寄せください。",
    whoH: "運営者",
    whoSub: "前面はMANGA MAP、奥にひとりの読者がいます",
    whoName: "松石圭介",
    who1:
      "(まついし けいすけ)。マンガが好きな個人です。このサイトはAIとの共作で、企画とデータの取捨選択・最終判断は人間が、実装の多くはAIが担っています。個人がAIと組むとここまで作れる、という実演も兼ねています。",
    contact: "連絡先: ",
    regen: "この地図は、人と自然と文化にプラスを増やす取り組み「REGEN」の一部としてつくっています。 ",
    regenLink: "REGENについて",
    coverH: "書影とリンクについて",
    coverSub: "Amazonアソシエイト・プログラムを利用しています",
    cover1:
      "作品の書影と「読む」リンクはAmazonのデータを利用しており、当サイトは適格販売により収入を得ています。得られた収入はサイトの維持と地図の拡張に充てます。",
  },
  en: {
    h1: "About this site",
    lead: "Where did that work come from, and where did it leave its mark? I wanted to look at a hundred years of manga on a single map. This site grew out of that private wish.",
    dedication:
      "With the deepest respect to everyone who built manga as a form, and to the artists drawing at the front line right now.",
    whyH: "Why I am making this",
    whySub: "Start from curiosity; finish by returning something to the people who draw",
    why1: "This map came out of curiosity. Where did the work I love come from, and how is it connected to the rest? Once it was all on one map, manga stopped looking like a pile of masterpieces and started looking like one current, grown by a great many people over a hundred years.",
    why2: "The map's job ends at pointing. If you like something you met here, please go to the real thing — read it, buy it, get the next volume. If it becomes a doorway through which attention and money find their way back to the artists, the map has done its job.",
    why3: "Handing culture to the next generation is, I think, the same act as handing on the natural world. I hope this map adds a little to someone's stock of good feeling.",
    whatH: "What this site does",
    whatSub: "A map for meeting manga again",
    what1:
      "A family tree of genres, the places stories are set in, the eras they take place in, and down to the single panel that moved someone — I am growing a map you can enter from many doors.",
    promiseH: "Promises",
    promiseSub: "This map is not the one right answer. It is a hypothesis with a good view.",
    promises: [
      "No scores and no rankings. Culture is not a competition.",
      "Links to works go only to official sales and official streaming.",
      "Sources are shown, and where opinions differ, the differences stay in.",
      "Mistakes get fixed. Tell me when you find one.",
      "A human does the choosing. AI helps with the looking-up, but respect is a person's work.",
    ],
    correct1:
      "Founding years and lines of influence are debated. The lines drawn here are one reading of the sources, and if you think one of them is wrong, please say so — the more people who know the field speak up, the more accurate and the more interesting this map becomes. Anything you notice, please send to ",
    correct2: ".",
    whoH: "Who runs this",
    whoSub: "MANGA MAP is the front; behind it there is one reader",
    whoName: "Keisuke Matsuishi",
    who1:
      ". A private individual who likes manga. This site is made together with AI: a human does the planning, the choosing of what goes in, and the final calls, while AI does much of the implementation. It doubles as a demonstration of how far one person working with AI can get.",
    contact: "Contact: ",
    regen: "This map is made as part of REGEN, an effort to add to people, nature and culture. ",
    regenLink: "About REGEN",
    coverH: "About covers and links",
    coverSub: "This site takes part in the Amazon Associates Programme",
    cover1:
      "Book covers and read links use Amazon's data, and this site earns from qualifying purchases. What it earns goes to keeping the site running and extending the map.",
  },
} as const;

export default function AboutBody({ lang = "ja" }: { lang?: Lang }) {
  const x = TEXT[lang];
  return (
    <div className="page" style={{ maxWidth: 760 }}>
      <div className="page-en">ABOUT</div>
      <h1>{x.h1}</h1>
      <p className="page-lead">{x.lead}</p>

      <p
        style={{
          fontSize: 14,
          lineHeight: 2,
          margin: "22px 0 0",
          borderLeft: "2px solid currentColor",
          paddingLeft: 16,
        }}
      >
        {x.dedication}
      </p>

      <h2 className="section-title">{x.whyH}</h2>
      <p className="section-sub">{x.whySub}</p>
      <p style={{ fontSize: 14, lineHeight: 2, margin: "0 0 14px" }}>{x.why1}</p>
      <p style={{ fontSize: 14, lineHeight: 2, margin: "0 0 14px" }}>{x.why2}</p>
      <p style={{ fontSize: 14, lineHeight: 2, margin: "0 0 8px" }}>{x.why3}</p>

      <h2 className="section-title">{x.whatH}</h2>
      <p className="section-sub">{x.whatSub}</p>
      <p style={{ fontSize: 14, lineHeight: 2, margin: "0 0 8px" }}>{x.what1}</p>

      <h2 className="section-title">{x.promiseH}</h2>
      <p className="section-sub">{x.promiseSub}</p>
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
        {x.promises.map((p) => (
          <li key={p} style={{ display: "flex", gap: 10, fontSize: 14, lineHeight: 1.9 }}>
            <span aria-hidden="true" style={{ opacity: 0.5 }}>
              —
            </span>
            <span>{p}</span>
          </li>
        ))}
      </ul>
      <p style={{ fontSize: 14, lineHeight: 2, margin: "0 0 8px" }}>
        {x.correct1}
        <a href={X_URL} target="_blank" rel="noopener noreferrer">
          X (@emo_matsuishi)
        </a>
        {x.correct2}
      </p>

      <h2 className="section-title">{x.whoH}</h2>
      <p className="section-sub">{x.whoSub}</p>
      <div className="manga-panel" style={{ padding: "18px 20px", margin: "14px 0 8px" }}>
        <p style={{ fontSize: 14, lineHeight: 2, margin: 0 }}>
          <strong>{x.whoName}</strong>
          {x.who1}
          <br />
          {x.contact}
          <a href={X_URL} target="_blank" rel="noopener noreferrer">
            X @emo_matsuishi
          </a>
          <br />
          {x.regen}
          <a href={REGEN_URL} target="_blank" rel="noopener noreferrer">
            {x.regenLink}
          </a>
        </p>
      </div>

      <h2 className="section-title">{x.coverH}</h2>
      <p className="section-sub">{x.coverSub}</p>
      <p style={{ fontSize: 14, lineHeight: 2, margin: "0 0 8px" }}>{x.cover1}</p>
    </div>
  );
}
