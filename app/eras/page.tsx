import EraView from "@/components/EraView";

export const metadata = { title: "時代設定マップ — MANGA MAP" };

// ページ全体がマップ（見出しと説明はマップ上のオーバーレイに置いた）
export default function ErasPage() {
  return <EraView lang="ja" />;
}
