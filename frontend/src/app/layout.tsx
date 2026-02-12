import type { Metadata } from "next";
import { DM_Serif_Display, Sora } from "next/font/google";
import "./globals.css";
import AppProviders from "@/components/app-providers";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Bazar.com | Local Bazar Marketplace",
  description:
    "Shop local products from trusted sellers, discover nearby bazaars, and order with flexible payment options.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sora.variable} ${dmSerif.variable} antialiased`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
