"use client";

import { useState } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';

interface ChatMessage {
    role: 'ai' | 'user';
    content: string;
}

export default function AIChatWidget({ businessName, context }: { businessName: string, context?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'ai', content: `Hi there! I am the AI assistant for ${businessName}. How can I help you today?` }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setLoading(true);

        try {
            // Note: In production you would hit a real Next.js API route that hooks into OpenAI
            // passing both the messages array and the business "context" document.
            // For now, we simulate an intelligent response.
            setTimeout(() => {
                setMessages(prev => [...prev, { 
                    role: 'ai', 
                    content: `Thanks for asking! As an AI assistant for ${businessName}, I am currently in demo mode. However, in a live environment, I would scan the business directory profile and answer your question about "${userMsg}" using OpenAI.` 
                }]);
                setLoading(false);
            }, 1000);
        } catch (e) {
            setLoading(false);
        }
    };

    return (
        <>
            {/* The Floating Button */}
            {!isOpen && (
                <button 
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-full shadow-2xl hover:scale-105 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all flex items-center gap-2 group"
                >
                    <MessageCircle size={24} className="group-hover:animate-pulse" />
                    <span className="font-bold pr-2 hidden sm:block">Ask AI</span>
                </button>
            )}

            {/* The Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 z-50 w-[350px] max-w-[calc(100vw-48px)] h-[500px] max-h-[calc(100vh-48px)] bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary-600 to-primary-500 p-4 flex items-center justify-between shadow-md z-10 shrink-0">
                        <div className="flex items-center gap-2 text-white">
                            <Bot size={22} className="opacity-90" />
                            <div>
                                <h3 className="font-bold text-sm leading-tight">{businessName} AI</h3>
                                <p className="text-[11px] text-primary-100 opacity-80 leading-tight">Always online</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/50">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-secondary-500 text-white' : 'bg-primary-600/30 text-primary-400 border border-primary-500/50'}`}>
                                        {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                                    </div>
                                    <div className={`px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed shadow-sm ${
                                        msg.role === 'user' 
                                            ? 'bg-secondary-600 text-white rounded-tr-sm' 
                                            : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-sm'
                                    }`}>
                                        {msg.content}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex w-full justify-start">
                                <div className="flex gap-2 max-w-[85%]">
                                     <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-primary-600/30 text-primary-400 border border-primary-500/50">
                                        <Bot size={14} />
                                    </div>
                                    <div className="px-4 py-3 rounded-2xl bg-slate-800 border border-slate-700 rounded-tl-sm flex gap-1.5">
                                        <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                                        <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                                        <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-slate-800 shrink-0 relative">
                        <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your message..." 
                            className="w-full bg-slate-950 border border-slate-700 focus:border-primary-500 rounded-xl px-4 py-3 pr-12 text-[14px] text-white outline-none transition-colors placeholder:text-slate-500"
                        />
                        <button 
                            type="submit" 
                            disabled={!input.trim() || loading}
                            className="absolute right-5 top-1/2 -translate-y-1/2 bg-primary-600 hover:bg-primary-500 text-white p-1.5 rounded-lg disabled:opacity-50 transition-colors"
                        >
                            <Send size={16} className="-ml-0.5 mt-0.5" />
                        </button>
                    </form>
                </div>
            )}
        </>
    );
}
