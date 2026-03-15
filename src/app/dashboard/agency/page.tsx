'use client';

import { useState, useEffect } from 'react';
import { Save, Palette, Globe, Upload, Building2, Users, BarChart3, Settings } from 'lucide-react';

export default function AgencyDashboardPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [agency, setAgency] = useState<any>(null);
    const [msg, setMsg] = useState({ type: '', text: '' });

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        custom_domain: '',
        contact_email: '',
        contact_phone: '',
        support_email: '',
        logo_url: '',
        favicon_url: '',
        primary_color: '#3b82f6',
        secondary_color: '#10b981',
        font_family: 'Outfit',
        plan_tier: 'starter',
    });

    useEffect(() => {
        // Fetch current agency info
        fetch('/api/agencies?slug=trianglehub')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data) {
                    const a = Array.isArray(data.data) ? data.data[0] : data.data;
                    setAgency(a);
                    setFormData({
                        name: a.name || '',
                        slug: a.slug || '',
                        custom_domain: a.custom_domain || '',
                        contact_email: a.contact_email || '',
                        contact_phone: a.contact_phone || '',
                        support_email: a.support_email || '',
                        logo_url: a.logo_url || '',
                        favicon_url: a.favicon_url || '',
                        primary_color: a.primary_color || '#3b82f6',
                        secondary_color: a.secondary_color || '#10b981',
                        font_family: a.font_family || 'Outfit',
                        plan_tier: a.plan_tier || 'starter',
                    });
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
            const res = await fetch('/api/agencies', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: agency?.id,
                    ...formData
                })
            });

            const data = await res.json();
            if (data.success) {
                setMsg({ type: 'success', text: 'Agency settings updated! Changes may take a few minutes to propagate.' });
            } else {
                setMsg({ type: 'error', text: data.error || 'Failed to update' });
            }
        } catch (err) {
            setMsg({ type: 'error', text: 'An unexpected error occurred.' });
        }
        setSaving(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-slate-400">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white pb-20">
            {/* Header */}
            <div className="bg-slate-900 border-b border-slate-800 px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Agency Dashboard</h1>
                        <p className="text-sm text-slate-400 mt-1">Manage your white-label directory settings</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-400">Plan: <strong className="text-white capitalize">{agency?.plan_tier}</strong></span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${agency?.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                            {agency?.status}
                        </span>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
                        <div className="flex items-center gap-3 mb-2">
                            <Building2 size={20} className="text-primary-400" />
                            <span className="text-sm text-slate-400">Listings</span>
                        </div>
                        <p className="text-2xl font-bold">0</p>
                    </div>
                    <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
                        <div className="flex items-center gap-3 mb-2">
                            <Users size={20} className="text-primary-400" />
                            <span className="text-sm text-slate-400">Monthly Visitors</span>
                        </div>
                        <p className="text-2xl font-bold">0</p>
                    </div>
                    <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
                        <div className="flex items-center gap-3 mb-2">
                            <BarChart3 size={20} className="text-primary-400" />
                            <span className="text-sm text-slate-400">Conversion Rate</span>
                        </div>
                        <p className="text-2xl font-bold">0%</p>
                    </div>
                    <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
                        <div className="flex items-center gap-3 mb-2">
                            <Settings size={20} className="text-primary-400" />
                            <span className="text-sm text-slate-400">Active Features</span>
                        </div>
                        <p className="text-2xl font-bold">AI Chat, Voice, Booking</p>
                    </div>
                </div>

                {/* Settings Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Branding */}
                    <section className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
                        <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
                            <Palette className="text-primary-400" />
                            Branding & White-Label
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-2">Primary Color</label>
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="color" 
                                        value={formData.primary_color}
                                        onChange={e => setFormData({...formData, primary_color: e.target.value})}
                                        className="w-12 h-10 rounded border border-slate-700 bg-slate-800 cursor-pointer"
                                    />
                                    <input 
                                        type="text" 
                                        value={formData.primary_color}
                                        onChange={e => setFormData({...formData, primary_color: e.target.value})}
                                        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-2">Secondary Color</label>
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="color" 
                                        value={formData.secondary_color}
                                        onChange={e => setFormData({...formData, secondary_color: e.target.value})}
                                        className="w-12 h-10 rounded border border-slate-700 bg-slate-800 cursor-pointer"
                                    />
                                    <input 
                                        type="text" 
                                        value={formData.secondary_color}
                                        onChange={e => setFormData({...formData, secondary_color: e.target.value})}
                                        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-2">Logo URL</label>
                                <input 
                                    type="url" 
                                    value={formData.logo_url}
                                    onChange={e => setFormData({...formData, logo_url: e.target.value})}
                                    placeholder="https://..."
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-2">Favicon URL</label>
                                <input 
                                    type="url" 
                                    value={formData.favicon_url}
                                    onChange={e => setFormData({...formData, favicon_url: e.target.value})}
                                    placeholder="https://..."
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-2">Font Family</label>
                                <select 
                                    value={formData.font_family}
                                    onChange={e => setFormData({...formData, font_family: e.target.value})}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-500"
                                >
                                    <option value="Outfit">Outfit</option>
                                    <option value="Inter">Inter</option>
                                    <option value="Poppins">Poppins</option>
                                    <option value="Roboto">Roboto</option>
                                    <option value="Open Sans">Open Sans</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* Domain Settings */}
                    <section className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
                        <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
                            <Globe className="text-primary-400" />
                            Domain Settings
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-2">Subdomain</label>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="text" 
                                        value={formData.slug}
                                        onChange={e => setFormData({...formData, slug: e.target.value})}
                                        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-500"
                                    />
                                    <span className="text-slate-400 text-sm">.trianglehub.online</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-2">Custom Domain</label>
                                <input 
                                    type="text" 
                                    value={formData.custom_domain}
                                    onChange={e => setFormData({...formData, custom_domain: e.target.value})}
                                    placeholder="directory.yourcompany.com"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-500"
                                />
                                <p className="text-xs text-slate-500 mt-1">Point your DNS CNAME to trianglehub.online</p>
                            </div>
                        </div>
                    </section>

                    {/* Contact Info */}
                    <section className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
                        <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
                            <Building2 className="text-primary-400" />
                            Contact Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-2">Agency Name</label>
                                <input 
                                    type="text" 
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-2">Support Email</label>
                                <input 
                                    type="email" 
                                    value={formData.support_email}
                                    onChange={e => setFormData({...formData, support_email: e.target.value})}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-2">Contact Email</label>
                                <input 
                                    type="email" 
                                    value={formData.contact_email}
                                    onChange={e => setFormData({...formData, contact_email: e.target.value})}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-2">Contact Phone</label>
                                <input 
                                    type="tel" 
                                    value={formData.contact_phone}
                                    onChange={e => setFormData({...formData, contact_phone: e.target.value})}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-500"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Save */}
                    {msg.text && (
                        <div className={`p-4 rounded-xl ${msg.type === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                            {msg.text}
                        </div>
                    )}

                    <div className="flex justify-end">
                        <button 
                            type="submit" 
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-500 rounded-xl font-bold disabled:opacity-50"
                        >
                            <Save size={18} />
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
