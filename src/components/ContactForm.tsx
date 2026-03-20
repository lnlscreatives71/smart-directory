'use client';
import { useState } from 'react';

export default function ContactForm({ listingId, bizName }: { listingId: number; bizName: string }) {
    const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');
        try {
            const res = await fetch('/api/contact-listing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ listingId, ...form }),
            });
            const data = await res.json();
            if (data.success) {
                setStatus('success');
            } else {
                setErrorMsg(data.error || 'Something went wrong.');
                setStatus('error');
            }
        } catch {
            setErrorMsg('Failed to send. Please try again.');
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <div className="text-center py-6 space-y-2">
                <div className="text-3xl">✓</div>
                <p className="font-bold text-white">Message sent!</p>
                <p className="text-sm text-slate-400">{bizName} will be in touch soon.</p>
            </div>
        );
    }

    return (
        <form onSubmit={submit} className="space-y-4">
            <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Name</label>
                <input
                    type="text" required
                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition"
                    placeholder="John Doe"
                />
            </div>
            <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Phone</label>
                <input
                    type="tel"
                    value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition"
                    placeholder="(919) 555-0100"
                />
            </div>
            <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Email</label>
                <input
                    type="email"
                    value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition"
                    placeholder="you@example.com"
                />
            </div>
            <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Message</label>
                <textarea
                    rows={3} required
                    value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition resize-none"
                    placeholder="Tell them what you need..."
                />
            </div>
            {status === 'error' && (
                <p className="text-sm text-red-400">{errorMsg}</p>
            )}
            <button
                type="submit" disabled={status === 'sending'}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary-500/30 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {status === 'sending' ? 'Sending...' : 'Request a Quote'}
            </button>
        </form>
    );
}
