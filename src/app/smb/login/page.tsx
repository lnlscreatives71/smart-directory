'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Mail, ArrowRight, CheckCircle2, AlertCircle, Building2 } from 'lucide-react';

const ERROR_MESSAGES: Record<string, string> = {
    invalid_token: 'This login link has expired or already been used. Request a new one below.',
    missing_token: 'Invalid login link. Request a new one below.',
    server_error: 'Something went wrong. Please try again.',
};

function LoginContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get('error');

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [sendError, setSendError] = useState<string | null>(null);

    const handleRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;
        setLoading(true);
        setSendError(null);

        try {
            const res = await fetch('/api/smb/request-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim() }),
            });
            const d = await res.json();
            if (d.success) {
                setSent(true);
            } else {
                setSendError(d.error || 'Failed to send login link.');
            }
        } catch {
            setSendError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 to-indigo-50/30 dark:from-slate-950 dark:to-indigo-950/20 flex justify-center items-center py-20 px-4">
            <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl shadow-slate-200/60 dark:shadow-black/60 border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-8">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center">
                            <Building2 size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Business Portal Login</h1>
                            <p className="text-sm text-slate-500">We'll email you a secure link</p>
                        </div>
                    </div>

                    {/* Error from magic link */}
                    {error && ERROR_MESSAGES[error] && (
                        <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm mb-6">
                            <AlertCircle size={15} className="shrink-0 mt-0.5" />
                            {ERROR_MESSAGES[error]}
                        </div>
                    )}

                    {sent ? (
                        <div className="text-center py-4">
                            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 size={32} />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Check your email</h2>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                We sent a login link to <strong className="text-slate-800 dark:text-white">{email}</strong>.
                                It expires in 72 hours.
                            </p>
                            <button
                                onClick={() => { setSent(false); setEmail(''); }}
                                className="mt-6 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
                            >
                                Use a different email
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleRequest} className="space-y-5">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                                    Email Address
                                </label>
                                <div className="flex items-center gap-3 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 bg-slate-50 dark:bg-slate-950 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 transition">
                                    <Mail size={16} className="text-slate-400 flex-shrink-0" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="you@yourbusiness.com"
                                        required
                                        className="flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none"
                                    />
                                </div>
                                <p className="mt-2 text-xs text-slate-400">
                                    Use the email associated with your claimed listing.
                                </p>
                            </div>

                            {sendError && (
                                <div className="flex items-center gap-2 text-red-500 text-sm">
                                    <AlertCircle size={14} /> {sendError}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading || !email.trim()}
                                className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition"
                            >
                                {loading ? (
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>Send Login Link <ArrowRight size={16} /></>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function SmbLoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
