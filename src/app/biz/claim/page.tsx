'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import Link from 'next/link';

function ClaimContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const [status, setStatus] = useState('loading'); // loading, ready, claimed, error
    const [bizName, setBizName] = useState('');
    const [slug, setSlug] = useState('');

    useEffect(() => {
        if (!id) {
            setStatus('error');
            return;
        }
        fetch(`/api/listings/${id}`).then(res => res.json()).then(data => {
            if (data.success) {
                setBizName(data.data.name);
                setSlug(data.data.slug);
                if (data.data.claimed) {
                    setStatus('claimed');
                } else {
                    setStatus('ready');
                }
            } else {
                setStatus('error');
            }
        });
    }, [id]);

    const handleClaim = async () => {
        setStatus('claiming');
        try {
            // Simulate network delay to make the UX feel secure and validating
            await new Promise(r => setTimeout(r, 800));
            const res = await fetch('/api/claim', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            const d = await res.json();
            if (d.success) {
                setStatus('claimed');
            } else {
                setStatus('error');
            }
        } catch (e) {
            setStatus('error');
        }
    };

    if (status === 'loading') {
        return <div className="p-12 text-center text-slate-500 font-medium animate-pulse">Loading secure session...</div>;
    }

    if (status === 'error') {
        return (
            <div className="p-12 text-center text-red-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Invalid or Expired Link</h2>
                <p className="text-slate-500">We couldn't verify this business claim link. Please contact support.</p>
            </div>
        );
    }

    if (status === 'claimed') {
        return (
            <div className="text-center p-8">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Profile Verified!</h1>
                <p className="text-slate-500 mb-8 font-medium">You have successfully claimed <b>{bizName}</b>. Your profile will now show an Official Verified Badge to users.</p>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 p-6 rounded-2xl text-left mb-8">
                    <h3 className="font-bold text-blue-900 dark:text-blue-100 text-lg mb-2">Ready to level up?</h3>
                    <p className="text-sm text-blue-800 dark:text-blue-200 mb-5">Premium listings receive up to 4x more inbound leads and unlock our built-in AI Chatbot widget directly on your profile.</p>
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition text-center shadow-blue-500/20">Upgrade to Premium</button>
                </div>

                {slug && (
                    <Link href={`/biz/${slug}`} className="text-slate-500 font-medium hover:text-slate-900 dark:hover:text-white transition underline block">
                        &larr; Return to my public profile
                    </Link>
                )}
            </div>
        );
    }

    return (
        <div className="text-center p-8">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <ShieldCheck className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Claim Your Business</h1>
            <p className="text-slate-500 mb-8 font-medium leading-relaxed">Verify your ownership of <b>{bizName}</b> to take control of your listing and receive inbound leads directly to your inbox.</p>

            <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl text-left mb-8 space-y-4">
                <p className="flex items-center text-slate-700 dark:text-slate-300 font-medium">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 mr-3 shrink-0" /> Control & Edit Profile Info
                </p>
                <p className="flex items-center text-slate-700 dark:text-slate-300 font-medium">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 mr-3 shrink-0" /> Receive User Messages/Leads
                </p>
                <p className="flex items-center text-slate-700 dark:text-slate-300 font-medium">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 mr-3 shrink-0" /> Official Verified Checkmark
                </p>
            </div>

            <button
                onClick={handleClaim}
                disabled={status === 'claiming'}
                className="w-full bg-slate-900 hover:bg-black dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold py-4 rounded-xl shadow-lg transition flex items-center justify-center disabled:opacity-75 disabled:cursor-not-allowed"
            >
                {status === 'claiming' ? (
                    <span className="flex items-center"><svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Validating Identity...</span>
                ) : 'Yes, I authorize this claim'}
            </button>
        </div>
    );
}

export default function ClaimPage() {
    return (
        <div className="min-h-[85vh] bg-slate-100/50 dark:bg-slate-950 flex justify-center py-20 px-4">
            <div className="max-w-xl w-full bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-200 dark:border-slate-800 overflow-hidden">
                <Suspense fallback={<div className="p-12 text-center text-slate-500 font-medium animate-pulse">Establishing secure session...</div>}>
                    <ClaimContent />
                </Suspense>
            </div>
        </div>
    );
}
