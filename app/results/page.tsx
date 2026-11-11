import type { Metadata } from "next";
import LegacyPage from "@/components/LegacyPage";

export const metadata: Metadata = {
  title: "Results - Eden International School & College",
};

export default function ResultsPage() {
  return <LegacyPage page="results" />;
}
