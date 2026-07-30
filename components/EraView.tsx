"use client";

import EraTimeline from "@/components/EraTimeline";
import type { Lang } from "@/lib/i18n";

// PCもモバイルも同じ一枚（縦時間×横地域帯）。縦スクロールがそのまま時間旅行になる
export default function EraView({ lang = "ja" }: { lang?: Lang }) {
  return <EraTimeline lang={lang} />;
}
