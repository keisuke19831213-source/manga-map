import type { Metadata } from "next";
import FeelsHomeBody from "@/components/FeelsHomeBody";

export const metadata: Metadata = {
  title: "Find manga by feeling — MANGA MAP",
  description:
    "A manga prescription made only of the panels where readers say the feeling actually happened.",
};

export default function EnFeelsIndexPage() {
  return <FeelsHomeBody lang="en" />;
}
