'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    Mail, Send, RefreshCw, Eye, MousePointerClick, CheckCircle2,
    Clock, XCircle, SkipForward, RotateCcw, AlertTriangle,
    Search, ChevronLeft, ChevronRight, Zap, Users, TrendingUp
} from 'lucide-react';

const STATUS_TABS = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Queued' },
    { id: 'email_1_sent', label: 'Email 1' },
    { id: 'email_2_sent', label: 'Email 2' },
    { id: 'email_3_sent', label: 'Email 3' },
    { id: 'completed', label: 'Done' },
];

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
    pending:      { label: 'Queued',    className: 'bg-slate-700 text-slate-300' },
    email_1_sent: { label: 'Email 1',   className: 'bg-blue-900/60 text-blue-300' },
    email_2_sent: { label: 'Email 2',   className: 'bg-indigo-900/60 text-indigo-300' },
    email_3_sent: { label: 'Email 3',   className: 'bg-violet-900/60 text-violet-300' },
    email_4_sent: { label: 'Email 4',   className: 'bg-purple-900/60 text-purple-300' },
    completed:    { label: 'Done',      className: 'bg-emerald-900/60 text-emerald-300' },
};

function StatCard({ label, value, sub, icon: Icon, color }: { label: string; value: string | number; sub?: string; icon: any; color: string }) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-start gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                <Icon size={18} className="text-white" />
            </div>
            <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
                <p className="text-sm text-slate-500">{label}</p>
                {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

export default function OutreachPage() {
    const [stats, setStats] = useState<any>(null);
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState('all');
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [sendResult, setSendResult] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ status, page: String(page), search });
            const res = await fetch(`/api/outreach?${params}`);
            const data = await res.json();
            if (data.success) {
                setStats(data.stats);
                setCampaigns(data.campaigns);
                setTotal(data.total);
            }
        } finally {
            setLoading(false);
        }
    }, [status, page, search]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Debounced auto-search: fires 400ms after user stops typing
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput);
            setPage(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearch(searchInput);
        setPage(1);
    };

    const handleTabChange = (tab: string) => {
        setStatus(tab);
        setPage(1);
    };

    const handleSendNow = async (limit: number) => {
        setSending(true);
        setSendResult(null);
        try {
            const res = await fetch(`/api/cron/all?limit=${limit}`, { method: 'GET' });
            const data = await res.json();
            const outreach = data.results?.outreach;
            if (outreach?.breakdown) {
                const { email1, email2, email3, email4 } = outreach.breakdown;
                const sent = email1 + email2 + email3 + email4;
                setSendResult(`Sent ${sent} email${sent !== 1 ? 's' : ''} (E1:${email1} E2:${email2} E3:${email3} E4:${email4})`);
            } else {
                setSendResult(outreach?.error || 'Run complete');
            }
            fetchData();
        } catch {
            setSendResult('Error — check Vercel logs');
        } finally {
            setSending(false);
        }
    };

    const handleAction = async (id: number, action: string) => {
        setActionLoading(id);
        await fetch('/api/outreach', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, action }),
        });
        await fetchData();
        setActionLoading(null);
    };

    const totalPages = Math.ceil(total / 50);

    const openRate = stats ? (Number(stats.unique_openers) / Math.max(Number(stats.total_emailed), 1) * 100).toFixed(1) : '0';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Outreach</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Email sequence management for all {stats ? Number(stats.total).toLocaleString() : '—'} contacts</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    {sendResult && (
                        <span className="text-sm text-emerald-400 bg-emerald-900/20 px-3 py-1.5 rounded-lg border border-emerald-800">
                            {sendResult}
                        </span>
                    )}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500">Send batch:</span>
                        {[5, 10, 20].map(n => (
                            <button
                                key={n}
                                onClick={() => handleSendNow(n)}
                                disabled={sending}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition"
                            >
                                {sending ? <RefreshCw size={13} className="animate-spin" /> : <Zap size={13} />}
                                {n}
                            </button>
                        ))}
                    </div>
                    <button onClick={fetchData} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-4">
                    <StatCard label="Queued" value={Number(stats.queued).toLocaleString()} icon={Clock} color="bg-slate-500" />
                    <StatCard label="Email 1 Sent" value={Number(stats.email1).toLocaleString()} icon={Mail} color="bg-blue-600" />
                    <StatCard label="Email 2 Sent" value={Number(stats.email2).toLocaleString()} icon={Mail} color="bg-indigo-600" />
                    <StatCard label="Email 3 Sent" value={Number(stats.email3).toLocaleString()} icon={Mail} color="bg-violet-600" />
                    <StatCard label="Unique Openers" value={Number(stats.unique_openers).toLocaleString()} sub={`${openRate}% open rate`} icon={Eye} color="bg-amber-500" />
                    <StatCard label="Clicks" value={Number(stats.total_clicks).toLocaleString()} sub={`${Number(stats.sent_today)} sent today`} icon={TrendingUp} color="bg-emerald-600" />
                    <StatCard label="Unsubscribed" value={Number(stats.unsubscribed).toLocaleString()} icon={XCircle} color="bg-red-700" />
                </div>
            )}

            {/* Filters */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between gap-4 p-4 border-b border-slate-200 dark:border-slate-800 flex-wrap">
                    {/* Status tabs */}
                    <div className="flex gap-1 flex-wrap">
                        {STATUS_TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${status === tab.id
                                    ? 'bg-primary-600 text-white'
                                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                            >
                                {tab.label}
                                {stats && tab.id !== 'all' && (
                                    <span className="ml-1.5 text-xs opacity-70">
                                        {tab.id === 'pending' ? Number(stats.queued)
                                            : tab.id === 'email_1_sent' ? Number(stats.email1)
                                            : tab.id === 'email_2_sent' ? Number(stats.email2)
                                            : tab.id === 'email_3_sent' ? Number(stats.email3)
                                            : Number(stats.completed)}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                    {/* Search */}
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="relative">
                            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                value={searchInput}
                                onChange={e => setSearchInput(e.target.value)}
                                placeholder="Search name or email..."
                                className="pl-8 pr-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-1 focus:ring-primary-500 w-56"
                            />
                        </div>
                        <button type="submit" className="px-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition">Go</button>
                        {search && <button type="button" onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }} className="px-2 text-slate-400 hover:text-slate-600"><XCircle size={16} /></button>}
                    </form>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                                <th className="px-4 py-3">Business</th>
                                <th className="px-4 py-3">Email</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Last Sent</th>
                                <th className="px-4 py-3 text-center">Opens</th>
                                <th className="px-4 py-3 text-center">Clicks</th>
                                <th className="px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                Array.from({ length: 8 }).map((_, i) => (
                                    <tr key={i}>
                                        {Array.from({ length: 7 }).map((_, j) => (
                                            <td key={j} className="px-4 py-3">
                                                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-24" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : campaigns.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                                        <Users size={32} className="mx-auto mb-2 opacity-30" />
                                        No campaigns match this filter.
                                    </td>
                                </tr>
                            ) : campaigns.map(c => {
                                const badge = STATUS_BADGE[c.status] || { label: c.status, className: 'bg-slate-700 text-slate-300' };
                                const lastSent = c.email_4_sent_at || c.email_3_sent_at || c.email_2_sent_at || c.email_1_sent_at;
                                const isLoading = actionLoading === c.id;
                                return (
                                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                        <td className="px-4 py-3">
                                            <Link href={`/dashboard/leads/contact?id=${c.listing_id}`} className="font-medium text-slate-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                                                {c.name}
                                            </Link>
                                            {c.claimed && <span className="ml-2 text-xs text-emerald-400">✓ Claimed</span>}
                                            <p className="text-xs text-slate-400">{c.category}</p>
                                        </td>
                                        <td className="px-4 py-3 text-slate-500 font-mono text-xs">{c.contact_email || <span className="text-red-400">No email</span>}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>
                                                {badge.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-400 text-xs">
                                            {lastSent ? new Date(lastSent).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {Number(c.opens) > 0 ? (
                                                <span className="inline-flex items-center gap-1 text-amber-400 font-medium">
                                                    <Eye size={12} /> {c.opens}
                                                </span>
                                            ) : <span className="text-slate-600">—</span>}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {Number(c.clicks) > 0 ? (
                                                <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                                                    <MousePointerClick size={12} /> {c.clicks}
                                                </span>
                                            ) : <span className="text-slate-600">—</span>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                {c.status !== 'pending' && c.status !== 'completed' && (
                                                    <button
                                                        onClick={() => handleAction(c.id, 'skip')}
                                                        disabled={isLoading}
                                                        title="Skip to next email"
                                                        className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-900/20 rounded transition"
                                                    >
                                                        <SkipForward size={14} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleAction(c.id, 'reset')}
                                                    disabled={isLoading}
                                                    title="Reset to queued"
                                                    className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-900/20 rounded transition"
                                                >
                                                    <RotateCcw size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleAction(c.id, 'complete')}
                                                    disabled={isLoading}
                                                    title="Mark complete (stop sequence)"
                                                    className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-900/20 rounded transition"
                                                >
                                                    <CheckCircle2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => { if (confirm('Mark as bounced and clear email?')) handleAction(c.id, 'bounce'); }}
                                                    disabled={isLoading}
                                                    title="Mark bounced"
                                                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-900/20 rounded transition"
                                                >
                                                    <AlertTriangle size={14} />
                                                </button>
                                                {isLoading && <RefreshCw size={14} className="text-slate-400 animate-spin ml-1" />}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800">
                        <p className="text-sm text-slate-400">
                            Showing {((page - 1) * 50) + 1}–{Math.min(page * 50, total)} of {total.toLocaleString()}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-sm text-slate-500">Page {page} of {totalPages}</span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
