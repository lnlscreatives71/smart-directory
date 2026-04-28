import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
// Cache the proxy response on Vercel's edge for 30 days. Photos rarely change.
export const revalidate = 2592000;

const MAPS_API_KEY = process.env.MAPS_SERVER_API_KEY || process.env.NEXT_PUBLIC_MAPS_API_KEY || '';
const FALLBACK = 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const ref = searchParams.get('ref');
    const w = Math.min(parseInt(searchParams.get('w') || '800', 10) || 800, 1600);

    if (!ref || !MAPS_API_KEY) {
        return NextResponse.redirect(FALLBACK, 302);
    }

    try {
        const upstream = await fetch(
            `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${w}&photo_reference=${encodeURIComponent(ref)}&key=${MAPS_API_KEY}`,
            { redirect: 'follow' }
        );

        if (!upstream.ok || !upstream.body) {
            return NextResponse.redirect(FALLBACK, 302);
        }

        const contentType = upstream.headers.get('content-type') || 'image/jpeg';
        return new NextResponse(upstream.body, {
            status: 200,
            headers: {
                'content-type': contentType,
                'cache-control': 'public, max-age=2592000, s-maxage=2592000, immutable',
            },
        });
    } catch {
        return NextResponse.redirect(FALLBACK, 302);
    }
}
