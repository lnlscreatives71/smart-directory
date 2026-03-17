import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { welcomeEmail } from '@/lib/email-templates';
import crypto from 'crypto';

const SITE_URL = process.env.NEXTAUTH_URL || 'https://thetrianglehub.online';

export async function POST(req: Request) {
    try {
        const { id, contact_name, phone, website, description } = await req.json();
        if (!id) return NextResponse.json({ success: false, error: 'No ID' }, { status: 400 });

        // Fetch the current listing info for the email
        const [listing] = await sql`
            SELECT id, name, slug, contact_email, contact_name, claimed
            FROM listings WHERE id = ${Number(id)}
        `;

        if (!listing) return NextResponse.json({ success: false, error: 'Listing not found' }, { status: 404 });
        if (listing.claimed) return NextResponse.json({ success: false, error: 'Already claimed' }, { status: 409 });

        // Update listing: mark claimed + save any profile info they filled out
        await sql`
            UPDATE listings
            SET
                claimed = TRUE,
                updated_at = NOW(),
                contact_name = COALESCE(${contact_name || null}, contact_name),
                phone        = COALESCE(${phone || null}, phone),
                website      = COALESCE(${website || null}, website),
                description  = COALESCE(${description || null}, description)
            WHERE id = ${Number(id)}
        `;

        // Move CRM pipeline stage to 'claimed'
        await sql`
            UPDATE outreach_campaigns
            SET pipeline_stage = 'claimed', updated_at = NOW()
            WHERE listing_id = ${Number(id)}
        `;

        // ── Create or update SMB user account ────────────────────────────────
        const emailTo = listing.contact_email as string | null;
        const bizName = listing.name as string;
        const slug = listing.slug as string;
        const name = (contact_name || listing.contact_name) as string | null;

        let magicLink: string | null = null;

        if (emailTo) {
            // Generate a secure magic login token (48 bytes = 64 hex chars)
            const magicToken = crypto.randomBytes(48).toString('hex');
            const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours

            // Upsert SMB user: if the email already has an account, just refresh the token
            await sql`
                INSERT INTO users (name, email, password_hash, role, listing_id, magic_token, magic_token_expires_at)
                VALUES (
                    ${name || bizName},
                    ${emailTo},
                    '',
                    'smb',
                    ${Number(id)},
                    ${magicToken},
                    ${expiresAt.toISOString()}
                )
                ON CONFLICT (email) DO UPDATE SET
                    role                    = 'smb',
                    listing_id              = ${Number(id)},
                    magic_token             = ${magicToken},
                    magic_token_expires_at  = ${expiresAt.toISOString()},
                    updated_at              = NOW()
            `;

            magicLink = `${SITE_URL}/api/smb/magic-login?token=${magicToken}`;

            // Send welcome confirmation email (with magic login link embedded)
            await sendEmail({
                to: emailTo,
                subject: `✅ You've claimed ${bizName} on The Triangle Hub!`,
                html: welcomeEmail(bizName, name, slug, magicLink),
            });
        }

        return NextResponse.json({ success: true, slug });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
