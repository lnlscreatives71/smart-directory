import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get('listingId');
    
    try {
        let news = [];
        if (listingId) {
            news = await sql`
                SELECT n.*, l.name as listing_name 
                FROM news n
                JOIN listings l ON l.id = n.listing_id
                WHERE n.listing_id = ${Number(listingId)}
                ORDER BY n.created_at DESC
            `;
        } else {
            news = await sql`
                SELECT n.*, l.name as listing_name 
                FROM news n
                JOIN listings l ON l.id = n.listing_id
                ORDER BY n.created_at DESC
            `;
        }
        return NextResponse.json({ success: true, data: news });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { listing_id, title, content, image_url } = body;

        if (!listing_id || !title || !content) {
            return NextResponse.json({ success: false, error: 'Listing ID, Title, and Content are required' }, { status: 400 });
        }

        const res = await sql`
            INSERT INTO news (listing_id, title, content, image_url)
            VALUES (${listing_id}, ${title}, ${content}, ${image_url || ''})
            RETURNING *;
        `;
        return NextResponse.json({ success: true, data: res[0] });
    } catch (err: any) {
        console.error('Error creating news:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
