import Link from "next/link";
import { notFound } from "next/navigation";
import { genreById, catOf } from "@/lib/data";
import { findWork } from "@/lib/user-works";
import { amazonLink, coverSrc } from "@/lib/affiliate";
import { readWorkMeta } from "@/lib/meta-server";
import WorkPosts from "@/components/WorkPosts";
import Cover, { AmazonButton } from "@/components/Cover";
import { lp, t, type Lang } from "@/lib/i18n";
import { magazineName, workDesc, workTitle } from "@/lib/content-en";

// 作品ページの本体（日英共通）。ページ側は薄いラッパーにして、
// Next.js の PageProps 制約（ページに余分な props を足せない）を避ける。
export default async function WorkDetailBody({
  id,
  lang = "ja",
}: {
  id: string;
  lang?: Lang;
}) {
  const work = await findWork(id);
  if (!work) notFound();

  const meta = await readWorkMeta(work.id); // この作品1件分だけ(全200作品を読まない)
  const cover = coverSrc(meta, work.id);
  const az = amazonLink(meta, work.id);

  return (
    <div className="page">
      <div style={{ marginBottom: 14, fontSize: 13 }}>
        <Link href={lp(lang, "/works")} style={{ color: "var(--ink-soft)" }}>
          ← {t("nav.works", lang)}
        </Link>
      </div>

      <div
        className="work-hero"
        data-label={t("work.file", lang)}
        style={{ display: "flex", gap: 22, flexWrap: "wrap" }}
      >
        <Cover src={cover} title={workTitle(work, lang)} width={130} />
        <div style={{ flex: "1 1 300px" }}>
          <h1>{workTitle(work, lang)}</h1>
          <div className="meta">
            {work.author} · {work.year}
            {lang === "ja" ? "年" : ""}
            {work.magazine ? ` · ${t("work.magazine", lang)}: ${magazineName(work.magazine, lang)}` : ""}
          </div>
          <p>{workDesc(work, lang)}</p>
          <div className="badges" style={{ marginBottom: az ? 14 : 0 }}>
            {work.genres.map((gid) => {
              const g = genreById(gid);
              if (!g) return null;
              const c = catOf(g).color;
              return (
                <Link
                  key={gid}
                  href={lp(lang, `/g/${gid}`)}
                  className="badge"
                  style={{ borderColor: c, color: c }}
                >
                  {lang === "en" ? `${g.en} →` : `${g.name} のジャンルページへ`}
                </Link>
              );
            })}
          </div>
          {az && <AmazonButton href={az} />}
        </div>
      </div>

      <WorkPosts workId={work.id} workTitle={workTitle(work, lang)} />
    </div>
  );
}
