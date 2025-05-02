import './globals.css';

export const metadata = {
    title: "Calendrier de MJ Musa",
    description: "Le calendrier des matchs de Musa.",
    icons: {
        icon: "/favicon.ico", // Pour le favicon par défaut
        shortcut: "/favicon.ico", // Pour les navigateurs type iOS
        apple: "/apple-touch-icon.png", // iPhone/iPad
    },
    openGraph: {
      title: "Calendrier de MJ Musa",
      description: "Le calendrier des matchs de Musa.",
      url: "mj-musa-schedule.vercel.app/",
      siteName: "MJ Musa Schedule",
      images: [
        {
          url: "mj-musa-schedule.vercel.app/preview.jpg", // Mets une image propre ici !
          width: 1200,
          height: 630,
          alt: "MJ Musa Schedule",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image", // ✅ Correction ici
      title: "Calendrier de MJ Musa",
      description: "Le calendrier des matchs de Musa.",
      images: ["mj-musa-schedule.vercel.app/preview.jpg"], // Même image que Open Graph
    },
  };
  



export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
      <html lang="fr">
          <body className="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-white">
          <header className="bg-gradient-to-r from-orange-900 to-orange-950
 text-white p-8 text-4xl font-extrabold text-center shadow-md">
    MATCH DE MJ
</header>
              <main className="container mx-auto mt-4">{children}</main>
          </body>
      </html>
  );
}
