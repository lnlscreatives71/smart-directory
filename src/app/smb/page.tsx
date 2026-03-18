'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Settings, Star, CheckCircle2, ArrowRight, ExternalLink, Clock, Phone, Globe, MapPin, XCircle } from 'lucide-react';

interface Listing {
    id: number;
    name: string;
    slug: string;
    description: string;
    phone: string;
    website: string;
    street_address: string;
    location_city: string;
    image_url: string;
    claimed: boolean;
    plan_name: string;
    plan_price: number;
    business_hours: any[];
    contact_email: string;
}

export default function SmbDashboardPage() {
    const { data: session } = useSession();
    const [listing, setListing] = useState<Listing | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/smb/listing')
            .then(r => r.json())
            .then(d => {
                if (d.success) setListing(d.data);
            })
            .finally(() => setLoading(false));
    }, []);

    const isPremium = listing?.plan_name?.toLowerCase().includes('premium');

    const profileCompleteness = listing ? [
        { label: 'Business name', done: !!listing.name },
        { label: 'Description', done: !!listing.description && listing.description.length > 20 },
        { label: 'Phone number', done: !!listing.phone },
        { label: 'Website', done: !!listing.website },
        { label: 'Photo', done: !!listing.image_url },
        { label: 'Business hours', done: Array.isArray(listing.business_hours) && listing.business_hours.length > 0 },
    ] : [];

    const completedCount = profileCompleteness.filter(i => i.done).length;
    const completionPct = profileCompleteness.length ? Math.round((completedCount / profileCompleteness.length) * 100) : 0;

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!listing) {
        return (
            <div className="text-center py-20">
                <p className="text-slate-500">No listing found for your account. Contact support.</p>
            </div>
        );
    }

    // Pending approval — show holding screen (bypass if already premium/paid)
    if ((listing as any).claim_status === 'pending' && !isPremium) {
        return (
            <div className="max-w-lg mx-auto text-center py-16">
                <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Clock size={36} />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Your claim is under review</h1>
                <p className="text-slate-500 leading-relaxed mb-6">
                    We've received your claim for <strong className="text-slate-800 dark:text-white">{listing.name}</strong>.
                    Our team will review and approve it shortly — usually within 1 business day.
                    You'll receive an email once it's approved and your dashboard is unlocked.
                </p>
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-5 text-sm text-amber-700 dark:text-amber-300">
                    While you wait, you won't be able to edit your listing. Once approved, you'll have full access.
                </div>
            </div>
        );
    }

    // Rejected — show message
    if ((listing as any).claim_status === 'rejected') {
        return (
            <div className="max-w-lg mx-auto text-center py-16">
                <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <XCircle size={36} />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Claim not approved</h1>
                <p className="text-slate-500 leading-relaxed">
                    We were unable to verify your ownership of <strong className="text-slate-800 dark:text-white">{listing.name}</strong>.
                    Please contact us if you believe this is an error.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Welcome header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{listing.name}</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        {listing.location_city} · {isPremium ? (
                            <span className="text-primary-500 font-semibold">Premium Listing</span>
                        ) : (
                            <span>Free Listing</span>
                        )}
                    </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Link
                        href={`/biz/${listing.slug}`}
                        target="_blank"
                        className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:border-primary-400 hover:text-primary-600 transition"
                    >
                        <ExternalLink size={14} /> View Public Profile
                    </Link>
                    <Link
                        href="/smb/listing"
                        className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold transition"
                    >
                        <Settings size={14} /> Edit Listing
                    </Link>
                </div>
            </div>

            {/* Profile completeness card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-slate-900 dark:text-white">Profile Completeness</h2>
                    <span className="text-sm font-bold text-primary-600">{completionPct}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mb-5">
                    <div
                        className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${completionPct}%` }}
                    />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    {profileCompleteness.map(item => (
                        <div key={item.label} className="flex items-center gap-2 text-sm">
                            <CheckCircle2
                                size={15}
                                className={item.done ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'}
                            />
                            <span className={item.done ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'}>
                                {item.label}
                            </span>
                        </div>
                    ))}
                </div>
                {completionPct < 100 && (
                    <Link
                        href="/smb/listing"
                        className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700"
                    >
                        Complete your profile <ArrowRight size={14} />
                    </Link>
                )}
            </div>

            {/* Current listing snapshot */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                <h2 className="font-bold text-slate-900 dark:text-white mb-4">Your Listing Info</h2>
                <div className="space-y-3 text-sm">
                    {listing.phone && (
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <Phone size={14} className="text-slate-400 shrink-0" />
                            {listing.phone}
                        </div>
                    )}
                    {listing.website && (
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <Globe size={14} className="text-slate-400 shrink-0" />
                            <a href={listing.website} target="_blank" className="text-primary-500 hover:underline truncate">
                                {listing.website}
                            </a>
                        </div>
                    )}
                    {listing.street_address && (
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <MapPin size={14} className="text-slate-400 shrink-0" />
                            {listing.street_address}
                        </div>
                    )}
                    {Array.isArray(listing.business_hours) && listing.business_hours.length > 0 && (
                        <div className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
                            <Clock size={14} className="text-slate-400 shrink-0 mt-0.5" />
                            <span>{listing.business_hours.length} days of hours set</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Premium upsell (only shown on free plan) */}
            {!isPremium && (
                <div className="bg-gradient-to-br from-primary-600 to-indigo-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center gap-2 mb-2">
                        <Star size={18} className="text-yellow-300" />
                        <h2 className="font-bold text-lg">Get 4x More Leads with Premium</h2>
                    </div>
                    <ul className="text-primary-100 text-sm space-y-1.5 mb-5">
                        <li>🔝 Priority placement above free listings</li>
                        <li>🤖 AI Chat widget on your profile</li>
                        <li>📅 Booking calendar for appointments</li>
                        <li>⭐ Verified Featured badge</li>
                    </ul>
                    <Link
                        href="/pricing"
                        className="inline-flex items-center gap-2 bg-white text-primary-700 font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-primary-50 transition"
                    >
                        Upgrade to Premium — $29/mo <ArrowRight size={14} />
                    </Link>
                </div>
            )}
        </div>
    );
}
