'use client';

import { useState } from 'react';
import { Calendar } from 'lucide-react';

export default function BookingWidget({ listingId }: { listingId: number }) {
    const [form, setForm] = useState({
        customer_name: '',
        customer_email: '',
        booking_date: '',
        booking_time: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, listing_id: listingId })
            });
            const data = await res.json();
            if (data.success) {
                setSuccess(true);
                setForm({ customer_name: '', customer_email: '', booking_date: '', booking_time: '' });
                setTimeout(() => setSuccess(false), 5000);
            } else {
                alert(data.error);
            }
        } catch (err) {
            alert('Failed to submit booking');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl p-6 text-white shadow-lg">
            <h3 className="text-xl font-bold mb-2 flex items-center"><Calendar className="mr-2" /> Book Appointment</h3>
            <p className="text-secondary-100 mb-4 text-sm">Schedule a time instantly. No waiting required.</p>
            
            {success ? (
                <div className="bg-secondary-700/50 p-4 rounded-lg text-center border border-secondary-400">
                    <p className="font-bold text-white mb-1">Booking Confirmed!</p>
                    <p className="text-sm text-secondary-200">The business will contact you soon.</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-3 mb-4">
                    <input required type="text" placeholder="Your Name" value={form.customer_name} onChange={e => setForm({...form, customer_name: e.target.value})} className="w-full text-sm p-2 bg-secondary-700/50 border border-secondary-400 rounded outline-none placeholder:text-secondary-200" />
                    <input required type="email" placeholder="Your Email" value={form.customer_email} onChange={e => setForm({...form, customer_email: e.target.value})} className="w-full text-sm p-2 bg-secondary-700/50 border border-secondary-400 rounded outline-none placeholder:text-secondary-200" />
                    <div className="grid grid-cols-2 gap-2">
                        <input required type="date" value={form.booking_date} onChange={e => setForm({...form, booking_date: e.target.value})} className="w-full text-sm p-2 bg-secondary-700/50 border border-secondary-400 rounded outline-none text-secondary-100" />
                        <input required type="time" value={form.booking_time} onChange={e => setForm({...form, booking_time: e.target.value})} className="w-full text-sm p-2 bg-secondary-700/50 border border-secondary-400 rounded outline-none text-secondary-100" />
                    </div>
                    <button disabled={loading} type="submit" className="bg-white text-secondary-700 font-bold py-2.5 px-4 rounded-lg w-full hover:bg-secondary-50 transition shadow-sm disabled:opacity-50 mt-2">
                        {loading ? 'Confirming...' : 'Confirm Booking'}
                    </button>
                </form>
            )}
        </div>
    );
}
