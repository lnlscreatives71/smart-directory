import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

/**
 * Handle Twilio Status Callbacks (call progress updates)
 */
export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const callSid = formData.get('CallSid')?.toString() || '';
        const callStatus = formData.get('CallStatus')?.toString() || '';
        const duration = formData.get('CallDuration')?.toString() || '0';
        const errorCode = formData.get('ErrorCode')?.toString() || null;

        console.log(`Twilio callback: ${callSid} - ${callStatus}`);

        // Update call record in database
        try {
            await sql`
                UPDATE voice_calls 
                SET 
                    status = ${callStatus},
                    duration = ${parseInt(duration) || 0},
                    error_code = ${errorCode},
                    updated_at = NOW()
                WHERE call_sid = ${callSid}
            `.catch(() => { /* Ignore if table doesn't exist */ });
        } catch (e) {
            console.error('Failed to update call status:', e);
        }

        // If call completed successfully, you could trigger follow-up actions here
        if (callStatus === 'completed') {
            console.log(`Call ${callSid} completed successfully (${duration}s)`);
        }

        if (callStatus === 'failed' || callStatus === 'no-answer' || callStatus === 'busy') {
            console.log(`Call ${callSid} ended with status: ${callStatus}`);
            // Could trigger retry logic or mark lead as unreachable
        }

        return NextResponse.json({ success: true });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('Status callback error:', error);
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}
