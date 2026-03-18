import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { adminNewBusinessNotification } from '@/lib/email-templates';

const ADMIN_EMAIL = process.env.ADMIN_NOTIFY_EMAIL || process.env.RESEND_FROM_EMAIL || '';

export async function POST(req: Request) {
    try {
        const { name, category, description, phone, website, location_city, location_state, contact_name, contact_email } = await req.json();

        if (!name || !category || !contact_email || !contact_name || !location_city) {
            return NextResponse.json({ success: false, error: 'Missing required fields.' }, { status: 400 });
        }

        // Insert pending request
        const [request] = await sql`
            INSERT INTO new_business_requests
                (name, category, description, phone, website, location_city, location_state, contact_name, contact_email, status)
            VALUES
                (${name}, ${category}, ${description || null}, ${phone || null}, ${website || null},
                 ${location_city}, ${location_state || 'NC'}, ${contact_name}, ${contact_email}, 'pending')
            RETURNING id
        `;

        // Notify admin
        if (ADMIN_EMAIL) {
            await sendEmail({
                to: ADMIN_EMAIL,
                subject: `📋 New Business Request: ${name}`,
                html: adminNewBusinessNotification(name, contact_name, contact_email, request.id as number),
            });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('new-business-request error:', err);
        return NextResponse.json({ success: false, error: 'Server error.' }, { status: 500 });
    }
}
