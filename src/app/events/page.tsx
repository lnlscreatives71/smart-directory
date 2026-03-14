import Link from 'next/link';
import { sql } from '@/lib/db';
import { Job, Event, News } from '@/lib/types';
import { Calendar, MapPin, Briefcase, DollarSign, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function EventsPage() {
    let events: Event[] = [];
    try {
        const res = await sql`
            SELECT e.*, l.name as listing_name 
            FROM events e
            LEFT JOIN listings l ON e.listing_id = l.id
            ORDER BY e.date ASC
        `;
        events = res as any as Event[];
    } catch {
        // Handle error gracefully
    }

    return (
        <div className="min-h-[calc(100vh-64px)] bg-[#f0f2f5] py-16 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-[#1a202c] mb-4">Local Events</h1>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto">Discover upcoming events, workshops, and gatherings happening in your community.</p>
                </div>

                {events.length === 0 ? (
                    <div className="bg-white rounded-2xl p-16 text-center border border-slate-200 shadow-sm max-w-2xl mx-auto">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-3xl">🗓️</span>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-3">No upcoming events</h2>
                        <p className="text-slate-500 mb-8">Businesses haven't posted any events at this time. Check back later!</p>
                        <Link href="/pricing" className="btn-primary px-6 py-3 rounded-xl text-sm font-bold">Post an Event</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {events.map(event => (
                            <Link key={event.id} href={`/listing/${event.listing_id}#event-${event.id}`} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-shadow group flex flex-col">
                                <div className="text-xs font-bold text-primary-600 mb-3 uppercase tracking-wide flex items-center gap-1.5 break-words">
                                    <Calendar size={14} /> {new Date(event.date).toLocaleDateString()}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-primary-600 transition-colors">{event.title}</h3>
                                {(event as any).listing_name && (
                                    <p className="text-sm font-semibold text-slate-600 mb-4">Hosted by: {(event as any).listing_name}</p>
                                )}
                                <p className="text-slate-500 text-sm mb-6 flex-1 line-clamp-3">{event.description}</p>
                                
                                <div className="space-y-2 mt-auto text-sm text-slate-500 bg-slate-50 p-4 rounded-xl">
                                    {event.time && (
                                        <div className="flex items-center gap-2">
                                            <Clock size={16} className="text-slate-400" /> {event.time}
                                        </div>
                                    )}
                                    {event.location && (
                                        <div className="flex items-center gap-2">
                                            <MapPin size={16} className="text-slate-400" /> {event.location}
                                        </div>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
