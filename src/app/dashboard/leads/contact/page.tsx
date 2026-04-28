'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
    ArrowLeft, Mail, Phone, Globe, MapPin, Tag, ExternalLink,
    Instagram, Facebook, Linkedin, Twitter, Youtube, Star,
    StickyNote, PhoneCall, RefreshCw, Trash2, CheckCircle2,
    Clock, Send, Eye, MousePointerClick, Building2, ChevronRight
} from 'lucide-react';

const STAGES = [
    { id: 'prospect', label: 'Prospect', color: 'bg-slate-400' },
    { id: 'contacted', label: 'Contacted', color: 'bg-blue-500' },
    { id: 'engaged', label: 'Engaged', color: 'bg-indigo-500' },
    { id: 'claimed', label: 'Claimed', color: 'bg-amber-500' },
    { id: 'upgraded', label: 'Upgraded', color: 'bg-emerald-500' },
    { id: 'lost', label: 'Lost', color: 'bg-red-500' },
];

const NOTE_TYPES = [
    { id: 'manual', label: 'Note', icon: StickyNote, color: 'text-slate-400' },
    { id: 'call', label: 'Call', icon: PhoneCall, color: 'text-green-400' },
    { id: 'email', label: 'Email', icon: Mail, color: 'text-blue-400' },
];

const SOCIAL_ICONS: Record<string, React.ElementType> = {
    instagram: Instagram,
    facebook: Facebook,
    linkedin: Linkedin,
    twitter: Twitter,
    youtube: Youtube,
};

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

function ContactPageInner() {
    const params = useSearchParams();
    const router = useRouter();
    const id = params.get('id');

    const [contact, setContact] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [stage, setStage] = useState('prospect');
    const [notes, setNotes] = useState<any[]>([]);
    const [noteContent, setNoteContent] = useState('');
    const [noteType, setNoteType] = useState<'manual' | 'call' | 'email'>('manual');
    const [saving, setSaving] = useState(false);
    const [stageSaving, setStageSaving] = useState(false);
    const textRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (!id) return;
        fetch(`/api/crm/contact?id=${id}`)
            .then(r => r.json())
            .then(d => {
                if (d.success) {
                    setContact(d.data);
                    setStage(d.data.pipeline_stage || 'prospect');
                    setNotes(d.data.notes || []);
                }
            })
            .finally(() => setLoading(false));
    }, [id]);

    const handleStageChange = async (newStage: string) => {
        setStage(newStage);
        setStageSaving(true);
        await fetch('/api/crm/stage', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ campaign_id: Number(id), stage: newStage }),
        });
        setStageSaving(false);
    };

    const addNote = async () => {
        if (!noteContent.trim()) return;
        setSaving(true);
        const res = await fetch('/api/crm/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ campaign_id: Number(id), content: noteContent, note_type: noteType }),
        });
        const data = await res.json();
        if (data.success) {
            setNotes(prev => [data.data, ...prev]);
            setNoteContent('');
        }
        setSaving(false);
    };

    const deleteNote = async (noteId: number) => {
        await fetch(`/api/crm/notes?id=${noteId}`, { method: 'DELETE' });
        setNotes(prev => prev.filter(n => n.id !== noteId));
    };

    if (loading) return (
        <div className="max-w-5xl mx-auto py-20 text-center text-slate-400">Loading contact...</div>
    );
    if (!contact) return (
        <div className="max-w-5xl mx-auto py-20 text-center text-slate-400">Contact not found.</div>
    );

    const currentStage = STAGES.find(s => s.id === stage) || STAGES[0];
    const socialMedia = contact.social_media || {};
    const customFields = contact.custom_fields || {};
    const hasSocial = Object.values(socialMedia).some(v => v);
    const hasCustom = Object.values(customFields).some(v => v);

    const emailSteps = [
        { label: 'Email 1', date: contact.email_1_sent_at, resendId: contact.email_1_resend_id },
        { label: 'Email 2', date: contact.email_2_sent_at, resendId: contact.email_2_resend_id },
        { label: 'Email 3', date: contact.email_3_sent_at, resendId: contact.email_3_resend_id },
        { label: 'Email 4', date: contact.email_4_sent_at, resendId: contact.email_4_resend_id },
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Back nav */}
            <div className="flex items-center gap-2 text-sm text-slate-500">
                <Link href="/dashboard/leads" className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white transition">
                    <ArrowLeft size={14} /> CRM
                </Link>
                <ChevronRight size={12} />
                <span className="text-slate-800 dark:text-slate-200 font-medium">{contact.listing_name}</span>
            </div>

            {/* Header card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex items-center gap-4">
                        {contact.image_url ? (
                            <Image src={contact.image_url} alt={contact.listing_name || ''} width={64} height={64} className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700" />
                        ) : (
                            <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                <Building2 size={28} className="text-slate-400" />
                            </div>
                        )}
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{contact.listing_name}</h1>
                                {contact.slug && (
                                    <Link href={`/biz/${contact.slug}`} target="_blank" className="text-slate-400 hover:text-primary-500 transition">
                                        <ExternalLink size={14} />
                                    </Link>
                                )}
                                {contact.claimed && (
                                    <span className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">CLAIMED</span>
                                )}
                            </div>
                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                                <span className="text-sm text-slate-500">{contact.category}</span>
                                {contact.location_city && <span className="text-sm text-slate-400">· {contact.location_city}, {contact.location_state}</span>}
                                {contact.rating && (
                                    <span className="flex items-center gap-1 text-sm text-amber-500">
                                        <Star size={12} fill="currentColor" /> {contact.rating}
                                        {contact.review_count && <span className="text-slate-400">({contact.review_count})</span>}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Lead Stage Picker */}
                    <div className="flex flex-col gap-2 items-end">
                        <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${currentStage.color}`} />
                            <select
                                value={stage}
                                onChange={e => handleStageChange(e.target.value)}
                                className="text-sm font-semibold border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                            </select>
                            {stageSaving && <RefreshCw size={12} className="animate-spin text-slate-400" />}
                        </div>
                        <span className="text-xs text-slate-400 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded">
                            Outreach: {statusLabel(contact.status)}
                        </span>
                    </div>
                </div>

                {/* Email engagement bar */}
                {(Number(contact.opens) > 0 || Number(contact.clicks) > 0) && (
                    <div className="mt-4 flex items-center gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <Eye size={14} className="text-amber-500" />
                            <span className="text-lg font-bold text-amber-500">{contact.opens}</span>
                            <span className="text-xs text-slate-400">email opens</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MousePointerClick size={14} className="text-green-500" />
                            <span className="text-lg font-bold text-green-500">{contact.clicks}</span>
                            <span className="text-xs text-slate-400">link clicks</span>
                        </div>
                        {contact.last_opened_at && (
                            <span className="text-xs text-slate-400 ml-auto">
                                Last opened {new Date(contact.last_opened_at).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* LEFT: Contact Info */}
                <div className="space-y-4">

                    {/* Contact Details */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Contact Info</h3>
                        <div className="space-y-3">
                            {contact.contact_name && (
                                <div className="flex items-center gap-2.5 text-sm">
                                    <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                                        <Building2 size={13} className="text-slate-500" />
                                    </div>
                                    <span className="text-slate-700 dark:text-slate-300">{contact.contact_name}</span>
                                </div>
                            )}
                            {contact.listing_email && (
                                <div className="flex items-center gap-2.5 text-sm">
                                    <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                                        <Mail size={13} className="text-blue-500" />
                                    </div>
                                    <a href={`mailto:${contact.listing_email}`} className="text-primary-600 dark:text-primary-400 hover:underline truncate">{contact.listing_email}</a>
                                </div>
                            )}
                            {contact.phone && (
                                <div className="flex items-center gap-2.5 text-sm">
                                    <div className="w-7 h-7 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
                                        <Phone size={13} className="text-green-500" />
                                    </div>
                                    <a href={`tel:${contact.phone}`} className="text-slate-700 dark:text-slate-300 hover:text-primary-600">{contact.phone}</a>
                                </div>
                            )}
                            {contact.website && (
                                <div className="flex items-center gap-2.5 text-sm">
                                    <div className="w-7 h-7 rounded-lg bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center flex-shrink-0">
                                        <Globe size={13} className="text-violet-500" />
                                    </div>
                                    <a href={contact.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:underline truncate flex items-center gap-1">
                                        {contact.website.replace(/^https?:\/\//, '')} <ExternalLink size={10} />
                                    </a>
                                </div>
                            )}
                            {(contact.street_address || contact.location_city) && (
                                <div className="flex items-start gap-2.5 text-sm">
                                    <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <MapPin size={13} className="text-slate-500" />
                                    </div>
                                    <span className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                        {[contact.street_address, contact.location_city, contact.location_state, contact.zip_code].filter(Boolean).join(', ')}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Social Media */}
                    {hasSocial && (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Social Media</h3>
                            <div className="space-y-2">
                                {Object.entries(socialMedia).filter(([, v]) => v).map(([platform, url]) => {
                                    const Icon = SOCIAL_ICONS[platform.toLowerCase()] || ExternalLink;
                                    return (
                                        <a key={platform} href={url as string} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition group">
                                            <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 flex items-center justify-center flex-shrink-0 transition">
                                                <Icon size={13} />
                                            </div>
                                            <span className="capitalize font-medium">{platform}</span>
                                            <ExternalLink size={10} className="ml-auto opacity-0 group-hover:opacity-100 transition" />
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Category + Custom Fields */}
                    {(contact.category || hasCustom) && (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Business Details</h3>
                            <div className="space-y-3">
                                {contact.category && (
                                    <div className="flex items-center gap-2.5 text-sm">
                                        <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                                            <Tag size={13} className="text-slate-500" />
                                        </div>
                                        <span className="text-slate-700 dark:text-slate-300">{contact.category}</span>
                                    </div>
                                )}
                                {hasCustom && Object.entries(customFields).filter(([, v]) => v).map(([key, val]) => (
                                    <div key={key}>
                                        <p className="text-xs text-slate-400 mb-0.5 capitalize">{key.replace(/_/g, ' ')}</p>
                                        <p className="text-sm text-slate-700 dark:text-slate-300">{val as string}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* CENTER + RIGHT: Main content */}
                <div className="lg:col-span-2 space-y-4">

                    {/* Recommended Services — highlighted prominently */}
                    {contact.recommended_services && (
                        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-2xl p-5 shadow-sm">
                            <h3 className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <Star size={12} fill="currentColor" /> Recommended Services
                            </h3>
                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{contact.recommended_services}</p>
                        </div>
                    )}

                    {/* Email Sequence Timeline */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Email Sequence</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {emailSteps.map((step, i) => (
                                <div key={step.label} className={`rounded-xl p-3 border text-center ${step.date ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/30' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                                    <div className={`w-6 h-6 rounded-full mx-auto mb-2 flex items-center justify-center ${step.date ? 'bg-emerald-400' : 'bg-slate-200 dark:bg-slate-700'}`}>
                                        {step.date ? <CheckCircle2 size={12} className="text-white" /> : <Clock size={12} className="text-slate-400" />}
                                    </div>
                                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{step.label}</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">
                                        {step.date ? new Date(step.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Not sent'}
                                    </p>
                                </div>
                            ))}
                        </div>
                        {(Number(contact.opens) > 0 || Number(contact.clicks) > 0) && (
                            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-6">
                                <div className="flex items-center gap-2">
                                    <Eye size={13} className="text-amber-500" />
                                    <span className="text-sm font-bold text-amber-500">{contact.opens}</span>
                                    <span className="text-xs text-slate-400">opens</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MousePointerClick size={13} className="text-green-500" />
                                    <span className="text-sm font-bold text-green-500">{contact.clicks}</span>
                                    <span className="text-xs text-slate-400">clicks</span>
                                </div>
                                {contact.last_clicked_at && (
                                    <span className="text-xs text-slate-400 ml-auto">
                                        Last clicked {new Date(contact.last_clicked_at).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Activity & Notes */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Activity & Notes</h3>

                        {/* Add note */}
                        <div className="flex gap-2 mb-5">
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
                                value={noteContent}
                                onChange={e => setNoteContent(e.target.value)}
                                placeholder="Add a note, call log, or email record..."
                                rows={1}
                                className="flex-1 text-sm resize-none rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addNote(); } }}
                            />
                            <button
                                onClick={addNote}
                                disabled={saving || !noteContent.trim()}
                                className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50 transition-colors flex-shrink-0 flex items-center gap-1.5"
                            >
                                {saving ? <RefreshCw size={13} className="animate-spin" /> : <Send size={13} />}
                                Add
                            </button>
                        </div>

                        {/* Notes list */}
                        <div className="space-y-3">
                            {notes.length === 0 && (
                                <p className="text-sm text-slate-400 text-center py-4">No activity yet. Add your first note above.</p>
                            )}
                            {notes.map(note => {
                                const nt = NOTE_TYPES.find(t => t.id === note.note_type) || NOTE_TYPES[0];
                                return (
                                    <div key={note.id} className="flex gap-3 group p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                        <div className={`mt-0.5 flex-shrink-0 ${nt.color}`}>
                                            <nt.icon size={14} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{note.content}</p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                {nt.label} · {new Date(note.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => deleteNote(note.id)}
                                            className="text-slate-300 dark:text-slate-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 mt-0.5"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Description */}
                    {contact.description && (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">About</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{contact.description}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ContactPage() {
    return (
        <Suspense fallback={<div className="max-w-5xl mx-auto py-20 text-center text-slate-400">Loading...</div>}>
            <ContactPageInner />
        </Suspense>
    );
}
