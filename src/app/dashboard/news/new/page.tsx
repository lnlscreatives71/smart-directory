'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewNewsPage() {
    const router = useRouter();
    const [listings, setListings] = useState<{ id: number; name: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    const [form, setForm] = useState({
        listing_id: '',
        title: '',
        content: '',
        image_url: ''
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
            const res = await fetch('/api/news', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    listing_id: Number(form.listing_id)
                })
            });
            const data = await res.json();
            if (data.success) {
                router.push('/dashboard/news');
            } else {
                alert(data.error);
            }
        } catch (err: any) {
            alert('Error creating news update');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Add News Release</h1>
            <form onSubmit={onSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold mb-1">Select Premium Business *</label>
                        <select required className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-primary-500" value={form.listing_id} onChange={e => setForm({ ...form, listing_id: e.target.value })}>
                            <option value="">-- Choose Business --</option>
                            {listings.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Headline *</label>
                        <input required type="text" className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-primary-500" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Content Post *</label>
                        <textarea required rows={8} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-primary-500" placeholder="Write full text here..." value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Optional Feature Image URL</label>
                        <input type="url" placeholder="https://..." className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-primary-500" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} />
                    </div>
                </div>

                <div className="mt-8 flex gap-4">
                    <button type="button" onClick={() => router.back()} className="px-6 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 flex-1 font-semibold">Cancel</button>
                    <button type="submit" disabled={isLoading} className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg flex-1 disabled:opacity-50 font-bold">
                        {isLoading ? 'Saving...' : 'Publish Update'}
                    </button>
                </div>
            </form>
        </div>
    );
}
