import { sql } from '@/lib/db';
import { MetadataRoute } from 'next';

export const revalidate = 3600;

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.thetrianglehub.online';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const staticPages: MetadataRoute.Sitemap = [
        { url: `${BASE_URL}/`, changeFrequency: 'weekly', priority: 1.0 },
        { url: `${BASE_URL}/pricing`, changeFrequency: 'monthly', priority: 0.8 },
        { url: `${BASE_URL}/list-your-business`, changeFrequency: 'monthly', priority: 0.9 },
        { url: `${BASE_URL}/support`, changeFrequency: 'monthly', priority: 0.5 },
        { url: `${BASE_URL}/terms`, changeFrequency: 'yearly', priority: 0.3 },
        { url: `${BASE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
    ];

    // Fetch all active listing slugs
    let listingPages: MetadataRoute.Sitemap = [];
    try {
        const listings = (await sql`
            SELECT slug, updated_at
            FROM listings
            WHERE active = TRUE AND slug IS NOT NULL
            ORDER BY updated_at DESC
        `) as { slug: string; updated_at: string }[];
        listingPages = listings.map((l) => ({
            url: `${BASE_URL}/biz/${l.slug}`,
            lastModified: new Date(l.updated_at),
            changeFrequency: 'monthly',
            priority: 0.7,
        }));
    } catch {
        // Non-fatal — return static pages only if DB is unavailable
    }

    // Fetch distinct categories and slugify for category pages
    let categoryPages: MetadataRoute.Sitemap = [];
    try {
        const categories = (await sql`
            SELECT category, COUNT(*) as count
            FROM listings
            WHERE active = TRUE AND category IS NOT NULL
            GROUP BY category
            HAVING COUNT(*) >= 3
            ORDER BY COUNT(*) DESC
        `) as { category: string; count: string }[];
        categoryPages = categories.map((c) => {
            const slug = c.category
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .trim()
                .replace(/\s+/g, '-');
            return {
                url: `${BASE_URL}/category/${slug}`,
                changeFrequency: 'weekly' as const,
                priority: 0.8,
            };
        });
    } catch {
        // Non-fatal
    }

    return [...staticPages, ...categoryPages, ...listingPages];
}
