import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET reviews for a listing
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const listingId = searchParams.get('listing_id');
        
        if (!listingId) {
            return NextResponse.json({ success: false, error: 'listing_id required' }, { status: 400 });
        }
        
        const reviews = await sql`
            SELECT * FROM reviews 
            WHERE listing_id = ${parseInt(listingId)} 
            ORDER BY created_at DESC
        `;
        
        return NextResponse.json({ success: true, data: reviews });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}

// POST a new review
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { listing_id, author_name, rating, comment } = body;
        
        if (!listing_id || !author_name || !rating) {
            return NextResponse.json({ 
                success: false, 
                error: 'Missing required fields: listing_id, author_name, rating' 
            }, { status: 400 });
        }
        
        const safeRating = Math.min(5, Math.max(1, parseInt(rating)));
        
        const inserted = await sql`
            INSERT INTO reviews (listing_id, author_name, rating, comment)
            VALUES (${parseInt(listing_id)}, ${author_name}, ${safeRating}, ${comment || null})
            RETURNING *
        `;
        
        return NextResponse.json({ success: true, data: inserted[0] });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}

// DELETE a review (admin only)
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        
        if (!id) {
            return NextResponse.json({ success: false, error: 'id required' }, { status: 400 });
        }
        
        await sql`DELETE FROM reviews WHERE id = ${parseInt(id)}`;
        
        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
