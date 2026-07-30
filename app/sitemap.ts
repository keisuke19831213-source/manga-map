import type { MetadataRoute } from "next";
import { GENRES, WORKS } from "@/lib/data";
import { EMOTIONS } from "@/lib/emotions";

const SITE = "https://manga-map.jp";

// 日英の両方を出し、各URLに hreflang の相互参照をつける
// （英語版は /en を前置きするだけなので、機械的に対にできる）
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    "/atlas",
    "/eras",
    "/works",
    "/feels",
    "/history",
    "/community",
    "/about",
    ...GENRES.map((g) => `/g/${g.id}`),
    ...WORKS.map((w) => `/works/${w.id}`),
    ...EMOTIONS.map((e) => `/feels/${e.id}`),
  ];

  return paths.flatMap((p) => {
    const ja = `${SITE}${p}`;
    const en = `${SITE}/en${p === "/" ? "" : p}`;
    const languages = { ja, en };
    const priority = p === "/" ? 1 : p.startsWith("/g/") ? 0.8 : 0.6;
    return [
      { url: ja, priority, alternates: { languages } },
      { url: en, priority: priority * 0.9, alternates: { languages } },
    ];
  });
}
