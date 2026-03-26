'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
    Search, Edit, Eye, Plus, Loader2, MapPin, Phone,
    CheckCircle2, XCircle, AlertTriangle, Trash2, ImageIcon, ChevronUp, ChevronDown as ChevronDownIcon, Download, Mail
} from 'lucide-react';

function outreachLabel(status?: string) {
    if (!status) return null;
    const map: Record<string, { label: string; color: string }> = {
        pending: { label: 'Queued', color: 'text-slate-400' },
        email_1_sent: { label: 'Email 1', color: 'text-blue-500' },
        email_2_sent: { label: 'Email 2', color: 'text-indigo-500' },
        email_3_sent: { label: 'Email 3', color: 'text-violet-500' },
        email_4_sent: { label: 'Email 4', color: 'text-purple-500' },
        completed: { label: 'Done', color: 'text-emerald-500' },
    };
    return map[status] || { label: status, color: 'text-slate-400' };
}

interface Listing {
    id: number; name: string; slug: string; category: string;
    location_city: string; location_state: string;
    contact_email?: string; phone?: string;
    plan_name?: string; plan_price?: number;
    active: boolean; featured: boolean; claimed: boolean;
    claim_status?: string;
    outreach_status?: string;
    outreach_opens?: number;
    outreach_clicks?: number;
    created_at: string;
}

type TabKey = 'all' | 'premium' | 'free' | 'unclaimed' | 'outreach' | 'new';

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <button onClick={() => onChange(!checked)}
            className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none ${checked ? 'bg-primary-600' : 'bg-gray-200'}`}>
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    );
}

const PLAN_BADGE: Record<string, string> = {
    pro: 'bg-purple-100 text-purple-700',
    premium: 'bg-primary-100 text-primary-700',
    free: 'bg-secondary-100 text-secondary-700',
};

export default function BusinessesPage() {
    const [listings, setListings] = useState<Listing[]>([]);
    const [plans, setPlans] = useState<{ id: number; name: string; monthly_price: number }[]>([]);
    const [q, setQ] = useState('');
    const [tab, setTab] = useState<TabKey>('all');
    const [isLoading, setIsLoading] = useState(true);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<Listing | null>(null);
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
    const [bulkDeleting, setBulkDeleting] = useState(false);
    const [refreshingPhotos, setRefreshingPhotos] = useState(false);
    const [sortKey, setSortKey] = useState<string>('name');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

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
        const newVal = !l.active;
        setListings(prev => prev.map(x => x.id === l.id ? { ...x, active: newVal } : x));
        await fetch(`/api/listings/${l.id}`, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ active: newVal }),
        });
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

    const exportCSV = () => {
        const headers = ['id','name','slug','category','location_city','location_state','contact_email','contact_name','phone','website','plan_name','active','featured','claimed','created_at'];
        const rows = listings.map(l => headers.map(h => {
            const val = (l as unknown as Record<string, unknown>)[h] ?? '';
            const str = String(val).replace(/"/g, '""');
            return `"${str}"`;
        }).join(','));
        const csv = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `listings-${new Date().toISOString().slice(0,10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const refreshPhotos = async () => {
        setRefreshingPhotos(true);
        try {
            const res = await fetch('/api/admin/refresh-photos', { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                showToast('success', data.message);
            } else {
                showToast('error', data.error || 'Photo refresh failed.');
            }
        } catch {
            showToast('error', 'Photo refresh failed.');
        }
        setRefreshingPhotos(false);
    };

    const bulkDelete = async () => {
        setBulkDeleting(true);
        const ids = Array.from(selected);
        let deleted = 0;
        for (const id of ids) {
            const res = await fetch(`/api/listings/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) deleted++;
        }
        setListings(prev => prev.filter(x => !selected.has(x.id)));
        setSelected(new Set());
        setBulkDeleteConfirm(false);
        setBulkDeleting(false);
        showToast('success', `${deleted} listing${deleted !== 1 ? 's' : ''} deleted.`);
    };

    // Tab filtering
    const filtered = listings.filter(l => {
        if (tab === 'premium') return l.plan_name && !['free', 'none'].includes(l.plan_name.toLowerCase());
        if (tab === 'free') return !l.plan_name || l.plan_name.toLowerCase() === 'free';
        if (tab === 'unclaimed') return !l.claimed;
        if (tab === 'outreach') return !!l.outreach_status;
        if (tab === 'new') return new Date(l.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return true;
    });

    const sorted = [...filtered].sort((a, b) => {
        const av = (a as unknown as Record<string, unknown>)[sortKey] ?? '';
        const bv = (b as unknown as Record<string, unknown>)[sortKey] ?? '';
        const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
        return sortDir === 'asc' ? cmp : -cmp;
    });

    const toggleSort = (key: string) => {
        if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortKey(key); setSortDir('asc'); }
    };

    const sortIcon = (col: string) => sortKey === col
        ? (sortDir === 'asc' ? <ChevronUp size={13} className="inline ml-1" /> : <ChevronDownIcon size={13} className="inline ml-1" />)
        : <ChevronUp size={13} className="inline ml-1 opacity-20" />;

    const allSelected = sorted.length > 0 && sorted.every(l => selected.has(l.id));
    const toggleSelectAll = () => {
        if (allSelected) {
            setSelected(prev => { const n = new Set(prev); sorted.forEach(l => n.delete(l.id)); return n; });
        } else {
            setSelected(prev => { const n = new Set(prev); sorted.forEach(l => n.add(l.id)); return n; });
        }
    };
    const toggleSelect = (id: number) => {
        setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
    };

    const counts = {
        all: listings.length,
        premium: listings.filter(l => l.plan_name && !['free', 'none'].includes(l.plan_name.toLowerCase())).length,
        free: listings.filter(l => !l.plan_name || l.plan_name.toLowerCase() === 'free').length,
        unclaimed: listings.filter(l => !l.claimed).length,
        outreach: listings.filter(l => !!l.outreach_status).length,
        new: listings.filter(l => new Date(l.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
    };

    const TABS: { key: TabKey; label: string }[] = [
        { key: 'all', label: `All (${counts.all})` },
        { key: 'premium', label: `Premium (${counts.premium})` },
        { key: 'free', label: `Free (${counts.free})` },
        { key: 'unclaimed', label: `Unclaimed (${counts.unclaimed})` },
        { key: 'outreach', label: `In Outreach (${counts.outreach})` },
        { key: 'new', label: `New (${counts.new})` },
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
                <div className="flex items-center gap-3">
                    <button
                        onClick={exportCSV}
                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-bold transition shadow-sm"
                    >
                        <Download size={15} /> Export CSV
                    </button>
                    <button
                        onClick={refreshPhotos}
                        disabled={refreshingPhotos}
                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-bold transition shadow-sm disabled:opacity-50"
                    >
                        {refreshingPhotos ? <Loader2 size={15} className="animate-spin" /> : <ImageIcon size={15} />}
                        {refreshingPhotos ? 'Refreshing...' : 'Refresh Photos & Ratings'}
                    </button>
                    <Link href="/dashboard/listings/new"
                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white rounded-xl text-sm font-bold transition shadow-sm">
                        <Plus size={15} /> Add Business
                    </Link>
                </div>
            </div>

            {/* Toast */}
            {toast && (
                <div className={`flex items-center gap-3 p-4 rounded-xl text-sm font-medium ${toast.type === 'success' ? 'bg-secondary-50 text-secondary-700 border border-secondary-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
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
                            className={`px-5 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${tab === t.key ? 'text-primary-600 border-primary-600 bg-primary-50/40 dark:bg-primary-900/10' : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Search + bulk actions */}
                <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-50 dark:border-slate-800">
                    <div className="relative flex-1 max-w-sm">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input value={q} onChange={e => setQ(e.target.value)}
                            placeholder="Search by name..."
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-400 dark:bg-slate-950 dark:border-slate-700 dark:text-white" />
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        {selected.size > 0 && (
                            <button onClick={() => setBulkDeleteConfirm(true)}
                                className="flex items-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition">
                                <Trash2 size={14} /> Delete {selected.size} selected
                            </button>
                        )}
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
                                <th className="px-4 py-3.5">
                                    <input type="checkbox" checked={allSelected} onChange={toggleSelectAll}
                                        className="w-4 h-4 rounded border-gray-300 text-primary-600 cursor-pointer" />
                                </th>
                                {[
                                    { label: 'Name', key: 'name' },
                                    { label: 'Plan', key: 'plan_name' },
                                    { label: 'Status', key: 'active' },
                                    { label: 'Claimed', key: 'claimed' },
                                    { label: 'Outreach', key: 'outreach_status' },
                                    { label: 'Address', key: 'location_city' },
                                    { label: 'Phone', key: 'phone' },
                                ].map(col => (
                                    <th key={col.key} onClick={() => toggleSort(col.key)}
                                        className="px-6 py-3.5 font-semibold cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 select-none whitespace-nowrap">
                                        {col.label}{sortIcon(col.key)}
                                    </th>
                                ))}
                                <th className="px-6 py-3.5 font-semibold text-center">Active</th>
                                <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                            {isLoading ? (
                                <tr><td colSpan={9} className="py-16 text-center">
                                    <Loader2 size={20} className="animate-spin text-primary-400 mx-auto" />
                                </td></tr>
                            ) : sorted.length === 0 ? (
                                <tr><td colSpan={9} className="py-16 text-center text-gray-400 text-sm">
                                    No businesses in this tab.{' '}
                                    {tab !== 'all' && <button onClick={() => setTab('all')} className="text-primary-500 font-semibold hover:underline">View all</button>}
                                </td></tr>
                            ) : sorted.map(l => (
                                <tr key={l.id} className={`transition-colors group ${selected.has(l.id) ? 'bg-primary-50/50 dark:bg-primary-900/10' : 'hover:bg-gray-50 dark:hover:bg-slate-800/40'}`}>
                                    {/* Checkbox */}
                                    <td className="px-4 py-4">
                                        <input type="checkbox" checked={selected.has(l.id)} onChange={() => toggleSelect(l.id)}
                                            className="w-4 h-4 rounded border-gray-300 text-primary-600 cursor-pointer" />
                                    </td>
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
                                        <span className={`text-xs font-semibold ${l.active ? 'text-secondary-600' : 'text-gray-400'}`}>
                                            {l.active ? 'published' : 'unpublished'}
                                        </span>
                                    </td>
                                    {/* Claimed */}
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 text-xs font-medium ${l.claimed ? 'text-secondary-600' : 'text-amber-600'}`}>
                                            {l.claimed ? <><CheckCircle2 size={12} /> Claimed</> : <><XCircle size={12} /> Unclaimed</>}
                                        </span>
                                    </td>
                                    {/* Outreach */}
                                    <td className="px-6 py-4">
                                        {(() => {
                                            const info = outreachLabel(l.outreach_status);
                                            if (!info) return <span className="text-xs text-slate-300 dark:text-slate-600">—</span>;
                                            return (
                                                <span className={`inline-flex items-center gap-1 text-xs font-semibold ${info.color}`}>
                                                    <Mail size={11} />
                                                    {info.label}
                                                    {(l.outreach_opens ?? 0) > 0 && <span className="text-amber-500 ml-1">👁 {l.outreach_opens}</span>}
                                                    {(l.outreach_clicks ?? 0) > 0 && <span className="text-green-500">↗ {l.outreach_clicks}</span>}
                                                </span>
                                            );
                                        })()}
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
                                            {l.phone || '—'}
                                        </span>
                                    </td>
                                    {/* Active toggle */}
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center">
                                            <Toggle checked={l.active} onChange={() => toggleActive(l)} />
                                        </div>
                                    </td>
                                    {/* Actions */}
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link href={`/biz/${l.slug}`} target="_blank"
                                                className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition" title="View">
                                                <Eye size={15} />
                                            </Link>
                                            <Link href={`/dashboard/listings/${l.id}`}
                                                className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition" title="Edit">
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

                {/* Footer */}
                {filtered.length > 0 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-50 dark:border-slate-800 text-sm text-gray-500">
                        <span>
                            {selected.size > 0
                                ? <span className="text-primary-600 font-semibold">{selected.size} selected — </span>
                                : null}
                            Showing <span className="font-bold text-gray-800 dark:text-white">{filtered.length}</span> of <span className="font-bold text-gray-800 dark:text-white">{listings.length}</span> businesses
                        </span>
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

            {/* Single delete confirm */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
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

            {/* Bulk delete confirm */}
            {bulkDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
                        <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 size={22} className="text-red-500" />
                        </div>
                        <h3 className="text-lg font-bold mb-2">Delete {selected.size} listings?</h3>
                        <p className="text-sm text-gray-500 mb-6">This will permanently remove all selected listings and their outreach data.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setBulkDeleteConfirm(false)} disabled={bulkDeleting} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
                            <button onClick={bulkDelete} disabled={bulkDeleting} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition flex items-center justify-center gap-2">
                                {bulkDeleting ? <><Loader2 size={15} className="animate-spin" /> Deleting...</> : 'Delete All'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
