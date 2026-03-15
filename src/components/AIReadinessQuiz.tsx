'use client';

import { useState } from 'react';
import { Bot, CheckCircle, ArrowRight, X, Phone, Calendar, TrendingUp } from 'lucide-react';

const questions = [
    {
        id: 'phone',
        question: 'How do you currently handle inbound phone calls?',
        options: [
            { value: 'answer_service', text: 'We have an answering service', score: 10 },
            { value: 'staff', text: 'Our staff answers when available', score: 20 },
            { value: 'voicemail', text: 'Calls go to voicemail', score: 30 },
            { value: 'missed', text: 'We miss a lot of calls', score: 40 },
        ]
    },
    {
        id: 'leads',
        question: 'What happens to leads that contact you after hours?',
        options: [
            { value: 'auto_respond', text: 'We have automated follow-up', score: 10 },
            { value: 'next_day', text: 'We call them the next business day', score: 20 },
            { value: 'sometimes', text: 'Sometimes we get back to them', score: 30 },
            { value: 'lost', text: 'They probably go to competitors', score: 40 },
        ]
    },
    {
        id: 'booking',
        question: 'How do customers currently book appointments?',
        options: [
            { value: 'online', text: 'Online booking on our website', score: 10 },
            { value: 'phone', text: 'They call us', score: 20 },
            { value: 'mixed', text: 'Mix of phone and online', score: 15 },
            { value: 'no_system', text: 'We don\'t have a system', score: 40 },
        ]
    },
    {
        id: 'website',
        question: 'When was your website last updated?',
        options: [
            { value: 'recent', text: 'Within the last year', score: 10 },
            { value: 'few_years', text: '2-3 years ago', score: 20 },
            { value: 'old', text: 'Over 3 years ago', score: 30 },
            { value: 'no_website', text: 'We don\'t have a website', score: 40 },
        ]
    },
    {
        id: 'ai_awareness',
        question: 'Are you using any AI tools in your business?',
        options: [
            { value: 'advanced', text: 'Yes, multiple AI tools', score: 10 },
            { value: 'basic', text: 'Just ChatGPT for basic tasks', score: 20 },
            { value: 'considering', text: 'We\'re looking into it', score: 30 },
            { value: 'no', text: 'No, not interested', score: 40 },
        ]
    },
];

interface QuizResult {
    score: number;
    maxScore: number;
    percentage: number;
    level: 'ready' | 'warm' | 'needs_work' | 'cold';
    recommendations: string[];
}

export default function AIReadinessQuiz() {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<Record<string, { value: string; score: number }>>({});
    const [showResults, setShowResults] = useState(false);
    const [result, setResult] = useState<QuizResult | null>(null);
    const [contactInfo, setContactInfo] = useState({ name: '', email: '', phone: '', business: '' });
    const [submitted, setSubmitted] = useState(false);

    const calculateResults = (): QuizResult => {
        const totalScore = Object.values(answers).reduce((sum, answer) => sum + answer.score, 0);
        const maxScore = questions.length * 40;
        const percentage = (totalScore / maxScore) * 100;

        let level: QuizResult['level'] = 'cold';
        if (percentage >= 75) level = 'ready';
        else if (percentage >= 50) level = 'warm';
        else if (percentage >= 25) level = 'needs_work';

        const recommendations: string[] = [];
        
        if (answers.phone?.score >= 30) {
            recommendations.push('📞 AI Voice Agent - Never miss another call');
        }
        if (answers.leads?.score >= 30) {
            recommendations.push('🤖 24/7 AI Lead Follow-up System');
        }
        if (answers.booking?.score >= 30) {
            recommendations.push('📅 AI Auto-Booking System');
        }
        if (answers.website?.score >= 30) {
            recommendations.push('🌐 Website Redesign with AI Integration');
        }
        if (answers.ai_awareness?.score >= 20) {
            recommendations.push('🧠 AiEO - Get found in AI search results');
        }

        return { score: totalScore, maxScore, percentage, level, recommendations };
    };

    const handleAnswer = (value: string, score: number) => {
        const questionId = questions[currentQuestion].id;
        setAnswers({ ...answers, [questionId]: { value, score } });
        
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            const results = calculateResults();
            setResult(results);
            setShowResults(true);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        
        // Submit to API
        try {
            await fetch('/api/ai-leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    listing_id: null, // Could be set if business is claimed
                    business_name: contactInfo.business,
                    contact_name: contactInfo.name,
                    email: contactInfo.email,
                    phone: contactInfo.phone,
                    quiz_score: result.score,
                    quiz_percentage: Math.round(result.percentage),
                    quiz_level: result.level,
                    answers: answers,
                    recommendations: result.recommendations
                })
            });
        } catch (err) {
            console.error('Failed to submit lead:', err);
        }
        
        // Also open calendar for demo booking
        setTimeout(() => {
            window.open('https://www.lnlaiagency.com/', '_blank');
        }, 1500);
    };

    if (showResults && result) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
                <div className="bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl max-w-2xl w-full my-8">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center">
                                <Bot size={24} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">AI Readiness Assessment</h2>
                                <p className="text-sm text-slate-400">Your results are ready</p>
                            </div>
                        </div>
                        <button onClick={() => setShowResults(false)} className="text-slate-400 hover:text-white p-2">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Results */}
                    <div className="p-6 space-y-6">
                        {/* Score */}
                        <div className="text-center p-6 bg-slate-800/50 rounded-xl">
                            <div className="text-5xl font-bold text-white mb-2">
                                {Math.round(result.percentage)}%
                            </div>
                            <p className="text-slate-400 text-sm mb-4">AI Automation Readiness</p>
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${
                                result.level === 'ready' ? 'bg-emerald-500/20 text-emerald-400' :
                                result.level === 'warm' ? 'bg-amber-500/20 text-amber-400' :
                                result.level === 'needs_work' ? 'bg-orange-500/20 text-orange-400' :
                                'bg-slate-700 text-slate-400'
                            }`}>
                                {result.level === 'ready' && '🚀 Perfect Candidate for AI'}
                                {result.level === 'warm' && '✅ Great Fit for AI Solutions'}
                                {result.level === 'needs_work' && '📈 Room for Improvement'}
                                {result.level === 'cold' && '💡 AI Could Transform Your Business'}
                            </div>
                        </div>

                        {/* Recommendations */}
                        <div>
                            <h3 className="text-lg font-bold text-white mb-4">Recommended Solutions:</h3>
                            <div className="space-y-3">
                                {result.recommendations.map((rec, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg">
                                        <CheckCircle size={18} className="text-primary-400 shrink-0" />
                                        <span className="text-slate-300 text-sm">{rec}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CTA */}
                        {!submitted ? (
                            <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-slate-700">
                                <h3 className="text-lg font-bold text-white">Get Your Custom AI Strategy</h3>
                                <p className="text-sm text-slate-400">
                                    Book a free 30-minute strategy call. We'll show you exactly how AI can automate your business.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        placeholder="Your Name"
                                        value={contactInfo.name}
                                        onChange={e => setContactInfo({...contactInfo, name: e.target.value})}
                                        required
                                        className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-primary-500"
                                    />
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        value={contactInfo.email}
                                        onChange={e => setContactInfo({...contactInfo, email: e.target.value})}
                                        required
                                        className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-primary-500"
                                    />
                                    <input
                                        type="tel"
                                        placeholder="Phone"
                                        value={contactInfo.phone}
                                        onChange={e => setContactInfo({...contactInfo, phone: e.target.value})}
                                        className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-primary-500"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Business Name"
                                        value={contactInfo.business}
                                        onChange={e => setContactInfo({...contactInfo, business: e.target.value})}
                                        className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-primary-500"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition"
                                >
                                    Book Free Strategy Call <ArrowRight size={18} />
                                </button>
                                <p className="text-xs text-slate-500 text-center">
                                    No pressure. Just a friendly chat about how AI can help your business.
                                </p>
                            </form>
                        ) : (
                            <div className="text-center p-6 bg-emerald-500/20 border border-emerald-500/30 rounded-xl">
                                <CheckCircle size={48} className="text-emerald-400 mx-auto mb-3" />
                                <h3 className="text-xl font-bold text-white mb-2">Thanks! We'll be in touch.</h3>
                                <p className="text-slate-300 text-sm">
                                    One of our AI specialists will contact you within 24 hours to discuss your custom strategy.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    const question = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl max-w-xl w-full">
                {/* Header */}
                <div className="p-6 border-b border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                                <Bot size={20} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">AI Readiness Quiz</h2>
                                <p className="text-xs text-slate-400">2 minutes to see if AI can help your business</p>
                            </div>
                        </div>
                        <button onClick={() => setShowResults(false)} className="text-slate-400 hover:text-white p-2">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                        <div className="bg-primary-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                </div>

                {/* Question */}
                <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-6">{question.question}</h3>
                    <div className="space-y-3">
                        {question.options.map((option, i) => (
                            <button
                                key={option.value}
                                onClick={() => handleAnswer(option.value, option.score)}
                                className="w-full p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-primary-500 rounded-xl text-left transition group"
                            >
                                <span className="text-slate-300 group-hover:text-white">{option.text}</span>
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-4 text-center">
                        Question {currentQuestion + 1} of {questions.length}
                    </p>
                </div>
            </div>
        </div>
    );
}
