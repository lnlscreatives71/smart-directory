import { sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { sendEmail } from '@/lib/email';
import { newBusinessApproved, newBusinessRejected } from '@/lib/email-templates';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXTAUTH_URL || 'https://thetrianglehub.online';

async function requireAdmin(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return null;
}

export async function GET(req: NextRequest) {
    const authError = await requireAdmin(req);
    if (authError) return authError;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'pending';

    const requests = await sql`
        SELECT id, name, category, description, phone, website,
               location_city, location_state, contact_name, contact_email,
               status, listing_id, created_at
        FROM new_business_requests
        WHERE status = ${status}
        ORDER BY created_at DESC
        LIMIT 100
    `;

    return NextResponse.json({ success: true, data: requests });
}

export async function POST(req: NextRequest) {
    const authError = await requireAdmin(req);
    if (authError) return authError;

    const { action, requestId } = await req.json();
    if (!requestId || !['approve', 'reject'].includes(action)) {
        return NextResponse.json({ success: false, error: 'Invalid request.' }, { status: 400 });
    }

    const [nbr] = await sql`
        SELECT * FROM new_business_requests WHERE id = ${requestId} LIMIT 1
    `;
    if (!nbr) return NextResponse.json({ success: false, error: 'Request not found.' }, { status: 404 });

    if (action === 'approve') {
        // Generate slug
        const baseSlug = (nbr.name as string)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
        const slug = `${baseSlug}-${Date.now()}`;

        // Create the listing
        const [listing] = await sql`
            INSERT INTO listings
                (name, slug, category, description, phone, website,
                 location_city, location_state, location_region,
                 contact_name, contact_email, claimed, plan_id, services, feature_flags)
            VALUES
                (${nbr.name}, ${slug}, ${nbr.category}, ${nbr.description || null},
                 ${nbr.phone || null}, ${nbr.website || null},
                 ${nbr.location_city}, ${nbr.location_state || 'NC'}, 'Triangle',
                 ${nbr.contact_name}, ${nbr.contact_email},
                 FALSE, 1, '[]', '{}')
            RETURNING id, slug
        `;

        // Mark request approved and link listing
        await sql`
            UPDATE new_business_requests
            SET status = 'approved', listing_id = ${listing.id}, reviewed_at = NOW(), updated_at = NOW()
            WHERE id = ${requestId}
        `;

        // Link listing to the SMB user account (find by user_id or fall back to email)
        const userIdFromRequest = nbr.user_id as number | null;
        const magicToken = crypto.randomBytes(48).toString('hex');
        const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);

        if (userIdFromRequest) {
            await sql`
                UPDATE users
                SET listing_id = ${listing.id}, magic_token = ${magicToken}, magic_token_expires_at = ${expiresAt.toISOString()}
                WHERE id = ${userIdFromRequest}
            `;
        } else {
            // Fallback: user was created without user_id on request (legacy)
            await sql`
                UPDATE users
                SET listing_id = ${listing.id}, magic_token = ${magicToken}, magic_token_expires_at = ${expiresAt.toISOString()}
                WHERE email = ${nbr.contact_email} AND role = 'smb'
            `;
        }

        const magicLink = `${SITE_URL}/api/smb/magic-login?token=${magicToken}`;

        // Notify SMB with magic login link
        await sendEmail({
            to: nbr.contact_email as string,
            subject: `🎉 Your business "${nbr.name}" is now live on The Triangle Hub!`,
            html: newBusinessApproved(nbr.name as string, nbr.contact_name as string, listing.slug as string, magicLink),
        });

        // Enqueue Premium Upgrade Push + set funnel status
        await sql`
            INSERT INTO premium_upgrade_campaigns (listing_id, contact_email, contact_name)
            VALUES (${listing.id}, ${nbr.contact_email}, ${nbr.contact_name})
            ON CONFLICT DO NOTHING
        `;
        await sql`
            UPDATE listings SET funnel_status = 'premium_upgrade', funnel_step = 0
            WHERE id = ${listing.id}
        `;

        return NextResponse.json({ success: true, message: 'Approved and listing created.' });
    }

    if (action === 'reject') {
        await sql`
            UPDATE new_business_requests
            SET status = 'rejected', reviewed_at = NOW(), updated_at = NOW()
            WHERE id = ${requestId}
        `;

        await sendEmail({
            to: nbr.contact_email as string,
            subject: `Update on your business submission to The Triangle Hub`,
            html: newBusinessRejected(nbr.name as string, nbr.contact_name as string),
        });

        return NextResponse.json({ success: true, message: 'Rejected.' });
    }
}
