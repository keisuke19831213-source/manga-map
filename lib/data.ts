// マンガの歴史・ジャンル系統マップのデータ定義
// musicmap.info のマンガ版。ノード=ジャンル/ムーブメント、エッジ=影響関係。

export type CategoryId =
  | "roots"
  | "shonen"
  | "shojo"
  | "seinen"
  | "gag"
  | "alt"
  | "digital";

export interface Category {
  id: CategoryId;
  name: string;
  color: string;
  colX: number; // マップ上の列の中心X座標
  blurb: string;
}

export interface GenreNode {
  id: string;
  name: string;
  en: string;
  year: number; // 成立・勃興のおおよその年(表示用)
  ly?: number; // レイアウト用の年(重なり回避のためのずらし)
  cat: CategoryId;
  desc: string;
}

export type EdgeKind = "evolution" | "influence" | "counter";

export interface GenreEdge {
  from: string;
  to: string;
  kind: EdgeKind;
}

export interface Work {
  id: string;
  title: string;
  author: string;
  year: number;
  magazine?: string;
  genres: string[];
  desc: string;
}

export const CATEGORIES: Category[] = [
  {
    id: "seinen",
    name: "青年",
    color: "#2563eb",
    colX: 170,
    blurb: "劇画から生まれた大人のためのマンガ。リアリズム、社会、仕事、SF。",
  },
  {
    id: "shonen",
    name: "少年",
    color: "#ea580c",
    colX: 445,
    blurb: "週刊少年誌が育てた王道。努力・友情・勝利からダークファンタジーまで。",
  },
  {
    id: "roots",
    name: "源流",
    color: "#64748b",
    colX: 720,
    blurb: "ポンチ絵から手塚治虫まで。すべてのマンガの出発点。",
  },
  {
    id: "gag",
    name: "ギャグ・コメディ",
    color: "#d97706",
    colX: 720,
    blurb: "赤塚不二夫が体系化した笑いの系譜。ナンセンス、不条理、日常系へ。",
  },
  {
    id: "shojo",
    name: "少女・女性",
    color: "#db2777",
    colX: 995,
    blurb: "24年組が起こした表現革命。内面描写、ロマンス、BL、レディース。",
  },
  {
    id: "alt",
    name: "オルタナティブ",
    color: "#7c3aed",
    colX: 1270,
    blurb: "ガロとCOMに始まる実験精神。商業の外側でマンガ表現を拡張した。",
  },
  {
    id: "digital",
    name: "デジタル・新潮流",
    color: "#0891b2",
    colX: 1500,
    blurb: "Web・スマホ・SNSが生んだ新しいマンガのかたち。",
  },
];

export const GENRES: GenreNode[] = [
  // ===== 源流(前史: 近代マンガ以前) =====
  // ly は1900年始まりのマップ上端に「前史」として並べるためのレイアウト用の年
  {
    id: "emaki",
    name: "絵巻物・戯画",
    en: "Emaki & Caricature",
    year: 1150,
    ly: 1893,
    cat: "roots",
    desc: "『鳥獣人物戯画』に代表される、墨線のみで動きと笑いを描いた戯画の伝統。コマもフキダシも無く近代マンガとの直接の血縁は薄いが、「絵で語る」表現の最古の到達点として、しばしばマンガの祖先と呼ばれる。",
  },
  {
    id: "edo_giga",
    name: "江戸の戯画・絵手本",
    en: "Edo Caricature",
    year: 1814,
    ly: 1896.5,
    cat: "roots",
    desc: "葛飾北斎『北斎漫画』や鳥羽絵、草双紙など、江戸の庶民が親しんだ戯画。ここでの「漫画」は気の向くままに描いた素描の意で現在とは別物だが、この語と、庶民が絵を読む文化が近代へ受け継がれた。",
  },
  {
    id: "ponchi",
    name: "ポンチ絵・風刺漫画",
    en: "Satirical Cartoons",
    year: 1900,
    cat: "roots",
    desc: "『団団珍聞』などの風刺画に始まり、北澤楽天が「漫画」という言葉を職業として確立。岡本一平の漫画漫文とともに近代マンガの出発点となった。",
  },
  {
    id: "newspaper",
    name: "新聞連載マンガ",
    en: "Newspaper Strips",
    year: 1923,
    cat: "roots",
    desc: "『正チャンの冒険』『ノンキナトウサン』が大人気に。フキダシとコマ割りによる連続ストーリーの形式がここで定着した。戦後は『サザエさん』が国民的存在に。",
  },
  {
    id: "kodomo",
    name: "戦前子どもマンガ",
    en: "Prewar Children's Manga",
    year: 1931,
    cat: "roots",
    desc: "雑誌『少年倶楽部』の『のらくろ』『冒険ダン吉』が爆発的人気を博し、子ども向けマンガ市場が誕生。単行本文化の原型もここに。",
  },
  {
    id: "kamishibai",
    name: "紙芝居",
    en: "Kamishibai",
    year: 1935,
    cat: "roots",
    desc: "街頭紙芝居は戦前戦後の子どもたちの一大娯楽。水木しげる、白土三平ら後の劇画・怪奇マンガの巨匠たちが絵物語の技術をここで磨いた。",
  },
  {
    id: "akahon",
    name: "赤本マンガ",
    en: "Akahon",
    year: 1946,
    cat: "roots",
    desc: "戦後大阪で生まれた粗製廉価なマンガ単行本。玉石混交の市場から手塚治虫がデビューし、マンガ史が動き出す。",
  },
  {
    id: "story",
    name: "ストーリーマンガ革命",
    en: "Story Manga Revolution",
    year: 1947,
    ly: 1950,
    cat: "roots",
    desc: "手塚治虫『新宝島』が映画的なコマ運びで少年たちに衝撃を与える。長編で物語を語る「ストーリーマンガ」はこの後のあらゆるジャンルの母体となった。",
  },
  {
    id: "kashihon",
    name: "貸本マンガ",
    en: "Rental Manga",
    year: 1955,
    ly: 1956,
    cat: "roots",
    desc: "貸本屋向けに描き下ろされた単行本マンガ。劇画、怪奇、少女マンガの実験場となり、つげ義春・楳図かずお・さいとう・たかをらを輩出した。",
  },

  // ===== 少年 =====
  {
    id: "gekkan",
    name: "月刊少年誌マンガ",
    en: "Monthly Boys' Magazines",
    year: 1950,
    ly: 1951,
    cat: "shonen",
    desc: "『漫画少年』『少年』の時代。『鉄腕アトム』『鉄人28号』が連載され、トキワ荘の若者たち(藤子不二雄、石ノ森章太郎、赤塚不二夫)が育った。",
  },
  {
    id: "weekly",
    name: "週刊少年誌",
    en: "Weekly Shonen Magazines",
    year: 1959,
    cat: "shonen",
    desc: "1959年、少年マガジンと少年サンデーが同日創刊。週刊連載システムがマンガ産業の骨格となる。1968年には少年ジャンプが創刊。",
  },
  {
    id: "yokai",
    name: "妖怪・怪奇マンガ",
    en: "Yokai & Horror",
    year: 1965,
    cat: "shonen",
    desc: "紙芝居・貸本出身の水木しげる『ゲゲゲの鬼太郎』が妖怪ブームを起こす。楳図かずおの恐怖マンガとともに、日本マンガに「異界」の系譜を作った。",
  },
  {
    id: "spokon",
    name: "スポ根",
    en: "Sports & Guts",
    year: 1966,
    ly: 1969,
    cat: "shonen",
    desc: "『巨人の星』『あしたのジョー』。原作者・梶原一騎が持ち込んだ劇画的な熱と「努力・根性」のドラマは、後の少年マンガすべての原型になった。",
  },
  {
    id: "lovecome",
    name: "少年ラブコメ",
    en: "Shonen Rom-Com",
    year: 1978,
    cat: "shonen",
    desc: "高橋留美子『うる星やつら』、あだち充『タッチ』。少女マンガ的な恋愛表現を少年誌に持ち込み、80年代サンデー黄金期を築いた。",
  },
  {
    id: "jump_battle",
    name: "ジャンプ黄金期バトル",
    en: "Jump Golden Age",
    year: 1984,
    cat: "shonen",
    desc: "『ドラゴンボール』『北斗の拳』『聖闘士星矢』。「友情・努力・勝利」とトーナメントバトルの方程式で発行部数653万部の頂点へ。",
  },
  {
    id: "shonen_mystery",
    name: "頭脳戦・サスペンス",
    en: "Mind Games",
    year: 2003,
    cat: "shonen",
    desc: "『DEATH NOTE』が切り開いた、バトルを知略に置き換える系譜。『約束のネバーランド』『カイジ』的な緊張感が少年誌の新定番に。",
  },
  {
    id: "dark_fantasy",
    name: "ダークファンタジー",
    en: "Dark Fantasy",
    year: 2009,
    cat: "shonen",
    desc: "『進撃の巨人』の衝撃以降、『鬼滅の刃』『チェンソーマン』など、死と絶望を正面から描くバトルマンガが主流化。青年マンガとの境界が溶けた。",
  },
  {
    id: "isekai",
    name: "異世界・なろう系",
    en: "Isekai",
    year: 2012,
    ly: 2015,
    cat: "shonen",
    desc: "Web小説投稿サイト発の「異世界転生」ブームがコミカライズで爆発。『転スラ』『Re:ゼロ』など、Web発コンテンツの産業化を象徴するジャンル。",
  },

  // ===== 少女・女性 =====
  {
    id: "shojo_dawn",
    name: "少女マンガ黎明",
    en: "Early Shojo",
    year: 1953,
    cat: "shojo",
    desc: "手塚治虫『リボンの騎士』が少女向けストーリーマンガの原型を提示。『りぼん』『なかよし』が創刊され、少女マンガ市場が立ち上がる。",
  },
  {
    id: "kashihon_shojo",
    name: "初期少女マンガ",
    en: "1960s Shojo",
    year: 1958,
    ly: 1960,
    cat: "shojo",
    desc: "わたなべまさこ、水野英子ら女性作家が台頭。貸本と月刊誌で「涙と母もの」から本格ロマンスまで、少女マンガの文法が形成された。",
  },
  {
    id: "year24",
    name: "24年組革命",
    en: "Year 24 Group",
    year: 1972,
    cat: "shojo",
    desc: "萩尾望都『ポーの一族』、竹宮惠子『風と木の詩』、大島弓子。昭和24年頃生まれの作家たちが内面描写・SF・少年愛を持ち込み、少女マンガを文学の高みへ。",
  },
  {
    id: "shojo_romance",
    name: "大河ロマン少女マンガ",
    en: "Epic Shojo Romance",
    year: 1972,
    ly: 1976,
    cat: "shojo",
    desc: "『ベルサイユのばら』『エースをねらえ!』『ガラスの仮面』。歴史・スポーツ・演劇を舞台に、運命と情熱を描く大河ドラマ路線が少女誌の看板に。",
  },
  {
    id: "bl",
    name: "BL(ボーイズラブ)",
    en: "Boys' Love",
    year: 1978,
    ly: 1982,
    cat: "shojo",
    desc: "24年組の少年愛表現から雑誌『JUNE』が生まれ、90年代に商業BLレーベルが確立。いまや世界的な市場を持つ日本発ジャンル。",
  },
  {
    id: "ladies",
    name: "レディースコミック",
    en: "Ladies' Comics",
    year: 1980,
    ly: 1988,
    cat: "shojo",
    desc: "少女マンガ読者の成長とともに誕生した大人の女性向けマンガ。恋愛・結婚・仕事をリアルに描き、後の『働きマン』的な女性マンガへ続く。",
  },
  {
    id: "shojo_horror",
    name: "少女ホラー",
    en: "Shojo Horror",
    year: 1986,
    ly: 1994,
    cat: "shojo",
    desc: "楳図かずお以来の少女誌×恐怖の伝統から、ホラー専門誌『ハロウィン』が誕生。伊藤潤二『富江』など世界的カルト人気を持つ作家を生んだ。",
  },
  {
    id: "battle_bishojo",
    name: "戦闘美少女",
    en: "Magical Girl Warriors",
    year: 1992,
    ly: 2000,
    cat: "shojo",
    desc: "『美少女戦士セーラームーン』が少女マンガにバトルヒーローの構造を接続。「戦う女の子」は以後、日本ポップカルチャーの中心イメージになった。",
  },

  // ===== 青年 =====
  {
    id: "gekiga",
    name: "劇画",
    en: "Gekiga",
    year: 1957,
    cat: "seinen",
    desc: "辰巳ヨシヒロら「劇画工房」が、手塚的な丸い子どもマンガへの対抗として宣言。リアルな絵と大人の題材で、マンガの読者年齢を引き上げた。",
  },
  {
    id: "seinen_mag",
    name: "青年マンガ誌",
    en: "Seinen Magazines",
    year: 1967,
    cat: "seinen",
    desc: "『ヤングコミック』『ビッグコミック』が創刊され、劇画の受け皿に。『ゴルゴ13』はギネス級の長寿連載として今も続く。",
  },
  {
    id: "gekiga_jidai",
    name: "歴史・時代劇画",
    en: "Historical Gekiga",
    year: 1970,
    ly: 1973,
    cat: "seinen",
    desc: "『子連れ狼』、平田弘史の武士道もの。時代劇と劇画の融合は海外にも輸出され、『Lone Wolf and Cub』はアメコミ作家に多大な影響を与えた。",
  },
  {
    id: "seinen_sf",
    name: "SF・サイバーパンク",
    en: "SF & Cyberpunk",
    year: 1982,
    cat: "seinen",
    desc: "大友克洋『AKIRA』、士郎正宗『攻殻機動隊』。緻密な作画と都市の終末感で、日本マンガを「MANGA」として世界に知らしめた。",
  },
  {
    id: "gourmet",
    name: "グルメマンガ",
    en: "Gourmet Manga",
    year: 1983,
    ly: 1987,
    cat: "seinen",
    desc: "『美味しんぼ』が食をドラマにする方法を発明。『クッキングパパ』から『孤独のグルメ』まで、日本独自の一大ジャンルに成長した。",
  },
  {
    id: "business",
    name: "ビジネス・情報マンガ",
    en: "Business Manga",
    year: 1983,
    ly: 1992,
    cat: "seinen",
    desc: "『課長島耕作』『ナニワ金融道』。サラリーマン社会や金融の裏側など、「マンガで社会を学ぶ」路線を確立した。",
  },
  {
    id: "gamble",
    name: "ギャンブル・アウトロー",
    en: "Gambling & Outlaw",
    year: 1991,
    ly: 1997,
    cat: "seinen",
    desc: "福本伸行『アカギ』『カイジ』。劇画の絵柄を引き継ぎ、極限の心理戦を「ざわ…ざわ…」の緊張感で描く独自ジャンル。",
  },
  {
    id: "shakai",
    name: "社会派・ヒューマンドラマ",
    en: "Social Drama",
    year: 1990,
    ly: 2003,
    cat: "seinen",
    desc: "『沈黙の艦隊』『ブラックジャックによろしく』『健康で文化的な最低限度の生活』。報道やルポの機能をマンガが担う系譜。",
  },

  // ===== ギャグ・コメディ =====
  {
    id: "akatsuka",
    name: "赤塚ギャグ",
    en: "Akatsuka Gag",
    year: 1962,
    cat: "gag",
    desc: "『おそ松くん』『天才バカボン』。赤塚不二夫がキャラクター中心のギャグマンガを体系化。「これでいいのだ」はギャグの独立宣言だった。",
  },
  {
    id: "nonsense",
    name: "ナンセンス・パロディ",
    en: "Nonsense & Parody",
    year: 1970,
    ly: 1972,
    cat: "gag",
    desc: "『がきデカ』『マカロニほうれん荘』。70年代チャンピオン誌上でギャグは加速し、意味からの解放とハイテンションの時代へ。",
  },
  {
    id: "yonkoma",
    name: "4コマまんが",
    en: "Yonkoma",
    year: 1980,
    cat: "gag",
    desc: "新聞4コマ(『サザエさん』『コボちゃん』)の伝統から、4コマ専門誌『まんがタイム』系が成立。起承転結の型は日常系の土壌になった。",
  },
  {
    id: "fujori",
    name: "不条理ギャグ",
    en: "Absurdist Gag",
    year: 1988,
    cat: "gag",
    desc: "吉田戦車『伝染るんです。』が4コマの起承転結を解体。「シュール」という言葉を定着させ、90年代のサブカル感覚を象徴した。",
  },
  {
    id: "moe_yonkoma",
    name: "萌え4コマ・日常系",
    en: "Slice-of-Life Yonkoma",
    year: 2002,
    cat: "gag",
    desc: "『あずまんが大王』が発明した「かわいい女の子たちの何気ない日常」。『けいおん!』『ゆるキャン△』へ続く、事件が起きないことの豊かさ。",
  },

  // ===== オルタナティブ =====
  {
    id: "garo",
    name: "ガロ系",
    en: "Garo",
    year: 1964,
    cat: "alt",
    desc: "白土三平『カムイ伝』のために創刊された伝説の雑誌『ガロ』。つげ義春『ねじ式』など、商業性から自由な実験表現の聖地となった。",
  },
  {
    id: "com",
    name: "COM",
    en: "COM",
    year: 1967,
    ly: 1969,
    cat: "alt",
    desc: "ガロに対抗して手塚治虫が創刊した『COM』。「まんがエリートのためのまんが専門誌」を掲げ、『火の鳥』を連載。マンガ批評の母体にもなった。",
  },
  {
    id: "newwave",
    name: "ニューウェーブ",
    en: "New Wave",
    year: 1979,
    cat: "alt",
    desc: "大友克洋の登場が象徴する画期。劇画でも手塚でもない乾いた線と映画的空間が、80年代のマンガ表現を根本から更新した。",
  },
  {
    id: "subculture",
    name: "サブカル系",
    en: "Subculture",
    year: 1993,
    cat: "alt",
    desc: "『ガロ』の遺伝子を継ぐ『AX』や、ねこぢる、丸尾末広ら。90年代サブカルチャーの中でカルト的な支持を獲得した。",
  },
  {
    id: "essay",
    name: "コミックエッセイ",
    en: "Comic Essay",
    year: 2002,
    ly: 2004,
    cat: "alt",
    desc: "『ダーリンは外国人』が開いた、実体験をゆるい絵で語るジャンル。育児・闘病・仕事など、マンガがノンフィクションの器になった。",
  },

  // ===== デジタル・新潮流 =====
  {
    id: "webcomic",
    name: "Webコミック",
    en: "Web Comics",
    year: 2005,
    ly: 2008,
    cat: "digital",
    desc: "個人サイト発のONE『ワンパンマン』が象徴。出版社を介さない発表の場が才能の入口となり、『裏サンデー』など公式Web誌も続いた。",
  },
  {
    id: "webtoon",
    name: "縦スクロール・ウェブトゥーン",
    en: "Webtoon",
    year: 2014,
    cat: "digital",
    desc: "韓国発、スマホ最適化されたフルカラー縦読みマンガ。ピッコマ・LINEマンガを通じて日本市場でも急成長し、コマ割り文化と競争と融合が進む。",
  },
  {
    id: "sns",
    name: "SNSマンガ",
    en: "SNS Manga",
    year: 2016,
    ly: 2019,
    cat: "digital",
    desc: "Twitter(X)発『100日後に死ぬワニ』が社会現象に。バズを前提とした1〜4ページの短編形式と、作家と読者の距離の近さが特徴。",
  },
];

export const EDGES: GenreEdge[] = [
  // 源流の中の流れ
  // 前史からの流れ(直系の進化ではなく、あくまで影響)
  { from: "emaki", to: "edo_giga", kind: "influence" },
  { from: "edo_giga", to: "ponchi", kind: "influence" },
  { from: "ponchi", to: "newspaper", kind: "evolution" },
  { from: "newspaper", to: "kodomo", kind: "evolution" },
  { from: "kodomo", to: "akahon", kind: "evolution" },
  { from: "akahon", to: "story", kind: "evolution" },
  { from: "kamishibai", to: "kashihon", kind: "evolution" },
  { from: "akahon", to: "kashihon", kind: "influence" },
  // 手塚から各方面へ
  { from: "story", to: "gekkan", kind: "evolution" },
  { from: "story", to: "shojo_dawn", kind: "evolution" },
  { from: "story", to: "com", kind: "evolution" },
  { from: "story", to: "gekiga", kind: "counter" },
  // 貸本から
  { from: "kashihon", to: "gekiga", kind: "evolution" },
  { from: "kashihon", to: "kashihon_shojo", kind: "evolution" },
  { from: "kashihon", to: "garo", kind: "evolution" },
  { from: "kashihon", to: "yokai", kind: "influence" },
  { from: "kamishibai", to: "yokai", kind: "influence" },
  // 少年誌の系譜
  { from: "gekkan", to: "weekly", kind: "evolution" },
  { from: "gekiga", to: "weekly", kind: "influence" },
  { from: "weekly", to: "spokon", kind: "evolution" },
  { from: "gekiga", to: "spokon", kind: "influence" },
  { from: "spokon", to: "jump_battle", kind: "evolution" },
  { from: "weekly", to: "lovecome", kind: "evolution" },
  { from: "shojo_romance", to: "lovecome", kind: "influence" },
  { from: "jump_battle", to: "shonen_mystery", kind: "influence" },
  { from: "jump_battle", to: "dark_fantasy", kind: "evolution" },
  { from: "seinen_sf", to: "dark_fantasy", kind: "influence" },
  { from: "yokai", to: "dark_fantasy", kind: "influence" },
  { from: "webcomic", to: "isekai", kind: "evolution" },
  // 少女の系譜
  { from: "shojo_dawn", to: "kashihon_shojo", kind: "evolution" },
  { from: "kashihon_shojo", to: "year24", kind: "evolution" },
  { from: "kashihon_shojo", to: "shojo_romance", kind: "evolution" },
  { from: "year24", to: "bl", kind: "evolution" },
  { from: "year24", to: "ladies", kind: "influence" },
  { from: "shojo_romance", to: "ladies", kind: "evolution" },
  { from: "kashihon", to: "shojo_horror", kind: "influence" },
  { from: "shojo_romance", to: "battle_bishojo", kind: "evolution" },
  { from: "jump_battle", to: "battle_bishojo", kind: "influence" },
  // 青年の系譜
  { from: "gekiga", to: "seinen_mag", kind: "evolution" },
  { from: "weekly", to: "seinen_mag", kind: "influence" },
  { from: "gekiga", to: "gekiga_jidai", kind: "evolution" },
  { from: "newwave", to: "seinen_sf", kind: "evolution" },
  { from: "seinen_mag", to: "gourmet", kind: "evolution" },
  { from: "seinen_mag", to: "business", kind: "evolution" },
  { from: "gekiga", to: "gamble", kind: "influence" },
  { from: "seinen_mag", to: "shakai", kind: "evolution" },
  // ギャグの系譜
  { from: "gekkan", to: "akatsuka", kind: "evolution" },
  { from: "akatsuka", to: "nonsense", kind: "evolution" },
  { from: "newspaper", to: "yonkoma", kind: "influence" },
  { from: "nonsense", to: "fujori", kind: "evolution" },
  { from: "yonkoma", to: "fujori", kind: "influence" },
  { from: "yonkoma", to: "moe_yonkoma", kind: "evolution" },
  { from: "fujori", to: "moe_yonkoma", kind: "influence" },
  // オルタナの系譜
  { from: "garo", to: "newwave", kind: "influence" },
  { from: "com", to: "newwave", kind: "influence" },
  { from: "garo", to: "subculture", kind: "evolution" },
  { from: "subculture", to: "essay", kind: "influence" },
  { from: "ladies", to: "essay", kind: "influence" },
  // デジタルの系譜
  { from: "essay", to: "sns", kind: "influence" },
  { from: "webcomic", to: "sns", kind: "evolution" },
  { from: "webcomic", to: "webtoon", kind: "influence" },
];

export const WORKS: Work[] = [
  // ===== 前史(近代マンガ以前のルーツ) =====
  { id: "chojugiga", title: "鳥獣人物戯画", author: "伝 鳥羽僧正覚猷ほか", year: 1150, magazine: "高山寺蔵(国宝)", genres: ["emaki"], desc: "兎や蛙が相撲をとり水遊びに興じる、墨線だけで描かれた全4巻の絵巻。躍動する線と誇張された動物の演技は「日本最古のマンガ」とも称される。実際には複数の絵師による作で、コマもセリフも持たないが、絵だけで物語と笑いを生む到達点。" },
  { id: "hokusai", title: "北斎漫画", author: "葛飾北斎", year: 1814, magazine: "版本(全15編)", genres: ["edo_giga"], desc: "北斎が門人の絵手本として刊行した約4000点の素描集。人物・動植物・妖怪から市井の人々の何気ない仕草までを活写し、「漫画」という語を世に広めた。物語やコマは無く現在のマンガとは別物だが、庶民が絵を楽しむ文化の象徴。" },

  { id: "norakuro", title: "のらくろ", author: "田河水泡", year: 1931, magazine: "少年倶楽部", genres: ["kodomo"], desc: "野良犬の黒吉が軍隊で出世していく物語。戦前最大のヒット作で、キャラクターグッズ展開の元祖でもある。" },
  { id: "shintakarajima", title: "新宝島", author: "手塚治虫・酒井七馬", year: 1947, magazine: "育英出版(赤本)", genres: ["story", "akahon"], desc: "映画のようなスピード感あるコマ運びで戦後の少年たちに衝撃を与え、ストーリーマンガ時代の幕を開けた記念碑的作品。" },
  { id: "tetsuwan", title: "鉄腕アトム", author: "手塚治虫", year: 1952, magazine: "少年", genres: ["gekkan"], desc: "ロボットと人間の共存を描いたSFの金字塔。1963年には国産初の連続TVアニメとなり、メディアミックスの原点に。" },
  { id: "ribon_kishi", title: "リボンの騎士", author: "手塚治虫", year: 1953, magazine: "少女クラブ", genres: ["shojo_dawn"], desc: "男装の王女サファイアの冒険。少女向けストーリーマンガの原型を作り、宝塚的な世界観が後の少女マンガに流れ込んだ。" },
  { id: "kamui", title: "カムイ伝", author: "白土三平", year: 1964, magazine: "ガロ", genres: ["garo", "gekiga"], desc: "江戸時代の身分制度を描く大河劇画。本作連載のために雑誌『ガロ』が創刊された。学生運動世代のバイブル。" },
  { id: "gegege", title: "ゲゲゲの鬼太郎", author: "水木しげる", year: 1965, magazine: "週刊少年マガジン", genres: ["yokai"], desc: "紙芝居『墓場鬼太郎』を原型とする妖怪マンガの金字塔。日本人の妖怪イメージの多くは本作が作った。" },
  { id: "kyojin", title: "巨人の星", author: "梶原一騎・川崎のぼる", year: 1966, magazine: "週刊少年マガジン", genres: ["spokon"], desc: "父子の宿命と魔球に全てを賭ける野球マンガ。「スポ根」というジャンルそのものを定義した作品。" },
  { id: "ashita", title: "あしたのジョー", author: "高森朝雄・ちばてつや", year: 1968, magazine: "週刊少年マガジン", genres: ["spokon", "gekiga"], desc: "ドヤ街の少年・矢吹丈が燃え尽きるまでを描くボクシング劇画。力石徹の死には現実の葬儀が行われた。" },
  { id: "neji", title: "ねじ式", author: "つげ義春", year: 1968, magazine: "ガロ", genres: ["garo"], desc: "夢の論理で進む23ページの短編。マンガが芸術批評の対象になる契機となった、オルタナティブマンガの最高峰。" },
  { id: "golgo", title: "ゴルゴ13", author: "さいとう・たかを", year: 1968, magazine: "ビッグコミック", genres: ["seinen_mag", "gekiga"], desc: "超一流スナイパー、デューク東郷の活躍を描く。単一マンガ最多巻数のギネス記録を持つ、劇画の到達点。" },
  { id: "devilman", title: "デビルマン", author: "永井豪", year: 1972, magazine: "週刊少年マガジン", genres: ["weekly", "yokai"], desc: "人間の悪意を黙示録的スケールで描き、少年マンガの倫理的限界を拡張した問題作。後のダークファンタジーの祖。" },
  { id: "poe", title: "ポーの一族", author: "萩尾望都", year: 1972, magazine: "別冊少女コミック", genres: ["year24"], desc: "永遠の時を生きるバンパネラの少年エドガー。時間と孤独を描く連作で、少女マンガの文学的到達点とされる。" },
  { id: "berubara", title: "ベルサイユのばら", author: "池田理代子", year: 1972, magazine: "週刊マーガレット", genres: ["shojo_romance"], desc: "フランス革命を舞台に男装の麗人オスカルの生涯を描く。社会現象となり、宝塚歌劇の代表演目にもなった。" },
  { id: "blackjack", title: "ブラック・ジャック", author: "手塚治虫", year: 1973, magazine: "週刊少年チャンピオン", genres: ["weekly"], desc: "無免許の天才外科医が命の価値を問う医療マンガの原点。手塚治虫後期の代表作。" },
  { id: "kaze_ki", title: "風と木の詩", author: "竹宮惠子", year: 1976, magazine: "週刊少女コミック", genres: ["year24", "bl"], desc: "19世紀フランスの寄宿学校を舞台にした少年同士の愛の物語。9年の構想を経て連載され、BLの源流となった。" },
  { id: "garasu", title: "ガラスの仮面", author: "美内すずえ", year: 1976, magazine: "花とゆめ", genres: ["shojo_romance"], desc: "天才女優・北島マヤの成長を描く演劇マンガの金字塔。「白目」「紅天女」など数々の伝説を生んだ長期連載。" },
  { id: "urusei", title: "うる星やつら", author: "高橋留美子", year: 1978, magazine: "週刊少年サンデー", genres: ["lovecome"], desc: "宇宙人ラムと浮気者あたるのドタバタラブコメ。SF・ギャグ・恋愛を混ぜる高橋留美子の手法は後続に絶大な影響。" },
  { id: "touch", title: "タッチ", author: "あだち充", year: 1981, magazine: "週刊少年サンデー", genres: ["lovecome", "spokon"], desc: "双子の兄弟と幼なじみ・南。スポ根の熱をモノローグと余白の演出に置き換えた、80年代サンデーの象徴。" },
  { id: "akira", title: "AKIRA", author: "大友克洋", year: 1982, magazine: "ヤングマガジン", genres: ["seinen_sf", "newwave"], desc: "超能力と崩壊後の東京を圧倒的な画力で描き、「MANGA」を世界語にしたサイバーパンクの金字塔。" },
  { id: "nausicaa", title: "風の谷のナウシカ", author: "宮崎駿", year: 1982, magazine: "アニメージュ", genres: ["seinen_sf"], desc: "巨大産業文明の崩壊から1000年、腐海と蟲に脅かされる遠未来。アニメ版のさらに先を描く全7巻は、善悪では割り切れない生命と文明への問いに満ちた叙事詩。" },
  { id: "hokuto", title: "北斗の拳", author: "武論尊・原哲夫", year: 1983, magazine: "週刊少年ジャンプ", genres: ["jump_battle"], desc: "世紀末の荒野で一子相伝の暗殺拳を継ぐケンシロウ。劇画的肉体表現とジャンプバトルの融合。" },
  { id: "oishinbo", title: "美味しんぼ", author: "雁屋哲・花咲アキラ", year: 1983, magazine: "ビッグコミックスピリッツ", genres: ["gourmet"], desc: "究極vs至高のメニュー対決。食に蘊蓄とドラマを持ち込み、グルメマンガというジャンルを確立した。" },
  { id: "shima", title: "課長島耕作", author: "弘兼憲史", year: 1983, magazine: "モーニング", genres: ["business"], desc: "大手電機メーカーを舞台に出世街道を描くサラリーマンマンガの代名詞。社長・会長を経て今も現役。" },
  { id: "dragonball", title: "ドラゴンボール", author: "鳥山明", year: 1984, magazine: "週刊少年ジャンプ", genres: ["jump_battle"], desc: "7つの玉を巡る冒険からバトルの頂点へ。世界中の少年マンガ・アメコミ・ゲームに影響を与えた20世紀最大級のポップアイコン。" },
  { id: "tomie", title: "富江", author: "伊藤潤二", year: 1987, magazine: "月刊ハロウィン", genres: ["shojo_horror"], desc: "殺されても増殖する美少女・富江。少女ホラー誌から生まれ、世界にカルト的ファンを持つホラーマンガの代表作。" },
  { id: "slam", title: "SLAM DUNK", author: "井上雄彦", year: 1990, magazine: "週刊少年ジャンプ", genres: ["jump_battle", "spokon"], desc: "不良少年・桜木花道がバスケに目覚める。スポ根の遺伝子をリアリズムで更新し、日本にバスケブームを起こした。" },
  { id: "sailor", title: "美少女戦士セーラームーン", author: "武内直子", year: 1992, magazine: "なかよし", genres: ["battle_bishojo"], desc: "「月に代わっておしおきよ!」変身ヒロインチームの原型を作り、世界中の少女文化を塗り替えた戦闘美少女の金字塔。" },
  { id: "kaiji", title: "賭博黙示録カイジ", author: "福本伸行", year: 1996, magazine: "週刊ヤングマガジン", genres: ["gamble"], desc: "限定ジャンケン、鉄骨渡り。借金地獄の青年が命がけのギャンブルに挑む極限心理戦の代名詞。" },
  { id: "onepiece", title: "ONE PIECE", author: "尾田栄一郎", year: 1997, magazine: "週刊少年ジャンプ", genres: ["jump_battle"], desc: "海賊王を目指すルフィの大冒険。コミックス発行部数世界一のギネス記録を持つ、ジャンプ王道の現在形。" },
  { id: "azumanga", title: "あずまんが大王", author: "あずまきよひこ", year: 1999, magazine: "月刊コミック電撃大王", genres: ["moe_yonkoma"], desc: "女子高生たちの他愛ない日常を4コマで。「日常系」「空気系」という新ジャンルの出発点となった。" },
  { id: "darling", title: "ダーリンは外国人", author: "小栗左多里", year: 2002, magazine: "単行本描き下ろし", genres: ["essay"], desc: "外国人の夫トニーとの日常を描き100万部超のヒット。コミックエッセイブームの火付け役。" },
  { id: "deathnote", title: "DEATH NOTE", author: "大場つぐみ・小畑健", year: 2003, magazine: "週刊少年ジャンプ", genres: ["shonen_mystery"], desc: "名前を書くと人が死ぬノートを拾った天才・夜神月とLの頭脳戦。バトルなき緊張感で少年マンガの新境地を開いた。" },
  { id: "shingeki", title: "進撃の巨人", author: "諫山創", year: 2009, magazine: "別冊少年マガジン", genres: ["dark_fantasy"], desc: "壁の中の人類と巨人の絶望的な戦い。伏線と構造の物語で2010年代マンガの風景を一変させた。" },
  { id: "onepunch", title: "ワンパンマン", author: "ONE", year: 2009, magazine: "個人サイト", genres: ["webcomic"], desc: "どんな敵も一撃で倒せてしまうヒーローの悩み。個人サイト連載から社会現象へ、Web発マンガの象徴。" },
  { id: "tensura", title: "転生したらスライムだった件", author: "川上泰樹・伏瀬", year: 2015, magazine: "月刊少年シリウス", genres: ["isekai"], desc: "通り魔に刺された会社員がスライムに転生。なろう系コミカライズの最大ヒット作。" },
  { id: "kimetsu", title: "鬼滅の刃", author: "吾峠呼世晴", year: 2016, magazine: "週刊少年ジャンプ", genres: ["dark_fantasy", "yokai"], desc: "家族を鬼に殺された炭治郎の物語。大正・和風・怪異の意匠とアニメ化の相乗効果で歴史的ブームに。" },
  { id: "chainsaw", title: "チェンソーマン", author: "藤本タツキ", year: 2018, magazine: "週刊少年ジャンプ", genres: ["dark_fantasy"], desc: "チェンソーの悪魔と一体化した少年デンジ。映画的引用とアンモラルな疾走感で「ジャンプの限界」を更新し続ける。" },
  { id: "sololeveling", title: "俺だけレベルアップな件", author: "Chugong・DUBU", year: 2018, magazine: "ピッコマ", genres: ["webtoon"], desc: "最弱ハンターが独りレベルアップしていく韓国発ウェブトゥーン。縦読みフルカラーの日本市場開拓を象徴する大ヒット。" },
  { id: "wani", title: "100日後に死ぬワニ", author: "きくちゆうき", year: 2019, magazine: "Twitter(X)", genres: ["sns"], desc: "死まであと100日のカウントダウンを毎日1本ずつ投稿。SNSという発表形式自体が物語装置になった実験。" },
  { id: "chie", title: "じゃりン子チエ", author: "はるき悦巳", year: 1978, magazine: "漫画アクション", genres: ["seinen_mag"], desc: "大阪の下町でホルモン屋を切り盛りする小学生チエ。関西弁の人情喜劇として青年誌で異彩を放った傑作。" },
  { id: "tondesaitama", title: "翔んで埼玉", author: "魔夜峰央", year: 1982, magazine: "花とゆめ", genres: ["nonsense"], desc: "「埼玉県民にはそこらへんの草でも食わせておけ!」愛のある郷土ディスで30年後に映画化され再ブレイクした伝説のギャグ。" },
  { id: "cookingpapa", title: "クッキングパパ", author: "うえやまとち", year: 1985, magazine: "モーニング", genres: ["gourmet"], desc: "博多の商社に勤める料理上手なパパ・荒岩一味。実用レシピ付きで愛され続ける長寿グルメマンガ。" },
  { id: "chibimaruko", title: "ちびまる子ちゃん", author: "さくらももこ", year: 1986, magazine: "りぼん", genres: ["essay"], desc: "昭和49年の静岡・清水を舞台にした作者の少女時代。エッセイマンガの感覚を少女誌に持ち込んだ国民的作品。" },
  { id: "conan", title: "名探偵コナン", author: "青山剛昌", year: 1994, magazine: "週刊少年サンデー", genres: ["shonen_mystery"], desc: "体が縮んだ高校生探偵・工藤新一。頭脳戦マンガの裾野を国民レベルに広げた長期連載ミステリー。" },
  { id: "rurouni", title: "るろうに剣心", author: "和月伸宏", year: 1994, magazine: "週刊少年ジャンプ", genres: ["jump_battle"], desc: "明治11年の東京。不殺を誓った元人斬り・緋村剣心。歴史設定×ジャンプバトルの金字塔。" },
  { id: "barakamon", title: "ばらかもん", author: "ヨシノサツキ", year: 2009, magazine: "ガンガンONLINE", genres: ["webcomic"], desc: "都会での挫折を機に五島列島へ移住した若き書道家と島民たちの日常。Web連載発のご当地ヒット作。" },
  { id: "ginsaji", title: "銀の匙 Silver Spoon", author: "荒川弘", year: 2011, magazine: "週刊少年サンデー", genres: ["weekly"], desc: "進学校から北海道の農業高校へ逃げてきた八軒くん。食と命に向き合う農業青春譚。少年誌の新しい「学園もの」を開拓した。" },

  // ===== 追加: 名作・ヒット作(源流〜昭和の古典) =====
  { id: "sazae", title: "サザエさん", author: "長谷川町子", year: 1946, magazine: "夕刊フクニチ→朝日新聞", genres: ["newspaper"], desc: "磯野家を中心とした日常を描く新聞4コマの金字塔。戦後日本の家庭像そのものとなり、国民的アニメへと続いた。" },
  { id: "tetsujin28", title: "鉄人28号", author: "横山光輝", year: 1956, magazine: "少年", genres: ["gekkan"], desc: "リモコンで操る巨大ロボットと少年・金田正太郎。鉄腕アトムと並ぶ巨大ロボットマンガの原点となった。" },
  { id: "osomatsu", title: "おそ松くん", author: "赤塚不二夫", year: 1962, magazine: "週刊少年サンデー", genres: ["akatsuka"], desc: "六つ子とイヤミ、チビ太らが暴れるギャグの古典。「シェー」は流行語となり、キャラクターギャグを確立した。" },
  { id: "hinotori", title: "火の鳥", author: "手塚治虫", year: 1967, magazine: "COM", genres: ["com", "story"], desc: "生命と輪廻を壮大なスケールで描く手塚治虫のライフワーク。過去編と未来編が交互に進む構成で「マンガの神様」の思想が凝縮されている。" },
  { id: "doraemon", title: "ドラえもん", author: "藤子・F・不二雄", year: 1969, magazine: "小学館の学年誌", genres: ["gekkan"], desc: "未来から来た猫型ロボットと、のび太のひみつ道具をめぐる物語。国民的キャラクターとして世界中で愛される児童マンガの最高峰。" },
  { id: "ginga999", title: "銀河鉄道999", author: "松本零士", year: 1977, magazine: "週刊少年キング", genres: ["seinen_sf"], desc: "機械の体を求めて銀河を旅する鉄郎とメーテル。一話ごとの叙情的なSFで、70年代アニメブームの象徴となった。" },
  { id: "kochikame", title: "こちら葛飾区亀有公園前派出所", author: "秋本治", year: 1976, magazine: "週刊少年ジャンプ", genres: ["weekly", "nonsense"], desc: "破天荒な下町の警官・両津勘吉のドタバタ。40年・全200巻の連載を完走した、ギネス記録を持つ長寿ギャグマンガ。" },

  // ===== 追加: ジャンプ黄金期〜現在の少年バトル =====
  { id: "drslump", title: "Dr.スランプ", author: "鳥山明", year: 1980, magazine: "週刊少年ジャンプ", genres: ["nonsense"], desc: "発明博士とロボット少女アラレの底抜けに明るいギャグ。鳥山明の画力とセンスが80年代ジャンプの土台を築いた。" },
  { id: "kinnikuman", title: "キン肉マン", author: "ゆでたまご", year: 1979, magazine: "週刊少年ジャンプ", genres: ["jump_battle", "nonsense"], desc: "落ちこぼれ超人キン肉マンの成長を描くギャグ&プロレスバトル。個性的な超人たちと消しゴム人形は社会現象となった。" },
  { id: "captsubasa", title: "キャプテン翼", author: "高橋陽一", year: 1981, magazine: "週刊少年ジャンプ", genres: ["spokon"], desc: "「ボールはともだち」大空翼のサッカー物語。世界のトッププロにも影響を与え、日本のサッカー人気を牽引した金字塔。" },
  { id: "seiya", title: "聖闘士星矢", author: "車田正美", year: 1985, magazine: "週刊少年ジャンプ", genres: ["jump_battle"], desc: "聖衣をまとった少年たちが女神アテナのために戦う。ギリシャ神話と星座を題材にした様式美で、キャラクター商品も大ヒット。" },
  { id: "jojo1", title: "ジョジョ第1部 ファントムブラッド", author: "荒木飛呂彦", year: 1987, magazine: "週刊少年ジャンプ", genres: ["jump_battle"], desc: "19世紀イギリス。ジョナサン・ジョースターと、彼のすべてを奪おうとする宿敵ディオの因縁の始まり。石仮面と波紋が織りなす、ジョースター家の宿命の序章。" },
  { id: "jojo2", title: "ジョジョ第2部 戦闘潮流", author: "荒木飛呂彦", year: 1987, magazine: "週刊少年ジャンプ", genres: ["jump_battle"], desc: "第二次大戦前夜。奔放な二代目ジョセフが、人類を超えた「柱の男」たちに波紋で挑む。緊張と笑いが同居する、シリーズ人気を決定づけた一編。" },
  { id: "jojo3", title: "ジョジョ第3部 スターダストクルセイダース", author: "荒木飛呂彦", year: 1989, magazine: "週刊少年ジャンプ", genres: ["jump_battle"], desc: "日本からエジプトへ、蘇ったDIOを討つ旅。「スタンド」という能力バトルを発明し、以後の少年マンガの戦い方を一変させた金字塔。" },
  { id: "jojo4", title: "ジョジョ第4部 ダイヤモンドは砕けない", author: "荒木飛呂彦", year: 1992, magazine: "週刊少年ジャンプ", genres: ["jump_battle"], desc: "架空の町・杜王町の日常に潜む連続殺人鬼・吉良吉影。スタンドバトルを「街の日常ミステリ」に落とし込んだ、多くのファンが偏愛する一編。" },
  { id: "jojo5", title: "ジョジョ第5部 黄金の風", author: "荒木飛呂彦", year: 1995, magazine: "週刊少年ジャンプ", genres: ["jump_battle"], desc: "イタリア。ギャング組織の頂点を目指すジョルノと仲間たちの成り上がり。時を操るスタンド「ゴールド・エクスペリエンス・レクイエム」で結実する運命の物語。" },
  { id: "jojo6", title: "ジョジョ第6部 ストーンオーシャン", author: "荒木飛呂彦", year: 2000, magazine: "週刊少年ジャンプ", genres: ["jump_battle"], desc: "フロリダの刑務所。冤罪で囚われた徐倫が、DIOの因縁の果てへ。第1〜6部の宿命を一度閉じる、シリーズ第一部完結編。" },
  { id: "jojo7", title: "ジョジョ第7部 スティール・ボール・ラン", author: "荒木飛呂彦", year: 2004, magazine: "ウルトラジャンプ", genres: ["seinen_mag", "gekiga_jidai"], desc: "1890年アメリカ、大陸横断レース。遺体のパーツを巡る競争を通じ、世界観を仕切り直した新生ジョジョ。荒木の画力と構成が円熟した最高傑作との呼び声も高い。" },
  { id: "jojo8", title: "ジョジョ第8部 ジョジョリオン", author: "荒木飛呂彦", year: 2011, magazine: "ウルトラジャンプ", genres: ["seinen_mag"], desc: "震災後の杜王町。記憶を失った男「定助」の正体を巡るミステリ。「呪い」を解くための、もうひとつの杜王町の物語。" },
  { id: "jojo9", title: "ジョジョ第9部 The JOJOLands", author: "荒木飛呂彦", year: 2023, magazine: "ウルトラジャンプ", genres: ["seinen_mag"], desc: "現代のハワイ。「大金持ちになる」ことを願う少年ジョディオの奇妙な冒険。連載中の最新部。" },
  { id: "cityhunter", title: "シティーハンター", author: "北条司", year: 1985, magazine: "週刊少年ジャンプ", genres: ["weekly", "gekiga"], desc: "新宿の凄腕スイーパー・冴羽獠のハードボイルド&コメディ。大人の色気とギャグの緩急で青年層まで取り込んだ。" },
  { id: "yuyu", title: "幽☆遊☆白書", author: "冨樫義博", year: 1990, magazine: "週刊少年ジャンプ", genres: ["jump_battle"], desc: "不良少年・浦飯幽助が霊界探偵となり戦う。霊力バトルと魅力的な敵キャラで90年代前半ジャンプを支えた。" },
  { id: "yugioh", title: "遊☆戯☆王", author: "高橋和希", year: 1996, magazine: "週刊少年ジャンプ", genres: ["jump_battle"], desc: "闇のゲームとカードデュエルを描く。作中のカードゲームが現実で世界的商品となった、メディアミックスの金字塔。" },
  { id: "hikaru", title: "ヒカルの碁", author: "ほったゆみ・小畑健", year: 1998, magazine: "週刊少年ジャンプ", genres: ["spokon"], desc: "少年ヒカルと平安の霊・佐為が挑む囲碁の世界。地味な題材を白熱の対局に変え、子どもの囲碁ブームを起こした。" },
  { id: "naruto", title: "NARUTO -ナルト-", author: "岸本斉史", year: 1999, magazine: "週刊少年ジャンプ", genres: ["jump_battle"], desc: "落ちこぼれ忍者ナルトが仲間と絆で成長する。忍術バトルと「認められたい」というテーマで世界的ヒットとなった。" },
  { id: "prince_tennis", title: "テニスの王子様", author: "許斐剛", year: 1999, magazine: "週刊少年ジャンプ", genres: ["spokon"], desc: "天才少年・越前リョーマの中学テニス。必殺技インフレとキャラ人気でスポーツマンガに新たな読者層を開いた。" },
  { id: "bleach", title: "BLEACH", author: "久保帯人", year: 2001, magazine: "週刊少年ジャンプ", genres: ["jump_battle", "dark_fantasy"], desc: "死神の力を得た黒崎一護の戦い。洗練された画面構成とキャラデザインで2000年代ジャンプの看板を担った。" },
  { id: "eyeshield", title: "アイシールド21", author: "稲垣理一郎・村田雄介", year: 2002, magazine: "週刊少年ジャンプ", genres: ["spokon"], desc: "俊足の小早川瀬那が挑むアメフト。マイナー競技を圧倒的な画力と戦略で描き切った異色のスポーツマンガ。" },
  { id: "gintama", title: "銀魂", author: "空知英秋", year: 2004, magazine: "週刊少年ジャンプ", genres: ["jump_battle", "nonsense"], desc: "天人が来訪した江戸を舞台にした万事屋・坂田銀時の物語。下ネタ全開のギャグと熱いシリアスの落差で熱狂的支持を得た。" },
  { id: "kurobas", title: "黒子のバスケ", author: "藤巻忠俊", year: 2008, magazine: "週刊少年ジャンプ", genres: ["spokon"], desc: "影の6人目・黒子とキセキの世代のバスケ。能力バトル的な演出でスポーツマンガに新風を吹き込んだ。" },
  { id: "haikyu", title: "ハイキュー!!", author: "古舘春一", year: 2012, magazine: "週刊少年ジャンプ", genres: ["spokon"], desc: "小柄な日向翔陽が挑む高校バレー。緻密な試合描写とチーム群像で、2010年代スポーツマンガの代表作となった。" },
  { id: "hero_aca", title: "僕のヒーローアカデミア", author: "堀越耕平", year: 2014, magazine: "週刊少年ジャンプ", genres: ["jump_battle"], desc: "誰もが個性(能力)を持つ世界で、無個性の緑谷出久が最高のヒーローを目指す。アメコミ的世界観で世界的人気を獲得した。" },
  { id: "promised", title: "約束のネバーランド", author: "白井カイウ・出水ぽすか", year: 2016, magazine: "週刊少年ジャンプ", genres: ["shonen_mystery", "dark_fantasy"], desc: "農園という名の孤児院に隠された真実に、子どもたちが知略で立ち向かう。頭脳戦とダークな世界観を融合させた話題作。" },
  { id: "drstone", title: "Dr.STONE", author: "稲垣理一郎・Boichi", year: 2017, magazine: "週刊少年ジャンプ", genres: ["jump_battle", "seinen_sf"], desc: "人類が石化した世界を科学の力で再建する千空の物語。「科学で無双」という新機軸で少年誌に知的興奮を持ち込んだ。" },
  { id: "jujutsu", title: "呪術廻戦", author: "芥見下々", year: 2018, magazine: "週刊少年ジャンプ", genres: ["dark_fantasy"], desc: "呪いを祓う呪術師たちの死闘。負の感情から生まれる呪霊という設定と現代的な演出で、令和のジャンプを代表するヒットに。" },
  { id: "spyfamily", title: "SPY×FAMILY", author: "遠藤達哉", year: 2019, magazine: "少年ジャンプ+", genres: ["webcomic", "nonsense"], desc: "スパイ・超能力者・殺し屋が「仮初めの家族」を演じるホームコメディ。Web連載発で全世代的な大ヒットとなった。" },
  { id: "fma", title: "鋼の錬金術師", author: "荒川弘", year: 2001, magazine: "月刊少年ガンガン", genres: ["dark_fantasy", "jump_battle"], desc: "錬金術で身体を失った兄弟の旅。等価交換のテーマと緻密な伏線回収で、月刊少年誌屈指の完成度を誇る名作。" },
  { id: "dai", title: "DRAGON QUEST ダイの大冒険", author: "三条陸・稲田浩司", year: 1989, magazine: "週刊少年ジャンプ", genres: ["jump_battle"], desc: "ゲーム『ドラゴンクエスト』の世界を舞台にした勇者ダイの冒険。王道ファンタジーバトルの完成形として今も愛される。" },

  // ===== 追加: サンデー・マガジンの名作 =====
  { id: "ranma", title: "らんま1/2", author: "高橋留美子", year: 1987, magazine: "週刊少年サンデー", genres: ["lovecome", "nonsense"], desc: "水をかぶると女になる少年・乱馬をめぐる格闘ラブコメ。高橋留美子の看板作として国内外で絶大な人気を得た。" },
  { id: "inuyasha", title: "犬夜叉", author: "高橋留美子", year: 1996, magazine: "週刊少年サンデー", genres: ["yokai", "lovecome"], desc: "戦国時代へ迷い込んだ現代の少女かごめと半妖・犬夜叉の冒険。妖怪と恋愛を融合した長編で90〜00年代を代表した。" },
  { id: "maison", title: "めぞん一刻", author: "高橋留美子", year: 1980, magazine: "ビッグコミックスピリッツ", genres: ["lovecome", "seinen_mag"], desc: "古アパートを舞台にした管理人・響子と浪人生・五代のじれったい恋。青年誌ラブコメの金字塔。" },
  { id: "ushiotora", title: "うしおととら", author: "藤田和日郎", year: 1990, magazine: "週刊少年サンデー", genres: ["yokai", "jump_battle"], desc: "少年・潮と妖怪・とらの凸凹コンビが大妖に挑む。熱い友情と迫力の作画で妖怪バトルの傑作とされる。" },
  { id: "major", title: "MAJOR", author: "満田拓也", year: 1994, magazine: "週刊少年サンデー", genres: ["spokon"], desc: "本田吾郎が幼少からメジャーリーグまで駆け上がる野球一代記。一人の選手の生涯を追う長期スポ根の代表作。" },
  { id: "kindaichi", title: "金田一少年の事件簿", author: "天樹征丸・さとうふみや", year: 1992, magazine: "週刊少年マガジン", genres: ["shonen_mystery"], desc: "名探偵の孫・一が難事件に挑む本格ミステリー。少年誌に密室殺人と論理パズルを持ち込みブームを起こした。" },
  { id: "gto", title: "GTO", author: "藤沢とおる", year: 1997, magazine: "週刊少年マガジン", genres: ["weekly"], desc: "元暴走族の型破り教師・鬼塚英吉が学級崩壊した教室を再生させる。痛快な学園ドラマとして幅広い世代に支持された。" },
  { id: "ippo", title: "はじめの一歩", author: "森川ジョージ", year: 1989, magazine: "週刊少年マガジン", genres: ["spokon"], desc: "いじめられっ子の幕之内一歩がボクシングで成長する。丁寧な試合描写と練習描写で長年愛される王道スポ根。" },
  { id: "fairytail", title: "FAIRY TAIL", author: "真島ヒロ", year: 2006, magazine: "週刊少年マガジン", genres: ["jump_battle"], desc: "魔導士ギルド「妖精の尻尾」の仲間たちの冒険。仲間の絆と魔法バトルの王道で世界的な人気を博した。" },
  { id: "tokyorev", title: "東京卍リベンジャーズ", author: "和久井健", year: 2017, magazine: "週刊少年マガジン", genres: ["weekly", "dark_fantasy"], desc: "タイムリープで過去に戻り、恋人と親友を救うため不良抗争に挑む。ヤンキー×タイムリープで社会現象的ヒットに。" },
  { id: "bluelock", title: "ブルーロック", author: "金城宗幸・ノ村優介", year: 2018, magazine: "週刊少年マガジン", genres: ["spokon"], desc: "「世界一のエゴイストFW」を育てる過激なサッカー育成プロジェクト。従来のチームスポ根を覆す価値観で新世代の支持を得た。" },
  { id: "frieren", title: "葬送のフリーレン", author: "山田鐘人・アベツカサ", year: 2020, magazine: "週刊少年サンデー", genres: ["dark_fantasy"], desc: "魔王を倒した後の世界を生きる長命のエルフ魔法使いフリーレン。死と時間、他者への理解を静かに描く「冒険の後」の物語。" },

  // ===== 追加: 青年誌の傑作 =====
  { id: "berserk", title: "ベルセルク", author: "三浦建太郎", year: 1989, magazine: "月刊アニマルハウス→ヤングアニマル", genres: ["dark_fantasy", "gekiga"], desc: "剣士ガッツの復讐と因果を描く暗黒中世ファンタジー。凄絶な描き込みと重厚な物語で、ダークファンタジーの頂点とされる。" },
  { id: "ghost", title: "攻殻機動隊", author: "士郎正宗", year: 1989, magazine: "ヤングマガジン海賊版", genres: ["seinen_sf"], desc: "電脳化社会の公安部隊・草薙素子の活躍。情報と身体、意識の境界を問うサイバーパンクの世界的名作。" },
  { id: "twentieth", title: "20世紀少年", author: "浦沢直樹", year: 1999, magazine: "ビッグコミックスピリッツ", genres: ["shakai", "seinen_sf"], desc: "子ども時代の空想の「よげんの書」が現実の陰謀とつながっていく。少年時代の郷愁と巨大な謎で読者を熱狂させた。" },
  { id: "monster", title: "MONSTER", author: "浦沢直樹", year: 1994, magazine: "ビッグコミックオリジナル", genres: ["shakai", "shonen_mystery"], desc: "天才外科医テンマが救った少年が連続殺人鬼に。ドイツを舞台にした重厚な人間ドラマとサスペンスの傑作。" },
  { id: "yawara", title: "YAWARA!", author: "浦沢直樹", year: 1986, magazine: "ビッグコミックスピリッツ", genres: ["spokon"], desc: "天才柔道少女・猪熊柔の日常と競技。バブル期の空気を軽やかに描いた青年誌スポーツ&ラブコメの名作。" },
  { id: "vagabond", title: "バガボンド", author: "井上雄彦", year: 1998, magazine: "モーニング", genres: ["gekiga_jidai", "gekiga"], desc: "吉川英治『宮本武蔵』を原作に、剣豪の生と強さの意味を描く。圧倒的な筆致で時代劇画を新たな高みへ引き上げた。" },
  { id: "kingdom", title: "キングダム", author: "原泰久", year: 2006, magazine: "週刊ヤングジャンプ", genres: ["gekiga_jidai"], desc: "古代中国・春秋戦国末期、下僕の少年・信が大将軍を目指す。壮大な戦記と群像劇で青年誌屈指の大ヒットとなった。" },
  { id: "vinland", title: "ヴィンランド・サガ", author: "幸村誠", year: 2005, magazine: "週刊少年マガジン→アフタヌーン", genres: ["gekiga_jidai"], desc: "11世紀の北欧、復讐に生きる青年トルフィンが「真の戦士」へと変わっていく。史実に基づくヴァイキング叙事詩。" },
  { id: "planetes", title: "プラネテス", author: "幸村誠", year: 1999, magazine: "モーニング", genres: ["seinen_sf"], desc: "宇宙のデブリ回収員たちを描く近未来SF。宇宙開発のリアルと人間の内面を静かに描いた叙情的傑作。" },
  { id: "uchukyodai", title: "宇宙兄弟", author: "小山宙哉", year: 2007, magazine: "モーニング", genres: ["seinen_sf", "shakai"], desc: "宇宙飛行士を目指す兄弟の物語。夢と挫折を大人のリアリティで描き、実際の宇宙開発ファンにも支持された。" },
  { id: "goldenkamuy", title: "ゴールデンカムイ", author: "野田サトル", year: 2014, magazine: "週刊ヤングジャンプ", genres: ["shakai", "gekiga_jidai"], desc: "明治末期の北海道、元兵士とアイヌの少女が金塊を追う。アイヌ文化・狩猟・グルメ・ギャグを詰め込んだ唯一無二の冒険譚。" },
  { id: "tokyoghoul", title: "東京喰種", author: "石田スイ", year: 2011, magazine: "週刊ヤングジャンプ", genres: ["dark_fantasy"], desc: "人を喰う種族「喰種」となった青年カネキの苦悩。人と怪物の狭間を耽美な絵で描き、ダークヒーローものとして人気を集めた。" },
  { id: "kaguya", title: "かぐや様は告らせたい", author: "赤坂アカ", year: 2015, magazine: "ミラクルジャンプ→週刊ヤングジャンプ", genres: ["lovecome"], desc: "秀才の生徒会長と副会長が「先に告白させたら負け」と頭脳戦を繰り広げる恋愛頭脳戦コメディ。令和ラブコメの代表作。" },
  { id: "sangatsu", title: "3月のライオン", author: "羽海野チカ", year: 2007, magazine: "ヤングアニマル", genres: ["seinen_mag", "spokon"], desc: "孤独な少年棋士・桐山零が将棋と人との関わりの中で再生していく。繊細な心理描写で将棋を人間ドラマに昇華した。" },
  { id: "ooku", title: "大奥", author: "よしながふみ", year: 2004, magazine: "MELODY", genres: ["ladies", "gekiga_jidai"], desc: "男女の役割が逆転した江戸幕府の「男子禁制ならぬ女将軍」という歴史改変。緻密な時代考証とジェンダー考察で高く評価された。" },
  { id: "kinou", title: "きのう何食べた?", author: "よしながふみ", year: 2007, magazine: "モーニング", genres: ["gourmet", "essay"], desc: "中年ゲイカップルの日常と食卓を淡々と描く。実用的なレシピと等身大の暮らしで幅広い読者に愛される。" },
  { id: "uzumaki", title: "うずまき", author: "伊藤潤二", year: 1998, magazine: "ビッグコミックスピリッツ", genres: ["shojo_horror"], desc: "「渦」に取り憑かれた町の怪異を描く伊藤潤二の代表作。理不尽で美しい恐怖のイメージで世界的カルト人気を持つ。" },
  { id: "dorohedoro", title: "ドロヘドロ", author: "林田球", year: 2000, magazine: "月刊サンデーGX", genres: ["dark_fantasy", "seinen_sf"], desc: "魔法使いと「ホール」の住人が交錯する混沌の世界。緻密で異形な世界観とブラックな笑いで熱狂的ファンを持つ。" },
  { id: "mob", title: "モブサイコ100", author: "ONE", year: 2012, magazine: "裏サンデー", genres: ["webcomic"], desc: "強大な超能力を持つ地味な少年モブの成長物語。『ワンパンマン』の作者ONEによるWeb発の人気作。" },

  // ===== 追加: 少女・女性マンガの名作 =====
  { id: "ace_nerae", title: "エースをねらえ!", author: "山本鈴美香", year: 1973, magazine: "週刊マーガレット", genres: ["shojo_romance", "spokon"], desc: "平凡な少女・岡ひろみが厳しい指導のもとテニスに打ち込む。スポ根と少女マンガを融合させ、後続に大きな影響を与えた。" },
  { id: "candy", title: "キャンディ・キャンディ", author: "いがらしゆみこ・水木杏子", year: 1975, magazine: "なかよし", genres: ["shojo_romance"], desc: "孤児の少女キャンディの波乱の半生を描く大河ロマン。70年代を代表する少女マンガとして絶大な人気を誇った。" },
  { id: "hanadan", title: "花より男子", author: "神尾葉子", year: 1992, magazine: "マーガレット", genres: ["shojo_romance"], desc: "庶民の少女つくしと御曹司集団「F4」のラブストーリー。少女マンガ歴代最多クラスの発行部数を記録した大ヒット作。" },
  { id: "nana", title: "NANA", author: "矢沢あい", year: 2000, magazine: "Cookie", genres: ["ladies", "shojo_romance"], desc: "同じ名前の二人の「ナナ」の恋と夢と友情。音楽と等身大の青春でカリスマ的支持を集めた女性マンガの代表作。" },
  { id: "fruits", title: "フルーツバスケット", author: "高屋奈月", year: 1998, magazine: "花とゆめ", genres: ["shojo_romance"], desc: "十二支の呪いを持つ草摩家と少女・透の交流。傷ついた心の再生を丁寧に描き、少女マンガ屈指の売上を記録した。" },
  { id: "ccs", title: "カードキャプターさくら", author: "CLAMP", year: 1996, magazine: "なかよし", genres: ["battle_bishojo", "shojo_romance"], desc: "カードを集める魔法少女・木之本桜の物語。かわいらしさと多彩な衣装で魔法少女ものの新たな古典となった。" },
  { id: "kimitodoke", title: "君に届け", author: "椎名軽穂", year: 2005, magazine: "別冊マーガレット", genres: ["shojo_romance"], desc: "誤解されがちな少女・爽子の初恋と友情。純度の高い青春描写で2000年代の少女マンガを代表する作品となった。" },
  { id: "chihaya", title: "ちはやふる", author: "末次由紀", year: 2007, magazine: "BE・LOVE", genres: ["shojo_romance", "spokon"], desc: "競技かるたに青春を懸ける千早たちの物語。少女マンガとスポ根を融合し、競技かるたブームを巻き起こした。" },
  { id: "nodame", title: "のだめカンタービレ", author: "二ノ宮知子", year: 2001, magazine: "Kiss", genres: ["ladies"], desc: "破天荒なピアニスト・のだめと指揮者志望の千秋のクラシック音楽ラブコメ。音大を舞台に音楽ブームを牽引した。" },
  { id: "hachikuro", title: "ハチミツとクローバー", author: "羽海野チカ", year: 2000, magazine: "ヤングユー→コーラス", genres: ["ladies"], desc: "美大生たちの片思いと青春を瑞々しく描く。切なさとユーモアの絶妙な筆致で、後の羽海野作品の原点となった。" },

  // ===== 追加: ギャグ・日常系 =====
  { id: "crayon", title: "クレヨンしんちゃん", author: "臼井儀人", year: 1990, magazine: "漫画アクション", genres: ["nonsense", "yonkoma"], desc: "5歳児しんのすけの下品でおませなギャグ。国民的アニメとなり、日常ギャグマンガの代表格として世代を超えて愛される。" },
  { id: "bobobo", title: "ボボボーボ・ボーボボ", author: "澤井啓夫", year: 2001, magazine: "週刊少年ジャンプ", genres: ["nonsense"], desc: "鼻毛真拳を操るボーボボの不条理ギャグ。理屈を超えたハイテンションとシュールさでカルト的人気を博した。" },
  { id: "hiwa", title: "ギャグマンガ日和", author: "増田こうすけ", year: 2000, magazine: "月刊少年ジャンプ→ジャンプSQ.", genres: ["nonsense"], desc: "歴史上の偉人などを題材にした脱力系ショートギャグ。独特のテンポとシュールさでアニメ化もされた人気作。" },
  { id: "yotsuba", title: "よつばと!", author: "あずまきよひこ", year: 2003, magazine: "月刊コミック電撃大王", genres: ["moe_yonkoma", "essay"], desc: "好奇心のかたまりの少女よつばと、彼女をとりまく人々の何気ない毎日。『あずまんが大王』の作者が描く日常系の到達点。" },
  { id: "keion", title: "けいおん!", author: "かきふらい", year: 2007, magazine: "まんがタイムきらら", genres: ["moe_yonkoma"], desc: "軽音楽部の女の子たちのゆるい日常を描く4コマ。アニメ化で社会現象となり、「日常系×バンド」ブームを作った。" },
  { id: "yurucamp", title: "ゆるキャン△", author: "あfろ", year: 2015, magazine: "まんがタイムきららフォワード", genres: ["moe_yonkoma"], desc: "少女たちのゆるやかなアウトドアと冬キャンプ。丁寧な風景描写と癒しの空気でキャンプブームの火付け役となった。" },

  // ===== 追加(第2弾): 昭和ギャグ・スポ根の名作 =====
  { id: "bakabon", title: "天才バカボン", author: "赤塚不二夫", year: 1967, magazine: "週刊少年マガジン", genres: ["akatsuka"], desc: "「これでいいのだ」バカボンのパパの破壊的ナンセンス。赤塚ギャグの代表作として世代を超えて親しまれる。" },
  { id: "gakideka", title: "がきデカ", author: "山上たつひこ", year: 1974, magazine: "週刊少年チャンピオン", genres: ["nonsense"], desc: "少年警察官こまわり君の下品で過激なギャグ。「死刑!」の決めポーズで70年代ギャグ革命を象徴した。" },
  { id: "macaroni", title: "マカロニほうれん荘", author: "鴨川つばめ", year: 1977, magazine: "週刊少年チャンピオン", genres: ["nonsense"], desc: "ハイテンションとパロディを詰め込んだ狂騒的ギャグ。後のギャグマンガの疾走感に絶大な影響を与えた伝説的作品。" },
  { id: "kimenzu", title: "ハイスクール!奇面組", author: "新沢基栄", year: 1982, magazine: "週刊少年ジャンプ", genres: ["nonsense"], desc: "個性派5人組「奇面組」が繰り広げる学園ギャグ。80年代ジャンプのギャグ路線を支えた人気作。" },
  { id: "cobra", title: "コブラ", author: "寺沢武一", year: 1978, magazine: "週刊少年ジャンプ", genres: ["seinen_sf"], desc: "サイコガンを持つ宇宙海賊コブラの活躍。日本初期のアメコミ的スペースオペラとして高い人気を得た。" },
  { id: "dokaben", title: "ドカベン", author: "水島新司", year: 1972, magazine: "週刊少年チャンピオン", genres: ["spokon"], desc: "山田太郎を中心とした高校野球群像劇。緻密な試合描写で野球マンガの一時代を築いた長期連載。" },
  { id: "captain_chiba", title: "キャプテン", author: "ちばあきお", year: 1972, magazine: "月刊少年ジャンプ", genres: ["spokon"], desc: "平凡な選手たちが努力で強豪になる中学野球。派手さのない誠実なスポ根として今も評価が高い名作。" },
  { id: "ring", title: "リングにかけろ", author: "車田正美", year: 1977, magazine: "週刊少年ジャンプ", genres: ["spokon", "jump_battle"], desc: "必殺ブローが炸裂するボクシング。スポ根に超人的な演出を持ち込み、後の車田作品と少年バトルの原型となった。" },
  { id: "rookies", title: "ROOKIES", author: "森田まさのり", year: 1998, magazine: "週刊少年ジャンプ", genres: ["spokon"], desc: "不良だらけの野球部を熱血教師が再生させる。汗と涙の青春群像で幅広い支持を集めた。" },
  { id: "hoshin", title: "封神演義", author: "藤崎竜", year: 1996, magazine: "週刊少年ジャンプ", genres: ["jump_battle"], desc: "中国古典を大胆にアレンジした仙人バトル。スタイリッシュな作画と独自の解釈でカルト的人気を博した。" },

  // ===== 追加(第2弾): ジャンプ系バトル/近年のヒット =====
  { id: "reborn", title: "家庭教師ヒットマンREBORN!", author: "天野明", year: 2004, magazine: "週刊少年ジャンプ", genres: ["jump_battle"], desc: "ダメ中学生ツナがマフィアのボス修行に巻き込まれる。ギャグから本格バトルへ転じる構成で人気を集めた。" },
  { id: "toriko", title: "トリコ", author: "島袋光年", year: 2008, magazine: "週刊少年ジャンプ", genres: ["jump_battle", "gourmet"], desc: "美食屋トリコが究極の食材を狩る。グルメとバトルを融合した豪快な世界観が特徴。" },
  { id: "ansatsu", title: "暗殺教室", author: "松井優征", year: 2012, magazine: "週刊少年ジャンプ", genres: ["jump_battle", "nonsense"], desc: "地球を破壊すると宣言した謎の生物「殺せんせー」を暗殺する学園もの。教育と成長を軸にした異色作。" },
  { id: "souma", title: "食戟のソーマ", author: "附田祐斗・佐伯俊", year: 2012, magazine: "週刊少年ジャンプ", genres: ["gourmet", "jump_battle"], desc: "料理対決「食戟」に挑む幸平創真。バトルマンガの熱量を料理に注ぎ込んだグルメ×ジャンプの人気作。" },
  { id: "dgray", title: "D.Gray-man", author: "星野桂", year: 2004, magazine: "週刊少年ジャンプ", genres: ["dark_fantasy"], desc: "悪魔「AKUMA」と戦うエクソシストの物語。ゴシックで緻密な世界観とキャラ人気で支持を得た。" },
  { id: "kaiju8", title: "怪獣8号", author: "松本直也", year: 2020, magazine: "少年ジャンプ+", genres: ["webcomic", "dark_fantasy"], desc: "怪獣の力を得た中年男が防衛隊で戦う。Web連載発で国内外の同時人気を獲得した新世代のヒット作。" },
  { id: "oshinoko", title: "【推しの子】", author: "赤坂アカ・横槍メンゴ", year: 2020, magazine: "週刊ヤングジャンプ", genres: ["shakai", "shonen_mystery"], desc: "アイドルの子に転生した主人公が芸能界の闇に挑む。転生×芸能×サスペンスで社会現象的ヒットとなった。" },
  { id: "sakamoto", title: "SAKAMOTO DAYS", author: "鈴木祐斗", year: 2020, magazine: "週刊少年ジャンプ", genres: ["jump_battle"], desc: "引退した伝説の殺し屋・坂本が家族を守るために戦う。洗練されたアクション演出で人気を集める。" },
  { id: "dandadan", title: "ダンダダン", author: "龍幸伸", year: 2021, magazine: "少年ジャンプ+", genres: ["webcomic", "dark_fantasy", "yokai"], desc: "オカルトと宇宙人が交錯する青春バトル。圧倒的な画力とテンポでWeb発の話題作となった。" },

  // ===== 追加(第2弾): サンデー・マガジンの名作 =====
  { id: "h2", title: "H2", author: "あだち充", year: 1992, magazine: "週刊少年サンデー", genres: ["lovecome", "spokon"], desc: "野球と幼なじみたちの三角関係。あだち充の集大成的な青春野球ラブコメの名作。" },
  { id: "kyoukara", title: "今日から俺は!!", author: "西森博之", year: 1988, magazine: "週刊少年サンデー", genres: ["nonsense"], desc: "転校を機に不良デビューした二人組のヤンキーギャグ。テンポの良い笑いとケンカで長く愛される。" },
  { id: "diamond", title: "ダイヤのA", author: "寺嶋裕二", year: 2006, magazine: "週刊少年マガジン", genres: ["spokon"], desc: "名門野球部で成長する投手・沢村栄純。ポジション争いの緊張感を丁寧に描く本格野球マンガ。" },
  { id: "nanatsu", title: "七つの大罪", author: "鈴木央", year: 2012, magazine: "週刊少年マガジン", genres: ["jump_battle", "dark_fantasy"], desc: "伝説の騎士団「七つの大罪」の冒険。王道ファンタジーバトルとして世界的にヒットした。" },
  { id: "gotoubun", title: "五等分の花嫁", author: "春場ねぎ", year: 2017, magazine: "週刊少年マガジン", genres: ["lovecome"], desc: "五つ子の家庭教師をする少年の恋の行方。「誰と結ばれるか」の謎で読者を熱狂させたラブコメの代表作。" },
  { id: "ajin", title: "亜人", author: "桜井画門", year: 2012, magazine: "good!アフタヌーン", genres: ["seinen_sf", "dark_fantasy"], desc: "死なない新人類「亜人」をめぐる攻防。冷徹な頭脳戦とアクションで青年誌のヒットとなった。" },
  { id: "initiald", title: "頭文字D", author: "しげの秀一", year: 1995, magazine: "週刊ヤングマガジン", genres: ["seinen_mag"], desc: "峠を攻める公道バトルを描く走り屋マンガ。ドリフトブームを生み、走り屋文化の象徴となった。" },

  // ===== 追加(第2弾): 青年誌の傑作 =====
  { id: "mushishi", title: "蟲師", author: "漆原友紀", year: 1999, magazine: "月刊アフタヌーン", genres: ["yokai", "seinen_mag"], desc: "「蟲」と人の関わりを描く幻想譚。静謐で詩的な世界観が高く評価される連作短編の名作。" },
  { id: "historie", title: "ヒストリエ", author: "岩明均", year: 2003, magazine: "月刊アフタヌーン", genres: ["gekiga_jidai"], desc: "古代ギリシャの書記官エウメネスの生涯。『寄生獣』の岩明均が描く緻密な歴史大河。" },
  { id: "baki", title: "グラップラー刃牙", author: "板垣恵介", year: 1991, magazine: "週刊少年チャンピオン", genres: ["jump_battle", "spokon"], desc: "最強を求める格闘家・範馬刃牙の死闘。過剰な肉体描写と独特の格闘理論でカルト的人気を誇る。" },
  { id: "akagi", title: "アカギ", author: "福本伸行", year: 1992, magazine: "近代麻雀", genres: ["gamble"], desc: "天才・赤木しげるの麻雀と生き様。命を賭けた勝負の哲学で麻雀劇画の頂点に立つ。" },
  { id: "ten", title: "天 天和通りの快男児", author: "福本伸行", year: 1989, magazine: "近代麻雀ゴールド", genres: ["gamble"], desc: "麻雀を軸に男たちの生き方を描く。後半の赤木しげるの死と対話は劇画屈指の名場面とされる。" },
  { id: "kintaro", title: "サラリーマン金太郎", author: "本宮ひろ志", year: 1994, magazine: "週刊ヤングジャンプ", genres: ["business"], desc: "元暴走族総長のサラリーマンが正論と行動力で会社を動かす。痛快なビジネスマンガの代表作。" },
  { id: "pluto", title: "PLUTO", author: "浦沢直樹・手塚治虫", year: 2003, magazine: "ビッグコミックオリジナル", genres: ["seinen_sf"], desc: "手塚治虫『鉄腕アトム』の「地上最大のロボット」を浦沢直樹がリメイク。ロボットと戦争を重厚に描いた傑作。" },
  { id: "kodoku", title: "孤独のグルメ", author: "久住昌之・谷口ジロー", year: 1994, magazine: "月刊PANJA", genres: ["gourmet"], desc: "中年男が一人で飯を食うだけの物語。派手な蘊蓄も事件もない「ただ食べる」ことの豊かさで新境地を開いた。" },
  { id: "shinya", title: "深夜食堂", author: "安倍夜郎", year: 2006, magazine: "ビッグコミックオリジナル", genres: ["gourmet"], desc: "深夜だけ開く小さな食堂に集う人々の人情群像。一皿ごとに描かれる市井のドラマが胸を打つ。" },
  { id: "bluegiant", title: "BLUE GIANT", author: "石塚真一", year: 2013, magazine: "ビッグコミック", genres: ["seinen_mag"], desc: "世界一のジャズプレイヤーを目指す少年の物語。音を絵で聴かせる圧巻の演奏描写で高く評価された。" },
  { id: "kusuriya", title: "薬屋のひとりごと", author: "日向夏・ねこクラゲ", year: 2017, magazine: "月刊サンデーGX / ビッグガンガン", genres: ["shonen_mystery", "gekiga_jidai"], desc: "後宮を舞台に、薬の知識で事件を解く少女・猫猫。中華風ミステリーとして大ヒットしたコミカライズ。" },

  // ===== 追加(第2弾): 少女・女性・BLの名作 =====
  { id: "animal_doctor", title: "動物のお医者さん", author: "佐々木倫子", year: 1987, magazine: "花とゆめ", genres: ["nonsense"], desc: "北海道の獣医学部を舞台にした脱力系コメディ。シベリアンハスキーブームを起こした少女誌の異色作。" },
  { id: "patalliro", title: "パタリロ!", author: "魔夜峰央", year: 1978, magazine: "花とゆめ", genres: ["nonsense", "bl"], desc: "常若の王パタリロが引き起こすギャグと美形スパイの物語。少女誌の長寿ギャグ&BLの先駆けとして知られる。" },
  { id: "yona", title: "暁のヨナ", author: "草凪みずほ", year: 2009, magazine: "花とゆめ", genres: ["shojo_romance"], desc: "国を追われた王女ヨナの成長と冒険。ファンタジー大河として少女マンガの枠を広げた人気作。" },
  { id: "ouran", title: "桜蘭高校ホスト部", author: "葉鳥ビスコ", year: 2002, magazine: "LaLa", genres: ["shojo_romance"], desc: "名門校のホスト部に巻き込まれた少女ハルヒ。逆ハーレムコメディの代表作として人気を博した。" },
  { id: "tarareba", title: "東京タラレバ娘", author: "東村アキコ", year: 2014, magazine: "Kiss", genres: ["ladies"], desc: "アラサー女子の恋と焦りをシビアかつコミカルに描く。等身大の共感で女性読者の圧倒的支持を得た。" },
  { id: "sekaiichi", title: "世界一初恋", author: "中村春菊", year: 2006, magazine: "エメラルド", genres: ["bl"], desc: "編集部を舞台にした社会人BLの人気作。商業BLの拡大を象徴する代表的シリーズ。" },

  // ===== 追加(第2弾): 日常系・デジタル =====
  { id: "lucky", title: "らき☆すた", author: "美水かがみ", year: 2004, magazine: "月刊コンプティーク", genres: ["moe_yonkoma"], desc: "オタク女子高生たちのゆるい4コマ。アニメ化で聖地巡礼ブームを生み、日常系文化を象徴した。" },
  { id: "saint_oniisan", title: "聖☆おにいさん", author: "中村光", year: 2006, magazine: "モーニング・ツー", genres: ["nonsense", "essay"], desc: "ブッダとイエスが下界で暮らすゆるい日常コメディ。宗教をやわらかく扱う発想の妙で人気を得た。" },
  { id: "nichijou", title: "日常", author: "あらゐけいいち", year: 2006, magazine: "月刊少年エース", genres: ["nonsense", "moe_yonkoma"], desc: "淡々とした日常が突然シュールに崩れるギャグ。独特のテンポと不条理さで熱狂的ファンを持つ。" },
  { id: "relife", title: "ReLIFE", author: "夜宵草", year: 2013, magazine: "comico", genres: ["webtoon"], desc: "ニートの主人公が薬で高校生に戻りやり直す。縦読みフルカラーアプリ発の初期ヒット作。" },

  // ===== 代表作の拡充(2026-07) =====
  // 異世界・なろう系
  { id: "rezero", title: "Re:ゼロから始める異世界生活", author: "長月達平・原作", year: 2014, magazine: "月刊コミックアライブ他", genres: ["isekai"], desc: "死ぬたびに時間が巻き戻る「死に戻り」を武器に、少年スバルが絶望の異世界で足掻く。なろう発の代表作のひとつ。" },
  { id: "overlord", title: "オーバーロード", author: "丸山くがね・原作", year: 2014, magazine: "コンプエース", genres: ["isekai"], desc: "ゲーム世界に骸骨の魔王として取り残された男の征服譚。「強すぎる主人公」もの異世界の代表格。" },
  { id: "tatenoyusha", title: "盾の勇者の成り上がり", author: "アネコユサギ・原作", year: 2014, magazine: "月刊コミックフラッパー", genres: ["isekai"], desc: "攻撃できない盾だけを与えられ裏切られた勇者の逆襲。追放・復讐系なろうの火付け役。" },
  { id: "mushoku", title: "無職転生", author: "理不尽な孫の手・原作", year: 2014, magazine: "月刊コミックフラッパー", genres: ["isekai"], desc: "引きこもりが赤ん坊から異世界をやり直す。「なろうの金字塔」と呼ばれる転生一代記。" },
  { id: "konosuba", title: "この素晴らしい世界に祝福を!", author: "暁なつめ・原作", year: 2015, magazine: "月刊ドラゴンエイジ", genres: ["isekai", "nonsense"], desc: "ポンコツ女神たちと繰り広げる異世界ギャグ。なろう系をパロディした脱力コメディの定番。" },
  // 戦闘美少女
  { id: "madoka", title: "魔法少女まどか☆マギカ", author: "Magica Quartet・ハノカゲ", year: 2011, magazine: "まんがタイムきらら☆マギカ", genres: ["battle_bishojo", "dark_fantasy"], desc: "魔法少女の「願いと絶望」を反転させた衝撃作。可愛い絵柄の裏の残酷さで魔法少女像を更新した。" },
  { id: "precure", title: "ふたりはプリキュア", author: "東堂いづみ・上北ふたご", year: 2004, magazine: "なかよし", genres: ["battle_bishojo"], desc: "肉弾戦で戦う二人の中学生。長寿シリーズ「プリキュア」の原点となった変身ヒロイン。" },
  // ビジネス・情報
  { id: "naniwa", title: "ナニワ金融道", author: "青木雄二", year: 1990, magazine: "モーニング", genres: ["business", "gamble"], desc: "街金融の現場から人間の欲と法の抜け穴を描く。バブル崩壊期のリアルを刻んだ金融劇画。" },
  { id: "investorz", title: "インベスターZ", author: "三田紀房", year: 2013, magazine: "モーニング", genres: ["business"], desc: "中学生が学園の資産を運用する投資部の物語。お金と経済のしくみを物語で学べる情報マンガ。" },
  { id: "dragonzakura", title: "ドラゴン桜", author: "三田紀房", year: 2003, magazine: "モーニング", genres: ["business", "shakai"], desc: "落ちこぼれ高校から東大を目指す受験攻略ドラマ。「勉強法マンガ」の代名詞。" },
  // ギャンブル
  { id: "ginto", title: "銀と金", author: "福本伸行", year: 1992, magazine: "アクションピザッツ", genres: ["gamble"], desc: "裏社会の大金を巡る心理戦。カイジ・アカギに連なる福本ギャンブル劇画の原点的作品。" },
  { id: "tetsuya", title: "哲也-雀聖と呼ばれた男", author: "さいふうめい・星野泰視", year: 1997, magazine: "週刊少年マガジン", genres: ["gamble"], desc: "戦後の焼け跡を渡り歩く麻雀無宿・哲也。博打の熱と昭和の匂いを刻んだ雀士伝。" },
  { id: "kakegurui", title: "賭ケグルイ", author: "河本ほむら・尚村透", year: 2014, magazine: "月刊ガンガンJOKER", genres: ["gamble"], desc: "賭博がすべてを決める学園に現れた狂気の転校生。ギャンブルの快楽と表情芝居に振り切った令和のヒット。" },
  // 不条理ギャグ
  { id: "utsurun", title: "伝染るんです。", author: "吉田戦車", year: 1989, magazine: "ビッグコミックスピリッツ", genres: ["fujori"], desc: "脈絡のない不条理な笑い。90年代の不条理ギャグブームを牽引した一冊。" },
  { id: "bonobono", title: "ぼのぼの", author: "いがらしみきお", year: 1986, magazine: "まんがライフ", genres: ["yonkoma", "fujori"], desc: "ラッコの子・ぼのぼのと森の仲間たちの、ゆるくて哲学的な4コマ。癒しと不条理が同居する長寿作。" },
  // サブカル系
  { id: "lychee", title: "ライチ☆光クラブ", author: "古屋兎丸", year: 2005, magazine: "マンガ・エロティクス・エフ", genres: ["subculture"], desc: "少年たちが作った機械「ライチ」を巡る耽美と暴力。アングラ演劇を原作にしたカルト的サブカル漫画。" },
  { id: "shojotsubaki", title: "少女椿", author: "丸尾末広", year: 1984, magazine: "青林堂", genres: ["subculture", "shojo_horror"], desc: "見世物小屋に売られた少女みどりの受難。エログロと大正浪漫が交錯する、アングラ漫画の金字塔。" },
  // ウェブトゥーン
  { id: "kaminotou", title: "神之塔", author: "SIU", year: 2010, magazine: "LINEマンガ", genres: ["webtoon", "isekai"], desc: "塔を登り願いを叶えようとする少年。韓国発ウェブトゥーンの世界的ヒットで、縦読みを世界に広めた。" },
  { id: "megami", title: "女神降臨", author: "yaongyi", year: 2018, magazine: "webtoon", genres: ["webtoon", "shojo_romance"], desc: "メイクで「女神」になった少女の恋と自己肯定。縦スクロール少女漫画の代表的ヒット。" },
  // SNS発
  { id: "otakoi", title: "ヲタクに恋は難しい", author: "ふじた", year: 2014, magazine: "pixiv→comicPOOL", genres: ["sns", "lovecome"], desc: "オタク同士の不器用な社会人恋愛。pixiv発・SNSでバズって書籍化した令和型ラブコメ。" },
  // 少女ホラー
  { id: "baptism", title: "洗礼", author: "楳図かずお", year: 1974, magazine: "少女コミック", genres: ["shojo_horror"], desc: "美貌に執着する母が娘の体を奪おうとする。少女漫画にトラウマ級の恐怖を持ち込んだ楳図ホラーの代表作。" },
  // 4コマ・新聞
  { id: "kobochan", title: "コボちゃん", author: "植田まさし", year: 1982, magazine: "読売新聞", genres: ["yonkoma", "newspaper"], desc: "幼稚園児コボちゃんと家族の日常を描く新聞4コマの定番。世代を超えて読み継がれる国民的作品。" },
  // 源流・黎明
  { id: "jungle", title: "ジャングル大帝", author: "手塚治虫", year: 1950, magazine: "漫画少年", genres: ["story", "kodomo"], desc: "白いライオン・レオ三代の物語。長編ストーリー漫画の初期到達点で、カラーアニメの原点にもなった。" },
  { id: "akko", title: "ひみつのアッコちゃん", author: "赤塚不二夫", year: 1962, magazine: "りぼん", genres: ["akatsuka", "shojo_dawn"], desc: "鏡で何にでも変身できる少女アッコ。魔法少女ものの元祖のひとつで、赤塚が少女漫画で放ったヒット。" },
  { id: "akairo", title: "赤色エレジー", author: "林静一", year: 1970, magazine: "ガロ", genres: ["garo"], desc: "貧しく生きる若い男女の同棲と別れ。叙情的な線でガロの詩的リアリズムを象徴する名作。" },
  { id: "toma", title: "トーマの心臓", author: "萩尾望都", year: 1974, magazine: "週刊少女コミック", genres: ["year24", "bl"], desc: "ドイツの寄宿舎で少年の死をめぐる魂の物語。24年組が少年愛と内面を描いた金字塔。" },
  { id: "domu", title: "童夢", author: "大友克洋", year: 1980, magazine: "アクションデラックス", genres: ["newwave", "seinen_sf"], desc: "団地で老人と少女が超能力で対決。緻密な描写と静かな破壊で日本SF漫画を刷新した問題作。" },
  { id: "sangokushi", title: "三国志", author: "横山光輝", year: 1971, magazine: "希望の友→コミックトム", genres: ["gekiga_jidai"], desc: "後漢末の動乱から三国鼎立、そして晋の統一まで。吉川英治版を下敷きに全60巻で描き切った、日本人の三国志像を決定づけた歴史漫画の金字塔。" },
];

// ---- helpers ----

export const YEAR_MIN = 1893;
export const YEAR_MAX = 2028;
export const Y_SCALE = 18;
export const MAP_W = 1650;
export const MAP_H = (YEAR_MAX - YEAR_MIN) * Y_SCALE + 140;
export const NODE_W = 196;
export const NODE_H = 48;

export function yearToY(year: number): number {
  return (year - YEAR_MIN) * Y_SCALE + 100;
}

export function nodePos(n: GenreNode): { x: number; y: number } {
  const cat = CATEGORIES.find((c) => c.id === n.cat)!;
  return { x: cat.colX, y: yearToY(n.ly ?? n.year) };
}

export function catOf(n: GenreNode): Category {
  return CATEGORIES.find((c) => c.id === n.cat)!;
}

export function genreById(id: string): GenreNode | undefined {
  return GENRES.find((g) => g.id === id);
}

export function workById(id: string): Work | undefined {
  return WORKS.find((w) => w.id === id);
}

export function worksOfGenre(genreId: string): Work[] {
  return WORKS.filter((w) => w.genres.includes(genreId)).sort((a, b) => a.year - b.year);
}

// ================= 舞台マップ(世界/日本) =================
// lon/lat は実座標(WGS84)。dx/dy は投影後のピクセル単位の重なり回避オフセット。

export interface MapSpot {
  id: string;
  map: "world" | "japan";
  lon: number;
  lat: number;
  dx?: number;
  dy?: number;
  place: string;
  works: { workId: string; note: string }[];
}

export const SPOTS: MapSpot[] = [
  // ---- 世界 ----
  {
    id: "w-versailles", map: "world", lon: 2.12, lat: 48.8, place: "フランス・パリ / ヴェルサイユ",
    works: [{ workId: "berubara", note: "革命前夜のヴェルサイユ宮殿。オスカルが駆けた石畳の街" }],
  },
  {
    id: "w-arles", map: "world", lon: 4.63, lat: 43.68, dy: 8, place: "南フランス・アルル",
    works: [{ workId: "kaze_ki", note: "19世紀末、ラコンブラード学院の寄宿舎が物語の中心" }],
  },
  {
    id: "w-uk", map: "world", lon: -0.13, lat: 51.51, dx: -8, dy: -6, place: "イギリス",
    works: [{ workId: "poe", note: "18世紀の英国から時を超えて旅するバンパネラの一族" }],
  },
  {
    id: "w-nordlingen", map: "world", lon: 10.49, lat: 48.85, dx: 8, place: "ドイツ・ネルトリンゲン",
    works: [{ workId: "shingeki", note: "円形城壁に囲まれた実在の街。「壁の中の世界」のモデルと言われる" }],
  },
  {
    id: "w-ny", map: "world", lon: -74.01, lat: 40.71, place: "ニューヨーク",
    works: [{ workId: "golgo", note: "世界中が仕事場の超一流スナイパー。摩天楼の狙撃は定番シーン" }],
  },
  {
    id: "w-seoul", map: "world", lon: 126.98, lat: 37.57, dx: -6, place: "韓国・ソウル",
    works: [{ workId: "sololeveling", note: "ゲートとダンジョンが出現するソウル。ウェブトゥーンの都でもある" }],
  },
  {
    id: "w-tokyo", map: "world", lon: 139.77, lat: 35.68, dx: 6, dy: 4, place: "日本・東京",
    works: [
      { workId: "akira", note: "2019年ネオ東京。旧市街の上に築かれた未来都市" },
      { workId: "tetsuwan", note: "21世紀の東京。ロボットと人間が暮らすかつての「未来」" },
    ],
  },
  {
    id: "w-china", map: "world", lon: 108.9, lat: 34.3, place: "中国・咸陽(古代中国)",
    works: [{ workId: "kingdom", note: "春秋戦国末期の中華。信と嬴政が天下統一を目指す" }],
  },
  {
    id: "w-scandinavia", map: "world", lon: 10.0, lat: 56.0, dy: -6, place: "北欧・デンマーク",
    works: [{ workId: "vinland", note: "11世紀、ヴァイキングの時代。トルフィンの復讐と再生" }],
  },
  {
    id: "w-dusseldorf", map: "world", lon: 6.78, lat: 51.22, dx: -6, dy: -8, place: "ドイツ・デュッセルドルフ",
    works: [{ workId: "monster", note: "テンマが働いたアイスラー記念病院の街。物語はドイツ各地へ" }],
  },
  {
    id: "w-macedonia", map: "world", lon: 22.54, lat: 40.75, dy: 6, place: "ギリシャ・マケドニア",
    works: [{ workId: "historie", note: "アレクサンドロス大王に仕えた書記官エウメネスの生涯" }],
  },
  {
    id: "w-grandline", map: "world", lon: -145, lat: -5, place: "偉大なる航路(架空)",
    works: [{ workId: "onepiece", note: "地図に載らない大海原。世界一周の大冒険はここから" }],
  },
  {
    id: "w-isekai", map: "world", lon: 170, lat: -48, place: "異世界(地図の外)",
    works: [{ workId: "tensura", note: "転生先は地図の外。剣と魔法のジュラ大森林" }],
  },

  // ---- 日本 ----
  {
    id: "j-kozanji", map: "japan", lon: 135.678, lat: 35.061, dx: -12, dy: -8, place: "京都・高山寺",
    works: [{ workId: "chojugiga", note: "『鳥獣人物戯画』が伝わる寺。日本最古のマンガに会える聖地" }],
  },
  {
    id: "j-otaru", map: "japan", lon: 141.0, lat: 43.19, dx: -10, place: "北海道・小樽/札幌",
    works: [{ workId: "goldenkamuy", note: "明治末期の北海道。金塊と、アイヌ文化と、狩りと食" }],
  },
  {
    id: "j-tokachi", map: "japan", lon: 143.2, lat: 42.92, place: "北海道・十勝",
    works: [{ workId: "ginsaji", note: "大蝦夷農業高校。広大な畑と家畜と、食べることの授業" }],
  },
  {
    id: "j-okutama", map: "japan", lon: 138.94, lat: 35.86, dx: -10, dy: -6, place: "東京・奥多摩(雲取山)",
    works: [{ workId: "kimetsu", note: "炭治郎の故郷は雲取山。大正の東京府から物語が始まる" }],
  },
  {
    id: "j-saitama", map: "japan", lon: 139.65, lat: 35.91, dy: -10, place: "埼玉",
    works: [
      { workId: "tondesaitama", note: "東京都民に虐げられる埼玉県民の逆襲。愛ある郷土ギャグの聖地" },
      { workId: "crayon", note: "春日部の野原一家。しんちゃんは市の子育て応援キャラクター" },
    ],
  },
  {
    id: "j-gunma", map: "japan", lon: 138.87, lat: 36.47, dy: -8, place: "群馬・榛名山(秋名)",
    works: [{ workId: "initiald", note: "ハチロクが下る秋名の峠。モデルは榛名山のワインディング" }],
  },
  {
    id: "j-sendai", map: "japan", lon: 140.87, lat: 38.27, place: "宮城・仙台",
    works: [{ workId: "bluegiant", note: "大が広瀬川の河原でテナーサックスを吹き続けた街" }],
  },
  {
    id: "j-omi", map: "japan", lon: 135.85, lat: 35.03, dx: -8, dy: -10, place: "滋賀・近江神宮",
    works: [{ workId: "chihaya", note: "競技かるたの聖地。名人位・クイーン位戦の舞台" }],
  },
  {
    id: "j-tokyo-center", map: "japan", lon: 139.76, lat: 35.68, place: "東京・都心",
    works: [
      { workId: "deathnote", note: "警視庁とLの捜査本部。夜神月の頭脳戦の舞台" },
      { workId: "sailor", note: "麻布十番が舞台。実在の商店街にセーラームーンの気配" },
      { workId: "oishinbo", note: "東西新聞社。築地や銀座の名店がモデルに多数登場" },
      { workId: "shima", note: "初芝電器産業本社。昭和のサラリーマン東京" },
      { workId: "conan", note: "米花町。事件発生率は日本一(たぶん)" },
      { workId: "rurouni", note: "明治11年の東京・神谷道場" },
      { workId: "azumanga", note: "どこにでもありそうな東京の高校の日常" },
    ],
  },
  {
    id: "j-shitamachi", map: "japan", lon: 139.8, lat: 35.73, dx: 12, dy: -4, place: "東京・下町",
    works: [
      { workId: "ashita", note: "山谷のドヤ街と泪橋。ジョーが立ち上がった場所" },
      { workId: "kyojin", note: "長屋で父・一徹との大リーグボール養成ギプス特訓" },
      { workId: "wani", note: "どこにでもある東京の日常の100日間" },
    ],
  },
  {
    id: "j-chofu", map: "japan", lon: 139.54, lat: 35.65, dx: -10, dy: 8, place: "東京・調布/練馬",
    works: [{ workId: "urusei", note: "友引町のモデルは東京郊外の住宅街。水木しげるの調布も近い" }],
  },
  {
    id: "j-shonan", map: "japan", lon: 139.48, lat: 35.31, dy: 8, place: "神奈川・湘南",
    works: [{ workId: "slam", note: "湘北高校バスケ部。江ノ電の踏切は世界的聖地に" }],
  },
  {
    id: "j-shimizu", map: "japan", lon: 138.49, lat: 35.02, place: "静岡・清水",
    works: [{ workId: "chibimaruko", note: "昭和49年の清水市。まる子とたまちゃんの通学路" }],
  },
  {
    id: "j-osaka", map: "japan", lon: 135.5, lat: 34.69, place: "大阪・下町",
    works: [{ workId: "chie", note: "チエちゃんが切り盛りするホルモン屋。関西弁の人情の街" }],
  },
  {
    id: "j-sakaiminato", map: "japan", lon: 133.23, lat: 35.54, place: "鳥取・境港",
    works: [{ workId: "gegege", note: "水木しげるの故郷。水木しげるロードには177体の妖怪ブロンズ像" }],
  },
  {
    id: "j-hakata", map: "japan", lon: 130.4, lat: 33.59, place: "福岡・博多",
    works: [{ workId: "cookingpapa", note: "荒岩家の食卓。博多の街と実用レシピ1500品以上" }],
  },
  {
    id: "j-goto", map: "japan", lon: 128.84, lat: 32.7, place: "長崎・五島列島",
    works: [{ workId: "barakamon", note: "書道家・半田先生が移住した島。方言と海と子どもたち" }],
  },
];

export function spotsOf(map: "world" | "japan"): MapSpot[] {
  return SPOTS.filter((s) => s.map === map);
}

// ================= 物語の時代設定タイムライン =================

export interface StoryEra {
  id: string;
  label: string;
  span: string;
  desc: string;
  works: { workId: string; note: string }[];
}

export const STORY_ERAS: StoryEra[] = [
  {
    id: "edo", label: "江戸時代", span: "1603 — 1868",
    desc: "侍と身分制度の時代。劇画がもっとも愛した舞台であり、時代劇画という一大ジャンルを生んだ。",
    works: [
      { workId: "kamui", note: "江戸初期。忍者カムイと被差別民・正助、三重の視点で身分社会を描く大河劇画" },
      { workId: "vagabond", note: "関ヶ原前後。剣豪・宮本武蔵の求道と成長" },
      { workId: "ooku", note: "男女の役割が逆転した江戸城大奥という歴史改変" },
    ],
  },
  {
    id: "euro", label: "18〜19世紀ヨーロッパ", span: "革命と貴族の時代",
    desc: "少女マンガが愛した金髪と宮殿とドレスの世界。24年組はここに人間の内面と歴史のうねりを描き込んだ。",
    works: [
      { workId: "berubara", note: "1789年フランス革命へ。オスカルとマリー・アントワネットの運命" },
      { workId: "poe", note: "18世紀英国から現代へ。永遠を生きる一族の200年" },
      { workId: "kaze_ki", note: "19世紀末南仏アルルの寄宿学校。ジルベールとセルジュ" },
    ],
  },
  {
    id: "meiji", label: "幕末・明治", span: "1853 — 1912",
    desc: "刀の時代の終わりと文明開化。「変わりゆく時代を生きる剣士」はマンガの永遠のモチーフ。",
    works: [
      { workId: "rurouni", note: "明治11年、東京。人斬りの過去を背負い不殺を誓う流浪人" },
      { workId: "goldenkamuy", note: "明治末期の北海道。元兵士とアイヌの少女が金塊を追う" },
    ],
  },
  {
    id: "taisho", label: "大正", span: "1912 — 1926",
    desc: "和と洋が混ざるモダンの時代。大正ロマンの意匠は2010年代マンガで大復活した。",
    works: [{ workId: "kimetsu", note: "大正の東京と山々。鬼舞辻無惨を追う剣士たちの物語" }],
  },
  {
    id: "senzen", label: "昭和・戦前", span: "1926 — 1945",
    desc: "軍靴の音が近づく時代。マンガ自身がこの時代を生き、検閲と戦争に翻弄された。",
    works: [{ workId: "norakuro", note: "犬の軍隊・猛犬連隊で出世していくのらくろ。時代の空気を映す鏡" }],
  },
  {
    id: "sengo", label: "昭和・戦後〜高度成長", span: "1945 — 1974",
    desc: "焼け跡から高度成長へ。スポ根の汗と涙、下町の人情。「貧しくても熱い」時代の物語群。",
    works: [
      { workId: "ashita", note: "昭和40年代、山谷のドヤ街。拳ひとつで成り上がるジョー" },
      { workId: "kyojin", note: "高度成長期の球界。長屋での大リーグボール養成ギプス特訓" },
      { workId: "gegege", note: "昭和の里山と路地裏には、まだ妖怪の居場所があった" },
      { workId: "chibimaruko", note: "昭和49年の清水。コタツとみかんの日本の原風景" },
      { workId: "chie", note: "昭和の大阪下町。小学生がホルモン屋を営む人情喜劇" },
    ],
  },
  {
    id: "bubble", label: "昭和末期〜バブル", span: "1975 — 1989",
    desc: "豊かになった日本。ラブコメの学園、グルメの蘊蓄、サラリーマンの出世双六。日常が物語になった。",
    works: [
      { workId: "urusei", note: "宇宙人がいても平常運転の東京郊外・友引町" },
      { workId: "touch", note: "甲子園と幼なじみ。永遠の夏の風景" },
      { workId: "oishinbo", note: "グルメブーム前夜の東京。究極vs至高" },
      { workId: "shima", note: "バブルへ向かう大企業ニッポンの出世街道" },
    ],
  },
  {
    id: "gendai", label: "平成〜令和(現代)", span: "1989 —",
    desc: "失われた30年とスマホの時代。日常系の「何も起きない幸福」から頭脳戦の緊張まで、現代は最も混沌とした舞台。",
    works: [
      { workId: "slam", note: "90年代の湘南。高校バスケ、最高の夏" },
      { workId: "sailor", note: "90年代の麻布十番。ただし前世は月、未来は30世紀の水晶東京" },
      { workId: "conan", note: "体感では30年近く続く「現代」の米花町" },
      { workId: "kaiji", note: "バブル崩壊後の借金地獄と地下労働施設" },
      { workId: "chainsaw", note: "1997年の日本。悪魔と公安デビルハンター" },
      { workId: "deathnote", note: "2003年の東京。ノートを拾った天才の6年間" },
      { workId: "azumanga", note: "2000年前後の高校。日常系の原点" },
      { workId: "ginsaji", note: "現代の北海道農業高校。食と命の授業" },
      { workId: "barakamon", note: "現代の五島列島。スローライフと書道" },
      { workId: "sololeveling", note: "ゲートが出現した現代ソウル" },
      { workId: "wani", note: "SNS時代の東京。何気ない100日間" },
    ],
  },
  {
    id: "kinmirai", label: "近未来", span: "20XX年",
    desc: "「ちょっと先の未来」はSFマンガの主戦場。描かれた未来を現実が追い越していくのもマンガ史の醍醐味。",
    works: [
      { workId: "tetsuwan", note: "アトム誕生は2003年4月7日。かつての未来、いまや過去" },
      { workId: "akira", note: "2019年ネオ東京、翌年に東京オリンピック開催予定…だった" },
    ],
  },
  {
    id: "fantasy", label: "架空世界・異世界", span: "時間軸の外",
    desc: "地図にも年表にも載らない世界。90年代以降、マンガの主舞台は現実からどんどん自由になっていった。",
    works: [
      { workId: "onepiece", note: "大海賊時代。偉大なる航路を東へ" },
      { workId: "dragonball", note: "地球…のはずだが恐竜もカプセルハウスもある世界" },
      { workId: "hokuto", note: "199X年、核の炎に包まれた世紀末" },
      { workId: "shingeki", note: "三重の壁に囲まれた、巨人が支配する世界" },
      { workId: "tensura", note: "転生先のジュラ大森林。スライム、国を作る" },
      { workId: "fma", note: "錬金術が科学として発達したもう一つの世界" },
      { workId: "berserk", note: "使徒と烙印が支配する暗黒の中世風世界" },
      { workId: "frieren", note: "魔王討伐後、長命のエルフが旅を続ける剣と魔法の世界" },
      { workId: "dai", note: "『ドラゴンクエスト』の勇者と魔王の世界" },
    ],
  },
];

// ================= 世界史ズームタイムライン(地域×物語内年代) =================
// 時代設定マップで使用。year は物語の舞台となる年(紀元前は負数)。
// fantasy(架空・異世界)の year は時間軸の外に並べるための擬似値。

export interface TimelineRegion {
  id: string;
  name: string;
  color: string;
}

export const TL_REGIONS: TimelineRegion[] = [
  { id: "japan", name: "日本", color: "#d43d2e" },
  { id: "asia", name: "中国・アジア", color: "#d97706" },
  { id: "europe", name: "ヨーロッパ", color: "#2563eb" },
  { id: "world", name: "アメリカ・世界", color: "#0891b2" },
  { id: "future", name: "未来・宇宙", color: "#7c3aed" },
  { id: "fantasy", name: "架空・異世界", color: "#db2777" },
];

export interface TimelineEntry {
  workId: string;
  region: string;
  year: number; // 物語内の年(fantasyは擬似値)
  label: string; // 表示用の時代ラベル
  note: string;
}

export const TIMELINE: TimelineEntry[] = [
  // ---- 日本 ----
  { workId: "chojugiga", region: "japan", year: 1150, label: "平安時代末期", note: "兎と蛙が相撲をとる、墨線だけの戯画絵巻" },
  { workId: "hokusai", region: "japan", year: 1814, label: "江戸後期(文化年間)", note: "北斎が描いた約4000点の素描。「漫画」の語を広めた絵手本" },
  { workId: "vagabond", region: "japan", year: 1600, label: "1600年頃(関ヶ原直後)", note: "無双を目指す宮本武蔵の求道" },
  { workId: "kamui", region: "japan", year: 1645, label: "江戸初期", note: "忍者カムイと身分社会の大河劇画" },
  { workId: "ooku", region: "japan", year: 1716, label: "江戸中期", note: "男女逆転の江戸城大奥" },
  { workId: "rurouni", region: "japan", year: 1878, label: "明治11年", note: "人斬りの過去を背負う流浪人" },
  { workId: "goldenkamuy", region: "japan", year: 1907, label: "明治末期", note: "北海道で金塊を追う。アイヌ文化と狩猟" },
  { workId: "kimetsu", region: "japan", year: 1915, label: "大正時代", note: "鬼と剣士たちの物語" },
  { workId: "norakuro", region: "japan", year: 1932, label: "昭和初期", note: "犬の軍隊で出世するのらくろ" },
  { workId: "gegege", region: "japan", year: 1960, label: "昭和30年代", note: "里山と路地裏にまだ妖怪がいた頃" },
  { workId: "kyojin", region: "japan", year: 1966, label: "昭和40年代", note: "高度成長期の球界と父子鷹" },
  { workId: "ashita", region: "japan", year: 1968, label: "昭和40年代", note: "山谷のドヤ街と泪橋" },
  { workId: "chibimaruko", region: "japan", year: 1974, label: "昭和49年", note: "静岡・清水の小学生の日常" },
  { workId: "chie", region: "japan", year: 1978, label: "昭和50年代", note: "大阪下町のホルモン屋" },
  { workId: "urusei", region: "japan", year: 1981, label: "昭和末期", note: "宇宙人がいても平常運転の友引町" },
  { workId: "touch", region: "japan", year: 1984, label: "昭和末期", note: "甲子園と幼なじみの永遠の夏" },
  { workId: "oishinbo", region: "japan", year: 1986, label: "バブル前夜", note: "究極vs至高。グルメブームの東京" },
  { workId: "slam", region: "japan", year: 1992, label: "1990年代", note: "湘南の高校バスケ、最高の夏" },
  { workId: "sailor", region: "japan", year: 1993, label: "1990年代", note: "麻布十番のセーラー戦士" },
  { workId: "conan", region: "japan", year: 1996, label: "現代(平成)", note: "体感30年続く『現代』の米花町" },
  { workId: "kaiji", region: "japan", year: 1997, label: "平成不況", note: "バブル崩壊後の借金地獄と地下労働" },
  { workId: "chainsaw", region: "japan", year: 1998, label: "1997年", note: "悪魔と公安デビルハンター" },
  { workId: "twentieth", region: "japan", year: 1999, label: "世紀末〜", note: "『ともだち』の陰謀と少年時代の記憶" },
  { workId: "jojo4", region: "japan", year: 1999, label: "架空の町・杜王町", note: "ジョジョ第4部。日常に潜む連続殺人鬼・吉良吉影" },
  { workId: "azumanga", region: "japan", year: 2001, label: "2000年代", note: "何も起きない女子高生の日常" },
  { workId: "jojo8", region: "japan", year: 2011, label: "震災後の杜王町", note: "ジョジョ第8部。記憶を失った男・定助の謎" },
  { workId: "tetsuwan", region: "japan", year: 2003, label: "2003年", note: "アトム誕生は2003年4月7日。かつての未来" },
  { workId: "deathnote", region: "japan", year: 2006, label: "2000年代", note: "ノートを拾った天才の6年間" },
  { workId: "barakamon", region: "japan", year: 2013, label: "2010年代", note: "五島列島のスローライフと書道" },
  { workId: "wani", region: "japan", year: 2019, label: "令和元年", note: "SNS時代の東京、何気ない100日間" },
  { workId: "akira", region: "japan", year: 2020, label: "2019年(作中)", note: "『近未来』として描かれたネオ東京五輪前夜" },

  // ---- 中国・アジア ----
  { workId: "hoshin", region: "asia", year: -1046, label: "紀元前11世紀", note: "殷周革命。仙人たちの封神計画" },
  { workId: "kingdom", region: "asia", year: -245, label: "紀元前3世紀", note: "秦王・嬴政の中華統一戦争" },
  { workId: "sangokushi", region: "asia", year: 220, label: "2〜3世紀(後漢末〜三国時代)", note: "劉備・曹操・孫権、天下三分の戦い" },
  { workId: "kusuriya", region: "asia", year: 750, label: "中華風王朝(唐がモデル)", note: "後宮の謎を薬学で解く猫猫" },
  { workId: "sololeveling", region: "asia", year: 2020, label: "現代", note: "ゲートが開いた現代ソウル" },

  // ---- ヨーロッパ ----
  { workId: "historie", region: "europe", year: -335, label: "紀元前4世紀", note: "アレクサンドロス大王の時代を生きる書記官" },
  { workId: "vinland", region: "europe", year: 1013, label: "11世紀", note: "ヴァイキング全盛期の北欧と英国" },
  { workId: "berubara", region: "europe", year: 1789, label: "フランス革命", note: "ヴェルサイユの薔薇、オスカルの運命" },
  { workId: "poe", region: "europe", year: 1795, label: "18世紀末〜", note: "永遠を生きる一族の200年の旅" },
  { workId: "jojo1", region: "europe", year: 1880, label: "19世紀イギリス", note: "ジョジョ第1部。石仮面とディオの因縁の始まり" },
  { workId: "kaze_ki", region: "europe", year: 1887, label: "19世紀末", note: "南仏アルルの寄宿学校" },
  { workId: "monster", region: "europe", year: 1995, label: "冷戦後", note: "統一直後のドイツを覆う連続殺人" },
  { workId: "jojo5", region: "europe", year: 2001, label: "現代イタリア", note: "ジョジョ第5部。ギャング組織で成り上がるジョルノ" },

  // ---- アメリカ・世界 ----
  { workId: "jojo7", region: "world", year: 1890, label: "19世紀末アメリカ", note: "ジョジョ第7部。遺体を巡る大陸横断レース" },
  { workId: "jojo2", region: "world", year: 1938, label: "第二次大戦前夜", note: "ジョジョ第2部。柱の男と波紋の闘い" },
  { workId: "golgo", region: "world", year: 1985, label: "冷戦〜現代", note: "世界各地が仕事場のスナイパー" },
  { workId: "jojo3", region: "world", year: 1989, label: "日本→エジプト", note: "ジョジョ第3部。DIOを追う旅、スタンド誕生" },
  { workId: "major", region: "world", year: 2005, label: "現代", note: "リトルリーグからメジャーリーグへ" },
  { workId: "jojo6", region: "world", year: 2011, label: "フロリダ", note: "ジョジョ第6部。刑務所で果てるDIOの因縁" },
  { workId: "onepunch", region: "world", year: 2015, label: "現代(架空都市)", note: "怪人だらけの都市のヒーロー稼業" },
  { workId: "jojo9", region: "world", year: 2023, label: "現代ハワイ", note: "ジョジョ第9部。大金持ちを夢見る少年" },

  // ---- 未来・宇宙 ----
  { workId: "ghost", region: "future", year: 2029, label: "2029年", note: "電脳化が進んだ近未来日本" },
  { workId: "pluto", region: "future", year: 2050, label: "近未来", note: "ロボットと人間の戦争の傷跡" },
  { workId: "planetes", region: "future", year: 2075, label: "2070年代", note: "宇宙デブリ回収船の日常" },
  { workId: "ginga999", region: "future", year: 2221, label: "遠未来", note: "銀河鉄道で機械の体を求める旅" },
  { workId: "cobra", region: "future", year: 2330, label: "遠未来", note: "宇宙海賊コブラとサイコガン" },
  { workId: "nausicaa", region: "future", year: 2400, label: "遠未来(火の7日間の後)", note: "産業文明の崩壊から1000年、腐海に覆われた地球" },

  // ---- 架空・異世界(時間軸の外) ----
  { workId: "hokuto", region: "fantasy", year: 2150, label: "199X年(世紀末世界)", note: "核の炎に包まれた荒野" },
  { workId: "dragonball", region: "fantasy", year: 2185, label: "エイジ7XX年", note: "恐竜もカプセルもある地球" },
  { workId: "onepiece", region: "fantasy", year: 2220, label: "大海賊時代", note: "偉大なる航路を東へ" },
  { workId: "shingeki", region: "fantasy", year: 2255, label: "壁の中の世界", note: "三重の壁と巨人の支配" },
  { workId: "fma", region: "fantasy", year: 2290, label: "アメストリス", note: "錬金術が発達したもう一つの世界" },
  { workId: "berserk", region: "fantasy", year: 2325, label: "暗黒中世風世界", note: "剣と因果と使徒の物語" },
  { workId: "frieren", region: "fantasy", year: 2360, label: "魔王討伐後", note: "長命のエルフが人を知る旅" },
  { workId: "tensura", region: "fantasy", year: 2395, label: "転生先の異世界", note: "ジュラ大森林でスライムが国を作る" },
];
