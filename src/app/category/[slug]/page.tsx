import { sql } from '@/lib/db';
import { Listing } from '@/lib/types';
import Link from 'next/link';
import { Star, MapPin, Search, ExternalLink, Copy, Heart, ArrowUpRight } from 'lucide-react';

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
        <div className="bg-[#F1F3F8] min-h-screen pb-16">
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
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400 mb-4">Location</h3>
                        <div className="space-y-2.5">
                            {['Raleigh', 'Durham', 'Cary', 'Chapel Hill'].map(city => (
                                <label key={city} className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer font-medium">
                                    <input type="checkbox" className="rounded text-red-500 focus:ring-red-400 w-4 h-4" />
                                    {city}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400 mb-4">Rating</h3>
                        <div className="space-y-2.5">
                            {[['4.5+', '4.5'], ['4.0+', '4.0'], ['3.5+', '3.5']].map(([label, val]) => (
                                <label key={val} className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer font-medium">
                                    <input type="checkbox" className="rounded text-red-500 focus:ring-red-400 w-4 h-4" />
                                    <span className="flex items-center gap-1">
                                        <Star size={13} className="text-amber-400 fill-amber-400" /> {label}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400 mb-4">Plan</h3>
                        <div className="space-y-2.5">
                            {['Featured', 'Premium', 'Free'].map(plan => (
                                <label key={plan} className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer font-medium">
                                    <input type="checkbox" className="rounded text-red-500 focus:ring-red-400 w-4 h-4" />
                                    {plan}
                                </label>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* ── Listings Grid ──────────────────────── */}
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-5">
                        <p className="text-sm text-gray-500 font-medium">
                            Showing <span className="font-bold text-gray-800">{listings.length}</span> results for <span className="font-bold text-gray-800">{titleCaseCategory}</span>
                        </p>
                        <Link href={`/dashboard/listings/new`} className="flex items-center gap-1 text-sm font-semibold text-red-500 hover:underline">
                            Add Yours <ArrowUpRight size={13} />
                        </Link>
                    </div>

                    {listings.length === 0 ? (
                        <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
                            <Search className="mx-auto h-12 w-12 text-gray-200 mb-4" />
                            <h3 className="text-lg font-bold mb-2">No {titleCaseCategory} businesses yet</h3>
                            <p className="text-gray-400 text-sm">Be the first to list here!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {listings.map((biz) => (
                                <div key={biz.id} className="biz-card flex flex-col">
                                    {/* Image */}
                                    <div className="relative">
                                        <Link href={`/biz/${biz.slug}`}>
                                            <img
                                                src={`https://images.unsplash.com/photo-${biz.id % 3 === 0 ? '1497366216548-37526070297c' : biz.id % 3 === 1 ? '1517248135467-4c7edcad34c4' : '1560750588-73207b1ef5b9'}?auto=format&fit=crop&q=80&w=600`}
                                                alt={biz.name}
                                                className="biz-card-img hover:opacity-95 transition-opacity"
                                            />
                                        </Link>
                                        {biz.featured && (
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
                                        <div className="flex flex-wrap gap-1.5 mb-4">
                                            <span className="badge-category">{biz.category}</span>
                                        </div>
                                        <div className="mt-auto flex items-center gap-1 pt-3 border-t border-gray-100">
                                            <Link href={`/biz/${biz.slug}`} title="View listing">
                                                <span className="action-icon"><ExternalLink size={15} /></span>
                                            </Link>
                                            <button title="Copy link">
                                                <span className="action-icon"><Copy size={15} /></span>
                                            </button>
                                            <button title="Save" className="ml-auto">
                                                <span className="action-icon"><Heart size={15} /></span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
