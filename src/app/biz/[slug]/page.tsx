import { sql } from '@/lib/db';
import { Listing, Event, Blog, News, Job } from '@/lib/types';
import { notFound } from 'next/navigation';
import { Star, MapPin, CheckCircle, ExternalLink, Calendar, MessageSquare, Briefcase, FileText } from 'lucide-react';
import Link from 'next/link';
import BookingWidget from '@/components/BookingWidget';
import AIChatWidget from '@/components/AIChatWidget';
import ReviewsSection from '@/components/ReviewsSection';

export default async function BusinessDetail({
    params
}: {
    params: { slug: string } | Promise<{ slug: string }>
}) {
    const { slug } = await params;
    let listings: Listing[] = [];
    let events: Event[] = [];
    let blogs: Blog[] = [];
    let news: News[] = [];
    let jobs: Job[] = [];
    
    try {
        listings = (await sql`SELECT * FROM listings WHERE slug = ${slug} LIMIT 1`) as Listing[];
        if (listings.length > 0) {
            const bizId = listings[0].id;
            events = (await sql`SELECT * FROM events WHERE listing_id = ${bizId} ORDER BY date DESC LIMIT 4`) as Event[];
            blogs = (await sql`SELECT * FROM blogs WHERE listing_id = ${bizId} AND published = true ORDER BY created_at DESC LIMIT 3`) as Blog[];
            news = (await sql`SELECT * FROM news WHERE listing_id = ${bizId} ORDER BY created_at DESC LIMIT 3`) as News[];
            jobs = (await sql`SELECT * FROM jobs WHERE listing_id = ${bizId} AND active = true ORDER BY created_at DESC LIMIT 3`) as Job[];
        }
    } catch (err) {
        console.error(err);
        return <div>Database Error. Seed first.</div>;
    }

    if (!listings || listings.length === 0) {
        notFound();
    }

    const biz = listings[0];
    const flags = biz.feature_flags || {};
    let services = [];
    try {
        if (Array.isArray(biz.services)) {
            services = biz.services;
        } else if (typeof biz.services === 'string') {
            const parsed = JSON.parse(biz.services);
            services = Array.isArray(parsed) ? parsed : [];
        }
    } catch {
        services = [];
    }

    return (
        <div className="min-h-screen pb-20 text-white">
            {/* Header Banner */}
            <div className="h-[300px] w-full bg-slate-800 relative">
                <img
                    src={biz.image_url || `https://images.unsplash.com/photo-${biz.id % 2 === 0 ? '1497366216548-37526070297c' : '1517248135467-4c7edcad34c4'}?auto=format&fit=crop&q=80&w=1200`}
                    alt={biz.name}
                    className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent"></div>
                <div className="absolute bottom-0 w-full">
                    <div className="container mx-auto px-4 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="text-white">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="bg-primary-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
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
                    <div className="glass rounded-2xl p-8 shadow-sm">
                        <h2 className="text-2xl font-bold mb-4 text-white">About the Business</h2>
                        <p className="text-slate-300 leading-relaxed text-lg mb-8">
                            {biz.description}
                        </p>
                        
                        <h2 className="text-2xl font-bold mb-4 text-white">Location & Directions</h2>
                        <div className="w-full h-80 rounded-xl overflow-hidden shadow-sm relative border border-white/10 bg-slate-900/50 flex items-center justify-center">
                            {process.env.NEXT_PUBLIC_MAPS_API_KEY ? (
                                <iframe
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    loading="lazy"
                                    allowFullScreen
                                    src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_MAPS_API_KEY}&q=${encodeURIComponent(biz.name + ' ' + biz.location_city + ', ' + biz.location_state)}`}>
                                </iframe>
                            ) : (
                                <div className="text-center p-8 space-y-3">
                                    <MapPin className="mx-auto w-10 h-10 text-slate-300 dark:text-slate-600" />
                                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Map View Available</p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm">
                                        (Add NEXT_PUBLIC_MAPS_API_KEY to .env.local to activate the interactive Google Map targeting {biz.location_city}, {biz.location_state}.)
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="glass rounded-2xl p-8 shadow-sm">
                        <h2 className="text-2xl font-bold mb-4 text-white">Services Offered</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {services.length === 0 ? (
                                <p className="text-gray-500">No services listed yet.</p>
                            ) : services.map((srv: string, i: number) => (
                                <div key={i} className="flex items-start">
                                    <CheckCircle size={20} className="text-green-500 mr-2 shrink-0 mt-0.5" />
                                    <span className="text-gray-700 dark:text-gray-300">{srv}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Customer Reviews */}
                    <ReviewsSection listingId={biz.id} listingName={biz.name} />

                    {/* Blogs & News Feed Section */}
                    {(blogs.length > 0 || news.length > 0) && (
                        <div className="glass rounded-2xl p-8 shadow-sm mt-8">
                            <h2 className="text-2xl font-bold mb-6 text-white">Latest Updates & News</h2>
                            <div className="grid gap-6">
                                {news.map(item => (
                                    <div key={`news-${item.id}`} className="border-l-4 border-primary-500 bg-primary-500/10 p-5 rounded-r-xl shadow-sm">
                                        <div className="flex items-center gap-2 mb-2">
                                            <FileText size={16} className="text-primary-400" />
                                            <span className="text-sm font-bold text-primary-400 tracking-wide uppercase">News</span>
                                            <span className="text-xs text-slate-500 ml-auto">{new Date(item.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                                        <p className="text-slate-300">{item.content}</p>
                                    </div>
                                ))}

                                {blogs.map(blog => (
                                    <div key={`blog-${blog.id}`} className="border border-white/10 rounded-xl overflow-hidden shadow-sm hover:border-white/20 transition bg-white/5">
                                        <div className="p-5">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Star size={16} className="text-secondary-400" />
                                                <span className="text-sm font-bold text-secondary-400 tracking-wide uppercase">Blog</span>
                                            </div>
                                            <h3 className="text-xl font-bold text-white mb-2">{blog.title}</h3>
                                            <p className="text-sm text-slate-500 mb-4">{new Date(blog.created_at).toLocaleDateString()}</p>
                                            <p className="text-slate-300 mb-4">{blog.excerpt || blog.content.substring(0, 150) + '...'}</p>
                                            <a href={`/blogs?id=${blog.id}`} className="text-primary-600 font-bold hover:underline inline-block">Read Full Post &rarr;</a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Job Postings */}
                    {jobs.length > 0 && (
                        <div className="glass rounded-2xl p-8 shadow-sm mt-8">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white"><Briefcase className="text-primary-400" /> Current Openings</h2>
                            <div className="grid gap-4">
                                {jobs.map(job => (
                                    <div key={job.id} className="border border-white/10 rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/5">
                                        <div>
                                            <h3 className="text-lg font-bold text-white mb-1">{job.title}</h3>
                                            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                                                <span className="font-semibold text-slate-300">{job.employment_type}</span>
                                                {job.location && <span>• {job.location}</span>}
                                                {job.salary_range && <span className="text-secondary-600 font-medium">• {job.salary_range}</span>}
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">{job.description}</p>
                                        </div>
                                        <button className="shrink-0 bg-primary-50 text-primary-700 font-bold px-6 py-2.5 rounded-lg hover:bg-primary-100 transition" onClick={() => window.location.href = job.application_url || `/jobs?apply=${job.id}`}>
                                            Apply Now &rarr;
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="w-full lg:w-1/3 space-y-6">
                    {/* Claim / Lead Gen Widget */}
                    <div className="glass rounded-2xl p-6 border-t-4 border-primary-500 shadow-lg">
                        <h3 className="text-xl font-bold mb-4 text-white">Contact {biz.name}</h3>
                        <form className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-slate-300">Name</label>
                                <input type="text" className="w-full p-2.5 rounded-lg glass-input" placeholder="John Doe" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-slate-300">Phone</label>
                                <input type="tel" className="w-full p-2.5 rounded-lg glass-input" placeholder="(919) 555-0123" />
                            </div>
                            <button type="button" className="btn-primary w-full py-3 rounded-lg font-semibold shadow-md">
                                Request a Quote
                            </button>
                        </form>
                        <p className="text-xs text-center text-slate-500 mt-4">By submitting this form you agree to be contacted.</p>
                    </div>

                    {/* Premium Features Gates */}
                    {flags.booking_calendar && (
                        <BookingWidget listingId={biz.id} />
                    )}

                    {flags.ai_chat_widget && (
                        <div className="glass rounded-2xl p-6 shadow-sm border border-primary-500/30 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl"></div>
                            <div className="flex items-center mb-4 relative z-10">
                                <div className="bg-primary-600 rounded-full p-2 mr-3 shadow-lg shadow-primary-500/30">
                                    <MessageSquare size={20} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">AI Assistant</h3>
                                    <p className="text-xs text-secondary-400 font-medium tracking-wide">● Online & Ready to Help</p>
                                </div>
                            </div>
                            <div className="glass p-3 rounded-lg text-sm text-slate-200 mb-4 shadow-sm inline-block rounded-tl-none relative z-10 border-primary-500/20">
                                Hi! I'm the AI assistant for {biz.name}. How can I help you today?
                            </div>
                            <div className="flex gap-2 relative z-10">
                                <input type="text" className="w-full text-sm p-2 rounded-lg glass-input" placeholder="Type your message..." />
                                <button className="btn-primary px-3 rounded-lg flex items-center justify-center">
                                    &rarr;
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Events Display */}
                    {events.length > 0 && (
                        <div className="glass rounded-2xl p-6 shadow-sm">
                            <h3 className="text-xl font-bold mb-4 text-white">Upcoming Events</h3>
                            <div className="space-y-4">
                                {events.map(evt => (
                                    <div key={evt.id} className="flex gap-4 p-3 bg-white/5 rounded-lg border border-white/5">
                                        <div className="bg-primary-500/20 text-primary-400 border border-primary-500/30 rounded-lg px-3 py-2 text-center min-w-[3.5rem] flex flex-col items-center justify-center shrink-0 h-14">
                                            <span className="text-xs font-bold uppercase">{new Date(evt.date).toLocaleString('default', { month: 'short' })}</span>
                                            <span className="text-lg font-black leading-none">{new Date(evt.date).getDate()}</span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white leading-tight mb-1">{evt.title}</h4>
                                            {evt.time && <p className="text-xs text-slate-400 font-medium mb-1"><Calendar size={12} className="inline mr-1" />{evt.time}</p>}
                                            {evt.location && <p className="text-xs text-slate-400"><MapPin size={12} className="inline mr-1" />{evt.location}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Premium AI Chat Widget (Floating on bottom right) */}
            {flags.ai_chat_widget && (
                <AIChatWidget businessName={biz.name} listingId={biz.id} />
            )}
        </div>
    );
}
