import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F9FC" },
    { media: "(prefers-color-scheme: dark)", color: "#111827" },
  ],
};

export const metadata: Metadata = {
  title: "BodyGenius AI - Персональный AI-тренер",
  description: "AI-приложение для персональных тренировок и питания. Генерация планов тренировок, рацион питания, еженедельная адаптация по прогрессу.",
  keywords: ["фитнес", "тренировки", "питание", "AI", "персональный тренер", "похудение", "набор мышц", "BodyGenius"],
  authors: [{ name: "BodyGenius AI Team" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "BodyGenius AI - Персональный AI-тренер",
    description: "AI-приложение для персональных тренировок и питания",
    type: "website",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Preload first exercise video for faster initial load */}
        <link rel="preload" href="/videos/1.mp4" as="video" type="video/mp4" />
        <link rel="preload" href="/videos/2.mp4" as="video" type="video/mp4" />
        <link rel="preload" href="/videos/3.mp4" as="video" type="video/mp4" />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
