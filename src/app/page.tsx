import { sql } from '@/lib/db';
import { Listing } from '@/lib/types';
import Link from 'next/link';
import { Search, ExternalLink, Copy, Heart, Star, MapPin, ArrowUpRight } from 'lucide-react';
import BizCard from '@/components/BizCard';
import { getSiteSettings } from '@/lib/settings';

export default async function Home({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const settings = await getSiteSettings();
  const query = searchParams.q || '';

  let listings: Listing[] = [];
  try {
    if (query) {
      const q = `%${query}%`;
      listings = (await sql`
        SELECT * FROM listings 
        WHERE name ILIKE ${q} OR category ILIKE ${q} OR location_city ILIKE ${q} OR description ILIKE ${q}
        ORDER BY CASE WHEN feature_flags->>'priority_ranking' = 'true' THEN 1 ELSE 0 END DESC,
                 CASE WHEN featured = true THEN 1 ELSE 0 END DESC, rating DESC 
        LIMIT 12
      `) as Listing[];
    } else {
      listings = (await sql`
        SELECT * FROM listings 
        ORDER BY CASE WHEN feature_flags->>'priority_ranking' = 'true' THEN 1 ELSE 0 END DESC,
                 CASE WHEN featured = true THEN 1 ELSE 0 END DESC, rating DESC 
        LIMIT 12
      `) as Listing[];
    }
  } catch (err) {
    console.error('Failed to fetch listings. Please seed the database first.', err);
  }

  const featured = listings.filter(b => b.featured);
  const regular = listings.filter(b => !b.featured);

  const CATEGORY_TILES = [
    { label: 'Dining', href: '/category/dining', img: '/raliegh-coffe-shop.jpg' },
    { label: 'Services', href: '/category/services', img: '/raleighcityscape.jpg' },
    { label: 'Retail', href: '/category/retail', img: '/city-park.jpg' },
    { label: 'Med Spa', href: '/category/med-spa', img: '/med-spa.jpeg' },
    { label: 'Real Estate', href: '/category/real-estate', img: '/raleigh-capital-nc.jpg' },
    { label: 'Health & Fitness', href: '/category/health', img: '/sunset-nc.jpg' },
  ];

  return (
    <div className="flex flex-col min-h-screen">

      {/* ── HERO ─────────────────────────────────────── */}
      <section className="hero-bg flex flex-col items-center justify-center text-center px-4 py-32 relative overflow-hidden">
        {/* Top Hero Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/trianglehubcityimage.png" 
            alt={settings.hero.bannerTitle} 
            className="w-full h-full object-cover object-bottom opacity-60 mix-blend-lighten"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F19]/10 via-transparent to-[#0B0F19]/80"></div>
        </div>

        <div className="hero-glow z-0"></div>
        <div className="relative z-10 w-full flex flex-col items-center">
          <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-sm font-semibold text-primary-400">
            <Star size={14} className="fill-current" /> Premium Directory
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 drop-shadow-2xl tracking-tighter max-w-4xl">
            {settings.hero.headlineParts[0]} <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">{settings.hero.headlineParts[1]}</span>
          </h1>
          <p className="text-slate-300 text-lg md:text-xl mb-12 max-w-2xl font-medium">
            {settings.hero.subhead}
          </p>

          {/* Search Bar */}
          <form className="w-full max-w-2xl flex rounded-2xl overflow-hidden shadow-2xl h-16 glass relative border border-slate-600/50">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search by business name or tag..."
              className="flex-1 pl-14 pr-6 text-white text-lg outline-none bg-transparent placeholder:text-slate-500 w-full"
            />
            <button type="submit" className="bg-white hover:bg-gray-100 px-8 text-primary-900 text-[16px] font-bold whitespace-nowrap shrink-0 transition-colors">
              Search
            </button>
          </form>
          
          {/* Show search results count when searching */}
          {query && (
            <div className="mt-4 text-slate-300 text-sm">
              {listings.length === 0 
                ? `No results for "${query}"` 
                : `${listings.length} result${listings.length !== 1 ? 's' : ''} for "${query}"`}
            </div>
          )}
        </div>
      </section>

      {/* ── MAIN CONTENT ──────────────────────────────── */}
      <div className="flex-1 pb-20">

        {/* Search results mode */}
        {query && (
          <section className="max-w-7xl mx-auto px-4 py-10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="section-title">Results for &ldquo;{query}&rdquo;</h2>
                <p className="text-slate-400 text-sm mt-1">{listings.length} businesses found</p>
              </div>
              <Link href="/" className="text-sm text-primary-400 font-semibold hover:text-white transition-colors">Clear ×</Link>
            </div>
            {listings.length === 0 ? (
              <div className="glass rounded-3xl p-16 text-center border border-slate-700/50">
                <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-white">No businesses found</h3>
                <p className="text-slate-400 mb-6 text-lg">Try adjusting your search or browse by category below.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {listings.map(biz => <BizCard key={biz.id} biz={biz} />)}
              </div>
            )}
          </section>
        )}

        {/* Default homepage */}
        {!query && (
          <>
            {/* ── Featured Listings ─────────────────────── */}
            {featured.length > 0 && (
              <section className="max-w-7xl mx-auto px-4 pt-10 pb-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="section-title">Discover Our Featured Listings</h2>
                  <Link href="/?featured=1" className="section-see-all">
                    See All Featured Listings <ArrowUpRight size={15} />
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {featured.slice(0, 4).map(biz => <BizCard key={biz.id} biz={biz} showFeatured />)}
                </div>
              </section>
            )}

            {/* ── Businesses by Tags (Category Tiles) ───── */}
            <section className="max-w-7xl mx-auto px-4 py-16">
              <div className="flex items-center justify-between mb-8">
                <h2 className="section-title">Browse by Category</h2>
                <Link href="/category/all" className="section-see-all">
                  See All <ArrowUpRight size={15} />
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
                {CATEGORY_TILES.map(cat => (
                  <Link key={cat.label} href={cat.href} className="cat-tile block group">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary-600/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 mix-blend-overlay"></div>
                      <img
                        src={cat.img}
                        alt={cat.label}
                        className="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-black/90 to-transparent flex items-end p-4 z-20">
                        <span className="text-white font-extrabold text-[15px] tracking-wide relative">
                          {cat.label}
                          <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-500 group-hover:w-full transition-all duration-300"></div>
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* ── All Listings ───────────────────────────── */}
            {regular.length > 0 && (
              <section className="max-w-7xl mx-auto px-4 py-6 pb-14">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="section-title">Local Businesses in {settings.locations.primaryRegion}</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {regular.slice(0, 8).map(biz => <BizCard key={biz.id} biz={biz} />)}
                </div>
              </section>
            )}

            {/* Empty state */}
            {listings.length === 0 && (
              <section className="max-w-7xl mx-auto px-4 py-20 text-center">
                <div className="glass rounded-3xl p-16 border border-slate-700/50">
                  <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                     <Search className="h-10 w-10 text-slate-400" />
                  </div>
                  <h3 className="text-3xl font-extrabold mb-3 text-white">No listings yet</h3>
                  <p className="text-slate-400 mb-8 text-lg max-w-md mx-auto">
                    Visit <Link href="/api/seed" className="text-primary-400 font-bold hover:text-primary-300 transition-colors">/api/seed</Link> to seed the database first, or start adding businesses manually.
                  </p>
                  <Link href="/dashboard/listings/new" className="inline-flex items-center gap-2 btn-primary px-8 py-4 rounded-xl text-[15px]">
                    Add Your First Business <ArrowUpRight size={18} />
                  </Link>
                </div>
              </section>
            )}

            {/* ── CTA Banner ─────────────────────────────── */}
            <section className="relative text-white py-24 text-center overflow-hidden border-t border-slate-800/50 mt-16">
              <img 
                src="/trianglehubcityimage.png" 
                alt="Cityscape"
                className="absolute inset-0 w-full h-full object-cover object-bottom opacity-50 mix-blend-lighten z-0"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19]/90 to-[#0B0F19]/30 z-0"></div>
              <div className="relative z-10 max-w-3xl mx-auto px-4">
                <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">Are you a local business owner?</h2>
                <p className="text-slate-300 text-xl mb-10 max-w-2xl mx-auto">
                  Claim your free listing today or upgrade to Premium to unlock AI Chat, direct booking, and priority ranking.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link href="/list-your-business" className="inline-flex items-center justify-center gap-2 btn-primary px-8 py-4 text-lg shadow-xl shadow-primary-500/20">
                    List Your Business <ArrowUpRight size={18} />
                  </Link>
                  <Link href="/pricing" className="inline-flex items-center justify-center gap-2 btn-outline px-8 py-4 text-lg">
                    View Premium Features
                  </Link>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
