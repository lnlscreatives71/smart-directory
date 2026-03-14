import Link from 'next/link';
import { Check, X } from 'lucide-react';
import { sql } from '@/lib/db';
import { Plan } from '@/lib/types';

export const dynamic = 'force-dynamic';

const FEATURES = [
    { name: 'Address', free: true, premium: true },
    { name: 'Phone', free: true, premium: true },
    { name: 'Website', free: true, premium: true },
    { name: 'Blogs', free: false, premium: true },
    { name: 'Events', free: false, premium: true },
    { name: 'Jobs', free: false, premium: true },
    { name: 'News Feeds', free: false, premium: true },
    { name: 'Business Description', free: true, premium: true },
    { name: 'Additional Images', free: false, premium: true },
    { name: 'Email Address', free: true, premium: true },
    { name: 'Profile Image', free: false, premium: true },
    { name: 'Teams', free: false, premium: true },
    { name: 'Google Map Configuration', free: false, premium: true },
    { name: 'Site Reviews', free: false, premium: true },
    { name: 'Google Reviews', free: false, premium: true },
    { name: 'Business Hour Configurations', free: false, premium: true },
    { name: 'Video Embed', free: false, premium: true },
    { name: 'Google Place Images', free: false, premium: true },
    { name: 'Cover Image', free: false, premium: true },
    { name: 'Extra Links', free: false, premium: true },
    { name: 'Social Media', free: true, premium: true },
];

export default async function PricingPage() {
    let plans: Plan[] = [];
    try {
        plans = await sql`SELECT * FROM plans ORDER BY monthly_price ASC` as any as Plan[];
    } catch {
        // Fallback or empty state handled gracefully
    }

    const freePlan = plans.find(p => p.monthly_price === 0);
    const premiumPlan = plans.find(p => p.monthly_price > 0 && p.monthly_price !== 0) || plans[0];

    return (
        <div className="bg-slate-50 min-h-screen py-16">
            <div className="max-w-4xl mx-auto px-4">
                
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Select Your Listing Plan</h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Join our directory to increase your local visibility, generate leads, and dominate your market.
                    </p>
                </div>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
                    
                    {/* Header Row */}
                    <div className="grid grid-cols-2 bg-slate-900 text-white border-b border-slate-800">
                        <div className="p-8 text-center border-r border-slate-800 flex flex-col justify-between">
                            <div>
                                <h2 className="text-2xl font-bold mb-2">{freePlan?.name || 'Local Listing'}</h2>
                                <div className="text-4xl font-extrabold mb-1">$0<span className="text-lg font-medium text-slate-400">/mo</span></div>
                                <p className="text-sm text-slate-400 mt-2">Basic visibility in the community.</p>
                            </div>
                        </div>
                        <div className="p-8 text-center flex flex-col justify-between relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1 pb-1 transform rotate-45 translate-x-[12px] translate-y-[12px] shadow-sm">
                                Recommended
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold mb-2 text-blue-400">{premiumPlan?.name || 'Local Spotlight'}</h2>
                                <div className="text-4xl font-extrabold mb-1">${premiumPlan?.monthly_price || 29}<span className="text-lg font-medium text-slate-400">/mo</span></div>
                                <p className="text-sm text-slate-400 mt-2">Maximum exposure and lead generation.</p>
                            </div>
                        </div>
                    </div>

                    {/* Features Table */}
                    <div className="divide-y divide-slate-100">
                        {FEATURES.map((feature, i) => (
                            <div key={i} className={`grid grid-cols-2 relative ${i % 2 === 0 ? 'bg-slate-50' : 'bg-white'} hover:bg-slate-100 transition-colors`}>
                                {/* Feature Name Overlay (centered over the line) */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <span className={`text-xs font-bold uppercase tracking-wider px-4 py-1 rounded-full border border-slate-200 shadow-sm ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'} text-slate-700`}>
                                        {feature.name}
                                    </span>
                                </div>
                                
                                {/* Free Column */}
                                <div className="py-5 flex items-center justify-center border-r border-slate-100">
                                    {feature.free ? (
                                        <Check className="text-emerald-500 w-5 h-5" strokeWidth={3} />
                                    ) : (
                                        <X className="text-red-500 w-5 h-5" strokeWidth={3} />
                                    )}
                                </div>
                                
                                {/* Premium Column */}
                                <div className="py-5 flex items-center justify-center">
                                    {feature.premium ? (
                                        <Check className="text-emerald-500 w-5 h-5" strokeWidth={3} />
                                    ) : (
                                        <X className="text-red-500 w-5 h-5" strokeWidth={3} />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer Row */}
                    <div className="grid grid-cols-2 bg-slate-50 border-t border-slate-200">
                        <div className="p-8 text-center border-r border-slate-200">
                            <Link href="/dashboard/listings/new" className="inline-block w-full py-4 px-6 rounded-xl font-bold border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white transition-colors uppercase tracking-wide text-sm">
                                Add Your Business
                            </Link>
                        </div>
                        <div className="p-8 text-center">
                            <Link href="/dashboard/listings/new?plan=premium" className="inline-block w-full py-4 px-6 rounded-xl font-bold bg-blue-600 text-white border-2 border-blue-600 hover:bg-blue-700 hover:border-blue-700 shadow-lg shadow-blue-900/20 transition-all uppercase tracking-wide text-sm">
                                Upgrade Now
                            </Link>
                        </div>
                    </div>

                </div>

                <div className="mt-12 text-center text-slate-500 text-sm">
                    <p>Both plans offer a beautiful front-end experience.</p>
                    <p>Have questions? <a href="#" className="font-semibold text-blue-600 hover:underline">Contact our support team</a>.</p>
                </div>

            </div>
        </div>
    );
}
