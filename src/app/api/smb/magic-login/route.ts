/**
 * GET /api/smb/magic-login?token=...
 *
 * Validates a magic login token for an SMB user.
 * Redirects to /smb/auth-callback with the email + token encoded for client-side signIn.
 * The token is burned during the signIn authorize callback (one-time use enforced there).
 */
import { sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
        return NextResponse.redirect(new URL('/smb/login?error=missing_token', request.url));
    }

    try {
        // Validate the token exists and hasn't expired
        const [user] = await sql`
            SELECT id, email, name
            FROM users
            WHERE magic_token = ${token}
              AND role = 'smb'
              AND magic_token_expires_at > NOW()
            LIMIT 1
        `;

        if (!user) {
            return NextResponse.redirect(new URL('/smb/login?error=invalid_token', request.url));
        }

        // Pass email + token to auth-callback for client-side signIn
        // Token is burned inside authOptions.authorize on signIn
        const st = Buffer.from(JSON.stringify({
            email: user.email,
            token,
            exp: Date.now() + 5 * 60 * 1000, // 5-minute window for the callback page
        })).toString('base64url');

        return NextResponse.redirect(new URL(`/smb/auth-callback?st=${st}`, request.url));
    } catch (e: any) {
        console.error('Magic login error:', e);
        return NextResponse.redirect(new URL('/smb/login?error=server_error', request.url));
    }
}
