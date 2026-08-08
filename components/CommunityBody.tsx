"use client";

import { useState } from "react";
import CommunityBoard from "@/components/CommunityBoard";
import VoicesBoard from "@/components/VoicesBoard";
import { t, type Lang } from "@/lib/i18n";

// みんなの声の器（日英共通）。
// 「このサイトの声」= 直接書かれたおすすめ・コマ語り / 「よそで生まれた声」= 外部の熱をキュレーション。
// 入口を1つに束ねる（どこに何があるか分からない、を避ける）。
export default function CommunityBody({ lang = "ja" }: { lang?: Lang }) {
  const [tab, setTab] = useState<"here" | "out">("here");

  return (
    <div className="page">
      <div className="page-en">READERS&apos; VOICES</div>
      <h1>{t("comm.title", lang)}</h1>
      <p className="page-lead">{t("comm.lead", lang)}</p>

      <div className="voice-switch">
        <button type="button" className={tab === "here" ? "on" : ""} onClick={() => setTab("here")}>
          {t("comm.tab.here", lang)}
        </button>
        <button type="button" className={tab === "out" ? "on" : ""} onClick={() => setTab("out")}>
          {t("comm.tab.out", lang)}
        </button>
      </div>

      {tab === "here" ? <CommunityBoard /> : <VoicesBoard />}
    </div>
  );
}
