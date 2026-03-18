import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const MAPS_API_KEY = process.env.NEXT_PUBLIC_MAPS_API_KEY || '';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get('name');
    const city = searchParams.get('city');
    const state = searchParams.get('state') || 'NC';

    if (!name || !city) {
        return NextResponse.json({ success: false, error: 'name and city required' }, { status: 400 });
    }
    if (!MAPS_API_KEY) {
        return NextResponse.json({ success: false, error: 'Maps API key not configured' }, { status: 500 });
    }

    try {
        const query = `${name} ${city} ${state}`;
        const searchRes = await fetch(
            `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id,photos,name&key=${MAPS_API_KEY}`
        );
        const searchData = await searchRes.json();
        const candidate = searchData?.candidates?.[0];
        const photoRef = candidate?.photos?.[0]?.photo_reference;

        if (!photoRef) {
            return NextResponse.json({ success: false, error: 'No photo found for this business' });
        }

        const imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photoRef}&key=${MAPS_API_KEY}`;
        return NextResponse.json({ success: true, imageUrl, placeName: candidate?.name });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
