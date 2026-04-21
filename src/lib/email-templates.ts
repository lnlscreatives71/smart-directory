// White-label config — set these env vars in Vercel for each agency deployment.
// Falls back to Triangle Hub values so the existing deployment is unaffected.
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'The Triangle Hub';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://thetrianglehub.online';
const UPGRADE_URL = process.env.NEXT_PUBLIC_UPGRADE_URL || `${SITE_URL}/pricing`;
const LOGO_URL = process.env.NEXT_PUBLIC_LOGO_URL || `${SITE_URL}/triangle-hub-logo-dark.png`;
const PRIMARY_COLOR = process.env.NEXT_PUBLIC_PRIMARY_COLOR || '#6366f1';
const STRATEGY_CALL_URL = process.env.STRATEGY_CALL_URL || `${SITE_URL}/contact`;

function baseTemplate(content: string, preheader?: string, unsubscribeUrl?: string): string {
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
            <p style="margin:16px 0 0;padding-top:16px;border-top:1px solid #1e293b;color:#334155;">
              Brought to you by <a href="https://www.lnlaiagency.com/" target="_blank" style="color:#6366f1;text-decoration:none;font-weight:600;">LNL AI Agency</a>
              &nbsp;·&nbsp; AI marketing &amp; automation for local service businesses
            </p>
            ${unsubscribeUrl ? `<p style="margin:12px 0 0;"><a href="${unsubscribeUrl}" style="color:#334155;font-size:11px;text-decoration:underline;">Unsubscribe from these emails</a></p>` : ''}
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
    const unsubscribeUrl = `${SITE_URL}/unsubscribe?lid=${listingId}`;
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
    `, undefined, unsubscribeUrl);
}

// ─── Email 2: Reminder & Benefits (Premium Upsell) ───────────────────────────
export function email2_upsell(businessName: string, contactName: string | null, listingId: number): string {
    const unsubscribeUrl = `${SITE_URL}/unsubscribe?lid=${listingId}`;
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
    `, undefined, unsubscribeUrl);
}

// ─── Email 3: Finalization Notice ────────────────────────────────────────────
export function email3_finalization(businessName: string, contactName: string | null, listingId: number): string {
    const claimUrl = `${SITE_URL}/biz/claim?id=${listingId}`;
    const unsubscribeUrl = `${SITE_URL}/unsubscribe?lid=${listingId}`;
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
    `, undefined, unsubscribeUrl);
}

// ─── Email 4: Final Reminder ──────────────────────────────────────────────────
export function email4_finalReminder(businessName: string, contactName: string | null, listingId: number): string {
    const claimUrl = `${SITE_URL}/biz/claim?id=${listingId}`;
    const unsubscribeUrl = `${SITE_URL}/unsubscribe?lid=${listingId}`;
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
    `, undefined, unsubscribeUrl);
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── B VARIANTS (different angle: curiosity / social proof driven) ─────────
// ═══════════════════════════════════════════════════════════════════════════

// B: Email 1 — Social proof angle ("Your neighbors are finding you")
export function email1_notification_B(businessName: string, contactName: string | null, listingId: number): string {
    const claimUrl = `${SITE_URL}/biz/claim?id=${listingId}`;
    const unsubscribeUrl = `${SITE_URL}/unsubscribe?lid=${listingId}`;
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
    `, undefined, unsubscribeUrl);
}

// B: Email 2 — ROI/outcome angle instead of feature list
export function email2_upsell_B(businessName: string, contactName: string | null, listingId: number): string {
    const unsubscribeUrl = `${SITE_URL}/unsubscribe?lid=${listingId}`;
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
    `, undefined, unsubscribeUrl);
}

// B: Email 3 — Competitor angle ("your competitors just upgraded")
export function email3_finalization_B(businessName: string, contactName: string | null, listingId: number): string {
    const claimUrl = `${SITE_URL}/biz/claim?id=${listingId}`;
    const unsubscribeUrl = `${SITE_URL}/unsubscribe?lid=${listingId}`;
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
    `, undefined, unsubscribeUrl);
}

// B: Email 4 — Direct, no-fluff "we're closing your file" angle
export function email4_finalReminder_B(businessName: string, contactName: string | null, listingId: number): string {
    const claimUrl = `${SITE_URL}/biz/claim?id=${listingId}`;
    const unsubscribeUrl = `${SITE_URL}/unsubscribe?lid=${listingId}`;
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
    `, undefined, unsubscribeUrl);
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
// Focus: AI agents (Personal Assistant for busy SMBs, Customer Service Agent
//        for home services, Personal Assistant Agent for real estate)
// ═══════════════════════════════════════════════════════════════════════════

type EmailOutput = { subject: string; preheader: string; html: string };

function unsubUrl(listingId: number): string {
    return `${SITE_URL}/unsubscribe?lid=${listingId}`;
}

function bridgeLine(): string {
    return `Quick context: Triangle Hub, where you're listed, is <strong style="color:#fff;">powered by LNL AI Agency</strong> — the marketing arm behind it. The directory is how we meet local businesses. What we actually <em>do</em> is build the systems below.`;
}

// ─── SAAS PUSH: Email 1 — Intro to AI Agents ────────────────────────────────
export function saasPush_email1(
    businessName: string,
    contactName: string | null,
    listingId: number,
    variant: 'A' | 'B' = 'A'
): EmailOutput {
    const greet = contactName ? `Hi ${contactName},` : 'Hi there,';
    const unsub = unsubUrl(listingId);

    if (variant === 'B') {
        const subject = `One question most owners never ask themselves`;
        const preheader = `The answer tells you whether you're running the business — or it's running you.`;
        return {
            subject, preheader,
            html: baseTemplate(`
                <h1 style="margin:0 0 8px;font-size:24px;color:#fff;">What part of your week would disappear?</h1>
                <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;">${greet}</p>
                <p style="color:#cbd5e1;font-size:16px;line-height:1.7;font-weight:500;">
                    If you had a 24/7 assistant who never called in sick — what part of <strong style="color:#fff;">${businessName}</strong>'s week would disappear?
                </p>
                <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
                    Take a second. Answer honestly. For most owners we talk to, it's some mix of inbox triage, after-hours lead responses, booking coordination, and the same 10 questions asked in 10 different ways. Easily 12 hours a week, usually more.
                </p>
                <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">${bridgeLine()}</p>
                <div style="background:#0f172a;border-radius:10px;padding:18px 22px;margin:20px 0;border-left:4px solid ${PRIMARY_COLOR};">
                    <p style="margin:0 0 6px;color:#a5b4fc;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;">Education moment</p>
                    <p style="color:#cbd5e1;font-size:14px;line-height:1.7;margin:0;">
                        <strong style="color:#fff;">Chatbots answer questions. AI agents take action.</strong><br/>
                        An agent books the appointment, pulls the customer's address into your system, adds it to your calendar, and texts you a summary. It doesn't just acknowledge a voicemail — it transcribes, classifies urgency, drafts your reply, and waits for you to hit send.
                    </p>
                </div>
                <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
                    <strong style="color:#fff;">The specific problem this solves:</strong> the bottleneck where your business can't grow because you can't clone yourself. Over the next few emails we'll walk through what an agent looks like for real estate, home services, and busy owners — and why it matters more this year than last.
                </p>
                ${ctaButton(`Show me what an AI agent would do for ${businessName} →`, STRATEGY_CALL_URL)}
                <p style="margin-top:16px;color:#64748b;font-size:13px;">No pitch. Just a walkthrough.</p>
            `, preheader, unsub),
        };
    }

    const subject = `Quick thought about ${businessName}`;
    const preheader = `Before we pitch anything — here's some context you should have.`;
    return {
        subject, preheader,
        html: baseTemplate(`
            <h1 style="margin:0 0 8px;font-size:24px;color:#fff;">There's a reason you ended up on Triangle Hub.</h1>
            <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;">${greet}</p>
            <p style="color:#cbd5e1;font-size:16px;line-height:1.7;font-weight:500;">
                ${contactName || 'Friend'}, you probably don't know this yet — but there's a reason <strong style="color:#fff;">${businessName}</strong> landed on Triangle Hub.
            </p>
            <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
                Triangle Hub is a directory. That's the obvious part. The less obvious part: it's <strong style="color:#fff;">powered by LNL AI Agency</strong> — the marketing arm behind it. We built the directory as a way to meet local businesses. What we actually <em>do</em> is build AI agents for them.
            </p>
            <div style="background:#0f172a;border-radius:10px;padding:18px 22px;margin:20px 0;border-left:4px solid ${PRIMARY_COLOR};">
                <p style="margin:0 0 6px;color:#a5b4fc;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;">First — what's an AI agent?</p>
                <p style="color:#cbd5e1;font-size:14px;line-height:1.7;margin:0;">
                    Most people hear "AI" and think "chatbot." They're different. <strong style="color:#fff;">A chatbot answers. An agent acts.</strong> It books the appointment, updates your calendar, drafts the follow-up in your voice, and hands it to you ready to send.
                </p>
            </div>
            <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
                <strong style="color:#fff;">The specific issue it solves:</strong> the average local business owner spends 12–15 hours a week on work that doesn't require their judgment — inbox triage, booking coordination, lead qualification, after-hours replies. That's almost two full workdays a week you could get back.
            </p>
            <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
                At LNL AI Agency, we build three flavors depending on the business:
            </p>
            <ul style="color:#cbd5e1;font-size:15px;line-height:2;padding-left:20px;margin:0 0 20px;">
                <li><strong style="color:#fff;">Real Estate</strong> — Personal Assistant agent: qualifies buyer leads, schedules showings, tracks contract deadlines</li>
                <li><strong style="color:#fff;">Home Services</strong> — Customer Service agent: handles after-hours inquiries, confirms dispatches, requests reviews</li>
                <li><strong style="color:#fff;">Any busy SMB owner</strong> — Personal Assistant: triages email, manages calendar, tracks tasks</li>
            </ul>
            <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
                This is the first of a short series. We'll break down exactly what each one does, where the hours go, and what you'd get back.
            </p>
            ${ctaButton(`See what this looks like for ${businessName} →`, STRATEGY_CALL_URL)}
            <p style="margin-top:16px;color:#64748b;font-size:13px;">No pressure. Just education first.</p>
        `, preheader, unsub),
    };
}

// ─── SAAS PUSH: Email 2 — Vertical-specific agents ─────────────────────────
export function saasPush_email2(
    businessName: string,
    contactName: string | null,
    listingId: number,
    variant: 'A' | 'B' = 'A'
): EmailOutput {
    const greet = contactName ? `Hi ${contactName},` : 'Hi there,';
    const unsub = unsubUrl(listingId);

    if (variant === 'B') {
        const subject = `What your week looks like with an AI teammate`;
        const preheader = `A day-in-the-life walkthrough. Not chatbots — actual agents.`;
        return {
            subject, preheader,
            html: baseTemplate(`
                <h1 style="margin:0 0 8px;font-size:24px;color:#fff;">Monday, 8:00 AM.</h1>
                <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;">${greet}</p>
                <p style="color:#cbd5e1;font-size:16px;line-height:1.7;font-weight:500;">
                    You haven't opened your laptop yet. Your AI agent already handled 14 after-hours inquiries, confirmed today's appointments, flagged 3 leads that actually need you, and queued draft replies in your voice.
                </p>
                <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
                    That's the before-coffee version of what an AI agent does. Here's what it looks like by vertical at <strong style="color:#fff;">LNL AI Agency</strong>:
                </p>
                <div style="background:#0f172a;border-radius:10px;padding:20px;margin:18px 0;border-left:4px solid #10b981;">
                    <p style="margin:0 0 4px;color:#6ee7b7;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Real Estate — Personal Assistant</p>
                    <p style="color:#cbd5e1;font-size:14px;line-height:1.7;margin:0;"><strong style="color:#fff;">Solves:</strong> agents spending more time on admin than closing. Your PA qualifies leads from Zillow/web/text, schedules showings against your calendar, and surfaces the hot ones.</p>
                </div>
                <div style="background:#0f172a;border-radius:10px;padding:20px;margin:18px 0;border-left:4px solid #f59e0b;">
                    <p style="margin:0 0 4px;color:#fcd34d;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Home Services — Customer Service Agent</p>
                    <p style="color:#cbd5e1;font-size:14px;line-height:1.7;margin:0;"><strong style="color:#fff;">Solves:</strong> missed calls and slow review collection hurting your GMB rank. Your CSR fields after-hours inquiries, confirms dispatches by text, and asks for Google reviews at the right moment.</p>
                </div>
                <div style="background:#0f172a;border-radius:10px;padding:20px;margin:18px 0;border-left:4px solid ${PRIMARY_COLOR};">
                    <p style="margin:0 0 4px;color:#a5b4fc;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Busy SMB Owner — Personal Assistant</p>
                    <p style="color:#cbd5e1;font-size:14px;line-height:1.7;margin:0;"><strong style="color:#fff;">Solves:</strong> you being the bottleneck. Your PA triages email, manages calendar, tracks tasks, surfaces what's urgent and buries what isn't.</p>
                </div>
                <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
                    These aren't generic chatbots. They're custom-built systems with access to <em>your</em> tools (calendar, CRM, email, phone) and trained on <em>your</em> voice.
                </p>
                ${ctaButton(`See the agent built for ${businessName} →`, STRATEGY_CALL_URL)}
            `, preheader, unsub),
        };
    }

    const subject = `If you run ${businessName}, this probably fits`;
    const preheader = `Three AI agents, each built for a specific industry. Pick yours.`;
    return {
        subject, preheader,
        html: baseTemplate(`
            <h1 style="margin:0 0 8px;font-size:24px;color:#fff;">Most "AI for small business" pitches are generic. These aren't.</h1>
            <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;">${greet}</p>
            <p style="color:#cbd5e1;font-size:16px;line-height:1.7;font-weight:500;">
                Last email we covered what an AI agent actually is (action-taking, not answering). Today: the three we build at <strong style="color:#fff;">LNL AI Agency</strong> — and the specific problem each one kills.
            </p>
            <div style="background:#0f172a;border-radius:10px;padding:20px;margin:18px 0;border-left:4px solid #10b981;">
                <p style="margin:0 0 8px;color:#6ee7b7;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">1. Real Estate → Personal Assistant Agent</p>
                <p style="color:#cbd5e1;font-size:14px;line-height:1.7;margin:0 0 8px;">
                    <strong style="color:#fff;">What it does:</strong> qualifies inbound buyer/seller leads, books showings against your calendar, tracks contract deadlines, follows up on inactive prospects.
                </p>
                <p style="color:#cbd5e1;font-size:14px;line-height:1.7;margin:0;">
                    <strong style="color:#fff;">Issue it solves:</strong> top agents lose deals to faster ones. The PA responds in under a minute, 24/7, so speed-to-lead stops being your weakness.
                </p>
            </div>
            <div style="background:#0f172a;border-radius:10px;padding:20px;margin:18px 0;border-left:4px solid #f59e0b;">
                <p style="margin:0 0 8px;color:#fcd34d;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">2. Home Services → Customer Service Agent</p>
                <p style="color:#cbd5e1;font-size:14px;line-height:1.7;margin:0 0 8px;">
                    <strong style="color:#fff;">What it does:</strong> takes after-hours inquiries, dispatches to techs, texts ETAs to customers, asks for Google reviews at the right moment.
                </p>
                <p style="color:#cbd5e1;font-size:14px;line-height:1.7;margin:0;">
                    <strong style="color:#fff;">Issue it solves:</strong> missed evening/weekend calls (when most emergencies happen) going to whoever responded faster, plus flat review growth that's quietly hurting your GMB rank.
                </p>
            </div>
            <div style="background:#0f172a;border-radius:10px;padding:20px;margin:18px 0;border-left:4px solid ${PRIMARY_COLOR};">
                <p style="margin:0 0 8px;color:#a5b4fc;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">3. Busy SMB Owner → Personal Assistant</p>
                <p style="color:#cbd5e1;font-size:14px;line-height:1.7;margin:0 0 8px;">
                    <strong style="color:#fff;">What it does:</strong> triages email, manages calendar, tracks tasks, drafts replies in your voice, flags what actually needs you.
                </p>
                <p style="color:#cbd5e1;font-size:14px;line-height:1.7;margin:0;">
                    <strong style="color:#fff;">Issue it solves:</strong> the owner-as-bottleneck problem. You can't grow the business past the cap of your own hours.
                </p>
            </div>
            <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
                These are custom systems — not off-the-shelf bots. Built on <em>your</em> tools, trained on <em>your</em> voice.
            </p>
            ${ctaButton(`See the agent for ${businessName} →`, STRATEGY_CALL_URL)}
        `, preheader, unsub),
    };
}

// ─── SAAS PUSH: Email 3 — After-hours / invisible revenue ──────────────────
export function saasPush_email3(
    businessName: string,
    contactName: string | null,
    listingId: number,
    variant: 'A' | 'B' = 'A'
): EmailOutput {
    const greet = contactName ? `Hi ${contactName},` : 'Hi there,';
    const unsub = unsubUrl(listingId);

    if (variant === 'B') {
        const subject = `Invisible revenue`;
        const preheader = `The leads you never knew you missed — and why they're the most expensive kind.`;
        return {
            subject, preheader,
            html: baseTemplate(`
                <h1 style="margin:0 0 8px;font-size:24px;color:#fff;">There's a bucket of revenue you can't see.</h1>
                <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;">${greet}</p>
                <p style="color:#cbd5e1;font-size:16px;line-height:1.7;font-weight:500;">
                    Most local businesses have one — a bucket of revenue they're losing and don't know about.
                </p>
                <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
                    Here's why it's invisible: missed after-hours inquiries, ignored form fills, voicemails that never get a callback — none of these show up in any report. Your CRM tracks what you <em>did</em>, not what you <em>didn't</em>.
                </p>
                <div style="background:#7f1d1d30;border:1px solid #ef444460;border-radius:10px;padding:18px 22px;margin:20px 0;">
                    <p style="margin:0 0 6px;color:#fca5a5;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;">The data</p>
                    <p style="color:#fca5a5;font-size:14px;line-height:1.7;margin:0;">
                        <strong>78%</strong> of buyers go with the first business that responds. Average local SMB response time on an after-hours inquiry: <strong>12+ hours</strong>. Multiply your average job value by the number of inquiries past 5pm — that's a floor on the revenue leak.
                    </p>
                </div>
                <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
                    This is where an AI agent from <strong style="color:#fff;">LNL AI Agency</strong> earns its keep: sub-minute response 24/7, with full logging so you can finally see the bucket. Every inquiry gets acknowledged, qualified, and either booked or escalated to you.
                </p>
                <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
                    <strong style="color:#fff;">The issue it solves:</strong> you can't fix what you can't measure. First you see the leak. Then you plug it.
                </p>
                ${ctaButton(`See your invisible bucket for ${businessName} →`, STRATEGY_CALL_URL)}
            `, preheader, unsub),
        };
    }

    const subject = `The "10pm problem" for ${businessName}`;
    const preheader = `Your best leads come at the worst times. Here's what it's actually costing you.`;
    return {
        subject, preheader,
        html: baseTemplate(`
            <h1 style="margin:0 0 8px;font-size:24px;color:#fff;">Someone searched for you at 10pm Tuesday.</h1>
            <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;">${greet}</p>
            <p style="color:#cbd5e1;font-size:16px;line-height:1.7;font-weight:500;">
                Did they ever hear back from <strong style="color:#fff;">${businessName}</strong>?
            </p>
            <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
                Local service queries spike 6–10pm (people finally dealing with the thing after work) and Saturday 9–11am (people doing weekend planning). These are real buyers with real intent — they'll book the first business that responds.
            </p>
            <div style="background:#0f172a;border-radius:10px;padding:18px 22px;margin:20px 0;border-left:4px solid #ef4444;">
                <p style="margin:0 0 6px;color:#fca5a5;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;">Why response speed decides the deal</p>
                <p style="color:#cbd5e1;font-size:14px;line-height:1.7;margin:0;">
                    <strong style="color:#fff;">78%</strong> of customers pick the first business that responds. After 5 minutes, your odds of contacting the lead drop <strong>10x</strong>. After an hour, they're essentially gone.
                </p>
            </div>
            <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
                <strong style="color:#fff;">The issue this solves:</strong> the gap between inquiry and response is where your competitors win. An AI Customer Service agent from <strong style="color:#fff;">LNL AI Agency</strong> closes that gap to under a minute — including 10pm on a Tuesday.
            </p>
            <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
                It's not replacing you. It's holding the door open until you can get there.
            </p>
            ${ctaButton(`See how this works for ${businessName} →`, STRATEGY_CALL_URL)}
        `, preheader, unsub),
    };
}

// ─── SAAS PUSH: Email 4 — Free strategy call CTA ───────────────────────────
export function saasPush_email4(
    businessName: string,
    contactName: string | null,
    listingId: number,
    variant: 'A' | 'B' = 'A'
): EmailOutput {
    const greet = contactName ? `Hi ${contactName},` : 'Hi there,';
    const unsub = unsubUrl(listingId);

    if (variant === 'B') {
        const subject = `Worth 20 minutes to ${contactName || 'you'}?`;
        const preheader = `One call. Custom plan. No charge, no pitch.`;
        return {
            subject, preheader,
            html: baseTemplate(`
                <h1 style="margin:0 0 8px;font-size:24px;color:#fff;">A fair ask.</h1>
                <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;">${greet}</p>
                <p style="color:#cbd5e1;font-size:16px;line-height:1.7;font-weight:500;">
                    If AI automation sounds interesting but you're not sure where it'd fit in <strong style="color:#fff;">${businessName}</strong> — we built a 20-minute call specifically for that problem.
                </p>
                <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
                    Most owners don't need another pitch. They need someone who can look at their actual workflow and say "yeah, this here — that's automatable, and here's what you'd get back."
                </p>
                <div style="background:#1e3a5f;border-radius:12px;padding:20px 24px;margin:24px 0;">
                    <p style="margin:0 0 8px;color:#a5b4fc;font-size:13px;font-weight:700;">🗓️ On the call, <strong style="color:#fff;">LNL AI Agency</strong> will:</p>
                    <ul style="color:#cbd5e1;font-size:14px;line-height:2;padding-left:16px;margin:0;">
                        <li>Map where your hours are actually going</li>
                        <li>Identify the top 2–3 automation candidates in your workflow</li>
                        <li>Give you a rough estimate of hours reclaimed per week</li>
                        <li>Tell you honestly if AI is a fit — or if it's not yet</li>
                    </ul>
                </div>
                ${ctaButton(`Book the 20-minute call →`, STRATEGY_CALL_URL)}
                <hr style="border:none;border-top:1px solid #1e293b;margin:28px 0;" />
                <p style="color:#64748b;font-size:13px;">If the timing's not right, reply anytime — we'll pick it up later.</p>
            `, preheader, unsub),
        };
    }

    const subject = `20 minutes, then we leave you alone`;
    const preheader = `No pitch, no hard close. Just a plan you can keep.`;
    return {
        subject, preheader,
        html: baseTemplate(`
            <h1 style="margin:0 0 8px;font-size:24px;color:#fff;">Last email — and the only one with an actual offer.</h1>
            <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;">${greet}</p>
            <p style="color:#cbd5e1;font-size:16px;line-height:1.7;font-weight:500;">
                Over the last few emails we covered what AI agents are, the three flavors we build at <strong style="color:#fff;">LNL AI Agency</strong>, and the invisible revenue leak most local businesses are living with.
            </p>
            <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
                Here's the offer: 20 minutes on a call, zero cost, zero follow-up pressure. We map your workflow, identify the top 2–3 automation candidates, and hand you a plan — whether you work with us or not.
            </p>
            <div style="background:#1e3a5f;border-radius:12px;padding:20px 24px;margin:24px 0;border-left:4px solid ${PRIMARY_COLOR};">
                <p style="margin:0 0 6px;color:#a5b4fc;font-size:13px;font-weight:700;">🎁 The free strategy session covers:</p>
                <ul style="color:#cbd5e1;font-size:14px;line-height:2;padding-left:16px;margin:8px 0 0;">
                    <li>Where your week is actually getting spent (the honest version)</li>
                    <li>Which AI agent flavor fits ${businessName} — if any</li>
                    <li>A live walk-through of what a typical day looks like after</li>
                    <li>The math: hours reclaimed, estimated cost, payback timeline</li>
                </ul>
                <p style="margin:12px 0 0;color:#64748b;font-size:13px;">No pitch. Just a plan.</p>
            </div>
            ${ctaButton(`Book the free strategy session →`, STRATEGY_CALL_URL)}
            <hr style="border:none;border-top:1px solid #1e293b;margin:28px 0;" />
            <p style="color:#64748b;font-size:13px;">Reply directly if you have questions — one of us reads every reply.</p>
        `, preheader, unsub),
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── MARKETING SERVICES PUSH (4 emails, +2 days cadence) ───────────────────
// Triggered: after SAAS push completes
// Focus: AI SEO (AEO/GEO), GMB optimization, the 3-audit diagnostic system
// ═══════════════════════════════════════════════════════════════════════════

// ─── MKT PUSH: Email 1 — AEO / GEO / AI Overviews ──────────────────────────
export function marketingPush_email1(
    businessName: string,
    contactName: string | null,
    listingId: number,
    variant: 'A' | 'B' = 'A'
): EmailOutput {
    const greet = contactName ? `Hi ${contactName},` : 'Hi there,';
    const unsub = unsubUrl(listingId);

    if (variant === 'B') {
        const subject = `Google quietly changed (and local businesses are losing)`;
        const preheader = `AI Overviews, zero-click, AEO — here's what it means for your traffic.`;
        return {
            subject, preheader,
            html: baseTemplate(`
                <h1 style="margin:0 0 8px;font-size:24px;color:#fff;">If you haven't heard of AI Overviews yet…</h1>
                <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;">${greet}</p>
                <p style="color:#cbd5e1;font-size:16px;line-height:1.7;font-weight:500;">
                    …<strong style="color:#fff;">${businessName}</strong>'s Google traffic is probably already affected. Most owners haven't connected the dots yet.
                </p>
                <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
                    Quick education piece: when you search on Google now, you often see a generated answer at the top <em>before</em> the blue links. That's an AI Overview. It pulls from a handful of sources, answers the question, and the searcher never clicks through.
                </p>
                <div style="background:#0f172a;border-radius:10px;padding:18px 22px;margin:20px 0;border-left:4px solid #ef4444;">
                    <p style="margin:0 0 6px;color:#fca5a5;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;">Why it matters for ${businessName}</p>
                    <p style="color:#cbd5e1;font-size:14px;line-height:1.7;margin:0;">
                        Zero-click searches are now majority. Click-through rates on "blue link" results have dropped <strong>30–40%</strong> in affected query categories. Local queries like "best plumber near me" are one of those categories.
                    </p>
                </div>
                <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
                    <strong style="color:#fff;">The fix isn't traditional SEO anymore — it's AEO and GEO.</strong> AEO (Answer Engine Optimization) structures your site so AI extracts <em>your</em> business as the answer. GEO (Generative Engine Optimization) does the same for ChatGPT, Perplexity, and Gemini.
                </p>
                <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
                    This is what <strong style="color:#fff;">LNL AI Agency</strong> (powering Triangle Hub) specializes in. We don't just chase keywords — we make you the cited source in AI answers.
                </p>
                ${ctaButton(`Check if ${businessName} shows up in AI answers →`, STRATEGY_CALL_URL)}
            `, preheader, unsub),
        };
    }

    const subject = `ChatGPT was asked about your industry yesterday`;
    const preheader = `Were you in the answer? Most local businesses aren't — and don't know it.`;
    return {
        subject, preheader,
        html: baseTemplate(`
            <h1 style="margin:0 0 8px;font-size:24px;color:#fff;">Someone asked ChatGPT about your industry this week.</h1>
            <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;">${greet}</p>
            <p style="color:#cbd5e1;font-size:16px;line-height:1.7;font-weight:500;">
                "Best ${businessName.includes('Services') ? 'service' : 'business'} in Raleigh" gets asked of ChatGPT, Perplexity, and Google's AI Overview thousands of times a month. <strong style="color:#fff;">${businessName}</strong> may or may not have been in those answers.
            </p>
            <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">${bridgeLine()}</p>
            <div style="background:#0f172a;border-radius:10px;padding:18px 22px;margin:20px 0;border-left:4px solid ${PRIMARY_COLOR};">
                <p style="margin:0 0 6px;color:#a5b4fc;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;">Education — two new acronyms worth knowing</p>
                <p style="color:#cbd5e1;font-size:14px;line-height:1.7;margin:0 0 8px;">
                    <strong style="color:#fff;">AEO (Answer Engine Optimization)</strong> — structuring your site so Google's AI Overview, Bing Copilot, and similar engines pull <em>your</em> content as the answer.
                </p>
                <p style="color:#cbd5e1;font-size:14px;line-height:1.7;margin:0;">
                    <strong style="color:#fff;">GEO (Generative Engine Optimization)</strong> — the same idea, but for ChatGPT, Perplexity, Claude, and Gemini. These now get billions of queries a month.
                </p>
            </div>
            <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
                <strong style="color:#fff;">The specific issue this solves:</strong> AI answers show 1–3 cited sources instead of 10 blue links. If you're not the cited source, you're invisible. Traditional SEO alone won't fix this — AEO/GEO is a different playbook.
            </p>
            <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
                At <strong style="color:#fff;">LNL AI Agency</strong>, we audit where you currently show up in AI answers, identify the gaps, and rebuild your content so you become the cited source. This email series walks through exactly how.
            </p>
            ${ctaButton(`See if ${businessName} shows up today →`, STRATEGY_CALL_URL)}
        `, preheader, unsub),
    };
}

// ─── MKT PUSH: Email 2 — Google My Business optimization ───────────────────
export function marketingPush_email2(
    businessName: string,
    contactName: string | null,
    listingId: number,
    variant: 'A' | 'B' = 'A'
): EmailOutput {
    const greet = contactName ? `Hi ${contactName},` : 'Hi there,';
    const unsub = unsubUrl(listingId);

    if (variant === 'B') {
        const subject = `Your Google profile is quietly costing you calls`;
        const preheader = `There's probably a miss in there right now — wrong category, stale hours, or a missing photo.`;
        return {
            subject, preheader,
            html: baseTemplate(`
                <h1 style="margin:0 0 8px;font-size:24px;color:#fff;">Most GBP misses are small. The cost isn't.</h1>
                <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;">${greet}</p>
                <p style="color:#cbd5e1;font-size:16px;line-height:1.7;font-weight:500;">
                    There's probably a miss on <strong style="color:#fff;">${businessName}</strong>'s Google Business Profile right now that's costing you calls. Wrong primary category, stale hours, unanswered Q&A, or a photo count below the ranking threshold.
                </p>
                <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
                    Education piece: GBP (formerly "Google My Business") is what powers the local 3-pack — the three businesses that appear on Google Maps for local queries. Top 3 capture <strong style="color:#fff;">75% of clicks</strong>. Below the fold, you're invisible.
                </p>
                <div style="background:#0f172a;border-radius:10px;padding:18px 22px;margin:20px 0;">
                    <p style="margin:0 0 8px;color:#94a3b8;font-size:13px;font-weight:700;text-transform:uppercase;">Common misses we find on GBP audits</p>
                    <ul style="color:#cbd5e1;font-size:14px;line-height:1.9;padding-left:16px;margin:0;">
                        <li>Primary category picked too broad (e.g. "Contractor" vs "HVAC Contractor")</li>
                        <li>Fewer than 10 photos (under the ranking floor)</li>
                        <li>Weekly Posts haven't been used in 60+ days</li>
                        <li>Customer Q&A section ignored (Google treats this as relevance signal)</li>
                        <li>Service areas not listed or outdated</li>
                        <li>No Products populated (even when services apply)</li>
                    </ul>
                </div>
                <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
                    <strong style="color:#fff;">The issue this solves:</strong> a fully-optimized GBP outranks better-known competitors with weak profiles. It's the highest ROI lever in local SEO and most owners leave it half-configured.
                </p>
                <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
                    <strong style="color:#fff;">LNL AI Agency</strong> runs a free GBP audit — we show you the misses and what each one's roughly worth in monthly calls.
                </p>
                ${ctaButton(`Get the free GBP audit for ${businessName} →`, STRATEGY_CALL_URL)}
            `, preheader, unsub),
        };
    }

    const subject = `The $0 marketing asset most ${businessName.includes('Real Estate') ? 'agents' : 'owners'} waste`;
    const preheader = `Your Google profile is either your #1 free lead source or your #1 hidden leak.`;
    return {
        subject, preheader,
        html: baseTemplate(`
            <h1 style="margin:0 0 8px;font-size:24px;color:#fff;">Your Google profile is free. It's also your #1 asset.</h1>
            <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;">${greet}</p>
            <p style="color:#cbd5e1;font-size:16px;line-height:1.7;font-weight:500;">
                For a local business, a fully optimized Google Business Profile (GBP) outperforms your own website, paid ads, and most SEO work combined. And it costs nothing.
            </p>
            <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
                Education moment, because this matters: GBP is what feeds the <strong style="color:#fff;">local 3-pack</strong> — the three businesses Google shows on the map for local searches. The top 3 capture 75% of all clicks. Spot 4+ gets almost nothing.
            </p>
            <div style="background:#0f172a;border-radius:10px;padding:18px 22px;margin:20px 0;border-left:4px solid #10b981;">
                <p style="margin:0 0 8px;color:#6ee7b7;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;">What ranks a GBP in 2026</p>
                <ul style="color:#cbd5e1;font-size:14px;line-height:1.9;padding-left:16px;margin:0;">
                    <li><strong style="color:#fff;">Relevance</strong> — primary category, services, business name (exact match to query type)</li>
                    <li><strong style="color:#fff;">Prominence</strong> — review count, review recency, citations across the web</li>
                    <li><strong style="color:#fff;">Activity signals</strong> — Posts, Q&A, photo uploads, booking link clicks</li>
                    <li><strong style="color:#fff;">Proximity</strong> — how close you are to the searcher (not much you can do here)</li>
                </ul>
            </div>
            <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
                <strong style="color:#fff;">The issue this solves:</strong> most owners set up GBP once and never optimize it. Every week without fresh Posts, new photos, or answered Q&A, your prominence score decays. A competitor with a weaker business but a better-maintained profile will rank above you.
            </p>
            <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
                GBP optimization is one of the three audits we run at <strong style="color:#fff;">LNL AI Agency</strong>. More on the other two next email.
            </p>
            ${ctaButton(`Get a free GBP audit for ${businessName} →`, STRATEGY_CALL_URL)}
        `, preheader, unsub),
    };
}

// ─── MKT PUSH: Email 3 — The 3-audit diagnostic system ─────────────────────
export function marketingPush_email3(
    businessName: string,
    contactName: string | null,
    listingId: number,
    variant: 'A' | 'B' = 'A'
): EmailOutput {
    const greet = contactName ? `Hi ${contactName},` : 'Hi there,';
    const unsub = unsubUrl(listingId);

    if (variant === 'B') {
        const subject = `Why we diagnose before we prescribe`;
        const preheader = `Three specific audits. Zero guesswork. Here's what each one reveals.`;
        return {
            subject, preheader,
            html: baseTemplate(`
                <h1 style="margin:0 0 8px;font-size:24px;color:#fff;">You wouldn't trust a doctor who prescribed without tests.</h1>
                <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;">${greet}</p>
                <p style="color:#cbd5e1;font-size:16px;line-height:1.7;font-weight:500;">
                    Most SEO agencies work that way anyway — they sell you a package, then figure it out. At <strong style="color:#fff;">LNL AI Agency</strong>, we run three audits first. Here's what each one reveals.
                </p>
                <div style="background:#0f172a;border-radius:10px;padding:20px;margin:18px 0;border-left:4px solid #10b981;">
                    <p style="margin:0 0 8px;color:#6ee7b7;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Audit 1 — Trust</p>
                    <p style="color:#cbd5e1;font-size:14px;line-height:1.7;margin:0;">
                        <strong style="color:#fff;">Reveals:</strong> whether Google sees ${businessName} as authoritative. We score reviews (count, recency, response rate), citations (NAP consistency across directories), brand mentions, and E-E-A-T signals. Trust is the ceiling on how high you can rank — fix it first.
                    </p>
                </div>
                <div style="background:#0f172a;border-radius:10px;padding:20px;margin:18px 0;border-left:4px solid #f59e0b;">
                    <p style="margin:0 0 8px;color:#fcd34d;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Audit 2 — GBP</p>
                    <p style="color:#cbd5e1;font-size:14px;line-height:1.7;margin:0;">
                        <strong style="color:#fff;">Reveals:</strong> every miss on your Google Business Profile. Category gaps, missing services, photo count under threshold, stale Posts, unanswered Q&A. We quantify each miss in roughly "calls per month lost."
                    </p>
                </div>
                <div style="background:#0f172a;border-radius:10px;padding:20px;margin:18px 0;border-left:4px solid ${PRIMARY_COLOR};">
                    <p style="margin:0 0 8px;color:#a5b4fc;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Audit 3 — Tech SEO</p>
                    <p style="color:#cbd5e1;font-size:14px;line-height:1.7;margin:0;">
                        <strong style="color:#fff;">Reveals:</strong> whether your site can even be found and parsed. Speed scores, mobile issues, indexing problems, broken schema, AEO-readiness (is your content structured for AI extraction?). This is where most sites quietly bleed rankings.
                    </p>
                </div>
                <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
                    <strong style="color:#fff;">The issue this solves:</strong> fixing the wrong thing. Most SEO spend is wasted because the agency didn't diagnose first.
                </p>
                ${ctaButton(`Get all 3 audits for ${businessName} →`, STRATEGY_CALL_URL)}
            `, preheader, unsub),
        };
    }

    const subject = `Before we touch any SEO, we check 3 things`;
    const preheader = `The diagnostic system that decides what actually gets fixed.`;
    return {
        subject, preheader,
        html: baseTemplate(`
            <h1 style="margin:0 0 8px;font-size:24px;color:#fff;">We don't guess. Here's how we diagnose.</h1>
            <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;">${greet}</p>
            <p style="color:#cbd5e1;font-size:16px;line-height:1.7;font-weight:500;">
                Most SEO agencies show up with a recommendation before they've looked at anything. At <strong style="color:#fff;">LNL AI Agency</strong>, every engagement starts with three audits. This is the part nobody explains — so here it is.
            </p>
            <div style="background:#0f172a;border-radius:10px;padding:20px;margin:18px 0;border-left:4px solid #10b981;">
                <p style="margin:0 0 8px;color:#6ee7b7;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Audit 1 — Trust Audit</p>
                <p style="color:#cbd5e1;font-size:14px;line-height:1.7;margin:0 0 8px;">
                    <strong style="color:#fff;">What we check:</strong> review volume/recency/response rate, NAP consistency across directories, brand mentions, E-E-A-T (Experience, Expertise, Authoritativeness, Trust) signals.
                </p>
                <p style="color:#cbd5e1;font-size:14px;line-height:1.7;margin:0;">
                    <strong style="color:#fff;">Why it matters:</strong> Google won't rank you above your Trust ceiling no matter how perfect the rest of your SEO is. Fix this first.
                </p>
            </div>
            <div style="background:#0f172a;border-radius:10px;padding:20px;margin:18px 0;border-left:4px solid #f59e0b;">
                <p style="margin:0 0 8px;color:#fcd34d;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Audit 2 — GBP Audit</p>
                <p style="color:#cbd5e1;font-size:14px;line-height:1.7;margin:0 0 8px;">
                    <strong style="color:#fff;">What we check:</strong> primary category, services listed, photo count, Posts cadence, Q&A completeness, review response rate, booking/message enablement.
                </p>
                <p style="color:#cbd5e1;font-size:14px;line-height:1.7;margin:0;">
                    <strong style="color:#fff;">Why it matters:</strong> GBP drives the local 3-pack, which drives 75% of local clicks. Every miss has a rough "calls per month lost" we can quantify.
                </p>
            </div>
            <div style="background:#0f172a;border-radius:10px;padding:20px;margin:18px 0;border-left:4px solid ${PRIMARY_COLOR};">
                <p style="margin:0 0 8px;color:#a5b4fc;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Audit 3 — Tech SEO Audit</p>
                <p style="color:#cbd5e1;font-size:14px;line-height:1.7;margin:0 0 8px;">
                    <strong style="color:#fff;">What we check:</strong> Core Web Vitals (speed), mobile usability, indexing status, schema markup, internal linking, and AEO-readiness — whether your content is structured so AI engines can extract it as the answer.
                </p>
                <p style="color:#cbd5e1;font-size:14px;line-height:1.7;margin:0;">
                    <strong style="color:#fff;">Why it matters:</strong> a slow or poorly structured site can't rank no matter how good the content is. And in the AI-answer era, unstructured content is invisible.
                </p>
            </div>
            <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
                <strong style="color:#fff;">The issue this solves:</strong> marketing spend wasted on the wrong fix. Diagnose first. Then fix.
            </p>
            ${ctaButton(`Get all 3 audits free for ${businessName} →`, STRATEGY_CALL_URL)}
        `, preheader, unsub),
    };
}

// ─── MKT PUSH: Email 4 — Free audit offer / last email ─────────────────────
export function marketingPush_email4(
    businessName: string,
    contactName: string | null,
    listingId: number,
    variant: 'A' | 'B' = 'A'
): EmailOutput {
    const greet = contactName ? `Hi ${contactName},` : 'Hi there,';
    const unsub = unsubUrl(listingId);

    if (variant === 'B') {
        const subject = `Last email — here's what we'd do for ${businessName}`;
        const preheader = `A specific 30-day plan. Yours to keep either way.`;
        return {
            subject, preheader,
            html: baseTemplate(`
                <h1 style="margin:0 0 8px;font-size:24px;color:#fff;">If we were handed ${businessName} tomorrow…</h1>
                <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;">${greet}</p>
                <p style="color:#cbd5e1;font-size:16px;line-height:1.7;font-weight:500;">
                    …here's what the first 30 days would look like at <strong style="color:#fff;">LNL AI Agency</strong>. No fluff, no discovery-phase stalling.
                </p>
                <div style="background:#0f172a;border-radius:10px;padding:20px;margin:18px 0;border-left:4px solid #10b981;">
                    <p style="margin:0 0 6px;color:#6ee7b7;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Week 1 — The 3 Audits</p>
                    <p style="color:#cbd5e1;font-size:14px;line-height:1.7;margin:0;">Trust Audit, GBP Audit, Tech SEO Audit. Quantified: "here's what each miss is costing per month."</p>
                </div>
                <div style="background:#0f172a;border-radius:10px;padding:20px;margin:18px 0;border-left:4px solid #f59e0b;">
                    <p style="margin:0 0 6px;color:#fcd34d;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Week 2 — GBP Fixes</p>
                    <p style="color:#cbd5e1;font-size:14px;line-height:1.7;margin:0;">Category correction, photo ramp, Posts cadence started, Q&A populated, review automation turned on. Highest-ROI lever, fixed first.</p>
                </div>
                <div style="background:#0f172a;border-radius:10px;padding:20px;margin:18px 0;border-left:4px solid ${PRIMARY_COLOR};">
                    <p style="margin:0 0 6px;color:#a5b4fc;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Weeks 3–4 — AEO + Tech SEO</p>
                    <p style="color:#cbd5e1;font-size:14px;line-height:1.7;margin:0;">Content restructured for AI extraction, schema deployed, speed issues fixed, answer-ready pages published for your top queries.</p>
                </div>
                <div style="background:#1e3a5f;border-radius:10px;padding:20px;margin:18px 0;">
                    <p style="margin:0 0 6px;color:#a5b4fc;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Bonus — AI Agent Integration</p>
                    <p style="color:#cbd5e1;font-size:14px;line-height:1.7;margin:0;">If you're interested from the earlier series: the same agents can be plugged into the new marketing flows so SEO leads land with an agent already handling intake.</p>
                </div>
                ${ctaButton(`Book the 30-day planning call →`, STRATEGY_CALL_URL)}
                <hr style="border:none;border-top:1px solid #1e293b;margin:28px 0;" />
                <p style="color:#64748b;font-size:13px;">Last email in this series — reply anytime and we will be here.</p>
            `, preheader, unsub),
        };
    }

    const subject = `One free thing we can do for ${businessName} this week`;
    const preheader = `Three audits, no pitch attached. Yours to keep.`;
    return {
        subject, preheader,
        html: baseTemplate(`
            <h1 style="margin:0 0 8px;font-size:24px;color:#fff;">Final email — and the one where we give something away.</h1>
            <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;">${greet}</p>
            <p style="color:#cbd5e1;font-size:16px;line-height:1.7;font-weight:500;">
                Over the last few weeks we covered the AEO/GEO shift in search, why Google Business Profile is the highest-ROI asset in local, and the 3-audit system <strong style="color:#fff;">LNL AI Agency</strong> runs before touching anything.
            </p>
            <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
                Here's the offer: we'll run all 3 audits on <strong style="color:#fff;">${businessName}</strong> for free. You'll get the output whether you work with us or not.
            </p>
            <div style="background:#1e3a5f;border-radius:12px;padding:20px 24px;margin:24px 0;border-left:4px solid ${PRIMARY_COLOR};">
                <p style="margin:0 0 8px;color:#a5b4fc;font-size:13px;font-weight:700;">🎁 Your free audit package includes:</p>
                <ul style="color:#cbd5e1;font-size:14px;line-height:2;padding-left:16px;margin:0;">
                    <li><strong style="color:#fff;">Trust Audit</strong> — reviews, citations, brand signals, E-E-A-T score</li>
                    <li><strong style="color:#fff;">GBP Audit</strong> — every miss, scored and prioritized by calls/month impact</li>
                    <li><strong style="color:#fff;">Tech SEO + AEO Audit</strong> — what's broken, what's slow, what's invisible to AI</li>
                    <li>A 20-minute walk-through of all three — then we leave you alone</li>
                </ul>
                <p style="margin:12px 0 0;color:#64748b;font-size:13px;">No pitch. No follow-up pressure. Hand on heart.</p>
            </div>
            ${ctaButton(`Get the free 3-audit package →`, STRATEGY_CALL_URL)}
            <hr style="border:none;border-top:1px solid #1e293b;margin:28px 0;" />
            <p style="color:#64748b;font-size:13px;">This is our last email in the series. If the timing is not right, reply anytime — we'll pick it up when you're ready.</p>
        `, preheader, unsub),
    };
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

// ═══════════════════════════════════════════════════════════════════════════
// ─── COLD REACTIVATION (4 emails, +2 days cadence) ─────────────────────────
// Triggered: 30 days after outreach email_4 for listings still unclaimed.
// Focus: directory member features (articles, events, jobs, featured
//        placement, photos). Email 1 carries the free 10-point AI / Local
//        Search Visibility Audit incentive from LNL AI Agency for claiming.
// ═══════════════════════════════════════════════════════════════════════════

function claimUrl(listingId: number): string {
    return `${SITE_URL}/biz/claim?id=${listingId}`;
}

// ─── COLD REACTIVATION: Email 1 — Features + free audit offer ──────────────
export function coldReactivation_email1(
    businessName: string,
    contactName: string | null,
    listingId: number,
    variant: 'A' | 'B' = 'A'
): EmailOutput {
    const greet = contactName ? `Hi ${contactName},` : 'Hi there,';
    const unsub = unsubUrl(listingId);
    const claim = claimUrl(listingId);

    if (variant === 'B') {
        const subject = `There's a free audit attached to this email (sort of)`;
        const preheader = `Confirm your Triangle Hub listing, get a 10-point AI / local search visibility audit. Worth $500.`;
        return {
            subject, preheader,
            html: baseTemplate(`
                <h1 style="margin:0 0 8px;font-size:24px;color:#fff;">Short version first.</h1>
                <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;">${greet}</p>
                <p style="color:#cbd5e1;font-size:16px;line-height:1.7;font-weight:500;">
                    Confirm your <strong style="color:#fff;">${businessName}</strong> listing on Triangle Hub and we send you a free <strong style="color:#fff;">10-point AI &amp; Local Search Visibility Audit</strong> from <strong style="color:#fff;">LNL AI Agency</strong> (the team behind the directory). Normally $500. Yours for hitting the claim button.
                </p>
                <div style="background:#1e3a5f;border-radius:12px;padding:20px 24px;margin:20px 0;border-left:4px solid ${PRIMARY_COLOR};">
                    <p style="margin:0 0 8px;color:#a5b4fc;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;">🎁 What's in the 10-point audit</p>
                    <ul style="color:#cbd5e1;font-size:14px;line-height:1.9;padding-left:16px;margin:0;">
                        <li>Where ${businessName} ranks in Google's local 3-pack today</li>
                        <li>AI Overview + ChatGPT/Perplexity visibility check</li>
                        <li>Google Business Profile completeness score</li>
                        <li>Trust signals — reviews, citations, E-E-A-T</li>
                        <li>Tech SEO gaps (speed, schema, AI-readability)</li>
                        <li>Three top-priority fixes, quantified by monthly call impact</li>
                    </ul>
                </div>
                <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
                    By the way — claiming also unlocks the directory features you're <em>not</em> using right now:
                </p>
                <ul style="color:#cbd5e1;font-size:15px;line-height:2;padding-left:20px;margin:0 0 16px;">
                    <li>📝 Publish articles on the directory (local SEO juice)</li>
                    <li>📅 Advertise your events to the local audience</li>
                    <li>💼 Post jobs to the Triangle Hub job board</li>
                    <li>⭐ Featured placement on category pages</li>
                    <li>📸 Photo gallery + enhanced description</li>
                </ul>
                ${ctaButton(`Claim ${businessName} + get the free audit →`, claim)}
                <p style="margin-top:16px;color:#64748b;font-size:13px;">Takes 2 minutes. The audit lands in your inbox within 48 hours.</p>
            `, preheader, unsub),
        };
    }

    const subject = `Your ${businessName} listing is doing 20% of what it could`;
    const preheader = `Free member features you're not using — plus a 10-point audit as a thank-you for claiming.`;
    return {
        subject, preheader,
        html: baseTemplate(`
            <h1 style="margin:0 0 8px;font-size:24px;color:#fff;">You left something on the table.</h1>
            <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;">${greet}</p>
            <p style="color:#cbd5e1;font-size:16px;line-height:1.7;font-weight:500;">
                When <strong style="color:#fff;">${businessName}</strong> landed on Triangle Hub, your listing got the basics. There's another 80% of what a claimed member can do — and you're leaving it on the table.
            </p>
            <div style="background:#0f172a;border-radius:10px;padding:18px 22px;margin:20px 0;border-left:4px solid #10b981;">
                <p style="margin:0 0 8px;color:#6ee7b7;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;">What members unlock — free</p>
                <ul style="color:#cbd5e1;font-size:14px;line-height:1.9;padding-left:16px;margin:0;">
                    <li><strong style="color:#fff;">Articles</strong> — publish on the directory domain; rankable content without building your own blog</li>
                    <li><strong style="color:#fff;">Events</strong> — promote things you're hosting to the local audience</li>
                    <li><strong style="color:#fff;">Jobs</strong> — post openings to the Triangle Hub job board (pulled into Google for Jobs)</li>
                    <li><strong style="color:#fff;">Featured placement</strong> — sort higher on category pages</li>
                    <li><strong style="color:#fff;">Photos + enhanced description</strong> — richer listing = higher click-through</li>
                </ul>
            </div>
            <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
                <strong style="color:#fff;">Why this matters:</strong> fresh content signals activity to Google. Articles published on a trusted local domain often rank faster than posts on a new business site. Events and job listings pull independent search traffic. Your listing becomes a real marketing asset instead of a static card.
            </p>
            <div style="background:#1e3a5f;border-radius:12px;padding:20px 24px;margin:24px 0;border-left:4px solid ${PRIMARY_COLOR};">
                <p style="margin:0 0 6px;color:#a5b4fc;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;">🎁 Thank-you bonus for claiming</p>
                <p style="color:#cbd5e1;font-size:14px;line-height:1.7;margin:0;">
                    Confirm your listing and <strong style="color:#fff;">LNL AI Agency</strong> (the marketing arm powering Triangle Hub) will send you a complimentary <strong style="color:#fff;">10-point AI &amp; Local Search Visibility Audit</strong> — where you rank, where you're invisible in AI answers, and the three highest-impact fixes. Normally $500. Yours for claiming.
                </p>
            </div>
            ${ctaButton(`Claim ${businessName} + get the free audit →`, claim)}
            <p style="margin-top:16px;color:#64748b;font-size:13px;">Two-minute claim. No credit card. Audit delivered within 48 hours of confirmation.</p>
        `, preheader, unsub),
    };
}

// ─── COLD REACTIVATION: Email 2 — Articles as local SEO ────────────────────
export function coldReactivation_email2(
    businessName: string,
    contactName: string | null,
    listingId: number,
    variant: 'A' | 'B' = 'A'
): EmailOutput {
    const greet = contactName ? `Hi ${contactName},` : 'Hi there,';
    const unsub = unsubUrl(listingId);
    const claim = claimUrl(listingId);

    if (variant === 'B') {
        const subject = `Free publishing + free discovery for ${businessName}`;
        const preheader = `Articles, events, jobs — all free when you claim. Here's what each unlocks.`;
        return {
            subject, preheader,
            html: baseTemplate(`
                <h1 style="margin:0 0 8px;font-size:24px;color:#fff;">Triangle Hub has a publishing layer most SMBs never see.</h1>
                <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;">${greet}</p>
                <p style="color:#cbd5e1;font-size:16px;line-height:1.7;font-weight:500;">
                    When you claim <strong style="color:#fff;">${businessName}</strong>, the directory opens up a publishing layer: articles, events, jobs. All free. All rankable in Google.
                </p>
                <div style="background:#0f172a;border-radius:10px;padding:18px 22px;margin:20px 0;">
                    <p style="margin:0 0 6px;color:#6ee7b7;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;">Articles</p>
                    <p style="color:#cbd5e1;font-size:14px;line-height:1.7;margin:0 0 14px;">
                        Write about work you just did, common questions, seasonal tips. Each article gets its own URL on a trusted local domain — discoverable by Google and by anyone browsing the directory.
                    </p>
                    <p style="margin:0 0 6px;color:#fcd34d;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;">Events</p>
                    <p style="color:#cbd5e1;font-size:14px;line-height:1.7;margin:0 0 14px;">
                        Hosting an open house, workshop, community event? The directory's events feed pulls in local traffic actively searching for "${businessName.split(' ')[0] || 'things'} this weekend."
                    </p>
                    <p style="margin:0 0 6px;color:#a5b4fc;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;">Jobs</p>
                    <p style="color:#cbd5e1;font-size:14px;line-height:1.7;margin:0;">
                        Post openings that surface in the Triangle Hub job board and get structured data pulled by Google for Jobs — so your role shows up in the dedicated jobs search.
                    </p>
                </div>
                <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
                    Still a free listing. You just have to confirm it to activate these.
                </p>
                ${ctaButton(`Activate your features for ${businessName} →`, claim)}
            `, preheader, unsub),
        };
    }

    const subject = `A quiet Google trick local businesses are using`;
    const preheader = `Publishing articles on a trusted local directory ranks faster than posts on a new business blog. Here's why.`;
    return {
        subject, preheader,
        html: baseTemplate(`
            <h1 style="margin:0 0 8px;font-size:24px;color:#fff;">Fresh content on a trusted domain ranks faster.</h1>
            <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;">${greet}</p>
            <p style="color:#cbd5e1;font-size:16px;line-height:1.7;font-weight:500;">
                This one flies under the radar. Local businesses that publish articles on a trusted directory often rank in Google faster than the same content on a brand-new business blog.
            </p>
            <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
                Education piece: Google weighs two signals heavily — <strong style="color:#fff;">domain authority</strong> (does the site already rank?) and <strong style="color:#fff;">topical relevance</strong> (is this site about this topic?). A new business site fails both. A local directory that's been indexed for years passes both. So when you publish on Triangle Hub, you're renting that authority for your content.
            </p>
            <div style="background:#0f172a;border-radius:10px;padding:18px 22px;margin:20px 0;border-left:4px solid #10b981;">
                <p style="margin:0 0 8px;color:#6ee7b7;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;">What to publish</p>
                <ul style="color:#cbd5e1;font-size:14px;line-height:1.9;padding-left:16px;margin:0;">
                    <li>Real work you just completed (case studies, before/afters)</li>
                    <li>Answers to the top 5 questions customers ask you on every call</li>
                    <li>Seasonal tips tied to your industry</li>
                    <li>Local how-to content (how-to in the Triangle area)</li>
                </ul>
            </div>
            <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
                <strong style="color:#fff;">The issue it solves:</strong> most SMBs know "content matters for SEO" but never actually publish because their own site is slow to build and slower to rank. Directory publishing kills both blockers.
            </p>
            <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
                Article publishing is unlocked the second you claim <strong style="color:#fff;">${businessName}</strong>. No credit card. No commitment.
            </p>
            ${ctaButton(`Claim ${businessName} →`, claim)}
            <p style="margin-top:16px;color:#64748b;font-size:13px;">Reminder: claiming also gets you the free 10-point audit from LNL AI Agency.</p>
        `, preheader, unsub),
    };
}

// ─── COLD REACTIVATION: Email 3 — Events + Jobs ────────────────────────────
export function coldReactivation_email3(
    businessName: string,
    contactName: string | null,
    listingId: number,
    variant: 'A' | 'B' = 'A'
): EmailOutput {
    const greet = contactName ? `Hi ${contactName},` : 'Hi there,';
    const unsub = unsubUrl(listingId);
    const claim = claimUrl(listingId);

    if (variant === 'B') {
        const subject = `The events bucket your competitors aren't in`;
        const preheader = `Plus the job-post hack that ranks on Google for Jobs. Both free with claim.`;
        return {
            subject, preheader,
            html: baseTemplate(`
                <h1 style="margin:0 0 8px;font-size:24px;color:#fff;">Two free channels most SMBs skip.</h1>
                <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;">${greet}</p>
                <p style="color:#cbd5e1;font-size:16px;line-height:1.7;font-weight:500;">
                    Most local businesses leave two free distribution channels untouched. Both live on Triangle Hub. Both are unlocked when you claim <strong style="color:#fff;">${businessName}</strong>.
                </p>
                <div style="background:#0f172a;border-radius:10px;padding:20px;margin:18px 0;border-left:4px solid #f59e0b;">
                    <p style="margin:0 0 8px;color:#fcd34d;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;">Local Events Feed</p>
                    <p style="color:#cbd5e1;font-size:14px;line-height:1.7;margin:0 0 6px;">
                        <strong style="color:#fff;">What it does:</strong> your event shows up in Triangle Hub's event browse + search, which pulls steady local traffic from people planning weekends.
                    </p>
                    <p style="color:#cbd5e1;font-size:14px;line-height:1.7;margin:0;">
                        <strong style="color:#fff;">Issue it solves:</strong> paid event promotion is expensive. A directory's event page is free and ranks on long-tail queries ("things to do in Raleigh this weekend").
                    </p>
                </div>
                <div style="background:#0f172a;border-radius:10px;padding:20px;margin:18px 0;border-left:4px solid ${PRIMARY_COLOR};">
                    <p style="margin:0 0 8px;color:#a5b4fc;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;">Triangle Hub Job Board</p>
                    <p style="color:#cbd5e1;font-size:14px;line-height:1.7;margin:0 0 6px;">
                        <strong style="color:#fff;">What it does:</strong> your job posts are structured with proper schema, so Google for Jobs can pull them into the dedicated jobs search.
                    </p>
                    <p style="color:#cbd5e1;font-size:14px;line-height:1.7;margin:0;">
                        <strong style="color:#fff;">Issue it solves:</strong> Indeed and LinkedIn job posts cost real money. Google for Jobs is free distribution — and the Triangle Hub board is one of the simplest ways to feed into it.
                    </p>
                </div>
                ${ctaButton(`Claim ${businessName} and activate both →`, claim)}
            `, preheader, unsub),
        };
    }

    const subject = `Hosting anything? Or hiring anyone?`;
    const preheader = `Two quick questions — and two free channels on Triangle Hub that most SMBs forget exist.`;
    return {
        subject, preheader,
        html: baseTemplate(`
            <h1 style="margin:0 0 8px;font-size:24px;color:#fff;">Two quick questions for ${businessName}.</h1>
            <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;">${greet}</p>
            <p style="color:#cbd5e1;font-size:16px;line-height:1.7;font-weight:500;">
                Hosting any events in the next 90 days? Hiring anyone in the next 6 months?
            </p>
            <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
                If either answer is yes, you're leaving two free distribution channels on the table — both live on Triangle Hub, both unlocked when you claim your listing.
            </p>
            <div style="background:#0f172a;border-radius:10px;padding:20px;margin:18px 0;border-left:4px solid #f59e0b;">
                <p style="margin:0 0 8px;color:#fcd34d;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;">Events → discoverable by local search</p>
                <p style="color:#cbd5e1;font-size:14px;line-height:1.7;margin:0;">
                    Open houses, workshops, ribbon cuttings, community events. Triangle Hub's events feed pulls visitors searching "things to do in Raleigh this weekend" or "${businessName.split(' ')[0] || 'events'} near me." Free posting, permanent URL, full SEO value.
                </p>
            </div>
            <div style="background:#0f172a;border-radius:10px;padding:20px;margin:18px 0;border-left:4px solid ${PRIMARY_COLOR};">
                <p style="margin:0 0 8px;color:#a5b4fc;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;">Jobs → surfaces in Google for Jobs</p>
                <p style="color:#cbd5e1;font-size:14px;line-height:1.7;margin:0;">
                    Our job board marks posts with structured data so Google for Jobs can pull them into its dedicated search. Your role reaches local candidates for free — instead of the usual Indeed bill.
                </p>
            </div>
            <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
                <strong style="color:#fff;">Issue both solve:</strong> paid distribution (ads, Indeed, Eventbrite premium) is the default most SMBs use because they don't realize the free channels exist. These do.
            </p>
            ${ctaButton(`Claim ${businessName} to activate both →`, claim)}
            <p style="margin-top:16px;color:#64748b;font-size:13px;">Reminder: claiming still gets you the free 10-point audit from LNL AI Agency.</p>
        `, preheader, unsub),
    };
}

// ─── COLD REACTIVATION: Email 4 — Last email / recap ───────────────────────
export function coldReactivation_email4(
    businessName: string,
    contactName: string | null,
    listingId: number,
    variant: 'A' | 'B' = 'A'
): EmailOutput {
    const greet = contactName ? `Hi ${contactName},` : 'Hi there,';
    const unsub = unsubUrl(listingId);
    const claim = claimUrl(listingId);

    if (variant === 'B') {
        const subject = `We'll stop reaching out after this`;
        const preheader = `One last reminder of what's free for the taking at Triangle Hub.`;
        return {
            subject, preheader,
            html: baseTemplate(`
                <h1 style="margin:0 0 8px;font-size:24px;color:#fff;">Last email. Then we're quiet.</h1>
                <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;">${greet}</p>
                <p style="color:#cbd5e1;font-size:16px;line-height:1.7;font-weight:500;">
                    If the timing is off, no worries — we'll take your silence as the answer. Before we go, the one-minute recap of what a free claim unlocks for <strong style="color:#fff;">${businessName}</strong>:
                </p>
                <div style="background:#0f172a;border-radius:10px;padding:18px 22px;margin:20px 0;">
                    <ul style="color:#cbd5e1;font-size:15px;line-height:2;padding-left:20px;margin:0;">
                        <li>📝 Publish articles on the directory domain</li>
                        <li>📅 Advertise your events to the local audience</li>
                        <li>💼 Post jobs (feeds into Google for Jobs)</li>
                        <li>⭐ Featured placement on category pages</li>
                        <li>📸 Photo gallery + enhanced description</li>
                        <li>🎁 Free 10-point AI / Local Search Visibility Audit — $500 value, yours for claiming</li>
                    </ul>
                </div>
                <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
                    Triangle Hub is <strong style="color:#fff;">powered by LNL AI Agency</strong>. If the directory itself isn't the fit, but AI-powered search visibility or agents sound interesting, reply to this email and we'll chat.
                </p>
                ${ctaButton(`Claim ${businessName} before we go quiet →`, claim)}
                <hr style="border:none;border-top:1px solid #1e293b;margin:28px 0;" />
                <p style="color:#64748b;font-size:13px;">That's the last we'll send on this.</p>
            `, preheader, unsub),
        };
    }

    const subject = `Last email from us — short version`;
    const preheader = `Everything you'd unlock with a free claim. Then we stop.`;
    return {
        subject, preheader,
        html: baseTemplate(`
            <h1 style="margin:0 0 8px;font-size:24px;color:#fff;">Final email. Here's the short version.</h1>
            <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;">${greet}</p>
            <p style="color:#cbd5e1;font-size:16px;line-height:1.7;font-weight:500;">
                Three minutes of your time, then we stop. Here's everything <strong style="color:#fff;">${businessName}</strong> would unlock by confirming the listing.
            </p>
            <div style="background:#0f172a;border-radius:10px;padding:20px;margin:18px 0;border-left:4px solid #10b981;">
                <p style="margin:0 0 8px;color:#6ee7b7;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;">Free member features</p>
                <ul style="color:#cbd5e1;font-size:14px;line-height:1.9;padding-left:16px;margin:0;">
                    <li><strong style="color:#fff;">Articles</strong> — publish on a trusted local domain, rank faster</li>
                    <li><strong style="color:#fff;">Events</strong> — promote what you're hosting to local searchers</li>
                    <li><strong style="color:#fff;">Jobs</strong> — post roles that feed Google for Jobs</li>
                    <li><strong style="color:#fff;">Featured placement + photos + enhanced profile</strong></li>
                </ul>
            </div>
            <div style="background:#1e3a5f;border-radius:10px;padding:20px;margin:18px 0;border-left:4px solid ${PRIMARY_COLOR};">
                <p style="margin:0 0 8px;color:#a5b4fc;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;">🎁 Free audit for claiming</p>
                <p style="color:#cbd5e1;font-size:14px;line-height:1.7;margin:0;">
                    <strong style="color:#fff;">LNL AI Agency</strong> (the team behind the directory) will send you a complimentary 10-point AI &amp; Local Search Visibility Audit — your Google ranking, AI Overview presence, GBP gaps, and three priority fixes. Normally $500. Yours for confirming.
                </p>
            </div>
            <p style="color:#cbd5e1;font-size:15px;line-height:1.7;">
                If now isn't the right time, no worries — we'll go quiet after this. But the claim button still works whenever you are ready.
            </p>
            ${ctaButton(`Claim ${businessName} →`, claim)}
            <hr style="border:none;border-top:1px solid #1e293b;margin:28px 0;" />
            <p style="color:#64748b;font-size:13px;">Last email in this series. Reply anytime and we will be here.</p>
        `, preheader, unsub),
    };
}
