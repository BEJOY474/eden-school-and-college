import type { Metadata } from "next";
import LegacyPage from "@/components/LegacyPage";

export const metadata: Metadata = {
  title: "Admission - Eden International School & College",
};

export default function AdmissionPage() {
  return <LegacyPage page="admission" />;
}
