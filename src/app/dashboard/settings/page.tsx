"use client";

import { useEffect, useState } from 'react';
import { Save, Loader2, AlertCircle, Palette, Type, Globe, PlusCircle, Trash2, TableProperties } from 'lucide-react';

interface CustomField {
    id: number;
    field_key: string;
    field_label: string;
    field_description: string | null;
}

export default function AgencySettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState({ type: '', text: '' });

    // Custom import fields
    const [customFields, setCustomFields] = useState<CustomField[]>([]);
    const [newFieldLabel, setNewFieldLabel] = useState('');
    const [newFieldDesc, setNewFieldDesc] = useState('');
    const [addingField, setAddingField] = useState(false);
    const [fieldError, setFieldError] = useState('');
    
    const [formData, setFormData] = useState({
        site_name: '',
        site_description: '',
        hero_headline: '',
        hero_subhead: '',
        primary_color: '#3b82f6',
        secondary_color: '#10b981',
        contact_email: '',
        contact_phone: '',
        location_region: ''
    });

    useEffect(() => {
        Promise.all([
            fetch('/api/settings').then(r => r.json()),
            fetch('/api/custom-fields').then(r => r.json()),
        ]).then(([settings, cf]) => {
            if (settings && !settings.error) setFormData(settings);
            if (cf?.fields) setCustomFields(cf.fields);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, []);

    const addCustomField = async () => {
        if (!newFieldLabel.trim()) return;
        setAddingField(true);
        setFieldError('');
        const res = await fetch('/api/custom-fields', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ label: newFieldLabel, description: newFieldDesc }),
        });
        const data = await res.json();
        if (!res.ok) {
            setFieldError(data.error);
        } else {
            setCustomFields(prev => [...prev, data.field]);
            setNewFieldLabel('');
            setNewFieldDesc('');
        }
        setAddingField(false);
    };

    const deleteCustomField = async (key: string) => {
        await fetch('/api/custom-fields', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key }),
        });
        setCustomFields(prev => prev.filter(f => f.field_key !== key));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMsg({ type: '', text: '' });

        try {
            const res = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setMsg({ type: 'success', text: 'Settings updated! Reload the page to see changes.' });
            } else {
                setMsg({ type: 'error', text: 'Failed to update settings.' });
            }
        } catch (err) {
            setMsg({ type: 'error', text: 'An unexpected error occurred.' });
        }
        setSaving(false);
    };

    if (loading) return <div className="p-8"><Loader2 className="animate-spin text-primary-500 mx-auto" size={30} /></div>;

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <h1 className="text-3xl font-extrabold text-white mb-2">Platform Settings ⚙️</h1>
            <p className="text-slate-400 mb-8">No-code settings to white-label your directory. Note: Changing colors here will update the database, but our CSS engine requires a redeploy to inject the literal tailwind classes right now. *To be fully hot-reloaded later.*</p>

            {msg.text && (
                <div className={`p-4 mb-6 rounded-lg flex items-center gap-3 ${msg.type === 'success' ? 'bg-secondary-500/20 text-secondary-400 border border-secondary-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                    <AlertCircle size={20} />
                    <strong>{msg.text}</strong>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Branding Core */}
                <section className="glass rounded-2xl p-6 border border-white/5 shadow-xl shadow-black/40">
                    <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2 border-b border-white/10 pb-3">
                        <Type className="text-primary-400" /> Core Branding
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-300">Site Name</label>
                            <input type="text" value={formData.site_name} onChange={e => setFormData({ ...formData, site_name: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white outline-none focus:border-primary-500 transition-colors" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-300">Target Region (e.g., Dallas)</label>
                            <input type="text" value={formData.location_region} onChange={e => setFormData({ ...formData, location_region: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white outline-none focus:border-primary-500 transition-colors" />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-sm font-semibold text-slate-300">Meta Description / Pitch</label>
                            <input type="text" value={formData.site_description} onChange={e => setFormData({ ...formData, site_description: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white outline-none focus:border-primary-500 transition-colors" />
                        </div>
                    </div>
                </section>

                {/* Homepage Hero */}
                <section className="glass rounded-2xl p-6 border border-white/5 shadow-xl shadow-black/40">
                    <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2 border-b border-white/10 pb-3">
                        <Globe className="text-primary-400" /> Homepage Hero Text
                    </h2>
                    <div className="grid grid-cols-1 gap-5">
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-300">H1 Headline</label>
                            <input type="text" value={formData.hero_headline} onChange={e => setFormData({ ...formData, hero_headline: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white outline-none focus:border-primary-500 transition-colors" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-300">Hero Subheadline</label>
                            <textarea value={formData.hero_subhead} rows={3} onChange={e => setFormData({ ...formData, hero_subhead: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white outline-none focus:border-primary-500 transition-colors"></textarea>
                        </div>
                    </div>
                </section>

                {/* Agency Contacts */}
                <section className="glass rounded-2xl p-6 border border-white/5 shadow-xl shadow-black/40">
                    <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2 border-b border-white/10 pb-3">
                        <Globe className="text-primary-400" /> Agency Contacts
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-300">Support Email</label>
                            <input type="email" value={formData.contact_email} onChange={e => setFormData({ ...formData, contact_email: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white outline-none focus:border-primary-500 transition-colors" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-300">Phone Number</label>
                            <input type="text" value={formData.contact_phone} onChange={e => setFormData({ ...formData, contact_phone: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white outline-none focus:border-primary-500 transition-colors" />
                        </div>
                    </div>
                </section>

                <div className="flex justify-end pt-4">
                    <button type="submit" disabled={saving} className="btn-primary px-8 py-3 rounded-xl flex items-center gap-2 disabled:opacity-50">
                        {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        Save Settings
                    </button>
                </div>
            </form>

            {/* Custom Import Fields */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <TableProperties size={18} className="text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Custom Import Fields</h2>
                        <p className="text-xs text-slate-400 mt-0.5">Define extra fields for your directory (e.g. "Recommended Services", "Specialties"). They appear as mapping options when importing CSVs.</p>
                    </div>
                </div>

                {/* Existing fields */}
                {customFields.length > 0 && (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        {customFields.map(f => (
                            <div key={f.field_key} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                                <div>
                                    <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{f.field_label}</span>
                                    <span className="ml-2 font-mono text-xs text-slate-400">({f.field_key})</span>
                                    {f.field_description && <p className="text-xs text-slate-400 mt-0.5">{f.field_description}</p>}
                                </div>
                                <button onClick={() => deleteCustomField(f.field_key)} className="text-slate-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 transition ml-4">
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add new field */}
                <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                            type="text"
                            placeholder="Field label (e.g. Recommended Services)"
                            value={newFieldLabel}
                            onChange={e => setNewFieldLabel(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && addCustomField()}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 outline-none focus:border-primary-500 transition"
                        />
                        <input
                            type="text"
                            placeholder="Description (optional)"
                            value={newFieldDesc}
                            onChange={e => setNewFieldDesc(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 outline-none focus:border-primary-500 transition"
                        />
                    </div>
                    {fieldError && <p className="text-xs text-red-500">{fieldError}</p>}
                    <button
                        onClick={addCustomField}
                        disabled={addingField || !newFieldLabel.trim()}
                        className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition"
                    >
                        {addingField ? <Loader2 size={15} className="animate-spin" /> : <PlusCircle size={15} />}
                        Add Field
                    </button>
                </div>
            </div>
        </div>
    );
}
