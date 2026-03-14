'use client';
import { useEffect, useState } from 'react';
import { Plus, LayoutDashboard, Loader2, FileText } from 'lucide-react';
import Link from 'next/link';

interface Blog {
    id: number;
    listing_id: number;
    listing_name?: string;
    title: string;
    excerpt: string;
    published: boolean;
    created_at: string;
}

export default function BlogsAdminPage() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch('/api/blogs')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setBlogs(data.data);
                }
            })
            .catch(err => console.error(err))
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <div className="max-w-7xl mx-auto space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Premium Blogs & News</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage articles published by premium businesses.</p>
                </div>
                <Link href="/dashboard/blogs/new" className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-bold shadow-sm transition hover:bg-slate-800">
                    <Plus size={15} /> Add Post
                </Link>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-gray-100 dark:border-slate-800">
                            <tr className="text-gray-500 dark:text-slate-400 text-xs uppercase tracking-wide">
                                <th className="px-6 py-3.5 font-semibold">Post Title</th>
                                <th className="px-6 py-3.5 font-semibold">Business</th>
                                <th className="px-6 py-3.5 font-semibold">Status</th>
                                <th className="px-6 py-3.5 font-semibold text-right">Published On</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="py-16 text-center">
                                        <Loader2 size={20} className="animate-spin text-primary-400 mx-auto" />
                                    </td>
                                </tr>
                            ) : blogs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-16 text-center text-gray-400">
                                        <FileText className="mx-auto w-10 h-10 mb-3 opacity-20" />
                                        No blogs found.
                                    </td>
                                </tr>
                            ) : blogs.map(blog => (
                                <tr key={blog.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition">
                                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{blog.title}</td>
                                    <td className="px-6 py-4 text-primary-600 dark:text-primary-400 font-medium">{blog.listing_name}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${blog.published ? 'bg-secondary-100 text-secondary-700' : 'bg-gray-100 text-gray-600'}`}>{blog.published ? 'Live' : 'Draft'}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-gray-500 text-xs">{new Date(blog.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
