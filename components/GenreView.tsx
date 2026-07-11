"use client";

import { useIsMobile } from "@/lib/useIsMobile";
import MangaMap from "@/components/MangaMap";
import GenreListMobile from "@/components/GenreListMobile";

// PCはズームマップ、スマホは縦スクロールの系譜リスト
export default function GenreView() {
  const isMobile = useIsMobile();
  if (isMobile === null) return <div style={{ height: "60vh" }} />;
  return isMobile ? <GenreListMobile /> : <MangaMap />;
}
