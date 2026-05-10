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

    // Live probes of Google APIs with both keys.
    const serverKey = process.env.MAPS_SERVER_API_KEY || '';
    const publicKey = process.env.NEXT_PUBLIC_MAPS_API_KEY || '';

    async function probeFindPlace(key: string, label: string) {
        if (!key) return { label, skipped: 'no key' };
        try {
            const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent('Allen Kelly Raleigh NC')}&inputtype=textquery&fields=place_id,photos,name&key=${key}`;
            const r = await fetch(url);
            const j = await r.json();
            return {
                label,
                http: r.status,
                google_status: j?.status,
                error_message: j?.error_message,
                candidates: j?.candidates?.length ?? 0,
                first_photo_ref_prefix: j?.candidates?.[0]?.photos?.[0]?.photo_reference?.slice(0, 12) || null,
            };
        } catch (e) {
            return { label, error: String(e) };
        }
    }

    async function probePhoto(key: string, label: string, ref: string) {
        if (!key || !ref) return { label, skipped: 'no key or ref' };
        try {
            const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${encodeURIComponent(ref)}&key=${key}`;
            const r = await fetch(url, { redirect: 'manual' });
            return {
                label,
                http: r.status,
                location: r.headers.get('location'),
                content_type: r.headers.get('content-type'),
                content_length: r.headers.get('content-length'),
            };
        } catch (e) {
            return { label, error: String(e) };
        }
    }

    const firstRef = (listings[0] as { google_photo_ref?: string })?.google_photo_ref || '';

    const probes = {
        findPlace_serverKey: await probeFindPlace(serverKey, 'findPlace MAPS_SERVER_API_KEY'),
        findPlace_publicKey: await probeFindPlace(publicKey, 'findPlace NEXT_PUBLIC_MAPS_API_KEY'),
        photo_serverKey: await probePhoto(serverKey, 'photo MAPS_SERVER_API_KEY (stored ref)', firstRef),
        photo_publicKey: await probePhoto(publicKey, 'photo NEXT_PUBLIC_MAPS_API_KEY (stored ref)', firstRef),
    };

    return NextResponse.json({
        env: {
            NEXT_PUBLIC_MAPS_API_KEY_set: !!publicKey,
            NEXT_PUBLIC_MAPS_API_KEY_prefix: publicKey?.slice(0, 8) || null,
            MAPS_SERVER_API_KEY_set: !!serverKey,
            MAPS_SERVER_API_KEY_prefix: serverKey?.slice(0, 8) || null,
            keys_match: !!serverKey && serverKey === publicKey,
        },
        counts: {
            with_google_photo_ref: (await sql`SELECT COUNT(*)::int as c FROM listings WHERE google_photo_ref IS NOT NULL`)[0]?.c,
            with_image_url: (await sql`SELECT COUNT(*)::int as c FROM listings WHERE image_url IS NOT NULL`)[0]?.c,
            total_active: (await sql`SELECT COUNT(*)::int as c FROM listings WHERE active = TRUE`)[0]?.c,
        },
        samples,
        probes,
    });
}
