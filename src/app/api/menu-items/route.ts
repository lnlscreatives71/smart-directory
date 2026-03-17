import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

/**
 * Menu Items API - Build custom navigation menus
 * 
 * GET /api/menu-items?agency_id=X - Get all menu items for an agency (hierarchical)
 * POST /api/menu-items - Create a new menu item
 * PUT /api/menu-items - Update a menu item
 * DELETE /api/menu-items?id=X - Delete a menu item
 * PUT /api/menu-items/reorder - Reorder menu items
 */

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const agencyId = searchParams.get('agency_id');

        if (!agencyId) {
            return NextResponse.json({ error: 'agency_id is required' }, { status: 400 });
        }

        // Get all menu items for this agency, ordered by order_index
        const menuItems = await sql`
            SELECT * FROM menu_items 
            WHERE agency_id = ${parseInt(agencyId)}
            ORDER BY order_index ASC
        `;

        // Build hierarchical structure
        const buildTree = (items: any[], parentId: number | null = null) => {
            return items
                .filter(item => item.parent_id === parentId)
                .map(item => ({
                    ...item,
                    children: buildTree(items, item.id)
                }));
        };

        const tree = buildTree(menuItems);

        return NextResponse.json({ data: menuItems, tree });
    } catch (error) {
        console.error('Error fetching menu items:', error);
        return NextResponse.json({ error: 'Failed to fetch menu items' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            agency_id,
            parent_id,
            title,
            menu_type,
            target_type,
            target_value,
            icon,
            order_index,
            is_visible,
            open_in_new_tab,
            css_class
        } = body;

        if (!agency_id || !title || !menu_type) {
            return NextResponse.json({ error: 'agency_id, title, and menu_type are required' }, { status: 400 });
        }

        // Validate menu_type
        const validTypes = ['category', 'tag', 'custom_link', 'listing'];
        if (!validTypes.includes(menu_type)) {
            return NextResponse.json({ error: 'Invalid menu_type' }, { status: 400 });
        }

        // If parent_id is provided, verify it exists and belongs to the same agency
        if (parent_id) {
            const parent = await sql`SELECT id FROM menu_items WHERE id = ${parseInt(parent_id)} AND agency_id = ${parseInt(agency_id)}`;
            if (parent.length === 0) {
                return NextResponse.json({ error: 'Parent menu item not found' }, { status: 404 });
            }
        }

        // Get max order_index if not provided
        const maxOrder = order_index !== undefined ? order_index : 
            (await sql`SELECT COALESCE(MAX(order_index), -1) as max_order FROM menu_items WHERE agency_id = ${parseInt(agency_id)}`)[0].max_order + 1;

        const result = await sql`
            INSERT INTO menu_items (
                agency_id, parent_id, title, menu_type, target_type, target_value,
                icon, order_index, is_visible, open_in_new_tab, css_class
            )
            VALUES (
                ${parseInt(agency_id)},
                ${parent_id ? parseInt(parent_id) : null},
                ${title},
                ${menu_type},
                ${target_type || null},
                ${target_value || null},
                ${icon || null},
                ${maxOrder},
                ${is_visible !== undefined ? is_visible : true},
                ${open_in_new_tab || false},
                ${css_class || null}
            )
            RETURNING *
        `;

        return NextResponse.json({ data: result[0], message: 'Menu item created successfully' });
    } catch (error) {
        console.error('Error creating menu item:', error);
        return NextResponse.json({ error: 'Failed to create menu item' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            id,
            agency_id,
            parent_id,
            title,
            menu_type,
            target_type,
            target_value,
            icon,
            order_index,
            is_visible,
            open_in_new_tab,
            css_class
        } = body;

        if (!id || !agency_id) {
            return NextResponse.json({ error: 'id and agency_id are required' }, { status: 400 });
        }

        // Verify the menu item exists
        const existing = await sql`SELECT id FROM menu_items WHERE id = ${parseInt(id)} AND agency_id = ${parseInt(agency_id)}`;
        if (existing.length === 0) {
            return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
        }

        // If parent_id is provided, verify it exists and is not the item itself
        if (parent_id) {
            if (parseInt(parent_id) === parseInt(id)) {
                return NextResponse.json({ error: 'Menu item cannot be its own parent' }, { status: 400 });
            }
            const parent = await sql`SELECT id FROM menu_items WHERE id = ${parseInt(parent_id)} AND agency_id = ${parseInt(agency_id)}`;
            if (parent.length === 0) {
                return NextResponse.json({ error: 'Parent menu item not found' }, { status: 404 });
            }
        }

        const result = await sql`
            UPDATE menu_items 
            SET 
                parent_id = ${parent_id !== undefined ? (parent_id ? parseInt(parent_id) : null) : null},
                title = ${title},
                menu_type = ${menu_type},
                target_type = ${target_type || null},
                target_value = ${target_value || null},
                icon = ${icon || null},
                order_index = ${order_index !== undefined ? order_index : 0},
                is_visible = ${is_visible !== undefined ? is_visible : true},
                open_in_new_tab = ${open_in_new_tab || false},
                css_class = ${css_class || null},
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${parseInt(id)} AND agency_id = ${parseInt(agency_id)}
            RETURNING *
        `;

        return NextResponse.json({ data: result[0], message: 'Menu item updated successfully' });
    } catch (error) {
        console.error('Error updating menu item:', error);
        return NextResponse.json({ error: 'Failed to update menu item' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');
        const agency_id = searchParams.get('agency_id');

        if (!id || !agency_id) {
            return NextResponse.json({ error: 'id and agency_id are required' }, { status: 400 });
        }

        // First, delete or reassign children
        await sql`UPDATE menu_items SET parent_id = NULL WHERE parent_id = ${parseInt(id)}`;

        const result = await sql`
            DELETE FROM menu_items 
            WHERE id = ${parseInt(id)} AND agency_id = ${parseInt(agency_id)}
            RETURNING *
        `;

        if (result.length === 0) {
            return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Menu item deleted successfully' });
    } catch (error) {
        console.error('Error deleting menu item:', error);
        return NextResponse.json({ error: 'Failed to delete menu item' }, { status: 500 });
    }
}
