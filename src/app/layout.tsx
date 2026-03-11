import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Triangle Local Hub | Raleigh, Durham & Cary Business Directory',
  description: 'The premier local business directory for the Triangle region (Raleigh, Durham, Cary, NC). Discover trusted local services and businesses.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div id="root" className="hidden"></div>
        <div className="min-h-screen flex flex-col">
          <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500 dark:from-blue-400 dark:to-blue-300">
                  Triangle Local Hub
                </span>
              </Link>
              <nav className="hidden md:flex items-center space-x-6">
                <Link href="/category/restaurants" className="text-sm font-medium hover:text-blue-600">Restaurants</Link>
                <Link href="/category/med-spas" className="text-sm font-medium hover:text-blue-600">Med Spas</Link>
                <Link href="/category/real-estate" className="text-sm font-medium hover:text-blue-600">Real Estate</Link>
              </nav>
              <div className="flex items-center space-x-4">
                <Link href="/dashboard" className="text-sm font-medium hover:text-blue-600">Admin</Link>
                <Link href="#" className="hidden md:inline-flex btn-accent px-4 py-2 rounded-md text-sm font-medium">
                  Add Business
                </Link>
              </div>
            </div>
          </header>

          <main className="flex-1">
            {children}
          </main>

          <footer className="border-t py-8 mt-12 bg-white dark:bg-slate-900">
            <div className="container mx-auto px-4 text-center text-sm text-gray-500">
              <p>&copy; {new Date().getFullYear()} Triangle Local Hub. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
