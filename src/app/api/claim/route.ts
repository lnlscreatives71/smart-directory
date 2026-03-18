import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sendEmail } from '@/lib/email';
import { adminClaimNotification } from '@/lib/email-templates';

const ADMIN_EMAIL = process.env.ADMIN_NOTIFY_EMAIL || process.env.RESEND_FROM_EMAIL || '';
const SITE_URL = process.env.NEXTAUTH_URL || 'https://thetrianglehub.online';

const FREE_EMAIL_DOMAINS = new Set([
    'gmail.com','yahoo.com','hotmail.com','outlook.com','icloud.com',
    'aol.com','live.com','msn.com','me.com','mac.com','protonmail.com',
    'ymail.com','googlemail.com',
]);

function getDomain(email: string): string {
    return email.split('@')[1]?.toLowerCase() ?? '';
}

function emailPassesVerification(submittedEmail: string, contactEmail: string | null): boolean {
    if (!contactEmail) return true; // no contact email on record — let admin decide
    const submitted = submittedEmail.toLowerCase();
    const contact = contactEmail.toLowerCase();
    if (submitted === contact) return true; // exact match
    const contactDomain = getDomain(contact);
    if (!contactDomain || FREE_EMAIL_DOMAINS.has(contactDomain)) return false; // free email — exact match only
    return getDomain(submitted) === contactDomain; // same business domain
}

export async function POST(req: Request) {
    try {
        const { id, name, email, password } = await req.json();

        if (!id) return NextResponse.json({ success: false, error: 'No listing ID' }, { status: 400 });
        if (!email || !password) return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
        if (password.length < 8) return NextResponse.json({ success: false, error: 'Password must be at least 8 characters' }, { status: 400 });

        // Fetch listing
        const [listing] = await sql`
            SELECT id, name, slug, claimed, contact_email
            FROM listings WHERE id = ${Number(id)}
        `;
        if (!listing) return NextResponse.json({ success: false, error: 'Listing not found' }, { status: 404 });
        if (listing.claimed) return NextResponse.json({ success: false, error: 'Already claimed' }, { status: 409 });

        // Verify email matches listing contact email or same business domain
        if (!emailPassesVerification(email, listing.contact_email as string | null)) {
            const contactDomain = listing.contact_email ? getDomain(listing.contact_email as string) : null;
            const hint = contactDomain && !FREE_EMAIL_DOMAINS.has(contactDomain)
                ? `Please use your business email (e.g. you@${contactDomain}) or the exact email on file for this listing.`
                : `Please use the exact email address associated with this business listing.`;
            return NextResponse.json({ success: false, code: 'email_mismatch', error: hint }, { status: 403 });
        }

        // Check if email already has an account
        const [existing] = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
        if (existing) {
            return NextResponse.json({ success: false, code: 'account_exists', error: 'An account with this email already exists.' }, { status: 409 });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Create SMB user account
        await sql`
            INSERT INTO users (name, email, password_hash, role, listing_id)
            VALUES (
                ${name || listing.name},
                ${email},
                ${passwordHash},
                'smb',
                ${Number(id)}
            )
        `;

        // Mark listing as claimed with status = pending (awaiting admin approval)
        await sql`
            UPDATE listings
            SET
                claimed = TRUE,
                claim_status = 'pending',
                contact_email = COALESCE(contact_email, ${email}),
                claimed_at = NOW(),
                updated_at = NOW()
            WHERE id = ${Number(id)}
        `;

        // Move CRM pipeline stage to 'claimed'
        await sql`
            UPDATE outreach_campaigns
            SET pipeline_stage = 'claimed', updated_at = NOW()
            WHERE listing_id = ${Number(id)}
        `.catch(() => {}); // non-fatal if no outreach record exists

        // Notify admin
        if (ADMIN_EMAIL) {
            await sendEmail({
                to: ADMIN_EMAIL,
                subject: `🔔 New claim: ${listing.name}`,
                html: adminClaimNotification(listing.name as string, name || null, email, Number(id)),
            }).catch(() => {}); // non-fatal
        }

        return NextResponse.json({ success: true, slug: listing.slug });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
