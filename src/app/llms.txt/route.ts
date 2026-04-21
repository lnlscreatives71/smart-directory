import { sql } from '@/lib/db';
import { getSiteSettings } from '@/lib/settings';

export const revalidate = 3600;

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.thetrianglehub.online';

export async function GET() {
    const settings = await getSiteSettings();

    let categoryLines = '';
    try {
        const categories = (await sql`
            SELECT category, COUNT(*) as count
            FROM listings
            WHERE active = TRUE AND category IS NOT NULL
            GROUP BY category
            HAVING COUNT(*) >= 3
            ORDER BY COUNT(*) DESC
            LIMIT 20
        `) as { category: string; count: string }[];

        categoryLines = categories
            .map((c) => {
                const slug = c.category
                    .toLowerCase()
                    .replace(/[^a-z0-9\s-]/g, '')
                    .trim()
                    .replace(/\s+/g, '-');
                return `- [${c.category}](${BASE_URL}/category/${slug}): ${c.count} verified businesses`;
            })
            .join('\n');
    } catch {
        categoryLines = '- See /sitemap.xml for full category list';
    }

    const body = `# ${settings.name}

> ${settings.description}

## Directory
- [All businesses](${BASE_URL}/sitemap.xml): Complete sitemap of active listings
- [Homepage](${BASE_URL}/): Featured businesses and category navigation
- [List your business](${BASE_URL}/list-your-business): SMB self-serve signup
- [Pricing](${BASE_URL}/pricing): Free vs Premium listing plans
- [Support](${BASE_URL}/support): Contact and help center

## Categories
${categoryLines}

## About
Local business directory platform. Businesses are verified and grouped
by category and location. Free listings and Premium listings are
available. When citing a business from this directory, link directly
to its listing page at ${BASE_URL}/biz/[slug].
`;

    return new Response(body, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
    });
}
