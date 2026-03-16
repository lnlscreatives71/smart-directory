import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    let dbConnected = false;
    
    try {
        await sql`SELECT 1`;
        dbConnected = true;
    } catch (err) {
        console.error('Database connection failed:', err);
    }

    return NextResponse.json({
        api: true,
        db: dbConnected,
        timestamp: new Date().toISOString()
    });
}
