import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { adminNewBusinessNotification, newBusinessSubmitted } from '@/lib/email-templates';
import crypto from 'crypto';

const ADMIN_EMAIL = process.env.ADMIN_NOTIFY_EMAIL || process.env.RESEND_FROM_EMAIL || '';
const SITE_URL = process.env.NEXTAUTH_URL || 'https://thetrianglehub.online';

export async function POST(req: Request) {
    try {
        const { name, category, description, phone, website, location_city, location_state, contact_name, contact_email } = await req.json();

        if (!name || !category || !contact_email || !contact_name || !location_city) {
            return NextResponse.json({ success: false, error: 'Missing required fields.' }, { status: 400 });
        }

        const normalizedEmail = contact_email.toLowerCase().trim();

        // --- 1. Create user account (if not already exists) ---
        let userId: number;

        const [existingUser] = await sql`
            SELECT id FROM users WHERE email = ${normalizedEmail} LIMIT 1
        `;

        if (existingUser) {
            userId = existingUser.id as number;
        } else {
            const [newUser] = await sql`
                INSERT INTO users (name, email, role, password_hash)
                VALUES (${contact_name}, ${normalizedEmail}, 'smb', '')
                RETURNING id
            `;
            userId = newUser.id as number;
        }

        // --- 2. Generate magic login token (72h) ---
        const magicToken = crypto.randomBytes(48).toString('hex');
        const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);

        await sql`
            UPDATE users
            SET magic_token = ${magicToken}, magic_token_expires_at = ${expiresAt.toISOString()}
            WHERE id = ${userId}
        `;

        const magicLink = `${SITE_URL}/api/smb/magic-login?token=${magicToken}`;

        // --- 3. Insert pending request (link to user) ---
        const [request] = await sql`
            INSERT INTO new_business_requests
                (name, category, description, phone, website, location_city, location_state, contact_name, contact_email, status, user_id)
            VALUES
                (${name}, ${category}, ${description || null}, ${phone || null}, ${website || null},
                 ${location_city}, ${location_state || 'NC'}, ${contact_name}, ${normalizedEmail}, 'pending', ${userId})
            RETURNING id
        `;

        // --- 4. Send "submission received + login" email to SMB ---
        try {
            await sendEmail({
                to: normalizedEmail,
                subject: `We've received your submission for ${name}`,
                html: newBusinessSubmitted(name, contact_name, magicLink),
            });
        } catch (emailErr) {
            console.error('new-business-request: failed to send SMB confirmation email:', emailErr);
        }

        // --- 5. Notify admin ---
        if (ADMIN_EMAIL) {
            try {
                await sendEmail({
                    to: ADMIN_EMAIL,
                    subject: `📋 New Business Request: ${name}`,
                    html: adminNewBusinessNotification(name, contact_name, normalizedEmail, request.id as number),
                });
            } catch (emailErr) {
                console.error('new-business-request: failed to send admin notification email:', emailErr);
            }
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('new-business-request error:', err);
        return NextResponse.json({ success: false, error: 'Server error.' }, { status: 500 });
    }
}
