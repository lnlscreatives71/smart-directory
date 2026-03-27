import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Overall totals
        const totals = await sql`
            SELECT
                COUNT(*) AS total_contacts,
                COUNT(*) FILTER (WHERE status != 'pending') AS total_sent,
                SUM(opens) AS total_opens,
                SUM(clicks) AS total_clicks,
                COUNT(*) FILTER (WHERE opens > 0) AS contacts_opened,
                COUNT(*) FILTER (WHERE clicks > 0) AS contacts_clicked,
                COUNT(*) FILTER (WHERE status = 'completed') AS completed,
                COUNT(*) FILTER (WHERE status = 'pending') AS pending
            FROM outreach_campaigns c
            JOIN listings l ON c.listing_id = l.id
            WHERE (l.claimed = FALSE OR l.claimed IS NULL)
        `;

        // A/B variant breakdown
        const abStats = await sql`
            SELECT
                ab_variant,
                COUNT(*) AS sent,
                SUM(opens) AS opens,
                SUM(clicks) AS clicks,
                COUNT(*) FILTER (WHERE opens > 0) AS unique_opens,
                COUNT(*) FILTER (WHERE clicks > 0) AS unique_clicks
            FROM outreach_campaigns c
            JOIN listings l ON c.listing_id = l.id
            WHERE ab_variant IS NOT NULL
              AND (l.claimed = FALSE OR l.claimed IS NULL)
            GROUP BY ab_variant
            ORDER BY ab_variant
        `;

        // Per email step breakdown
        const stepStats = await sql`
            SELECT
                COUNT(*) FILTER (WHERE email_1_sent_at IS NOT NULL) AS email1_sent,
                COUNT(*) FILTER (WHERE email_2_sent_at IS NOT NULL) AS email2_sent,
                COUNT(*) FILTER (WHERE email_3_sent_at IS NOT NULL) AS email3_sent,
                COUNT(*) FILTER (WHERE email_4_sent_at IS NOT NULL) AS email4_sent,
                COUNT(*) FILTER (WHERE email_1_resend_id IS NOT NULL AND opens > 0) AS email1_opened,
                COUNT(*) FILTER (WHERE email_2_resend_id IS NOT NULL AND opens > 0) AS email2_opened,
                COUNT(*) FILTER (WHERE email_3_resend_id IS NOT NULL AND opens > 0) AS email3_opened,
                COUNT(*) FILTER (WHERE email_4_resend_id IS NOT NULL AND opens > 0) AS email4_opened,
                COUNT(*) FILTER (WHERE email_1_resend_id IS NOT NULL AND clicks > 0) AS email1_clicked,
                COUNT(*) FILTER (WHERE email_2_resend_id IS NOT NULL AND clicks > 0) AS email2_clicked,
                COUNT(*) FILTER (WHERE email_3_resend_id IS NOT NULL AND clicks > 0) AS email3_clicked,
                COUNT(*) FILTER (WHERE email_4_resend_id IS NOT NULL AND clicks > 0) AS email4_clicked
            FROM outreach_campaigns c
            JOIN listings l ON c.listing_id = l.id
            WHERE (l.claimed = FALSE OR l.claimed IS NULL)
        `;

        // Daily sends over last 14 days
        const dailySends = await sql`
            SELECT
                DATE(email_1_sent_at) AS day,
                COUNT(*) AS sent,
                COUNT(*) FILTER (WHERE opens > 0) AS opened,
                COUNT(*) FILTER (WHERE clicks > 0) AS clicked
            FROM outreach_campaigns c
            JOIN listings l ON c.listing_id = l.id
            WHERE email_1_sent_at > NOW() - INTERVAL '14 days'
              AND (l.claimed = FALSE OR l.claimed IS NULL)
            GROUP BY DATE(email_1_sent_at)
            ORDER BY day ASC
        `;

        return NextResponse.json({
            success: true,
            data: {
                totals: totals[0],
                abStats,
                stepStats: stepStats[0],
                dailySends,
            }
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
