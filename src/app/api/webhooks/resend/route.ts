import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Resend sends a svix-signature header for verification.
// We'll validate it if RESEND_WEBHOOK_SECRET is set.
export async function POST(request: Request) {
    try {
        const body = await request.text();
        const secret = process.env.RESEND_WEBHOOK_SECRET;

        // Signature verification (optional but recommended)
        if (secret) {
            const { Webhook } = await import('svix');
            const wh = new Webhook(secret);
            const headers = {
                'svix-id': request.headers.get('svix-id') || '',
                'svix-timestamp': request.headers.get('svix-timestamp') || '',
                'svix-signature': request.headers.get('svix-signature') || '',
            };
            try {
                wh.verify(body, headers);
            } catch {
                return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
            }
        }

        const event = JSON.parse(body);
        const type: string = event?.type;
        const emailId: string = event?.data?.email_id;

        if (!emailId) {
            return NextResponse.json({ ok: true }); // ignore events without email_id
        }

        if (type === 'email.opened') {
            // Find which step this messageId belongs to and record the open
            await sql`
                UPDATE outreach_campaigns
                SET opens = opens + 1,
                    last_opened_at = NOW()
                WHERE email_1_resend_id = ${emailId}
                   OR email_2_resend_id = ${emailId}
                   OR email_3_resend_id = ${emailId}
                   OR email_4_resend_id = ${emailId}
            `;
        } else if (type === 'email.clicked') {
            await sql`
                UPDATE outreach_campaigns
                SET clicks = clicks + 1,
                    last_clicked_at = NOW()
                WHERE email_1_resend_id = ${emailId}
                   OR email_2_resend_id = ${emailId}
                   OR email_3_resend_id = ${emailId}
                   OR email_4_resend_id = ${emailId}
            `;
        }

        return NextResponse.json({ ok: true });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('[Resend Webhook] Error:', err);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
