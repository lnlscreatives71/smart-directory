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
        <div className="min-h-[calc(100vh-64px)] bg-slate-950 py-16 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Local Business Blog</h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">Discover stories, updates, and insights from local businesses in your community.</p>
                </div>

                {blogs.length === 0 ? (
                    <div className="glass rounded-2xl p-16 text-center border border-slate-700/50 max-w-2xl mx-auto">
                        <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-3xl">📰</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">No posts yet</h2>
                        <p className="text-slate-400 mb-8">Businesses haven't published any blog posts at this time. Check back later!</p>
                        <Link href="/pricing" className="btn-primary px-6 py-3 rounded-xl text-sm font-bold">List Your Business</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {blogs.map(blog => (
                            <Link key={blog.id} href={`/listing/${blog.listing_id}#blog-${blog.id}`} className="glass rounded-2xl overflow-hidden border border-white/10 shadow-sm hover:shadow-xl transition-shadow group flex flex-col">
                                {blog.image_url ? (
                                    <div className="aspect-video w-full overflow-hidden relative bg-slate-800">
                                        <img src={blog.image_url} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    </div>
                                ) : (
                                    <div className="aspect-video w-full bg-slate-800 flex items-center justify-center text-slate-600">
                                        📰 No Image
                                    </div>
                                )}
                                <div className="p-6 flex flex-col flex-1">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-medium text-slate-400">{new Date(blog.created_at).toLocaleDateString()}</span>
                                        <span className="text-xs font-semibold text-primary-400">{blog.listing_name}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">{blog.title}</h3>
                                    <p className="text-slate-400 text-sm mb-4 flex-1 line-clamp-3">{blog.excerpt || blog.content.substring(0, 100) + '...'}</p>
                                    <span className="text-primary-400 text-sm font-semibold group-hover:text-primary-300 transition-colors">Read More →</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
