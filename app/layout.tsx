import './globals.css';
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
      <html lang="fr">
          <body className="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-white">
          <header className="bg-gradient-to-r from-blue-950 to-[#020617] text-white p-8 text-4xl font-extrabold text-center shadow-md">
    LIVESTATS
</header>
              <main className="container mx-auto mt-4">{children}</main>
          </body>
      </html>
  );
}
