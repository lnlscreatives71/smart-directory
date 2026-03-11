import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';
import { Plan } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const plans = await sql`SELECT * FROM plans ORDER BY monthly_price ASC` as any as Plan[];
        return NextResponse.json({ success: true, data: plans });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
