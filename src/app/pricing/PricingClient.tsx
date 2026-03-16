'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plan } from '@/lib/types';
import { Check, X } from 'lucide-react';

type Feature = { name: string; included: boolean };

export default function PricingClient({
    freePlan,
    premiumPlan,
    freeFeatures,
    premiumFeatures
}: {
    freePlan: Plan;
    premiumPlan: Plan;
    freeFeatures: Feature[];
    premiumFeatures: Feature[];
}) {
    const [billing, setBilling] = useState<'monthly' | 'annually'>('monthly');

    return (
        <div>
            {/* Toggle */}
            <div className="flex justify-center items-center gap-4 text-lg font-bold mb-10">
                <button 
                    onClick={() => setBilling('monthly')}
                    className={`transition-colors ${billing === 'monthly' ? 'text-[#3182ce]' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Monthly
                </button>
                <div className="h-6 w-px bg-slate-300"></div>
                <button 
                    onClick={() => setBilling('annually')}
                    className={`transition-colors ${billing === 'annually' ? 'text-[#3182ce]' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Annually
                </button>
            </div>

            {/* Cards Container */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                
                {/* Free Card */}
                <div className="bg-[#f7fafc] rounded-lg p-8 border border-slate-200 shadow-sm flex flex-col items-center">
                    <h2 className="text-xl font-bold text-slate-900">Community Listing</h2>
                    <p className="text-sm text-slate-500 mb-6">Get your business on the map.</p>
                    
                    <div className="text-4xl font-extrabold text-slate-900 mb-1">FREE</div>
                    <div className="text-sm text-slate-500 font-medium mb-8 capitalize">{billing}</div>

                    <div className="w-full space-y-4 mb-10 flex-1">
                        {freeFeatures.map((f, i) => (
                            <div key={i} className="flex justify-center items-center gap-3 w-full">
                                {f.included ? (
                                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" strokeWidth={2.5} />
                                ) : (
                                    <X className="w-5 h-5 text-red-500 flex-shrink-0" strokeWidth={2.5} />
                                )}
                                <span className={`text-[#2d3748] font-medium text-sm flex-1 max-w-[200px] text-center`}>
                                    {f.name}
                                </span>
                            </div>
                        ))}
                    </div>

                    <Link href="/list-your-business" className="w-full sm:w-auto px-8 py-3 bg-[#e53e3e] hover:bg-red-600 text-white font-bold rounded shadow-md transition-colors text-sm uppercase tracking-wide">
                        ADD YOUR BUSINESS
                    </Link>
                </div>

                {/* Premium Card */}
                <div className="bg-[#f7fafc] rounded-lg p-8 border border-slate-200 shadow-sm flex flex-col items-center relative overflow-hidden">
                    <h2 className="text-xl font-bold text-slate-900">Local Spotlight</h2>
                    <p className="text-sm text-slate-500 mb-6">Stand out from the crowd.</p>
                    
                    <div className="text-4xl font-extrabold text-slate-900 mb-1">
                        ${billing === 'monthly' ? premiumPlan?.monthly_price || 29 : premiumPlan?.annual_price || 299}
                    </div>
                    <div className="text-sm text-slate-500 font-medium mb-8 capitalize">{billing}</div>

                    <div className="w-full space-y-4 mb-10 flex-1">
                        {premiumFeatures.map((f, i) => (
                            <div key={i} className="flex justify-center items-center gap-3 w-full">
                                {f.included ? (
                                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" strokeWidth={2.5} />
                                ) : (
                                    <X className="w-5 h-5 text-red-500 flex-shrink-0" strokeWidth={2.5} />
                                )}
                                <span className={`text-[#2d3748] font-medium text-sm flex-1 max-w-[200px] text-center`}>
                                    {f.name}
                                </span>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={async () => {
                            try {
                                const res = await fetch('/api/checkout', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ plan: 'premium', billing })
                                });
                                const data = await res.json();
                                if (data.url) {
                                    window.location.href = data.url;
                                } else if (data.demo) {
                                    // Show friendly message for demo mode
                                    alert('🎉 Demo Mode!\n\nThis is a demonstration platform. To enable payments and upgrade your listing, contact us at agency@lnlaiagency.com');
                                } else {
                                    alert('Checkout failed: ' + (data.message || data.error));
                                }
                            } catch (err) {
                                alert('An error occurred during checkout.');
                            }
                        }}
                        className="w-full sm:w-auto px-8 py-3 bg-[#e53e3e] hover:bg-red-600 text-white font-bold rounded shadow-md transition-colors text-sm uppercase tracking-wide">
                        Upgrade Now
                    </button>
                </div>

            </div>
        </div>
    );
}
