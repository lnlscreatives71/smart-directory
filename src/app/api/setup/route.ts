/**
 * /api/setup — First-time setup endpoint.
 * Creates the first admin user + seeds agency_settings.
 * Only works if no users exist in the DB yet.
 */
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        // Block if any admin user already exists
        const existing = await sql`SELECT COUNT(*) as count FROM users WHERE role = 'admin'`;
        if (parseInt((existing[0] as any).count, 10) > 0) {
            return NextResponse.json({ error: 'Setup already completed. Log in to your dashboard.' }, { status: 403 });
        }

        const body = await req.json();
        const {
            admin_name,
            admin_email,
            admin_password,
            site_name,
            site_description,
            location_region,
            contact_email,
            contact_phone,
            hero_headline,
            hero_subhead,
            primary_color,
            secondary_color,
        } = body;

        if (!admin_email || !admin_password || !site_name || !location_region) {
            return NextResponse.json({ error: 'admin_email, admin_password, site_name, and location_region are required' }, { status: 400 });
        }

        if (admin_password.length < 8) {
            return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
        }

        const password_hash = await bcrypt.hash(admin_password, 12);

        // Create admin user
        await sql`
            INSERT INTO users (name, email, password_hash, role)
            VALUES (
                ${admin_name || 'Admin'},
                ${admin_email},
                ${password_hash},
                'admin'
            )
        `;

        // Upsert agency_settings (id=1)
        await sql`
            INSERT INTO agency_settings (
                id, site_name, site_description, hero_headline, hero_subhead,
                primary_color, secondary_color, contact_email, contact_phone, location_region
            ) VALUES (
                1,
                ${site_name},
                ${site_description || `Discover and support local businesses in ${location_region}.`},
                ${hero_headline || 'Find Local Businesses You Can Trust'},
                ${hero_subhead || 'Search by name, category, or keyword — and support the businesses that make your community thrive.'},
                ${primary_color || '#3b82f6'},
                ${secondary_color || '#10b981'},
                ${contact_email || admin_email},
                ${contact_phone || ''},
                ${location_region}
            )
            ON CONFLICT (id) DO UPDATE SET
                site_name = EXCLUDED.site_name,
                site_description = EXCLUDED.site_description,
                hero_headline = EXCLUDED.hero_headline,
                hero_subhead = EXCLUDED.hero_subhead,
                primary_color = EXCLUDED.primary_color,
                secondary_color = EXCLUDED.secondary_color,
                contact_email = EXCLUDED.contact_email,
                contact_phone = EXCLUDED.contact_phone,
                location_region = EXCLUDED.location_region,
                updated_at = CURRENT_TIMESTAMP
        `;

        // Seed default plans if none exist
        const planCount = await sql`SELECT COUNT(*) as count FROM plans`;
        if (parseInt((planCount[0] as any).count, 10) === 0) {
            await sql`
                INSERT INTO plans (name, monthly_price, price, description, features, active, is_default)
                VALUES
                    ('Free', 0, 0, 'Basic listing visibility', '["Basic listing","Contact info","Search visibility"]', true, true),
                    ('Premium', 29, 2900, 'Enhanced listing with full features', '["Featured placement","Extra photos","Direct contact form","Priority search","Promotional offers"]', true, false)
            `;
        }

        return NextResponse.json({ success: true, message: 'Setup complete! You can now log in.' });
    } catch (err: any) {
        console.error('[Setup]', err);
        return NextResponse.json({ error: err.message || 'Setup failed' }, { status: 500 });
    }
}

// GET — check if setup is needed
export async function GET() {
    try {
        const existing = await sql`SELECT COUNT(*) as count FROM users WHERE role = 'admin'`;
        const count = parseInt((existing[0] as any).count, 10);
        return NextResponse.json({ setup_needed: count === 0 });
    } catch {
        // Tables don't exist yet — migrations haven't run
        return NextResponse.json({ setup_needed: true, migrations_needed: true });
    }
}
