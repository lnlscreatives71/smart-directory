import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

/**
 * Public Menu API - Get the published menu for frontend display
 * 
 * GET /api/menu?agency_id=X - Get the public menu structure
 */

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const agencyId = searchParams.get('agency_id');

        if (!agencyId) {
            return NextResponse.json({ error: 'agency_id is required' }, { status: 400 });
        }

        // Get menu settings
        const settings = await sql`
            SELECT * FROM menu_settings 
            WHERE agency_id = ${parseInt(agencyId)}
        `;

        // Get all visible menu items, ordered by order_index
        const menuItems = await sql`
            SELECT * FROM menu_items 
            WHERE agency_id = ${parseInt(agencyId)}
            AND is_visible = true
            ORDER BY order_index ASC
        `;

        // Build hierarchical structure with URL generation
        const buildMenuTree = (items: any[], parentId: number | null = null, depth: number = 0) => {
            const maxDepth = settings[0]?.max_depth || 2;
            if (depth >= maxDepth) return [];

            return items
                .filter(item => item.parent_id === parentId)
                .map(item => {
                    // Generate URL based on menu_type
                    let href = '#';
                    switch (item.menu_type) {
                        case 'category':
                            href = `/category/${item.target_value}`;
                            break;
                        case 'tag':
                            href = `/tag/${item.target_value}`;
                            break;
                        case 'custom_link':
                            href = item.target_value || '#';
                            break;
                        case 'listing':
                            href = `/biz/${item.target_value}`;
                            break;
                    }

                    return {
                        id: item.id,
                        title: item.title,
                        href,
                        icon: item.icon,
                        open_in_new_tab: item.open_in_new_tab,
                        css_class: item.css_class,
                        menu_type: item.menu_type,
                        children: buildMenuTree(items, item.id, depth + 1)
                    };
                });
        };

        const menuTree = buildMenuTree(menuItems);

        return NextResponse.json({
            data: {
                settings: settings[0] || {
                    menu_name: 'Main Menu',
                    max_depth: 2,
                    show_icons: true,
                    layout_style: 'dropdown'
                },
                menu: menuTree
            }
        });
    } catch (error) {
        console.error('Error fetching public menu:', error);
        return NextResponse.json({ error: 'Failed to fetch menu' }, { status: 500 });
    }
}
