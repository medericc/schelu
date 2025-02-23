import './globals.css';
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
      <html lang="fr">
          <body className="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-white">
              <header className="bg-red-600 text-white p-4 text-center text-xl font-bold">
                  Match Live Stats
              </header>
              <main className="container mx-auto mt-4">{children}</main>
          </body>
      </html>
  );
}
