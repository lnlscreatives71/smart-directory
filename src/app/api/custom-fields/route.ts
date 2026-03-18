import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function slugify(label: string): string {
    return label.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

export async function GET() {
    const fields = await sql`SELECT * FROM custom_import_fields ORDER BY created_at ASC`;
    return NextResponse.json({ fields });
}

export async function POST(req: Request) {
    const { label, description } = await req.json();
    if (!label?.trim()) return NextResponse.json({ error: 'Label is required' }, { status: 400 });

    const key = slugify(label);
    if (!key) return NextResponse.json({ error: 'Invalid label' }, { status: 400 });

    try {
        const [field] = await sql`
            INSERT INTO custom_import_fields (field_key, field_label, field_description)
            VALUES (${key}, ${label.trim()}, ${description?.trim() || null})
            RETURNING *
        `;
        return NextResponse.json({ field });
    } catch {
        return NextResponse.json({ error: 'Field key already exists — choose a different name' }, { status: 409 });
    }
}

export async function DELETE(req: Request) {
    const { key } = await req.json();
    if (!key) return NextResponse.json({ error: 'Key is required' }, { status: 400 });
    await sql`DELETE FROM custom_import_fields WHERE field_key = ${key}`;
    return NextResponse.json({ success: true });
}
