import type { Metadata, Viewport } from "next";
import { Josefin_Sans, Inter, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const josefin = Josefin_Sans({
  variable: "--font-josefin",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "NGX BioAge Calculator Pro",
  description: "Descubre tu edad biológica real con precisión científica",
  metadataBase: new URL("https://example.com"),
  openGraph: {
    title: "NGX BioAge Calculator Pro",
    description: "Descubre tu edad biológica real con precisión científica",
    url: "https://example.com/bioage-calculator",
    siteName: "NGX",
    images: [
      { url: "/api/og?title=NGX%20BioAge%20Calculator", width: 1200, height: 630 },
    ],
    locale: "es_ES",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body
        className={`${josefin.variable} ${inter.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
