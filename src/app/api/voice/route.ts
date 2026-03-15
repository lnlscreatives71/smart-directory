/**
 * Voice Agent API - Twilio Integration
 * 
 * This API handles outbound marketing calls using Twilio Voice + TwiML
 * Combined with Twilio Studio or custom AI voice (ElevenLabs, Deepgram, etc.)
 * 
 * USE CASES:
 * - Outbound marketing calls to leads
 * - Appointment reminders (24hr before)
 * - Follow-up calls after website inquiries
 * - Open house invitations
 * - Service reminders
 * 
 * ENVIRONMENT VARIABLES REQUIRED:
 * - TWILIO_ACCOUNT_SID
 * - TWILIO_AUTH_TOKEN
 * - TWILIO_PHONE_NUMBER
 */

// Initiate outbound call
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { 
            listing_id, 
            contact_name, 
            contact_phone, 
            contact_email,
            call_purpose,
            custom_message,
            appointment_id
        } = body;

        // Validate required fields
        if (!contact_phone) {
            return NextResponse.json(
                { success: false, error: 'Contact phone number is required' },
                { status: 400 }
            );
        }

        // Check if Twilio is configured
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

        if (!accountSid || !authToken || !twilioNumber) {
            // Return mock response for development
            return NextResponse.json({
                success: true,
                data: {
                    call_sid: 'mock_call_' + Date.now(),
                    status: 'queued',
                    message: 'Twilio not configured - mock call created'
                },
                warning: 'Twilio credentials not configured. Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER to environment variables.'
            });
        }

        // Fetch business info for personalization
        let businessName = 'our directory';
        let businessPhone = '';
        if (listing_id) {
            const listings = await sql`
                SELECT name, phone FROM listings WHERE id = ${parseInt(listing_id)} LIMIT 1
            `;
            if (listings.length > 0) {
                businessName = listings[0].name;
                businessPhone = listings[0].phone || '';
            }
        }

        // Build the AI voice script based on purpose
        let script = custom_message || '';
        
        if (!script) {
            switch (call_purpose) {
                case 'appointment_reminder':
                    script = `Hi! This is an automated call from ${businessName}. 
                        This is a friendly reminder about your upcoming appointment with us. 
                        If you need to reschedule, please call us at ${businessPhone} or visit our website. 
                        We look forward to seeing you! Thank you!`;
                    break;
                    
                case 'follow_up':
                    script = `Hi! This is ${businessName}. 
                        We wanted to follow up on your recent inquiry. 
                        One of our team members would love to speak with you about how we can help. 
                        Press 1 to be connected now, or call us at ${businessPhone}. Thank you!`;
                    break;
                    
                case 'marketing':
                    script = `Hi! This is ${businessName} with a special offer just for you. 
                        We're currently running a promotion that we think you'll love. 
                        Call us at ${businessPhone} to learn more, or visit our website. 
                        Thank you for being a valued customer!`;
                    break;
                    
                case 'lead_nurture':
                    script = `Hi! This is ${businessName}. 
                        We noticed you showed interest in our services and wanted to see if you had any questions. 
                        Our team is here to help! Press 1 to speak with someone now, 
                        or call us at ${businessPhone}. We're here for you!`;
                    break;
                    
                case 'open_house':
                    script = `Hi! This is ${businessName}. 
                        We're hosting an open house and would love for you to stop by. 
                        It's a great opportunity to see our space and meet our team. 
                        Call us at ${businessPhone} for details, or visit our website. Hope to see you there!`;
                    break;
                    
                default:
                    script = `Hi! This is an automated call from ${businessName}. 
                        We're reaching out to our valued customers. 
                        If you have any questions, please call us at ${businessPhone}. 
                        Thank you!`;
            }
        }

        // Create TwiML for the call
        const twiml = `<?xml version="1.0" encoding="UTF-8"?>
            <Response>
                <Say voice="alice" language="en-US">
                    ${script.replace(/"/g, '&quot;')}
                </Say>
                <Gather numDigits="1" action="/api/voice/gather" method="POST">
                    <Say>Press 1 to speak with a team member, or press 2 to receive a text message with more information.</Say>
                </Gather>
            </Response>`;

        // Make Twilio API call to initiate outbound call
        const twilioRes = await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64')
                },
                body: new URLSearchParams({
                    To: contact_phone,
                    From: twilioNumber,
                    Twiml: twiml,
                    StatusCallback: `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/voice/status`,
                    StatusCallbackMethod: 'POST'
                })
            }
        );

        if (!twilioRes.ok) {
            const errorData = await twilioRes.json().catch(() => ({}));
            console.error('Twilio API error:', errorData);
            throw new Error(errorData.message || 'Failed to initiate call');
        }

        const callData = await twilioRes.json();

        // Log the call in database
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
                    ${contact_name || null},
                    ${contact_phone},
                    ${contact_email || null},
                    ${call_purpose || 'marketing'},
                    ${callData.sid},
                    'queued',
                    NOW()
                )
            `.catch(() => { /* Ignore if table doesn't exist */ });
        } catch (e) {
            console.error('Failed to log voice call:', e);
        }

        return NextResponse.json({
            success: true,
            data: {
                call_sid: callData.sid,
                status: callData.status,
                to: callData.to,
                from: callData.from
            }
        });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('Voice call error:', error);
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}

// Get call history for a listing
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const listingId = searchParams.get('listing_id');

        if (!listingId) {
            return NextResponse.json(
                { success: false, error: 'listing_id required' },
                { status: 400 }
            );
        }

        const calls = await sql`
            SELECT * FROM voice_calls 
            WHERE listing_id = ${parseInt(listingId)}
            ORDER BY created_at DESC
            LIMIT 50
        `;

        return NextResponse.json({ success: true, data: calls });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}
