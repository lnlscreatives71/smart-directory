import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/crm/notes?campaign_id=X
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const campaign_id = searchParams.get('campaign_id');
    if (!campaign_id) return NextResponse.json({ success: false, error: 'campaign_id required' }, { status: 400 });

    const notes = await sql`
        SELECT * FROM contact_notes
        WHERE campaign_id = ${Number(campaign_id)}
        ORDER BY created_at DESC
    `;
    return NextResponse.json({ success: true, data: notes });
}

// POST /api/crm/notes  { campaign_id, content, note_type }
export async function POST(request: Request) {
    try {
        const { campaign_id, content, note_type = 'manual' } = await request.json();
        if (!campaign_id || !content) return NextResponse.json({ success: false, error: 'campaign_id and content required' }, { status: 400 });

        const [note] = await sql`
            INSERT INTO contact_notes (campaign_id, content, note_type)
            VALUES (${campaign_id}, ${content}, ${note_type})
            RETURNING *
        `;
        return NextResponse.json({ success: true, data: note });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// DELETE /api/crm/notes?id=X
export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'id required' }, { status: 400 });

    await sql`DELETE FROM contact_notes WHERE id = ${Number(id)}`;
    return NextResponse.json({ success: true });
}
