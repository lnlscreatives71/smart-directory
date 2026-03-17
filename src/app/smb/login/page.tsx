'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Mail, ArrowRight, CheckCircle2, AlertCircle, Building2, Lock, Eye, EyeOff } from 'lucide-react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

function LoginContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const urlError = searchParams.get('error');

    // Password login state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loginLoading, setLoginLoading] = useState(false);
    const [loginError, setLoginError] = useState<string | null>(null);

    // Magic link state
    const [magicEmail, setMagicEmail] = useState('');
    const [magicLoading, setMagicLoading] = useState(false);
    const [magicSent, setMagicSent] = useState(false);
    const [magicError, setMagicError] = useState<string | null>(null);
    const [showMagic, setShowMagic] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError(null);
        setLoginLoading(true);
        try {
            const result = await signIn('credentials', {
                email: email.trim(),
                password,
                redirect: false,
            });
            if (result?.ok) {
                router.push('/smb');
            } else {
                setLoginError('Incorrect email or password.');
            }
        } catch {
            setLoginError('Network error. Please try again.');
        } finally {
            setLoginLoading(false);
        }
    };

    const handleMagicLink = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!magicEmail.trim()) return;
        setMagicLoading(true);
        setMagicError(null);
        try {
            const res = await fetch('/api/smb/request-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: magicEmail.trim() }),
            });
            const d = await res.json();
            if (d.success) {
                setMagicSent(true);
            } else {
                setMagicError(d.error || 'Failed to send login link.');
            }
        } catch {
            setMagicError('Network error. Please try again.');
        } finally {
            setMagicLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 to-indigo-50/30 dark:from-slate-950 dark:to-indigo-950/20 flex justify-center items-center py-20 px-4">
            <div className="max-w-md w-full">
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl shadow-slate-200/60 dark:shadow-black/60 border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="p-8">
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center">
                                <Building2 size={24} />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Business Portal Login</h1>
                                <p className="text-sm text-slate-500">Access your listing dashboard</p>
                            </div>
                        </div>

                        {/* URL error (from magic link redirect) */}
                        {urlError && (
                            <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm mb-6">
                                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                                {urlError === 'invalid_token'
                                    ? 'This login link has expired or already been used. Log in with your password below.'
                                    : 'Something went wrong. Please log in below.'}
                            </div>
                        )}

                        {/* Password login form */}
                        <form onSubmit={handleLogin} className="space-y-4">
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

                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
                                <div className="flex items-center gap-3 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 bg-slate-50 dark:bg-slate-950 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 transition">
                                    <Lock size={16} className="text-slate-400 flex-shrink-0" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="Your password"
                                        required
                                        className="flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none"
                                    />
                                    <button type="button" onClick={() => setShowPassword(p => !p)} className="text-slate-400 hover:text-slate-600 transition">
                                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                            </div>

                            {loginError && (
                                <div className="flex items-center gap-2 text-red-500 text-sm">
                                    <AlertCircle size={14} /> {loginError}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loginLoading || !email.trim() || !password}
                                className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition"
                            >
                                {loginLoading ? (
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>Sign In <ArrowRight size={16} /></>
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="flex items-center gap-3 my-6">
                            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                            <span className="text-xs text-slate-400 font-medium">or</span>
                            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                        </div>

                        {/* Magic link fallback */}
                        {!showMagic ? (
                            <button
                                onClick={() => setShowMagic(true)}
                                className="w-full text-sm text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 transition font-medium"
                            >
                                Forgot password? Send me a login link →
                            </button>
                        ) : magicSent ? (
                            <div className="text-center py-2">
                                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <CheckCircle2 size={24} />
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Login link sent to <strong className="text-slate-800 dark:text-white">{magicEmail}</strong>. Check your inbox.
                                </p>
                                <button onClick={() => { setMagicSent(false); setMagicEmail(''); }} className="mt-3 text-xs text-slate-400 hover:text-slate-600 transition">
                                    Use a different email
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleMagicLink} className="space-y-3">
                                <div className="flex items-center gap-3 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 bg-slate-50 dark:bg-slate-950 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 transition">
                                    <Mail size={16} className="text-slate-400 flex-shrink-0" />
                                    <input
                                        type="email"
                                        value={magicEmail}
                                        onChange={e => setMagicEmail(e.target.value)}
                                        placeholder="you@yourbusiness.com"
                                        required
                                        className="flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none"
                                    />
                                </div>
                                {magicError && <p className="text-red-500 text-xs">{magicError}</p>}
                                <button
                                    type="submit"
                                    disabled={magicLoading || !magicEmail.trim()}
                                    className="w-full flex items-center justify-center gap-2 border border-primary-500 text-primary-600 dark:text-primary-400 font-semibold py-3 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 disabled:opacity-60 transition text-sm"
                                >
                                    {magicLoading ? <span className="w-4 h-4 border-2 border-primary-400/30 border-t-primary-500 rounded-full animate-spin" /> : <>Send Login Link <ArrowRight size={14} /></>}
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                <p className="text-center text-xs text-slate-400 mt-6">
                    Don't have an account?{' '}
                    <Link href="/pricing" className="text-primary-500 hover:underline">Claim your free listing</Link>
                </p>
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
