import type { Metadata } from "next";
import AboutBody from "@/components/AboutBody";

export const metadata: Metadata = {
  title: "About — MANGA MAP",
  description:
    "Why MANGA MAP exists, how it treats its data, and who runs it. It grew out of one wish: to look at a hundred years of manga on a single map.",
};

export default function EnAboutPage() {
  return <AboutBody lang="en" />;
}
