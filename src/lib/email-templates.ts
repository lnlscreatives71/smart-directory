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
