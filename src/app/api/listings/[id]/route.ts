import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const result = await sql`SELECT * FROM listings WHERE id = ${params.id} LIMIT 1`;
        if (result.length === 0) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
        return NextResponse.json({ success: true, data: result[0] });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const body = await request.json();
        const {
            name, slug, category, description, location_city, location_state, location_region,
            lat, lng, services, rating, featured, plan_id, feature_flags
        } = body;

        const result = await sql`
      UPDATE listings SET
        name = ${name},
        slug = ${slug},
        category = ${category},
        description = ${description},
        location_city = ${location_city},
        location_state = ${location_state},
        location_region = ${location_region},
        lat = ${lat || null},
        lng = ${lng || null},
        services = ${JSON.stringify(services || [])},
        rating = ${rating || 0},
        featured = ${featured || false},
        plan_id = ${plan_id},
        feature_flags = ${JSON.stringify(feature_flags || {})},
        updated_at = NOW()
      WHERE id = ${params.id}
      RETURNING *
    `;

        return NextResponse.json({ success: true, data: result[0] });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        await sql`DELETE FROM listings WHERE id = ${params.id}`;
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
