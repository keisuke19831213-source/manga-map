"use client";

import { Suspense } from "react";
import WorksExplorer from "@/components/WorksExplorer";
import { t, type Lang } from "@/lib/i18n";

// 作品図鑑の本体（日英共通）。中身は content.en.json のフォールバックに従う
export default function WorksPageBody({ lang = "ja" }: { lang?: Lang }) {
  return (
    <div className="page">
      <div className="page-en">WORKS ARCHIVE</div>
      <h1>{t("nav.works", lang)}</h1>
      <p className="page-lead">{t("works.lead", lang)}</p>
      {/* useSearchParams(?q=)を使うクライアント側はSuspense境界が必要 */}
      <Suspense>
        <WorksExplorer lang={lang} />
      </Suspense>
    </div>
  );
}
