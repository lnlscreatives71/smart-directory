import { NextResponse } from 'next/server';
import { POST as runOutreach } from '../outreach/route';
import { POST as runPremiumUpsell } from '../premium-upsell/route';
import { POST as runSaasPush } from '../saas-push/route';
import { POST as runMarketingServices } from '../marketing-services/route';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    return POST(request);
}

export async function POST(request: Request) {
    const body = await request.text().catch(() => '');
    const makeRequest = () => new Request(request.url, {
        method: 'POST',
        body: body || undefined,
        headers: { 'content-type': 'application/json' },
    });

    const results: Record<string, unknown> = {};

    try {
        const r1 = await runOutreach(makeRequest());
        results.outreach = await r1.json();
    } catch (e) {
        results.outreach = { error: String(e) };
    }

    try {
        const r2 = await runPremiumUpsell(makeRequest());
        results.premiumUpsell = await r2.json();
    } catch (e) {
        results.premiumUpsell = { error: String(e) };
    }

    try {
        const r3 = await runSaasPush(makeRequest());
        results.saasPush = await r3.json();
    } catch (e) {
        results.saasPush = { error: String(e) };
    }

    try {
        const r4 = await runMarketingServices(makeRequest());
        results.marketingServices = await r4.json();
    } catch (e) {
        results.marketingServices = { error: String(e) };
    }

    return NextResponse.json({ success: true, results });
}
