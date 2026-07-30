"use client";

// ヘッダーとフッター。パスから言語を判定するので、/en/* に入るだけで
// UIが英語になる（レイアウトを二重に持たなくてよい）。
import Link from "next/link";
import { usePathname } from "next/navigation";
import SearchBox from "@/components/SearchBox";
import { langFromPath, lp, pathForLang, t } from "@/lib/i18n";

const NAV: { path: string; key: string }[] = [
  { path: "/", key: "nav.map" },
  { path: "/atlas", key: "nav.atlas" },
  { path: "/eras", key: "nav.eras" },
  { path: "/works", key: "nav.works" },
  { path: "/feels", key: "nav.feels" },
  { path: "/history", key: "nav.history" },
  { path: "/community", key: "nav.community" },
];

export function SiteHeader() {
  const pathname = usePathname() || "/";
  const lang = langFromPath(pathname);
  const other = lang === "ja" ? "en" : "ja";

  return (
    <header className="site-header">
      <Link href={lp(lang, "/")} className="site-logo">
        MANGA<span>MAP</span>
      </Link>
      <nav className="site-nav">
        {NAV.map((n) => (
          <Link key={n.path} href={lp(lang, n.path)}>
            {t(n.key, lang)}
          </Link>
        ))}
      </nav>
      <div className="site-tools">
        <SearchBox />
        <Link href={pathForLang(other, pathname)} className="lang-switch" hrefLang={other}>
          {other === "en" ? "EN" : "日本語"}
        </Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const pathname = usePathname() || "/";
  const lang = langFromPath(pathname);

  return (
    <footer className="site-footer">
      <nav className="footer-nav" aria-label={lang === "en" ? "Footer navigation" : "フッターナビ"}>
        {NAV.map((n) => (
          <Link key={n.path} href={lp(lang, n.path)}>
            {t(n.key, lang)}
          </Link>
        ))}
        <Link href={lp(lang, "/about")}>{t("nav.about", lang)}</Link>
      </nav>
      {t("footerNote", lang)}
      <br />
      {t("amazonNote", lang)}
    </footer>
  );
}
