"use client";

import { useState } from "react";
import { useIsMobile } from "@/lib/useIsMobile";
import MangaMap from "@/components/MangaMap";
import GenreListMobile from "@/components/GenreListMobile";
import GenreTreeMobile from "@/components/GenreTreeMobile";
import { t, type Lang } from "@/lib/i18n";

// PCはズームマップ。スマホは系統図(神マップ方式の円ノード)をデフォルトに、
// 一覧で読みたい人向けにリスト表示へも切替できる
export default function GenreView({ lang = "ja" }: { lang?: Lang }) {
  const isMobile = useIsMobile();
  const [mobileMode, setMobileMode] = useState<"tree" | "list">("tree");
  if (isMobile === null) return <div style={{ height: "60vh" }} />;
  if (!isMobile) return <MangaMap lang={lang} />;
  return mobileMode === "tree" ? (
    <GenreTreeMobile lang={lang} onSwitchList={() => setMobileMode("list")} />
  ) : (
    <>
      <button className="gt-list-btn" style={{ marginBottom: 14 }} onClick={() => setMobileMode("tree")}>
        {t("tree.treeView", lang)}
      </button>
      <GenreListMobile lang={lang} />
    </>
  );
}
