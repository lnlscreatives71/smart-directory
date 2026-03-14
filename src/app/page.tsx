import { sql } from '@/lib/db';
import { Listing } from '@/lib/types';
import Link from 'next/link';
import { Search, ExternalLink, Copy, Heart, Star, MapPin, ArrowUpRight } from 'lucide-react';

export default async function Home({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
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
    { label: 'Dining', href: '/category/dining', img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80&auto=format&fit=crop' },
    { label: 'Services', href: '/category/services', img: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=80&auto=format&fit=crop' },
    { label: 'Retail', href: '/category/retail', img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80&auto=format&fit=crop' },
    { label: 'Med Spa', href: '/category/med-spa', img: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b9?w=400&q=80&auto=format&fit=crop' },
    { label: 'Real Estate', href: '/category/real-estate', img: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=400&q=80&auto=format&fit=crop' },
    { label: 'Health & Fitness', href: '/category/health', img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80&auto=format&fit=crop' },
  ];

  return (
    <div className="flex flex-col min-h-screen">

      {/* ── HERO ─────────────────────────────────────── */}
      <section className="hero-bg flex flex-col items-center justify-center text-center px-4 py-32">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 drop-shadow-md tracking-tight">
          Find Local Businesses You Can Trust
        </h1>
        <p className="text-white text-lg md:text-xl mb-10 max-w-3xl font-medium drop-shadow-md">
          Search by name, category, or keyword — and support the businesses that make your community thrive.
        </p>

        {/* Search Bar */}
        <form className="w-full max-w-2xl flex rounded-md overflow-hidden shadow-2xl h-14">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search by business name or tag"
            className="flex-1 px-6 text-gray-700 text-[15px] outline-none bg-white placeholder:text-gray-400"
          />
          <button type="submit" className="bg-[#e53e3e] hover:bg-red-600 px-8 text-white text-[15px] font-semibold whitespace-nowrap shrink-0 transition-colors">
            Search
          </button>
        </form>
      </section>

      {/* ── MAIN CONTENT ──────────────────────────────── */}
      <div className="bg-[#F1F3F8] flex-1">

        {/* Search results mode */}
        {query && (
          <section className="max-w-7xl mx-auto px-4 py-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="section-title">Results for &ldquo;{query}&rdquo;</h2>
                <p className="text-gray-500 text-sm mt-1">{listings.length} businesses found</p>
              </div>
              <Link href="/" className="text-sm text-red-500 font-semibold hover:underline">Clear ×</Link>
            </div>
            {listings.length === 0 ? (
              <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
                <Search className="mx-auto h-12 w-12 text-gray-200 mb-4" />
                <h3 className="text-xl font-bold mb-2">No businesses found</h3>
                <p className="text-gray-400 mb-6">Try adjusting your search or browse by category below.</p>
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
            <section className="max-w-7xl mx-auto px-4 py-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="section-title">Businesses by Category</h2>
                <Link href="/category/all" className="section-see-all">
                  See All Categories <ArrowUpRight size={15} />
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {CATEGORY_TILES.map(cat => (
                  <Link key={cat.label} href={cat.href} className="cat-tile block group">
                    <div className="relative">
                      <img
                        src={cat.img}
                        alt={cat.label}
                        className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                        <span className="text-white font-bold text-sm uppercase tracking-wide">{cat.label}</span>
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
                  <h2 className="section-title">Local Businesses in the Triangle</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {regular.slice(0, 8).map(biz => <BizCard key={biz.id} biz={biz} />)}
                </div>
              </section>
            )}

            {/* Empty state */}
            {listings.length === 0 && (
              <section className="max-w-7xl mx-auto px-4 py-20 text-center">
                <div className="bg-white rounded-2xl p-16 shadow-sm border border-gray-100">
                  <Search className="mx-auto h-12 w-12 text-gray-200 mb-4" />
                  <h3 className="text-xl font-bold mb-2">No listings yet</h3>
                  <p className="text-gray-400 mb-6 text-sm">
                    Visit <Link href="/api/seed" className="text-red-500 font-bold underline">/api/seed</Link> to seed the database first.
                  </p>
                  <Link href="/dashboard/listings/new" className="inline-flex items-center gap-2 btn-red px-6 py-3 rounded-xl text-sm font-bold">
                    Add Your First Business <ArrowUpRight size={15} />
                  </Link>
                </div>
              </section>
            )}

            {/* ── CTA Banner ─────────────────────────────── */}
            <section style={{ backgroundColor: '#0F172A' }} className="text-white py-16 text-center">
              <div className="max-w-2xl mx-auto px-4">
                <h2 className="text-3xl font-extrabold mb-4">Are you a local business owner?</h2>
                <p className="text-slate-300 mb-8">
                  Claim your free listing today or upgrade to Premium to get 4× more local leads.
                </p>
                <Link href="/dashboard/listings/new" className="inline-flex items-center gap-2 btn-red px-8 py-4 rounded-xl text-base font-bold shadow-lg">
                  Add Your Business Free <ArrowUpRight size={16} />
                </Link>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Business Card Component ────────────────────── */
function BizCard({ biz, showFeatured = false }: { biz: Listing; showFeatured?: boolean }) {
  const isHighlight = biz.feature_flags?.highlight_on_home === true || biz.featured;

  return (
    <div className="biz-card flex flex-col">
      {/* Image */}
      <div className="relative">
        <Link href={`/biz/${biz.slug}`}>
          <img
            src={`https://images.unsplash.com/photo-${biz.id % 3 === 0 ? '1497366216548-37526070297c' : biz.id % 3 === 1 ? '1517248135467-4c7edcad34c4' : '1560750588-73207b1ef5b9'}?auto=format&fit=crop&q=80&w=500`}
            alt={biz.name}
            className="biz-card-img hover:opacity-95 transition-opacity"
          />
        </Link>
        {(showFeatured || isHighlight) && (
          <span className="badge-featured absolute top-3 left-3 flex items-center gap-1">
            <Star size={11} fill="white" stroke="none" /> FEATURED
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <Link href={`/biz/${biz.slug}`} className="font-bold text-[15px] text-gray-900 hover:text-red-500 transition-colors leading-snug mb-1">
          {biz.name}
        </Link>
        <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
          <MapPin size={13} className="text-gray-400 shrink-0" />
          {biz.location_city}, {biz.location_state}
          <span className="ml-auto flex items-center gap-0.5 text-amber-500 font-semibold text-xs">
            <Star size={11} fill="currentColor" stroke="none" />{biz.rating}
          </span>
        </div>

        {/* Category badges */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className="badge-category">{biz.category}</span>
        </div>

        {/* Action icons */}
        <div className="mt-auto flex items-center gap-1 pt-3 border-t border-gray-100">
          <Link href={`/biz/${biz.slug}`} title="View listing">
            <span className="action-icon"><ExternalLink size={15} /></span>
          </Link>
          <button title="Copy link" onClick={() => { if (typeof window !== 'undefined') navigator.clipboard.writeText(window.location.origin + '/biz/' + biz.slug); }}>
            <span className="action-icon"><Copy size={15} /></span>
          </button>
          <button title="Save" className="ml-auto">
            <span className="action-icon"><Heart size={15} /></span>
          </button>
        </div>
      </div>
    </div>
  );
}
