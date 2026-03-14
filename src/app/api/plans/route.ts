import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Ensure the plans table has the new columns
async function ensureColumns() {
    try {
        await sql`ALTER TABLE plans ADD COLUMN IF NOT EXISTS annual_price DECIMAL(10,2) DEFAULT 0`;
        await sql`ALTER TABLE plans ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE`;
        await sql`ALTER TABLE plans ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT FALSE`;
        await sql`ALTER TABLE plans ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb`;
    } catch { /* columns likely already exist */ }
}

export async function GET() {
    try {
        await ensureColumns();
        const plans = await sql`SELECT * FROM plans ORDER BY monthly_price ASC`;
        return NextResponse.json({ success: true, data: plans });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await ensureColumns();
        const body = await request.json();
        const { name, monthly_price, annual_price, description, limits, active, is_default, features } = body;

        if (!name || monthly_price === undefined) {
            return NextResponse.json({ success: false, error: 'name and monthly_price are required' }, { status: 400 });
        }

        const inserted = await sql`
            INSERT INTO plans (name, monthly_price, annual_price, description, limits, active, is_default, features)
            VALUES (
                ${name},
                ${monthly_price},
                ${annual_price ?? 0},
                ${description ?? ''},
                ${JSON.stringify(limits ?? { images: 1, categories: 1 })},
                ${active ?? true},
                ${is_default ?? false},
                ${JSON.stringify(features ?? [])}
            )
            RETURNING *
        `;

        return NextResponse.json({ success: true, data: inserted[0] });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
