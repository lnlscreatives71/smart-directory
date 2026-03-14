'use client';
import { useEffect, useState } from 'react';
import { Plus, Loader2, FileText } from 'lucide-react';
import Link from 'next/link';

interface News {
    id: number;
    listing_id: number;
    listing_name?: string;
    title: string;
    content: string;
    created_at: string;
}

export default function NewsAdminPage() {
    const [news, setNews] = useState<News[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch('/api/news')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setNews(data.data);
                }
            })
            .catch(err => console.error(err))
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <div className="max-w-7xl mx-auto space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Press & News Releases</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage announcements published by premium businesses.</p>
                </div>
                <Link href="/dashboard/news/new" className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-bold shadow-sm transition hover:bg-slate-800">
                    <Plus size={15} /> Add News
                </Link>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-gray-100 dark:border-slate-800">
                            <tr className="text-gray-500 dark:text-slate-400 text-xs uppercase tracking-wide">
                                <th className="px-6 py-3.5 font-semibold">Headline</th>
                                <th className="px-6 py-3.5 font-semibold">Business</th>
                                <th className="px-6 py-3.5 font-semibold text-right">Published On</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={3} className="py-16 text-center">
                                        <Loader2 size={20} className="animate-spin text-blue-400 mx-auto" />
                                    </td>
                                </tr>
                            ) : news.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="py-16 text-center text-gray-400">
                                        <FileText className="mx-auto w-10 h-10 mb-3 opacity-20" />
                                        No news articles found.
                                    </td>
                                </tr>
                            ) : news.map(item => (
                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition">
                                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white max-w-[300px] truncate">{item.title}</td>
                                    <td className="px-6 py-4 text-blue-600 dark:text-blue-400 font-medium">{item.listing_name}</td>
                                    <td className="px-6 py-4 text-right text-gray-500 text-xs">{new Date(item.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
