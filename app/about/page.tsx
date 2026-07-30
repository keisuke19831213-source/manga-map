import type { Metadata } from "next";
import AboutBody from "@/components/AboutBody";

export const metadata: Metadata = {
  title: "このサイトについて — MANGA MAP",
  description:
    "MANGA MAPの制作動機、データへの姿勢、運営者について。マンガ100年の系譜を一枚の地図で眺めたい、という願望から生まれたサイトです。",
};

export default function AboutPage() {
  return <AboutBody lang="ja" />;
}
