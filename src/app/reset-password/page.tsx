'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, AlertCircle, CheckCircle2, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';

function ResetPasswordInner() {
    const params = useSearchParams();
    const router = useRouter();
    const token = params.get('token');

    const [validating, setValidating] = useState(true);
    const [tokenError, setTokenError] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);

    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            setTokenError('No reset token provided.');
            setValidating(false);
            return;
        }
        fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`)
            .then(r => r.json())
            .then(d => {
                if (d.success) setEmail(d.email);
                else setTokenError(d.error || 'This reset link is invalid or has expired.');
            })
            .catch(() => setTokenError('Network error. Please try again.'))
            .finally(() => setValidating(false));
    }, [token]);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
        if (password !== confirm) { setError('Passwords do not match.'); return; }

        setSubmitting(true);
        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });
            const d = await res.json();
            if (d.success) {
                setSuccess(true);
                setTimeout(() => router.push('/smb/login'), 2500);
            } else {
                setError(d.error || 'Could not reset password.');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setSubmitting(false);
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
                                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Reset Password</h1>
                                <p className="text-sm text-slate-500">{email ? `For ${email}` : 'Choose a new password'}</p>
                            </div>
                        </div>

                        {validating && (
                            <div className="flex items-center gap-2 text-sm text-slate-500 py-8 justify-center">
                                <Loader2 size={16} className="animate-spin" /> Verifying link...
                            </div>
                        )}

                        {!validating && tokenError && (
                            <div className="space-y-4">
                                <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
                                    <AlertCircle size={15} className="shrink-0 mt-0.5" />
                                    {tokenError}
                                </div>
                                <Link
                                    href="/smb/login"
                                    className="block text-center w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 rounded-xl transition"
                                >
                                    Back to Login
                                </Link>
                            </div>
                        )}

                        {!validating && !tokenError && success && (
                            <div className="text-center space-y-4 py-4">
                                <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle2 size={28} />
                                </div>
                                <div>
                                    <p className="text-lg font-semibold text-slate-800 dark:text-white">Password updated</p>
                                    <p className="text-sm text-slate-500 mt-1">Redirecting you to login...</p>
                                </div>
                            </div>
                        )}

                        {!validating && !tokenError && !success && (
                            <form onSubmit={submit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">New Password</label>
                                    <div className="flex items-center gap-3 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 bg-slate-50 dark:bg-slate-950 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 transition">
                                        <Lock size={16} className="text-slate-400 flex-shrink-0" />
                                        <input
                                            type={showPw ? 'text' : 'password'}
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            placeholder="At least 8 characters"
                                            required
                                            minLength={8}
                                            className="flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none"
                                        />
                                        <button type="button" onClick={() => setShowPw(p => !p)} className="text-slate-400 hover:text-slate-600 transition">
                                            {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Confirm Password</label>
                                    <div className="flex items-center gap-3 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 bg-slate-50 dark:bg-slate-950 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 transition">
                                        <Lock size={16} className="text-slate-400 flex-shrink-0" />
                                        <input
                                            type={showPw ? 'text' : 'password'}
                                            value={confirm}
                                            onChange={e => setConfirm(e.target.value)}
                                            placeholder="Re-enter password"
                                            required
                                            minLength={8}
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
                                    disabled={submitting || !password || !confirm}
                                    className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition"
                                >
                                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <>Update Password <ArrowRight size={16} /></>}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 size={32} className="animate-spin text-primary-500" />
            </div>
        }>
            <ResetPasswordInner />
        </Suspense>
    );
}
