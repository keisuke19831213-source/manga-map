import EraView from "@/components/EraView";

export const metadata = { title: "時代設定マップ — MANGA MAP" };

export default function ErasPage() {
  return (
    <div className="page" style={{ maxWidth: 1280 }}>
      <div className="page-en">STORY ERA TIMELINE</div>
      <h1>時代設定マップ</h1>
      <p className="page-lead">
        「いつの時代の物語か」で全人類史にマンガをマッピング。日本・中国・ヨーロッパなど地域別のタイムラインから、
        引き出し線で書影がつながります。紀元前のキングダムから時間軸の外の異世界まで、ズームして旅してください。
      </p>
      <EraView />
    </div>
  );
}
