/**
 * GET  /api/smb/listing  — fetch the listing owned by the current SMB user
 * PUT  /api/smb/listing  — update editable fields on that listing
 *
 * Auth: requires NextAuth session with role='smb' and listing_id set.
 */
import { sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export const dynamic = 'force-dynamic';

async function getSmbListing(session: any) {
    const listingId = (session.user as any).listingId;
    if (!listingId) return null;

    const [listing] = await sql`
        SELECT
            l.*,
            p.name AS plan_name,
            p.price AS plan_price
        FROM listings l
        LEFT JOIN plans p ON l.plan_id = p.id
        WHERE l.id = ${listingId}
        LIMIT 1
    `;
    return listing || null;
}

export async function GET(_req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'smb') {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const listing = await getSmbListing(session);
        if (!listing) return NextResponse.json({ success: false, error: 'No listing found' }, { status: 404 });
        return NextResponse.json({ success: true, data: listing });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'smb') {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const listingId = (session.user as any).listingId;
    if (!listingId) {
        return NextResponse.json({ success: false, error: 'No listing linked to account' }, { status: 400 });
    }

    try {
        const body = await req.json();
        const {
            name,
            description,
            phone,
            website,
            contact_name,
            contact_email,
            street_address,
            image_url,
            business_hours,
            social_media,
            services,
        } = body;

        // SMBs can only update these specific fields — not plan, agency, featured, etc.
        const [updated] = await sql`
            UPDATE listings SET
                name            = COALESCE(${name ?? null}, name),
                description     = COALESCE(${description ?? null}, description),
                phone           = COALESCE(${phone ?? null}, phone),
                website         = COALESCE(${website ?? null}, website),
                contact_name    = COALESCE(${contact_name ?? null}, contact_name),
                contact_email   = COALESCE(${contact_email ?? null}, contact_email),
                street_address  = COALESCE(${street_address ?? null}, street_address),
                image_url       = COALESCE(${image_url ?? null}, image_url),
                business_hours  = COALESCE(${business_hours ? JSON.stringify(business_hours) : null}::jsonb, business_hours),
                social_media    = COALESCE(${social_media ? JSON.stringify(social_media) : null}::jsonb, social_media),
                services        = COALESCE(${services ? JSON.stringify(services) : null}::jsonb, services),
                updated_at      = NOW()
            WHERE id = ${listingId}
            RETURNING *
        `;

        return NextResponse.json({ success: true, data: updated });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
