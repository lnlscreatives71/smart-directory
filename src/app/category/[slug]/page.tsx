import { sql } from '@/lib/db';
import { Listing } from '@/lib/types';
import Link from 'next/link';
import { Star, MapPin, Search, ExternalLink, Copy, Heart, ArrowUpRight } from 'lucide-react';
import BizCard from '@/components/BizCard';

export default async function CategoryPage({
    params
}: {
    params: { slug: string } | Promise<{ slug: string }>
}) {
    const { slug } = await params;
    const categoryStr = slug.replace(/-/g, ' ');
    const titleCaseCategory = categoryStr.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const q = `%${categoryStr}%`;

    let listings: Listing[] = [];
    try {
        listings = (await sql`
      SELECT * FROM listings 
      WHERE category ILIKE ${q}
      ORDER BY CASE WHEN featured = true THEN 1 ELSE 0 END DESC, rating DESC 
    `) as Listing[];
    } catch (err) {
        console.error(err);
        return <div className="p-10 text-center text-red-500">Database Error. Seed first.</div>;
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
                <aside className="w-full lg:w-64 shrink-0 space-y-4">
                    <div className="glass rounded-2xl border border-white/10 shadow-sm p-5">
                        <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400 mb-4">Location</h3>
                        <div className="space-y-2.5">
                            {['Raleigh', 'Durham', 'Cary', 'Chapel Hill'].map(city => (
                                <label key={city} className="flex items-center gap-2.5 text-sm text-slate-300 cursor-pointer font-medium">
                                    <input type="checkbox" className="rounded text-blue-500 focus:ring-blue-400 w-4 h-4 bg-slate-800 border-slate-600" />
                                    {city}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="glass rounded-2xl border border-white/10 shadow-sm p-5">
                        <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400 mb-4">Rating</h3>
                        <div className="space-y-2.5">
                            {[['4.5+', '4.5'], ['4.0+', '4.0'], ['3.5+', '3.5']].map(([label, val]) => (
                                <label key={val} className="flex items-center gap-2.5 text-sm text-slate-300 cursor-pointer font-medium">
                                    <input type="checkbox" className="rounded text-blue-500 focus:ring-blue-400 w-4 h-4 bg-slate-800 border-slate-600" />
                                    <span className="flex items-center gap-1">
                                        <Star size={13} className="text-amber-400 fill-amber-400" /> {label}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="glass rounded-2xl border border-white/10 shadow-sm p-5">
                        <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400 mb-4">Plan</h3>
                        <div className="space-y-2.5">
                            {['Featured', 'Premium', 'Free'].map(plan => (
                                <label key={plan} className="flex items-center gap-2.5 text-sm text-slate-300 cursor-pointer font-medium">
                                    <input type="checkbox" className="rounded text-blue-500 focus:ring-blue-400 w-4 h-4 bg-slate-800 border-slate-600" />
                                    {plan}
                                </label>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* ── Listings Grid ──────────────────────── */}
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-5">
                        <p className="text-sm text-slate-400 font-medium">
                            Showing <span className="font-bold text-white">{listings.length}</span> results for <span className="font-bold text-white">{titleCaseCategory}</span>
                        </p>
                        <Link href={`/dashboard/listings/new`} className="flex items-center gap-1 text-sm font-semibold text-blue-400 hover:text-white transition-colors">
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
