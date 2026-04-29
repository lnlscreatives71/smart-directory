import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getListingImageUrl } from '@/lib/images';

export const dynamic = 'force-dynamic';

export async function GET() {
    const listings = await sql`
        SELECT id, name, image_url, google_photo_ref, category
        FROM listings
        WHERE active = TRUE
        ORDER BY id ASC
        LIMIT 5
    `;

    const samples = listings.map((l: Record<string, unknown>) => ({
        id: l.id,
        name: l.name,
        image_url: l.image_url,
        google_photo_ref: l.google_photo_ref ? `${String(l.google_photo_ref).slice(0, 20)}... (len ${String(l.google_photo_ref).length})` : null,
        helper_returns: getListingImageUrl(
            l as Parameters<typeof getListingImageUrl>[0],
            500
        ),
    }));

    return NextResponse.json({
        env: {
            NEXT_PUBLIC_MAPS_API_KEY_set: !!process.env.NEXT_PUBLIC_MAPS_API_KEY,
            NEXT_PUBLIC_MAPS_API_KEY_prefix: process.env.NEXT_PUBLIC_MAPS_API_KEY?.slice(0, 8) || null,
            MAPS_SERVER_API_KEY_set: !!process.env.MAPS_SERVER_API_KEY,
        },
        counts: {
            with_google_photo_ref: (await sql`SELECT COUNT(*)::int as c FROM listings WHERE google_photo_ref IS NOT NULL`)[0]?.c,
            with_image_url: (await sql`SELECT COUNT(*)::int as c FROM listings WHERE image_url IS NOT NULL`)[0]?.c,
            total_active: (await sql`SELECT COUNT(*)::int as c FROM listings WHERE active = TRUE`)[0]?.c,
        },
        samples,
    });
}
