"use client";

import Link from "next/link";
import { TIMELINE, TL_REGIONS, workById, type TimelineEntry } from "@/lib/data";
import { coverThumb } from "@/lib/affiliate";
import { useMeta } from "@/lib/useMeta";
import { useVoicesByWork } from "@/lib/usePosts";
import MiniBubble from "@/components/MiniBubble";

// 歴史イベント(縦年表に差し込む道しるべ)
const EVENTS: { year: number; label: string }[] = [
  { year: -221, label: "秦が中華統一" },
  { year: 618, label: "唐の建国" },
  { year: 793, label: "ヴァイキング時代はじまる" },
  { year: 1603, label: "江戸幕府成立" },
  { year: 1776, label: "アメリカ独立" },
  { year: 1789, label: "フランス革命" },
  { year: 1868, label: "明治維新" },
  { year: 1914, label: "第一次世界大戦" },
  { year: 1923, label: "関東大震災" },
  { year: 1945, label: "終戦" },
  { year: 1964, label: "東京五輪" },
  { year: 1969, label: "人類、月に立つ" },
  { year: 1989, label: "ベルリンの壁崩壊" },
  { year: 1991, label: "バブル崩壊" },
  { year: 2011, label: "東日本大震災" },
];

// 時代セクション
const SECTIONS: { name: string; span: string; test: (e: { year: number; region?: string }) => boolean }[] = [
  { name: "紀元前", span: "〜BC", test: (e) => e.year < 0 },
  { name: "古代〜中世", span: "0 — 1599", test: (e) => e.year >= 0 && e.year < 1600 },
  { name: "江戸時代", span: "1600 — 1867", test: (e) => e.year >= 1600 && e.year < 1868 },
  { name: "幕末・明治", span: "1868 — 1911", test: (e) => e.year >= 1868 && e.year < 1912 },
  { name: "大正", span: "1912 — 1925", test: (e) => e.year >= 1912 && e.year < 1926 },
  { name: "昭和", span: "1926 — 1988", test: (e) => e.year >= 1926 && e.year < 1989 },
  { name: "平成・令和(現代)", span: "1989 —", test: (e) => e.year >= 1989 && e.year < 2025 },
  { name: "近未来・宇宙", span: "20XX —", test: (e) => e.year >= 2025 && e.region !== "fantasy" },
  { name: "時間軸の外", span: "架空・異世界", test: (e) => e.region === "fantasy" },
];

type Item = { kind: "work"; e: TimelineEntry } | { kind: "event"; year: number; label: string };

// スマホ用: 時代設定マップの縦年表版(ネイティブスクロール=軽い)
export default function EraListMobile() {
  const meta = useMeta();
  const voices = useVoicesByWork();

  const items: Item[] = [
    ...TIMELINE.map((e) => ({ kind: "work" as const, e })),
    ...EVENTS.map((ev) => ({ kind: "event" as const, ...ev })),
  ].sort((a, b) => (a.kind === "work" ? a.e.year : a.year) - (b.kind === "work" ? b.e.year : b.year));

  const sections = SECTIONS.map((sec) => ({
    ...sec,
    items: items.filter((it) => {
      const y = it.kind === "work" ? it.e.year : it.year;
      const region = it.kind === "work" ? it.e.region : undefined;
      // 架空作品は専用セクションのみ、イベントは各時代へ
      if (it.kind === "work" && it.e.region === "fantasy") return sec.name === "時間軸の外";
      if (sec.name === "時間軸の外") return false;
      return sec.test({ year: y, region });
    }),
  })).filter((sec) => sec.items.length > 0 || sec.name === "時間軸の外");

  // 架空セクションの中身
  const fantasyItems = items.filter((it) => it.kind === "work" && it.e.region === "fantasy");

  const yearLabel = (e: TimelineEntry) => (e.region === "fantasy" ? "—" : e.year < 0 ? `BC${-e.year}` : `${e.year}`);

  return (
    <div className="era-vertical">
      {sections.map((sec) => {
        const list = sec.name === "時間軸の外" ? fantasyItems : sec.items;
        if (list.length === 0) return null;
        return (
          <section key={sec.name} style={{ marginBottom: 8 }}>
            <div className="era-v-head">
              <span className="n">{sec.name}</span>
              <span className="s">{sec.span}</span>
            </div>
            <div className="era-v-line">
              {list.map((it, idx) => {
                if (it.kind === "event") {
                  return (
                    <div key={`ev-${it.label}`} className="era-v-event">
                      <span className="d" />
                      {it.year < 0 ? `BC${-it.year}` : it.year} {it.label}
                    </div>
                  );
                }
                const e = it.e;
                const wk = workById(e.workId);
                if (!wk) return null;
                const region = TL_REGIONS.find((r) => r.id === e.region);
                const cover = coverThumb(meta, wk.id);
                return (
                  <div key={`${e.region}-${e.workId}-${idx}`} className="era-v-card">
                    <span className="dot" style={{ background: region?.color }} />
                    <Link href={`/works/${wk.id}`} className="era-v-inner">
                      {cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={cover} alt={wk.title} loading="lazy" />
                      ) : (
                        <span className="ph">📖</span>
                      )}
                      <span className="body">
                        <span className="meta-row">
                          <span className="y" style={{ borderColor: region?.color, color: region?.color }}>
                            {yearLabel(e)}
                          </span>
                          <span className="r" style={{ background: region?.color }}>
                            {region?.name}
                          </span>
                          {voices[wk.id] && <span className="cbadge">💬 {voices[wk.id].count}</span>}
                        </span>
                        <span className="t">{wk.title}</span>
                        <span className="l">{e.label} — {e.note}</span>
                      </span>
                    </Link>
                    {voices[wk.id]?.latest && (
                      <div style={{ marginLeft: 26 }}>
                        <MiniBubble post={voices[wk.id].latest!} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
