/**
 * POST /api/auth/reset-password { token, password }
 *
 * Validates the reset token and sets a new password_hash.
 * One-time use: the token is burned on success.
 */
import { sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
    try {
        const { token, password } = await req.json();

        if (!token || typeof token !== 'string') {
            return NextResponse.json({ success: false, error: 'Missing token' }, { status: 400 });
        }
        if (!password || typeof password !== 'string' || password.length < 8) {
            return NextResponse.json({ success: false, error: 'Password must be at least 8 characters' }, { status: 400 });
        }

        const [user] = await sql`
            SELECT id, email
            FROM users
            WHERE magic_token = ${token}
              AND magic_token_expires_at > NOW()
            LIMIT 1
        `;

        if (!user) {
            return NextResponse.json({ success: false, error: 'This reset link has expired or already been used.' }, { status: 400 });
        }

        const password_hash = await bcrypt.hash(password, 10);

        await sql`
            UPDATE users
            SET password_hash = ${password_hash},
                magic_token = NULL,
                magic_token_expires_at = NULL
            WHERE id = ${user.id}
        `;

        return NextResponse.json({ success: true, email: user.email });
    } catch (e: any) {
        console.error('reset-password error:', e);
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    // Token validity check (for the reset page to show a friendly error before user types)
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    if (!token) return NextResponse.json({ success: false, error: 'Missing token' }, { status: 400 });

    const [user] = await sql`
        SELECT id, email FROM users
        WHERE magic_token = ${token}
          AND magic_token_expires_at > NOW()
        LIMIT 1
    `;
    if (!user) return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 400 });

    return NextResponse.json({ success: true, email: user.email });
}
