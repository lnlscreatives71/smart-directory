import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

/**
 * Listing Tags API - Manage tag assignments to listings
 * 
 * GET /api/listing-tags?listing_id=X - Get all tags for a listing
 * POST /api/listing-tags - Assign a tag to a listing
 * DELETE /api/listing-tags?listing_id=X&tag_id=Y - Remove a tag from a listing
 */

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const listingId = searchParams.get('listing_id');
        const tagId = searchParams.get('tag_id');

        if (listingId) {
            // Get all tags for a specific listing
            const tags = await sql`
                SELECT t.* FROM tags t
                INNER JOIN listing_tags lt ON t.id = lt.tag_id
                WHERE lt.listing_id = ${parseInt(listingId)}
                ORDER BY t.name ASC
            `;
            return NextResponse.json({ data: tags });
        } else if (tagId) {
            // Get all listings with a specific tag
            const listings = await sql`
                SELECT l.* FROM listings l
                INNER JOIN listing_tags lt ON l.id = lt.listing_id
                WHERE lt.tag_id = ${parseInt(tagId)}
                AND l.agency_id = (SELECT agency_id FROM tags WHERE id = ${parseInt(tagId)})
            `;
            return NextResponse.json({ data: listings });
        }

        return NextResponse.json({ error: 'listing_id or tag_id is required' }, { status: 400 });
    } catch (error) {
        console.error('Error fetching listing tags:', error);
        return NextResponse.json({ error: 'Failed to fetch listing tags' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { listing_id, tag_id } = body;

        if (!listing_id || !tag_id) {
            return NextResponse.json({ error: 'listing_id and tag_id are required' }, { status: 400 });
        }

        // Verify the listing and tag exist
        const listing = await sql`SELECT id, agency_id FROM listings WHERE id = ${parseInt(listing_id)}`;
        if (listing.length === 0) {
            return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
        }

        const tag = await sql`SELECT id, agency_id FROM tags WHERE id = ${parseInt(tag_id)}`;
        if (tag.length === 0) {
            return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
        }

        // Verify they belong to the same agency
        if (listing[0].agency_id !== tag[0].agency_id) {
            return NextResponse.json({ error: 'Listing and tag must belong to the same agency' }, { status: 400 });
        }

        // Check if already assigned
        const existing = await sql`
            SELECT id FROM listing_tags 
            WHERE listing_id = ${parseInt(listing_id)} AND tag_id = ${parseInt(tag_id)}
        `;

        if (existing.length > 0) {
            return NextResponse.json({ error: 'Tag already assigned to this listing' }, { status: 409 });
        }

        const result = await sql`
            INSERT INTO listing_tags (listing_id, tag_id)
            VALUES (${parseInt(listing_id)}, ${parseInt(tag_id)})
            RETURNING *
        `;

        return NextResponse.json({ data: result[0], message: 'Tag assigned successfully' });
    } catch (error) {
        console.error('Error assigning tag:', error);
        return NextResponse.json({ error: 'Failed to assign tag' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const listing_id = searchParams.get('listing_id');
        const tag_id = searchParams.get('tag_id');

        if (!listing_id || !tag_id) {
            return NextResponse.json({ error: 'listing_id and tag_id are required' }, { status: 400 });
        }

        const result = await sql`
            DELETE FROM listing_tags 
            WHERE listing_id = ${parseInt(listing_id)} AND tag_id = ${parseInt(tag_id)}
            RETURNING *
        `;

        if (result.length === 0) {
            return NextResponse.json({ error: 'Tag assignment not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Tag removed successfully' });
    } catch (error) {
        console.error('Error removing tag:', error);
        return NextResponse.json({ error: 'Failed to remove tag' }, { status: 500 });
    }
}
