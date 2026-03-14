import Link from 'next/link';
import PricingClient from './PricingClient';
import { sql } from '@/lib/db';
import { Plan } from '@/lib/types';

export const dynamic = 'force-dynamic';

import { ALL_FEATURES } from '@/lib/constants';

export default async function PricingPage() {
    let plans: Plan[] = [];
    try {
        plans = await sql`SELECT * FROM plans ORDER BY monthly_price ASC` as any as Plan[];
    } catch {
        // Fallback or empty state handled gracefully
    }

    const freePlan = plans.find(p => p.monthly_price === 0);
    const premiumPlan = plans.find(p => p.monthly_price > 0 && p.monthly_price !== 0) || plans[0];

    const freeFeaturesFallback = ['Address', 'Phone', 'Website', 'Profile Image', 'Cover Image', 'Email Address', 'Business Description', 'Teams'];
    const premiumFeaturesFallback = ALL_FEATURES;
    
    // Combine standard features and any custom features the user added this session
    const combinedFeatures = Array.from(new Set([
        ...ALL_FEATURES,
        ...(freePlan?.features || []),
        ...(premiumPlan?.features || [])
    ]));

    const FREE_FEATURES = combinedFeatures.map(name => ({
        name,
        included: (freePlan?.features && freePlan.features.length > 0) 
            ? freePlan.features.includes(name) 
            : freeFeaturesFallback.includes(name)
    }));

    const PREMIUM_FEATURES = combinedFeatures.map(name => ({
        name,
        included: (premiumPlan?.features && premiumPlan.features.length > 0) 
            ? premiumPlan.features.includes(name) 
            : premiumFeaturesFallback.includes(name)
    }));


    return (
        <div className="bg-[#f0f2f5] min-h-[calc(100vh-64px)] py-16 px-4">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-[#1a202c] mb-6">
                        Choose Your Perfect Plan From Us
                    </h1>
                </div>

                {/* Client component handles the Monthly/Annually Toggle and the UI */}
                <PricingClient 
                    freePlan={freePlan as any} 
                    premiumPlan={premiumPlan as any} 
                    freeFeatures={FREE_FEATURES} 
                    premiumFeatures={PREMIUM_FEATURES} 
                />
            </div>
        </div>
    );
}
