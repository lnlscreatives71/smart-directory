import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import { Phone, UserCircle, ArrowUpRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Triangle Local Hub | Raleigh, Durham & Cary Business Directory',
  description: 'The premier local business directory for the Triangle region (Raleigh, Durham, Cary, NC). Discover trusted local services and businesses.',
};

const CATEGORIES = [
  {
    label: 'Dining', href: '/category/dining',
    subcategories: [
      { label: 'Restaurants', href: '/category/restaurants' },
      { label: 'Cafés & Brunch', href: '/category/cafes' },
      { label: 'Pizza', href: '/category/pizza' },
      { label: 'Sushi', href: '/category/sushi' },
      { label: 'Bakeries', href: '/category/bakeries' },
    ],
  },
  {
    label: 'Services', href: '/category/services',
    subcategories: [
      { label: 'HVAC', href: '/category/hvac' },
      { label: 'Plumbing', href: '/category/plumbing' },
      { label: 'Real Estate', href: '/category/real-estate' },
      { label: 'Med Spa', href: '/category/med-spa' },
      { label: 'Law Firms', href: '/category/law' },
    ],
  },
  {
    label: 'More', href: '/category/all',
    subcategories: [
      { label: 'Pet Services', href: '/category/pet-services' },
      { label: 'Retail', href: '/category/retail' },
      { label: 'Health & Fitness', href: '/category/health' },
      { label: 'Beauty & Grooming', href: '/category/beauty' },
    ],
  },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col">

          {/* ── HEADER ───────────────────────────────────── */}
          <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

              {/* Logo */}
              <Link href="/" className="flex items-center shrink-0">
                <span className="text-lg font-extrabold text-gray-900 tracking-tight leading-tight">
                  Triangle<br />
                  <span className="text-red-500">Local Hub</span>
                </span>
              </Link>

              {/* Category Nav */}
              <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
                {CATEGORIES.map((cat) => (
                  <div key={cat.label} className="relative group">
                    <button className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-gray-700 hover:text-red-500 rounded-lg transition-colors whitespace-nowrap group-hover:text-red-500">
                      {cat.label}
                      <svg className="w-3.5 h-3.5 opacity-60" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" /></svg>
                    </button>
                    {/* Dropdown */}
                    <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                      {cat.subcategories.map((sub) => (
                        <Link key={sub.href} href={sub.href} className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-500 font-medium transition-colors">
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </nav>

              {/* Right actions */}
              <div className="flex items-center gap-3 shrink-0">
                <a href="tel:9195550100" className="hidden lg:flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-red-500 transition-colors">
                  <Phone size={15} />
                  (919) 555-0100
                </a>
                <Link href="/dashboard" className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-red-500 transition-colors">
                  <UserCircle size={16} />
                  Admin
                </Link>
                <Link href="/pricing" className="flex items-center gap-1.5 btn-outline px-4 py-2 text-sm whitespace-nowrap">
                  Add New Business <ArrowUpRight size={15} />
                </Link>
              </div>
            </div>
          </header>

          {/* ── BODY ─────────────────────────────────────── */}
          <main className="flex-1">
            {children}
          </main>

          {/* ── FOOTER ───────────────────────────────────── */}
          <footer style={{ backgroundColor: '#0F172A' }} className="text-white mt-0">
            <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
              <div>
                <div className="text-xl font-extrabold mb-3">
                  Triangle <span className="text-red-400">Local Hub</span>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Discover and support local businesses in Raleigh, Durham, and Cary, NC.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wider text-slate-400 mb-4">Contact</h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>📞 (919) 555-0100</li>
                  <li>📍 Raleigh, NC 27601</li>
                  <li>✉️ hello@trianglelocalhub.com</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wider text-slate-400 mb-4">Explore</h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li><Link href="/category/dining" className="hover:text-white transition">Dining</Link></li>
                  <li><Link href="/category/services" className="hover:text-white transition">Services</Link></li>
                  <li><Link href="/pricing" className="hover:text-white transition">List Your Business</Link></li>
                  <li><Link href="/dashboard" className="hover:text-white transition">Admin Dashboard</Link></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-slate-800 py-5 text-center text-xs text-slate-500">
              &copy; {new Date().getFullYear()} Triangle Local Hub. All rights reserved.
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
