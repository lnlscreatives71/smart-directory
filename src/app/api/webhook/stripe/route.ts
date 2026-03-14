import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { sql } from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
    apiVersion: '2025-02-24.acacia'
});

export async function POST(req: Request) {
    const payload = await req.text();
    const sig = req.headers.get('stripe-signature') as string;

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        if (!webhookSecret) {
            throw new Error('STRIPE_WEBHOOK_SECRET is not configured in .env.local');
        }
        
        // This validates the event is legitimately coming from Stripe
        event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // Handle the specific event when the payment completes successfully
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;

        const listingId = session.metadata?.listing_id;
        const planTier = session.metadata?.plan_tier;

        console.log(`Payment successful for Listing ID: ${listingId}, upgrading to ${planTier}...`);

        if (listingId && listingId !== 'unknown_or_new') {
            try {
                // Determine Plan ID dynamically (assuming 2 = Premium, 3 = Pro)
                const targetPlanId = planTier === 'premium' ? 2 : 3;

                // Turn on Premium features in JSON schema
                const premiumFlags = {
                    highlight_on_home: true,
                    priority_ranking: true,
                    ai_chat_widget: true,
                    booking_calendar: true
                };

                await sql`
                    UPDATE listings 
                    SET plan_id = ${targetPlanId}, feature_flags = ${JSON.stringify(premiumFlags)}
                    WHERE id = ${Number(listingId)}
                `;
                console.log(`Listing ${listingId} successfully upgraded in database via Webhook.`);
                
            } catch (dbError) {
                console.error('Database Error upgarding listing:', dbError);
                return NextResponse.json({ error: 'Database upgrade failed' }, { status: 500 });
            }
        } else {
             console.log(`Payment confirmed but no listing_id was passed. Admin will need to manually upgrade account.`);
        }
    }

    return NextResponse.json({ received: true });
}
