import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET all AI quiz submissions (leads)
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const listingId = searchParams.get('listing_id');

        let query;
        if (listingId) {
            query = await sql`
                SELECT * FROM ai_quiz_leads 
                WHERE listing_id = ${parseInt(listingId)}
                ORDER BY created_at DESC
            `;
        } else {
            query = await sql`
                SELECT * FROM ai_quiz_leads 
                ORDER BY created_at DESC
            `;
        }

        return NextResponse.json({ success: true, data: query });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}

// POST new AI quiz submission
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            listing_id,
            business_name,
            contact_name,
            email,
            phone,
            quiz_score,
            quiz_percentage,
            quiz_level,
            answers,
            recommendations
        } = body;

        if (!email || !quiz_score) {
            return NextResponse.json(
                { success: false, error: 'Email and score required' },
                { status: 400 }
            );
        }

        const lead = await sql`
            INSERT INTO ai_quiz_leads (
                listing_id,
                business_name,
                contact_name,
                email,
                phone,
                quiz_score,
                quiz_percentage,
                quiz_level,
                answers,
                recommendations,
                status,
                created_at
            ) VALUES (
                ${parseInt(listing_id) || null},
                ${business_name || null},
                ${contact_name || null},
                ${email},
                ${phone || null},
                ${parseInt(quiz_score)},
                ${parseInt(quiz_percentage)},
                ${quiz_level || 'cold'},
                ${JSON.stringify(answers || {})},
                ${JSON.stringify(recommendations || [])},
                'new',
                NOW()
            )
            RETURNING *
        `;

        // Also create a lead in the main leads table
        try {
            await sql`
                INSERT INTO leads (
                    listing_id,
                    name,
                    email,
                    phone,
                    message,
                    status,
                    source,
                    created_at
                ) VALUES (
                    ${parseInt(listing_id) || null},
                    ${contact_name || business_name || 'AI Quiz Lead'},
                    ${email},
                    ${phone || null},
                    ${`AI Readiness Quiz - Score: ${quiz_percentage}%, Level: ${quiz_level}. Recommendations: ${(recommendations || []).join(', ')}`},
                    'new',
                    'ai_quiz',
                    NOW()
                )
            `;
        } catch (e) {
            console.error('Failed to create lead:', e);
        }

        return NextResponse.json({ success: true, data: lead[0] });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}

// PUT update lead status
export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, status, notes } = body;

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'id required' },
                { status: 400 }
            );
        }

        const lead = await sql`
            UPDATE ai_quiz_leads SET
                status = ${status || status},
                notes = ${notes || null},
                updated_at = NOW()
            WHERE id = ${parseInt(id)}
            RETURNING *
        `;

        return NextResponse.json({ success: true, data: lead[0] });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}
