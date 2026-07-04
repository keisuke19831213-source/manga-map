import AtlasMap from "@/components/AtlasMap";

export const metadata = { title: "舞台マップ — MANGA MAP" };

export default function AtlasPage() {
  return (
    <div className="page">
      <div className="page-en">SEICHI ATLAS</div>
      <h1>舞台マップ</h1>
      <p className="page-lead">
        名作マンガの舞台を日本地図・世界地図にマッピング。湘南のバスケコートからヴェルサイユ宮殿、
        そして地図の外の異世界まで──「聖地」を旅するように作品と出会えます。
      </p>
      <AtlasMap />
    </div>
  );
}
