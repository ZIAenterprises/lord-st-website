// src/app/layout.tsx

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lord St. | Downtown Indianapolis Vacation Rental",
  description:
    "Stay at Lord St., a beautifully renovated historic two-bedroom vacation rental near Fountain Square and downtown Indianapolis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}