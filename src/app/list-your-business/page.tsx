'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function PublicListingForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ show: boolean, type: 'success' | 'error', message: string }>({ show: false, type: 'success', message: '' });

    const [formData, setFormData] = useState({
        name: '',
        contact_name: '',
        contact_email: '',
        phone: '',
        website: '',
        category: '',
        description: '',
        location_city: '',
        location_state: 'NC',
    });

    const showToast = (type: 'success' | 'error', message: string) => {
        setToast({ show: true, type, message });
        setTimeout(() => setToast({ show: false, type: 'success', message: '' }), 4000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!formData.name || !formData.contact_email || !formData.category) {
            showToast('error', 'Please fill out all required fields.');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/listings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    plan_id: 1, // Default to free plan
                    claimed: false,
                    featured: false,
                    services: [],
                    feature_flags: {}
                })
            });

            const data = await res.json();

            if (data.success) {
                showToast('success', 'Listing submitted! We\'ll review and publish it within 24 hours.');
                setTimeout(() => {
                    router.push('/');
                }, 2000);
            } else {
                showToast('error', data.error || 'Failed to create listing. Please try again.');
            }
        } catch (err) {
            showToast('error', 'Network error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 py-20 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                        List Your Business - It's Free!
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Get discovered by thousands of local customers. Upgrade to Premium anytime for AI Chat, booking, and more.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-slate-900 rounded-2xl border border-slate-800 p-8 space-y-6">
                    {toast.show && (
                        <div className={`flex items-center gap-3 p-4 rounded-xl ${toast.type === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                            {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                            <span>{toast.message}</span>
                        </div>
                    )}

                    {/* Business Info */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-white mb-4">Business Information</h2>
                        
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">Business Name *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                placeholder="e.g. Triangle Wellness Spa"
                                required
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-primary-500 transition"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">Category *</label>
                            <select
                                value={formData.category}
                                onChange={e => setFormData({...formData, category: e.target.value})}
                                required
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-primary-500 transition"
                            >
                                <option value="">Select a category</option>
                                <option value="Restaurants">Restaurants</option>
                                <option value="Med Spas">Med Spas</option>
                                <option value="Home Services">Home Services</option>
                                <option value="Health">Health & Wellness</option>
                                <option value="Real Estate">Real Estate</option>
                                <option value="Professional Services">Professional Services</option>
                                <option value="Retail">Retail</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                                placeholder="Tell customers what you do..."
                                rows={4}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-primary-500 transition resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-2">City *</label>
                                <input
                                    type="text"
                                    value={formData.location_city}
                                    onChange={e => setFormData({...formData, location_city: e.target.value})}
                                    placeholder="e.g. Raleigh"
                                    required
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-primary-500 transition"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-2">State</label>
                                <input
                                    type="text"
                                    value={formData.location_state}
                                    onChange={e => setFormData({...formData, location_state: e.target.value})}
                                    placeholder="NC"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-primary-500 transition"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4 pt-6 border-t border-slate-800">
                        <h2 className="text-xl font-bold text-white mb-4">Contact Information</h2>
                        
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">Your Name *</label>
                            <input
                                type="text"
                                value={formData.contact_name}
                                onChange={e => setFormData({...formData, contact_name: e.target.value})}
                                placeholder="John Smith"
                                required
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-primary-500 transition"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">Email *</label>
                            <input
                                type="email"
                                value={formData.contact_email}
                                onChange={e => setFormData({...formData, contact_email: e.target.value})}
                                placeholder="you@business.com"
                                required
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-primary-500 transition"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">Phone</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={e => setFormData({...formData, phone: e.target.value})}
                                placeholder="(350) 777-2961"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-primary-500 transition"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">Website</label>
                            <input
                                type="url"
                                value={formData.website}
                                onChange={e => setFormData({...formData, website: e.target.value})}
                                placeholder="https://yourbusiness.com"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-primary-500 transition"
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-4 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            'Submit Free Listing'
                        )}
                    </button>

                    <p className="text-xs text-slate-500 text-center">
                        By submitting, you agree to our Terms of Service. Your listing will be reviewed within 24 hours.
                    </p>
                </form>

                {/* Upsell */}
                <div className="mt-8 bg-gradient-to-r from-primary-600/20 to-primary-500/20 border border-primary-500/30 rounded-2xl p-6 text-center">
                    <h3 className="text-lg font-bold text-white mb-2">Want More From Your Listing?</h3>
                    <p className="text-slate-400 text-sm mb-4">
                        Upgrade to Premium for AI Chat, online booking, priority ranking, and more.
                    </p>
                    <a
                        href="/pricing"
                        className="inline-flex items-center gap-2 bg-white text-primary-700 font-bold px-6 py-3 rounded-xl hover:bg-white/90 transition"
                    >
                        View Premium Features
                    </a>
                </div>
            </div>
        </div>
    );
}
