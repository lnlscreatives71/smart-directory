const SITE_NAME = 'The Triangle Hub';
const SITE_URL = 'https://thetrianglehub.online';
const UPGRADE_URL = `${SITE_URL}/pricing`;
const LOGO_URL = `${SITE_URL}/triangle-hub-logo-dark.png`;
const PRIMARY_COLOR = '#6366f1';

function baseTemplate(content: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${SITE_NAME}</title>
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;color:#e2e8f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <!-- Header -->
        <tr>
          <td align="center" style="padding-bottom:32px;">
            <a href="${SITE_URL}">
              <img src="${LOGO_URL}" alt="${SITE_NAME}" height="50" style="display:block;" />
            </a>
          </td>
        </tr>
        <!-- Card -->
        <tr>
          <td style="background:#1e293b;border-radius:16px;padding:40px;border:1px solid #334155;">
            ${content}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td align="center" style="padding-top:24px;font-size:12px;color:#475569;">
            <p style="margin:0;">© ${new Date().getFullYear()} ${SITE_NAME} · Raleigh, NC</p>
            <p style="margin:4px 0 0;"><a href="${SITE_URL}" style="color:#6366f1;text-decoration:none;">thetrianglehub.online</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function ctaButton(text: string, url: string): string {
    return `<a href="${url}" style="display:inline-block;margin-top:24px;padding:14px 32px;background:${PRIMARY_COLOR};color:#fff;font-weight:700;font-size:16px;text-decoration:none;border-radius:10px;">${text}</a>`;
}

function greeting(contactName?: string | null): string {
    return contactName ? `Hi ${contactName},` : 'Hi there,';
}

// ─── Email 1: Notification & Introduction ───────────────────────────────────
export function email1_notification(businessName: string, contactName: string | null, listingId: number): string {
    const claimUrl = `${SITE_URL}/biz/claim?id=${listingId}`;
    return baseTemplate(`
        <h1 style="margin:0 0 8px;font-size:24px;color:#fff;">Your business is live! 🎉</h1>
        <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;">${greeting(contactName)}</p>
        <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
            We're excited to let you know that <strong style="color:#fff;">${businessName}</strong> has been added to 
            <strong style="color:#6366f1;">${SITE_NAME}</strong> — the Triangle region's local business directory.
        </p>
        <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
            Your listing is already helping local residents discover you. To verify your info, add photos, 
            and take full control of your profile, claim it for free today.
        </p>
        <div style="background:#0f172a;border-radius:10px;padding:16px 20px;margin:24px 0;border-left:4px solid ${PRIMARY_COLOR};">
            <p style="margin:0;color:#94a3b8;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Your Business</p>
            <p style="margin:4px 0 0;color:#fff;font-size:18px;font-weight:700;">${businessName}</p>
        </div>
        ${ctaButton('Claim Your Free Profile →', claimUrl)}
        <p style="margin-top:20px;color:#64748b;font-size:13px;">This takes less than 2 minutes. No credit card required.</p>
    `);
}

// ─── Email 2: Reminder & Benefits (Premium Upsell) ───────────────────────────
export function email2_upsell(businessName: string, contactName: string | null): string {
    return baseTemplate(`
        <h1 style="margin:0 0 8px;font-size:24px;color:#fff;">Get more leads from your listing 📈</h1>
        <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;">${greeting(contactName)}</p>
        <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
            <strong style="color:#fff;">${businessName}</strong> is listed on ${SITE_NAME}, 
            but your competitors with <strong style="color:#f59e0b;">Premium</strong> profiles are getting 
            significantly more visibility and clicks.
        </p>
        <p style="color:#cbd5e1;font-size:15px;">Here's what Premium unlocks for just <strong style="color:#6366f1;">$29/month</strong>:</p>
        <table cellpadding="0" cellspacing="0" style="margin:16px 0;width:100%;">
            ${[
                ['🔝', 'Priority Ranking', 'Appear above free listings in every search'],
                ['⭐', 'Featured Badge', 'Stand out on the homepage and category pages'],
                ['🤖', 'AI Chat Widget', 'Let visitors get instant answers & book appointments'],
                ['📅', 'Booking Calendar', 'Turn profile visitors into booked appointments'],
                ['📰', 'News & Jobs Board', 'Post announcements and hiring openings'],
            ].map(([icon, title, desc]) => `
            <tr>
              <td style="padding:10px 12px;background:#0f172a;border-radius:8px;margin-bottom:8px;vertical-align:top;width:36px;font-size:20px;">${icon}</td>
              <td style="padding:10px 12px;background:#0f172a;border-radius:8px;width:8px;"></td>
              <td style="padding:10px 0;vertical-align:top;">
                <strong style="color:#fff;font-size:14px;display:block;">${title}</strong>
                <span style="color:#94a3b8;font-size:13px;">${desc}</span>
              </td>
            </tr>
            <tr><td colspan="3" style="height:8px;"></td></tr>`).join('')}
        </table>
        ${ctaButton('Upgrade to Premium — $29/mo →', UPGRADE_URL)}
        <p style="margin-top:20px;color:#64748b;font-size:13px;">Cancel anytime. No contracts.</p>
    `);
}

// ─── Email 3: Finalization Notice ────────────────────────────────────────────
export function email3_finalization(businessName: string, contactName: string | null, listingId: number): string {
    const claimUrl = `${SITE_URL}/biz/claim?id=${listingId}`;
    return baseTemplate(`
        <h1 style="margin:0 0 8px;font-size:24px;color:#fff;">We're finalizing listings this week ⚠️</h1>
        <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;">${greeting(contactName)}</p>
        <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
            We noticed the listing for <strong style="color:#fff;">${businessName}</strong> on ${SITE_NAME} 
            hasn't been claimed or verified yet.
        </p>
        <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
            We're doing a final review of all unclaimed profiles this week. 
            Unclaimed listings may have outdated information that could confuse potential customers.
        </p>
        <div style="background:#7f1d1d30;border:1px solid #ef444460;border-radius:10px;padding:16px 20px;margin:20px 0;">
            <p style="margin:0;color:#fca5a5;font-size:14px;">
                ⚠️ <strong>Action needed:</strong> Confirm your business details are accurate so local customers can find you with the right info.
            </p>
        </div>
        ${ctaButton('Confirm & Claim My Listing →', claimUrl)}
        <p style="margin-top:20px;color:#64748b;font-size:13px;">Free to claim · Takes 2 minutes</p>
    `);
}

// ─── Email 4: Final Reminder ──────────────────────────────────────────────────
export function email4_finalReminder(businessName: string, contactName: string | null, listingId: number): string {
    const claimUrl = `${SITE_URL}/biz/claim?id=${listingId}`;
    return baseTemplate(`
        <h1 style="margin:0 0 8px;font-size:24px;color:#fff;">Last chance — don't miss out 🚨</h1>
        <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;">${greeting(contactName)}</p>
        <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
            This is our final outreach for <strong style="color:#fff;">${businessName}</strong> on ${SITE_NAME}.
        </p>
        <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
            Hundreds of local residents search our directory every week looking for businesses just like yours. 
            Claiming your profile ensures they find <em>you</em> — not a competitor.
        </p>
        <div style="background:#1e3a5f50;border:1px solid #3b82f660;border-radius:10px;padding:16px 20px;margin:20px 0;">
            <p style="margin:0;color:#93c5fd;font-size:14px;">
                🎁 <strong>Special offer:</strong> Claim your free listing today and get your <strong>first month of Premium for 50% off</strong> — just mention this email to our team.
            </p>
        </div>
        ${ctaButton('Claim My Free Listing Now →', claimUrl)}
        <hr style="border:none;border-top:1px solid #1e293b;margin:28px 0;" />
        <p style="color:#475569;font-size:13px;line-height:1.6;">
            If you'd prefer not to hear from us again, simply reply with "remove" and we'll take you off our list.
        </p>
    `);
}
