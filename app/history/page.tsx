import Link from "next/link";
import { workById } from "@/lib/data";

export const metadata = { title: "マンガ史年表 — MANGA MAP" };

interface Era {
  era: string;
  title: string;
  body: string;
  works: string[]; // work id
}

const ERAS: Era[] = [
  {
    era: "1900s—1930s",
    title: "近代マンガの誕生",
    body: "北澤楽天の風刺漫画に始まり、新聞連載の『正チャンの冒険』でコマとフキダシの文法が定着。雑誌『少年倶楽部』の『のらくろ』が戦前最大のヒットとなり、「子どもがマンガを読む」文化が生まれた。街頭では紙芝居が隆盛し、のちの劇画作家たちを育てた。",
    works: ["norakuro"],
  },
  {
    era: "1945—1955",
    title: "手塚治虫とストーリーマンガ革命",
    body: "敗戦後の大阪で赤本マンガが氾濫するなか、1947年『新宝島』が映画的なコマ運びで少年たちを熱狂させる。手塚治虫は長編で物語を語る「ストーリーマンガ」を確立し、『鉄腕アトム』『リボンの騎士』で少年マンガと少女マンガ両方の原型を作った。トキワ荘には次世代の才能が集結する。",
    works: ["shintakarajima", "tetsuwan", "ribon_kishi"],
  },
  {
    era: "1955—1965",
    title: "貸本文化と劇画の登場",
    body: "貸本屋向けの描き下ろし単行本が独自の市場を形成。そこから辰巳ヨシヒロら「劇画工房」が、手塚的な丸い絵への対抗としてリアルな大人向けマンガ=劇画を宣言する。1959年には週刊少年マガジン・サンデーが同日創刊され、週刊連載の時代が始まった。1964年、白土三平のために雑誌『ガロ』が創刊され、オルタナティブの聖地となる。",
    works: ["kamui", "gegege"],
  },
  {
    era: "1966—1975",
    title: "スポ根の熱と24年組の革命",
    body: "『巨人の星』『あしたのジョー』が劇画の熱を少年誌に持ち込み、努力と根性のドラマが一世を風靡。一方、少女マンガでは萩尾望都・竹宮惠子ら「24年組」が内面のモノローグ、SF、少年愛を持ち込み、表現を文学の高みへ引き上げた。『ベルサイユのばら』は社会現象となる。青年誌も続々創刊され、読者の年齢が一気に広がった10年。",
    works: ["kyojin", "ashita", "poe", "berubara", "kaze_ki", "devilman"],
  },
  {
    era: "1976—1985",
    title: "ラブコメ、ニューウェーブ、多様化",
    body: "高橋留美子・あだち充が少女マンガ的な恋愛の文法を少年誌に持ち込みラブコメが開花。大友克洋『AKIRA』は劇画でも手塚でもない新しい絵で世界に衝撃を与えた。青年誌では『美味しんぼ』『課長島耕作』がグルメ・ビジネスという「大人の実用」ジャンルを発明。マンガが全世代の読み物になった。",
    works: ["urusei", "touch", "akira", "oishinbo", "shima"],
  },
  {
    era: "1985—1995",
    title: "ジャンプ黄金期",
    body: "『ドラゴンボール』『北斗の拳』『SLAM DUNK』を擁する週刊少年ジャンプが1995年に発行部数653万部の頂点へ。「友情・努力・勝利」とトーナメントバトルの方程式が完成する。少女誌では『セーラームーン』が戦う美少女という新しいヒロイン像を作り、世界の少女文化を塗り替えた。",
    works: ["dragonball", "hokuto", "slam", "sailor", "tomie"],
  },
  {
    era: "1995—2005",
    title: "細分化とサブカルチャーの時代",
    body: "ジャンプ一強が崩れ、ジャンルは急速に細分化。『カイジ』の極限心理戦、『あずまんが大王』が発明した「日常系」、『DEATH NOTE』の頭脳戦、『ダーリンは外国人』のコミックエッセイなど、それぞれのニッチが独自の進化を始める。マンガ喫茶とブックオフが読まれ方も変えた。",
    works: ["kaiji", "azumanga", "deathnote", "darling", "onepiece"],
  },
  {
    era: "2005—2015",
    title: "Webという新大陸",
    body: "個人サイト発の『ワンパンマン』が既存の出版流通を飛び越えてヒット。『進撃の巨人』はマイナー誌から社会現象となり、「ジャンプ以外」からの大ヒットが常態化する。電子書籍とスマホアプリが普及し、Web小説のコミカライズ(なろう系・異世界転生)が一大産業になった。",
    works: ["onepunch", "shingeki", "tensura"],
  },
  {
    era: "2015—現在",
    title: "グローバルとSNSの時代",
    body: "『鬼滅の刃』がアニメとの相乗効果で歴史的ブームを起こし、『チェンソーマン』ら新世代がジャンプの型を更新し続ける。韓国発の縦スクロール・ウェブトゥーンがピッコマ・LINEマンガを通じて急成長し、Twitter発の『100日後に死ぬワニ』はSNSそのものを物語装置にした。日本のマンガは今、発表形式そのものが進化の最前線にある。",
    works: ["kimetsu", "chainsaw", "sololeveling", "wani"],
  },
];

export default function HistoryPage() {
  return (
    <div className="page">
      <h1>マンガ史年表</h1>
      <p className="page-lead">
        ポンチ絵から縦スクロールまで、約120年のマンガ史をダイジェストで。各時代の代表作から作品ページへ飛べます。
        全体の系統関係は<Link href="/" style={{ color: "#7fb3ff" }}>ジャンルマップ</Link>でどうぞ。
      </p>
      <div className="timeline">
        {ERAS.map((e) => (
          <div key={e.era} className="tl-item">
            <div className="era">{e.era}</div>
            <h3>{e.title}</h3>
            <p>{e.body}</p>
            <div className="tl-works">
              代表作:{" "}
              {e.works.map((wid, i) => {
                const w = workById(wid);
                if (!w) return null;
                return (
                  <span key={wid}>
                    {i > 0 && " / "}
                    <Link href={`/works/${wid}`}>『{w.title}』</Link>
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
