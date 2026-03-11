'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Edit, Eye, Filter, CheckCircle, XCircle } from 'lucide-react';

export default function ListingsTable() {
    const [listings, setListings] = useState<any[]>([]);
    const [plans, setPlans] = useState<any[]>([]);
    const [q, setQ] = useState('');
    const [planFilter, setPlanFilter] = useState('');
    const [featuredFilter, setFeaturedFilter] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const fetchListings = async () => {
        setIsLoading(true);
        const searchParams = new URLSearchParams();
        if (q) searchParams.set('q', q);
        if (planFilter) searchParams.set('plan', planFilter);
        const res = await fetch(`/api/listings?${searchParams.toString()}`);
        const data = await res.json();
        if (data.success) {
            // Local filter for featured if needed (or could be added to API)
            let results = data.data;
            if (featuredFilter) {
                results = results.filter((r: any) => r.featured === true);
            }
            setListings(results);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetch('/api/plans').then(res => res.json()).then(data => setPlans(data.data || []));
    }, []);

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchListings();
        }, 400);
        return () => clearTimeout(debounce);
    }, [q, planFilter, featuredFilter]);

    const uniqueCities = Array.from(new Set(listings.map(l => l.location_city))).filter(Boolean);

    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Listings Management</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage, filter, and update directory businesses.</p>
                </div>
                <Link href="/dashboard/listings/new" className="bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-5 rounded-lg font-medium shadow-sm transition-colors text-sm flex items-center">
                    <span className="mr-1">+</span> Create Listing
                </Link>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mb-6 mt-6">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800/50 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search by name, city, or category..."
                            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg dark:bg-slate-950 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                        />
                    </div>

                    <div className="flex w-full md:w-auto gap-3 overflow-x-auto pb-1 md:pb-0">
                        <select
                            className="px-3 py-2 text-sm border border-slate-200 rounded-lg dark:bg-slate-950 dark:border-slate-800 focus:outline-none bg-white dark:text-slate-200 cursor-pointer"
                            value={planFilter}
                            onChange={(e) => setPlanFilter(e.target.value)}
                        >
                            <option value="">All Plans</option>
                            {plans.map(p => <option key={p.id} value={p.name}>{p.name.toUpperCase()}</option>)}
                        </select>

                        <label className="flex items-center space-x-2 px-3 py-2 border border-slate-200 rounded-lg dark:border-slate-800 cursor-pointer bg-slate-50 dark:bg-slate-950/50 text-sm whitespace-nowrap">
                            <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700" checked={featuredFilter} onChange={e => setFeaturedFilter(e.target.checked)} />
                            <span className="text-slate-700 dark:text-slate-300 font-medium">Featured Only</span>
                        </label>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50/50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 sticky top-0">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Business Name</th>
                                <th className="px-6 py-4 font-semibold">Category & City</th>
                                <th className="px-6 py-4 font-semibold">Plan</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold">Created</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">Loading listings...</td>
                                </tr>
                            ) : listings.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center text-slate-400">
                                        <div className="flex flex-col items-center">
                                            <Filter size={32} className="mb-3 text-slate-300" />
                                            <p className="text-base text-slate-600 dark:text-slate-400 font-medium">No listings found</p>
                                            <p className="text-sm mt-1">Try adjusting your search or filters.</p>
                                            <button onClick={() => { setQ(''); setPlanFilter(''); setFeaturedFilter(false); }} className="mt-4 text-blue-600 font-medium hover:underline">Clear all filters</button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                listings.map(l => (
                                    <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-900 dark:text-slate-100">{l.name}</div>
                                            <div className="text-xs text-slate-400 mt-0.5 max-w-[200px] truncate">{l.slug}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="inline-flex px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium mb-1">
                                                {l.category}
                                            </div>
                                            <div className="text-xs text-slate-500 flex items-center mt-1">
                                                {l.location_city}, {l.location_state}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col items-start gap-1">
                                                <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${l.plan_name === 'pro' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                                                        l.plan_name === 'premium' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                            'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                                    }`}>
                                                    {l.plan_name || 'None'}
                                                </span>
                                                <span className="text-xs text-slate-400">${l.plan_price || 0}/mo</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1.5 align-start">
                                                {l.featured ? (
                                                    <span className="inline-flex items-center text-xs text-amber-600 dark:text-amber-500 font-medium"><CheckCircle size={12} className="mr-1" /> Featured</span>
                                                ) : (
                                                    <span className="inline-flex items-center text-xs text-slate-400"><XCircle size={12} className="mr-1" /> Standard</span>
                                                )}
                                                {l.claimed ? (
                                                    <span className="inline-flex items-center text-xs text-emerald-600 dark:text-emerald-500 font-medium"><CheckCircle size={12} className="mr-1" /> Claimed</span>
                                                ) : (
                                                    <span className="inline-flex items-center text-xs text-slate-400"><XCircle size={12} className="mr-1" /> Unclaimed</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-500">
                                            {new Date(l.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link target="_blank" href={`/biz/${l.slug}`} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors" title="View Public Profile">
                                                    <Eye size={18} />
                                                </Link>
                                                <Link href={`/dashboard/listings/${l.id}`} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors" title="Edit Listing">
                                                    <Edit size={18} />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {!isLoading && listings.length > 0 && (
                    <div className="p-4 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between text-sm text-slate-500">
                        <span>Showing {listings.length} listings</span>
                        {/* Stub pagination */}
                        <div className="flex gap-1">
                            <button className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900 disabled:opacity-50" disabled>Previous</button>
                            <button className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900 disabled:opacity-50" disabled>Next</button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
