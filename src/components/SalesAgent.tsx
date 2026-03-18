'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Bot, X, Send, TrendingUp, Calendar, DollarSign, MessageSquare, Zap, ChevronRight, Phone } from 'lucide-react';

interface Message {
    role: 'bot' | 'user';
    content: string;
    type?: 'text' | 'question' | 'pitch' | 'cta';
    options?: Array<{ label: string; value: string; nextStep: string }>;
}

interface LeadData {
    name: string;
    business: string;
    email: string;
    phone: string;
    painPoint: string;
    budget: string;
    timeline: string;
    interest: string;
}

export default function SalesAgent() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState('greeting');
    const [leadData, setLeadData] = useState<Partial<LeadData>>({});
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Proactive greeting after 5 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!isOpen && messages.length === 0) {
                // Show proactive message
                const proactiveMsg: Message = {
                    role: 'bot',
                    type: 'pitch',
                    content: "👋 Hi! I noticed you're building a directory. Want to see how AI can 10x your bookings?",
                    options: [
                        { label: 'Yes, show me!', value: 'interested', nextStep: 'qualify' },
                        { label: 'Maybe later', value: 'later', nextStep: 'nurture' },
                    ]
                };
                // Could show this as a toast before opening chat
            }
        }, 5000);
        return () => clearTimeout(timer);
    }, [isOpen, messages]);

    const handleOptionClick = (option: { value: string; nextStep: string }) => {
        addMessage({ role: 'user', content: option.value });
        processStep(option.nextStep, option.value);
    };

    const addMessage = (msg: Message) => {
        setMessages(prev => [...prev, msg]);
    };

    const processStep = async (currentStep: string, userValue?: string) => {
        setLoading(true);
        setStep(currentStep);

        // Simulate AI thinking
        await new Promise(resolve => setTimeout(resolve, 800));

        switch (currentStep) {
            case 'greeting':
                addMessage({
                    role: 'bot',
                    type: 'pitch',
                    content: "🚀 I'm your AI Sales Assistant! I help business owners like you automate their sales and customer service.\n\n**Quick question:** What's the #1 challenge in your business right now?",
                    options: [
                        { label: '📞 Missing phone calls', value: 'missed_calls', nextStep: 'pain_missed_calls' },
                        { label: '⏰ Too much admin work', value: 'admin_work', nextStep: 'pain_admin' },
                        { label: '💰 Not enough leads', value: 'leads', nextStep: 'pain_leads' },
                        { label: '😓 Burned out on repetitive tasks', value: 'burnout', nextStep: 'pain_burnout' },
                    ]
                });
                break;

            case 'qualify':
                addMessage({
                    role: 'bot',
                    type: 'question',
                    content: "Awesome! Let me understand your business better. **What's your business name?**",
                });
                break;

            case 'pain_missed_calls':
                addMessage({
                    role: 'bot',
                    type: 'pitch',
                    content: "📞 **Missed calls cost businesses 62% of potential revenue.**\n\nOur AI Voice Agent answers EVERY call 24/7, books appointments, and qualifies leads automatically.\n\n**How many calls do you estimate you miss per week?**",
                    options: [
                        { label: '0-5 calls', value: 'low', nextStep: 'budget' },
                        { label: '5-15 calls', value: 'medium', nextStep: 'budget' },
                        { label: '15+ calls', value: 'high', nextStep: 'urgency' },
                    ]
                });
                break;

            case 'pain_admin':
                addMessage({
                    role: 'bot',
                    type: 'pitch',
                    content: "⏰ **Business owners spend 28hrs/month on admin tasks.**\n\nOur AI Automation handles:\n• Appointment booking\n• Lead follow-up\n• Customer FAQs\n• CRM updates\n\n**What if you could get those 28 hours back?**",
                    options: [
                        { label: 'That would be amazing!', value: 'yes', nextStep: 'budget' },
                        { label: 'Sounds too good to be true', value: 'skeptical', nextStep: 'social_proof' },
                    ]
                });
                break;

            case 'pain_leads':
                addMessage({
                    role: 'bot',
                    type: 'pitch',
                    content: "💰 **AI-powered lead gen increases conversions by 340%.**\n\nOur system:\n• Captures leads 24/7\n• Qualifies them instantly\n• Books them on your calendar\n• Follows up automatically\n\n**What's your current monthly lead volume?**",
                    options: [
                        { label: '0-20 leads', value: 'low', nextStep: 'budget' },
                        { label: '20-50 leads', value: 'medium', nextStep: 'budget' },
                        { label: '50+ leads', value: 'high', nextStep: 'scale' },
                    ]
                });
                break;

            case 'pain_burnout':
                addMessage({
                    role: 'bot',
                    type: 'pitch',
                    content: "😓 **You didn't start a business to be stuck answering the same questions all day.**\n\nOur AI handles 80% of repetitive tasks so you can focus on growth.\n\n**What tasks drain you the most?**",
                    options: [
                        { label: 'Answering calls', value: 'calls', nextStep: 'budget' },
                        { label: 'Replying to emails', value: 'emails', nextStep: 'budget' },
                        { label: 'Scheduling appointments', value: 'scheduling', nextStep: 'budget' },
                        { label: 'All of the above', value: 'all', nextStep: 'budget' },
                    ]
                });
                break;

            case 'urgency':
                addMessage({
                    role: 'bot',
                    type: 'pitch',
                    content: "🔥 **That's a lot of lost revenue!**\n\nEvery missed call is a potential customer going to your competitor.\n\n**When do you want to fix this?**",
                    options: [
                        { label: 'ASAP - losing money daily', value: 'urgent', nextStep: 'budget' },
                        { label: 'This month', value: 'soon', nextStep: 'budget' },
                        { label: 'Just exploring', value: 'later', nextStep: 'nurture' },
                    ]
                });
                break;

            case 'social_proof':
                addMessage({
                    role: 'bot',
                    type: 'pitch',
                    content: "**I get it. Here's what our clients say:**\\n\\n- \\\"AI books 15-20 appointments/week for us. Pays for itself 10x.\\\" - Med Spa Owner\\n\\n- \\\"+340% more leads, 62% fewer no-shows\\\" - HVAC Company\\n\\n**Ready to see results like this?**",
                    options: [
                        { label: 'Yes, let\'s do it!', value: 'yes', nextStep: 'budget' },
                        { label: 'I need to think about it', value: 'thinking', nextStep: 'nurture' },
                    ]
                });
                break;

            case 'scale':
                addMessage({
                    role: 'bot',
                    type: 'pitch',
                    content: "🚀 **Great problem to have!**\n\nAt your volume, our AI can save you 40+ hours/month while doubling your conversion rate.\n\n**What's your monthly revenue range?**",
                    options: [
                        { label: '$10K-50K', value: 'small', nextStep: 'budget' },
                        { label: '$50K-200K', value: 'medium', nextStep: 'budget' },
                        { label: '$200K+', value: 'large', nextStep: 'enterprise' },
                    ]
                });
                break;

            case 'enterprise':
                addMessage({
                    role: 'bot',
                    type: 'pitch',
                    content: "💎 **Enterprise clients get our white-glove service:**\n\n• Custom AI training\n• Dedicated success manager\n• Priority support\n• Custom integrations\n\n**Can I connect you with our enterprise team?**",
                    options: [
                        { label: 'Yes, book a call', value: 'yes', nextStep: 'booking' },
                        { label: 'Send me info first', value: 'info', nextStep: 'capture' },
                    ]
                });
                break;

            case 'budget':
                addMessage({
                    role: 'bot',
                    type: 'question',
                    content: "Perfect! **What's your monthly budget for automation?**",
                    options: [
                        { label: '$500-1K', value: 'low', nextStep: 'timeline' },
                        { label: '$1K-3K', value: 'medium', nextStep: 'timeline' },
                        { label: '$3K-5K', value: 'high', nextStep: 'timeline' },
                        { label: '$5K+ (enterprise)', value: 'enterprise', nextStep: 'enterprise' },
                    ]
                });
                break;

            case 'timeline':
                addMessage({
                    role: 'bot',
                    type: 'question',
                    content: "📅 **When do you want to get started?**",
                    options: [
                        { label: 'This week', value: 'urgent', nextStep: 'capture' },
                        { label: 'This month', value: 'soon', nextStep: 'capture' },
                        { label: 'Next quarter', value: 'later', nextStep: 'nurture' },
                    ]
                });
                break;

            case 'capture':
                addMessage({
                    role: 'bot',
                    type: 'cta',
                    content: "🎯 **Perfect! Let's get you set up.**\n\nI'll have our AI specialist reach out with a custom demo. **What's your email?**",
                });
                break;

            case 'booking':
                addMessage({
                    role: 'bot',
                    type: 'cta',
                    content: "🎉 **Excellent choice!**\n\nBook a free 30-min strategy call and we'll show you exactly how AI can transform your business.\n\n**Ready to see your custom ROI?**",
                    options: [
                        { 
                            label: '📅 Book Strategy Call (Free)', 
                            value: 'book', 
                            nextStep: 'book_demo' 
                        },
                        { 
                            label: '📞 Call: (350) 777-2961',
                            value: 'call',
                            nextStep: 'phone'
                        },
                    ]
                });
                break;

            case 'book_demo':
                addMessage({
                    role: 'bot',
                    type: 'text',
                    content: "🚀 Opening our calendar...\n\n*(Redirecting to booking page)*",
                });
                // Open booking page
                setTimeout(() => {
                    window.open('https://www.lnlaiagency.com/', '_blank');
                }, 1500);
                break;

            case 'nurture':
                addMessage({
                    role: 'bot',
                    type: 'text',
                    content: "No pressure at all! 🙌\n\nCan I at least send you our **free AI Readiness Guide**? It shows you exactly where AI can save you time and money.\n\n**Where should I send it?**",
                });
                break;

            case 'phone':
                window.open('tel:+13507772961');
                break;

            default:
                addMessage({
                    role: 'bot',
                    type: 'text',
                    content: "Thanks for chatting! Want to book a free demo to see AI in action?",
                    options: [
                        { label: '📅 Book Free Demo', value: 'demo', nextStep: 'booking' },
                        { label: '📞 Call Us', value: 'call', nextStep: 'phone' },
                    ]
                });
        }

        setLoading(false);
    };

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim()) return;

        addMessage({ role: 'user', content: input });
        const userInput = input;
        setInput('');
        setLoading(true);

        // Handle email capture
        if (step === 'capture' && userInput.includes('@')) {
            setLeadData({ ...leadData, email: userInput });
            
            // Save lead to CRM
            try {
                await fetch('/api/ai-leads', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...leadData,
                        email: userInput,
                        source: 'sales_agent',
                        quiz_score: 80,
                        quiz_level: 'hot'
                    })
                });
            } catch (err) {
                console.error('Failed to save lead:', err);
            }

            addMessage({
                role: 'bot',
                type: 'text',
                content: `✅ Got it! We'll reach out to **${userInput}** within 24 hours.\n\nIn the meantime, want to see some case studies?`,
                options: [
                    { label: '📊 See Case Studies', value: 'cases', nextStep: 'case_studies' },
                    { label: '📅 Book Demo Now', value: 'demo', nextStep: 'booking' },
                ]
            });
            setLoading(false);
            return;
        }

        // Capture business name
        if (step === 'qualify') {
            setLeadData({ ...leadData, business: userInput });
        }

        // Generic AI response for free-form input
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        addMessage({
            role: 'bot',
            type: 'text',
            content: "Got it! 🎯\n\n**Here's how our AI can help with that:**\n\n• 24/7 availability\n• Instant responses\n• Automatic booking\n• Lead qualification\n• CRM integration\n\n**Want to see a quick demo?**",
            options: [
                { label: '📅 Book Free Demo', value: 'demo', nextStep: 'booking' },
                { label: '💬 Ask a question', value: 'question', nextStep: 'greeting' },
            ]
        });
        
        setLoading(false);
    };

    const openChat = () => {
        setIsOpen(true);
        if (messages.length === 0) {
            processStep('greeting');
        }
    };

    const hiddenRoutes = ['/dashboard', '/smb', '/login', '/biz/claim'];
    if (!pathname || hiddenRoutes.some(r => pathname.startsWith(r))) return null;

    return (
        <>
            {/* Floating Button */}
            {!isOpen && (
                <button
                    onClick={openChat}
                    className="fixed bottom-6 right-6 z-50 p-5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-full shadow-2xl hover:scale-105 hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all flex items-center gap-2 group animate-pulse"
                >
                    <TrendingUp size={24} className="group-hover:animate-bounce" />
                    <span className="font-bold pr-2 hidden sm:block">Grow My Business</span>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-48px)] h-[600px] max-h-[calc(100vh-48px)] bg-slate-900 border border-emerald-700/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-4 flex items-center justify-between shadow-md shrink-0">
                        <div className="flex items-center gap-3 text-white">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                <Bot size={22} />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm leading-tight">AI Sales Assistant</h3>
                                <p className="text-[11px] text-emerald-100 opacity-90">See how AI can 10x your revenue</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20 p-1.5 rounded-lg transition">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/50">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'bot' && (
                                    <div className="w-8 h-8 rounded-full bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center mr-2 shrink-0">
                                        <Bot size={16} className="text-emerald-400" />
                                    </div>
                                )}
                                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                                    msg.role === 'user'
                                        ? 'bg-emerald-600 text-white rounded-br-sm'
                                        : msg.type === 'pitch'
                                        ? 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-sm'
                                        : msg.type === 'cta'
                                        ? 'bg-gradient-to-r from-emerald-600/20 to-emerald-500/20 border border-emerald-500/30 text-white rounded-tl-sm'
                                        : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-sm'
                                }`}>
                                    <div className="whitespace-pre-wrap">{msg.content}</div>
                                    
                                    {/* Options */}
                                    {msg.options && (
                                        <div className="mt-3 space-y-2">
                                            {msg.options.map((opt, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => handleOptionClick(opt)}
                                                    disabled={loading}
                                                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition flex items-center justify-between group disabled:opacity-50"
                                                >
                                                    <span>{opt.label}</span>
                                                    <ChevronRight size={16} className="group-hover:translate-x-1 transition" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="w-8 h-8 rounded-full bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center mr-2">
                                    <Bot size={16} className="text-emerald-400" />
                                </div>
                                <div className="bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 flex gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-slate-800 shrink-0">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || loading}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white p-3 rounded-xl disabled:opacity-50 transition"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
}
