import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const campaigns = await sql`
      SELECT c.*, l.name as listing_name, l.contact_email as listing_email, l.claimed 
      FROM outreach_campaigns c
      JOIN listings l ON c.listing_id = l.id
      ORDER BY c.updated_at DESC
    `;
        return NextResponse.json({ success: true, data: campaigns });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
