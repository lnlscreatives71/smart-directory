import Link from 'next/link';
import { sql } from '@/lib/db';
import { Job, Event, News } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function NewsPage() {
    let newsList: News[] = [];
    try {
        const res = await sql`
            SELECT n.*, l.name as listing_name 
            FROM news n
            LEFT JOIN listings l ON n.listing_id = l.id
            ORDER BY n.created_at DESC
        `;
        newsList = res as any as News[];
    } catch {
        // Handle error gracefully
    }

    return (
        <div className="min-h-[calc(100vh-64px)] bg-[#f0f2f5] py-16 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-[#1a202c] mb-4">Community News Feed</h1>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto">Stay up to date with the latest announcements, offers, and news from local businesses.</p>
                </div>

                {newsList.length === 0 ? (
                    <div className="bg-white rounded-2xl p-16 text-center border border-slate-200 shadow-sm max-w-2xl mx-auto">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-3xl">📢</span>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-3">No news yet</h2>
                        <p className="text-slate-500 mb-8">Businesses haven't posted any updates at this time. Check back later!</p>
                        <Link href="/pricing" className="btn-primary px-6 py-3 rounded-xl text-sm font-bold">Share an Update</Link>
                    </div>
                ) : (
                    <div className="max-w-3xl mx-auto space-y-6">
                        {newsList.map(news => (
                            <Link key={news.id} href={`/listing/${news.listing_id}#news-${news.id}`} className="block bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-shadow group relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-primary-500 rounded-l-2xl"></div>
                                <div className="flex flex-col md:flex-row gap-6">
                                    {news.image_url && (
                                        <div className="w-full md:w-48 aspect-video md:aspect-square shrink-0 rounded-xl overflow-hidden bg-slate-100">
                                            <img src={news.image_url} alt={news.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        </div>
                                    )}
                                    <div className="flex flex-col justify-center flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="text-xs font-bold text-primary-600 uppercase tracking-wide">{news.listing_name}</div>
                                            <div className="text-xs font-medium text-slate-400">{new Date(news.created_at).toLocaleDateString()}</div>
                                        </div>
                                        <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 group-hover:text-primary-600 transition-colors">{news.title}</h3>
                                        <p className="text-slate-600 text-[15px] leading-relaxed line-clamp-3">{news.content}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
