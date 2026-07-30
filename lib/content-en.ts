// コンテンツ（ジャンル解説・地名・時代ラベル…）の英語版アクセサ。
// 方針は i18n.ts と同じ：**英語が無ければ日本語をそのまま返す**（フォールバック）。
// 訳が入った項目から順に英語になるので、「全部訳し終えてから公開」でなくてよい。

import EN from "@/data/content.en.json";
import type { Category, GenreNode, MapSpot, TimelineRegion, TimelineEntry, Work } from "@/lib/data";
import type { Lang } from "@/lib/i18n";

type Bag = Record<string, string | undefined>;
type EnFile = {
  cats?: Record<string, Bag>;
  regions?: Record<string, Bag>;
  genres?: Record<string, Bag>;
  works?: Record<string, Bag>;
  spots?: Record<string, { place?: string; notes?: Record<string, string> }>;
  timeline?: Record<string, Bag>;
};

const en = EN as EnFile;

const pick = (v: string | undefined, ja: string) => (v && v.trim() ? v : ja);

/** その項目に英訳が入っているか（未訳の注意書きを出すかの判断に使う） */
export function hasEnGenre(g: GenreNode): boolean {
  return Boolean(en.genres?.[g.id]?.desc?.trim());
}

export function catName(c: Category, lang: Lang): string {
  return lang === "en" ? pick(en.cats?.[c.id]?.name, c.name) : c.name;
}

export function catBlurb(c: Category, lang: Lang): string {
  return lang === "en" ? pick(en.cats?.[c.id]?.blurb, c.blurb) : c.blurb;
}

export function regionName(r: TimelineRegion, lang: Lang): string {
  return lang === "en" ? pick(en.regions?.[r.id]?.name, r.name) : r.name;
}

export function genreName(g: GenreNode, lang: Lang): string {
  // 英語では en フィールド（英語名）を正とし、訳語があればそれを優先
  return lang === "en" ? pick(en.genres?.[g.id]?.name, g.en || g.name) : g.name;
}

export function genreDesc(g: GenreNode, lang: Lang): string {
  return lang === "en" ? pick(en.genres?.[g.id]?.desc, g.desc) : g.desc;
}

export function workTitle(w: Work, lang: Lang): string {
  return lang === "en" ? pick(en.works?.[w.id]?.title, w.title) : w.title;
}

export function workDesc(w: Work, lang: Lang): string {
  return lang === "en" ? pick(en.works?.[w.id]?.desc, w.desc) : w.desc;
}

export function spotPlace(s: MapSpot, lang: Lang): string {
  return lang === "en" ? pick(en.spots?.[s.id]?.place, s.place) : s.place;
}

export function spotNote(s: MapSpot, workId: string, lang: Lang): string {
  const ja = s.works.find((w) => w.workId === workId)?.note ?? "";
  return lang === "en" ? pick(en.spots?.[s.id]?.notes?.[workId], ja) : ja;
}

const tlKey = (e: TimelineEntry) => `${e.region}:${e.workId}`;

export function tlLabel(e: TimelineEntry, lang: Lang): string {
  return lang === "en" ? pick(en.timeline?.[tlKey(e)]?.label, e.label) : e.label;
}

export function tlNote(e: TimelineEntry, lang: Lang): string {
  return lang === "en" ? pick(en.timeline?.[tlKey(e)]?.note, e.note) : e.note;
}
