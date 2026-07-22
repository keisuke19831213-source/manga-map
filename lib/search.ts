// 検索用の正規化・スコアリング(ヘッダー検索と作品図鑑で共通)。
//
// fold() は「1文字→1文字」の折りたたみ(全角→半角・大文字→小文字・ひらがな→カタカナ)。
// 文字数(UTF-16長)が変わらないことを保証しているので、元文字列とインデックスが一致し、
// マッチ位置のハイライトにそのまま使える。
// strip() は記号・空白も除いたゆるい比較用(「らき☆すた」→「ラキスタ」)。こちらは
// インデックスがずれるためハイライトには使わない。

export function fold(s: string): string {
  let out = "";
  for (const c of s) {
    let n = c.normalize("NFKC");
    if (n.length !== c.length) n = c; // 長さが変わる正規化(㍍→メートル等)はハイライトが壊れるので見送る
    const low = n.toLowerCase();
    if (low.length === n.length) n = low;
    // ひらがな→カタカナ (ぁ U+3041 〜 ゖ U+3096 → +0x60)
    let folded = "";
    for (let i = 0; i < n.length; i++) {
      const code = n.charCodeAt(i);
      folded += code >= 0x3041 && code <= 0x3096 ? String.fromCharCode(code + 0x60) : n[i];
    }
    out += folded;
  }
  return out;
}

const STRIP_RE = /[\s・．.。、,\-‐−–—―~〜!！?？:：;；'’"”「」『』()（）[\]【】《》＝=＋+☆★♡♥♪×]/g;

export function strip(s: string): string {
  return fold(s).replace(STRIP_RE, "");
}

// タイトルがラテン文字・略称で呼ばれる作品のかな別名。fold/stripだけでは
// 「わんぴーす」→「ONE PIECE」のような読み違いを吸収できないため、定番だけ手当て。
// 存在しないidは実行時に単に無視されるので、雑に足しても安全。
export const SEARCH_ALIASES: Record<string, string[]> = {
  onepiece: ["ワンピース", "ワンピ"],
  hxh: ["ハンターハンター", "ハンター"],
  bleach: ["ブリーチ"],
  dgray: ["ディーグレイマン", "Dグレ"],
  fma: ["ハガレン"],
  reborn: ["リボーン"],
  rurouni: ["るろ剣", "るろけん"],
  hachikuro: ["ハチクロ"],
  captsubasa: ["キャプ翼"],
  tokyoghoul: ["トーキョーグール"],
  tokyorev: ["東リベ", "東京リベンジャーズ"],
  initiald: ["イニシャルD", "イニD"],
  hero_aca: ["ヒロアカ"],
  spyfamily: ["スパイファミリー"],
  kurobas: ["黒バス"],
  slam: ["スラムダンク", "スラダン"],
  deathnote: ["デスノート", "デスノ"],
  prince_tennis: ["テニプリ"],
  goldenkamuy: ["金カム"],
  kochikame: ["こち亀"],
  fruits: ["フルバ"],
  oshinoko: ["おしのこ"],
  ghost: ["こうかく"],
  ccs: ["CCさくら"],
  gto: ["グレートティーチャーオニヅカ"],
  h2: ["エイチツー"],
  vinland: ["ヴィンランドサガ"],
  bluegiant: ["ブルージャイアント", "ブルジャイ"],
  onepunch: ["ワンパンマン"],
  drstone: ["ドクターストーン"],
  drslump: ["ドクタースランプ", "アラレちゃん"],
  monster: ["モンスター"],
  pluto: ["プルートウ", "プルート"],
  akira: ["アキラ"],
  nana: ["ナナ"],
  relife: ["リライフ"],
  major: ["メジャー"],
  yawara: ["ヤワラ"],
};

export interface SearchDoc<T> {
  item: T;
  titleF: string;
  authorF: string;
  titleS: string;
  authorS: string;
  aliasS: string[];
}

export function buildDoc<T>(item: T, title: string, author: string, aliases: string[] = []): SearchDoc<T> {
  return {
    item,
    titleF: fold(title),
    authorF: fold(author),
    titleS: strip(title),
    authorS: strip(author),
    aliasS: aliases.map(strip),
  };
}

// スコア: 小さいほど良い。-1 は不一致。
// タイトル前方一致 ≒ 別名前方一致(「はんたー」→ハンターハンター) < タイトル部分一致
// < 作者一致 < 記号無視のゆるい一致
export function scoreDoc<T>(doc: SearchDoc<T>, qF: string, qS: string): number {
  if (!qF) return -1;
  if (doc.titleF.startsWith(qF)) return 0;
  if (qS && doc.aliasS.some((a) => a.startsWith(qS))) return 0.5;
  if (doc.titleF.includes(qF)) return 1;
  if (doc.authorF.startsWith(qF)) return 2;
  if (doc.authorF.includes(qF)) return 3;
  if (qS && (doc.titleS.includes(qS) || doc.authorS.includes(qS) || doc.aliasS.some((a) => a.includes(qS)))) return 4;
  return -1;
}
