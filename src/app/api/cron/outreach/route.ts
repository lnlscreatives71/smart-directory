import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import {
    email1_notification,
    email2_upsell,
    email3_finalization,
    email4_finalReminder,
} from '@/lib/email-templates';

export const dynamic = 'force-dynamic';

// Vercel cron hits this with GET
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

        const intervalDays = forceRun ? '0 days' : '3 days';
        const interval2Days = forceRun ? '0 days' : '7 days';
        const interval3Days = forceRun ? '0 days' : '10 days';

        let emailsSent = 0;

        // ── EMAIL 1: New unclaimed listings (no email sent yet) ───────────────
        const email1Queue = await sql`
            SELECT c.id, c.listing_id, l.name, l.contact_name, l.contact_email, l.claimed
            FROM outreach_campaigns c
            JOIN listings l ON c.listing_id = l.id
            WHERE c.status = 'pending'
              AND l.contact_email IS NOT NULL
              AND l.claimed = FALSE
        `;

        for (const c of email1Queue) {
            await sendEmail({
                to: c.contact_email as string,
                subject: `${c.name} is now live on The Triangle Hub!`,
                html: email1_notification(c.name as string, c.contact_name as string | null, c.listing_id as number),
            });
            await sql`
                UPDATE outreach_campaigns
                SET status = 'email_1_sent', email_1_sent_at = NOW()
                WHERE id = ${c.id}
            `;
            emailsSent++;
        }

        // ── EMAIL 2: Premium upsell (~3 days after email 1, to unclaimed) ────
        const email2Queue = await sql`
            SELECT c.id, c.listing_id, l.name, l.contact_name, l.contact_email
            FROM outreach_campaigns c
            JOIN listings l ON c.listing_id = l.id
            WHERE c.status = 'email_1_sent'
              AND c.email_2_sent_at IS NULL
              AND l.contact_email IS NOT NULL
              AND c.email_1_sent_at < NOW() - ${intervalDays}::interval
        `;

        for (const c of email2Queue) {
            await sendEmail({
                to: c.contact_email as string,
                subject: `Upgrade ${c.name} and get 4x more leads`,
                html: email2_upsell(c.name as string, c.contact_name as string | null),
            });
            await sql`
                UPDATE outreach_campaigns
                SET status = 'email_2_sent', email_2_sent_at = NOW()
                WHERE id = ${c.id}
            `;
            emailsSent++;
        }

        // ── EMAIL 3: Finalization notice (~7 days after email 1, still unclaimed) ─
        const email3Queue = await sql`
            SELECT c.id, c.listing_id, l.name, l.contact_name, l.contact_email
            FROM outreach_campaigns c
            JOIN listings l ON c.listing_id = l.id
            WHERE c.status = 'email_2_sent'
              AND c.email_3_sent_at IS NULL
              AND l.claimed = FALSE
              AND l.contact_email IS NOT NULL
              AND c.email_1_sent_at < NOW() - ${interval2Days}::interval
        `;

        for (const c of email3Queue) {
            await sendEmail({
                to: c.contact_email as string,
                subject: `Action needed: Confirm your ${c.name} listing`,
                html: email3_finalization(c.name as string, c.contact_name as string | null, c.listing_id as number),
            });
            await sql`
                UPDATE outreach_campaigns
                SET status = 'email_3_sent', email_3_sent_at = NOW()
                WHERE id = ${c.id}
            `;
            emailsSent++;
        }

        // ── EMAIL 4: Final reminder (~10 days, last call) ─────────────────────
        const email4Queue = await sql`
            SELECT c.id, c.listing_id, l.name, l.contact_name, l.contact_email
            FROM outreach_campaigns c
            JOIN listings l ON c.listing_id = l.id
            WHERE c.status = 'email_3_sent'
              AND c.email_4_sent_at IS NULL
              AND l.claimed = FALSE
              AND l.contact_email IS NOT NULL
              AND c.email_1_sent_at < NOW() - ${interval3Days}::interval
        `;

        for (const c of email4Queue) {
            await sendEmail({
                to: c.contact_email as string,
                subject: `Last chance: Don't miss your spot on The Triangle Hub`,
                html: email4_finalReminder(c.name as string, c.contact_name as string | null, c.listing_id as number),
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
