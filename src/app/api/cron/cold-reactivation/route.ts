import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import {
    coldReactivation_email1,
    coldReactivation_email2,
    coldReactivation_email3,
    coldReactivation_email4,
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

        const reactivationDelay = forceRun ? '0 days' : '30 days';
        const emailInterval = forceRun ? '0 days' : '2 days';

        // ── ENQUEUE STEP ─────────────────────────────────────────────────────
        // Find unclaimed listings whose outreach email_4 fired 30+ days ago
        // and who aren't already in the reactivation queue.
        const enqueued = await sql`
            INSERT INTO cold_reactivation_campaigns (listing_id, contact_email, contact_name)
            SELECT o.listing_id, l.contact_email, l.contact_name
            FROM outreach_campaigns o
            JOIN listings l ON o.listing_id = l.id
            WHERE o.email_4_sent_at IS NOT NULL
              AND o.email_4_sent_at < NOW() - ${reactivationDelay}::interval
              AND l.claimed = FALSE
              AND l.contact_email IS NOT NULL
              AND (o.unsubscribed IS NULL OR o.unsubscribed = FALSE)
              AND NOT EXISTS (
                  SELECT 1 FROM cold_reactivation_campaigns r
                  WHERE r.listing_id = o.listing_id
              )
            RETURNING id
        `;

        const variantFor = (listingId: number): 'A' | 'B' => (Number(listingId) % 2 === 0 ? 'A' : 'B');
        let emailsSent = 0;

        // ── EMAIL 1: Member features + free 10-point audit incentive ────────
        const email1Queue = await sql`
            SELECT c.id, c.listing_id, c.contact_email, c.contact_name, l.name
            FROM cold_reactivation_campaigns c
            JOIN listings l ON c.listing_id = l.id
            WHERE c.status = 'pending'
              AND l.claimed = FALSE
              AND (c.unsubscribed IS NULL OR c.unsubscribed = FALSE)
        `;
        for (const c of email1Queue) {
            const v = variantFor(c.listing_id as number);
            const email = coldReactivation_email1(c.name as string, c.contact_name as string | null, c.listing_id as number, v);
            // Mark as sent BEFORE calling Resend so a timeout doesn't cause double-send.
            await sql`
                UPDATE cold_reactivation_campaigns
                SET status = 'email_1_sent', email_1_sent_at = NOW(), ab_variant = ${v}, updated_at = NOW()
                WHERE id = ${c.id}
            `;
            try {
                const { messageId } = await sendEmail({ to: c.contact_email as string, subject: email.subject, html: email.html });
                if (messageId) {
                    await sql`UPDATE cold_reactivation_campaigns SET email_1_resend_id = ${messageId} WHERE id = ${c.id}`;
                }
            } catch (e) {
                console.error(`[Cold Reactivation] Email 1 failed for campaign ${c.id}:`, e);
            }
            emailsSent++;
        }

        // ── EMAIL 2: Articles as local SEO (+2 days) ────────────────────────
        const email2Queue = await sql`
            SELECT c.id, c.listing_id, c.contact_email, c.contact_name, l.name
            FROM cold_reactivation_campaigns c
            JOIN listings l ON c.listing_id = l.id
            WHERE c.status = 'email_1_sent'
              AND l.claimed = FALSE
              AND (c.unsubscribed IS NULL OR c.unsubscribed = FALSE)
              AND c.email_1_sent_at < NOW() - ${emailInterval}::interval
        `;
        for (const c of email2Queue) {
            const v = variantFor(c.listing_id as number);
            const email = coldReactivation_email2(c.name as string, c.contact_name as string | null, c.listing_id as number, v);
            await sql`
                UPDATE cold_reactivation_campaigns
                SET status = 'email_2_sent', email_2_sent_at = NOW(), updated_at = NOW()
                WHERE id = ${c.id}
            `;
            try {
                const { messageId } = await sendEmail({ to: c.contact_email as string, subject: email.subject, html: email.html });
                if (messageId) {
                    await sql`UPDATE cold_reactivation_campaigns SET email_2_resend_id = ${messageId} WHERE id = ${c.id}`;
                }
            } catch (e) {
                console.error(`[Cold Reactivation] Email 2 failed for campaign ${c.id}:`, e);
            }
            emailsSent++;
        }

        // ── EMAIL 3: Events + Jobs (+2 days) ────────────────────────────────
        const email3Queue = await sql`
            SELECT c.id, c.listing_id, c.contact_email, c.contact_name, l.name
            FROM cold_reactivation_campaigns c
            JOIN listings l ON c.listing_id = l.id
            WHERE c.status = 'email_2_sent'
              AND l.claimed = FALSE
              AND (c.unsubscribed IS NULL OR c.unsubscribed = FALSE)
              AND c.email_2_sent_at < NOW() - ${emailInterval}::interval
        `;
        for (const c of email3Queue) {
            const v = variantFor(c.listing_id as number);
            const email = coldReactivation_email3(c.name as string, c.contact_name as string | null, c.listing_id as number, v);
            await sql`
                UPDATE cold_reactivation_campaigns
                SET status = 'email_3_sent', email_3_sent_at = NOW(), updated_at = NOW()
                WHERE id = ${c.id}
            `;
            try {
                const { messageId } = await sendEmail({ to: c.contact_email as string, subject: email.subject, html: email.html });
                if (messageId) {
                    await sql`UPDATE cold_reactivation_campaigns SET email_3_resend_id = ${messageId} WHERE id = ${c.id}`;
                }
            } catch (e) {
                console.error(`[Cold Reactivation] Email 3 failed for campaign ${c.id}:`, e);
            }
            emailsSent++;
        }

        // ── EMAIL 4: Last email / recap (+2 days) ───────────────────────────
        const email4Queue = await sql`
            SELECT c.id, c.listing_id, c.contact_email, c.contact_name, l.name
            FROM cold_reactivation_campaigns c
            JOIN listings l ON c.listing_id = l.id
            WHERE c.status = 'email_3_sent'
              AND l.claimed = FALSE
              AND (c.unsubscribed IS NULL OR c.unsubscribed = FALSE)
              AND c.email_3_sent_at < NOW() - ${emailInterval}::interval
        `;
        for (const c of email4Queue) {
            const v = variantFor(c.listing_id as number);
            const email = coldReactivation_email4(c.name as string, c.contact_name as string | null, c.listing_id as number, v);
            await sql`
                UPDATE cold_reactivation_campaigns
                SET status = 'completed', email_4_sent_at = NOW(), completed_at = NOW(), updated_at = NOW()
                WHERE id = ${c.id}
            `;
            try {
                const { messageId } = await sendEmail({ to: c.contact_email as string, subject: email.subject, html: email.html });
                if (messageId) {
                    await sql`UPDATE cold_reactivation_campaigns SET email_4_resend_id = ${messageId} WHERE id = ${c.id}`;
                }
            } catch (e) {
                console.error(`[Cold Reactivation] Email 4 failed for campaign ${c.id}:`, e);
            }
            emailsSent++;
        }

        return NextResponse.json({
            success: true,
            message: `Cold Reactivation processed. ${emailsSent} email(s) sent, ${enqueued.length} newly enqueued.`,
            enqueued: enqueued.length,
            breakdown: {
                email1: email1Queue.length,
                email2: email2Queue.length,
                email3: email3Queue.length,
                email4: email4Queue.length,
            }
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('[Cold Reactivation Cron] Error:', err);
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
