import { sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });

    try {
        const [contact] = await sql`
            SELECT
                c.id, c.listing_id, c.status, c.pipeline_stage, c.ab_variant,
                c.email_1_sent_at, c.email_2_sent_at, c.email_3_sent_at, c.email_4_sent_at,
                c.email_1_resend_id, c.email_2_resend_id, c.email_3_resend_id, c.email_4_resend_id,
                c.opens, c.clicks, c.last_opened_at, c.last_clicked_at,
                c.created_at, c.updated_at,
                l.name AS listing_name,
                l.contact_email AS listing_email,
                l.contact_name,
                l.phone,
                l.website,
                l.street_address,
                l.zip_code,
                l.location_city,
                l.location_state,
                l.category,
                l.recommended_services,
                l.social_media,
                l.custom_fields,
                l.claimed,
                l.claim_status,
                l.image_url,
                l.description,
                l.rating,
                l.review_count,
                l.slug
            FROM outreach_campaigns c
            JOIN listings l ON c.listing_id = l.id
            WHERE c.id = ${Number(id)}
            LIMIT 1
        `;

        if (!contact) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

        const notes = await sql`
            SELECT id, content, note_type, created_at
            FROM contact_notes
            WHERE campaign_id = ${Number(id)}
            ORDER BY created_at DESC
        `;

        return NextResponse.json({ success: true, data: { ...contact, notes } });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
