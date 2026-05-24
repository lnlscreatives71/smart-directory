/**
 * POST /api/auth/request-reset
 *
 * Sends a password reset link to a user (any role). Uses the existing
 * magic_token columns for storage. Always returns success to prevent
 * email enumeration. Rate-limited to one email per 5 minutes.
 */
import { sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import crypto from 'crypto';

const SITE_URL = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://thetrianglehub.online';
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'The Triangle Hub';

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();
        if (!email || typeof email !== 'string') {
            return NextResponse.json({ success: false, error: 'Email required' }, { status: 400 });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const [user] = await sql`
            SELECT id, email, name, magic_token_expires_at
            FROM users
            WHERE email = ${normalizedEmail}
            LIMIT 1
        `;

        if (!user) {
            return NextResponse.json({ success: true });
        }

        // Rate limit: token issued less than 5 minutes ago → silently no-op
        const existingExpiry = user.magic_token_expires_at as Date | null;
        if (existingExpiry) {
            const tokenAge = Date.now() - (existingExpiry.getTime() - 60 * 60 * 1000);
            if (tokenAge < 5 * 60 * 1000) {
                return NextResponse.json({ success: true });
            }
        }

        const token = crypto.randomBytes(48).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await sql`
            UPDATE users
            SET magic_token = ${token}, magic_token_expires_at = ${expiresAt.toISOString()}
            WHERE id = ${user.id}
        `;

        const resetLink = `${SITE_URL}/reset-password?token=${token}`;

        await sendEmail({
            to: normalizedEmail,
            subject: `Reset your ${SITE_NAME} password`,
            html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:40px 20px;background:#0f172a;font-family:Arial,sans-serif;color:#e2e8f0;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center">
      <table width="560" style="max-width:560px;background:#1e293b;border-radius:16px;padding:40px;border:1px solid #334155;">
        <tr><td>
          <h2 style="margin:0 0 8px;color:#fff;font-size:22px;">Reset your password</h2>
          <p style="color:#94a3b8;margin:0 0 24px;font-size:15px;">Hi ${user.name || 'there'},</p>
          <p style="color:#cbd5e1;font-size:15px;line-height:1.7;margin:0 0 28px;">
            We received a request to reset the password for your ${SITE_NAME} account.
            Click the button below to choose a new password. This link expires in 1 hour and can only be used once.
          </p>
          <a href="${resetLink}" style="display:inline-block;padding:14px 32px;background:#6366f1;color:#fff;font-weight:700;font-size:16px;text-decoration:none;border-radius:10px;">
            Reset My Password →
          </a>
          <p style="color:#475569;font-size:13px;margin:24px 0 0;">
            If you didn't request this, you can safely ignore this email — your password won't change.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
            `,
        });

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error('request-reset error:', e);
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}
