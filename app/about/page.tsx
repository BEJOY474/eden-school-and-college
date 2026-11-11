import type { Metadata } from "next";
import LegacyPage from "@/components/LegacyPage";

export const metadata: Metadata = {
  title: "About Us - Eden International School & College",
};

export default function AboutPage() {
  return <LegacyPage page="about" />;
}
