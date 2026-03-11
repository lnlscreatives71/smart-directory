import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const textConfig = await request.text();
        let debugDaysStr = '';
        try {
            if (textConfig) {
                const jsonConfig = JSON.parse(textConfig);
                debugDaysStr = jsonConfig.forceRun ? '0 days' : '5 days';
            }
        } catch (e) { }

        const intervalString = debugDaysStr || '5 days';

        let emailsSent = 0;

        // 1. Fetch campaigns that are pending (Need Email 1 Verification)
        const pendingCampaigns = await sql`
      SELECT c.id, c.listing_id, l.name, l.contact_email, l.claimed 
      FROM outreach_campaigns c
      JOIN listings l ON c.listing_id = l.id
      WHERE c.status = 'pending' AND l.contact_email IS NOT NULL AND l.claimed = FALSE
    `;

        for (const campaign of pendingCampaigns) {
            await sendEmail({
                to: campaign.contact_email as string,
                subject: `Verify your business info on Triangle Local Hub`,
                html: `<p>Hi there,</p><p>We just added <b>${campaign.name}</b> to our local Triangle business directory! Please <a href="http://localhost:3000/biz/claim?id=${campaign.listing_id}">click here</a> to verify your info and claim your free profile so you can start getting leads.</p>`
            });

            await sql`
        UPDATE outreach_campaigns 
        SET status = 'email_1_sent', email_1_sent_at = NOW() 
        WHERE id = ${campaign.id}
      `;
            emailsSent++;
        }

        // 2. Fetch campaigns that claimed their listing (Need Email 2 Upgrade Pitch)
        // Send to claimed businesses that haven't received email 2 yet.
        const upgradeCampaigns = await sql`
      SELECT c.id, c.listing_id, l.name, l.contact_email 
      FROM outreach_campaigns c
      JOIN listings l ON c.listing_id = l.id
      WHERE c.email_1_sent_at IS NOT NULL 
        AND c.email_2_sent_at IS NULL 
        AND l.claimed = TRUE
    `;

        for (const campaign of upgradeCampaigns) {
            await sendEmail({
                to: campaign.contact_email as string,
                subject: `Get more eyes on ${campaign.name} with Premium`,
                html: `<p>Thanks for claiming your profile!</p><p>Did you know our Premium listings receive 4x more leads? Upgrade today to unlock AI Chat and Booking capabilities right on your profile.</p>`
            });

            await sql`
        UPDATE outreach_campaigns 
        SET status = 'completed', email_2_sent_at = NOW() 
        WHERE id = ${campaign.id}
      `;
            emailsSent++;
        }

        // 3. Follow up if NO response (No claim) after waiting period.
        const followUpCampaigns = await sql`
      SELECT c.id, c.listing_id, l.name, l.contact_email 
      FROM outreach_campaigns c
      JOIN listings l ON c.listing_id = l.id
      WHERE c.status = 'email_1_sent' 
        AND l.claimed = FALSE 
        AND c.email_1_sent_at < NOW() - ${intervalString}::interval
        AND c.email_3_sent_at IS NULL
    `;

        for (const campaign of followUpCampaigns) {
            await sendEmail({
                to: campaign.contact_email as string,
                subject: `Just following up: Claim your profile for ${campaign.name}`,
                html: `<p>Hi again, we noticed you haven't claimed your directory listing yet. Make sure your business info is correct so you don't miss out on local search traffic.</p>`
            });

            await sql`
        UPDATE outreach_campaigns 
        SET status = 'completed', email_3_sent_at = NOW() 
        WHERE id = ${campaign.id}
      `;
            emailsSent++;
        }

        return NextResponse.json({ success: true, message: `CRM Outreach processed successfully. Sent ${emailsSent} emails.` });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('Outreach cron error:', err);
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
