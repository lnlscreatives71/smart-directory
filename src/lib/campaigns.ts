import { NextResponse } from 'next/server';

// Master kill switch for all outbound email CAMPAIGNS (outreach, premium-upsell,
// saas-push, marketing-services, cold-reactivation). Does NOT affect transactional
// email (claim confirmations, magic links, booking confirmations).
//
// Fail-safe: campaigns are PAUSED unless CAMPAIGNS_ENABLED === 'true'.
// To resume sending later, set CAMPAIGNS_ENABLED=true in the environment and redeploy.
export function campaignsPaused(): boolean {
    return process.env.CAMPAIGNS_ENABLED !== 'true';
}

export function campaignsPausedResponse() {
    return NextResponse.json({
        success: false,
        paused: true,
        message: 'Email campaigns are paused (CAMPAIGNS_ENABLED is not "true"). No emails were sent.',
    });
}
