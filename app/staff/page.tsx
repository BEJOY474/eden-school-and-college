import type { Metadata } from "next";
import LegacyPage from "@/components/LegacyPage";

export const metadata: Metadata = {
  title: "All Teachers",
};

export default function StaffPage() {
  return <LegacyPage page="staff" />;
}
