'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewBlogPage() {
    const router = useRouter();
    const [listings, setListings] = useState<{ id: number; name: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    const [form, setForm] = useState({
        listing_id: '',
        title: '',
        excerpt: '',
        content: '',
        image_url: '',
        published: true
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
            const res = await fetch('/api/blogs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    listing_id: Number(form.listing_id)
                })
            });
            const data = await res.json();
            if (data.success) {
                router.push('/dashboard/blogs');
            } else {
                alert(data.error);
            }
        } catch (err: any) {
            alert('Error creating blog');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Add New Post</h1>
            <form onSubmit={onSubmit} className="bg-white p-6 rounded-2xl border border-slate-200">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold mb-1">Select Premium Business *</label>
                        <select required className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-primary-500" value={form.listing_id} onChange={e => setForm({ ...form, listing_id: e.target.value })}>
                            <option value="">-- Choose Business --</option>
                            {listings.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Post Title *</label>
                        <input required type="text" className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-primary-500" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Excerpt</label>
                        <input type="text" placeholder="Short description..." className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-primary-500" value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Content *</label>
                        <textarea required rows={8} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-primary-500" placeholder="Write your post here..." value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Cover Image URL</label>
                        <input type="url" placeholder="https://..." className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-primary-500" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} />
                    </div>
                    <label className="flex items-center space-x-2 mt-4 cursor-pointer">
                        <input type="checkbox" checked={form.published} onChange={e => setForm({ ...form, published: e.target.checked })} className="w-4 h-4 text-primary-600 rounded" />
                        <span className="text-sm font-semibold">Publish immediately</span>
                    </label>
                </div>

                <div className="mt-8 flex gap-4">
                    <button type="button" onClick={() => router.back()} className="px-6 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 flex-1 font-semibold">Cancel</button>
                    <button type="submit" disabled={isLoading} className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg flex-1 disabled:opacity-50 font-bold">
                        {isLoading ? 'Saving...' : 'Publish Post'}
                    </button>
                </div>
            </form>
        </div>
    );
}
