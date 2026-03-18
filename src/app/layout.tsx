import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import { Phone, UserCircle, ArrowUpRight } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { verifyLicense } from '@/lib/license';
import { getSiteSettings } from '@/lib/settings';
import { Providers } from '@/components/Providers';
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import ChatwootWidget from '@/components/ChatwootWidget';
import SalesAgent from '@/components/SalesAgent';
import LNLFooter from '@/components/LNLFooter';
import DynamicMenu from '@/components/DynamicMenu';
import MainHeader, { MainBody } from '@/components/MainHeader';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const settings = await getSiteSettings();
  return {
    title: settings.seo?.title || settings.name,
    description: settings.seo?.description || settings.description,
  };
}

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
    label: 'Retail', href: '/category/retail',
    subcategories: [
      { label: 'Clothing', href: '/category/clothing' },
      { label: 'Electronics', href: '/category/electronics' },
      { label: 'Home Goods', href: '/category/home-goods' },
    ],
  },
  {
    label: 'Health & Wellness', href: '/category/health',
    subcategories: [
      { label: 'Gyms', href: '/category/gyms' },
      { label: 'Yoga Studios', href: '/category/yoga' },
      { label: 'Massage Therapy', href: '/category/massage' },
    ],
  },
  {
    label: 'Blogs', href: '/blogs',
    subcategories: [],
  },
  {
    label: 'More', href: '#',
    subcategories: [
      { label: 'Pricing', href: '/pricing' },
      { label: 'Events', href: '/events' },
      { label: 'Jobs', href: '/jobs' },
      { label: 'News', href: '/news' },
    ],
  },
];

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const license = await verifyLicense();
  const settings = await getSiteSettings();

  if (!license.valid) {
    return (
      <html lang="en">
        <body className="bg-slate-950 flex flex-col items-center justify-center min-h-screen text-white p-4">
          <div className="glass p-10 rounded-2xl max-w-lg text-center border border-red-500/20 shadow-2xl shadow-red-500/10">
            <h1 className="text-3xl font-bold text-red-500 mb-4 bg-red-500/10 py-3 rounded-lg border border-red-500/20">License Invalid</h1>
            <p className="text-slate-300 font-medium text-lg mb-6 leading-relaxed">{license.reason}</p>
            <p className="text-sm text-slate-500 mb-4 bg-slate-900/50 p-4 rounded-xl">
              Configure <strong className="text-slate-300">NEXT_PUBLIC_LICENSE_KEY</strong> in Vercel (Project → Settings → Environment Variables), then redeploy so the key is available at build time.
            </p>
            <p className="text-xs text-slate-600">Please contact the master agency to purchase or renew a license.</p>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en" className="dark">
      <body>
        <Providers>
          <div className="min-h-screen flex flex-col">

          {/* ── HEADER ───────────────────────────────────── */}
          <MainHeader phone={settings.contact.phone} phoneRaw={settings.contact.phoneRaw} />

          {/* ── BODY ─────────────────────────────────────── */}
          <MainBody>
            {children}
          </MainBody>

          {/* ── FOOTER ───────────────────────────────────── */}
          <footer className="glass-nav relative z-10">
            <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
              <div>
                <Link href="/">
                  <img src="/triangle-hub-logo-dark.png" alt={settings.name} className="h-[46px] w-auto mb-4 drop-shadow-md" />
                </Link>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {settings.description}
                </p>
              </div>
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wider text-slate-400 mb-4">Contact & Support</h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>📞 {settings.contact.phone}</li>
                  <li>📍 {settings.contact.address}</li>
                  <li><Link href="/support" className="hover:text-white transition">Support Center</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wider text-slate-400 mb-4">Explore</h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li><Link href="/category/dining" className="hover:text-white transition">Dining</Link></li>
                  <li><Link href="/category/services" className="hover:text-white transition">Services</Link></li>
                  <li><Link href="/pricing" className="hover:text-white transition">List Your Business</Link></li>
                  <li><Link href="/login" className="hover:text-white transition">Admin Login</Link></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-slate-800 py-5 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 max-w-7xl mx-auto px-6">
              <span>&copy; {new Date().getFullYear()} {settings.name}. All rights reserved.</span>
              <div className="flex items-center gap-4 mt-2 md:mt-0">
                <Link href="/terms" className="hover:text-white transition">Terms of Service</Link>
                <Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link>
              </div>
            </div>
          </footer>
          
          {/* AI Sales Agent */}
          <SalesAgent />
          {/* LNL AI Agency Upsell Footer */}
          <LNLFooter />
        </div>
      </Providers>
      <Analytics />
      <SpeedInsights />
      <ChatwootWidget config={{
        websiteToken: process.env.NEXT_PUBLIC_CHATWOOT_TOKEN || '',
        baseUrl: process.env.NEXT_PUBLIC_CHATWOOT_URL || 'https://app.chatwoot.com'
      }} />
      </body>
    </html>
  );
}
