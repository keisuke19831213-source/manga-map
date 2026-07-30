import type { Metadata } from "next";
import FeelsHomeBody from "@/components/FeelsHomeBody";

export const metadata: Metadata = {
  title: "感情でさがす — MANGA MAP",
  description: "泣きたい夜に、開く。読者の実測データから「その感情が起きたコマ」だけを集めた、マンガの処方箋。",
};

export default function FeelsIndexPage() {
  return <FeelsHomeBody lang="ja" />;
}
