'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
    Search, Edit, Eye, Plus, Loader2, MapPin, Phone,
    CheckCircle2, XCircle, AlertTriangle, Trash2
} from 'lucide-react';

interface Listing {
    id: number; name: string; slug: string; category: string;
    location_city: string; location_state: string;
    contact_email?: string; contact_phone?: string;
    plan_name?: string; plan_price?: number;
    featured: boolean; claimed: boolean;
    created_at: string;
}

type TabKey = 'all' | 'premium' | 'free' | 'claim' | 'new';

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <button onClick={() => onChange(!checked)}
            className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none ${checked ? 'bg-blue-600' : 'bg-gray-200'}`}>
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    );
}

const PLAN_BADGE: Record<string, string> = {
    pro: 'bg-purple-100 text-purple-700',
    premium: 'bg-blue-100 text-blue-700',
    free: 'bg-emerald-100 text-emerald-700',
};

export default function BusinessesPage() {
    const [listings, setListings] = useState<Listing[]>([]);
    const [plans, setPlans] = useState<{ id: number; name: string; monthly_price: number }[]>([]);
    const [q, setQ] = useState('');
    const [tab, setTab] = useState<TabKey>('all');
    const [isLoading, setIsLoading] = useState(true);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<Listing | null>(null);

    const showToast = (type: 'success' | 'error', msg: string) => {
        setToast({ type, msg }); setTimeout(() => setToast(null), 3200);
    };

    const fetchListings = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/listings${q ? `?q=${encodeURIComponent(q)}` : ''}`);
            const data = await res.json();
            if (data.success) setListings(data.data as Listing[]);
        } catch { showToast('error', 'Failed to load businesses.'); }
        finally { setIsLoading(false); }
    }, [q]);

    useEffect(() => {
        fetch('/api/plans').then(r => r.json()).then(d => setPlans(d.data || []));
    }, []);

    useEffect(() => {
        const t = setTimeout(() => fetchListings(), 350);
        return () => clearTimeout(t);
    }, [q, fetchListings]);

    const toggleActive = async (l: Listing) => {
        await fetch(`/api/listings/${l.id}`, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ active: !l.featured }),
        });
        setListings(prev => prev.map(x => x.id === l.id ? { ...x, featured: !x.featured } : x));
    };

    const deleteListing = async (l: Listing) => {
        const res = await fetch(`/api/listings/${l.id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
            showToast('success', `"${l.name}" deleted.`);
            setListings(prev => prev.filter(x => x.id !== l.id));
        } else {
            showToast('error', data.error || 'Delete failed.');
        }
        setDeleteConfirm(null);
    };

    // Tab filtering
    const filtered = listings.filter(l => {
        if (tab === 'premium') return l.plan_name && !['free', 'none'].includes(l.plan_name.toLowerCase());
        if (tab === 'free') return !l.plan_name || l.plan_name.toLowerCase() === 'free';
        if (tab === 'claim') return !l.claimed;
        if (tab === 'new') return new Date(l.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return true; // 'all'
    });

    const counts = {
        all: listings.length,
        premium: listings.filter(l => l.plan_name && !['free', 'none'].includes(l.plan_name.toLowerCase())).length,
        free: listings.filter(l => !l.plan_name || l.plan_name.toLowerCase() === 'free').length,
        claim: listings.filter(l => !l.claimed).length,
        new: listings.filter(l => new Date(l.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
    };

    const TABS: { key: TabKey; label: string }[] = [
        { key: 'all', label: `All Accounts (${counts.all})` },
        { key: 'premium', label: `Premium Accounts (${counts.premium})` },
        { key: 'free', label: `Free Accounts (${counts.free})` },
        { key: 'claim', label: 'Claim Request' },
        { key: 'new', label: `New Business Requests (${counts.new})` },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-5">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Businesses</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Manage all directory business listings, plans, and claim status.
                    </p>
                </div>
                <Link href="/dashboard/listings/new"
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white rounded-xl text-sm font-bold transition shadow-sm">
                    <Plus size={15} /> Add Business
                </Link>
            </div>

            {/* Toast */}
            {toast && (
                <div className={`flex items-center gap-3 p-4 rounded-xl text-sm font-medium ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                    {toast.msg}
                </div>
            )}

            {/* Main Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">

                {/* Tabs */}
                <div className="flex border-b border-gray-100 dark:border-slate-800 overflow-x-auto">
                    {TABS.map(t => (
                        <button key={t.key} onClick={() => setTab(t.key)}
                            className={`px-5 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${tab === t.key ? 'text-blue-600 border-blue-600 bg-blue-50/40 dark:bg-blue-900/10' : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Search + filters */}
                <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-50 dark:border-slate-800">
                    <div className="relative flex-1 max-w-sm">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input value={q} onChange={e => setQ(e.target.value)}
                            placeholder="Search by name..."
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 dark:bg-slate-950 dark:border-slate-700 dark:text-white" />
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <Link href="/dashboard/import"
                            className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                            Import CSV
                        </Link>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-gray-100 dark:border-slate-800">
                            <tr className="text-gray-500 dark:text-slate-400 text-xs uppercase tracking-wide">
                                <th className="px-6 py-3.5 font-semibold">Name</th>
                                <th className="px-6 py-3.5 font-semibold">Type</th>
                                <th className="px-6 py-3.5 font-semibold">Status</th>
                                <th className="px-6 py-3.5 font-semibold">Reason</th>
                                <th className="px-6 py-3.5 font-semibold">Address</th>
                                <th className="px-6 py-3.5 font-semibold">Phone #</th>
                                <th className="px-6 py-3.5 font-semibold text-center">Active</th>
                                <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                            {isLoading ? (
                                <tr><td colSpan={8} className="py-16 text-center">
                                    <Loader2 size={20} className="animate-spin text-blue-400 mx-auto" />
                                </td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={8} className="py-16 text-center text-gray-400 text-sm">
                                    No businesses in this tab.{' '}
                                    {tab !== 'all' && <button onClick={() => setTab('all')} className="text-blue-500 font-semibold hover:underline">View all</button>}
                                </td></tr>
                            ) : filtered.map(l => (
                                <tr key={l.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors group">
                                    {/* Name */}
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-gray-900 dark:text-white text-sm">{l.name}</div>
                                        <div className="text-xs text-gray-400 mt-0.5 truncate max-w-[160px]">{l.category}</div>
                                    </td>
                                    {/* Type badge */}
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${PLAN_BADGE[l.plan_name?.toLowerCase() ?? ''] ?? 'bg-gray-100 text-gray-500'}`}>
                                            {l.plan_name || 'free'}
                                        </span>
                                    </td>
                                    {/* Status */}
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-semibold ${l.featured ? 'text-emerald-600' : 'text-gray-400'}`}>
                                            {l.featured ? 'active' : 'inactive'}
                                        </span>
                                    </td>
                                    {/* Reason */}
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 text-xs font-medium ${l.claimed ? 'text-emerald-600' : 'text-amber-600'}`}>
                                            {l.claimed ? <><CheckCircle2 size={12} /> Claimed</> : <><XCircle size={12} /> Unclaimed</>}
                                        </span>
                                    </td>
                                    {/* Address */}
                                    <td className="px-6 py-4">
                                        <span className="flex items-center gap-1 text-xs text-gray-500">
                                            <MapPin size={11} className="text-gray-400 shrink-0" />
                                            {l.location_city}, {l.location_state}
                                        </span>
                                    </td>
                                    {/* Phone */}
                                    <td className="px-6 py-4">
                                        <span className="flex items-center gap-1 text-xs text-gray-500">
                                            <Phone size={11} className="text-gray-400 shrink-0" />
                                            {l.contact_email?.replace('@', '\n@') || '—'}
                                        </span>
                                    </td>
                                    {/* Active toggle */}
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center">
                                            <Toggle checked={l.featured} onChange={() => toggleActive(l)} />
                                        </div>
                                    </td>
                                    {/* Actions */}
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link href={`/biz/${l.slug}`} target="_blank"
                                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="View">
                                                <Eye size={15} />
                                            </Link>
                                            <Link href={`/dashboard/listings/${l.id}`}
                                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
                                                <Edit size={15} />
                                            </Link>
                                            <button onClick={() => setDeleteConfirm(l)}
                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition" title="Delete">
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer pagination */}
                {filtered.length > 0 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-50 dark:border-slate-800 text-sm text-gray-500">
                        <span>Showing <span className="font-bold text-gray-800 dark:text-white">{filtered.length}</span> of <span className="font-bold text-gray-800 dark:text-white">{listings.length}</span> businesses</span>
                        <div className="flex items-center gap-2">
                            <button className="px-4 py-2 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition disabled:opacity-40" disabled>← Previous</button>
                            <span className="w-8 h-8 flex items-center justify-center bg-slate-900 text-white rounded-lg font-bold text-sm">1</span>
                            <button className="px-4 py-2 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition disabled:opacity-40" disabled>Next →</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Plan quick-reference */}
            {plans.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {plans.map(p => (
                        <div key={p.id} className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 p-4 flex items-center justify-between">
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white capitalize">{p.name}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{p.monthly_price === 0 ? 'Free' : `$${p.monthly_price}/mo`}</p>
                            </div>
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase ${PLAN_BADGE[p.name.toLowerCase()] ?? 'bg-gray-100 text-gray-500'}`}>
                                {listings.filter(l => l.plan_name?.toLowerCase() === p.name.toLowerCase()).length} businesses
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete confirm */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
                        <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 size={22} className="text-red-500" />
                        </div>
                        <h3 className="text-lg font-bold mb-2">Delete &ldquo;{deleteConfirm.name}&rdquo;?</h3>
                        <p className="text-sm text-gray-500 mb-6">This will remove the listing and all associated outreach data permanently.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
                            <button onClick={() => deleteListing(deleteConfirm)} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
