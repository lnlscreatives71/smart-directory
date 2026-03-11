import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const q = searchParams.get('q') || '';
        const plan = searchParams.get('plan') || '';

        const listings = await sql`
      SELECT l.*, p.name as plan_name, p.monthly_price as plan_price
      FROM listings l
      LEFT JOIN plans p ON l.plan_id = p.id
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
            lat, lng, services, rating, featured, plan_id, feature_flags, contact_email, claimed
        } = body;

        const result = await sql`
      INSERT INTO listings (
        name, slug, category, description, location_city, location_state, location_region,
        lat, lng, services, rating, featured, plan_id, feature_flags, contact_email, claimed
      ) VALUES (
        ${name}, ${slug}, ${category}, ${description}, ${location_city}, ${location_state}, ${location_region},
        ${lat || null}, ${lng || null}, ${JSON.stringify(services || [])}, ${rating || 0}, ${featured || false}, ${plan_id}, ${JSON.stringify(feature_flags || {})}, ${contact_email || null}, ${claimed || false}
      ) RETURNING *
    `;

        if (result.length > 0) {
            await sql`
            INSERT INTO outreach_campaigns (listing_id, status)
            VALUES (${result[0].id}, 'pending')
           `;
        }

        return NextResponse.json({ success: true, data: result[0] });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('API Error:', error);
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
