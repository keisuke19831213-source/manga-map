import AdminPanel from "@/components/AdminPanel";

export const metadata = { title: "管理画面 — MANGA MAP" };

export default function AdminPage() {
  return (
    <div className="page">
      <div className="page-en">ADMIN</div>
      <h1>管理画面</h1>
      <p className="page-lead">
        各作品の書影とAmazonアフィリエイトリンクを設定します。<strong>ASINを入れるだけ</strong>で、
        書影とアフィリエイトリンク(トラッキングID付き)が全ページに自動反映されます。
        <br />
        ※保存先は <code>data/works-meta.json</code>。本番サイトへは、保存後に <code>git push</code>(自動デプロイ)で公開されます。
      </p>
      <AdminPanel />
    </div>
  );
}
