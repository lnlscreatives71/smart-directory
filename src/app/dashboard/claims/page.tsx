'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle, Clock, Building2, Mail, User, ExternalLink, Globe, Phone } from 'lucide-react';

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

interface NewBizRequest {
    id: number;
    name: string;
    category: string;
    description: string | null;
    phone: string | null;
    website: string | null;
    location_city: string;
    location_state: string;
    contact_name: string;
    contact_email: string;
    status: string;
    created_at: string;
}

type Section = 'claims' | 'new-requests';
type ClaimTab = 'pending' | 'approved' | 'rejected';

export default function ClaimsPage() {
    const searchParams = useSearchParams();
    const [section, setSection] = useState<Section>(
        searchParams.get('tab') === 'new-requests' ? 'new-requests' : 'claims'
    );

    // Claims state
    const [claimTab, setClaimTab] = useState<ClaimTab>('pending');
    const [claims, setClaims] = useState<Claim[]>([]);
    const [claimsLoading, setClaimsLoading] = useState(true);
    const [claimActing, setClaimActing] = useState<number | null>(null);

    // New biz requests state
    const [nbrTab, setNbrTab] = useState<ClaimTab>('pending');
    const [requests, setRequests] = useState<NewBizRequest[]>([]);
    const [requestsLoading, setRequestsLoading] = useState(true);
    const [nbrActing, setNbrActing] = useState<number | null>(null);

    const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

    const showToast = (type: 'success' | 'error', msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3500);
    };

    // Fetch claims
    const fetchClaims = useCallback(async () => {
        setClaimsLoading(true);
        try {
            const res = await fetch(`/api/admin/claims?status=${claimTab}`);
            const d = await res.json();
            if (d.success) setClaims(d.data);
        } catch {
            showToast('error', 'Failed to load claims.');
        } finally {
            setClaimsLoading(false);
        }
    }, [claimTab]);

    // Fetch new biz requests
    const fetchRequests = useCallback(async () => {
        setRequestsLoading(true);
        try {
            const res = await fetch(`/api/admin/new-business-requests?status=${nbrTab}`);
            const d = await res.json();
            if (d.success) setRequests(d.data);
        } catch {
            showToast('error', 'Failed to load requests.');
        } finally {
            setRequestsLoading(false);
        }
    }, [nbrTab]);

    useEffect(() => { fetchClaims(); }, [fetchClaims]);
    useEffect(() => { fetchRequests(); }, [fetchRequests]);

    const handleClaimAction = async (listingId: number, action: 'approve' | 'reject') => {
        setClaimActing(listingId);
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
            setClaimActing(null);
        }
    };

    const handleNbrAction = async (requestId: number, action: 'approve' | 'reject') => {
        setNbrActing(requestId);
        try {
            const res = await fetch('/api/admin/new-business-requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requestId, action }),
            });
            const d = await res.json();
            if (d.success) {
                showToast('success', action === 'approve' ? 'Approved — listing created & SMB notified.' : 'Request rejected — SMB notified.');
                fetchRequests();
            } else {
                showToast('error', d.error || 'Action failed.');
            }
        } catch {
            showToast('error', 'Network error.');
        } finally {
            setNbrActing(null);
        }
    };

    const statusTabs: { key: ClaimTab; label: string }[] = [
        { key: 'pending', label: 'Pending' },
        { key: 'approved', label: 'Approved' },
        { key: 'rejected', label: 'Rejected' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Business Requests</h1>
                <p className="text-slate-500 text-sm mt-1">Review claim requests and new business submissions.</p>
            </div>

            {/* Section switcher */}
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
                <button
                    onClick={() => setSection('claims')}
                    className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${section === 'claims'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                    Claim Requests
                </button>
                <button
                    onClick={() => setSection('new-requests')}
                    className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${section === 'new-requests'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                    New Business Requests
                </button>
            </div>

            {/* ── CLAIM REQUESTS ─────────────────────────────────────────── */}
            {section === 'claims' && (
                <>
                    <div className="flex gap-1 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl w-fit">
                        {statusTabs.map(t => (
                            <button
                                key={t.key}
                                onClick={() => setClaimTab(t.key)}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${claimTab === t.key
                                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {claimsLoading ? (
                        <div className="flex justify-center py-16">
                            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : claims.length === 0 ? (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
                            <Clock size={32} className="text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500 text-sm">No {claimTab} claims.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {claims.map(claim => (
                                <div key={claim.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center gap-4 flex-wrap">
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
                                    {claimTab === 'pending' && (
                                        <div className="flex gap-2 shrink-0">
                                            <button
                                                onClick={() => handleClaimAction(claim.id, 'reject')}
                                                disabled={claimActing === claim.id}
                                                className="flex items-center gap-1.5 px-3 py-2 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition"
                                            >
                                                <XCircle size={15} /> Reject
                                            </button>
                                            <button
                                                onClick={() => handleClaimAction(claim.id, 'approve')}
                                                disabled={claimActing === claim.id}
                                                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold disabled:opacity-50 transition"
                                            >
                                                {claimActing === claim.id
                                                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    : <><CheckCircle2 size={15} /> Approve</>}
                                            </button>
                                        </div>
                                    )}
                                    {claimTab === 'approved' && (
                                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold">
                                            <CheckCircle2 size={13} /> Approved
                                        </span>
                                    )}
                                    {claimTab === 'rejected' && (
                                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold">
                                            <XCircle size={13} /> Rejected
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* ── NEW BUSINESS REQUESTS ──────────────────────────────────── */}
            {section === 'new-requests' && (
                <>
                    <div className="flex gap-1 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl w-fit">
                        {statusTabs.map(t => (
                            <button
                                key={t.key}
                                onClick={() => setNbrTab(t.key)}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${nbrTab === t.key
                                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {requestsLoading ? (
                        <div className="flex justify-center py-16">
                            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
                            <Clock size={32} className="text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500 text-sm">No {nbrTab} business requests.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {requests.map(req => (
                                <div key={req.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-start gap-4 flex-wrap">
                                    <div className="flex-1 min-w-0 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Building2 size={15} className="text-slate-400 shrink-0" />
                                            <p className="font-bold text-slate-900 dark:text-white truncate">{req.name}</p>
                                        </div>
                                        <p className="text-xs text-slate-400 ml-5">{req.category} · {req.location_city}, {req.location_state}</p>
                                        {req.description && (
                                            <p className="text-xs text-slate-500 ml-5 line-clamp-2">{req.description}</p>
                                        )}
                                        <div className="flex flex-wrap gap-3 ml-5">
                                            <span className="flex items-center gap-1 text-xs text-slate-500">
                                                <User size={11} /> {req.contact_name}
                                            </span>
                                            <span className="flex items-center gap-1 text-xs text-slate-500">
                                                <Mail size={11} /> {req.contact_email}
                                            </span>
                                            {req.phone && (
                                                <span className="flex items-center gap-1 text-xs text-slate-500">
                                                    <Phone size={11} /> {req.phone}
                                                </span>
                                            )}
                                            {req.website && (
                                                <a href={req.website} target="_blank" className="flex items-center gap-1 text-xs text-primary-500 hover:underline">
                                                    <Globe size={11} /> {req.website}
                                                </a>
                                            )}
                                            <span className="text-xs text-slate-400">
                                                {new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>

                                    {nbrTab === 'pending' && (
                                        <div className="flex gap-2 shrink-0">
                                            <button
                                                onClick={() => handleNbrAction(req.id, 'reject')}
                                                disabled={nbrActing === req.id}
                                                className="flex items-center gap-1.5 px-3 py-2 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition"
                                            >
                                                <XCircle size={15} /> Reject
                                            </button>
                                            <button
                                                onClick={() => handleNbrAction(req.id, 'approve')}
                                                disabled={nbrActing === req.id}
                                                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold disabled:opacity-50 transition"
                                            >
                                                {nbrActing === req.id
                                                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    : <><CheckCircle2 size={15} /> Approve</>}
                                            </button>
                                        </div>
                                    )}
                                    {nbrTab === 'approved' && (
                                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold">
                                            <CheckCircle2 size={13} /> Approved
                                        </span>
                                    )}
                                    {nbrTab === 'rejected' && (
                                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold">
                                            <XCircle size={13} /> Rejected
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </>
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
