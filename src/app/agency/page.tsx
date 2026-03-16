'use client';

import { Building2, Globe, TrendingUp } from 'lucide-react';

export default function AgencyRedirectPage() {
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
            <div className="max-w-3xl mx-auto text-center">
                {/* Hero */}
                <div className="mb-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-600 to-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary-500/30">
                        <Building2 size={40} className="text-white" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
                        Own Your Local Directory
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                        Launch your own white-labeled business directory platform. 
                        Complete with AI chat, voice agents, booking systems, and full CRM.
                    </p>
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="glass p-6 rounded-2xl border border-slate-700">
                        <Globe size={32} className="text-primary-400 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-white mb-2">Custom Branding</h3>
                        <p className="text-slate-400 text-sm">Your logo, colors, and domain. Completely white-labeled.</p>
                    </div>
                    <div className="glass p-6 rounded-2xl border border-slate-700">
                        <TrendingUp size={32} className="text-primary-400 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-white mb-2">Keep All Revenue</h3>
                        <p className="text-slate-400 text-sm">You keep 100% of listing fees. We just charge platform fee.</p>
                    </div>
                    <div className="glass p-6 rounded-2xl border border-slate-700">
                        <Building2 size={32} className="text-primary-400 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-white mb-2">Full Platform</h3>
                        <p className="text-slate-400 text-sm">AI chat, voice agents, bookings, CRM - everything included.</p>
                    </div>
                </div>

                {/* CTA */}
                <div className="glass p-8 rounded-2xl border border-primary-500/30 bg-gradient-to-br from-primary-600/10 to-primary-500/10">
                    <h2 className="text-2xl font-bold text-white mb-4">
                        Interested in White Label?
                    </h2>
                    <p className="text-slate-400 mb-6 max-w-xl mx-auto">
                        This platform is available for white-label licensing to qualified agencies. 
                        Contact us to discuss pricing and availability.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a 
                            href="mailto:agency@lnlaiagency.com?subject=White Label Directory Inquiry"
                            className="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 text-white font-bold px-8 py-4 rounded-xl transition"
                        >
                            📧 Contact for White Label
                        </a>
                        <a 
                            href="https://www.lnlaiagency.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-xl transition"
                        >
                            Learn More About LNL AI
                        </a>
                    </div>
                    <p className="text-xs text-slate-500 mt-6">
                        For agencies and entrepreneurs serious about launching a directory business.
                    </p>
                </div>
            </div>
        </div>
    );
}
