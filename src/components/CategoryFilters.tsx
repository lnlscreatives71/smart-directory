'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Star } from 'lucide-react';

export default function CategoryFilters() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const cities = ['Raleigh', 'Durham', 'Cary', 'Chapel Hill'];
    const ratings = [['4.5+', '4.5'], ['4.0+', '4.0'], ['3.5+', '3.5']];
    const plans = ['Featured', 'Premium', 'Free'];

    const updateFilter = (key: string, value: string) => {
        const current = new URLSearchParams(searchParams.toString());
        
        if (current.get(key) === value) {
            current.delete(key);
        } else {
            current.set(key, value);
        }
        
        router.push(`${pathname}?${current.toString()}`);
    };

    const isChecked = (key: string, value: string) => {
        return searchParams.get(key) === value;
    };

    return (
        <aside className="w-full lg:w-64 shrink-0 space-y-4">
            <div className="glass rounded-2xl border border-white/10 shadow-sm p-5">
                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400 mb-4">Location</h3>
                <div className="space-y-2.5">
                    {cities.map(city => (
                        <label key={city} className="flex items-center gap-2.5 text-sm text-slate-300 cursor-pointer font-medium">
                            <input
                                type="checkbox"
                                checked={isChecked('city', city)}
                                onChange={() => updateFilter('city', city)}
                                className="rounded text-primary-500 focus:ring-primary-400 w-4 h-4 bg-slate-800 border-slate-600"
                            />
                            {city}
                        </label>
                    ))}
                </div>
            </div>

            <div className="glass rounded-2xl border border-white/10 shadow-sm p-5">
                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400 mb-4">Rating</h3>
                <div className="space-y-2.5">
                    {ratings.map(([label, val]) => (
                        <label key={val} className="flex items-center gap-2.5 text-sm text-slate-300 cursor-pointer font-medium">
                            <input
                                type="checkbox"
                                checked={isChecked('rating', val)}
                                onChange={() => updateFilter('rating', val)}
                                className="rounded text-primary-500 focus:ring-primary-400 w-4 h-4 bg-slate-800 border-slate-600"
                            />
                            <span className="flex items-center gap-1">
                                <Star size={13} className="text-amber-400 fill-amber-400" /> {label}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="glass rounded-2xl border border-white/10 shadow-sm p-5">
                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400 mb-4">Plan</h3>
                <div className="space-y-2.5">
                    {plans.map(plan => (
                        <label key={plan} className="flex items-center gap-2.5 text-sm text-slate-300 cursor-pointer font-medium">
                            <input
                                type="checkbox"
                                checked={isChecked('plan', plan)}
                                onChange={() => updateFilter('plan', plan)}
                                className="rounded text-primary-500 focus:ring-primary-400 w-4 h-4 bg-slate-800 border-slate-600"
                            />
                            {plan}
                        </label>
                    ))}
                </div>
            </div>

            {/* Clear Filters */}
            {searchParams.toString() && (
                <button
                    onClick={() => router.push(pathname)}
                    className="w-full py-2 text-sm text-primary-400 hover:text-primary-300 transition"
                >
                    Clear All Filters
                </button>
            )}
        </aside>
    );
}
