import Link from 'next/link';
import { ArrowUpRight, Check } from 'lucide-react';

export const metadata = {
    title: 'Agency Pricing - White-Label SaaS Directory',
    description: 'Launch your own high-ticket business directory with our white-label SaaS platform.',
};

export default function AgencyPricingPage() {
    const AGENCY_PLANS = [
        {
            name: 'Single Site',
            priceStr: '$199.00',
            salePriceStr: '$99',
            description: 'Perfect for launching one specific location or niche.',
            features: [
                'License to install one (1) SmartDirectory site',
                'Unlimited free listings',
                'Unlimited premium listings',
                'Unlimited blog posts',
                'Unlimited events',
                'Unlimited job postings',
                'Unlimited news feed updates',
                'Full support and training included',
                '30 days FREE access to HighLevel included',
            ],
            buttonText: 'Start Building',
            href: 'https://smartdirectory.ai/?utm_source=Tom-YT'
        },
        {
            name: 'Unlimited Sites',
            priceStr: '$599.00',
            salePriceStr: '$299',
            description: 'For power-agencies building empires across multiple cities.',
            features: [
                'License to install UNLIMITED SmartDirectory sites',
                'Unlimited free listings',
                'Unlimited premium listings',
                'Unlimited blog posts',
                'Unlimited events',
                'Unlimited job postings',
                'Unlimited news feed updates',
                'Full support and training included',
                '30 days FREE access to HighLevel included',
            ],
            isPopular: true,
            buttonText: 'Get the Empire Plan',
            href: 'https://smartdirectory.ai/?utm_source=Tom-YT'
        }
    ];

    return (
        <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-950 py-20 px-4 flex flex-col items-center">
            
            <div className="text-center max-w-3xl mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass bg-primary-500/10 text-sm font-semibold text-primary-600 dark:text-primary-400 mb-4 border border-primary-500/20">
                    White-Label Agency System
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold text-[#1a202c] dark:text-white mb-6 tracking-tight">
                    Own the Software. <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500">Keep 100% of the Profits.</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400">
                    License our turnkey directory technology and start charging local businesses MRR (Monthly Recurring Revenue) in your own city.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl mx-auto items-stretch">
                {AGENCY_PLANS.map((plan, i) => (
                    <div key={i} className={`relative glass rounded-3xl p-8 flex flex-col overflow-hidden bg-white dark:bg-slate-900 border ${plan.isPopular ? 'border-primary-500 shadow-2xl shadow-primary-500/20' : 'border-slate-200 dark:border-slate-800 shadow-xl'}`}>
                        {plan.isPopular && (
                            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary-500 to-secondary-500"></div>
                        )}
                        {plan.isPopular && (
                            <div className="absolute top-5 right-5 px-3 py-1 text-[11px] font-bold tracking-widest uppercase text-white bg-primary-500 rounded-full shadow-lg">
                                Agency Favorite
                            </div>
                        )}
                        
                        <div className="mb-6">
                            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">{plan.name}</h3>
                            <p className="text-slate-500 text-sm mt-2">{plan.description}</p>
                        </div>
                        
                        <div className="mb-8 pb-8 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl font-bold text-slate-400 line-through decoration-red-500/50 decoration-2">{plan.priceStr}</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-black text-primary-600 dark:text-primary-400">{plan.salePriceStr}</span>
                                    <span className="text-lg font-bold text-slate-500">/month</span>
                                </div>
                            </div>
                        </div>

                        <ul className="space-y-4 mb-10 shrink-0 flex-1">
                            {plan.features.map((feature, j) => (
                                <li key={j} className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-secondary-500 shrink-0 mt-0.5" strokeWidth={3} />
                                    <span className="text-slate-700 dark:text-slate-300 font-medium text-sm leading-relaxed">{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <a 
                            href={plan.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`w-full py-4 text-center rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg text-[15px] hover:-translate-y-1 ${plan.isPopular ? 'bg-primary-600 hover:bg-primary-500 text-white shadow-primary-500/30' : 'bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 dark:hover:bg-slate-700'}`}
                        >
                            {plan.buttonText} <ArrowUpRight size={18} />
                        </a>
                    </div>
                ))}
            </div>
            
            <div className="mt-20 max-w-2xl text-center">
                <p className="text-slate-500 text-sm">
                    All agency licenses come fully white-labeled. You hook up your own Stripe account, your own domain, and you keep 100% of the subscription revenue generated from your local businesses forever.
                </p>
            </div>
        </div>
    );
}
