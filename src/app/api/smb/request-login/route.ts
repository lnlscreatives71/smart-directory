/**
 * POST /api/smb/request-login
 *
 * Sends a new magic login link to an SMB user's email.
 * Rate-limited: won't resend if a valid token was issued in the last 5 minutes.
 * Always returns success=true to prevent email enumeration.
 */
import { sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import crypto from 'crypto';

const SITE_URL = process.env.NEXTAUTH_URL || 'https://thetrianglehub.online';

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();
        if (!email || typeof email !== 'string') {
            return NextResponse.json({ success: false, error: 'Email required' }, { status: 400 });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Look up the SMB user
        const [user] = await sql`
            SELECT id, email, name, magic_token_expires_at
            FROM users
            WHERE email = ${normalizedEmail}
              AND role = 'smb'
            LIMIT 1
        `;

        // Always return success to prevent enumeration
        if (!user) {
            return NextResponse.json({ success: true });
        }

        // Rate limit: don't resend if token was issued < 5 minutes ago
        const existingExpiry = user.magic_token_expires_at as Date | null;
        if (existingExpiry) {
            const tokenAge = Date.now() - (existingExpiry.getTime() - 72 * 60 * 60 * 1000);
            if (tokenAge < 5 * 60 * 1000) {
                return NextResponse.json({ success: true }); // silently skip
            }
        }

        const magicToken = crypto.randomBytes(48).toString('hex');
        const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);

        await sql`
            UPDATE users
            SET magic_token = ${magicToken}, magic_token_expires_at = ${expiresAt.toISOString()}
            WHERE id = ${user.id}
        `;

        const magicLink = `${SITE_URL}/api/smb/magic-login?token=${magicToken}`;

        await sendEmail({
            to: normalizedEmail,
            subject: 'Your Business Portal Login Link',
            html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:40px 20px;background:#0f172a;font-family:Arial,sans-serif;color:#e2e8f0;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center">
      <table width="560" style="max-width:560px;background:#1e293b;border-radius:16px;padding:40px;border:1px solid #334155;">
        <tr><td>
          <h2 style="margin:0 0 8px;color:#fff;font-size:22px;">Your login link is ready</h2>
          <p style="color:#94a3b8;margin:0 0 24px;font-size:15px;">Hi ${user.name || 'there'},</p>
          <p style="color:#cbd5e1;font-size:15px;line-height:1.7;margin:0 0 28px;">
            Click below to access your Business Portal. This link expires in 72 hours and can only be used once.
          </p>
          <a href="${magicLink}" style="display:inline-block;padding:14px 32px;background:#6366f1;color:#fff;font-weight:700;font-size:16px;text-decoration:none;border-radius:10px;">
            Log In to My Dashboard →
          </a>
          <p style="color:#475569;font-size:13px;margin:24px 0 0;">
            If you didn't request this, you can safely ignore this email.
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
        console.error('request-login error:', e);
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}
