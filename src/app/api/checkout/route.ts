import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Use the API version matching the installed stripe package
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2026-02-25.clover'
});

export async function POST(request: Request) {
    try {
        const { plan, billing, listing_id } = await request.json();

        // Check if Stripe is configured
        if (!process.env.STRIPE_SECRET_KEY) {
            console.error('❌ STRIPE_SECRET_KEY not set in environment');
            return NextResponse.json({ 
                error: 'Payments not configured',
                message: 'Stripe is not configured. Contact the site administrator to enable payments.',
                demo: true
            }, { status: 501 });
        }
        
        // Log key format (first 8 chars only for security)
        const keyPrefix = process.env.STRIPE_SECRET_KEY.substring(0, 8);
        console.log('🔑 Stripe key format:', keyPrefix + '...');

        // Validate Stripe key format
        if (!process.env.STRIPE_SECRET_KEY.startsWith('sk_test_') && 
            !process.env.STRIPE_SECRET_KEY.startsWith('sk_live_')) {
            console.error('❌ Invalid Stripe key format:', keyPrefix);
            return NextResponse.json({ 
                error: 'Invalid Stripe configuration',
                message: 'Stripe API key is not properly configured.'
            }, { status: 500 });
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
        
        // Handle invalid API key error
        if (err.message && err.message.includes('Invalid API Key')) {
            return NextResponse.json({ 
                error: 'Invalid Stripe API Key',
                message: 'Stripe is not configured correctly. Please contact support.',
                demo: true
            }, { status: 501 });
        }
        
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
