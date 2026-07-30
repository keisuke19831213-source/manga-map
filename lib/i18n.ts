// 日英の切り替え。神マップ→音楽マップ→アニメマップで3回実証済みの方式にそろえる：
//   ・UI文字列はこのファイルの表
//   ・コンテンツ（ジャンル解説・聖地メモなど）は data/*.en.json 側
//   ・**英語が無ければ日本語をそのまま出す**（フォールバック）
// フォールバックがあるので「全部訳し終えてから公開」でなくてよい。訳せたところから英語になる。

export type Lang = "ja" | "en";

/** パスの先頭が /en なら英語 */
export function langFromPath(pathname: string): Lang {
  return /^\/en(\/|$)/.test(pathname) ? "en" : "ja";
}

/** 言語を変えたときの行き先（いまの場所を保ったまま言語だけ変える） */
export function pathForLang(lang: Lang, pathname: string): string {
  const bare = pathname.replace(/^\/en(?=\/|$)/, "") || "/";
  return lang === "en" ? (bare === "/" ? "/en" : `/en${bare}`) : bare;
}

/** 言語つきのリンク先を作る。ja はそのまま、en は /en を前置き */
export function lp(lang: Lang, path: string): string {
  if (lang === "ja") return path;
  return path === "/" ? "/en" : `/en${path}`;
}

type Dict = Record<string, [string, string]>; // [ja, en]

const UI: Dict = {
  // ---- サイト全体 ----
  tagline: ["マンガの歴史とジャンルの進化マップ", "A Map of Manga History & Genres"],
  "nav.map": ["ジャンル系統図", "Genre Tree"],
  "nav.atlas": ["舞台マップ", "Setting Atlas"],
  "nav.eras": ["時代設定マップ", "Story Eras"],
  "nav.works": ["作品図鑑", "Library"],
  "nav.feels": ["感情でさがす", "By Feeling"],
  "nav.history": ["マンガ史年表", "Timeline"],
  "nav.community": ["みんなの投稿", "Community"],
  "nav.about": ["このサイトについて", "About"],
  search: ["作品・作者をさがす", "Search works & authors"],
  "lang.toJa": ["日本語", "日本語"],
  "lang.toEn": ["English", "English"],
  footerNote: [
    "MANGA MAP — マンガの歴史とジャンルの進化を可視化するプロジェクト",
    "MANGA MAP — visualizing the history and evolution of manga",
  ],
  amazonNote: [
    "Amazonのアソシエイトとして、当サイトは適格販売により収入を得ています。",
    "As an Amazon Associate, this site earns from qualifying purchases.",
  ],

  // ---- 地図の操作 ----
  "cam.whole": ["全体", "All"],
  "cam.home": ["いまの場所へ", "Recenter"],
  "cam.zoomIn": ["拡大", "Zoom in"],
  "cam.zoomOut": ["縮小", "Zoom out"],
  "hint.pc": [
    "ドラッグで移動 / ホイールで拡大縮小 / クリックで詳細",
    "Drag to pan / scroll to zoom / click for details",
  ],
  "hint.touch": [
    "指でなぞって移動 / ピンチで拡大 / タップで詳細",
    "Drag to pan / pinch to zoom / tap for details",
  ],
  legend: ["凡例", "Legend"],
  close: ["閉じる", "Close"],
  loading: ["読み込み中…", "Loading…"],

  // ---- 舞台マップ ----
  "atlas.title": ["舞台マップ", "Setting Atlas"],
  "atlas.en": ["SEICHI ATLAS", "SEICHI ATLAS"],
  "atlas.lead": [
    "名作マンガの舞台を日本地図・世界地図にマッピング。湘南のバスケコートからヴェルサイユ宮殿、そして地図の外の異世界まで──「聖地」を旅するように作品と出会えます。",
    "The real places behind great manga, mapped across Japan and the world — from a basketball court in Shonan to the palace of Versailles, and even the worlds that fall off the map.",
  ],
  "atlas.japan": ["日本地図", "Japan"],
  "atlas.world": ["世界地図", "World"],
  "atlas.welcome": ["マンガの聖地を旅する", "Travel the sacred sites of manga"],
  "atlas.welcomeBody": [
    "地図の点がマンガの舞台。寄ると書影になり、作品名が出ます。重なった点は束──タップするとズームしてほどけます。",
    "Each dot is a place where a manga is set. Zoom in and the dots become book covers with titles. Overlapping dots form a bundle — tap it to zoom in and unbundle.",
  ],
  "atlas.spots": ["聖地の一覧", "All places"],
  "atlas.bundle": ["つの舞台が重なっています", "settings overlap here"],
  "atlas.bundleHint": ["タップでズームしてほどく", "Tap to zoom in and unbundle"],
  "atlas.works": ["作品", "works"],
  "atlas.others": ["ほか", "and more"],
  "atlas.region.hokkaido": ["北海道・東北", "Hokkaido & Tohoku"],
  "atlas.region.kanto": ["関東", "Kanto"],
  "atlas.region.chubu": ["中部", "Chubu"],
  "atlas.region.kansai": ["関西", "Kansai"],
  "atlas.region.west": ["中国・四国・九州", "West Japan"],
  "atlas.region.world": ["世界", "World"],

  // ---- 時代設定マップ ----
  "eras.title": ["時代設定マップ", "Story Era Map"],
  "eras.en": ["STORY ERA TIMELINE", "STORY ERA TIMELINE"],
  "eras.lead": [
    "「いつの時代の物語か」で全人類史にマンガをマッピング。紀元前のキングダムから大正の鬼滅、そして時間軸の外の異世界まで、時代をたどって旅してください。",
    "Manga mapped onto human history by when the story takes place — from the Warring States of Kingdom to Taisho-era Demon Slayer, and out past time itself into other worlds.",
  ],
  "eras.welcome": ["物語の中の時代で旅する", "Travel by the era inside the story"],
  "eras.welcomeBody": [
    "発表年ではなく「物語の舞台の年代」で並べた地図です。縦が時間、横が地域。上から下へ、紀元前から未来へ流れています。",
    "Not the year it was published — the year the story is set. Time runs top to bottom, regions left to right, from antiquity down into the future.",
  ],
  "eras.regionAll": ["すべて", "All"],
  "eras.published": ["年発表", "published"],
  "eras.timelineOf": ["のタイムライン", " timeline"],
  "eras.outsideTime": ["ここから先は時間軸の外（架空・異世界）", "Beyond here, time no longer applies"],
  "eras.fantasyChip": ["時間外", "No era"],
  "eras.voices": ["読者の声", "Reader voices"],
  "eras.hintFilter": [
    "上の帯の名前をタップで地域を絞り込み / ドラッグで時間を旅する",
    "Tap a band name to filter by region / drag to travel through time",
  ],

  // ---- ジャンルページ ----
  "genre.backToMap": ["← 系統図へ戻る", "← Back to the genre tree"],
  "genre.showOnMap": ["系統図のこの場所へ", "Find this on the tree"],
  "genre.desc": ["どんなジャンルか", "What this genre is"],
  "genre.rel": ["つながり", "Connections"],
  "genre.relNote": [
    "線の種類は3つ。直系の進化／影響を与えた／対抗・反発から誕生。",
    "Three kinds of line: direct evolution, influence, and born in reaction against.",
  ],
  "genre.upstream": ["ここへ流れ込んだもの", "Flowed into this"],
  "genre.downstream": ["ここから生まれたもの", "Grew out of this"],
  "genre.works": ["代表作", "Key works"],
  "genre.worksNone": ["この節目となる作品はまだ登録されていません。", "No key works recorded here yet."],
  "genre.walk": ["帯を歩く", "Walk the band"],
  "genre.walkNote": [
    "同じ帯のジャンルを年の順に並べています。いまいるのは色のついたところ。",
    "Genres in the same band, in order of year. You are at the highlighted one.",
  ],
  "genre.here": ["いまここ", "you are here"],
  "genre.sources": ["この記事について", "About this entry"],
  "genre.notFound": ["このジャンルは見つかりませんでした。", "That genre could not be found."],
  "genre.year": ["はじまり", "Beginnings"],
  "genre.band": ["帯", "Band"],
  "genre.all": ["ジャンル一覧", "All genres"],
  "genre.untranslated": [
    "",
    "This entry is not translated yet — showing the original Japanese.",
  ],
  "edge.evolution": ["直系の進化", "direct evolution"],
  "edge.influence": ["影響を与えた", "influence"],
  "edge.counter": ["対抗・反発から誕生", "born in reaction"],

  // ---- 作品まわり（共通の断片） ----
  "work.author": ["作者", "Author"],
  "work.magazine": ["掲載", "Magazine"],
  "work.buy": ["Amazonで見る", "View on Amazon"],
  "work.comments": ["件のコメント", "comments"],
  "work.detail": ["作品ページへ", "Open work page"],
};

export function t(key: string, lang: Lang): string {
  const row = UI[key];
  if (!row) return key;
  const v = lang === "en" ? row[1] : row[0];
  return v || row[0];
}
