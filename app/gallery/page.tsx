import type { Metadata } from "next";
import LegacyPage from "@/components/LegacyPage";

export const metadata: Metadata = {
  title: "Gallery - Eden International School & College",
};

export default function GalleryPage() {
  return <LegacyPage page="gallery" />;
}
