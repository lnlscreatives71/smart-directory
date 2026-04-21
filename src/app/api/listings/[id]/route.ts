import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { sendEmail } from '@/lib/email';
import crypto from 'crypto';

const SITE_URL = process.env.NEXTAUTH_URL || 'https://thetrianglehub.online';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const result = await sql`SELECT * FROM listings WHERE id = ${id} LIMIT 1`;
        if (result.length === 0) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
        return NextResponse.json({ success: true, data: result[0] });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        const user = session?.user as any;

        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const isAdmin = user.role === 'admin';
        const isSmbOwner = user.role === 'smb' && Number(user.listingId) === Number(id);

        if (!isAdmin && !isSmbOwner) {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();

        if (isAdmin) {
            // Admin: full update
            const {
                name, slug, category, description, location_city, location_state, location_region,
                lat, lng, services, rating, featured, plan_id, feature_flags, contact_email, contact_email_2, claimed,
                contact_name, phone, website, street_address, zip_code, social_media, recommended_services,
                image_url
            } = body;

            const result = await sql`
                UPDATE listings SET
                    name = ${name},
                    slug = ${slug},
                    category = ${category},
                    description = ${description},
                    location_city = ${location_city},
                    location_state = ${location_state},
                    location_region = ${location_region},
                    lat = ${lat || null},
                    lng = ${lng || null},
                    services = ${JSON.stringify(services || [])},
                    rating = ${rating || 0},
                    featured = ${featured || false},
                    claimed = ${claimed || false},
                    plan_id = ${plan_id},
                    feature_flags = ${JSON.stringify(feature_flags || {})},
                    contact_email = ${contact_email || null},
                    contact_email_2 = ${contact_email_2 || null},
                    contact_name = ${contact_name || null},
                    phone = ${phone || null},
                    website = ${website || null},
                    street_address = ${street_address || null},
                    zip_code = ${zip_code || null},
                    social_media = ${social_media ? JSON.stringify(social_media) : null},
                    recommended_services = ${recommended_services || null},
                    image_url = ${image_url || null},
                    updated_at = NOW()
                WHERE id = ${id}
                RETURNING *
            `;
            // If admin just marked this listing as claimed, send SMB portal access email
            if (claimed && contact_email) {
                try {
                    const normalizedEmail = contact_email.toLowerCase().trim();
                    let [smbUser] = await sql`SELECT id, name FROM users WHERE email = ${normalizedEmail} AND role = 'smb' LIMIT 1`;

                    if (!smbUser) {
                        const [newUser] = await sql`
                            INSERT INTO users (email, name, role, listing_id, created_at)
                            VALUES (${normalizedEmail}, ${contact_name || name}, 'smb', ${id}, NOW())
                            RETURNING id, name
                        `;
                        smbUser = newUser;
                        // Link listing to this user
                        await sql`UPDATE listings SET user_id = ${smbUser.id} WHERE id = ${id}`;
                    }

                    const magicToken = crypto.randomBytes(48).toString('hex');
                    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);
                    await sql`UPDATE users SET magic_token = ${magicToken}, magic_token_expires_at = ${expiresAt.toISOString()} WHERE id = ${smbUser.id}`;

                    const magicLink = `${SITE_URL}/api/smb/magic-login?token=${magicToken}`;
                    const businessName = name || 'your business';

                    await sendEmail({
                        to: normalizedEmail,
                        subject: `Your listing for ${businessName} has been verified!`,
                        html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:40px 20px;background:#0f172a;font-family:Arial,sans-serif;color:#e2e8f0;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center">
      <table width="560" style="max-width:560px;background:#1e293b;border-radius:16px;padding:40px;border:1px solid #334155;">
        <tr><td>
          <h2 style="margin:0 0 16px;color:#fff;font-size:22px;">Your listing is verified! 🎉</h2>
          <p style="color:#cbd5e1;font-size:15px;line-height:1.7;margin:0 0 16px;">
            Hi ${smbUser.name || 'there'}, your listing for <strong>${businessName}</strong> has been verified on ${process.env.NEXT_PUBLIC_SITE_NAME || 'The Triangle Hub'}.
          </p>
          <p style="color:#cbd5e1;font-size:15px;line-height:1.7;margin:0 0 28px;">
            Click below to log in to your Business Portal where you can:
          </p>
          <ul style="color:#94a3b8;font-size:14px;line-height:2;margin:0 0 28px;padding-left:20px;">
            <li>Add or update your photos</li>
            <li>Edit your business description and services</li>
            <li>Update your contact info and hours</li>
            <li>Upgrade to a Premium listing</li>
          </ul>
          <a href="${magicLink}" style="display:inline-block;padding:14px 32px;background:#6366f1;color:#fff;font-weight:700;font-size:16px;text-decoration:none;border-radius:10px;">
            Access My Business Portal →
          </a>
          <p style="color:#475569;font-size:13px;margin:24px 0 0;">
            This link expires in 72 hours. If you have questions, reply to this email.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
                        `,
                    });
                } catch (emailErr) {
                    console.error('Failed to send claim verified email:', emailErr);
                    // Don't fail the save — email is best-effort
                }
            }

            revalidatePath('/sitemap.xml');

            return NextResponse.json({ success: true, data: result[0] });
        }

        // SMB: restricted fields only (no plan_id, featured, feature_flags, claimed, slug)
        const { name, description, phone, website, contact_name, contact_email, services } = body;

        const result = await sql`
            UPDATE listings SET
                name = ${name},
                description = ${description},
                phone = ${phone || null},
                website = ${website || null},
                contact_name = ${contact_name || null},
                contact_email = ${contact_email || null},
                services = ${JSON.stringify(services || [])},
                updated_at = NOW()
            WHERE id = ${id}
            RETURNING *
        `;
        revalidatePath('/sitemap.xml');
        return NextResponse.json({ success: true, data: result[0] });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}

// Lightweight partial update — admin only (modifies plan_id, claimed, featured)
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        const user = session?.user as any;

        if (!user || user.role !== 'admin') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        if ('active' in body) {
            await sql`UPDATE listings SET active = ${body.active}, updated_at = NOW() WHERE id = ${id}`;
        }
        if ('featured' in body) {
            await sql`UPDATE listings SET featured = ${body.featured}, updated_at = NOW() WHERE id = ${id}`;
        }
        if ('claimed' in body) {
            await sql`UPDATE listings SET claimed = ${body.claimed}, updated_at = NOW() WHERE id = ${id}`;
        }
        if ('plan_id' in body) {
            await sql`UPDATE listings SET plan_id = ${body.plan_id}, updated_at = NOW() WHERE id = ${id}`;
        }

        const updated = await sql`SELECT * FROM listings WHERE id = ${id} LIMIT 1`;

        if ('active' in body || 'claimed' in body) {
            revalidatePath('/sitemap.xml');
        }

        return NextResponse.json({ success: true, data: updated[0] });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}

// Admin only
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        const user = session?.user as any;

        if (!user || user.role !== 'admin') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        await sql`DELETE FROM listings WHERE id = ${id}`;
        revalidatePath('/sitemap.xml');
        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
