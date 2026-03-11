import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';
import { Plan } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const plans = await sql<Plan[]>`SELECT * FROM plans ORDER BY monthly_price ASC`;
        return NextResponse.json({ success: true, data: plans });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
