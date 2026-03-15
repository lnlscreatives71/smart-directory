'use client';

import { useState, useEffect } from 'react';
import { Bot, Phone, Calendar, TrendingUp, X, ArrowRight, CheckCircle, Zap, BarChart3 } from 'lucide-react';

export default function DashboardUpsellBanner() {
    const [show, setShow] = useState(false);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        // Check if user has dismissed this before
        const dismissed = localStorage.getItem('lnl_upsell_dismissed');
        if (!dismissed) {
            setShow(true);
        }
    }, []);

    const dismiss = () => {
        setShow(false);
        localStorage.setItem('lnl_upsell_dismissed', 'true');
    };

    if (!show) return null;

    return (
        <>
            {/* Banner */}
            <div className="fixed bottom-6 right-6 z-40 max-w-sm">
                <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl shadow-2xl border border-primary-400/30 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-primary-500/30">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                <Bot size={18} className="text-white" />
                            </div>
                            <span className="font-bold text-white text-sm">AI Upgrade Available</span>
                        </div>
                        <button onClick={dismiss} className="text-white/70 hover:text-white">
                            <X size={16} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-4 space-y-3">
                        <p className="text-white/90 text-sm leading-relaxed">
                            Love the AI features on your listing? Get the same <strong>24/7 AI Sales Force</strong> on your own website!
                        </p>
                        
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-white/80 text-xs">
                                <CheckCircle size={14} className="text-white/60" />
                                <span>AI Chat that books appointments</span>
                            </div>
                            <div className="flex items-center gap-2 text-white/80 text-xs">
                                <CheckCircle size={14} className="text-white/60" />
                                <span>AI Voice that answers calls 24/7</span>
                            </div>
                            <div className="flex items-center gap-2 text-white/80 text-xs">
                                <CheckCircle size={14} className="text-white/60" />
                                <span>Get found in AI search (AiEO)</span>
                            </div>
                        </div>

                        <button 
                            onClick={() => setShowModal(true)}
                            className="w-full bg-white text-primary-700 font-bold py-2.5 rounded-xl text-sm hover:bg-white/90 transition flex items-center justify-center gap-2"
                        >
                            See AI Demo <ArrowRight size={16} />
                        </button>

                        <p className="text-xs text-white/60 text-center">
                            Free 30-min strategy call • No pressure
                        </p>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-700 sticky top-0 bg-slate-900 z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center">
                                    <Bot size={24} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">24/7 AI Sales Force</h2>
                                    <p className="text-sm text-slate-400">Same AI powering this directory, on YOUR website</p>
                                </div>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white p-2">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Hero Stats */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                                    <div className="text-3xl font-bold text-primary-400 mb-1">$8M+</div>
                                    <div className="text-xs text-slate-400">Client Revenue Generated</div>
                                </div>
                                <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                                    <div className="text-3xl font-bold text-primary-400 mb-1">94%</div>
                                    <div className="text-xs text-slate-400">Client Retention Rate</div>
                                </div>
                                <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                                    <div className="text-3xl font-bold text-primary-400 mb-1">24/7</div>
                                    <div className="text-xs text-slate-400">AI Availability</div>
                                </div>
                            </div>

                            {/* Services */}
                            <div>
                                <h3 className="text-lg font-bold text-white mb-4">What You Get:</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 bg-primary-600/20 rounded-lg flex items-center justify-center">
                                                <Bot size={20} className="text-primary-400" />
                                            </div>
                                            <h4 className="font-bold text-white">AI Chat Agent</h4>
                                        </div>
                                        <ul className="space-y-2 text-sm text-slate-400">
                                            <li>• Answers questions 24/7</li>
                                            <li>• Qualifies leads automatically</li>
                                            <li>• Books appointments to calendar</li>
                                            <li>• Integrates with your CRM</li>
                                        </ul>
                                    </div>

                                    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 bg-primary-600/20 rounded-lg flex items-center justify-center">
                                                <Phone size={20} className="text-primary-400" />
                                            </div>
                                            <h4 className="font-bold text-white">AI Voice Agent</h4>
                                        </div>
                                        <ul className="space-y-2 text-sm text-slate-400">
                                            <li>• Answers calls instantly</li>
                                            <li>• Handles multiple calls at once</li>
                                            <li>• Takes messages & books appts</li>
                                            <li>• Sounds completely natural</li>
                                        </ul>
                                    </div>

                                    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 bg-primary-600/20 rounded-lg flex items-center justify-center">
                                                <Calendar size={20} className="text-primary-400" />
                                            </div>
                                            <h4 className="font-bold text-white">Auto Booking</h4>
                                        </div>
                                        <ul className="space-y-2 text-sm text-slate-400">
                                            <li>• Customers book 24/7</li>
                                            <li>• Syncs with your calendar</li>
                                            <li>• Sends reminders automatically</li>
                                            <li>• Reduces no-shows by 60%</li>
                                        </ul>
                                    </div>

                                    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 bg-primary-600/20 rounded-lg flex items-center justify-center">
                                                <TrendingUp size={20} className="text-primary-400" />
                                            </div>
                                            <h4 className="font-bold text-white">AiEO</h4>
                                        </div>
                                        <ul className="space-y-2 text-sm text-slate-400">
                                            <li>• Get found in ChatGPT</li>
                                            <li>• Appear in Google AI Overviews</li>
                                            <li>• Rank in Perplexity</li>
                                            <li>• AI-powered SEO</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Case Study */}
                            <div className="bg-gradient-to-r from-primary-600/20 to-primary-500/20 border border-primary-500/30 rounded-xl p-5">
                                <div className="flex items-start gap-3 mb-3">
                                    <BarChart3 size={24} className="text-primary-400 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-bold text-white">Real Results: Med Spa Client</h4>
                                        <p className="text-sm text-slate-400 mt-1">
                                            "LNL's AI books 15-20 appointments per week for us. It pays for itself 10x over. 
                                            Our staff no longer wastes time on tire-kickers."
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4 mt-4">
                                    <div>
                                        <div className="text-2xl font-bold text-primary-400">+340%</div>
                                        <div className="text-xs text-slate-400">More Leads</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-primary-400">62%</div>
                                        <div className="text-xs text-slate-400">Fewer No-Shows</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-primary-400">28hrs/mo</div>
                                        <div className="text-xs text-slate-400">Staff Time Saved</div>
                                    </div>
                                </div>
                            </div>

                            {/* CTA */}
                            <div className="flex flex-col gap-3 pt-4 border-t border-slate-700">
                                <a 
                                    href="https://www.lnlaiagency.com/" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition"
                                >
                                    <Zap size={18} />
                                    Book Free AI Strategy Call
                                </a>
                                <p className="text-xs text-slate-500 text-center">
                                    30 minutes • No pressure • See exactly how AI can automate your business
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
