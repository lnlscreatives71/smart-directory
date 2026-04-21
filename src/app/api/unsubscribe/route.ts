import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const lid = searchParams.get('lid');

    if (!lid || isNaN(Number(lid))) {
        return NextResponse.json({ error: 'Invalid listing ID' }, { status: 400 });
    }

    const listingId = Number(lid);

    await sql`
        UPDATE outreach_campaigns
        SET unsubscribed = TRUE, unsubscribed_at = NOW()
        WHERE listing_id = ${listingId}
          AND (unsubscribed IS NULL OR unsubscribed = FALSE)
    `;

    // Also opt out of service-push sequences so they stop sending.
    await sql`
        UPDATE saas_push_campaigns
        SET opted_out_at = NOW()
        WHERE listing_id = ${listingId}
          AND opted_out_at IS NULL
    `;
    await sql`
        UPDATE marketing_services_campaigns
        SET opted_out_at = NOW()
        WHERE listing_id = ${listingId}
          AND opted_out_at IS NULL
    `;
    await sql`
        UPDATE cold_reactivation_campaigns
        SET unsubscribed = TRUE, unsubscribed_at = NOW()
        WHERE listing_id = ${listingId}
          AND (unsubscribed IS NULL OR unsubscribed = FALSE)
    `;

    return NextResponse.json({ success: true });
}
