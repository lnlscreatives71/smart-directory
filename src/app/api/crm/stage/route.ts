import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// PATCH /api/crm/stage  { campaign_id, stage }
export async function PATCH(request: Request) {
    try {
        const { campaign_id, stage } = await request.json();
        const validStages = ['prospect', 'contacted', 'engaged', 'claimed', 'upgraded', 'lost'];
        if (!campaign_id || !validStages.includes(stage)) {
            return NextResponse.json({ success: false, error: 'Invalid stage or missing campaign_id' }, { status: 400 });
        }
        await sql`
            UPDATE outreach_campaigns
            SET pipeline_stage = ${stage}, updated_at = NOW()
            WHERE id = ${Number(campaign_id)}
        `;
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
