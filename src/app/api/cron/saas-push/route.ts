import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import {
    saasPush_email1,
    saasPush_email2,
    saasPush_email3,
    saasPush_email4,
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

        // ── EMAIL 1: What If Your Business Could Run Itself? ──────────────────
        const email1Queue = await sql`
            SELECT c.id, c.listing_id, c.contact_email, c.contact_name, l.name
            FROM saas_push_campaigns c
            JOIN listings l ON c.listing_id = l.id
            WHERE c.status = 'pending'
              AND c.opted_out_at IS NULL
        `;
        for (const c of email1Queue) {
            await sendEmail({
                to: c.contact_email as string,
                subject: `What if ${c.name} could run itself?`,
                html: saasPush_email1(c.name as string, c.contact_name as string | null),
            });
            await sql`
                UPDATE saas_push_campaigns
                SET status = 'email_1_sent', email_1_sent_at = NOW(), updated_at = NOW()
                WHERE id = ${c.id}
            `;
            await sql`UPDATE listings SET funnel_step = 1 WHERE id = ${c.listing_id}`;
            emailsSent++;
        }

        // ── EMAIL 2: How Many Leads Are You Losing? (+2 days) ────────────────
        const email2Queue = await sql`
            SELECT c.id, c.listing_id, c.contact_email, c.contact_name, l.name
            FROM saas_push_campaigns c
            JOIN listings l ON c.listing_id = l.id
            WHERE c.status = 'email_1_sent'
              AND c.opted_out_at IS NULL
              AND c.email_1_sent_at < NOW() - ${delay2}::interval
        `;
        for (const c of email2Queue) {
            await sendEmail({
                to: c.contact_email as string,
                subject: `How many leads is ${c.name} actually losing?`,
                html: saasPush_email2(c.name as string, c.contact_name as string | null),
            });
            await sql`
                UPDATE saas_push_campaigns
                SET status = 'email_2_sent', email_2_sent_at = NOW(), updated_at = NOW()
                WHERE id = ${c.id}
            `;
            await sql`UPDATE listings SET funnel_step = 2 WHERE id = ${c.listing_id}`;
            emailsSent++;
        }

        // ── EMAIL 3: Why More Local Businesses Are Using This (+2 days) ───────
        const email3Queue = await sql`
            SELECT c.id, c.listing_id, c.contact_email, c.contact_name, l.name
            FROM saas_push_campaigns c
            JOIN listings l ON c.listing_id = l.id
            WHERE c.status = 'email_2_sent'
              AND c.opted_out_at IS NULL
              AND c.email_2_sent_at < NOW() - ${delay2}::interval
        `;
        for (const c of email3Queue) {
            await sendEmail({
                to: c.contact_email as string,
                subject: `Why more local businesses are using this`,
                html: saasPush_email3(c.name as string, c.contact_name as string | null),
            });
            await sql`
                UPDATE saas_push_campaigns
                SET status = 'email_3_sent', email_3_sent_at = NOW(), updated_at = NOW()
                WHERE id = ${c.id}
            `;
            await sql`UPDATE listings SET funnel_step = 3 WHERE id = ${c.listing_id}`;
            emailsSent++;
        }

        // ── EMAIL 4: Want to Test It Out for Free? (+2 days) ─────────────────
        const email4Queue = await sql`
            SELECT c.id, c.listing_id, c.contact_email, c.contact_name, l.name
            FROM saas_push_campaigns c
            JOIN listings l ON c.listing_id = l.id
            WHERE c.status = 'email_3_sent'
              AND c.opted_out_at IS NULL
              AND c.email_3_sent_at < NOW() - ${delay2}::interval
        `;
        for (const c of email4Queue) {
            await sendEmail({
                to: c.contact_email as string,
                subject: `Want to test it out for free?`,
                html: saasPush_email4(c.name as string, c.contact_name as string | null),
            });
            await sql`
                UPDATE saas_push_campaigns
                SET status = 'email_4_sent', email_4_sent_at = NOW(), updated_at = NOW()
                WHERE id = ${c.id}
            `;
            await sql`UPDATE listings SET funnel_step = 4 WHERE id = ${c.listing_id}`;
            emailsSent++;

            // Enqueue into Marketing Services Push after final email
            await sql`
                INSERT INTO marketing_services_campaigns (listing_id, contact_email, contact_name)
                SELECT ${c.listing_id}, ${c.contact_email}, ${c.contact_name}
                WHERE NOT EXISTS (
                    SELECT 1 FROM marketing_services_campaigns
                    WHERE listing_id = ${c.listing_id}
                )
            `;
            await sql`
                UPDATE listings SET funnel_status = 'marketing_services', funnel_step = 0
                WHERE id = ${c.listing_id}
            `;
        }

        // Mark completed
        await sql`
            UPDATE saas_push_campaigns
            SET status = 'completed', completed_at = NOW(), updated_at = NOW()
            WHERE status = 'email_4_sent'
              AND email_4_sent_at < NOW() - ${delay2}::interval
        `;

        return NextResponse.json({
            success: true,
            message: `SAAS Push processed. ${emailsSent} email(s) sent.`,
            breakdown: {
                email1: email1Queue.length,
                email2: email2Queue.length,
                email3: email3Queue.length,
                email4: email4Queue.length,
            }
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('[SAAS Push Cron] Error:', err);
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
