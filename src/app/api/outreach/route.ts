import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    if (!user || user.role !== 'admin') {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const status = url.searchParams.get('status') || 'all';
    const search = url.searchParams.get('search') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = 50;
    const offset = (page - 1) * limit;

    // Stats
    const [stats] = await sql`
        SELECT
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE c.status = 'pending') as queued,
            COUNT(*) FILTER (WHERE c.status = 'email_1_sent') as email1,
            COUNT(*) FILTER (WHERE c.status = 'email_2_sent') as email2,
            COUNT(*) FILTER (WHERE c.status = 'email_3_sent') as email3,
            COUNT(*) FILTER (WHERE c.status = 'email_4_sent') as email4,
            COUNT(*) FILTER (WHERE c.status = 'completed') as completed,
            COUNT(*) FILTER (WHERE c.unsubscribed = TRUE) as unsubscribed,
            COALESCE(SUM(c.opens), 0) as total_opens,
            COALESCE(SUM(c.clicks), 0) as total_clicks,
            COUNT(*) FILTER (WHERE c.opens > 0) as unique_openers,
            COUNT(*) FILTER (WHERE c.status != 'pending') as total_emailed,
            COUNT(*) FILTER (WHERE c.email_1_sent_at::date = CURRENT_DATE
                OR c.email_2_sent_at::date = CURRENT_DATE
                OR c.email_3_sent_at::date = CURRENT_DATE
                OR c.email_4_sent_at::date = CURRENT_DATE) as sent_today
        FROM outreach_campaigns c
        JOIN listings l ON c.listing_id = l.id
    `;

    // Campaign list
    const whereStatus = status === 'all' ? sql`TRUE` : sql`c.status = ${status}`;
    const whereSearch = search
        ? sql`AND (l.name ILIKE ${'%' + search + '%'} OR l.contact_email ILIKE ${'%' + search + '%'})`
        : sql``;

    const campaigns = await sql`
        SELECT
            c.id, c.listing_id, c.status, c.ab_variant,
            c.email_1_sent_at, c.email_2_sent_at, c.email_3_sent_at, c.email_4_sent_at,
            c.opens, c.clicks, c.last_opened_at, c.last_clicked_at,
            c.email_1_resend_id,
            l.name, l.contact_email, l.contact_name, l.category, l.claimed
        FROM outreach_campaigns c
        JOIN listings l ON c.listing_id = l.id
        WHERE ${whereStatus} ${whereSearch}
        ORDER BY
            CASE c.status
                WHEN 'email_4_sent' THEN 1
                WHEN 'email_3_sent' THEN 2
                WHEN 'email_2_sent' THEN 3
                WHEN 'email_1_sent' THEN 4
                WHEN 'pending' THEN 5
                WHEN 'completed' THEN 6
                ELSE 7
            END,
            GREATEST(
                COALESCE(c.email_4_sent_at, '1970-01-01'),
                COALESCE(c.email_3_sent_at, '1970-01-01'),
                COALESCE(c.email_2_sent_at, '1970-01-01'),
                COALESCE(c.email_1_sent_at, '1970-01-01')
            ) DESC
        LIMIT ${limit} OFFSET ${offset}
    `;

    const [{ count }] = await sql`
        SELECT COUNT(*) as count
        FROM outreach_campaigns c
        JOIN listings l ON c.listing_id = l.id
        WHERE ${whereStatus} ${whereSearch}
    `;

    return NextResponse.json({ success: true, stats, campaigns, total: Number(count), page, limit });
}

// PATCH — update a single campaign status (reset, skip, mark bounced)
export async function PATCH(request: Request) {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    if (!user || user.role !== 'admin') {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id, action } = await request.json();

    if (action === 'reset') {
        await sql`
            UPDATE outreach_campaigns
            SET status = 'pending', email_1_sent_at = NULL, email_2_sent_at = NULL,
                email_3_sent_at = NULL, email_4_sent_at = NULL,
                email_1_resend_id = NULL, email_2_resend_id = NULL,
                email_3_resend_id = NULL, email_4_resend_id = NULL,
                opens = 0, clicks = 0, last_opened_at = NULL, last_clicked_at = NULL
            WHERE id = ${id}
        `;
    } else if (action === 'skip') {
        // Advance to next step
        const [c] = await sql`SELECT status FROM outreach_campaigns WHERE id = ${id}`;
        const next: Record<string, string> = {
            pending: 'email_1_sent',
            email_1_sent: 'email_2_sent',
            email_2_sent: 'email_3_sent',
            email_3_sent: 'completed',
        };
        const nextStatus = next[c.status] || 'completed';
        await sql`UPDATE outreach_campaigns SET status = ${nextStatus}, updated_at = NOW() WHERE id = ${id}`;
    } else if (action === 'complete') {
        await sql`UPDATE outreach_campaigns SET status = 'completed' WHERE id = ${id}`;
    } else if (action === 'bounce') {
        await sql`UPDATE outreach_campaigns SET status = 'completed' WHERE id = ${id}`;
        const [c] = await sql`SELECT listing_id FROM outreach_campaigns WHERE id = ${id}`;
        await sql`UPDATE listings SET contact_email = NULL WHERE id = ${c.listing_id}`;
    }

    return NextResponse.json({ success: true });
}
