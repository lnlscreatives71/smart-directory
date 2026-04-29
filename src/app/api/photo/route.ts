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
    const debug = searchParams.get('debug') === '1';

    if (!ref) {
        if (debug) return NextResponse.json({ error: 'missing ref param' }, { status: 400 });
        return NextResponse.redirect(FALLBACK, 302);
    }
    if (!MAPS_API_KEY) {
        if (debug) return NextResponse.json({ error: 'no MAPS_SERVER_API_KEY or NEXT_PUBLIC_MAPS_API_KEY in env' }, { status: 500 });
        return NextResponse.redirect(FALLBACK, 302);
    }

    const upstreamUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${w}&photo_reference=${encodeURIComponent(ref)}&key=${MAPS_API_KEY}`;

    try {
        const upstream = await fetch(upstreamUrl, { redirect: 'follow' });

        if (!upstream.ok || !upstream.body) {
            if (debug) {
                const text = await upstream.text().catch(() => '');
                return NextResponse.json({
                    error: 'upstream not ok',
                    status: upstream.status,
                    statusText: upstream.statusText,
                    contentType: upstream.headers.get('content-type'),
                    body: text.slice(0, 500),
                    keyPrefix: MAPS_API_KEY.slice(0, 8),
                    refLen: ref.length,
                }, { status: 502 });
            }
            return NextResponse.redirect(FALLBACK, 302);
        }

        if (debug) {
            return NextResponse.json({
                ok: true,
                status: upstream.status,
                contentType: upstream.headers.get('content-type'),
                contentLength: upstream.headers.get('content-length'),
            });
        }

        const contentType = upstream.headers.get('content-type') || 'image/jpeg';
        return new NextResponse(upstream.body, {
            status: 200,
            headers: {
                'content-type': contentType,
                'cache-control': 'public, max-age=2592000, s-maxage=2592000, immutable',
            },
        });
    } catch (e) {
        if (debug) return NextResponse.json({ error: 'fetch threw', message: String(e) }, { status: 500 });
        return NextResponse.redirect(FALLBACK, 302);
    }
}
