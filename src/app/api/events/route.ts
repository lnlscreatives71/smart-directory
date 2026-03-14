import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get('listingId');
    
    try {
        let events = [];
        if (listingId) {
            events = await sql`
                SELECT e.*, l.name as listing_name 
                FROM events e
                JOIN listings l ON l.id = e.listing_id
                WHERE e.listing_id = ${Number(listingId)}
                ORDER BY e.date DESC
            `;
        } else {
            events = await sql`
                SELECT e.*, l.name as listing_name 
                FROM events e
                JOIN listings l ON l.id = e.listing_id
                ORDER BY e.date DESC
            `;
        }
        return NextResponse.json({ success: true, data: events });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { listing_id, title, description, date, time, location } = body;

        if (!listing_id || !title || !date) {
            return NextResponse.json({ success: false, error: 'Listing ID, Title and Date are required' }, { status: 400 });
        }

        const res = await sql`
            INSERT INTO events (listing_id, title, description, date, time, location)
            VALUES (${listing_id}, ${title}, ${description || ''}, ${date}, ${time || ''}, ${location || ''})
            RETURNING *;
        `;
        return NextResponse.json({ success: true, data: res[0] });
    } catch (err: any) {
        console.error('Error creating event:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
