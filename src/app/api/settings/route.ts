import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
    try {
        const res = await sql`SELECT * FROM agency_settings WHERE id = 1 LIMIT 1`;
        if (res.length > 0) {
            return NextResponse.json(res[0]);
        }
        return NextResponse.json({ error: 'Settings not found' }, { status: 404 });
    } catch (e) {
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const {
            site_name,
            site_description,
            hero_headline,
            hero_subhead,
            primary_color,
            secondary_color,
            contact_email,
            contact_phone,
            location_region
        } = body;

        await sql`
            UPDATE agency_settings 
            SET 
                site_name = ${site_name},
                site_description = ${site_description},
                hero_headline = ${hero_headline},
                hero_subhead = ${hero_subhead},
                primary_color = ${primary_color},
                secondary_color = ${secondary_color},
                contact_email = ${contact_email},
                contact_phone = ${contact_phone},
                location_region = ${location_region},
                updated_at = CURRENT_TIMESTAMP
            WHERE id = 1
        `;

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("Failed to update settings:", e);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
