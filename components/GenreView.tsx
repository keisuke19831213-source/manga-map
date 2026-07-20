"use client";

import { useState } from "react";
import { useIsMobile } from "@/lib/useIsMobile";
import MangaMap from "@/components/MangaMap";
import GenreListMobile from "@/components/GenreListMobile";
import GenreTreeMobile from "@/components/GenreTreeMobile";

// PCはズームマップ。スマホは系統図(神マップ方式の円ノード)をデフォルトに、
// 一覧で読みたい人向けにリスト表示へも切替できる
export default function GenreView() {
  const isMobile = useIsMobile();
  const [mobileMode, setMobileMode] = useState<"tree" | "list">("tree");
  if (isMobile === null) return <div style={{ height: "60vh" }} />;
  if (!isMobile) return <MangaMap />;
  return mobileMode === "tree" ? (
    <GenreTreeMobile onSwitchList={() => setMobileMode("list")} />
  ) : (
    <>
      <button className="gt-list-btn" style={{ marginBottom: 14 }} onClick={() => setMobileMode("tree")}>
        🌳 系統図で表示
      </button>
      <GenreListMobile />
    </>
  );
}
