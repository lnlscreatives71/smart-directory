import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET all services for a business
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const listingId = searchParams.get('listing_id');

        if (!listingId) {
            return NextResponse.json(
                { success: false, error: 'listing_id required' },
                { status: 400 }
            );
        }

        const services = await sql`
            SELECT * FROM business_services 
            WHERE listing_id = ${parseInt(listingId)} 
            AND active = true
            ORDER BY category, name
        `;

        return NextResponse.json({ success: true, data: services });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}

// POST create new service
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { 
            listing_id, 
            name, 
            description, 
            duration_minutes, 
            price, 
            category 
        } = body;

        if (!listing_id || !name || !duration_minutes) {
            return NextResponse.json(
                { success: false, error: 'listing_id, name, and duration_minutes required' },
                { status: 400 }
            );
        }

        const service = await sql`
            INSERT INTO business_services (
                listing_id, name, description, duration_minutes, price, category
            ) VALUES (
                ${parseInt(listing_id)},
                ${name},
                ${description || null},
                ${parseInt(duration_minutes)},
                ${price ? parseFloat(price) : null},
                ${category || null}
            )
            RETURNING *
        `;

        return NextResponse.json({ success: true, data: service[0] });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}

// PUT update service
export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { 
            id, 
            name, 
            description, 
            duration_minutes, 
            price, 
            category,
            active 
        } = body;

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'id required' },
                { status: 400 }
            );
        }

        const service = await sql`
            UPDATE business_services SET
                name = ${name || name},
                description = ${description || null},
                duration_minutes = ${duration_minutes ? parseInt(duration_minutes) : duration_minutes},
                price = ${price ? parseFloat(price) : null},
                category = ${category || null},
                active = ${active !== undefined ? active : true},
                updated_at = NOW()
            WHERE id = ${parseInt(id)}
            RETURNING *
        `;

        if (service.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Service not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: service[0] });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}

// DELETE service
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'id required' },
                { status: 400 }
            );
        }

        await sql`DELETE FROM business_services WHERE id = ${parseInt(id)}`;

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}
