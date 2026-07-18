import type { Metadata } from "next";
import { FeelsHome } from "@/components/FeelsPage";

export const metadata: Metadata = {
  title: "感情でさがす — MANGA MAP",
  description: "泣きたい夜に、開く。読者の実測データから「その感情が起きたコマ」だけを集めた、マンガの処方箋。",
};

export default function FeelsIndexPage() {
  return (
    <div className="page">
      <div className="page-en">EMOTION PHARMACY</div>
      <h1>今夜は、どんな気分?</h1>
      <p className="page-lead">
        読者の語りから「実際にその感情が起きたコマ」だけを集めた、マンガの処方箋。
        気分を選ぶと、作品と<strong>巻・ページまで</strong>ピンポイントで効き目の場所が出ます。
      </p>
      <FeelsHome />
    </div>
  );
}
