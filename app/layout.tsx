import "./globals.css";

export const metadata = {
  title: "PGA Fantasy",
  description: "PGA Fantasy App",
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
