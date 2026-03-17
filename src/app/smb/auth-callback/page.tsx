'use client';

/**
 * /smb/auth-callback
 *
 * Intermediate page that receives the short-lived session token from the
 * magic-login API redirect, calls signIn with the magic token, then sends
 * the SMB to their dashboard.
 */
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Suspense } from 'react';

function AuthCallbackContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const st = searchParams.get('st');
        if (!st) {
            setError('Missing session token.');
            return;
        }

        try {
            const base64 = st.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(atob(base64));
            if (!payload.email || !payload.token || Date.now() > payload.exp) {
                setError('This link has expired. Please request a new one.');
                return;
            }

            signIn('credentials', {
                email: payload.email,
                password: `magic:${payload.token}`,
                redirect: false,
            }).then(result => {
                if (result?.ok) {
                    router.replace('/smb');
                } else {
                    setError('Login failed. The link may have already been used.');
                }
            });
        } catch {
            setError('Invalid session token.');
        }
    }, [searchParams, router]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
                <div className="max-w-md w-full text-center">
                    <p className="text-red-400 text-lg font-semibold mb-4">{error}</p>
                    <a href="/smb/login" className="text-primary-400 underline text-sm">
                        Go to login →
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
            <div className="text-center">
                <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-400 text-sm">Signing you in…</p>
            </div>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
        }>
            <AuthCallbackContent />
        </Suspense>
    );
}
