import { sql } from '@/lib/db';
import { Plan } from '@/lib/types';
import { Check, Shield, Zap } from 'lucide-react';

export default async function PlansPage() {
    let plans: Plan[] = [];
    try {
        plans = await sql<Plan[]>`SELECT * FROM plans ORDER BY monthly_price ASC`;
    } catch (err) {
        console.error('Failed to load plans', err);
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Plans & Tiers</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage monetization hierarchies and directory subscription plans.</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-5 rounded-lg font-medium shadow-sm transition-colors text-sm flex items-center">
                    <span className="mr-1">+</span> Add New Plan
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                {plans.map((plan, index) => {
                    const isPro = plan.name.toLowerCase() === 'pro';
                    const isPremium = plan.name.toLowerCase() === 'premium';

                    return (
                        <div key={plan.id} className={`relative bg-white dark:bg-slate-900 rounded-2xl border ${isPro ? 'border-purple-500 ring-2 ring-purple-500/20 shadow-xl shadow-purple-900/10' : isPremium ? 'border-blue-500 shadow-lg shadow-blue-900/5' : 'border-slate-200 dark:border-slate-800 shadow-sm'} p-8 flex flex-col`}>

                            {isPro && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-purple-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm">
                                    Top Tier
                                </div>
                            )}

                            <div className="mb-6 border-b border-slate-100 dark:border-slate-800/50 pb-6">
                                <h3 className={`text-xl font-bold capitalize mb-2 ${isPro ? 'text-purple-600 dark:text-purple-400' : isPremium ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                    {plan.name}
                                </h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-extrabold text-slate-900 dark:text-white">${plan.monthly_price}</span>
                                    <span className="text-slate-500 font-medium">/mo</span>
                                </div>
                                <p className="text-sm text-slate-500 mt-4 leading-relaxed">
                                    {plan.description}
                                </p>
                            </div>

                            <div className="flex-1">
                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-200 mb-4 uppercase tracking-wide">Included Limits</p>
                                <ul className="space-y-3 mb-8">
                                    <li className="flex items-start">
                                        <Check size={18} className="text-emerald-500 mr-2 shrink-0 mt-0.5" />
                                        <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">{plan.limits?.images || 1} Media Images</span>
                                    </li>
                                    <li className="flex items-start">
                                        <Check size={18} className="text-emerald-500 mr-2 shrink-0 mt-0.5" />
                                        <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">Up to {plan.limits?.categories || 1} Categories</span>
                                    </li>
                                    {isPremium || isPro ? (
                                        <li className="flex items-start">
                                            <Zap size={18} className="text-amber-500 mr-2 shrink-0 mt-0.5" />
                                            <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">AI Web Chat Widget</span>
                                        </li>
                                    ) : null}
                                    {isPro && (
                                        <li className="flex items-start">
                                            <Shield size={18} className="text-purple-500 mr-2 shrink-0 mt-0.5" />
                                            <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">Global Exact Match Priority</span>
                                        </li>
                                    )}
                                </ul>
                            </div>

                            <div className="mt-auto">
                                <button className={`w-full py-3 rounded-xl font-semibold transition ${isPro ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-md' : isPremium ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                                    Edit Plan
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
