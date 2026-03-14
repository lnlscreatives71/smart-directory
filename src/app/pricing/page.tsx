import Link from 'next/link';
import PricingClient from './PricingClient';
import { sql } from '@/lib/db';
import { Plan } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function PricingPage() {
    let plans: Plan[] = [];
    try {
        plans = await sql`SELECT * FROM plans ORDER BY monthly_price ASC` as any as Plan[];
    } catch {
        // Fallback or empty state handled gracefully
    }

    const freePlan = plans.find(p => p.monthly_price === 0);
    const premiumPlan = plans.find(p => p.monthly_price > 0 && p.monthly_price !== 0) || plans[0];

    const FREE_FEATURES = [
        { name: 'Address', included: true },
        { name: 'Phone', included: true },
        { name: 'Website', included: true },
        { name: 'Profile Image', included: true },
        { name: 'Cover Image', included: true },
        { name: 'Email Address', included: true },
        { name: 'Business Description', included: true },
        { name: 'Teams', included: true },
        { name: 'Social Media', included: false },
        { name: 'Business Hour Configurations', included: false },
        { name: 'Additional Images', included: false },
        { name: 'Extra Links', included: false },
        { name: 'Blogs', included: false },
        { name: 'Events', included: false },
        { name: 'Jobs', included: false },
        { name: 'News Feeds', included: false },
        { name: 'Google Map Configuration', included: false },
        { name: 'Site Reviews', included: false },
        { name: 'Google Reviews', included: false },
        { name: 'Video Embed', included: false },
        { name: 'Google Place Images', included: false },
    ];

    const PREMIUM_FEATURES = [
        { name: 'Address', included: true },
        { name: 'Phone', included: true },
        { name: 'Website', included: true },
        { name: 'Profile Image', included: true },
        { name: 'Cover Image', included: true },
        { name: 'Email Address', included: true },
        { name: 'Business Description', included: true },
        { name: 'Teams', included: true },
        { name: 'Social Media', included: true },
        { name: 'Business Hour Configurations', included: true },
        { name: 'Additional Images', included: true },
        { name: 'Extra Links', included: true },
        { name: 'Blogs', included: true },
        { name: 'Events', included: true },
        { name: 'Jobs', included: true },
        { name: 'News Feeds', included: true },
        { name: 'Google Map Configuration', included: true },
        { name: 'Site Reviews', included: true },
        { name: 'Google Reviews', included: true },
        { name: 'Video Embed', included: true },
        { name: 'Google Place Images', included: true },
    ];

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
