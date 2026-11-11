import type { Metadata } from "next";
import LegacyPage from "@/components/LegacyPage";

export const metadata: Metadata = {
  title: "Faculty - Eden International School & College",
};

export default function FacultyPage() {
  return <LegacyPage page="faculty" />;
}
