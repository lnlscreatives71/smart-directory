import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const q = searchParams.get('q') || '';
        const plan = searchParams.get('plan') || '';

        let query = `
      SELECT l.*, p.name as plan_name, p.monthly_price as plan_price
      FROM listings l
      LEFT JOIN plans p ON l.plan_id = p.id
      WHERE 1=1
    `;
        const values: any[] = [];

        if (q) {
            values.push(`%${q}%`);
            query += ` AND (l.name ILIKE $${values.length} OR l.category ILIKE $${values.length} OR l.location_city ILIKE $${values.length})`;
        }

        if (plan) {
            values.push(plan);
            query += ` AND p.name = $${values.length}`;
        }

        query += ` ORDER BY l.created_at DESC`;

        const listings = await sql(query, values);
        return NextResponse.json({ success: true, data: listings });
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
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
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
