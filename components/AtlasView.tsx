"use client";

import AtlasMap from "@/components/AtlasMap";
import type { Lang } from "@/lib/i18n";

// PCもモバイルも同じ一枚のマップ（リストへ逃げない＝音楽マップの掟）
export default function AtlasView({ lang = "ja" }: { lang?: Lang }) {
  return <AtlasMap lang={lang} />;
}
