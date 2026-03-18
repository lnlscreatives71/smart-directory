import { sql } from '@/lib/db';
import { Listing } from '@/lib/types';
import Link from 'next/link';
import { Star, MapPin, Search, ArrowUpRight } from 'lucide-react';
import BizCard from '@/components/BizCard';
import CategoryFilters from '@/components/CategoryFilters';

export default async function CategoryPage({
    searchParams,
    params
}: {
    searchParams: { city?: string; rating?: string; plan?: string };
    params: { slug: string } | Promise<{ slug: string }>
}) {
    const { slug } = await params;
    const categoryStr = slug.replace(/-/g, ' ');
    const titleCaseCategory = categoryStr.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    
    // Build query with filters
    let query = sql`SELECT * FROM listings WHERE active = TRUE AND category ILIKE ${`%${categoryStr}%`}`;
    
    if (searchParams.city) {
        query = sql`${query} AND location_city = ${searchParams.city}`;
    }
    if (searchParams.rating) {
        query = sql`${query} AND rating >= ${parseFloat(searchParams.rating)}`;
    }
    if (searchParams.plan === 'Featured') {
        query = sql`${query} AND featured = true`;
    }
    
    query = sql`${query} ORDER BY CASE WHEN featured = true THEN 1 ELSE 0 END DESC, rating DESC`;
    
    let listings: Listing[] = [];
    try {
        listings = (await query) as Listing[];
    } catch (err) {
        console.error(err);
        return <div className="p-10 text-center text-red-500">Database Error.</div>;
    }

    return (
        <div className="min-h-screen pb-16 text-white">
            {/* Category Header */}
            <section style={{ backgroundColor: '#0F172A' }} className="text-white py-12 px-4">
                <div className="max-w-7xl mx-auto">
                    <p className="text-sm text-slate-400 mb-2">
                        <Link href="/" className="hover:text-white transition">Home</Link>
                        <span className="mx-2">›</span>
                        {titleCaseCategory}
                    </p>
                    <h1 className="text-3xl md:text-4xl font-extrabold mb-2">{titleCaseCategory}</h1>
                    <p className="text-slate-300 text-sm">
                        {listings.length} local {titleCaseCategory.toLowerCase()} businesses in the Triangle
                    </p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 pt-8 flex flex-col lg:flex-row gap-8">

                {/* ── Sidebar Filters ───────────────────── */}
                <CategoryFilters />

                {/* ── Listings Grid ──────────────────────── */}
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-5">
                        <p className="text-sm text-slate-400 font-medium">
                            Showing <span className="font-bold text-white">{listings.length}</span> results for <span className="font-bold text-white">{titleCaseCategory}</span>
                        </p>
                        <Link href={`/dashboard/listings/new`} className="flex items-center gap-1 text-sm font-semibold text-primary-400 hover:text-white transition-colors">
                            Add Yours <ArrowUpRight size={13} />
                        </Link>
                    </div>

                    {listings.length === 0 ? (
                        <div className="glass rounded-3xl p-16 text-center border border-slate-700/50">
                            <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search className="h-10 w-10 text-slate-400" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-white">No {titleCaseCategory} businesses yet</h3>
                            <p className="text-slate-400 mb-6 text-lg">Be the first to list here!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {listings.map((biz) => (
                                <BizCard key={biz.id} biz={biz} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
