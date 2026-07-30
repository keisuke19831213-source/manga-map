"use client";

import CommunityBoard from "@/components/CommunityBoard";
import { t, type Lang } from "@/lib/i18n";

// みんなの投稿の器（日英共通）
export default function CommunityBody({ lang = "ja" }: { lang?: Lang }) {
  return (
    <div className="page">
      <div className="page-en">READERS&apos; VOICES</div>
      <h1>{t("comm.title", lang)}</h1>
      <p className="page-lead">{t("comm.lead", lang)}</p>
      <CommunityBoard />
    </div>
  );
}
