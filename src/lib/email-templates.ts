const SITE_NAME = 'The Triangle Hub';
const SITE_URL = 'https://thetrianglehub.online';
const UPGRADE_URL = `${SITE_URL}/pricing`;
const LOGO_URL = `${SITE_URL}/triangle-hub-logo-dark.png`;
const PRIMARY_COLOR = '#6366f1';

function baseTemplate(content: string, preheader?: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${SITE_NAME}</title>
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;color:#e2e8f0;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌</div>` : ''}
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

// ═══════════════════════════════════════════════════════════════════════════
// ─── B VARIANTS (different angle: curiosity / social proof driven) ─────────
// ═══════════════════════════════════════════════════════════════════════════

// B: Email 1 — Social proof angle ("Your neighbors are finding you")
export function email1_notification_B(businessName: string, contactName: string | null, listingId: number): string {
    const claimUrl = `${SITE_URL}/biz/claim?id=${listingId}`;
    return baseTemplate(`
        <h1 style="margin:0 0 8px;font-size:24px;color:#fff;">Your neighbors are already finding you 👋</h1>
        <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;">${greeting(contactName)}</p>
        <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
            Local residents in the Triangle are actively searching for businesses like 
            <strong style="color:#fff;">${businessName}</strong> — and your listing on 
            <strong style="color:#6366f1;">${SITE_NAME}</strong> is already showing up.
        </p>
        <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
            But here's the thing: unclaimed profiles can show outdated info. 
            Claim yours in under 2 minutes to make sure searchers see exactly what you want them to see.
        </p>
        <div style="background:#0f172a;border-radius:10px;padding:16px 20px;margin:24px 0;border-left:4px solid #10b981;">
            <p style="margin:0;color:#6ee7b7;font-size:14px;">✅ <strong>Free to claim</strong> — No credit card, no commitment.</p>
        </div>
        ${ctaButton('Take Control of My Profile →', claimUrl)}
        <p style="margin-top:20px;color:#64748b;font-size:13px;">It takes less than 2 minutes.</p>
    `);
}

// B: Email 2 — ROI/outcome angle instead of feature list
export function email2_upsell_B(businessName: string, contactName: string | null): string {
    return baseTemplate(`
        <h1 style="margin:0 0 8px;font-size:24px;color:#fff;">What would 10 more customers a month mean for you? 🤔</h1>
        <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;">${greeting(contactName)}</p>
        <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
            Premium businesses on ${SITE_NAME} see significantly more profile visits, 
            more booking requests, and more direct leads than standard free listings.
        </p>
        <div style="background:#0f172a;border-radius:12px;padding:24px;margin:20px 0;text-align:center;">
            <p style="margin:0 0 4px;color:#94a3b8;font-size:13px;text-transform:uppercase;letter-spacing:0.1em;">Premium is just</p>
            <p style="margin:0;color:#6366f1;font-size:42px;font-weight:800;">$29<span style="font-size:18px;color:#94a3b8;">/mo</span></p>
            <p style="margin:8px 0 0;color:#64748b;font-size:13px;">Less than one new customer covers it for the month.</p>
        </div>
        <p style="color:#cbd5e1;font-size:15px;">With Premium, <strong style="color:#fff;">${businessName}</strong> gets:</p>
        <ul style="color:#cbd5e1;font-size:15px;line-height:2;padding-left:20px;">
            <li>🔝 Featured placement above free listings</li>
            <li>🤖 AI Chat to capture leads 24/7</li>
            <li>📅 Built-in booking calendar</li>
            <li>⭐ Highlighted "Featured" badge</li>
            <li>📰 News & job posting boards</li>
        </ul>
        ${ctaButton('Start My Premium Trial →', UPGRADE_URL)}
        <p style="margin-top:20px;color:#64748b;font-size:13px;">Cancel anytime. No long-term contracts.</p>
    `);
}

// B: Email 3 — Competitor angle ("your competitors just upgraded")
export function email3_finalization_B(businessName: string, contactName: string | null, listingId: number): string {
    const claimUrl = `${SITE_URL}/biz/claim?id=${listingId}`;
    return baseTemplate(`
        <h1 style="margin:0 0 8px;font-size:24px;color:#fff;">Other businesses in your area just upgraded 🏆</h1>
        <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;">${greeting(contactName)}</p>
        <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
            We wanted to give <strong style="color:#fff;">${businessName}</strong> a heads up: 
            several local businesses in your category have recently claimed and upgraded their listings on ${SITE_NAME}.
        </p>
        <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
            That means they're now showing up above you in local searches, taking appointments through their profile, 
            and getting seen first by residents in your area.
        </p>
        <div style="background:#7f1d1d30;border:1px solid #ef444460;border-radius:10px;padding:16px 20px;margin:20px 0;">
            <p style="margin:0;color:#fca5a5;font-size:14px;">
                ⚠️ Your listing is still unclaimed — don't let competitors get all the local traffic.
            </p>
        </div>
        ${ctaButton('Claim My Listing & Stay Competitive →', claimUrl)}
        <p style="margin-top:20px;color:#64748b;font-size:13px;">Free to claim · Upgrade optional</p>
    `);
}

// B: Email 4 — Direct, no-fluff "we're closing your file" angle
export function email4_finalReminder_B(businessName: string, contactName: string | null, listingId: number): string {
    const claimUrl = `${SITE_URL}/biz/claim?id=${listingId}`;
    return baseTemplate(`
        <h1 style="margin:0 0 8px;font-size:24px;color:#fff;">We're closing your file soon 📁</h1>
        <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;">${greeting(contactName)}</p>
        <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
            This is our last email about the <strong style="color:#fff;">${businessName}</strong> listing on ${SITE_NAME}.
        </p>
        <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
            We'll keep your listing live — but without claiming it, you lose the ability to edit your info, 
            respond to leads, or access premium features.
        </p>
        <div style="background:#1e3a5f50;border:1px solid #3b82f660;border-radius:10px;padding:16px 20px;margin:20px 0;">
            <p style="margin:0;color:#93c5fd;font-size:14px;">
                🎁 Claim today and get <strong>50% off your first Premium month</strong> — just mention this email.
            </p>
        </div>
        ${ctaButton('Claim Before We Close Your File →', claimUrl)}
        <hr style="border:none;border-top:1px solid #1e293b;margin:28px 0;" />
        <p style="color:#475569;font-size:13px;">Reply "remove" to opt out of future messages.</p>
    `);
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── A/B Dispatcher ────────────────────────────────────────────────────────
// Returns the correct template set based on the assigned variant.
// Usage: const emails = getEmailSet('A'); emails.email1(name, contactName, id);
// ═══════════════════════════════════════════════════════════════════════════

export type ABVariant = 'A' | 'B';

export function assignVariant(): ABVariant {
    return Math.random() < 0.5 ? 'A' : 'B';
}

export function getEmailSet(variant: ABVariant) {
    if (variant === 'B') {
        return {
            email1: email1_notification_B,
            email2: email2_upsell_B,
            email3: email3_finalization_B,
            email4: email4_finalReminder_B,
            subjects: {
                email1: 'Your neighbors are already finding you on The Triangle Hub',
                email2: 'What would 10 more customers a month mean for you?',
                email3: 'Other local businesses just upgraded — are you next?',
                email4: "We're closing your file soon",
            }
        };
    }
    // Default: Variant A
    return {
        email1: email1_notification,
        email2: email2_upsell,
        email3: email3_finalization,
        email4: email4_finalReminder,
        subjects: {
            email1: (name: string) => `${name} is now live on The Triangle Hub!`,
            email2: (name: string) => `Upgrade ${name} and get 4x more leads`,
            email3: (name: string) => `Action needed: Confirm your ${name} listing`,
            email4: `Last chance: Don't miss your spot on The Triangle Hub`,
        }
    };
}

// ─── Admin: New Claim Notification ────────────────────────────────────────────
export function adminClaimNotification(businessName: string, claimantName: string | null, claimantEmail: string, listingId: number): string {
    const approveUrl = `${SITE_URL}/dashboard/claims`;
    return baseTemplate(`
        <h1 style="margin:0 0 8px;font-size:24px;color:#fff;">🔔 New Claim Request</h1>
        <p style="color:#94a3b8;font-size:15px;margin:0 0 24px;">Someone just claimed a listing on ${SITE_NAME}. Review and approve or reject below.</p>
        <div style="background:#0f172a;border-radius:12px;padding:20px 24px;margin:0 0 24px;border-left:4px solid #f59e0b;">
            <p style="margin:0 0 8px;color:#fbbf24;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Business</p>
            <p style="margin:0 0 16px;color:#fff;font-size:18px;font-weight:700;">${businessName}</p>
            <p style="margin:0 0 4px;color:#94a3b8;font-size:13px;"><strong style="color:#cbd5e1;">Claimant:</strong> ${claimantName || 'Not provided'}</p>
            <p style="margin:0;color:#94a3b8;font-size:13px;"><strong style="color:#cbd5e1;">Email:</strong> ${claimantEmail}</p>
        </div>
        ${ctaButton('Review Claim in Dashboard →', approveUrl)}
        <p style="margin-top:16px;color:#64748b;font-size:13px;">Log in to your admin dashboard to approve or reject this claim.</p>
    `);
}

// ─── SMB: Claim Approved ───────────────────────────────────────────────────────
export function smbClaimApproved(businessName: string, contactName: string | null, slug: string): string {
    const dashboardUrl = `${SITE_URL}/smb`;
    const profileUrl = `${SITE_URL}/biz/${slug}`;
    return baseTemplate(`
        <h1 style="margin:0 0 8px;font-size:24px;color:#fff;">Your claim has been approved! ✅</h1>
        <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;">${contactName ? `Hi ${contactName},` : 'Hi there,'}</p>
        <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
            Great news — your claim for <strong style="color:#fff;">${businessName}</strong> on
            <strong style="color:#6366f1;">${SITE_NAME}</strong> has been approved.
            Your dashboard is now fully unlocked and you can start managing your listing.
        </p>
        <div style="background:#0f172a;border-radius:12px;padding:20px 24px;margin:24px 0;border-left:4px solid #10b981;">
            <p style="margin:0 0 4px;color:#6ee7b7;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">✅ Your profile is live at</p>
            <a href="${profileUrl}" style="color:#6366f1;font-size:16px;font-weight:700;text-decoration:none;">${profileUrl}</a>
        </div>
        ${ctaButton('Go to My Dashboard →', dashboardUrl)}
        <p style="margin-top:20px;color:#cbd5e1;font-size:14px;line-height:1.7;">From your dashboard you can add photos, update hours, edit your description, and upgrade to Premium for more visibility.</p>
        <hr style="border:none;border-top:1px solid #1e293b;margin:28px 0;" />
        <p style="color:#64748b;font-size:13px;">Questions? Reply to this email and we'll help you out.</p>
    `);
}

// ─── SMB: Claim Rejected ───────────────────────────────────────────────────────
export function smbClaimRejected(businessName: string, contactName: string | null): string {
    return baseTemplate(`
        <h1 style="margin:0 0 8px;font-size:24px;color:#fff;">Update on your claim request</h1>
        <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;">${contactName ? `Hi ${contactName},` : 'Hi there,'}</p>
        <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
            We were unable to verify your ownership of <strong style="color:#fff;">${businessName}</strong> at this time.
            Your claim request has not been approved.
        </p>
        <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
            If you believe this is an error or would like to provide additional verification,
            please reply to this email and we'll be happy to assist.
        </p>
        <hr style="border:none;border-top:1px solid #1e293b;margin:28px 0;" />
        <p style="color:#64748b;font-size:13px;">Reply to this email if you have questions.</p>
    `);
}

// ─── Welcome / Claim Confirmation Email ───────────────────────────────────────
export function welcomeEmail(businessName: string, contactName: string | null, slug: string, magicLink?: string): string {
    const profileUrl = `${SITE_URL}/biz/${slug}`;
    const dashboardSection = magicLink ? `
        <div style="background:#1e3a5f;border-radius:12px;padding:20px 24px;margin:24px 0;border-left:4px solid #6366f1;">
            <p style="margin:0 0 6px;color:#a5b4fc;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">🔑 Access Your Business Dashboard</p>
            <p style="margin:0 0 14px;color:#cbd5e1;font-size:14px;">Click below to log in and manage your listing — update photos, hours, description and more.</p>
            ${ctaButton('Go to My Dashboard →', magicLink)}
            <p style="margin:12px 0 0;color:#64748b;font-size:12px;">This login link expires in 72 hours. You can always request a new one from the login page.</p>
        </div>
    ` : '';

    return baseTemplate(`
        <h1 style="margin:0 0 8px;font-size:24px;color:#fff;">Welcome to The Triangle Hub! 🎉</h1>
        <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;">${contactName ? `Hi ${contactName},` : 'Hi there,'}</p>
        <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
            You've successfully claimed <strong style="color:#fff;">${businessName}</strong> on
            <strong style="color:#6366f1;">The Triangle Hub</strong>. Your listing now shows a
            verified badge and you're live to local customers searching in the Triangle.
        </p>

        <div style="background:#0f172a;border-radius:12px;padding:20px 24px;margin:24px 0;border-left:4px solid #10b981;">
            <p style="margin:0 0 4px;color:#6ee7b7;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">✅ Your profile is live at</p>
            <a href="${profileUrl}" style="color:#6366f1;font-size:16px;font-weight:700;text-decoration:none;">${profileUrl}</a>
        </div>

        ${dashboardSection}

        <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">What you can do from your dashboard:</p>
        <ul style="color:#cbd5e1;font-size:14px;line-height:2.2;padding-left:20px;margin:0 0 24px;">
            <li>📷 Add photos to your profile</li>
            <li>📝 Update your description and services</li>
            <li>🕐 Set your business hours</li>
            <li>🔝 Upgrade to Premium for 4x more visibility</li>
        </ul>

        <a href="${UPGRADE_URL}" style="display:inline-block;padding:12px 28px;background:transparent;color:#6366f1;font-weight:600;font-size:14px;text-decoration:none;border-radius:10px;border:2px solid #6366f1;">
            Explore Premium Features
        </a>

        <hr style="border:none;border-top:1px solid #1e293b;margin:28px 0;" />
        <p style="color:#64748b;font-size:13px;">Questions? Reply to this email and we'll help you out.</p>
    `);
}

// ─── SMB: New Business Submission Received ────────────────────────────────────
export function newBusinessSubmitted(businessName: string, contactName: string, magicLink: string): string {
    return baseTemplate(`
        <h1 style="margin:0 0 8px;font-size:24px;color:#fff;">We've received your submission! 📋</h1>
        <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;">Hi ${contactName},</p>
        <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
            Thanks for submitting <strong style="color:#fff;">${businessName}</strong> to
            <strong style="color:#6366f1;">${SITE_NAME}</strong>. We're reviewing your request and will
            notify you once it's been approved — usually within 1 business day.
        </p>
        <div style="background:#1e3a5f;border-radius:12px;padding:20px 24px;margin:24px 0;border-left:4px solid #6366f1;">
            <p style="margin:0 0 6px;color:#a5b4fc;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">🔑 Your Account is Ready</p>
            <p style="margin:0 0 14px;color:#cbd5e1;font-size:14px;">Your business portal account has been created. Click below to log in and get ready to manage your listing once it's approved.</p>
            ${ctaButton('Access My Business Portal →', magicLink)}
            <p style="margin:12px 0 0;color:#64748b;font-size:12px;">This login link expires in 72 hours. You can request a new one from the login page anytime.</p>
        </div>
        <hr style="border:none;border-top:1px solid #1e293b;margin:28px 0;" />
        <p style="color:#64748b;font-size:13px;">Questions? Reply to this email and we'll help you out.</p>
    `);
}

// ─── Admin: New Business Request Notification ─────────────────────────────────
export function adminNewBusinessNotification(businessName: string, contactName: string, contactEmail: string, requestId: number): string {
    const reviewUrl = `${SITE_URL}/dashboard/claims?tab=new-requests`;
    return baseTemplate(`
        <h1 style="margin:0 0 8px;font-size:24px;color:#fff;">📋 New Business Request</h1>
        <p style="color:#94a3b8;font-size:15px;margin:0 0 24px;">A new business has been submitted for review on ${SITE_NAME}.</p>
        <div style="background:#0f172a;border-radius:12px;padding:20px 24px;margin:0 0 24px;border-left:4px solid #6366f1;">
            <p style="margin:0 0 8px;color:#a5b4fc;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Business Submitted</p>
            <p style="margin:0 0 16px;color:#fff;font-size:18px;font-weight:700;">${businessName}</p>
            <p style="margin:0 0 4px;color:#94a3b8;font-size:13px;"><strong style="color:#cbd5e1;">Contact:</strong> ${contactName}</p>
            <p style="margin:0 0 4px;color:#94a3b8;font-size:13px;"><strong style="color:#cbd5e1;">Email:</strong> ${contactEmail}</p>
            <p style="margin:0;color:#94a3b8;font-size:13px;"><strong style="color:#cbd5e1;">Request ID:</strong> #${requestId}</p>
        </div>
        ${ctaButton('Review in Dashboard →', reviewUrl)}
        <p style="margin-top:16px;color:#64748b;font-size:13px;">Go to Dashboard → Business → New Business Requests to approve or reject.</p>
    `);
}

// ─── SMB: New Business Approved ───────────────────────────────────────────────
export function newBusinessApproved(businessName: string, contactName: string, slug: string, loginUrl: string): string {
    const profileUrl = `${SITE_URL}/biz/${slug}`;
    return baseTemplate(`
        <h1 style="margin:0 0 8px;font-size:24px;color:#fff;">🎉 Your business is now live!</h1>
        <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;">Hi ${contactName},</p>
        <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
            Great news — <strong style="color:#fff;">${businessName}</strong> has been approved and is now listed on
            <strong style="color:#6366f1;">${SITE_NAME}</strong>. Local customers can already find you.
        </p>
        <div style="background:#0f172a;border-radius:12px;padding:20px 24px;margin:24px 0;border-left:4px solid #10b981;">
            <p style="margin:0 0 4px;color:#6ee7b7;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">✅ Your listing is live at</p>
            <a href="${profileUrl}" style="color:#6366f1;font-size:16px;font-weight:700;text-decoration:none;">${profileUrl}</a>
        </div>
        <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">Log in to your dashboard to update photos, add your hours, edit your description, and more.</p>
        ${ctaButton('Go to My Dashboard →', loginUrl)}
        <div style="background:#1e3a5f;border-radius:12px;padding:16px 20px;margin:24px 0;">
            <p style="margin:0 0 6px;color:#a5b4fc;font-size:13px;font-weight:700;">⭐ Want more visibility?</p>
            <p style="margin:0 0 12px;color:#cbd5e1;font-size:13px;">Upgrade to Premium for priority placement, AI chat, online booking, and 4x more leads.</p>
            <a href="${UPGRADE_URL}" style="display:inline-block;padding:10px 24px;background:#6366f1;color:#fff;font-weight:600;font-size:13px;text-decoration:none;border-radius:8px;">Explore Premium</a>
        </div>
        <hr style="border:none;border-top:1px solid #1e293b;margin:28px 0;" />
        <p style="color:#64748b;font-size:13px;">Questions? Reply to this email and we'll help you out.</p>
    `);
}

// ─── SMB: New Business Rejected ───────────────────────────────────────────────
export function newBusinessRejected(businessName: string, contactName: string): string {
    return baseTemplate(`
        <h1 style="margin:0 0 8px;font-size:24px;color:#fff;">Update on your submission</h1>
        <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;">Hi ${contactName},</p>
        <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
            Thank you for submitting <strong style="color:#fff;">${businessName}</strong> to ${SITE_NAME}.
            After review, we were unable to approve this listing at this time.
        </p>
        <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
            If you believe this is an error or would like more information, please reply to this email and we'll be happy to help.
        </p>
        <hr style="border:none;border-top:1px solid #1e293b;margin:28px 0;" />
        <p style="color:#64748b;font-size:13px;">Reply to this email if you have questions.</p>
    `);
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── PREMIUM UPGRADE PUSH (4 emails, +2 days cadence) ──────────────────────
// Triggered: claim approved or new business approved
// ═══════════════════════════════════════════════════════════════════════════

const STRATEGY_CALL_URL = 'https://www.lnlaiagency.com/contact';

export function premiumUpgrade_email1(businessName: string, contactName: string | null): string {
    return baseTemplate(`
        <h1 style="margin:0 0 8px;font-size:24px;color:#fff;">Your listing is live — here's how to get more leads 🚀</h1>
        <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;">${contactName ? `Hi ${contactName},` : 'Hi there,'}</p>
        <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
            <strong style="color:#fff;">${businessName}</strong> is now live on ${SITE_NAME} and local customers can find you.
            But here's the thing — free listings get buried. <strong style="color:#6366f1;">Premium listings get seen first.</strong>
        </p>
        <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">For just <strong style="color:#6366f1;">$29/month</strong>, Premium unlocks:</p>
        <table cellpadding="0" cellspacing="0" style="margin:16px 0;width:100%;">
            ${[
                ['🔝', 'Priority placement', 'Appear above free listings in every search'],
                ['⭐', 'Featured badge', 'Stand out on homepage and category pages'],
                ['🤖', 'AI Chat widget', 'Capture leads and answer questions 24/7'],
                ['📅', 'Online booking', 'Let customers book directly from your profile'],
            ].map(([icon, title, desc]) => `
            <tr>
                <td style="padding:10px 12px;background:#0f172a;border-radius:8px;vertical-align:top;width:36px;font-size:20px;">${icon}</td>
                <td style="width:8px;"></td>
                <td style="padding:10px 0;vertical-align:top;">
                    <strong style="color:#fff;font-size:14px;display:block;">${title}</strong>
                    <span style="color:#94a3b8;font-size:13px;">${desc}</span>
                </td>
            </tr>
            <tr><td colspan="3" style="height:8px;"></td></tr>`).join('')}
        </table>
        ${ctaButton('Upgrade to Premium — $29/mo →', UPGRADE_URL)}
        <p style="margin-top:16px;color:#64748b;font-size:13px;">Cancel anytime. No contracts.</p>
    `, 'See what Premium unlocks — priority placement, AI chat, online booking, and more.');
}

export function premiumUpgrade_email2(businessName: string, contactName: string | null): string {
    return baseTemplate(`
        <h1 style="margin:0 0 8px;font-size:24px;color:#fff;">Why Premium listings get more attention 📈</h1>
        <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;">${contactName ? `Hi ${contactName},` : 'Hi there,'}</p>
        <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
            Here's something eye-opening about how visitors interact with listings on ${SITE_NAME}.
        </p>
        <div style="background:#0f172a;border-radius:12px;padding:24px;margin:20px 0;text-align:center;">
            <p style="margin:0 0 16px;color:#94a3b8;font-size:13px;text-transform:uppercase;letter-spacing:0.1em;">Premium vs. Free</p>
            <table cellpadding="0" cellspacing="0" style="width:100%;">
                <tr>
                    <td style="text-align:center;padding:0 8px;">
                        <p style="margin:0;color:#6366f1;font-size:36px;font-weight:800;">4x</p>
                        <p style="margin:4px 0 0;color:#94a3b8;font-size:13px;">more profile clicks</p>
                    </td>
                    <td style="text-align:center;padding:0 8px;">
                        <p style="margin:0;color:#10b981;font-size:36px;font-weight:800;">3x</p>
                        <p style="margin:4px 0 0;color:#94a3b8;font-size:13px;">more leads captured</p>
                    </td>
                    <td style="text-align:center;padding:0 8px;">
                        <p style="margin:0;color:#f59e0b;font-size:36px;font-weight:800;">#1</p>
                        <p style="margin:4px 0 0;color:#94a3b8;font-size:13px;">search position</p>
                    </td>
                </tr>
            </table>
        </div>
        <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
            Right now, <strong style="color:#fff;">${businessName}</strong> is competing against Premium businesses
            ranked above you. For less than a dollar a day, you can level the playing field — or get ahead.
        </p>
        ${ctaButton('Get Premium Placement — $29/mo →', UPGRADE_URL)}
        <p style="margin-top:16px;color:#64748b;font-size:13px;">Cancel anytime. Takes 2 minutes to set up.</p>
    `, 'Premium listings rank above free ones — less than $1/day to stay ahead of competitors.');
}

export function premiumUpgrade_email3(businessName: string, contactName: string | null): string {
    return baseTemplate(`
        <h1 style="margin:0 0 8px;font-size:24px;color:#fff;">More visibility. More control. 🎛️</h1>
        <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;">${contactName ? `Hi ${contactName},` : 'Hi there,'}</p>
        <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
            Quick question — when a potential customer finds <strong style="color:#fff;">${businessName}</strong> online,
            what do they see? With Premium, you control every detail of that first impression.
        </p>
        <div style="margin:20px 0;">
            ${[
                ['📷', 'Photo gallery', "Showcase your work with multiple photos"],
                ['📅', 'Live booking calendar', "Turn profile views into booked appointments automatically"],
                ['🤖', 'AI Chat widget', "24/7 lead capture — answers questions even when you're closed"],
                ['📰', 'News & promotions', "Post special offers and announcements on your profile"],
                ['🔝', 'Priority ranking', "Always appear above free listings in local searches"],
            ].map(([icon, title, desc]) => `
            <div style="padding:12px 0;border-bottom:1px solid #1e293b;">
                <span style="font-size:18px;">${icon}</span>
                <strong style="color:#fff;font-size:14px;margin-left:10px;">${title}</strong>
                <p style="margin:4px 0 0 28px;color:#94a3b8;font-size:13px;">${desc}</p>
            </div>`).join('')}
        </div>
        ${ctaButton('Unlock All Premium Features →', UPGRADE_URL)}
        <p style="margin-top:16px;color:#64748b;font-size:13px;">$29/month · Cancel anytime · No long-term contract</p>
    `, 'Photo gallery, live booking, AI chat, and priority ranking — all in one upgrade.');
}

export function premiumUpgrade_email4(businessName: string, contactName: string | null): string {
    return baseTemplate(`
        <h1 style="margin:0 0 8px;font-size:24px;color:#fff;">Want to do more with your listing? 🤝</h1>
        <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;">${contactName ? `Hi ${contactName},` : 'Hi there,'}</p>
        <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
            We've been rooting for <strong style="color:#fff;">${businessName}</strong> since you joined ${SITE_NAME}.
            We want to make sure you're getting real value — whether that's a Premium listing or something bigger.
        </p>
        <div style="background:#1e3a5f;border-radius:12px;padding:20px 24px;margin:24px 0;">
            <p style="margin:0 0 8px;color:#a5b4fc;font-size:13px;font-weight:700;">💡 Two ways we can help:</p>
            <p style="margin:0 0 10px;color:#cbd5e1;font-size:14px;"><strong style="color:#fff;">Option 1 — Premium listing ($29/mo):</strong> Priority ranking, AI Chat, booking calendar, and 4x more leads from the directory.</p>
            <p style="margin:0;color:#cbd5e1;font-size:14px;"><strong style="color:#fff;">Option 2 — Done-for-you marketing:</strong> Let our team handle your SEO, ads, and AI automation so you can focus on running your business.</p>
        </div>
        ${ctaButton('Upgrade to Premium →', UPGRADE_URL)}
        <p style="margin:16px 0 0;text-align:center;">
            <a href="${STRATEGY_CALL_URL}" style="color:#94a3b8;font-size:14px;text-decoration:underline;">Or book a free strategy call →</a>
        </p>
        <hr style="border:none;border-top:1px solid #1e293b;margin:28px 0;" />
        <p style="color:#64748b;font-size:13px;">Reply to this email anytime — happy to help figure out what's right for your business.</p>
    `, 'Not ready to upgrade yet? Here are some bigger ways we can help your business grow.');
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── SAAS PUSH (4 emails, +2 days cadence) ─────────────────────────────────
// Triggered: after premium conversion (listing upgraded to premium)
// ═══════════════════════════════════════════════════════════════════════════

export function saasPush_email1(businessName: string, contactName: string | null): string {
    return baseTemplate(`
        <h1 style="margin:0 0 8px;font-size:24px;color:#fff;">What if your business could run itself? 🤖</h1>
        <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;">${contactName ? `Hi ${contactName},` : 'Hi there,'}</p>
        <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
            Congrats on going Premium — your listing is already working harder for you. But there's a level beyond that.
        </p>
        <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
            Imagine <strong style="color:#fff;">${businessName}</strong> with a system that automatically:
        </p>
        <ul style="color:#cbd5e1;font-size:15px;line-height:2.2;padding-left:20px;margin:0 0 24px;">
            <li>🤖 Answers leads instantly — even at 2am</li>
            <li>📅 Books appointments without you lifting a finger</li>
            <li>🔄 Follows up with prospects who didn't convert</li>
            <li>📊 Reports on what's working every week</li>
        </ul>
        <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
            That's exactly what we build for local businesses at <strong style="color:#6366f1;">LNL AI Agency</strong>.
            AI-powered marketing and automation — done for you, not by you.
        </p>
        ${ctaButton('See How It Works →', STRATEGY_CALL_URL)}
        <p style="margin-top:16px;color:#64748b;font-size:13px;">No pressure — just a 20-minute conversation about your goals.</p>
    `, 'AI handles your leads, follow-ups, and bookings automatically — while you focus on the work.');
}

export function saasPush_email2(businessName: string, contactName: string | null): string {
    return baseTemplate(`
        <h1 style="margin:0 0 8px;font-size:24px;color:#fff;">How many leads are you actually losing? 📉</h1>
        <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;">${contactName ? `Hi ${contactName},` : 'Hi there,'}</p>
        <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
            Here's a stat that surprises most local business owners: <strong style="color:#fff;">78% of customers go with the first business that responds to their inquiry.</strong>
        </p>
        <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
            If someone finds <strong style="color:#fff;">${businessName}</strong> at 9pm on a Tuesday and you don't respond until Wednesday morning — chances are they've already booked someone else.
        </p>
        <div style="background:#7f1d1d30;border:1px solid #ef444460;border-radius:10px;padding:16px 20px;margin:20px 0;">
            <p style="margin:0;color:#fca5a5;font-size:14px;">
                ⚠️ <strong>The cost of slow response:</strong> Missing just 5 leads/month at $200 average job value = $12,000/year lost.
            </p>
        </div>
        <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
            Our AI responds instantly, 24/7. We set it up. You just show up for the jobs.
        </p>
        ${ctaButton('Stop Losing Leads — Book a Call →', STRATEGY_CALL_URL)}
        <p style="margin-top:16px;color:#64748b;font-size:13px;">Free 20-min strategy call. No commitment.</p>
    `, 'Missing just 5 leads/month at $200 avg = $12,000/year lost. Here\'s how to stop it.');
}

export function saasPush_email3(businessName: string, contactName: string | null): string {
    return baseTemplate(`
        <h1 style="margin:0 0 8px;font-size:24px;color:#fff;">Why more local businesses are using this 👥</h1>
        <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;">${contactName ? `Hi ${contactName},` : 'Hi there,'}</p>
        <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
            Local service businesses in the Triangle are quietly getting a big edge on their competition — and most competitors have no idea.
        </p>
        <div style="background:#0f172a;border-radius:12px;padding:20px 24px;margin:20px 0;border-left:4px solid #10b981;">
            <p style="margin:0 0 4px;color:#6ee7b7;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">What our clients are seeing</p>
            <ul style="color:#cbd5e1;font-size:14px;line-height:2;padding-left:16px;margin:8px 0 0;">
                <li>2-3x more booked appointments within 60 days</li>
                <li>Zero missed leads — AI handles after-hours inquiries</li>
                <li>Google rankings climbing without managing it themselves</li>
                <li>More 5-star reviews from an automated follow-up system</li>
            </ul>
        </div>
        <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
            For <strong style="color:#fff;">${businessName}</strong>, a system like this could run quietly in the background
            while you focus on the work you're actually good at.
        </p>
        ${ctaButton("See If It's a Fit for Your Business →", STRATEGY_CALL_URL)}
        <p style="margin-top:16px;color:#64748b;font-size:13px;">20 minutes. We'll show you exactly what it would look like for your business.</p>
    `, 'Other local businesses are already using this — here\'s what changed for them.');
}

export function saasPush_email4(businessName: string, contactName: string | null): string {
    return baseTemplate(`
        <h1 style="margin:0 0 8px;font-size:24px;color:#fff;">Want to test it out for free? 🎁</h1>
        <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;">${contactName ? `Hi ${contactName},` : 'Hi there,'}</p>
        <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
            The best way to see if AI automation is right for <strong style="color:#fff;">${businessName}</strong> is to actually experience it.
        </p>
        <div style="background:#1e3a5f;border-radius:12px;padding:20px 24px;margin:24px 0;border-left:4px solid #6366f1;">
            <p style="margin:0 0 6px;color:#a5b4fc;font-size:13px;font-weight:700;">🎁 Free Strategy Session Includes:</p>
            <ul style="color:#cbd5e1;font-size:14px;line-height:2;padding-left:16px;margin:8px 0 0;">
                <li>A custom audit of your current lead flow</li>
                <li>A live demo of your AI assistant built for your business</li>
                <li>A roadmap showing exactly how we'd grow your revenue</li>
            </ul>
            <p style="margin:12px 0 0;color:#64748b;font-size:13px;">No charge. No pitch. Just real strategy.</p>
        </div>
        ${ctaButton('Book My Free Strategy Session →', STRATEGY_CALL_URL)}
        <hr style="border:none;border-top:1px solid #1e293b;margin:28px 0;" />
        <p style="color:#64748b;font-size:13px;">Reply to this email if you have questions or want to learn more first.</p>
    `, 'A free custom audit of your lead flow + a live demo built for your business. No charge.');
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── MARKETING SERVICES PUSH (4 emails, +2 days cadence) ───────────────────
// Triggered: after SAAS push completes
// ═══════════════════════════════════════════════════════════════════════════

export function marketingPush_email1(businessName: string, contactName: string | null): string {
    return baseTemplate(`
        <h1 style="margin:0 0 8px;font-size:24px;color:#fff;">Your website might be costing you customers 😬</h1>
        <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;">${contactName ? `Hi ${contactName},` : 'Hi there,'}</p>
        <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
            Quick question about <strong style="color:#fff;">${businessName}</strong>: when a potential customer visits your website,
            what happens? If it loads slow, looks outdated, or doesn't clearly tell them how to book — they leave.
        </p>
        <div style="background:#0f172a;border-radius:12px;padding:20px 24px;margin:20px 0;">
            <p style="margin:0 0 8px;color:#94a3b8;font-size:13px;font-weight:700;text-transform:uppercase;">The 3-second rule</p>
            <p style="color:#cbd5e1;font-size:14px;line-height:1.7;margin:0;">
                53% of visitors leave a website that takes more than 3 seconds to load.
                And 75% judge a company's credibility by design alone.
            </p>
        </div>
        <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
            We build high-converting websites for local businesses — fast, mobile-optimized, and designed to turn visitors into booked appointments.
        </p>
        ${ctaButton('Get a Free Website Audit →', STRATEGY_CALL_URL)}
        <p style="margin-top:16px;color:#64748b;font-size:13px;">We'll show you exactly what's holding your site back — at no charge.</p>
    `, 'Your website is your #1 salesperson — is it actually converting visitors into customers?');
}

export function marketingPush_email2(businessName: string, contactName: string | null): string {
    return baseTemplate(`
        <h1 style="margin:0 0 8px;font-size:24px;color:#fff;">Want to show up first on Google? 🔍</h1>
        <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;">${contactName ? `Hi ${contactName},` : 'Hi there,'}</p>
        <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
            When someone in the Triangle searches for what <strong style="color:#fff;">${businessName}</strong> does,
            do you show up? If you're not in the top 3 Google results, you're invisible to most potential customers.
        </p>
        <div style="background:#0f172a;border-radius:12px;padding:20px 24px;margin:20px 0;border-left:4px solid #6366f1;">
            <p style="margin:0 0 8px;color:#a5b4fc;font-size:12px;font-weight:700;text-transform:uppercase;">Local SEO stats</p>
            <ul style="color:#cbd5e1;font-size:14px;line-height:2;padding-left:16px;margin:0;">
                <li>46% of all Google searches are looking for local info</li>
                <li>76% of people who search locally visit a business within a day</li>
                <li>The top 3 local results capture 75% of all clicks</li>
            </ul>
        </div>
        <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
            Our Local SEO service gets you ranking for the searches your customers are already doing — more visibility, more calls, more booked jobs. No ads required.
        </p>
        ${ctaButton('Get My Free SEO Analysis →', STRATEGY_CALL_URL)}
        <p style="margin-top:16px;color:#64748b;font-size:13px;">We'll show you where you rank today and what it'll take to get to #1.</p>
    `, '76% of local searchers visit a business within 24 hours — are they finding you first?');
}

export function marketingPush_email3(businessName: string, contactName: string | null): string {
    return baseTemplate(`
        <h1 style="margin:0 0 8px;font-size:24px;color:#fff;">Get more leads instantly with Google Ads 💰</h1>
        <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;">${contactName ? `Hi ${contactName},` : 'Hi there,'}</p>
        <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
            SEO builds long-term momentum. But if you need leads <em>now</em>, Google Ads is the fastest way to get
            <strong style="color:#fff;">${businessName}</strong> in front of high-intent buyers who are ready to hire.
        </p>
        <div style="background:#0f172a;border-radius:12px;padding:20px 24px;margin:20px 0;">
            <p style="margin:0 0 12px;color:#94a3b8;font-size:13px;font-weight:700;text-transform:uppercase;">Why local PPC works</p>
            ${[
                ['🎯', 'Only pay when someone clicks — no wasted budget'],
                ['📍', 'Target by zip code, city, or radius — reach your exact market'],
                ['📞', 'Call-only ads send leads straight to your phone'],
                ['📊', 'Full tracking — you know exactly what every dollar produces'],
            ].map(([icon, text]) => `<p style="margin:0 0 8px;color:#cbd5e1;font-size:14px;">${icon} ${text}</p>`).join('')}
        </div>
        <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
            We manage everything — campaign setup, ad copy, targeting, and monthly optimization — so you just take the calls.
        </p>
        ${ctaButton('See What PPC Can Do for My Business →', STRATEGY_CALL_URL)}
        <p style="margin-top:16px;color:#64748b;font-size:13px;">Free strategy call — we'll model out your potential ROI before you spend a dollar.</p>
    `, 'Only pay when someone clicks. Target your exact market. Full tracking on every dollar.');
}

export function marketingPush_email4(businessName: string, contactName: string | null): string {
    return baseTemplate(`
        <h1 style="margin:0 0 8px;font-size:24px;color:#fff;">Let's make a plan for your business growth 📋</h1>
        <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;">${contactName ? `Hi ${contactName},` : 'Hi there,'}</p>
        <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
            You've built something real with <strong style="color:#fff;">${businessName}</strong>. Let's talk about how to scale it.
        </p>
        <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
            Over the past few weeks we've shared how we help local businesses with AI automation, SEO, and paid ads.
            The most valuable thing we offer is a clear, honest growth strategy — customized for your market and goals.
        </p>
        <div style="background:#1e3a5f;border-radius:12px;padding:20px 24px;margin:24px 0;">
            <p style="margin:0 0 8px;color:#a5b4fc;font-size:13px;font-weight:700;">🗓️ On our strategy call, we'll cover:</p>
            <ul style="color:#cbd5e1;font-size:14px;line-height:2;padding-left:16px;margin:0;">
                <li>Your current marketing gaps and quick wins</li>
                <li>The #1 channel to invest in for your industry right now</li>
                <li>A 90-day roadmap with realistic revenue projections</li>
                <li>Whether done-for-you or coaching makes more sense for you</li>
            </ul>
        </div>
        ${ctaButton('Book My Free Growth Strategy Call →', STRATEGY_CALL_URL)}
        <hr style="border:none;border-top:1px solid #1e293b;margin:28px 0;" />
        <p style="color:#64748b;font-size:13px;">
            This is our last email in this series. If the timing is not right, no worries — reply anytime and we will be here.
        </p>
    `, 'One free call. A custom growth plan built for your business. No obligation.');
}

// ─── Booking: Customer Confirmation ──────────────────────────────────────────
export function email_booking_confirmation({
    customerName,
    businessName,
    serviceName,
    appointmentDate,
    startTime,
    endTime,
    notes,
}: {
    customerName: string;
    businessName: string;
    serviceName?: string | null;
    appointmentDate: string;
    startTime: string;
    endTime?: string | null;
    notes?: string | null;
}): string {
    const timeRange = endTime ? `${startTime} – ${endTime}` : startTime;
    const dateFormatted = new Date(appointmentDate + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
    return baseTemplate(`
        <h1 style="margin:0 0 8px;font-size:24px;color:#fff;">Booking Confirmed ✅</h1>
        <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;">${greeting(customerName)}</p>
        <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
            Your appointment at <strong style="color:#fff;">${businessName}</strong> has been booked successfully.
            We'll see you soon!
        </p>
        <div style="background:#0f172a;border-radius:10px;padding:20px 24px;margin:24px 0;border-left:4px solid ${PRIMARY_COLOR};">
            <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                    <td style="padding:6px 0;color:#94a3b8;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;width:120px;">Business</td>
                    <td style="padding:6px 0;color:#fff;font-size:15px;font-weight:600;">${businessName}</td>
                </tr>
                ${serviceName ? `<tr>
                    <td style="padding:6px 0;color:#94a3b8;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Service</td>
                    <td style="padding:6px 0;color:#fff;font-size:15px;">${serviceName}</td>
                </tr>` : ''}
                <tr>
                    <td style="padding:6px 0;color:#94a3b8;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Date</td>
                    <td style="padding:6px 0;color:#fff;font-size:15px;">${dateFormatted}</td>
                </tr>
                <tr>
                    <td style="padding:6px 0;color:#94a3b8;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Time</td>
                    <td style="padding:6px 0;color:#fff;font-size:15px;">${timeRange}</td>
                </tr>
                ${notes ? `<tr>
                    <td style="padding:6px 0;color:#94a3b8;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;vertical-align:top;">Notes</td>
                    <td style="padding:6px 0;color:#cbd5e1;font-size:14px;">${notes}</td>
                </tr>` : ''}
            </table>
        </div>
        <p style="color:#64748b;font-size:13px;margin-top:20px;">
            Need to reschedule or cancel? Contact <strong style="color:#e2e8f0;">${businessName}</strong> directly.
        </p>
    `);
}

// ─── Booking: Business Notification ──────────────────────────────────────────
export function email_booking_business_notification({
    businessName,
    customerName,
    customerEmail,
    customerPhone,
    serviceName,
    appointmentDate,
    startTime,
    endTime,
    notes,
}: {
    businessName: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string | null;
    serviceName?: string | null;
    appointmentDate: string;
    startTime: string;
    endTime?: string | null;
    notes?: string | null;
}): string {
    const timeRange = endTime ? `${startTime} – ${endTime}` : startTime;
    const dateFormatted = new Date(appointmentDate + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
    return baseTemplate(`
        <h1 style="margin:0 0 8px;font-size:24px;color:#fff;">New Booking 📅</h1>
        <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;">Hi ${businessName} team,</p>
        <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
            A new appointment has been booked through <strong style="color:#6366f1;">${SITE_NAME}</strong>.
        </p>
        <div style="background:#0f172a;border-radius:10px;padding:20px 24px;margin:24px 0;border-left:4px solid ${PRIMARY_COLOR};">
            <p style="margin:0 0 12px;color:#94a3b8;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Customer Details</p>
            <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                    <td style="padding:5px 0;color:#94a3b8;font-size:13px;font-weight:600;width:120px;">Name</td>
                    <td style="padding:5px 0;color:#fff;font-size:15px;font-weight:600;">${customerName}</td>
                </tr>
                <tr>
                    <td style="padding:5px 0;color:#94a3b8;font-size:13px;font-weight:600;">Email</td>
                    <td style="padding:5px 0;color:#6366f1;font-size:14px;"><a href="mailto:${customerEmail}" style="color:#6366f1;">${customerEmail}</a></td>
                </tr>
                ${customerPhone ? `<tr>
                    <td style="padding:5px 0;color:#94a3b8;font-size:13px;font-weight:600;">Phone</td>
                    <td style="padding:5px 0;color:#fff;font-size:14px;"><a href="tel:${customerPhone}" style="color:#6366f1;">${customerPhone}</a></td>
                </tr>` : ''}
            </table>
            <hr style="border:none;border-top:1px solid #1e293b;margin:16px 0;" />
            <p style="margin:0 0 12px;color:#94a3b8;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Appointment Details</p>
            <table cellpadding="0" cellspacing="0" width="100%">
                ${serviceName ? `<tr>
                    <td style="padding:5px 0;color:#94a3b8;font-size:13px;font-weight:600;width:120px;">Service</td>
                    <td style="padding:5px 0;color:#fff;font-size:14px;">${serviceName}</td>
                </tr>` : ''}
                <tr>
                    <td style="padding:5px 0;color:#94a3b8;font-size:13px;font-weight:600;">Date</td>
                    <td style="padding:5px 0;color:#fff;font-size:14px;">${dateFormatted}</td>
                </tr>
                <tr>
                    <td style="padding:5px 0;color:#94a3b8;font-size:13px;font-weight:600;">Time</td>
                    <td style="padding:5px 0;color:#fff;font-size:14px;">${timeRange}</td>
                </tr>
                ${notes ? `<tr>
                    <td style="padding:5px 0;color:#94a3b8;font-size:13px;font-weight:600;vertical-align:top;">Notes</td>
                    <td style="padding:5px 0;color:#cbd5e1;font-size:13px;">${notes}</td>
                </tr>` : ''}
            </table>
        </div>
        <p style="color:#64748b;font-size:13px;">
            Log in to your dashboard to manage this appointment.
        </p>
    `);
}

// ─── Booking: Status Update ───────────────────────────────────────────────────
export function email_booking_status_update({
    customerName,
    businessName,
    status,
    appointmentDate,
    startTime,
}: {
    customerName: string;
    businessName: string;
    status: string;
    appointmentDate: string;
    startTime: string;
}): string {
    const dateFormatted = new Date(appointmentDate + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
    const statusLabels: Record<string, { label: string; color: string }> = {
        confirmed: { label: 'Confirmed ✅', color: '#22c55e' },
        cancelled: { label: 'Cancelled ❌', color: '#ef4444' },
        completed: { label: 'Completed 🎉', color: '#6366f1' },
        'no-show': { label: 'Marked as No-Show', color: '#f59e0b' },
    };
    const { label, color } = statusLabels[status] ?? { label: status, color: '#94a3b8' };
    return baseTemplate(`
        <h1 style="margin:0 0 8px;font-size:24px;color:#fff;">Appointment Update</h1>
        <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;">${greeting(customerName)}</p>
        <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
            Your appointment at <strong style="color:#fff;">${businessName}</strong> on
            <strong style="color:#fff;">${dateFormatted}</strong> at <strong style="color:#fff;">${startTime}</strong>
            has been updated.
        </p>
        <div style="background:#0f172a;border-radius:10px;padding:20px 24px;margin:24px 0;border-left:4px solid ${color};">
            <p style="margin:0;color:#94a3b8;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">New Status</p>
            <p style="margin:8px 0 0;color:${color};font-size:20px;font-weight:700;">${label}</p>
        </div>
        <p style="color:#64748b;font-size:13px;">
            Questions? Contact <strong style="color:#e2e8f0;">${businessName}</strong> directly.
        </p>
    `);
}
