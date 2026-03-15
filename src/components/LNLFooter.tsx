import Link from 'next/link';
import { useState } from 'react';
import { Bot, Phone, Calendar, TrendingUp, MessageSquare } from 'lucide-react';
import AIReadinessQuiz from './AIReadinessQuiz';

export default function LNLFooter() {
    const [showQuiz, setShowQuiz] = useState(false);

    return (
        <>
            {showQuiz && <AIReadinessQuiz />}
            
            <div className="border-t border-slate-800 bg-slate-900/50 py-8 mt-16">
            <div className="max-w-7xl mx-auto px-4">
                {/* Main CTA Banner */}
                <div className="bg-gradient-to-r from-primary-600/20 to-primary-500/20 border border-primary-500/30 rounded-2xl p-6 mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 bg-primary-600 rounded-xl flex items-center justify-center shrink-0">
                                <Bot size={28} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">
                                    Want This AI Power on YOUR Website?
                                </h3>
                                <p className="text-slate-300 text-sm leading-relaxed">
                                    This directory runs on LNL AI's 24/7 AI Sales Force. Get the same AI chat, voice agents, 
                                    and automated booking system for your business.
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 shrink-0">
                            <a 
                                href="https://www.lnlaiagency.com/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 text-white font-bold px-6 py-3 rounded-xl transition"
                            >
                                <Bot size={18} />
                                Book AI Demo
                            </a>
                            <Link 
                                href="/pricing"
                                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl transition text-center"
                            >
                                See Premium Features
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Feature Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <a href="https://www.lnlaiagency.com/" target="_blank" rel="noopener noreferrer" className="group p-4 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-primary-500/50 transition">
                        <div className="flex items-center gap-3 mb-2">
                            <Bot size={20} className="text-primary-400 group-hover:text-primary-300" />
                            <h4 className="font-bold text-white text-sm">AI Chat Agents</h4>
                        </div>
                        <p className="text-xs text-slate-400">24/7 lead qualification & booking on your website</p>
                    </a>
                    <a href="https://www.lnlaiagency.com/" target="_blank" rel="noopener noreferrer" className="group p-4 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-primary-500/50 transition">
                        <div className="flex items-center gap-3 mb-2">
                            <Phone size={20} className="text-primary-400 group-hover:text-primary-300" />
                            <h4 className="font-bold text-white text-sm">AI Voice Agents</h4>
                        </div>
                        <p className="text-xs text-slate-400">Never miss a call. AI answers & books appointments.</p>
                    </a>
                    <a href="https://www.lnlaiagency.com/" target="_blank" rel="noopener noreferrer" className="group p-4 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-primary-500/50 transition">
                        <div className="flex items-center gap-3 mb-2">
                            <Calendar size={20} className="text-primary-400 group-hover:text-primary-300" />
                            <h4 className="font-bold text-white text-sm">Auto Booking</h4>
                        </div>
                        <p className="text-xs text-slate-400">AI schedules appointments directly to your calendar</p>
                    </a>
                    <a href="https://www.lnlaiagency.com/" target="_blank" rel="noopener noreferrer" className="group p-4 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-primary-500/50 transition">
                        <div className="flex items-center gap-3 mb-2">
                            <TrendingUp size={20} className="text-primary-400 group-hover:text-primary-300" />
                            <h4 className="font-bold text-white text-sm">AiEO</h4>
                        </div>
                        <p className="text-xs text-slate-400">Get found in ChatGPT, Google AI, Perplexity</p>
                    </a>
                </div>

                {/* Footer Credits */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-slate-400 text-sm">Powered by</span>
                            <a href="https://www.lnlaiagency.com/" target="_blank" rel="noopener noreferrer" className="font-bold text-white hover:text-primary-400 transition">
                                LNL AI Agency
                            </a>
                        </div>
                        <span className="text-slate-600">•</span>
                        <button 
                            onClick={() => setShowQuiz(true)}
                            className="text-primary-400 hover:text-primary-300 text-sm font-semibold transition flex items-center gap-1"
                        >
                            <MessageSquare size={14} />
                            AI Readiness Quiz
                        </button>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-slate-400">
                        <a href="https://www.lnlaiagency.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                            AI Automation
                        </a>
                        <a href="https://www.lnlaiagency.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                            AiEO
                        </a>
                        <a href="https://www.lnlaiagency.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                            Web Design
                        </a>
                        <a href="https://www.lnlaiagency.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                            Book Strategy Call
                        </a>
                    </div>
                </div>

                {/* Social Proof */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-slate-500">
                        Trusted by businesses generating <strong className="text-slate-400">$8M+ in verified revenue</strong> • 
                        <strong className="text-slate-400"> 94% client retention</strong>
                    </p>
                </div>
            </div>
        </div>
    );
}
