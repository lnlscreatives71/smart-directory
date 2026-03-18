/**
 * GET  /api/admin/claims         — list pending claims
 * POST /api/admin/claims/approve — approve a claim
 * POST /api/admin/claims/reject  — reject a claim
 */
import { sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { sendEmail } from '@/lib/email';
import { smbClaimApproved, smbClaimRejected } from '@/lib/email-templates';

export const dynamic = 'force-dynamic';

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

    const claims = await sql`
        SELECT
            l.id, l.name, l.slug, l.category, l.location_city,
            l.claim_status, l.claimed, l.claimed_at,
            l.contact_email,
            u.name AS claimant_name, u.email AS claimant_email, u.created_at AS claimed_on
        FROM listings l
        LEFT JOIN users u ON u.listing_id = l.id AND u.role = 'smb'
        WHERE l.claim_status = ${status}
        ORDER BY u.created_at DESC
        LIMIT 100
    `;

    return NextResponse.json({ success: true, data: claims });
}

export async function POST(req: NextRequest) {
    const authError = await requireAdmin(req);
    if (authError) return authError;

    const { action, listingId } = await req.json();
    if (!listingId || !['approve', 'reject'].includes(action)) {
        return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
    }

    const [listing] = await sql`
        SELECT l.id, l.name, l.slug, l.contact_email,
               u.name AS claimant_name, u.email AS claimant_email
        FROM listings l
        LEFT JOIN users u ON u.listing_id = l.id AND u.role = 'smb'
        WHERE l.id = ${listingId}
        LIMIT 1
    `;

    if (!listing) return NextResponse.json({ success: false, error: 'Listing not found' }, { status: 404 });

    if (action === 'approve') {
        await sql`
            UPDATE listings SET claim_status = 'approved', updated_at = NOW()
            WHERE id = ${listingId}
        `;

        // Send approval email to SMB
        const emailTo = (listing.claimant_email || listing.contact_email) as string | null;
        if (emailTo) {
            await sendEmail({
                to: emailTo,
                subject: `✅ Your listing "${listing.name}" has been approved!`,
                html: smbClaimApproved(listing.name as string, listing.claimant_name as string | null, listing.slug as string),
            });
        }

        // Enqueue Premium Upgrade Push
        if (emailTo) {
            await sql`
                INSERT INTO premium_upgrade_campaigns (listing_id, contact_email, contact_name)
                VALUES (${listingId}, ${emailTo}, ${listing.claimant_name || listing.contact_email})
                ON CONFLICT DO NOTHING
            `;
        }

        return NextResponse.json({ success: true, message: 'Claim approved' });
    }

    if (action === 'reject') {
        await sql`
            UPDATE listings
            SET claim_status = 'rejected', claimed = FALSE, updated_at = NOW()
            WHERE id = ${listingId}
        `;

        // Remove SMB user account
        await sql`DELETE FROM users WHERE listing_id = ${listingId} AND role = 'smb'`;

        // Notify SMB
        const emailTo = (listing.claimant_email || listing.contact_email) as string | null;
        if (emailTo) {
            await sendEmail({
                to: emailTo,
                subject: `Update on your claim for "${listing.name}"`,
                html: smbClaimRejected(listing.name as string, listing.claimant_name as string | null),
            });
        }

        return NextResponse.json({ success: true, message: 'Claim rejected' });
    }
}
