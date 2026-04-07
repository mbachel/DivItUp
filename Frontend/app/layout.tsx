import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DivItUp - Household Management Dashboard",
  description: "Household management dashboard for roommates",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}