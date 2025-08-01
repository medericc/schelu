import './globals.css';
import { Analytics } from "@vercel/analytics/react";
import Head from 'next/head';

export const metadata = {
  title: "Calendrier de Lucile",
  description: "Le calendrier des matchs de Lucile.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Calendrier de Lucile",
    description: "Le calendrier des matchs de Lucile.",
    url: "https://mj-musa-schedule.vercel.app/",
    siteName: "Lucile Schedule",
    images: [
      {
        url: "https://mj-musa-schedule.vercel.app/preview.jpg",
        width: 1200,
        height: 630,
        alt: "Lucile Schedule",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Calendrier de Lucile",
    description: "Le calendrier des matchs de Lucile.",
    images: ["https://mj-musa-schedule.vercel.app/preview.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <Head>
        {/* Icônes pour navigateur et mobile */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ff6600" />
      </Head>
      <body className="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-white">
        <header className="bg-gradient-to-r from-red-800 to-red-900 text-white p-8 text-4xl font-extrabold text-center shadow-md">
          MATCH DE LUCILE
        </header>
        <main className="container mx-auto mt-4">{children}</main>
        <Analytics />
      </body>
    </html>
  );
}
