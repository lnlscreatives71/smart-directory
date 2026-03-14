'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { CheckCircle2, ShieldCheck, AlertCircle, ArrowRight, Building2, Phone, Globe, FileText, Star } from 'lucide-react';
import Link from 'next/link';

// ── Types ────────────────────────────────────────────────────────────────────
interface ListingData {
    id: number;
    name: string;
    slug: string;
    category: string;
    description: string;
    phone: string;
    website: string;
    contact_name: string;
    contact_email: string;
    claimed: boolean;
    location_city: string;
}

// ── Step Indicator ────────────────────────────────────────────────────────────
function StepDots({ step, total }: { step: number; total: number }) {
    return (
        <div className="flex items-center justify-center gap-2 mb-8">
            {Array.from({ length: total }).map((_, i) => (
                <span
                    key={i}
                    className={`block rounded-full transition-all duration-300 ${i + 1 === step ? 'w-6 h-2.5 bg-primary-500' : i + 1 < step ? 'w-2.5 h-2.5 bg-emerald-500' : 'w-2.5 h-2.5 bg-slate-300 dark:bg-slate-700'}`}
                />
            ))}
        </div>
    );
}

// ── Input ─────────────────────────────────────────────────────────────────────
function Field({ label, icon: Icon, value, onChange, placeholder, type = 'text' }: {
    label: string;
    icon: any;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    type?: string;
}) {
    return (
        <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
            <div className="flex items-center gap-3 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 bg-slate-50 dark:bg-slate-900 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 transition">
                <Icon size={16} className="text-slate-400 flex-shrink-0" />
                <input
                    type={type}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none"
                />
            </div>
        </div>
    );
}

// ── Main Claim Flow ───────────────────────────────────────────────────────────
function ClaimContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    const [step, setStep] = useState(1); // 1=confirm, 2=profile, 3=success
    const [status, setStatus] = useState<'loading' | 'ready' | 'already_claimed' | 'error'>('loading');
    const [biz, setBiz] = useState<ListingData | null>(null);
    const [saving, setSaving] = useState(false);

    // Editable profile fields
    const [contactName, setContactName] = useState('');
    const [phone, setPhone] = useState('');
    const [website, setWebsite] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (!id) { setStatus('error'); return; }
        fetch(`/api/listings/${id}`)
            .then(r => r.json())
            .then(d => {
                if (d.success) {
                    const data = d.data as ListingData;
                    setBiz(data);
                    setContactName(data.contact_name || '');
                    setPhone(data.phone || '');
                    setWebsite(data.website || '');
                    setDescription(data.description || '');
                    setStatus(data.claimed ? 'already_claimed' : 'ready');
                } else {
                    setStatus('error');
                }
            })
            .catch(() => setStatus('error'));
    }, [id]);

    const handleClaim = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/claim', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: Number(id), contact_name: contactName, phone, website, description }),
            });
            const d = await res.json();
            if (d.success) {
                setStep(3);
            } else {
                alert(d.error || 'Something went wrong. Please try again.');
            }
        } catch {
            alert('Network error. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    // ── States ──────────────────────────────────────────────────────────────
    if (status === 'loading') return (
        <div className="p-16 text-center">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400 text-sm font-medium">Verifying your listing...</p>
        </div>
    );

    if (status === 'error') return (
        <div className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Invalid Link</h2>
            <p className="text-slate-500 text-sm">We couldn't find this business. The link may be expired or invalid.</p>
        </div>
    );

    if (status === 'already_claimed' && step !== 3) return (
        <div className="p-10 text-center">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Already Claimed</h2>
            <p className="text-slate-500 mb-6 text-sm">This business has already been claimed. If you own it, log in to manage your profile.</p>
            <Link href="/dashboard" className="btn-primary px-6 py-2.5 text-sm">Go to Dashboard</Link>
        </div>
    );

    // ── Step 3: Success ──────────────────────────────────────────────────────
    if (step === 3) return (
        <div className="p-8 text-center">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <CheckCircle2 size={40} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">You're live! 🎉</h1>
            <p className="text-slate-500 mb-8 leading-relaxed">
                <strong className="text-slate-800 dark:text-white">{biz?.name}</strong> is now verified on The Triangle Hub.
                A confirmation email is on its way to you.
            </p>

            <div className="bg-gradient-to-br from-primary-50 to-indigo-50 dark:from-primary-900/20 dark:to-indigo-900/20 border border-primary-100 dark:border-primary-800/50 p-6 rounded-2xl text-left mb-8">
                <div className="flex items-center gap-2 mb-3">
                    <Star size={18} className="text-primary-500" />
                    <h3 className="font-bold text-slate-900 dark:text-white">Get 4x more leads with Premium</h3>
                </div>
                <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1.5 mb-5">
                    <li>🔝 Priority placement above free listings</li>
                    <li>🤖 AI Chat widget on your profile</li>
                    <li>📅 Booking calendar for appointments</li>
                    <li>⭐ Verified Featured badge</li>
                </ul>
                <Link href="/pricing" className="block w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl text-center transition text-sm">
                    Upgrade to Premium — $29/mo →
                </Link>
            </div>

            {biz?.slug && (
                <Link href={`/biz/${biz.slug}`} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-sm font-medium transition">
                    ← View my public profile
                </Link>
            )}
        </div>
    );

    // ── Step 1: Confirm Identity ─────────────────────────────────────────────
    if (step === 1) return (
        <div className="p-8">
            <StepDots step={1} total={2} />
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <ShieldCheck size={24} />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Claim Your Business</h1>
                    <p className="text-sm text-slate-500">Step 1 of 2 — Confirm ownership</p>
                </div>
            </div>

            {/* Business card */}
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 mb-6">
                <div className="flex items-center gap-3 mb-3">
                    <Building2 size={18} className="text-slate-400" />
                    <div>
                        <p className="font-bold text-slate-900 dark:text-white text-base">{biz?.name}</p>
                        <p className="text-xs text-slate-400">{biz?.category} · {biz?.location_city}</p>
                    </div>
                </div>
            </div>

            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                By continuing, you confirm that you are authorized to manage this business listing.
                On the next step you can update your profile details.
            </p>

            <ul className="space-y-3 mb-8">
                {[
                    'Control your business information',
                    'Receive inbound leads from local customers',
                    'Access your dashboard to manage your listing',
                    'Official Verified badge on your profile',
                ].map(item => (
                    <li key={item} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300 font-medium">
                        <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                        {item}
                    </li>
                ))}
            </ul>

            <button
                onClick={() => setStep(2)}
                className="w-full bg-slate-900 hover:bg-black dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold py-4 rounded-xl transition flex items-center justify-center gap-2"
            >
                Yes, I authorize this claim <ArrowRight size={16} />
            </button>
        </div>
    );

    // ── Step 2: Profile Info ──────────────────────────────────────────────────
    return (
        <div className="p-8">
            <StepDots step={2} total={2} />
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <FileText size={24} />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Update Your Info</h1>
                    <p className="text-sm text-slate-500">Step 2 of 2 — Confirm your details (optional)</p>
                </div>
            </div>

            <div className="space-y-4 mb-8">
                <Field label="Your Name" icon={Building2} value={contactName} onChange={setContactName} placeholder="Jane Smith" />
                <Field label="Phone Number" icon={Phone} value={phone} onChange={setPhone} placeholder="(919) 555-0100" type="tel" />
                <Field label="Website" icon={Globe} value={website} onChange={setWebsite} placeholder="https://yourbusiness.com" type="url" />
                <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Business Description</label>
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Tell customers what you do and what makes you special..."
                        rows={3}
                        className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 bg-slate-50 dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition resize-none"
                    />
                </div>
            </div>

            <div className="flex gap-3">
                <button
                    onClick={() => setStep(1)}
                    className="flex-1 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold py-3.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition text-sm"
                >
                    ← Back
                </button>
                <button
                    onClick={handleClaim}
                    disabled={saving}
                    className="flex-2 flex-grow-[2] bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-60"
                >
                    {saving ? (
                        <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</>
                    ) : (
                        <>Complete Claim <CheckCircle2 size={16} /></>
                    )}
                </button>
            </div>
            <p className="text-center text-xs text-slate-400 mt-3">All fields are optional — you can update them later from your dashboard.</p>
        </div>
    );
}

export default function ClaimPage() {
    return (
        <div className="min-h-[90vh] bg-gradient-to-br from-slate-100 to-indigo-50/30 dark:from-slate-950 dark:to-indigo-950/20 flex justify-center items-start py-20 px-4">
            <div className="max-w-lg w-full bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl shadow-slate-200/60 dark:shadow-black/60 border border-slate-200 dark:border-slate-800 overflow-hidden">
                <Suspense fallback={
                    <div className="p-16 text-center">
                        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-slate-400 text-sm">Loading...</p>
                    </div>
                }>
                    <ClaimContent />
                </Suspense>
            </div>
        </div>
    );
}
