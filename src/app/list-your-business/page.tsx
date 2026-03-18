'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function ListYourBusiness() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (!formData.name || !formData.contact_email || !formData.contact_name || !formData.category || !formData.location_city) {
            setError('Please fill out all required fields.');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/new-business-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (data.success) {
                setSubmitted(true);
            } else {
                setError(data.error || 'Something went wrong. Please try again.');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 mx-auto mb-6">
                        <CheckCircle2 size={32} className="text-emerald-400" />
                    </div>
                    <h1 className="text-2xl font-extrabold text-white mb-3">Submission Received!</h1>
                    <p className="text-slate-400 text-base mb-6">
                        Thanks for submitting <strong className="text-white">{formData.name}</strong>. We&apos;ll review your request and get back to you within 24 hours. Once approved, you&apos;ll receive an email with a link to access your listing dashboard.
                    </p>
                    <button
                        onClick={() => router.push('/')}
                        className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white font-bold px-6 py-3 rounded-xl transition"
                    >
                        Back to Directory
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 py-20 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                        List Your Business — It&apos;s Free!
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Get discovered by thousands of local customers. Submit your details and we&apos;ll have your listing live within 24 hours.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="bg-slate-900 rounded-2xl border border-slate-800 p-8 space-y-6">
                    {error && (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
                            <AlertCircle size={20} />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Business Info */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-white">Business Information</h2>

                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">Business Name *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Triangle Wellness Spa"
                                required
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-primary-500 transition"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">Category *</label>
                            <select
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                required
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-primary-500 transition"
                            >
                                <option value="">Select a category</option>
                                <option value="Restaurants">Restaurants</option>
                                <option value="Med Spas">Med Spas</option>
                                <option value="Home Services">Home Services</option>
                                <option value="Health & Wellness">Health &amp; Wellness</option>
                                <option value="Real Estate">Real Estate</option>
                                <option value="Professional Services">Professional Services</option>
                                <option value="Automotive">Automotive</option>
                                <option value="Retail">Retail</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
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
                                    onChange={e => setFormData({ ...formData, location_city: e.target.value })}
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
                                    onChange={e => setFormData({ ...formData, location_state: e.target.value })}
                                    placeholder="NC"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-primary-500 transition"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">Phone</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="(919) 555-1234"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-primary-500 transition"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">Website</label>
                            <input
                                type="url"
                                value={formData.website}
                                onChange={e => setFormData({ ...formData, website: e.target.value })}
                                placeholder="https://yourbusiness.com"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-primary-500 transition"
                            />
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4 pt-6 border-t border-slate-800">
                        <h2 className="text-xl font-bold text-white">Your Contact Information</h2>

                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">Your Name *</label>
                            <input
                                type="text"
                                value={formData.contact_name}
                                onChange={e => setFormData({ ...formData, contact_name: e.target.value })}
                                placeholder="Jane Smith"
                                required
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-primary-500 transition"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">Email *</label>
                            <input
                                type="email"
                                value={formData.contact_email}
                                onChange={e => setFormData({ ...formData, contact_email: e.target.value })}
                                placeholder="you@yourbusiness.com"
                                required
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-primary-500 transition"
                            />
                        </div>
                    </div>

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
                        Your listing will be reviewed within 24 hours. You&apos;ll receive an email once it&apos;s live.
                    </p>
                </form>

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
