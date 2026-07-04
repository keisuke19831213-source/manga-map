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
    color: "#5b9cf6",
    colX: 170,
    blurb: "劇画から生まれた大人のためのマンガ。リアリズム、社会、仕事、SF。",
  },
  {
    id: "shonen",
    name: "少年",
    color: "#f97316",
    colX: 445,
    blurb: "週刊少年誌が育てた王道。努力・友情・勝利からダークファンタジーまで。",
  },
  {
    id: "roots",
    name: "源流",
    color: "#94a3b8",
    colX: 720,
    blurb: "ポンチ絵から手塚治虫まで。すべてのマンガの出発点。",
  },
  {
    id: "gag",
    name: "ギャグ・コメディ",
    color: "#eab308",
    colX: 720,
    blurb: "赤塚不二夫が体系化した笑いの系譜。ナンセンス、不条理、日常系へ。",
  },
  {
    id: "shojo",
    name: "少女・女性",
    color: "#ec4899",
    colX: 995,
    blurb: "24年組が起こした表現革命。内面描写、ロマンス、BL、レディース。",
  },
  {
    id: "alt",
    name: "オルタナティブ",
    color: "#a78bfa",
    colX: 1270,
    blurb: "ガロとCOMに始まる実験精神。商業の外側でマンガ表現を拡張した。",
  },
  {
    id: "digital",
    name: "デジタル・新潮流",
    color: "#22d3ee",
    colX: 1500,
    blurb: "Web・スマホ・SNSが生んだ新しいマンガのかたち。",
  },
];

export const GENRES: GenreNode[] = [
  // ===== 源流 =====
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
