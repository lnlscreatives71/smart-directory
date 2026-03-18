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

        // ── EMAIL 1: Your Website Might Be Costing You Customers ─────────────
        const email1Queue = await sql`
            SELECT c.id, c.contact_email, c.contact_name, l.name
            FROM marketing_services_campaigns c
            JOIN listings l ON c.listing_id = l.id
            WHERE c.status = 'pending'
              AND c.opted_out_at IS NULL
        `;
        for (const c of email1Queue) {
            await sendEmail({
                to: c.contact_email as string,
                subject: `Is your website costing you customers?`,
                html: marketingPush_email1(c.name as string, c.contact_name as string | null),
            });
            await sql`
                UPDATE marketing_services_campaigns
                SET status = 'email_1_sent', email_1_sent_at = NOW(), updated_at = NOW()
                WHERE id = ${c.id}
            `;
            emailsSent++;
        }

        // ── EMAIL 2: Want to Show Up First on Google? (+2 days) ──────────────
        const email2Queue = await sql`
            SELECT c.id, c.contact_email, c.contact_name, l.name
            FROM marketing_services_campaigns c
            JOIN listings l ON c.listing_id = l.id
            WHERE c.status = 'email_1_sent'
              AND c.opted_out_at IS NULL
              AND c.email_1_sent_at < NOW() - ${delay2}::interval
        `;
        for (const c of email2Queue) {
            await sendEmail({
                to: c.contact_email as string,
                subject: `Want ${c.name} to show up first on Google?`,
                html: marketingPush_email2(c.name as string, c.contact_name as string | null),
            });
            await sql`
                UPDATE marketing_services_campaigns
                SET status = 'email_2_sent', email_2_sent_at = NOW(), updated_at = NOW()
                WHERE id = ${c.id}
            `;
            emailsSent++;
        }

        // ── EMAIL 3: Get More Leads Instantly with Google Ads (+2 days) ──────
        const email3Queue = await sql`
            SELECT c.id, c.contact_email, c.contact_name, l.name
            FROM marketing_services_campaigns c
            JOIN listings l ON c.listing_id = l.id
            WHERE c.status = 'email_2_sent'
              AND c.opted_out_at IS NULL
              AND c.email_2_sent_at < NOW() - ${delay2}::interval
        `;
        for (const c of email3Queue) {
            await sendEmail({
                to: c.contact_email as string,
                subject: `Get more leads instantly with Google Ads`,
                html: marketingPush_email3(c.name as string, c.contact_name as string | null),
            });
            await sql`
                UPDATE marketing_services_campaigns
                SET status = 'email_3_sent', email_3_sent_at = NOW(), updated_at = NOW()
                WHERE id = ${c.id}
            `;
            emailsSent++;
        }

        // ── EMAIL 4: Let's Make a Plan for Your Business Growth (+2 days) ────
        const email4Queue = await sql`
            SELECT c.id, c.contact_email, c.contact_name, l.name
            FROM marketing_services_campaigns c
            JOIN listings l ON c.listing_id = l.id
            WHERE c.status = 'email_3_sent'
              AND c.opted_out_at IS NULL
              AND c.email_3_sent_at < NOW() - ${delay2}::interval
        `;
        for (const c of email4Queue) {
            await sendEmail({
                to: c.contact_email as string,
                subject: `Let's make a growth plan for ${c.name}`,
                html: marketingPush_email4(c.name as string, c.contact_name as string | null),
            });
            await sql`
                UPDATE marketing_services_campaigns
                SET status = 'completed', email_4_sent_at = NOW(), completed_at = NOW(), updated_at = NOW()
                WHERE id = ${c.id}
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
