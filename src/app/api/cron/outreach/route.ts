import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { getEmailSet, assignVariant, ABVariant } from '@/lib/email-templates';

export const dynamic = 'force-dynamic';

// Vercel cron hits this with GET
export async function GET(request: Request) {
    return POST(request);
}

export async function POST(request: Request) {
    try {
        let forceRun = false;
        let batchLimit = 1000; // default: send all
        try {
            const body = await request.text();
            if (body) {
                const parsed = JSON.parse(body);
                forceRun = parsed?.forceRun === true;
                if (parsed?.limit) batchLimit = parseInt(parsed.limit);
            }
        } catch { }

        // forceRun only affects Email 1 (allows immediate send regardless of timing)
        // Emails 2-4 ALWAYS respect real time intervals to prevent flooding
        const interval2Days = '7 days';
        const interval3Days = '14 days';
        const interval4Days = '21 days';

        let emailsSent = 0;

        // ── EMAIL 1: New unclaimed listings — assign A/B variant ──────────────
        const email1Queue = await sql`
            SELECT c.id, c.listing_id, l.name, l.contact_name, l.contact_email, l.claimed
            FROM outreach_campaigns c
            JOIN listings l ON c.listing_id = l.id
            WHERE c.status = 'pending'
              AND l.contact_email IS NOT NULL
              AND l.claimed = FALSE
            LIMIT ${batchLimit}
        `;

        for (const c of email1Queue) {
            const variant = assignVariant();
            const emails = getEmailSet(variant);
            const subject = typeof emails.subjects.email1 === 'function'
                ? emails.subjects.email1(c.name as string)
                : emails.subjects.email1;
            await sendEmail({
                to: c.contact_email as string,
                subject,
                html: emails.email1(c.name as string, c.contact_name as string | null, c.listing_id as number),
            });
            await sql`
                UPDATE outreach_campaigns
                SET status = 'email_1_sent', email_1_sent_at = NOW(), ab_variant = ${variant}
                WHERE id = ${c.id}
            `;
            emailsSent++;
        }

        // ── EMAIL 2: Premium upsell — use persisted variant ───────────────────
        const email2Queue = await sql`
            SELECT c.id, c.listing_id, l.name, l.contact_name, l.contact_email, c.ab_variant
            FROM outreach_campaigns c
            JOIN listings l ON c.listing_id = l.id
            WHERE c.status = 'email_1_sent'
              AND c.email_2_sent_at IS NULL
              AND l.contact_email IS NOT NULL
              AND l.claimed = FALSE
              AND c.email_1_sent_at < NOW() - ${interval2Days}::interval
        `;

        for (const c of email2Queue) {
            const variant = (c.ab_variant as ABVariant) || 'A';
            const emails = getEmailSet(variant);
            const subject = typeof emails.subjects.email2 === 'function'
                ? emails.subjects.email2(c.name as string)
                : emails.subjects.email2;
            await sendEmail({
                to: c.contact_email as string,
                subject,
                html: emails.email2(c.name as string, c.contact_name as string | null),
            });
            await sql`
                UPDATE outreach_campaigns
                SET status = 'email_2_sent', email_2_sent_at = NOW()
                WHERE id = ${c.id}
            `;
            emailsSent++;
        }

        // ── EMAIL 3: Finalization notice — use persisted variant ──────────────
        const email3Queue = await sql`
            SELECT c.id, c.listing_id, l.name, l.contact_name, l.contact_email, c.ab_variant
            FROM outreach_campaigns c
            JOIN listings l ON c.listing_id = l.id
            WHERE c.status = 'email_2_sent'
              AND c.email_3_sent_at IS NULL
              AND l.claimed = FALSE
              AND l.contact_email IS NOT NULL
              AND c.email_1_sent_at < NOW() - ${interval3Days}::interval
        `;

        for (const c of email3Queue) {
            const variant = (c.ab_variant as ABVariant) || 'A';
            const emails = getEmailSet(variant);
            const subject = typeof emails.subjects.email3 === 'function'
                ? emails.subjects.email3(c.name as string)
                : emails.subjects.email3;
            await sendEmail({
                to: c.contact_email as string,
                subject,
                html: emails.email3(c.name as string, c.contact_name as string | null, c.listing_id as number),
            });
            await sql`
                UPDATE outreach_campaigns
                SET status = 'email_3_sent', email_3_sent_at = NOW()
                WHERE id = ${c.id}
            `;
            emailsSent++;
        }

        // ── EMAIL 4: Final reminder — use persisted variant ───────────────────
        const email4Queue = await sql`
            SELECT c.id, c.listing_id, l.name, l.contact_name, l.contact_email, c.ab_variant
            FROM outreach_campaigns c
            JOIN listings l ON c.listing_id = l.id
            WHERE c.status = 'email_3_sent'
              AND c.email_4_sent_at IS NULL
              AND l.claimed = FALSE
              AND l.contact_email IS NOT NULL
              AND c.email_1_sent_at < NOW() - ${interval4Days}::interval
        `;

        for (const c of email4Queue) {
            const variant = (c.ab_variant as ABVariant) || 'A';
            const emails = getEmailSet(variant);
            const subject = typeof emails.subjects.email4 === 'function'
                ? (emails.subjects.email4 as (n: string) => string)(c.name as string)
                : emails.subjects.email4;
            await sendEmail({
                to: c.contact_email as string,
                subject,
                html: emails.email4(c.name as string, c.contact_name as string | null, c.listing_id as number),
            });
            await sql`
                UPDATE outreach_campaigns
                SET status = 'completed', email_4_sent_at = NOW()
                WHERE id = ${c.id}
            `;
            emailsSent++;
        }

        return NextResponse.json({
            success: true,
            message: `CRM Outreach processed. ${emailsSent} email(s) sent.`,
            breakdown: {
                email1: email1Queue.length,
                email2: email2Queue.length,
                email3: email3Queue.length,
                email4: email4Queue.length,
            }
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('[CRM Cron] Error:', err);
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
