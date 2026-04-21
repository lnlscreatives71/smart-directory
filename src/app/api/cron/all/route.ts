import { NextResponse } from 'next/server';
import { POST as runOutreach } from '../outreach/route';
import { POST as runPremiumUpsell } from '../premium-upsell/route';
import { POST as runSaasPush } from '../saas-push/route';
import { POST as runMarketingServices } from '../marketing-services/route';
import { POST as runColdReactivation } from '../cold-reactivation/route';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    return POST(request);
}

export async function POST(request: Request) {
    // Accept limit from query param (Vercel GET crons) or JSON body
    const url = new URL(request.url);
    const queryLimit = url.searchParams.get('limit');
    const body = await request.text().catch(() => '');
    const bodyLimit = body ? (() => { try { return JSON.parse(body)?.limit; } catch { return null; } })() : null;
    const limit = queryLimit || bodyLimit || 20; // default batch of 20

    const makeRequest = () => new Request(request.url, {
        method: 'POST',
        body: JSON.stringify({ limit }),
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

    try {
        const r5 = await runColdReactivation(makeRequest());
        results.coldReactivation = await r5.json();
    } catch (e) {
        results.coldReactivation = { error: String(e) };
    }

    return NextResponse.json({ success: true, results });
}
