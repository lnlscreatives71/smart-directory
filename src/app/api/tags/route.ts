import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

/**
 * Tags API - CRUD operations for business tags
 * 
 * GET /api/tags - Get all tags for an agency
 * POST /api/tags - Create a new tag
 * PUT /api/tags - Update a tag
 * DELETE /api/tags?id=X - Delete a tag
 */

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const agencyId = searchParams.get('agency_id');

        if (!agencyId) {
            return NextResponse.json({ error: 'agency_id is required' }, { status: 400 });
        }

        const tags = await sql`
            SELECT * FROM tags 
            WHERE agency_id = ${parseInt(agencyId)} 
            ORDER BY name ASC
        `;

        return NextResponse.json({ data: tags });
    } catch (error) {
        console.error('Error fetching tags:', error);
        return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { agency_id, name, slug, icon, color, description } = body;

        if (!agency_id || !name || !slug) {
            return NextResponse.json({ error: 'agency_id, name, and slug are required' }, { status: 400 });
        }

        // Check if slug already exists for this agency
        const existing = await sql`
            SELECT id FROM tags 
            WHERE agency_id = ${parseInt(agency_id)} AND slug = ${slug}
        `;

        if (existing.length > 0) {
            return NextResponse.json({ error: 'Tag with this slug already exists' }, { status: 409 });
        }

        const result = await sql`
            INSERT INTO tags (agency_id, name, slug, icon, color, description)
            VALUES (${parseInt(agency_id)}, ${name}, ${slug}, ${icon || null}, ${color || '#3b82f6'}, ${description || null})
            RETURNING *
        `;

        return NextResponse.json({ data: result[0], message: 'Tag created successfully' });
    } catch (error) {
        console.error('Error creating tag:', error);
        return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, agency_id, name, slug, icon, color, description, is_active } = body;

        if (!id || !agency_id) {
            return NextResponse.json({ error: 'id and agency_id are required' }, { status: 400 });
        }

        // Check if slug already exists for another tag in this agency
        const existing = await sql`
            SELECT id FROM tags 
            WHERE agency_id = ${parseInt(agency_id)} AND slug = ${slug} AND id != ${parseInt(id)}
        `;

        if (existing.length > 0) {
            return NextResponse.json({ error: 'Another tag with this slug already exists' }, { status: 409 });
        }

        const result = await sql`
            UPDATE tags 
            SET 
                name = ${name},
                slug = ${slug},
                icon = ${icon || null},
                color = ${color || '#3b82f6'},
                description = ${description || null},
                is_active = ${is_active !== undefined ? is_active : true},
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${parseInt(id)} AND agency_id = ${parseInt(agency_id)}
            RETURNING *
        `;

        if (result.length === 0) {
            return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
        }

        return NextResponse.json({ data: result[0], message: 'Tag updated successfully' });
    } catch (error) {
        console.error('Error updating tag:', error);
        return NextResponse.json({ error: 'Failed to update tag' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');
        const agency_id = searchParams.get('agency_id');

        if (!id || !agency_id) {
            return NextResponse.json({ error: 'id and agency_id are required' }, { status: 400 });
        }

        const result = await sql`
            DELETE FROM tags 
            WHERE id = ${parseInt(id)} AND agency_id = ${parseInt(agency_id)}
            RETURNING *
        `;

        if (result.length === 0) {
            return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Tag deleted successfully' });
    } catch (error) {
        console.error('Error deleting tag:', error);
        return NextResponse.json({ error: 'Failed to delete tag' }, { status: 500 });
    }
}
