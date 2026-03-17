import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

/**
 * Menu Settings API - Configure menu behavior per agency
 * 
 * GET /api/menu-settings?agency_id=X - Get menu settings
 * PUT /api/menu-settings - Update menu settings
 */

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const agencyId = searchParams.get('agency_id');

        if (!agencyId) {
            return NextResponse.json({ error: 'agency_id is required' }, { status: 400 });
        }

        const settings = await sql`
            SELECT * FROM menu_settings 
            WHERE agency_id = ${parseInt(agencyId)}
        `;

        return NextResponse.json({ data: settings[0] || null });
    } catch (error) {
        console.error('Error fetching menu settings:', error);
        return NextResponse.json({ error: 'Failed to fetch menu settings' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { agency_id, menu_name, max_depth, show_icons, layout_style } = body;

        if (!agency_id) {
            return NextResponse.json({ error: 'agency_id is required' }, { status: 400 });
        }

        // Check if settings exist
        const existing = await sql`SELECT id FROM menu_settings WHERE agency_id = ${parseInt(agency_id)}`;

        let result;
        if (existing.length > 0) {
            // Update existing
            result = await sql`
                UPDATE menu_settings 
                SET 
                    menu_name = ${menu_name || 'Main Menu'},
                    max_depth = ${max_depth !== undefined ? max_depth : 2},
                    show_icons = ${show_icons !== undefined ? show_icons : true},
                    layout_style = ${layout_style || 'dropdown'},
                    updated_at = CURRENT_TIMESTAMP
                WHERE agency_id = ${parseInt(agency_id)}
                RETURNING *
            `;
        } else {
            // Insert new
            result = await sql`
                INSERT INTO menu_settings (
                    agency_id, menu_name, max_depth, show_icons, layout_style
                )
                VALUES (
                    ${parseInt(agency_id)},
                    ${menu_name || 'Main Menu'},
                    ${max_depth !== undefined ? max_depth : 2},
                    ${show_icons !== undefined ? show_icons : true},
                    ${layout_style || 'dropdown'}
                )
                RETURNING *
            `;
        }

        return NextResponse.json({ data: result[0], message: 'Menu settings saved successfully' });
    } catch (error) {
        console.error('Error saving menu settings:', error);
        return NextResponse.json({ error: 'Failed to save menu settings' }, { status: 500 });
    }
}
