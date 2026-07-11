"use client";

import { useIsMobile } from "@/lib/useIsMobile";
import AtlasMap from "@/components/AtlasMap";
import AtlasMobile from "@/components/AtlasMobile";

// PCはズーム地図、スマホは静的地図+聖地カードリスト
export default function AtlasView() {
  const isMobile = useIsMobile();
  if (isMobile === null) return <div style={{ height: "50vh" }} />;
  return isMobile ? <AtlasMobile /> : <AtlasMap />;
}
