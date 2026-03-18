import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const campaigns = await sql`
            SELECT 
                c.id, c.listing_id, c.status, c.pipeline_stage, c.ab_variant,
                c.email_1_sent_at, c.email_2_sent_at, c.email_3_sent_at, c.email_4_sent_at,
                c.created_at, c.updated_at,
                l.name AS listing_name,
                l.contact_email AS listing_email,
                l.claimed
            FROM outreach_campaigns c
            JOIN listings l ON c.listing_id = l.id
            WHERE l.claimed = false
            ORDER BY c.updated_at DESC
        `;
        return NextResponse.json({ success: true, data: campaigns });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
