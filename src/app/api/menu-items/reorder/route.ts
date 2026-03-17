import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

/**
 * Menu Items Reorder API
 * 
 * PUT /api/menu-items/reorder - Update order of multiple menu items
 */

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { agency_id, items } = body;

        if (!agency_id || !items || !Array.isArray(items)) {
            return NextResponse.json({ error: 'agency_id and items array are required' }, { status: 400 });
        }

        // Update order for each item
        const results = [];
        for (const item of items) {
            if (!item.id || item.order_index === undefined) {
                continue;
            }

            const result = await sql`
                UPDATE menu_items 
                SET 
                    order_index = ${item.order_index},
                    parent_id = ${item.parent_id !== undefined ? (item.parent_id ? parseInt(item.parent_id) : null) : null},
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ${parseInt(item.id)} AND agency_id = ${parseInt(agency_id)}
                RETURNING *
            `;

            if (result.length > 0) {
                results.push(result[0]);
            }
        }

        return NextResponse.json({ 
            data: results, 
            message: `Updated ${results.length} menu items` 
        });
    } catch (error) {
        console.error('Error reordering menu items:', error);
        return NextResponse.json({ error: 'Failed to reorder menu items' }, { status: 500 });
    }
}
