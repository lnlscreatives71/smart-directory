import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Ensure the site_settings table exists
async function ensureTable() {
    await sql`
        CREATE TABLE IF NOT EXISTS site_settings (
            key VARCHAR(100) PRIMARY KEY,
            value JSONB NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
    `;
}

const DEFAULTS = {
    branding: {
        site_name: 'Triangle Local Hub',
        tagline: 'Find Local Businesses You Can Trust',
        logo_url: '',
        footer_logo_url: '',
        favicon_url: '',
        topbar_bg_color: '#FFFFFF',
        topbar_text_color: '#1F2937',
        topbar_font: 'Inter',
        topbar_font_size: '16px',
        accent_color: '#EF4444',
    },
    hero: {
        title: 'Find Local Businesses You Can Trust',
        subtitle: 'Search by name, category, or keyword — and support the businesses that make your community thrive.',
        image_url: 'https://images.unsplash.com/photo-1565791380713-1756b9a05343?q=80&w=2070',
        search_button_color: '#EF4444',
        heading_text_color: '#FFFFFF',
        subheading_text_color: 'rgba(255,255,255,0.8)',
        display_map: false,
    },
    homepage: {
        heading: 'Triangle Local Hub — Discover & Support Small Businesses',
        text1: 'The Triangle Hub is your go-to directory for finding trusted small businesses near you.',
        text2: 'Explore shops, services, restaurants, and more — all in one place.',
        heading_color: '#1F2937',
        text1_color: '#4B5563',
        text2_color: '#6B7280',
        main_image_url: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=600',
        featured_per_page: 4,
        free_per_page: 8,
        phone_number: '(919) 555-0100',
        contact_email: 'hello@trianglelocalhub.com',
        address: 'Raleigh, NC 27601',
    },
    menu: {
        items: [
            {
                id: '1', label: 'Dining', href: '/category/dining', children: [
                    { id: '1-1', label: 'Bakeries', href: '/category/bakeries' },
                    { id: '1-2', label: 'Café & Brunch', href: '/category/cafes' },
                    { id: '1-3', label: 'Mexican Restaurant', href: '/category/mexican-restaurant' },
                    { id: '1-4', label: 'Pizza', href: '/category/pizza' },
                    { id: '1-5', label: 'Sushi', href: '/category/sushi' },
                ],
            },
            {
                id: '2', label: 'Services', href: '/category/services', children: [
                    { id: '2-1', label: 'HVAC', href: '/category/hvac' },
                    { id: '2-2', label: 'Plumbing', href: '/category/plumbing' },
                    { id: '2-3', label: 'Real Estate', href: '/category/real-estate' },
                    { id: '2-4', label: 'Med Spa', href: '/category/med-spa' },
                    { id: '2-5', label: 'Law Firms', href: '/category/law' },
                ],
            },
            {
                id: '3', label: 'More', href: '/category/all', children: [
                    { id: '3-1', label: 'Pet Services', href: '/category/pet-services' },
                    { id: '3-2', label: 'Retail', href: '/category/retail' },
                    { id: '3-3', label: 'Health & Fitness', href: '/category/health' },
                    { id: '3-4', label: 'Beauty & Grooming', href: '/category/beauty' },
                ],
            },
        ],
    },
};

export async function GET() {
    try {
        await ensureTable();
        const rows = await sql`SELECT key, value FROM site_settings`;
        const settings: Record<string, unknown> = { ...DEFAULTS };
        for (const row of rows) {
            settings[row.key as string] = row.value;
        }
        return NextResponse.json({ success: true, settings });
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return NextResponse.json({ success: false, error: msg }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await ensureTable();
        const body = await request.json();
        const { key, value } = body;

        if (!key || value === undefined) {
            return NextResponse.json({ success: false, error: 'key and value required' }, { status: 400 });
        }

        await sql`
            INSERT INTO site_settings (key, value, updated_at)
            VALUES (${key}, ${JSON.stringify(value)}, NOW())
            ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
        `;

        return NextResponse.json({ success: true, message: `Saved '${key}' settings.` });
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return NextResponse.json({ success: false, error: msg }, { status: 500 });
    }
}
