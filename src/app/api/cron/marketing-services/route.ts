import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import {
    marketingPush_email1,
    marketingPush_email2,
    marketingPush_email3,
    marketingPush_email4,
} from '@/lib/email-templates';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    return POST(request);
}

export async function POST(request: Request) {
    try {
        let forceRun = false;
        try {
            const body = await request.text();
            if (body) forceRun = JSON.parse(body)?.forceRun === true;
        } catch { }

        const delay2 = forceRun ? '0 days' : '2 days';

        let emailsSent = 0;

        // Deterministic A/B variant per listing_id — same recipient always
        // gets the same variant across the full 4-email series for clean analytics.
        const variantFor = (listingId: number): 'A' | 'B' => (Number(listingId) % 2 === 0 ? 'A' : 'B');

        // ── EMAIL 1: AEO/GEO & AI Overviews intro ───────────────────────────
        const email1Queue = await sql`
            SELECT c.id, c.listing_id, c.contact_email, c.contact_name, l.name
            FROM marketing_services_campaigns c
            JOIN listings l ON c.listing_id = l.id
            WHERE c.status = 'pending'
              AND c.opted_out_at IS NULL
        `;
        for (const c of email1Queue) {
            const v = variantFor(c.listing_id as number);
            const email = marketingPush_email1(c.name as string, c.contact_name as string | null, c.listing_id as number, v);
            await sendEmail({ to: c.contact_email as string, subject: email.subject, html: email.html });
            await sql`
                UPDATE marketing_services_campaigns
                SET status = 'email_1_sent', email_1_sent_at = NOW(), updated_at = NOW()
                WHERE id = ${c.id}
            `;
            await sql`UPDATE listings SET funnel_step = 1 WHERE id = ${c.listing_id}`;
            emailsSent++;
        }

        // ── EMAIL 2: Google Business Profile optimization (+2 days) ─────────
        const email2Queue = await sql`
            SELECT c.id, c.listing_id, c.contact_email, c.contact_name, l.name
            FROM marketing_services_campaigns c
            JOIN listings l ON c.listing_id = l.id
            WHERE c.status = 'email_1_sent'
              AND c.opted_out_at IS NULL
              AND c.email_1_sent_at < NOW() - ${delay2}::interval
        `;
        for (const c of email2Queue) {
            const v = variantFor(c.listing_id as number);
            const email = marketingPush_email2(c.name as string, c.contact_name as string | null, c.listing_id as number, v);
            await sendEmail({ to: c.contact_email as string, subject: email.subject, html: email.html });
            await sql`
                UPDATE marketing_services_campaigns
                SET status = 'email_2_sent', email_2_sent_at = NOW(), updated_at = NOW()
                WHERE id = ${c.id}
            `;
            await sql`UPDATE listings SET funnel_step = 2 WHERE id = ${c.listing_id}`;
            emailsSent++;
        }

        // ── EMAIL 3: The 3-audit diagnostic system (+2 days) ────────────────
        const email3Queue = await sql`
            SELECT c.id, c.listing_id, c.contact_email, c.contact_name, l.name
            FROM marketing_services_campaigns c
            JOIN listings l ON c.listing_id = l.id
            WHERE c.status = 'email_2_sent'
              AND c.opted_out_at IS NULL
              AND c.email_2_sent_at < NOW() - ${delay2}::interval
        `;
        for (const c of email3Queue) {
            const v = variantFor(c.listing_id as number);
            const email = marketingPush_email3(c.name as string, c.contact_name as string | null, c.listing_id as number, v);
            await sendEmail({ to: c.contact_email as string, subject: email.subject, html: email.html });
            await sql`
                UPDATE marketing_services_campaigns
                SET status = 'email_3_sent', email_3_sent_at = NOW(), updated_at = NOW()
                WHERE id = ${c.id}
            `;
            await sql`UPDATE listings SET funnel_step = 3 WHERE id = ${c.listing_id}`;
            emailsSent++;
        }

        // ── EMAIL 4: Free 3-audit offer / last email (+2 days) ──────────────
        const email4Queue = await sql`
            SELECT c.id, c.listing_id, c.contact_email, c.contact_name, l.name
            FROM marketing_services_campaigns c
            JOIN listings l ON c.listing_id = l.id
            WHERE c.status = 'email_3_sent'
              AND c.opted_out_at IS NULL
              AND c.email_3_sent_at < NOW() - ${delay2}::interval
        `;
        for (const c of email4Queue) {
            const v = variantFor(c.listing_id as number);
            const email = marketingPush_email4(c.name as string, c.contact_name as string | null, c.listing_id as number, v);
            await sendEmail({ to: c.contact_email as string, subject: email.subject, html: email.html });
            await sql`
                UPDATE marketing_services_campaigns
                SET status = 'completed', email_4_sent_at = NOW(), completed_at = NOW(), updated_at = NOW()
                WHERE id = ${c.id}
            `;
            await sql`
                UPDATE listings SET funnel_status = 'completed', funnel_step = 4
                WHERE id = ${c.listing_id}
            `;
            emailsSent++;
        }

        return NextResponse.json({
            success: true,
            message: `Marketing Services Push processed. ${emailsSent} email(s) sent.`,
            breakdown: {
                email1: email1Queue.length,
                email2: email2Queue.length,
                email3: email3Queue.length,
                email4: email4Queue.length,
            }
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('[Marketing Services Cron] Error:', err);
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
