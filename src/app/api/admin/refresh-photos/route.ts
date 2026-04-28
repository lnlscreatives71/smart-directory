import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const MAPS_API_KEY = process.env.MAPS_SERVER_API_KEY || process.env.NEXT_PUBLIC_MAPS_API_KEY || '';

async function fetchGoogleData(name: string, city: string, state: string): Promise<{ photoRef: string | null; rating: number | null; debug?: unknown }> {
    if (!MAPS_API_KEY) return { photoRef: null, rating: null };
    try {
        const cleanName = name.replace(/\s*\(.*?\)\s*$/, '').trim();
        const cleanCity = city.length <= 2 ? 'Raleigh' : city;
        const query = `${cleanName} ${cleanCity} ${state}`;
        const res = await fetch(
            `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id,photos,rating&key=${MAPS_API_KEY}`
        );
        const data = await res.json();
        const candidate = data?.candidates?.[0];
        const photoRef = candidate?.photos?.[0]?.photo_reference || null;
        const rating = typeof candidate?.rating === 'number' ? candidate.rating : null;
        return { photoRef, rating, debug: { status: data?.status, candidateCount: data?.candidates?.length ?? 0 } };
    } catch (e) {
        return { photoRef: null, rating: null, debug: { error: String(e) } };
    }
}

export async function POST() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string })?.role !== 'admin') {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (!MAPS_API_KEY) {
        return NextResponse.json({ success: false, error: 'NEXT_PUBLIC_MAPS_API_KEY not set' }, { status: 400 });
    }

    const listings = await sql`
        SELECT id, name, location_city, location_state
        FROM listings
        WHERE active = TRUE
        ORDER BY id ASC
    `;

    let updated = 0;
    let failed = 0;
    const debugSample: unknown[] = [];

    for (const l of listings) {
        const { photoRef, rating, debug } = await fetchGoogleData(
            l.name as string,
            (l.location_city as string) || 'Raleigh',
            (l.location_state as string) || 'NC'
        );

        if (debugSample.length < 3) {
            debugSample.push({ name: l.name, photo: !!photoRef, rating, debug });
        }

        if (photoRef || rating !== null) {
            const proxyUrl = photoRef ? `/api/photo?ref=${photoRef}` : null;
            await sql`
                UPDATE listings SET
                    image_url = COALESCE(${proxyUrl}, image_url),
                    google_photo_ref = COALESCE(${photoRef}, google_photo_ref),
                    rating = COALESCE(${rating}, rating)
                WHERE id = ${l.id}
            `;
            updated++;
        } else {
            failed++;
        }
    }

    return NextResponse.json({
        success: true,
        message: `${updated} listings updated with Google data, ${failed} not found.`,
        updated,
        failed,
        debugSample,
    });
}
