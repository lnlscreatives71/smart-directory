'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, CheckCircle2, AlertCircle, Lock, Loader2 } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/auth/request-reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim() }),
            });
            const d = await res.json();
            if (d.success) setSent(true);
            else setError(d.error || 'Could not send reset email.');
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 to-indigo-50/30 dark:from-slate-950 dark:to-indigo-950/20 flex justify-center items-center py-20 px-4">
            <div className="max-w-md w-full">
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl shadow-slate-200/60 dark:shadow-black/60 border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="p-8">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center">
                                <Lock size={22} />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Forgot Password</h1>
                                <p className="text-sm text-slate-500">We'll email you a reset link</p>
                            </div>
                        </div>

                        {sent ? (
                            <div className="text-center space-y-4 py-4">
                                <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle2 size={28} />
                                </div>
                                <div>
                                    <p className="text-lg font-semibold text-slate-800 dark:text-white">Check your inbox</p>
                                    <p className="text-sm text-slate-500 mt-1">
                                        If an account exists for <strong className="text-slate-700 dark:text-slate-300">{email}</strong>,
                                        we've sent a password reset link. It expires in 1 hour.
                                    </p>
                                </div>
                                <Link
                                    href="/smb/login"
                                    className="inline-block mt-2 text-sm text-primary-600 dark:text-primary-400 hover:underline"
                                >
                                    Back to login
                                </Link>
                            </div>
                        ) : (
                            <form onSubmit={submit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
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
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 text-red-500 text-sm">
                                        <AlertCircle size={14} /> {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading || !email.trim()}
                                    className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition"
                                >
                                    {loading ? <Loader2 size={16} className="animate-spin" /> : <>Send Reset Link <ArrowRight size={16} /></>}
                                </button>

                                <div className="text-center pt-2">
                                    <Link href="/smb/login" className="text-sm text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 transition">
                                        ← Back to login
                                    </Link>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
