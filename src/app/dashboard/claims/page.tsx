'use client';

import { useEffect, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, Clock, Building2, Mail, User, ExternalLink } from 'lucide-react';

interface Claim {
    id: number;
    name: string;
    slug: string;
    category: string;
    location_city: string;
    claim_status: string;
    claimant_name: string | null;
    claimant_email: string | null;
    contact_email: string | null;
    claimed_on: string | null;
}

type Tab = 'pending' | 'approved' | 'rejected';

export default function ClaimsPage() {
    const [tab, setTab] = useState<Tab>('pending');
    const [claims, setClaims] = useState<Claim[]>([]);
    const [loading, setLoading] = useState(true);
    const [acting, setActing] = useState<number | null>(null);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

    const showToast = (type: 'success' | 'error', msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchClaims = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/claims?status=${tab}`);
            const d = await res.json();
            if (d.success) setClaims(d.data);
        } catch {
            showToast('error', 'Failed to load claims.');
        } finally {
            setLoading(false);
        }
    }, [tab]);

    useEffect(() => { fetchClaims(); }, [fetchClaims]);

    const handleAction = async (listingId: number, action: 'approve' | 'reject') => {
        setActing(listingId);
        try {
            const res = await fetch('/api/admin/claims', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ listingId, action }),
            });
            const d = await res.json();
            if (d.success) {
                showToast('success', action === 'approve' ? 'Claim approved — SMB notified.' : 'Claim rejected.');
                fetchClaims();
            } else {
                showToast('error', d.error || 'Action failed.');
            }
        } catch {
            showToast('error', 'Network error.');
        } finally {
            setActing(null);
        }
    };

    const tabs: { key: Tab; label: string }[] = [
        { key: 'pending', label: 'Pending' },
        { key: 'approved', label: 'Approved' },
        { key: 'rejected', label: 'Rejected' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Claim Requests</h1>
                <p className="text-slate-500 text-sm mt-1">Review and approve SMB listing claims before granting portal access.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
                {tabs.map(t => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${tab === t.key
                            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Claims list */}
            {loading ? (
                <div className="flex justify-center py-16">
                    <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : claims.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
                    <Clock size={32} className="text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">No {tab} claims.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {claims.map(claim => (
                        <div key={claim.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center gap-4 flex-wrap">
                            {/* Business info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <Building2 size={15} className="text-slate-400 shrink-0" />
                                    <p className="font-bold text-slate-900 dark:text-white truncate">{claim.name}</p>
                                    <a href={`/biz/${claim.slug}`} target="_blank" className="text-slate-400 hover:text-primary-500 transition shrink-0">
                                        <ExternalLink size={13} />
                                    </a>
                                </div>
                                <p className="text-xs text-slate-400 ml-5 mb-2">{claim.category} · {claim.location_city}</p>
                                <div className="flex flex-wrap gap-3 ml-5">
                                    {claim.claimant_name && (
                                        <span className="flex items-center gap-1 text-xs text-slate-500">
                                            <User size={11} /> {claim.claimant_name}
                                        </span>
                                    )}
                                    {(claim.claimant_email || claim.contact_email) && (
                                        <span className="flex items-center gap-1 text-xs text-slate-500">
                                            <Mail size={11} /> {claim.claimant_email || claim.contact_email}
                                        </span>
                                    )}
                                    {claim.claimed_on && (
                                        <span className="text-xs text-slate-400">
                                            {new Date(claim.claimed_on).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            {tab === 'pending' && (
                                <div className="flex gap-2 shrink-0">
                                    <button
                                        onClick={() => handleAction(claim.id, 'reject')}
                                        disabled={acting === claim.id}
                                        className="flex items-center gap-1.5 px-3 py-2 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition"
                                    >
                                        <XCircle size={15} /> Reject
                                    </button>
                                    <button
                                        onClick={() => handleAction(claim.id, 'approve')}
                                        disabled={acting === claim.id}
                                        className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold disabled:opacity-50 transition"
                                    >
                                        {acting === claim.id
                                            ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            : <><CheckCircle2 size={15} /> Approve</>}
                                    </button>
                                </div>
                            )}

                            {tab === 'approved' && (
                                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold">
                                    <CheckCircle2 size={13} /> Approved
                                </span>
                            )}
                            {tab === 'rejected' && (
                                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold">
                                    <XCircle size={13} /> Rejected
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-6 right-6 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-semibold z-50 ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
                    {toast.msg}
                </div>
            )}
        </div>
    );
}
