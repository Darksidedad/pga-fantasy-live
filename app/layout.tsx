import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Fantasy PGA",
  description: "Live fantasy PGA leaderboard",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
