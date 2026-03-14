'use client';
import { useEffect, useState } from 'react';
import { Plus, Bell, Loader2, Calendar } from 'lucide-react';
import Link from 'next/link';

interface Event {
    id: number;
    listing_id: number;
    listing_name?: string;
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    created_at: string;
}

export default function EventsAdminPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch('/api/events')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setEvents(data.data);
                }
            })
            .catch(err => console.error(err))
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <div className="max-w-7xl mx-auto space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Premium Events</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage events created by premium businesses.</p>
                </div>
                <Link href="/dashboard/events/new" className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-bold shadow-sm transition hover:bg-slate-800">
                    <Plus size={15} /> Add Event
                </Link>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-gray-100 dark:border-slate-800">
                            <tr className="text-gray-500 dark:text-slate-400 text-xs uppercase tracking-wide">
                                <th className="px-6 py-3.5 font-semibold">Event Title</th>
                                <th className="px-6 py-3.5 font-semibold">Business</th>
                                <th className="px-6 py-3.5 font-semibold">Date & Time</th>
                                <th className="px-6 py-3.5 font-semibold">Location</th>
                                <th className="px-6 py-3.5 font-semibold text-right">Added On</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="py-16 text-center">
                                        <Loader2 size={20} className="animate-spin text-blue-400 mx-auto" />
                                    </td>
                                </tr>
                            ) : events.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-16 text-center text-gray-400">
                                        <Bell className="mx-auto w-10 h-10 mb-3 opacity-20" />
                                        No events found.
                                    </td>
                                </tr>
                            ) : events.map(evt => (
                                <tr key={evt.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition">
                                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{evt.title}</td>
                                    <td className="px-6 py-4 text-blue-600 dark:text-blue-400 font-medium">{evt.listing_name}</td>
                                    <td className="px-6 py-4">
                                        <span className="flex items-center gap-1.5"><Calendar size={14} className="text-gray-400"/> {new Date(evt.date).toLocaleDateString()} at {evt.time || 'TBD'}</span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{evt.location || 'TBD'}</td>
                                    <td className="px-6 py-4 text-right text-gray-500 text-xs">{new Date(evt.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
