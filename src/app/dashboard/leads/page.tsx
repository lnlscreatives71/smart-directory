'use client';
import { useState, useEffect } from 'react';
import { OutreachCampaign } from '@/lib/types';
import { Mail, Clock, CheckCircle2, RefreshCw, Send, Building2 } from 'lucide-react';

export default function CRMLayoutPage() {
    const [campaigns, setCampaigns] = useState<OutreachCampaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);

    const fetchCampaigns = async () => {
        setLoading(true);
        try {
            // We'll construct a direct fetch, or use an API route. 
            // For simplicity in this CRM UI, providing inline fetching logic (would typically be an API route, I will make an API route in next step, but let's build the UI first!)
            const res = await fetch('/api/crm');
            const data = await res.json();
            if (data.success) {
                setCampaigns(data.data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const forceSync = async (forceClaimedWait = false) => {
        setSyncing(true);
        try {
            const res = await fetch('/api/cron/outreach', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ forceRun: forceClaimedWait })
            });
            const data = await res.json();
            setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${data.message}`, ...prev]);
            fetchCampaigns();
        } catch (e: any) {
            setLogs(prev => [`Error running CRM sync: ${e.message}`, ...prev]);
        } finally {
            setSyncing(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">CRM & Outreach Campaigns</h1>
                    <p className="text-sm text-slate-500 mt-1">Automated 3-step verification and premium upgrade flows.</p>
                </div>
                <div className="flex gap-3 text-sm">
                    <button
                        onClick={() => forceSync(false)}
                        disabled={syncing}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:hover:bg-slate-800 dark:text-slate-300 py-2.5 px-4 rounded-lg font-medium shadow-sm transition-colors flex items-center disabled:opacity-50"
                    >
                        {syncing ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                        Standard Sync
                    </button>
                    <button
                        onClick={() => forceSync(true)}
                        disabled={syncing}
                        className="bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg font-medium shadow-sm transition-colors flex items-center disabled:opacity-50"
                        title="Bypasses the 5-7 day waiting period for Follow Ups"
                    >
                        <Send className="mr-2 h-4 w-4" />
                        Force Push Queue
                    </button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center text-slate-500 mb-2 font-medium text-sm">
                        <Clock className="w-4 h-4 mr-2" /> Pending Verification
                    </div>
                    <div className="text-2xl font-bold">{campaigns.filter(c => c.status === 'pending').length}</div>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm border-b-4 border-b-blue-500">
                    <div className="flex items-center text-slate-500 mb-2 font-medium text-sm">
                        <Mail className="w-4 h-4 mr-2 text-blue-500" /> Active Sequences
                    </div>
                    <div className="text-2xl font-bold">{campaigns.filter(c => c.status === 'email_1_sent' || c.status === 'email_2_sent').length}</div>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm border-b-4 border-b-emerald-500">
                    <div className="flex items-center text-slate-500 mb-2 font-medium text-sm">
                        <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" /> Profiles Claimed
                    </div>
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{campaigns.filter(c => c.claimed).length}</div>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm border-b-4 border-b-slate-400">
                    <div className="flex items-center text-slate-500 mb-2 font-medium text-sm">
                        <CheckCircle2 className="w-4 h-4 mr-2" /> Completed Cycle
                    </div>
                    <div className="text-2xl font-bold">{campaigns.filter(c => c.status === 'completed').length}</div>
                </div>
            </div>

            {logs.length > 0 && (
                <div className="bg-slate-900 text-green-400 font-mono text-xs p-4 rounded-xl max-h-32 overflow-y-auto mb-6">
                    {logs.map((log, i) => <div key={i}>{log}</div>)}
                </div>
            )}

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/50">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center">
                        <Building2 className="w-4 h-4 mr-2 text-slate-400" /> Pipeline Database
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Business Prospect</th>
                                <th className="px-6 py-4 font-semibold">Contact Email</th>
                                <th className="px-6 py-4 font-semibold">Funnel Status</th>
                                <th className="px-6 py-4 font-semibold">Last Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">Loading pipeline...</td></tr>
                            ) : campaigns.length === 0 ? (
                                <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">No campaigns found. Ensure businesses have an email address injected.</td></tr>
                            ) : (
                                campaigns.map(camp => (
                                    <tr key={camp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-900 dark:text-slate-100">{camp.listing_name}</div>
                                            {camp.claimed ? (
                                                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold ml-0">CLAIMED</span>
                                            ) : (
                                                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full ml-0">UNCLAIMED</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">{camp.listing_email || <span className="opacity-50">None</span>}</td>
                                        <td className="px-6 py-4">
                                            {camp.status === 'pending' && <span className="px-2.5 py-1 rounded bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-500 font-medium text-xs">Waiting in Queue</span>}
                                            {camp.status === 'email_1_sent' && <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-500 font-medium text-xs">Email 1 (Verify)</span>}
                                            {camp.status === 'email_2_sent' && <span className="px-2.5 py-1 rounded bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-500 font-medium text-xs">Email 2 (Upgrade)</span>}
                                            {camp.status === 'completed' && <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 font-medium text-xs">Sequence Complete</span>}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 text-xs text-right">
                                            {camp.status === 'pending' && '---'}
                                            {camp.status === 'email_1_sent' && camp.email_1_sent_at && new Date(camp.email_1_sent_at).toLocaleString()}
                                            {(camp.status === 'completed' || camp.status === 'email_2_sent') && camp.email_2_sent_at && new Date(camp.email_2_sent_at).toLocaleString()}
                                            {camp.status === 'completed' && !camp.email_2_sent_at && camp.email_3_sent_at && new Date(camp.email_3_sent_at).toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
