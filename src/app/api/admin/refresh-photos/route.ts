import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const MAPS_API_KEY = process.env.MAPS_SERVER_API_KEY || process.env.NEXT_PUBLIC_MAPS_API_KEY || '';

async function fetchGoogleData(name: string, city: string, state: string): Promise<{ photo: string | null; rating: number | null; debug?: unknown }> {
    if (!MAPS_API_KEY) return { photo: null, rating: null };
    try {
        const query = `${name} ${city} ${state}`;
        const res = await fetch(
            `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id,photos,rating&key=${MAPS_API_KEY}`
        );
        const data = await res.json();
        const candidate = data?.candidates?.[0];
        const photoRef = candidate?.photos?.[0]?.photo_reference;
        const photo = photoRef
            ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photoRef}&key=${MAPS_API_KEY}`
            : null;
        const rating = typeof candidate?.rating === 'number' ? candidate.rating : null;
        return { photo, rating, debug: { status: data?.status, candidateCount: data?.candidates?.length ?? 0 } };
    } catch (e) {
        return { photo: null, rating: null, debug: { error: String(e) } };
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
        const { photo, rating, debug } = await fetchGoogleData(
            l.name as string,
            (l.location_city as string) || 'Raleigh',
            (l.location_state as string) || 'NC'
        );

        // Capture first 3 results for debugging
        if (debugSample.length < 3) {
            debugSample.push({ name: l.name, photo: !!photo, rating, debug });
        }

        if (photo || rating !== null) {
            await sql`
                UPDATE listings SET
                    image_url = COALESCE(${photo}, image_url),
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
