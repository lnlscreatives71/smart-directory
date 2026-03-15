import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET all agencies (admin only) or single agency by id/slug
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        const slug = searchParams.get('slug');
        const domain = searchParams.get('domain');

        let query;
        
        if (id) {
            query = await sql`SELECT * FROM agencies WHERE id = ${parseInt(id)} LIMIT 1`;
        } else if (slug) {
            query = await sql`SELECT * FROM agencies WHERE slug = ${slug} LIMIT 1`;
        } else if (domain) {
            query = await sql`SELECT * FROM agencies WHERE custom_domain = ${domain} LIMIT 1`;
        } else {
            query = await sql`SELECT * FROM agencies ORDER BY created_at DESC`;
        }

        return NextResponse.json({ success: true, data: query });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}

// POST create new agency
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            name,
            slug,
            custom_domain,
            contact_email,
            contact_phone,
            plan_tier = 'starter'
        } = body;

        if (!name || !slug) {
            return NextResponse.json(
                { success: false, error: 'Name and slug are required' },
                { status: 400 }
            );
        }

        // Check if slug already exists
        const existing = await sql`SELECT id FROM agencies WHERE slug = ${slug} LIMIT 1`;
        if (existing.length > 0) {
            return NextResponse.json(
                { success: false, error: 'Slug already taken' },
                { status: 409 }
            );
        }

        const agency = await sql`
            INSERT INTO agencies (
                name, slug, custom_domain, contact_email, contact_phone, plan_tier
            ) VALUES (
                ${name},
                ${slug},
                ${custom_domain || null},
                ${contact_email || null},
                ${contact_phone || null},
                ${plan_tier}
            )
            RETURNING *
        `;

        return NextResponse.json({ success: true, data: agency[0] });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}

// PUT update agency
export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            id,
            name,
            slug,
            custom_domain,
            logo_url,
            favicon_url,
            primary_color,
            secondary_color,
            font_family,
            contact_email,
            contact_phone,
            support_email,
            plan_tier,
            status,
            settings
        } = body;

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'id required' },
                { status: 400 }
            );
        }

        const agency = await sql`
            UPDATE agencies SET
                name = ${name || name},
                slug = ${slug || slug},
                custom_domain = ${custom_domain !== undefined ? custom_domain : custom_domain},
                logo_url = ${logo_url !== undefined ? logo_url : logo_url},
                favicon_url = ${favicon_url !== undefined ? favicon_url : favicon_url},
                primary_color = ${primary_color || primary_color},
                secondary_color = ${secondary_color || secondary_color},
                font_family = ${font_family || font_family},
                contact_email = ${contact_email !== undefined ? contact_email : contact_email},
                contact_phone = ${contact_phone !== undefined ? contact_phone : contact_phone},
                support_email = ${support_email !== undefined ? support_email : support_email},
                plan_tier = ${plan_tier || plan_tier},
                status = ${status !== undefined ? status : status},
                settings = ${settings ? JSON.stringify(settings) : settings},
                updated_at = NOW()
            WHERE id = ${parseInt(id)}
            RETURNING *
        `;

        if (agency.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Agency not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: agency[0] });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}

// DELETE agency
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'id required' },
                { status: 400 }
            );
        }

        await sql`DELETE FROM agencies WHERE id = ${parseInt(id)}`;

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}
