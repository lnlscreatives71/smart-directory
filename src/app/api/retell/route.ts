import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

/**
 * Retell AI Voice Agent Integration
 * 
 * Retell provides LLM-native voice agents with:
 * - <600ms response time
 * - Multi-turn conversations
 * - 31+ languages
 * - Built-in IVR, transfers, webhooks
 * - SMS + chat automation
 * 
 * ENV REQUIRED:
 * - RETELL_API_KEY
 * - RETELL_AGENT_ID
 */

export const dynamic = 'force-dynamic';

// Create a new Retell voice call
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { 
            listing_id,
            customer_name,
            customer_phone,
            customer_email,
            call_type, // 'outbound_marketing', 'appointment_reminder', 'follow_up', 'inbound'
            appointment_id,
            custom_context
        } = body;

        if (!customer_phone) {
            return NextResponse.json(
                { success: false, error: 'Phone number required' },
                { status: 400 }
            );
        }

        const apiKey = process.env.RETELL_API_KEY;
        const agentId = process.env.RETELL_AGENT_ID;

        if (!apiKey || !agentId) {
            return NextResponse.json({
                success: true,
                data: { call_id: 'mock_' + Date.now(), status: 'queued' },
                warning: 'Retell not configured. Add RETELL_API_KEY and RETELL_AGENT_ID to env.'
            });
        }

        // Fetch business info
        let businessName = 'our business';
        let businessPhone = '';
        if (listing_id) {
            const listings = await sql`
                SELECT name, phone, contact_email FROM listings 
                WHERE id = ${parseInt(listing_id)} LIMIT 1
            `;
            if (listings.length > 0) {
                businessName = listings[0].name;
                businessPhone = listings[0].phone || '';
            }
        }

        // Build dynamic context for the AI agent
        const agentContext = custom_context || {
            business_name: businessName,
            business_phone: businessPhone,
            call_purpose: call_type,
            customer_name: customer_name,
            appointment_id: appointment_id,
            instructions: `
                You are calling on behalf of ${businessName}.
                ${call_type === 'appointment_reminder' ? 'Remind them about their upcoming appointment.' : ''}
                ${call_type === 'follow_up' ? 'Follow up on their recent inquiry.' : ''}
                ${call_type === 'outbound_marketing' ? 'Share a special offer or promotion.' : ''}
                Be friendly, concise, and professional.
                If they want to book or reschedule, collect their preferred date/time.
            `.trim()
        };

        // Create Retell call
        const retellRes = await fetch('https://api.retellai.com/v1/create-call', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                agent_id: agentId,
                to_number: customer_phone,
                from_number: process.env.RETELL_PHONE_NUMBER,
                metadata: {
                    listing_id,
                    customer_name,
                    customer_email,
                    call_type,
                    appointment_id
                },
                dynamic_context: agentContext
            })
        });

        if (!retellRes.ok) {
            const error = await retellRes.json().catch(() => ({}));
            throw new Error(error.message || 'Failed to create Retell call');
        }

        const callData = await retellRes.json();

        // Log call in database
        try {
            await sql`
                INSERT INTO voice_calls (
                    listing_id,
                    contact_name,
                    contact_phone,
                    contact_email,
                    call_purpose,
                    call_sid,
                    status,
                    created_at
                ) VALUES (
                    ${parseInt(listing_id) || null},
                    ${customer_name || null},
                    ${customer_phone},
                    ${customer_email || null},
                    ${call_type || 'outbound'},
                    ${callData.call_id},
                    'queued',
                    NOW()
                )
            `.catch(() => {});
        } catch (e) {
            console.error('Failed to log call:', e);
        }

        return NextResponse.json({
            success: true,
            data: {
                call_id: callData.call_id,
                status: callData.status,
                to: customer_phone
            }
        });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('Retell call error:', error);
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}

// Webhook for Retell call events (status updates, transcripts, etc.)
export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const { call_id, event_type, metadata, transcript } = body;

        console.log(`Retell webhook: ${call_id} - ${event_type}`);

        // Update call record in database
        try {
            if (event_type === 'call_started') {
                await sql`
                    UPDATE voice_calls 
                    SET status = 'in-progress', updated_at = NOW()
                    WHERE call_sid = ${call_id}
                `.catch(() => {});
            }
            
            if (event_type === 'call_ended') {
                await sql`
                    UPDATE voice_calls 
                    SET 
                        status = 'completed',
                        duration = ${body.duration || 0},
                        transcript = ${transcript || null},
                        updated_at = NOW()
                    WHERE call_sid = ${call_id}
                `.catch(() => {});

                // If appointment reminder, mark as sent
                if (metadata?.appointment_id) {
                    await sql`
                        UPDATE appointments
                        SET reminder_sent = true, updated_at = NOW()
                        WHERE id = ${parseInt(metadata.appointment_id)}
                    `.catch(() => {});
                }
            }
        } catch (e) {
            console.error('Failed to update call status:', e);
        }

        return NextResponse.json({ success: true });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('Retell webhook error:', error);
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}
