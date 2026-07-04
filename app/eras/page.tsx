import Link from "next/link";
import { STORY_ERAS, workById } from "@/lib/data";

export const metadata = { title: "時代設定マップ — MANGA MAP" };

export default function ErasPage() {
  return (
    <div className="page">
      <h1>時代設定マップ</h1>
      <p className="page-lead">
        「いつの時代の物語か」でマンガを並べた歴史時系列マップ。江戸から近未来、そして時間軸の外の異世界まで。
        発表年ではなく<strong>物語の中の時代</strong>で旅する年表です。
      </p>
      <div>
        {STORY_ERAS.map((era, i) => (
          <div key={era.id}>
            {i > 0 && <div className="era-connector" aria-hidden />}
            <section className="era-block">
              <span className="era-span">{era.span}</span>
              <h2>{era.label}</h2>
              <p className="era-desc">{era.desc}</p>
              <div className="era-works">
                {era.works.map(({ workId, note }) => {
                  const w = workById(workId);
                  if (!w) return null;
                  return (
                    <Link key={workId} href={`/works/${w.id}`} className="era-work">
                      <span className="t">{w.title}</span>
                      <span className="n">{note}</span>
                    </Link>
                  );
                })}
              </div>
            </section>
          </div>
        ))}
      </div>
    </div>
  );
}
