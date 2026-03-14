"use client";

import { useEffect, useState } from 'react';
import { Save, Loader2, AlertCircle, Palette, Type, Globe } from 'lucide-react';

export default function AgencySettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState({ type: '', text: '' });
    
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
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => {
                if (data && !data.error) {
                    setFormData(data);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

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
        </div>
    );
}
