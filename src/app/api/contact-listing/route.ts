import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const { listingId, name, phone, email, message } = await request.json();

        if (!listingId || !name || !message) {
            return NextResponse.json({ success: false, error: 'Missing required fields.' }, { status: 400 });
        }

        const rows = await sql`
            SELECT l.name, l.contact_email, l.feature_flags, p.name as plan_name
            FROM listings l
            LEFT JOIN plans p ON l.plan_id = p.id
            WHERE l.id = ${listingId} AND l.active = TRUE
            LIMIT 1
        `;

        if (rows.length === 0) {
            return NextResponse.json({ success: false, error: 'Listing not found.' }, { status: 404 });
        }

        const listing = rows[0];
        const flags = (listing.feature_flags as Record<string, boolean>) || {};

        if (!flags.contact_form) {
            return NextResponse.json({ success: false, error: 'Contact form not available for this listing.' }, { status: 403 });
        }

        if (!listing.contact_email) {
            return NextResponse.json({ success: false, error: 'This business has no contact email on file.' }, { status: 400 });
        }

        await sendEmail({
            to: listing.contact_email as string,
            replyTo: email || undefined,
            subject: `New inquiry from ${name} via The Triangle Hub`,
            html: `
                <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
                    <h2 style="margin:0 0 16px;">New Contact Form Inquiry</h2>
                    <p style="color:#555;">Someone reached out to <strong>${listing.name}</strong> through your directory listing.</p>
                    <table style="width:100%;border-collapse:collapse;margin:24px 0;">
                        <tr><td style="padding:10px;border-bottom:1px solid #eee;font-weight:bold;width:120px;">Name</td><td style="padding:10px;border-bottom:1px solid #eee;">${name}</td></tr>
                        ${phone ? `<tr><td style="padding:10px;border-bottom:1px solid #eee;font-weight:bold;">Phone</td><td style="padding:10px;border-bottom:1px solid #eee;">${phone}</td></tr>` : ''}
                        ${email ? `<tr><td style="padding:10px;border-bottom:1px solid #eee;font-weight:bold;">Email</td><td style="padding:10px;border-bottom:1px solid #eee;">${email}</td></tr>` : ''}
                        <tr><td style="padding:10px;font-weight:bold;vertical-align:top;">Message</td><td style="padding:10px;">${message.replace(/\n/g, '<br>')}</td></tr>
                    </table>
                    <p style="color:#888;font-size:13px;">Reply directly to this email to respond to ${name}.</p>
                </div>
            `,
        });

        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
