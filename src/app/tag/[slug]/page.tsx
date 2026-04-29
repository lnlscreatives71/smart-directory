import { sql } from '@/lib/db';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Star, Phone, Globe, CheckCircle } from 'lucide-react';
import { getListingImageUrl } from '@/lib/images';

export async function generateStaticParams() {
    // Generate paths for common tags
    return [
        { slug: 'pet-friendly' },
        { slug: 'wheelchair-accessible' },
        { slug: 'free-wifi' },
        { slug: 'outdoor-seating' },
    ];
}

export default async function TagPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    
    // Fetch tag info
    const tagRes = await sql`SELECT * FROM tags WHERE slug = ${slug} LIMIT 1`;
    
    if (tagRes.length === 0) {
        notFound();
    }
    
    const tag = tagRes[0];
    
    // Fetch listings with this tag
    const listings = await sql`
        SELECT l.* FROM listings l
        INNER JOIN listing_tags lt ON l.id = lt.listing_id
        WHERE lt.tag_id = ${tag.id}
        AND l.agency_id = ${tag.agency_id}
        ORDER BY l.featured DESC, l.rating DESC
    `;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 mb-4">
                        {tag.icon && <span className="text-xl">{tag.icon}</span>}
                        <span className="font-semibold">Business Tag</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                        {tag.name}
                    </h1>
                    {tag.description && (
                        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                            {tag.description}
                        </p>
                    )}
                    <p className="text-slate-500 mt-4">
                        {listings.length} {listings.length === 1 ? 'business' : 'businesses'} found
                    </p>
                </div>

                {/* Listings Grid */}
                {listings.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 mb-6">
                            <CheckCircle size={40} className="text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                            No businesses found
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400">
                            There are no businesses tagged with "{tag.name}" yet.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {listings.map((listing: any) => (
                            <Link
                                key={listing.id}
                                href={`/biz/${listing.slug}`}
                                className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-300 hover:-translate-y-1"
                            >
                                {/* Image */}
                                <div className="relative h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                    <Image
                                        src={getListingImageUrl(listing, 600)}
                                        alt={listing.name}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    {listing.featured && (
                                        <div className="absolute top-3 right-3 px-3 py-1 bg-secondary-500 text-white text-xs font-bold rounded-full">
                                            Featured
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-5">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                            {listing.name}
                                        </h3>
                                        {listing.claimed && (
                                            <CheckCircle size={18} className="text-primary-500 shrink-0 ml-2" />
                                        )}
                                    </div>

                                    {listing.description && (
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                                            {listing.description}
                                        </p>
                                    )}

                                    <div className="space-y-2">
                                        {listing.location_city && (
                                            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                                <MapPin size={14} />
                                                <span>{listing.location_city}, {listing.location_state}</span>
                                            </div>
                                        )}

                                        {listing.rating > 0 && (
                                            <div className="flex items-center gap-1">
                                                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                                                <span className="text-sm font-medium">{listing.rating.toFixed(1)}</span>
                                            </div>
                                        )}

                                        {listing.phone && (
                                            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                                <Phone size={14} />
                                                <span>{listing.phone}</span>
                                            </div>
                                        )}

                                        {listing.website && (
                                            <div className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400">
                                                <Globe size={14} />
                                                <span>Visit Website</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Back to home */}
                <div className="mt-12 text-center">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                    >
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
