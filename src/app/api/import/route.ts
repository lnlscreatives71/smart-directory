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
                // Insert the listing
                const inserted = await sql`
                    INSERT INTO listings (
                        name, slug, category, description,
                        location_city, location_state, location_region,
                        lat, lng, services, rating, featured, claimed,
                        plan_id, feature_flags, contact_email,
                        contact_name, phone, website
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
                        ${row.website || null}
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
