"use client";

import Link from "next/link";
import { emotionOf } from "@/lib/emotions";
import { FeelsDetail } from "@/components/FeelsPage";
import { lp, t, type Lang } from "@/lib/i18n";
import { emotionText } from "@/lib/content-en";

// 感情別ページの器（日英共通）
export default function FeelsDetailBody({ id, lang = "ja" }: { id: string; lang?: Lang }) {
  const e = emotionOf(id);
  if (!e) return null;
  const label = emotionText(e.id, "label", e.label, lang);
  return (
    <div className="page feels-page" style={{ ["--emo" as string]: e.color }}>
      <div style={{ marginBottom: 14, fontSize: 13 }}>
        <Link href={lp(lang, "/feels")} style={{ color: "var(--ink-soft)" }}>
          {t("feels.back", lang)}
        </Link>
      </div>
      <div className="page-en">EMOTION PHARMACY</div>
      <h1>
        <span className="feels-h1-emoji">{e.emoji}</span> {emotionText(e.id, "catch", e.catch, lang)}
      </h1>
      <p className="page-lead">
        {emotionText(e.id, "night", e.night, lang)}
        {t("feels.detailLead1", lang)}
        {lang === "en" ? `"${label}"` : label}
        {t("feels.detailLead2", lang)} <strong>{t("feels.detailLead3", lang)}</strong>
        {t("feels.detailLead4", lang)}
      </p>
      <FeelsDetail emotionId={e.id} />
    </div>
  );
}
