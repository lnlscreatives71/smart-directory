import Link from 'next/link';
import { sql } from '@/lib/db';
import { Blog } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function BlogsPage() {
    let blogs: Blog[] = [];
    try {
        const res = await sql`
            SELECT b.*, l.name as listing_name 
            FROM blogs b
            LEFT JOIN listings l ON b.listing_id = l.id
            WHERE b.published = true
            ORDER BY b.created_at DESC
        `;
        blogs = res as any as Blog[];
    } catch {
        // Handle error gracefully
    }

    return (
        <div className="min-h-[calc(100vh-64px)] bg-[#f0f2f5] py-16 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-[#1a202c] mb-4">Local Business Blog</h1>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto">Discover stories, updates, and insights from local businesses in your community.</p>
                </div>

                {blogs.length === 0 ? (
                    <div className="bg-white rounded-2xl p-16 text-center border border-slate-200 shadow-sm max-w-2xl mx-auto">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-3xl">📰</span>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-3">No posts yet</h2>
                        <p className="text-slate-500 mb-8">Businesses haven't published any blog posts at this time. Check back later!</p>
                        <Link href="/pricing" className="btn-primary px-6 py-3 rounded-xl text-sm font-bold">List Your Business</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {blogs.map(blog => (
                            <Link key={blog.id} href={`/listing/${blog.listing_id}#blog-${blog.id}`} className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-shadow group flex flex-col">
                                {blog.image_url ? (
                                    <div className="aspect-video w-full overflow-hidden relative bg-slate-100">
                                        <img src={blog.image_url} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    </div>
                                ) : (
                                    <div className="aspect-video w-full bg-slate-100 flex items-center justify-center text-slate-300">
                                        📰 No Image
                                    </div>
                                )}
                                <div className="p-6 flex flex-col flex-1">
                                    <div className="text-xs font-bold text-primary-600 mb-2 uppercase tracking-wide">{blog.listing_name}</div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">{blog.title}</h3>
                                    <p className="text-slate-500 text-sm mb-4 line-clamp-3 flex-1">{blog.excerpt || blog.content.substring(0, 150)}</p>
                                    <div className="text-xs font-medium text-slate-400 mt-auto pt-4 border-t border-slate-100">
                                        {new Date(blog.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
