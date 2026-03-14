'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewEventPage() {
    const router = useRouter();
    const [listings, setListings] = useState<{ id: number; name: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    const [form, setForm] = useState({
        listing_id: '',
        title: '',
        description: '',
        date: '',
        time: '',
        location: ''
    });

    useEffect(() => {
        fetch('/api/listings')
            .then(res => res.json())
            .then(data => {
                if (data.success) setListings(data.data);
            });
    }, []);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    listing_id: Number(form.listing_id),
                    date: new Date(form.date).toISOString() // make sure it's DB ready
                })
            });
            const data = await res.json();
            if (data.success) {
                router.push('/dashboard/events');
            } else {
                alert(data.error);
            }
        } catch (err: any) {
            alert('Error creating event');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Add Event</h1>
            <form onSubmit={onSubmit} className="bg-white p-6 rounded-2xl border border-slate-200">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold mb-1">Select Premium Business *</label>
                        <select required className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={form.listing_id} onChange={e => setForm({ ...form, listing_id: e.target.value })}>
                            <option value="">-- Choose Business --</option>
                            {listings.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Event Title *</label>
                        <input required type="text" className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold mb-1">Date *</label>
                            <input required type="date" className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1">Time</label>
                            <input type="text" placeholder="e.g. 7:00 PM - 9:00 PM" className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Location / Venue</label>
                        <input type="text" className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Description</label>
                        <textarea rows={4} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                    </div>
                </div>

                <div className="mt-8 flex gap-4">
                    <button type="button" onClick={() => router.back()} className="px-6 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 flex-1 font-semibold">Cancel</button>
                    <button type="submit" disabled={isLoading} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex-1 disabled:opacity-50 font-bold">
                        {isLoading ? 'Saving...' : 'Create Event'}
                    </button>
                </div>
            </form>
        </div>
    );
}
