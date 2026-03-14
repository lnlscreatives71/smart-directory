'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewJobPage() {
    const router = useRouter();
    const [listings, setListings] = useState<{ id: number; name: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    const [form, setForm] = useState({
        listing_id: '',
        title: '',
        description: '',
        employment_type: 'Full-Time',
        location: '',
        salary_range: '',
        application_url: '',
        active: true
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
            const res = await fetch('/api/jobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    listing_id: Number(form.listing_id)
                })
            });
            const data = await res.json();
            if (data.success) {
                router.push('/dashboard/jobs');
            } else {
                alert(data.error);
            }
        } catch (err: any) {
            alert('Error creating job');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Add Job Posting</h1>
            <form onSubmit={onSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold mb-1">Select Hiring Company *</label>
                        <select required className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={form.listing_id} onChange={e => setForm({ ...form, listing_id: e.target.value })}>
                            <option value="">-- Choose Business --</option>
                            {listings.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Job Title *</label>
                        <input required type="text" className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold mb-1">Employment Type</label>
                            <select className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={form.employment_type} onChange={e => setForm({ ...form, employment_type: e.target.value })}>
                                <option>Full-Time</option>
                                <option>Part-Time</option>
                                <option>Contract</option>
                                <option>Temporary</option>
                                <option>Internship</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1">Location (City, Remote, etc.)</label>
                            <input type="text" className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold mb-1">Salary Range / Comp (Optional)</label>
                            <input type="text" placeholder="$60k - $80k DOE" className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={form.salary_range} onChange={e => setForm({ ...form, salary_range: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1">Application Link (URL)</label>
                            <input type="url" placeholder="https://..." className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={form.application_url} onChange={e => setForm({ ...form, application_url: e.target.value })} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1">Job Description *</label>
                        <textarea required rows={6} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                    </div>
                    
                    <label className="flex items-center space-x-2 mt-4 cursor-pointer">
                        <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} className="w-5 h-5 text-blue-600 rounded" />
                        <span className="text-sm font-semibold text-gray-900">Job is Active and currently recruiting</span>
                    </label>
                </div>

                <div className="mt-8 flex gap-4">
                    <button type="button" onClick={() => router.back()} className="px-6 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 flex-1 font-semibold">Cancel</button>
                    <button type="submit" disabled={isLoading} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex-1 disabled:opacity-50 font-bold">
                        {isLoading ? 'Saving...' : 'Post Job'}
                    </button>
                </div>
            </form>
        </div>
    );
}
