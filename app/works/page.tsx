import WorksExplorer from "@/components/WorksExplorer";

export const metadata = { title: "作品図鑑 — MANGA MAP" };

export default function WorksPage() {
  return (
    <div className="page">
      <div className="page-en">WORKS ARCHIVE</div>
      <h1>作品図鑑</h1>
      <p className="page-lead">
        マンガ史の節目となった代表作コレクション。各作品のページでは、おすすめコメントや
        「この巻のこのページのこのコマが凄い」というピンポイントの語りを投稿できます。
      </p>
      <WorksExplorer />
    </div>
  );
}
