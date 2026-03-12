import { sql } from '@/lib/db';
import { Listing } from '@/lib/types';
import Link from 'next/link';
import { Search, Star, MapPin, CheckCircle } from 'lucide-react';

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
        ORDER BY CASE WHEN feature_flags->>'priority_ranking' = 'true' THEN 1 ELSE 0 END DESC, rating DESC 
        LIMIT 12
      `) as Listing[];
    } else {
      listings = (await sql`
        SELECT * FROM listings 
        ORDER BY CASE WHEN feature_flags->>'priority_ranking' = 'true' THEN 1 ELSE 0 END DESC, rating DESC 
        LIMIT 12
      `) as Listing[];
    }
  } catch (err) {
    console.error('Failed to fetch listings. Please seed the database first.', err);
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative hero-gradient text-white py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-blue-900/60 z-0"></div>
        <div className="container mx-auto relative z-10 text-center space-y-8 max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            Discover the Best Local Businesses in the Triangle
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-8">
            Find trusted, vetted professionals in Raleigh, Durham, and Cary. From Med Spas to Real Estate, we've got you covered.
          </p>

          <form className="max-w-2xl mx-auto flex flex-col md:flex-row shadow-2xl rounded-lg overflow-hidden glass-panel">
            <div className="relative flex-grow bg-white">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="What are you looking for? (e.g., HVAC in Cary)"
                className="w-full py-4 pl-12 pr-4 text-gray-900 focus:outline-none text-lg"
              />
            </div>
            <button type="submit" className="btn-accent px-8 py-4 text-lg font-semibold w-full md:w-auto">
              Search
            </button>
          </form>

          <div className="flex flex-wrap justify-center gap-4 mt-8 text-sm pt-4">
            <span className="text-blue-200">Popular:</span>
            <Link href="/?q=Restaurants" className="hover:text-white underline decoration-blue-400 underline-offset-4">Restaurants</Link>
            <Link href="/?q=Med Spa" className="hover:text-white underline decoration-blue-400 underline-offset-4">Med Spas</Link>
            <Link href="/?q=Real Estate" className="hover:text-white underline decoration-blue-400 underline-offset-4">Real Estate</Link>
          </div>
        </div>
      </section>

      {/* Main Listings */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex justify-between items-end mb-8 border-b pb-4 border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-3xl font-bold">Featured in {query ? `"${query}"` : 'the Triangle'}</h2>
            <p className="text-gray-500 mt-2">Top rated businesses serving Raleigh, Durham, and Cary.</p>
          </div>
          {query && (
            <Link href="/" className="text-sm text-blue-600 hover:text-blue-800 hidden md:block">
              Clear Search
            </Link>
          )}
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
            <Search className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium mb-2">No businesses found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search terms or location.</p>
            <p className="text-sm text-orange-500 font-medium">If this is a new setup, ensure you hit the <Link href="/api/seed" className="underline font-bold text-blue-600">/api/seed</Link> endpoint first to create the DB tables.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {listings.map((biz) => {
              const flags = biz.feature_flags || {};
              const isHighlight = flags.highlight_on_home === true;

              return (
                <div key={biz.id} className={`directory-card rounded-xl overflow-hidden flex flex-col h-full bg-white dark:bg-slate-800 border transition-all ${isHighlight ? 'ring-2 ring-emerald-500 shadow-xl border-transparent transform hover:-translate-y-2' : 'border-gray-200 dark:border-slate-700 hover:-translate-y-1'}`}>
                  {/* Card Image Area Options */}
                  <div className="h-48 bg-slate-200 dark:bg-slate-700 relative">
                    <img
                      src={`https://images.unsplash.com/photo-${biz.id % 2 === 0 ? '1497366216548-37526070297c' : '1517248135467-4c7edcad34c4'}?auto=format&fit=crop&q=80&w=500`}
                      alt={biz.name}
                      className="w-full h-full object-cover"
                    />
                    {isHighlight && (
                      <span className="absolute top-4 right-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center">
                        <CheckCircle size={14} className="mr-1" /> Verified Premium
                      </span>
                    )}
                    <span className="absolute bottom-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur text-sm font-semibold px-3 py-1 rounded shadow">
                      {biz.category}
                    </span>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className={`text-xl font-bold flex items-center gap-1 transition-colors ${isHighlight ? 'text-emerald-700 dark:text-emerald-400' : 'hover:text-blue-600'}`}>
                        <Link href={`/biz/${biz.slug}`} className="hover:underline">
                          {biz.name}
                        </Link>
                      </h3>
                      <div className="flex items-center text-sm font-medium text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">
                        <Star className="w-4 h-4 mr-1 fill-current" />
                        {biz.rating}
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {biz.description}
                    </p>

                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4 mt-auto">
                      <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                      {biz.location_city}, {biz.location_state}
                    </div>

                    <div className="border-t border-gray-100 dark:border-slate-700 pt-4 mt-auto">
                      <Link href={`/biz/${biz.slug}`} className={`block w-full text-center py-2.5 font-medium rounded-lg transition-colors ${isHighlight ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30' : 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300'}`}>
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-slate-900 text-white py-20 text-center">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold mb-6">Are you a business owner in the Triangle?</h2>
          <p className="text-gray-300 mb-8 text-lg">Claim your free listing today or upgrade to our Premium plan to instantly generate high-quality local leads.</p>
          <Link href="/dashboard/listings/new" className="inline-block btn-accent px-8 py-4 rounded-lg text-lg font-semibold shadow-xl shadow-emerald-500/20">
            Add Your Business Free
          </Link>
        </div>
      </section>
    </div>
  );
}
