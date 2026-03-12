import { sql } from '@/lib/db';
import { Listing } from '@/lib/types';
import { notFound } from 'next/navigation';
import { Star, MapPin, CheckCircle, ExternalLink, Calendar, MessageSquare, Tag } from 'lucide-react';
import Link from 'next/link';

export default async function BusinessDetail({
    params
}: {
    params: { slug: string } | Promise<{ slug: string }>
}) {
    const { slug } = await params;
    let listings: Listing[] = [];
    try {
        listings = (await sql`SELECT * FROM listings WHERE slug = ${slug} LIMIT 1`) as Listing[];
    } catch (err) {
        console.error(err);
        return <div>Database Error. Seed first.</div>;
    }

    if (!listings || listings.length === 0) {
        notFound();
    }

    const biz = listings[0];
    const flags = biz.feature_flags || {};
    const services = biz.services || [];

    return (
        <div className="bg-slate-50 dark:bg-slate-900 min-h-screen pb-20">
            {/* Header Banner */}
            <div className="h-[300px] w-full bg-slate-800 relative">
                <img
                    src={`https://images.unsplash.com/photo-${biz.id % 2 === 0 ? '1497366216548-37526070297c' : '1517248135467-4c7edcad34c4'}?auto=format&fit=crop&q=80&w=1200`}
                    alt={biz.name}
                    className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent"></div>
                <div className="absolute bottom-0 w-full">
                    <div className="container mx-auto px-4 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="text-white">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="bg-blue-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                    {biz.category}
                                </span>
                                {biz.featured && (
                                    <span className="bg-yellow-500 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                        <Star size={12} className="fill-current" /> Featured
                                    </span>
                                )}
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold mb-2">{biz.name}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
                                <span className="flex items-center"><MapPin size={16} className="mr-1" /> {biz.location_city}, {biz.location_state}</span>
                                <span className="flex items-center text-amber-400 bg-amber-400/10 px-2 py-1 rounded"><Star size={16} className="mr-1 fill-current" /> {biz.rating} Rating</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button className="bg-white text-slate-900 hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold flex items-center shadow-lg transition">
                                <ExternalLink size={18} className="mr-2" /> Visit Website
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 mt-8 flex flex-col lg:flex-row gap-8">
                {/* Main Content Area */}
                <div className="flex-1 space-y-8">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-gray-200 dark:border-slate-700 shadow-sm">
                        <h2 className="text-2xl font-bold mb-4">About the Business</h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                            {biz.description}
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-gray-200 dark:border-slate-700 shadow-sm">
                        <h2 className="text-2xl font-bold mb-4">Services Offered</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {services.map((srv: string, i: number) => (
                                <div key={i} className="flex items-start">
                                    <CheckCircle size={20} className="text-green-500 mr-2 shrink-0 mt-0.5" />
                                    <span className="text-gray-700 dark:text-gray-300">{srv}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="w-full lg:w-1/3 space-y-6">
                    {/* Claim / Lead Gen Widget */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border-t-4 border-blue-600 shadow-lg">
                        <h3 className="text-xl font-bold mb-4">Contact {biz.name}</h3>
                        <form className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Name</label>
                                <input type="text" className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700" placeholder="John Doe" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Phone</label>
                                <input type="tel" className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700" placeholder="(919) 555-0123" />
                            </div>
                            <button type="button" className="btn-primary w-full py-3 rounded-lg font-semibold shadow-md">
                                Request a Quote
                            </button>
                        </form>
                        <p className="text-xs text-center text-gray-500 mt-4">By submitting this form you agree to be contacted.</p>
                    </div>

                    {/* Premium Features Gates */}
                    {flags.booking_calendar && (
                        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
                            <h3 className="text-xl font-bold mb-2 flex items-center"><Calendar className="mr-2" /> Book Appointment</h3>
                            <p className="text-emerald-100 mb-4 text-sm">Schedule a time instantly. No waiting required.</p>
                            <button className="bg-white text-emerald-700 font-bold py-2 px-4 rounded-lg w-full hover:bg-emerald-50 transition">
                                View Availability
                            </button>
                        </div>
                    )}

                    {flags.ai_chat_widget && (
                        <div className="bg-slate-100 dark:bg-slate-700/50 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-600 relative overflow-hidden">
                            <div className="flex items-center mb-4">
                                <div className="bg-blue-600 rounded-full p-2 mr-3">
                                    <MessageSquare size={20} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold">AI Assistant</h3>
                                    <p className="text-xs text-blue-600 dark:text-blue-400">Online & Ready to Help</p>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-800 p-3 rounded-lg text-sm text-gray-700 dark:text-gray-300 border border-slate-200 dark:border-slate-600 mb-3 shadow-sm inline-block rounded-tl-none">
                                Hi! I'm the AI assistant for {biz.name}. How can I help you today?
                            </div>
                            <div className="flex gap-2 relative z-10">
                                <input type="text" className="w-full text-sm p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded" placeholder="Type your message..." />
                                <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 rounded flex items-center justify-center">
                                    &rarr;
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
