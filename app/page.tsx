import type { Metadata } from "next";
import LegacyPage from "@/components/LegacyPage";

export const metadata: Metadata = {
  title: "Eden International School & College",
};

export default function HomePage() {
  return <LegacyPage page="home" />;
}
