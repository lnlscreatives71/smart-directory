import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr);
        const body = await request.json();
        const { name, monthly_price, annual_price, description, limits, active, is_default } = body;

        // Handle toggle-only update (just active field)
        if (Object.keys(body).length === 1 && 'active' in body) {
            await sql`UPDATE plans SET active = ${active} WHERE id = ${id}`;
            return NextResponse.json({ success: true });
        }

        await sql`
            UPDATE plans SET
                name = ${name},
                monthly_price = ${monthly_price},
                annual_price = ${annual_price ?? 0},
                description = ${description ?? ''},
                limits = ${JSON.stringify(limits ?? {})},
                active = ${active ?? true},
                is_default = ${is_default ?? false}
            WHERE id = ${id}
        `;

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr);
        // Prevent deleting if listings use this plan
        const inUse = await sql`SELECT COUNT(*) as count FROM listings WHERE plan_id = ${id}`;
        if (parseInt(inUse[0].count as string) > 0) {
            return NextResponse.json({
                success: false,
                error: `Cannot delete — ${inUse[0].count} listing(s) are on this plan. Reassign them first.`
            }, { status: 409 });
        }
        await sql`DELETE FROM plans WHERE id = ${id}`;
        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
