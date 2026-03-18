import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import {
    premiumUpgrade_email1,
    premiumUpgrade_email2,
    premiumUpgrade_email3,
    premiumUpgrade_email4,
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

        // ── EMAIL 1: Your Listing is Live — send immediately on entry ─────────
        const email1Queue = await sql`
            SELECT c.id, c.listing_id, c.contact_email, c.contact_name, l.name, l.plan_id
            FROM premium_upgrade_campaigns c
            JOIN listings l ON c.listing_id = l.id
            WHERE c.status = 'pending'
              AND l.plan_id = 1
              AND c.opted_out_at IS NULL
        `;
        for (const c of email1Queue) {
            await sendEmail({
                to: c.contact_email as string,
                subject: `Your listing is live — here's how to get more leads`,
                html: premiumUpgrade_email1(c.name as string, c.contact_name as string | null),
            });
            await sql`
                UPDATE premium_upgrade_campaigns
                SET status = 'email_1_sent', email_1_sent_at = NOW(), updated_at = NOW()
                WHERE id = ${c.id}
            `;
            emailsSent++;
        }

        // ── EMAIL 2: Why Premium Listings Get More Attention (+2 days) ────────
        const email2Queue = await sql`
            SELECT c.id, c.contact_email, c.contact_name, l.name, l.plan_id
            FROM premium_upgrade_campaigns c
            JOIN listings l ON c.listing_id = l.id
            WHERE c.status = 'email_1_sent'
              AND l.plan_id = 1
              AND c.opted_out_at IS NULL
              AND c.email_1_sent_at < NOW() - ${delay2}::interval
        `;
        for (const c of email2Queue) {
            await sendEmail({
                to: c.contact_email as string,
                subject: `Why Premium listings get more attention`,
                html: premiumUpgrade_email2(c.name as string, c.contact_name as string | null),
            });
            await sql`
                UPDATE premium_upgrade_campaigns
                SET status = 'email_2_sent', email_2_sent_at = NOW(), updated_at = NOW()
                WHERE id = ${c.id}
            `;
            emailsSent++;
        }

        // ── EMAIL 3: More Visibility. More Control. (+2 days after E2) ────────
        const email3Queue = await sql`
            SELECT c.id, c.contact_email, c.contact_name, l.name, l.plan_id
            FROM premium_upgrade_campaigns c
            JOIN listings l ON c.listing_id = l.id
            WHERE c.status = 'email_2_sent'
              AND l.plan_id = 1
              AND c.opted_out_at IS NULL
              AND c.email_2_sent_at < NOW() - ${delay2}::interval
        `;
        for (const c of email3Queue) {
            await sendEmail({
                to: c.contact_email as string,
                subject: `More visibility. More control. Here's what Premium unlocks.`,
                html: premiumUpgrade_email3(c.name as string, c.contact_name as string | null),
            });
            await sql`
                UPDATE premium_upgrade_campaigns
                SET status = 'email_3_sent', email_3_sent_at = NOW(), updated_at = NOW()
                WHERE id = ${c.id}
            `;
            emailsSent++;
        }

        // ── EMAIL 4: Want to Do More With Your Listing? (+2 days after E3) ───
        const email4Queue = await sql`
            SELECT c.id, c.contact_email, c.contact_name, l.name, l.plan_id
            FROM premium_upgrade_campaigns c
            JOIN listings l ON c.listing_id = l.id
            WHERE c.status = 'email_3_sent'
              AND l.plan_id = 1
              AND c.opted_out_at IS NULL
              AND c.email_3_sent_at < NOW() - ${delay2}::interval
        `;
        for (const c of email4Queue) {
            await sendEmail({
                to: c.contact_email as string,
                subject: `Want to do more with your listing?`,
                html: premiumUpgrade_email4(c.name as string, c.contact_name as string | null),
            });
            await sql`
                UPDATE premium_upgrade_campaigns
                SET status = 'email_4_sent', email_4_sent_at = NOW(), updated_at = NOW()
                WHERE id = ${c.id}
            `;
            emailsSent++;
        }

        // ── Auto-mark converted if listing upgraded to premium ────────────────
        await sql`
            UPDATE premium_upgrade_campaigns c
            SET status = 'converted', converted_at = NOW(), updated_at = NOW()
            FROM listings l
            WHERE c.listing_id = l.id
              AND l.plan_id != 1
              AND c.status NOT IN ('converted', 'opted_out')
        `;

        return NextResponse.json({
            success: true,
            message: `Premium Upgrade Push processed. ${emailsSent} email(s) sent.`,
            breakdown: {
                email1: email1Queue.length,
                email2: email2Queue.length,
                email3: email3Queue.length,
                email4: email4Queue.length,
            }
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('[Premium Upsell Cron] Error:', err);
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
