

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dacexy - Enterprise AI Platform",
  description: "The all-in-one AI platform for your business",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
