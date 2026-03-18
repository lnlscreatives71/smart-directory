'use client';
import { useState, useEffect, useRef } from 'react';
import { OutreachCampaign, ContactNote } from '@/lib/types';
import {
    Mail, Clock, CheckCircle2, RefreshCw, Send, Building2,
    Phone, MessageSquare, StickyNote, Trash2, ChevronDown, ChevronUp,
    KanbanSquare, ListFilter, Tag, Eye, MousePointerClick
} from 'lucide-react';

// ── Pipeline Stages ────────────────────────────────────────────────────────
const STAGES = [
    { id: 'prospect', label: 'Prospect', color: 'bg-slate-500' },
    { id: 'contacted', label: 'Contacted', color: 'bg-blue-500' },
    { id: 'engaged', label: 'Engaged', color: 'bg-indigo-500' },
    { id: 'claimed', label: 'Claimed', color: 'bg-amber-500' },
    { id: 'upgraded', label: 'Upgraded', color: 'bg-emerald-500' },
    { id: 'lost', label: 'Lost', color: 'bg-red-500' },
];

const NOTE_TYPES = [
    { id: 'manual', label: 'Note', icon: StickyNote, color: 'text-slate-400' },
    { id: 'call', label: 'Call', icon: Phone, color: 'text-green-400' },
    { id: 'email', label: 'Email', icon: Mail, color: 'text-blue-400' },
];

function getStage(id: string) {
    return STAGES.find(s => s.id === id) || STAGES[0];
}

function statusLabel(status: string) {
    const map: Record<string, string> = {
        pending: 'Queued',
        email_1_sent: 'Email 1 Sent',
        email_2_sent: 'Email 2 Sent',
        email_3_sent: 'Email 3 Sent',
        email_4_sent: 'Email 4 Sent',
        completed: 'Sequence Done',
    };
    return map[status] || status;
}

// ── Notes Panel ─────────────────────────────────────────────────────────────
function NotesPanel({ campaign }: { campaign: OutreachCampaign }) {
    const [notes, setNotes] = useState<ContactNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState('');
    const [noteType, setNoteType] = useState<'manual' | 'call' | 'email'>('manual');
    const [saving, setSaving] = useState(false);
    const textRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        fetch(`/api/crm/notes?campaign_id=${campaign.id}`)
            .then(r => r.json())
            .then(d => { if (d.success) setNotes(d.data); })
            .finally(() => setLoading(false));
    }, [campaign.id]);

    const addNote = async () => {
        if (!content.trim()) return;
        setSaving(true);
        const res = await fetch('/api/crm/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ campaign_id: campaign.id, content, note_type: noteType }),
        });
        const data = await res.json();
        if (data.success) {
            setNotes(prev => [data.data, ...prev]);
            setContent('');
        }
        setSaving(false);
    };

    const deleteNote = async (id: number) => {
        await fetch(`/api/crm/notes?id=${id}`, { method: 'DELETE' });
        setNotes(prev => prev.filter(n => n.id !== id));
    };

    return (
        <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30">
            {/* Add note */}
            <div className="flex gap-2 mb-4">
                <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 flex-shrink-0">
                    {NOTE_TYPES.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setNoteType(t.id as any)}
                            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${noteType === t.id ? 'bg-primary-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                        >
                            <t.icon size={12} /> {t.label}
                        </button>
                    ))}
                </div>
                <textarea
                    ref={textRef}
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="Add a note, call log, or email record..."
                    rows={1}
                    className="flex-1 text-sm resize-none rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addNote(); } }}
                />
                <button
                    onClick={addNote}
                    disabled={saving || !content.trim()}
                    className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50 transition-colors flex-shrink-0"
                >
                    {saving ? <RefreshCw size={14} className="animate-spin" /> : 'Add'}
                </button>
            </div>

            {/* Notes list */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {loading && <p className="text-xs text-slate-400 text-center py-2">Loading activity...</p>}
                {!loading && notes.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-2">No activity yet. Add a note above.</p>
                )}
                {notes.map(note => {
                    const nt = NOTE_TYPES.find(t => t.id === note.note_type) || NOTE_TYPES[0];
                    return (
                        <div key={note.id} className="flex gap-3 group">
                            <div className={`mt-0.5 flex-shrink-0 ${nt.color}`}>
                                <nt.icon size={13} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{note.content}</p>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    {nt.label} · {new Date(note.created_at).toLocaleString()}
                                </p>
                            </div>
                            <button
                                onClick={() => deleteNote(note.id)}
                                className="text-slate-300 dark:text-slate-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                            >
                                <Trash2 size={13} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ── Kanban Board ─────────────────────────────────────────────────────────────
function KanbanBoard({ campaigns, onStageChange }: {
    campaigns: OutreachCampaign[];
    onStageChange: (campaignId: number, stage: string) => void;
}) {
    const [dragging, setDragging] = useState<number | null>(null);

    const grouped = STAGES.reduce((acc, stage) => {
        acc[stage.id] = campaigns.filter(c => (c.pipeline_stage || 'prospect') === stage.id);
        return acc;
    }, {} as Record<string, OutreachCampaign[]>);

    const onDragStart = (e: React.DragEvent, id: number) => {
        setDragging(id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const onDrop = (e: React.DragEvent, stageId: string) => {
        e.preventDefault();
        if (dragging !== null) {
            onStageChange(dragging, stageId);
            setDragging(null);
        }
    };

    return (
        <div className="flex gap-4 overflow-x-auto pb-4">
            {STAGES.map(stage => (
                <div
                    key={stage.id}
                    className="flex-shrink-0 w-64"
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => onDrop(e, stage.id)}
                >
                    <div className="flex items-center gap-2 mb-3">
                        <span className={`w-2.5 h-2.5 rounded-full ${stage.color}`} />
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{stage.label}</span>
                        <span className="ml-auto text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full">
                            {grouped[stage.id]?.length || 0}
                        </span>
                    </div>
                    <div className="space-y-2 min-h-[80px]">
                        {(grouped[stage.id] || []).map(c => (
                            <div
                                key={c.id}
                                draggable
                                onDragStart={e => onDragStart(e, c.id)}
                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                            >
                                <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">{c.listing_name}</p>
                                <p className="text-xs text-slate-400 truncate mt-0.5">{c.listing_email || 'No email'}</p>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded">
                                        {statusLabel(c.status)}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        {c.opens > 0 && (
                                            <span className="flex items-center gap-0.5 text-[10px] font-medium text-amber-500">
                                                <Eye size={9} /> {c.opens}
                                            </span>
                                        )}
                                        {c.clicks > 0 && (
                                            <span className="flex items-center gap-0.5 text-[10px] font-medium text-green-500">
                                                <MousePointerClick size={9} /> {c.clicks}
                                            </span>
                                        )}
                                        {c.ab_variant && (
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${c.ab_variant === 'A' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'}`}>
                                                {c.ab_variant}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {(grouped[stage.id] || []).length === 0 && (
                            <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl h-16 flex items-center justify-center">
                                <span className="text-xs text-slate-300 dark:text-slate-700">Drop here</span>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function CRMPage() {
    const [campaigns, setCampaigns] = useState<OutreachCampaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [view, setView] = useState<'list' | 'kanban'>('list');
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [batchLimit, setBatchLimit] = useState<string>('20');
    const [showBatchInput, setShowBatchInput] = useState(false);

    const fetchCampaigns = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/crm');
            const data = await res.json();
            if (data.success) setCampaigns(data.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchCampaigns(); }, []);

    const forceSync = async (forceRun = false, limit?: number) => {
        setSyncing(true);
        setShowBatchInput(false);
        try {
            const body: Record<string, any> = { forceRun };
            if (limit) body.limit = limit;
            const res = await fetch('/api/cron/outreach', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${data.message}`, ...prev]);
            fetchCampaigns();
        } catch (e: any) {
            setLogs(prev => [`Error: ${e.message}`, ...prev]);
        } finally { setSyncing(false); }
    };

    const handleStageChange = async (campaignId: number, stage: string) => {
        setCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, pipeline_stage: stage as any } : c));
        await fetch('/api/crm/stage', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ campaign_id: campaignId, stage }),
        });
    };

    // Metrics
    const metrics = [
        { label: 'Pending', value: campaigns.filter(c => c.status === 'pending').length, icon: Clock, accent: '' },
        { label: 'Active Sequences', value: campaigns.filter(c => ['email_1_sent', 'email_2_sent', 'email_3_sent'].includes(c.status)).length, icon: Mail, accent: 'border-b-4 border-b-primary-500' },
        { label: 'Opened Email', value: campaigns.filter(c => c.opens > 0).length, icon: Eye, accent: 'border-b-4 border-b-amber-500' },
        { label: 'Clicked Link', value: campaigns.filter(c => c.clicks > 0).length, icon: MousePointerClick, accent: 'border-b-4 border-b-green-500' },
        { label: 'Claimed', value: campaigns.filter(c => c.claimed).length, icon: CheckCircle2, accent: 'border-b-4 border-b-emerald-500' },
        { label: 'Sequence Done', value: campaigns.filter(c => c.status === 'completed').length, icon: CheckCircle2, accent: '' },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">CRM & Outreach Pipeline</h1>
                    <p className="text-sm text-slate-500 mt-1">Automated 4-step verification and premium upgrade flows with A/B testing.</p>
                </div>
                <div className="flex gap-3 text-sm flex-wrap">
                    {/* View toggle */}
                    <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                        <button onClick={() => setView('list')} className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${view === 'list' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                            <ListFilter size={13} /> List
                        </button>
                        <button onClick={() => setView('kanban')} className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${view === 'kanban' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                            <KanbanSquare size={13} /> Kanban
                        </button>
                    </div>
                    <button onClick={() => forceSync(false)} disabled={syncing} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 py-2 px-4 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50">
                        <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} /> Sync
                    </button>
                    <div className="relative">
                        <div className="flex rounded-lg overflow-hidden border border-primary-600 shadow-sm">
                            <button
                                onClick={() => forceSync(true, parseInt(batchLimit) || undefined)}
                                disabled={syncing}
                                className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 font-medium transition-colors flex items-center gap-2 disabled:opacity-50 text-sm"
                            >
                                <Send size={14} /> Send {batchLimit || 'All'}
                            </button>
                            <button
                                onClick={() => setShowBatchInput(v => !v)}
                                className="bg-primary-700 hover:bg-primary-800 text-white px-2 py-2 transition-colors text-xs"
                            >
                                ▾
                            </button>
                        </div>
                        {showBatchInput && (
                            <div className="absolute right-0 top-full mt-1 z-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-3 w-44">
                                <label className="text-xs text-slate-500 mb-1 block">Batch size</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={batchLimit}
                                    onChange={e => setBatchLimit(e.target.value)}
                                    className="w-full border border-slate-200 dark:border-slate-600 rounded-md px-2 py-1.5 text-sm dark:bg-slate-900 dark:text-white outline-none focus:border-primary-500"
                                />
                                <p className="text-xs text-slate-400 mt-1">Leave blank to send all</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {metrics.map(m => (
                    <div key={m.label} className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm ${m.accent}`}>
                        <div className="flex items-center text-slate-500 mb-2 font-medium text-sm gap-2">
                            <m.icon size={14} /> {m.label}
                        </div>
                        <div className="text-3xl font-bold text-slate-900 dark:text-white">{m.value}</div>
                    </div>
                ))}
            </div>

            {/* Console log */}
            {logs.length > 0 && (
                <div className="bg-slate-900 text-green-400 font-mono text-xs p-4 rounded-xl max-h-28 overflow-y-auto">
                    {logs.map((log, i) => <div key={i}>{log}</div>)}
                </div>
            )}

            {/* Kanban */}
            {view === 'kanban' && (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-6">
                        <KanbanSquare size={16} className="text-slate-400" /> Pipeline Board
                        <span className="text-xs text-slate-400 font-normal ml-1">— drag cards to move stages</span>
                    </h3>
                    {loading ? <p className="text-slate-400 text-sm">Loading...</p> : (
                        <KanbanBoard campaigns={campaigns} onStageChange={handleStageChange} />
                    )}
                </div>
            )}

            {/* List view */}
            {view === 'list' && (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 bg-slate-50/50 dark:bg-slate-950/50">
                        <Building2 size={15} className="text-slate-400" />
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200">Pipeline Database</h3>
                        <span className="ml-auto text-xs text-slate-400">{campaigns.length} contacts</span>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {loading ? (
                            <div className="px-6 py-8 text-center text-slate-400 text-sm">Loading pipeline...</div>
                        ) : campaigns.length === 0 ? (
                            <div className="px-6 py-8 text-center text-slate-400 text-sm">No campaigns found. Import businesses with email addresses to start.</div>
                        ) : campaigns.map(camp => {
                            const stage = getStage(camp.pipeline_stage || 'prospect');
                            const isOpen = expandedId === camp.id;
                            return (
                                <div key={camp.id}>
                                    <div
                                        className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer"
                                        onClick={() => setExpandedId(isOpen ? null : camp.id)}
                                    >
                                        {/* Business */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">{camp.listing_name}</span>
                                                {camp.claimed && <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold flex-shrink-0">CLAIMED</span>}
                                            </div>
                                            <span className="text-xs text-slate-400">{camp.listing_email || 'No email'}</span>
                                        </div>

                                        {/* Stage */}
                                        <select
                                            value={camp.pipeline_stage || 'prospect'}
                                            onClick={e => e.stopPropagation()}
                                            onChange={e => handleStageChange(camp.id, e.target.value)}
                                            className="text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary-500 flex-shrink-0"
                                        >
                                            {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                                        </select>

                                        {/* Email status */}
                                        <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded font-medium flex-shrink-0 hidden sm:block">
                                            {statusLabel(camp.status)}
                                        </span>

                                        {/* A/B badge */}
                                        {camp.ab_variant && (
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded flex-shrink-0 ${camp.ab_variant === 'A' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'}`}>
                                                Variant {camp.ab_variant}
                                            </span>
                                        )}

                                        {/* Opens */}
                                        {(camp.opens > 0) && (
                                            <span className="hidden sm:flex items-center gap-1 text-[10px] font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-2 py-1 rounded flex-shrink-0">
                                                <Eye size={10} /> {camp.opens}
                                            </span>
                                        )}

                                        {/* Clicks */}
                                        {(camp.clicks > 0) && (
                                            <span className="hidden sm:flex items-center gap-1 text-[10px] font-medium bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-2 py-1 rounded flex-shrink-0">
                                                <MousePointerClick size={10} /> {camp.clicks}
                                            </span>
                                        )}

                                        {/* Expand */}
                                        <button className="text-slate-400 flex-shrink-0">
                                            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </button>
                                    </div>

                                    {/* Notes Panel */}
                                    {isOpen && <NotesPanel campaign={camp} />}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
