import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const q = searchParams.get('q') || '';
        const plan = searchParams.get('plan') || '';

        const listings = await sql`
      SELECT l.*, p.name as plan_name, p.monthly_price as plan_price,
             oc.status as outreach_status, oc.opens as outreach_opens, oc.clicks as outreach_clicks
      FROM listings l
      LEFT JOIN plans p ON l.plan_id = p.id
      LEFT JOIN outreach_campaigns oc ON oc.listing_id = l.id
      WHERE (
        ${q} = '' OR
        l.name ILIKE ${`%${q}%`} OR
        l.category ILIKE ${`%${q}%`} OR
        l.location_city ILIKE ${`%${q}%`}
      )
      AND (
        ${plan} = '' OR
        p.name = ${plan}
      )
      ORDER BY l.created_at DESC
    `;
        return NextResponse.json({ success: true, data: listings });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('API Error:', error);
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            name, slug, category, description, location_city, location_state, location_region,
            lat, lng, services, rating, featured, plan_id, feature_flags, contact_email, claimed,
            contact_name, phone, website
        } = body;
        let { image_url } = body;

        // Auto-fetch Google Maps photo if none is provided
        if (!image_url && process.env.NEXT_PUBLIC_MAPS_API_KEY) {
            try {
                const query = encodeURIComponent(`${name} ${location_city} ${location_state}`);
                const res = await fetch(`https://maps.googleapis.com/maps/api/place/findplacefromtext/json?fields=photos&input=${query}&inputtype=textquery&key=${process.env.NEXT_PUBLIC_MAPS_API_KEY}`);
                const placeData = await res.json();
                
                if (placeData.candidates && placeData.candidates.length > 0 && placeData.candidates[0].photos && placeData.candidates[0].photos.length > 0) {
                    const photoRef = placeData.candidates[0].photos[0].photo_reference;
                    image_url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photoRef}&key=${process.env.NEXT_PUBLIC_MAPS_API_KEY}`;
                }
            } catch (googleErr) {
                console.error('Failed to fetch Google Maps photo:', googleErr);
            }
        }

        const result = await sql`
      INSERT INTO listings (
        name, slug, category, description, location_city, location_state, location_region,
        lat, lng, services, rating, featured, plan_id, feature_flags, contact_email, claimed, image_url,
        contact_name, phone, website
      ) VALUES (
        ${name}, ${slug}, ${category}, ${description}, ${location_city}, ${location_state}, ${location_region},
        ${lat || null}, ${lng || null}, ${JSON.stringify(services || [])}, ${rating || 0}, ${featured || false}, ${plan_id}, ${JSON.stringify(feature_flags || {})}, ${contact_email || null}, ${claimed || false}, ${image_url || null},
        ${contact_name || null}, ${phone || null}, ${website || null}
      ) RETURNING *
    `;

        if (result.length > 0) {
            await sql`
            INSERT INTO outreach_campaigns (listing_id, status)
            VALUES (${result[0].id}, 'pending')
           `;
        }

        revalidatePath('/sitemap.xml');

        return NextResponse.json({ success: true, data: result[0] });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('API Error:', error);
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
