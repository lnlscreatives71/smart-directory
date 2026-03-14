import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get('listingId');
    
    try {
        let bookings = [];
        if (listingId) {
            bookings = await sql`
                SELECT b.*, l.name as listing_name 
                FROM bookings b
                JOIN listings l ON l.id = b.listing_id
                WHERE b.listing_id = ${Number(listingId)}
                ORDER BY b.booking_date DESC, b.booking_time DESC
            `;
        } else {
            bookings = await sql`
                SELECT b.*, l.name as listing_name 
                FROM bookings b
                JOIN listings l ON l.id = b.listing_id
                ORDER BY b.booking_date DESC, b.booking_time DESC
            `;
        }
        return NextResponse.json({ success: true, data: bookings });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { listing_id, customer_name, customer_email, customer_phone, service_requested, booking_date, booking_time, notes } = body;

        if (!listing_id || !customer_name || !customer_email || !booking_date || !booking_time) {
            return NextResponse.json({ success: false, error: 'Listing ID, Name, Email, Date, and Time are required' }, { status: 400 });
        }

        const res = await sql`
            INSERT INTO bookings (listing_id, customer_name, customer_email, customer_phone, service_requested, booking_date, booking_time, notes)
            VALUES (${listing_id}, ${customer_name}, ${customer_email}, ${customer_phone || ''}, ${service_requested || ''}, ${booking_date}, ${booking_time}, ${notes || ''})
            RETURNING *;
        `;
        return NextResponse.json({ success: true, data: res[0] });
    } catch (err: any) {
        console.error('Error creating booking:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
