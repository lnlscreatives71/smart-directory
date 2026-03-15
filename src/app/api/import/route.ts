import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface BusinessRow {
    name: string;
    category: string;
    description?: string;
    location_city?: string;
    location_state?: string;
    contact_email?: string;
    website?: string;
    phone?: string;
    contact_name?: string;
    rating?: string;
}

// Map categories to Unsplash image IDs (curated professional photos)
const CATEGORY_IMAGES: Record<string, string> = {
    'restaurant': 'photo-1517248135467-4c7edcad34c4',
    'restaurants': 'photo-1517248135467-4c7edcad34c4',
    'cafe': 'photo-1554118120-118149a7a66d',
    'cafes': 'photo-1554118120-118149a7a66d',
    'med spa': 'photo-1600334089648-b0d9d3028eb2',
    'spa': 'photo-1600334089648-b0d9d3028eb2',
    'wellness': 'photo-1600334089648-b0d9d3028eb2',
    'plumbing': 'photo-1581244277943-fe4a8c327939',
    'hvac': 'photo-1581094794329-c8112a89af12',
    'real estate': 'photo-1560518883-ce09059eeffa',
    'retail': 'photo-1441984904996-e0b6ba687e04',
    'clothing': 'photo-1441986300917-64674bd600d8',
    'gym': 'photo-1534438327276-14e5300c3a48',
    'fitness': 'photo-1534438327276-14e5300c3a48',
    'yoga': 'photo-1544367563-12123d8965cd',
    'pet': 'photo-1516734295999-7f361c91b6c2',
    'law': 'photo-1589829545856-d10d557cf95f',
    'dental': 'photo-1629909613654-28e377c37b09',
    'health': 'photo-1576091160399-112ba8d25d1d',
    'services': 'photo-1454165804606-c3d57bc86b40',
    'other': 'photo-1497366216548-37526070297c',
};

function getImageForCategory(category: string): string {
    const normalized = category.toLowerCase().trim();
    const imageId = CATEGORY_IMAGES[normalized] || CATEGORY_IMAGES['other'];
    // Use direct Unsplash CDN with category-based sizing
    return `https://images.unsplash.com/${imageId}?w=800&h=600&fit=crop&q=80`;
}

function slugify(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 80);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const rows: BusinessRow[] = body.rows;

        if (!rows || !Array.isArray(rows) || rows.length === 0) {
            return NextResponse.json({ success: false, error: 'No rows provided' }, { status: 400 });
        }

        // Get the free plan id (lowest price plan)
        const plans = await sql`SELECT id FROM plans ORDER BY monthly_price ASC LIMIT 1`;
        const freePlanId = plans.length > 0 ? plans[0].id : null;

        const results = {
            imported: 0,
            skipped: 0,
            errors: [] as string[],
            listings: [] as { name: string; slug: string; hadEmail: boolean }[],
        };

        for (const row of rows) {
            // Validation
            if (!row.name) {
                results.skipped++;
                results.errors.push(`Skipped row: missing name (row: "${row.name || 'unknown'}")`);
                continue;
            }

            // Generate a unique slug
            let baseSlug = slugify(row.name);
            let slug = baseSlug;
            let attempt = 0;
            while (true) {
                const existing = await sql`SELECT id FROM listings WHERE slug = ${slug} LIMIT 1`;
                if (existing.length === 0) break;
                attempt++;
                slug = `${baseSlug}-${attempt}`;
            }

            // Check for duplicate by name + city
            const dupCheck = await sql`
                SELECT id FROM listings 
                WHERE LOWER(name) = LOWER(${row.name}) 
                AND LOWER(location_city) = LOWER(${row.location_city || ''})
                LIMIT 1
            `;
            if (dupCheck.length > 0) {
                results.skipped++;
                results.errors.push(`Skipped "${row.name}" — already exists in ${row.location_city || 'unknown city'}`);
                continue;
            }

            const rating = parseFloat(row.rating || '4.0');
            const safeRating = isNaN(rating) ? 4.0 : Math.min(5.0, Math.max(1.0, rating));

            try {
                // Get category image
                const imageUrl = getImageForCategory(row.category || 'Other');

                // Insert the listing
                const inserted = await sql`
                    INSERT INTO listings (
                        name, slug, category, description,
                        location_city, location_state, location_region,
                        lat, lng, services, rating, featured, claimed,
                        plan_id, feature_flags, contact_email,
                        contact_name, phone, website, image_url
                    ) VALUES (
                        ${row.name},
                        ${slug},
                        ${row.category || 'Other'},
                        ${row.description || `${row.name} is a trusted local business serving the Triangle area.`},
                        ${row.location_city || 'Raleigh'},
                        ${row.location_state || 'NC'},
                        ${'Triangle'},
                        ${35.7796},
                        ${-78.6382},
                        ${'[]'},
                        ${safeRating},
                        ${false},
                        ${false},
                        ${freePlanId},
                        ${'{}'},
                        ${row.contact_email || null},
                        ${row.contact_name || null},
                        ${row.phone || null},
                        ${row.website || null},
                        ${imageUrl}
                    )
                    RETURNING id
                `;

                const listingId = inserted[0]?.id;

                // Create outreach campaign so it enters the email funnel immediately
                if (listingId) {
                    await sql`
                        INSERT INTO outreach_campaigns (listing_id, status)
                        VALUES (${listingId}, 'pending')
                        ON CONFLICT DO NOTHING
                    `;

                    results.imported++;
                    results.listings.push({
                        name: row.name,
                        slug,
                        hadEmail: !!(row.contact_email),
                    });
                }
            } catch (rowErr: unknown) {
                const msg = rowErr instanceof Error ? rowErr.message : String(rowErr);
                results.errors.push(`Error inserting "${row.name}": ${msg}`);
                results.skipped++;
            }
        }

        return NextResponse.json({
            success: true,
            message: `Import complete — ${results.imported} added, ${results.skipped} skipped.`,
            ...results,
        });

    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('Import error:', err);
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
