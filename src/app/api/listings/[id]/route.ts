import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const result = await sql`SELECT * FROM listings WHERE id = ${id} LIMIT 1`;
        if (result.length === 0) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
        return NextResponse.json({ success: true, data: result[0] });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const {
            name, slug, category, description, location_city, location_state, location_region,
            lat, lng, services, rating, featured, plan_id, feature_flags, contact_email, claimed,
            contact_name, phone, website
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
        claimed = ${claimed || false},
        plan_id = ${plan_id},
        feature_flags = ${JSON.stringify(feature_flags || {})},
        contact_email = ${contact_email || null},
        contact_name = ${contact_name || null},
        phone = ${phone || null},
        website = ${website || null},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

        return NextResponse.json({ success: true, data: result[0] });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}

// Lightweight partial update — for active toggle, claimed, featured etc.
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();

        if ('active' in body) {
            await sql`UPDATE listings SET featured = ${body.active}, updated_at = NOW() WHERE id = ${id}`;
        }
        if ('claimed' in body) {
            await sql`UPDATE listings SET claimed = ${body.claimed}, updated_at = NOW() WHERE id = ${id}`;
        }
        if ('plan_id' in body) {
            await sql`UPDATE listings SET plan_id = ${body.plan_id}, updated_at = NOW() WHERE id = ${id}`;
        }

        const updated = await sql`SELECT * FROM listings WHERE id = ${id} LIMIT 1`;
        return NextResponse.json({ success: true, data: updated[0] });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await sql`DELETE FROM listings WHERE id = ${id}`;
        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
