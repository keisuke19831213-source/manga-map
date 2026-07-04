import CommunityBoard from "@/components/CommunityBoard";

export const metadata = { title: "みんなの投稿 — MANGA MAP" };

export default function CommunityPage() {
  return (
    <div className="page">
      <div className="page-en">READERS&apos; VOICES</div>
      <h1>みんなの投稿</h1>
      <p className="page-lead">
        全作品へのおすすめとコマ語りが流れるタイムライン。名場面・名ゴマの語りを吹き出しで楽しめます。
        （投稿は現在、管理人が編集・公開しています）
      </p>
      <CommunityBoard />
    </div>
  );
}
