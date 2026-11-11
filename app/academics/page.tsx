import type { Metadata } from "next";
import LegacyPage from "@/components/LegacyPage";

export const metadata: Metadata = {
  title: "Academics - Eden International School & College",
};

export default function AcademicsPage() {
  return <LegacyPage page="academics" />;
}
