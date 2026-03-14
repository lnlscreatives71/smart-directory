import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get('listingId');
    
    try {
        let jobs = [];
        if (listingId) {
            jobs = await sql`
                SELECT j.*, l.name as listing_name 
                FROM jobs j
                JOIN listings l ON l.id = j.listing_id
                WHERE j.listing_id = ${Number(listingId)}
                ORDER BY j.created_at DESC
            `;
        } else {
            jobs = await sql`
                SELECT j.*, l.name as listing_name 
                FROM jobs j
                JOIN listings l ON l.id = j.listing_id
                ORDER BY j.created_at DESC
            `;
        }
        return NextResponse.json({ success: true, data: jobs });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { listing_id, title, description, employment_type, location, salary_range, application_url, active } = body;

        if (!listing_id || !title || !description) {
            return NextResponse.json({ success: false, error: 'Listing ID, Title, and Description are required' }, { status: 400 });
        }

        const res = await sql`
            INSERT INTO jobs (listing_id, title, description, employment_type, location, salary_range, application_url, active)
            VALUES (${listing_id}, ${title}, ${description}, ${employment_type || 'Full-Time'}, ${location || ''}, ${salary_range || ''}, ${application_url || ''}, ${active !== false})
            RETURNING *;
        `;
        return NextResponse.json({ success: true, data: res[0] });
    } catch (err: any) {
        console.error('Error creating job:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
