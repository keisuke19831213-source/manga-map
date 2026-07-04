import CommunityBoard from "@/components/CommunityBoard";

export const metadata = { title: "みんなの投稿 — MANGA MAP" };

export default function CommunityPage() {
  return (
    <div className="page">
      <div className="page-en">READERS&apos; VOICES</div>
      <h1>みんなの投稿</h1>
      <p className="page-lead">
        全作品へのおすすめとコマ語りが流れるタイムライン。図鑑にない作品のおすすめも、ここから自由に投稿できます。
      </p>
      <CommunityBoard />
    </div>
  );
}
