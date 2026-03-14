import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
    apiVersion: '2026-02-25.clover'
});

export async function POST(request: Request) {
    try {
        const { plan, billing, listing_id } = await request.json();

        if (!process.env.STRIPE_SECRET_KEY) {
            console.warn("Using placeholder Stripe keys. Set STRIPE_SECRET_KEY in .env.local.");
        }

        const amount = plan === 'premium' ? (billing === 'monthly' ? 2900 : 29900) : 0;

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `Smart Directory ${plan.toUpperCase()} Plan (${billing})`,
                        },
                        unit_amount: amount,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            // Pass the listing_id into the metadata so the webhook knows which business to upgrade when the card clears
            metadata: {
                listing_id: listing_id || 'unknown_or_new',
                plan_tier: plan
            },
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard/listings?checkout=success`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/pricing?checkout=cancel`,
        });

        return NextResponse.json({ url: session.url });
    } catch (err: any) {
        console.error('Stripe checkout error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
