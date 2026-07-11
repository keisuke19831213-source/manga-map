"use client";

import { useIsMobile } from "@/lib/useIsMobile";
import EraTimeline from "@/components/EraTimeline";
import EraListMobile from "@/components/EraListMobile";

// PCはズームタイムライン、スマホは縦の年表リスト
export default function EraView() {
  const isMobile = useIsMobile();
  if (isMobile === null) return <div style={{ height: "50vh" }} />;
  return isMobile ? <EraListMobile /> : <EraTimeline />;
}
