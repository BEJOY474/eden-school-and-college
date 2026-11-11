import type { Metadata } from "next";
import LegacyPage from "@/components/LegacyPage";

export const metadata: Metadata = {
  title: "Contact Us - Eden International School & College",
};

export default function ContactPage() {
  return <LegacyPage page="contact" />;
}
