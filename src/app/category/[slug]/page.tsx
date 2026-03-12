import { sql } from '@/lib/db';
import { Listing } from '@/lib/types';
import Link from 'next/link';
import { Star, MapPin, Search } from 'lucide-react';
import { notFound } from 'next/navigation';

export default async function CategoryPage({
    params
}: {
    params: { slug: string } | Promise<{ slug: string }>
}) {
    const { slug } = await params;
    const categoryStr = slug.replace('-', ' ');
    const titleCaseCategory = categoryStr.charAt(0).toUpperCase() + categoryStr.slice(1);
    const q = `%${categoryStr}%`;

    let listings: Listing[] = [];
    try {
        listings = (await sql`
      SELECT * FROM listings 
      WHERE category ILIKE ${q}
      ORDER BY featured DESC, rating DESC 
    `) as Listing[];
    } catch (err) {
        console.error(err);
        return <div>Database Error. Seed first.</div>;
    }

    if (listings.length === 0) {
        // If no listings, still show the page but empty state, since it's a category.
        // If the category doesn't exist at all, you might normally 404, but dynamic is fine here.
    }

    return (
        <div className="flex flex-col min-h-screen pb-20 bg-slate-50 dark:bg-slate-900">
            {/* Category Header */}
            <section className="bg-blue-900 text-white py-16 px-4">
                <div className="container mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Best {titleCaseCategory} in the Triangle</h1>
                    <p className="text-lg text-blue-200 mt-2 max-w-2xl mx-auto">
                        Browse our top-rated local {categoryStr} located in Raleigh, Durham, and Cary. Read reviews, request quotes, and easily compare services.
                    </p>
                </div>
            </section>

            {/* Main Content */}
            <section className="container mx-auto px-4 py-12 flex flex-col md:flex-row gap-8">

                {/* Filters Sidebar */}
                <aside className="w-full md:w-64 flex-shrink-0 space-y-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
                        <h3 className="font-bold text-lg border-b border-gray-100 dark:border-slate-700 pb-3 mb-4">Location</h3>
                        <div className="space-y-2">
                            <label className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                                <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" /> <span>Raleigh</span>
                            </label>
                            <label className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                                <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" /> <span>Durham</span>
                            </label>
                            <label className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                                <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" /> <span>Cary</span>
                            </label>
                        </div>

                        <h3 className="font-bold text-lg border-b border-gray-100 dark:border-slate-700 pb-3 mb-4 mt-6">Rating</h3>
                        <div className="space-y-2">
                            <label className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                                <input type="checkbox" className="rounded text-amber-500 focus:ring-amber-500" />
                                <span className="flex text-amber-500"><Star size={14} className="fill-current" /><Star size={14} className="fill-current" /><Star size={14} className="fill-current" /><Star size={14} className="fill-current" /><Star size={14} className="fill-current mr-1 text-gray-300" /> 4.0+</span>
                            </label>
                        </div>
                    </div>
                </aside>

                {/* Listings Grid */}
                <div className="flex-1">
                    <div className="mb-6 text-sm text-gray-500">
                        Showing {listings.length} results for <span className="font-bold text-gray-800 dark:text-gray-200">{titleCaseCategory}</span>
                    </div>

                    {listings.length === 0 ? (
                        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                            <Search className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                            <h3 className="text-xl font-medium mb-2">No businesses found</h3>
                            <p className="text-gray-500">We couldn't find any {categoryStr} right now. Check back soon!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {listings.map((biz) => (
                                <div key={biz.id} className="directory-card rounded-xl overflow-hidden flex flex-col sm:flex-row bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 border">

                                    <div className="w-full sm:w-1/3 h-48 sm:h-auto bg-slate-200 relative shrink-0">
                                        <img
                                            src={`https://images.unsplash.com/photo-${biz.id % 2 === 0 ? '1497366216548-37526070297c' : '1517248135467-4c7edcad34c4'}?auto=format&fit=crop&q=80&w=300`}
                                            alt={biz.name}
                                            className="w-full h-full object-cover"
                                        />
                                        {biz.featured && (
                                            <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded shadow">
                                                Featured
                                            </span>
                                        )}
                                    </div>

                                    <div className="p-5 flex flex-col flex-grow">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="text-lg font-bold group-hover:text-blue-600 transition-colors leading-tight">
                                                <Link href={`/biz/${biz.slug}`} className="hover:underline">
                                                    {biz.name}
                                                </Link>
                                            </h3>
                                            <div className="flex items-center text-xs font-bold text-amber-500 shrink-0 ml-2 mt-1">
                                                <Star className="w-3 h-3 mr-0.5 fill-current" />
                                                {biz.rating}
                                            </div>
                                        </div>

                                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
                                            <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                                            {biz.location_city}, {biz.location_state}
                                        </div>

                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                            {biz.description}
                                        </p>

                                        <div className="mt-auto">
                                            <Link href={`/biz/${biz.slug}`} className="inline-block px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-sm font-medium rounded transition-colors">
                                                View Profile
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
