'use client';
import { useEffect, useState } from 'react';
import { Loader2, Calendar, CheckCircle2 } from 'lucide-react';

interface Booking {
    id: number;
    listing_id: number;
    listing_name?: string;
    customer_name: string;
    customer_email: string;
    booking_date: string;
    booking_time: string;
    status: string;
    created_at: string;
}

export default function BookingsAdminPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch('/api/bookings')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setBookings(data.data);
                }
            })
            .catch(err => console.error(err))
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <div className="max-w-7xl mx-auto space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Customer Bookings</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage network-wide calendar bookings and appointments.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-gray-100 dark:border-slate-800">
                            <tr className="text-gray-500 dark:text-slate-400 text-xs uppercase tracking-wide">
                                <th className="px-6 py-3.5 font-semibold">Customer</th>
                                <th className="px-6 py-3.5 font-semibold">Business</th>
                                <th className="px-6 py-3.5 font-semibold">Date & Time</th>
                                <th className="px-6 py-3.5 font-semibold">Status</th>
                                <th className="px-6 py-3.5 font-semibold text-right">Requested On</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="py-16 text-center">
                                        <Loader2 size={20} className="animate-spin text-primary-400 mx-auto" />
                                    </td>
                                </tr>
                            ) : bookings.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-16 text-center text-gray-400">
                                        <Calendar className="mx-auto w-10 h-10 mb-3 opacity-20" />
                                        No bookings requested yet.
                                    </td>
                                </tr>
                            ) : bookings.map(b => (
                                <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition">
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-gray-900 dark:text-white">{b.customer_name}</p>
                                        <p className="text-xs text-primary-600">{b.customer_email}</p>
                                    </td>
                                    <td className="px-6 py-4 font-semibold">{b.listing_name}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-gray-400" />
                                            <span>
                                                {new Date(b.booking_date).toLocaleDateString()} @ {b.booking_time}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full uppercase w-fit">
                                            {b.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-gray-500 text-xs">{new Date(b.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
