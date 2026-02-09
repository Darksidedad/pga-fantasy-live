import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PGA Fantasy Live",
  description: "Live fantasy scoring (top 3) for PGA events"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
