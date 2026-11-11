import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eden International School & College",
  description:
    "Eden International School & College is committed to academic excellence and holistic development in Dhaka, Bangladesh.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn">
      <body>{children}</body>
    </html>
  );
}
