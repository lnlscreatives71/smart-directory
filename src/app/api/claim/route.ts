import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { id } = await req.json();
        if (!id) return NextResponse.json({ success: false, error: 'No ID' }, { status: 400 });

        await sql`
      UPDATE listings 
      SET claimed = true, updated_at = NOW() 
      WHERE id = ${id}
    `;

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
