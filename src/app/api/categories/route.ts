import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET all categories
export async function GET() {
    try {
        const categories = await sql`
            SELECT * FROM categories ORDER BY order_index ASC
        `;
        return NextResponse.json({ success: true, data: categories });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}

// POST create/update category
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, name, slug, icon, order_index } = body;

        if (!name || !slug) {
            return NextResponse.json(
                { success: false, error: 'Name and slug required' },
                { status: 400 }
            );
        }

        let category;
        if (id) {
            // Update existing
            category = await sql`
                UPDATE categories SET
                    name = ${name},
                    slug = ${slug},
                    icon = ${icon || null},
                    order_index = ${order_index || 0},
                    updated_at = NOW()
                WHERE id = ${parseInt(id)}
                RETURNING *
            `;
        } else {
            // Create new
            category = await sql`
                INSERT INTO categories (name, slug, icon, order_index)
                VALUES (${name}, ${slug}, ${icon || null}, ${order_index || 0})
                RETURNING *
            `;
        }

        return NextResponse.json({ success: true, data: category[0] });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}

// DELETE category
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

        await sql`DELETE FROM categories WHERE id = ${parseInt(id)}`;

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}
