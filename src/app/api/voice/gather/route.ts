import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

/**
 * Handle Twilio Gather (when user presses a key during call)
 */
export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const digits = formData.get('Digits')?.toString() || '';
        const callSid = formData.get('CallSid')?.toString() || '';

        let twiml = '';

        if (digits === '1') {
            // User wants to speak to team member - transfer call
            // In production, you'd route to the business's actual phone
            twiml = `<?xml version="1.0" encoding="UTF-8"?>
                <Response>
                    <Say>Connecting you to a team member now. Please hold.</Say>
                    <Dial>+19195550100</Dial>
                </Response>`;
        } else if (digits === '2') {
            // User wants SMS with more info
            twiml = `<?xml version="1.0" encoding="UTF-8"?>
                <Response>
                    <Say>Sending you a text message with more information. Thank you!</Say>
                </Response>`;
        } else {
            twiml = `<?xml version="1.0" encoding="UTF-8"?>
                <Response>
                    <Say>Thank you for your time. Goodbye!</Say>
                    <Hangup/>
                </Response>`;
        }

        // Update call record with user response
        try {
            await sql`
                UPDATE voice_calls 
                SET user_response = ${digits}, updated_at = NOW()
                WHERE call_sid = ${callSid}
            `.catch(() => { /* Ignore */ });
        } catch (e) {
            console.error('Failed to update call response:', e);
        }

        return new NextResponse(twiml, {
            headers: { 'Content-Type': 'text/xml' }
        });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('Gather handler error:', error);
        return new NextResponse(
            `<?xml version="1.0" encoding="UTF-8"?>
            <Response>
                <Say>Sorry, an error occurred. Goodbye!</Say>
                <Hangup/>
            </Response>`,
            { headers: { 'Content-Type': 'text/xml' } }
        );
    }
}
