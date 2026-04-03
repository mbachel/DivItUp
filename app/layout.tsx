import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hearth & Habit - The Living Canvas",
  description: "Household management dashboard for roommates",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body>{children}</body>
    </html>
  );
}
