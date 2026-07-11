import EraView from "@/components/EraView";

export const metadata = { title: "時代設定マップ — MANGA MAP" };

export default function ErasPage() {
  return (
    <div className="page" style={{ maxWidth: 1280 }}>
      <div className="page-en">STORY ERA TIMELINE</div>
      <h1>時代設定マップ</h1>
      <p className="page-lead">
        「いつの時代の物語か」で全人類史にマンガをマッピング。紀元前のキングダムから大正の鬼滅、
        そして時間軸の外の異世界まで、時代をたどって旅してください。(PCでは地域別のズーム時間地図になります)
      </p>
      <EraView />
    </div>
  );
}
