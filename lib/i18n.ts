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
  // 狭い画面用の短縮名（7つの入口すべてを画面に出すため）
  "nav.map.s": ["系統図", "Genres"],
  "nav.atlas.s": ["舞台マップ", "Atlas"],
  "nav.eras.s": ["時代マップ", "Eras"],
  "nav.works.s": ["作品図鑑", "Library"],
  "nav.feels.s": ["感情", "Feeling"],
  "nav.history.s": ["年表", "Timeline"],
  "nav.community.s": ["投稿", "Posts"],
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
  "eras.hintFilterShort": ["帯名タップで地域を絞り込み", "Tap a band name to filter"],
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
  "work.file": ["作品ファイル", "Work file"],
  "lib.search": [
    "🔍 タイトル・作者でしぼり込む(かな・略称OK)",
    "🔍 Filter by title or author",
  ],
  "lib.searchAria": ["作品のしぼり込み検索", "Filter works"],
  "lib.clear": ["検索をクリア", "Clear search"],
  "lib.hits": ["件", " found"],
  "lib.all": ["すべて", "All"],
  "lib.sort": ["並び順", "Sort"],
  "lib.sort.year": ["発表年", "By year"],
  "lib.sort.kana": ["五十音", "A-Z"],
  "lib.sort.voices": ["語りの多い順", "Most talked about"],
  "lib.noneQ": [
    "に合う作品が見つかりません。かな・略称でも検索できます(例: はがれん、こち亀)。",
    "did not match any work. Try the Japanese title too.",
  ],
  "lib.none": ["該当する作品がありません。", "No works match."],

  // ---- 系統図（トップ） ----
  "tree.legend.evolution": ["直系の進化", "direct evolution"],
  "tree.legend.influence": ["影響を与えた", "influence"],
  "tree.legend.counter": ["対抗・反発から誕生", "born in reaction"],
  "tree.edge.influence": ["影響", "influence"],
  "tree.edge.counter": ["対抗・反発", "in reaction"],
  "tree.rootsGag": ["源流 → ギャグ", "Roots → Gag"],
  "tree.around": ["年頃〜", "onward"],
  "tree.readPage": ["このジャンルのページで詳しく読む →", "Read the full genre page →"],
  "tree.keyWorks": ["代表作品", "Key works"],
  "tree.roots": ["ルーツ(ここから生まれた)", "Roots — what flowed into this"],
  "tree.after": ["その後の展開(ここへ繋がる)", "What grew out of this"],
  "tree.voicesOn": ["読者の声 —", "Reader voices —"],
  "tree.listView": ["☰ リスト表示", "☰ List view"],
  "tree.treeView": ["🌳 系統図で表示", "🌳 Show the tree"],
  "tree.hintTouch": [
    "ドラッグで移動 · ピンチ/2度タップで拡大 · ●をタップ",
    "Drag to pan · pinch or double-tap to zoom · tap a dot",
  ],
  "tree.welcome": ["マンガの系統樹へようこそ", "Welcome to the manga family tree"],

  // ---- 検索 ----
  "search.aria": ["作品を検索", "Search works"],
  "search.today": ["今日のおすすめ", "Today's pick"],
  "search.none": ["見つかりませんでした", "Nothing found"],
  "search.noneHint": [
    "かな・略称でも探せます(例: はがれん、こち亀)",
    "Try the Japanese title, or a different spelling",
  ],
  "search.all": ["を作品図鑑でさがす →", "in the whole library →"],
  "search.browse": ["作品図鑑をながめる →", "Browse the library →"],
  "search.noneFor": ["に合う作品が見つかりません", "did not match any work"],

  // ---- 感情でさがす（EMOTION PHARMACY） ----
  "feels.title": ["今夜は、どんな気分?", "How are you feeling tonight?"],
  "feels.lead": [
    "読者の語りから「実際にその感情が起きたコマ」だけを集めた、マンガの処方箋。気分を選ぶと、作品と巻・ページまでピンポイントで効き目の場所が出ます。",
    "A manga prescription, made only of the panels where readers say the feeling actually happened. Pick a mood and you get the work — and the exact volume and page where it lands.",
  ],
  "feels.rx": ["処方箋", "prescriptions"],
  "feels.mixing": ["調合中…", "still mixing…"],
  "feels.none": ["この感情の処方箋は、まだ調合中です。", "Prescriptions for this feeling are still being mixed."],
  "feels.get": ["この作品を手に入れる", "Get this work"],
  "feels.dose": ["用法", "Dosage"],
  "feels.doseAll": ["作品全体", "the whole work"],

  // ---- マンガ史年表 ----
  "hist.lead": [
    "約120年のマンガ史を10の時代に分けて解説します。もっと細かい系譜は",
    "About 120 years of manga history, told in ten periods. For the finer lineage, see the",
  ],
  "hist.leadTail": ["でどうぞ。", "."],
  "hist.works": ["代表作:", "Key works:"],

  // ---- みんなの投稿 / コマ語り ----
  "posts.none": ["まだ投稿がありません。", "No posts yet."],
  "comm.title": ["みんなの投稿", "Community"],
  "tree.welcomeBody": [
    "上が1900年、下が現在。ノード(ジャンル)をクリックすると解説と代表作が出ます。線はジャンル同士の影響関係。ドラッグで移動、ホイールで拡大縮小。",
    "1900 at the top, the present at the bottom. Click a node to see its description and key works; the lines are influence between genres. Drag to pan, scroll to zoom.",
  ],
  "post.recommend": ["おすすめ", "Recommendation"],
  "post.panel": ["コマ語り", "Panel talk"],
  "loc.vol": ["巻", "Vol."],
  "loc.page": ["p.", "p."],
  "wtl.title": ["🗺 名場面タイムライン", "🗺 Timeline of great scenes"],
  "wtl.hint": ["— タップで語りへ", "— tap to read"],
  "wtl.spoiler": ["⚠️ ネタバレを含む語り — タップで読む", "⚠️ Contains spoilers — tap to read"],
  "wtl.pos": ["位置", "position "],
  "wp.panelMap": ["コマ語りマップ", "Panel-talk map"],
  "wp.panelMapSub": [
    "名場面・名ゴマをピンポイントで語る。バーは1冊の読書位置 — ●をタップするとその語りへ飛びます",
    "Talk about one exact scene or panel. The bar is your position through a volume — tap a dot to jump to that post.",
  ],
  "wp.readVol": ["この巻を読む →", "Read this volume →"],
  "wp.allRecs": ["みんなのおすすめ", "Recommendations"],
  "wp.tlSub": [
    "巻のどこで心が動いたか。●をタップするとその語りへ飛びます",
    "Where in the volumes people were moved. Tap a dot to jump to that post.",
  ],
  "feels.emptyPre": ["作品ページで「", "Once readers tag panels as "],
  "feels.emptyPost": ["」タグ付きの語りが投稿されると、ここに並びます。", " on a work page, they will appear here."],
  "feels.goLibrary": ["作品図鑑から探しにいく", "Go looking in the library"],
  "wtl.subPre": ["全", "Across all "],
  "wtl.subPost": [
    "巻のどこで心が動いたか。●をタップするとその語りへ飛びます",
    " volumes: where people were moved. Tap a dot to jump to that post.",
  ],
  "wtl.plain": ["💬 コマ語り", "💬 Panel talk"],
  "comm.lead": [
    "全作品へのおすすめとコマ語りが流れるタイムライン。名場面・名ゴマの語りを吹き出しで楽しめます。（投稿は現在、管理人が編集・公開しています）",
    "A timeline of recommendations and panel-talk across every work, shown in speech balloons. (Posts are currently reviewed and published by the site owner.)",
  ],
  "feels.back": ["← 気分をえらびなおす", "← Pick another mood"],
  "feels.detailLead1": ["。ここに並ぶのは、読者が実際に「", ". Everything here is a panel a reader actually recorded as "],
  "feels.detailLead2": ["」と記録したコマだけ —", " —"],
  "feels.detailLead3": ["巻とページまで", "with the volume and page"],
  "feels.detailLead4": ["効き目の場所つきです。", "where it takes effect."],
  "gt.more": ["詳しく ▴", "More ▴"],
  "gt.less": ["たたむ ▾", "Less ▾"],
  "gt.evolvedTo": ["進化して →", "evolved into →"],
  "gt.counterTo": ["反発されて →", "in reaction against it →"],
  "gt.counterToSuffix": ["が誕生", "was born"],
  "gt.influencedTo": ["影響を与えた →", "influenced →"],
  "gt.evolvedFrom": ["から進化", "— evolved from"],
  "gt.counterFrom": ["への反発から誕生", "— born in reaction against"],
  "gt.influencedFrom": ["の影響を受けた", "— influenced by"],
  "gl.lead": [
    "マンガのジャンルがどう生まれ、影響し合ってきたかの系譜。ジャンルをタップすると解説・代表作・つながりが開きます。(PCでは一枚のズームマップで表示されます)",
    "How manga's genres came about and influenced one another. Tap a genre to open its description, key works and connections. (On a wider screen this becomes a single zoomable map.)",
  ],
  "works.lead": [
    "マンガ史の節目となった代表作コレクション。各作品のページでは、おすすめコメントや「この巻のこのページのこのコマが凄い」というピンポイントの語りを投稿できます。",
    "A collection of the works that mark the turning points of manga history. On each work's page you can leave a recommendation — or point at one exact panel, on one page, in one volume, and say why it lands.",
  ],
};

export function t(key: string, lang: Lang): string {
  const row = UI[key];
  if (!row) return key;
  const v = lang === "en" ? row[1] : row[0];
  return v || row[0];
}
