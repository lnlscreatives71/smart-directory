import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get('listingId');
    
    try {
        let blogs = [];
        if (listingId) {
            blogs = await sql`
                SELECT b.*, l.name as listing_name 
                FROM blogs b
                JOIN listings l ON l.id = b.listing_id
                WHERE b.listing_id = ${Number(listingId)}
                ORDER BY b.created_at DESC
            `;
        } else {
            blogs = await sql`
                SELECT b.*, l.name as listing_name 
                FROM blogs b
                JOIN listings l ON l.id = b.listing_id
                ORDER BY b.created_at DESC
            `;
        }
        return NextResponse.json({ success: true, data: blogs });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { listing_id, title, excerpt, content, image_url, published } = body;

        if (!listing_id || !title || !content) {
            return NextResponse.json({ success: false, error: 'Listing ID, Title, and Content are required' }, { status: 400 });
        }

        const res = await sql`
            INSERT INTO blogs (listing_id, title, excerpt, content, image_url, published)
            VALUES (${listing_id}, ${title}, ${excerpt || ''}, ${content}, ${image_url || ''}, ${published !== false})
            RETURNING *;
        `;
        return NextResponse.json({ success: true, data: res[0] });
    } catch (err: any) {
        console.error('Error creating blog:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
