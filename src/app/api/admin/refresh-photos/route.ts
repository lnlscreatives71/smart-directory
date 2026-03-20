import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const MAPS_API_KEY = process.env.NEXT_PUBLIC_MAPS_API_KEY || '';

async function fetchGooglePhoto(name: string, city: string, state: string): Promise<string | null> {
    if (!MAPS_API_KEY) return null;
    try {
        const query = `${name} ${city} ${state}`;
        const res = await fetch(
            `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id,photos&key=${MAPS_API_KEY}`
        );
        const data = await res.json();
        const photoRef = data?.candidates?.[0]?.photos?.[0]?.photo_reference;
        if (!photoRef) return null;
        return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photoRef}&key=${MAPS_API_KEY}`;
    } catch {
        return null;
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

    for (const l of listings) {
        const photo = await fetchGooglePhoto(
            l.name as string,
            l.location_city as string || 'Raleigh',
            l.location_state as string || 'NC'
        );
        if (photo) {
            await sql`UPDATE listings SET image_url = ${photo} WHERE id = ${l.id}`;
            updated++;
        } else {
            failed++;
        }
    }

    return NextResponse.json({
        success: true,
        message: `${updated} photos updated, ${failed} not found on Google Places.`,
        updated,
        failed,
    });
}
