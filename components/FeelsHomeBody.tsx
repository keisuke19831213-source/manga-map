"use client";

import { FeelsHome } from "@/components/FeelsPage";
import { t, type Lang } from "@/lib/i18n";

// 感情ホームの器（日英共通）
export default function FeelsHomeBody({ lang = "ja" }: { lang?: Lang }) {
  return (
    <div className="page">
      <div className="page-en">EMOTION PHARMACY</div>
      <h1>{t("feels.title", lang)}</h1>
      <p className="page-lead">{t("feels.lead", lang)}</p>
      <FeelsHome />
    </div>
  );
}
