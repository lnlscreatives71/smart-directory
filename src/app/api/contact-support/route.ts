import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const { name, email, subject, message } = await request.json();

        if (!name || !email || !message) {
            return NextResponse.json({ success: false, error: 'Name, email, and message are required.' }, { status: 400 });
        }

        const subjectLabels: Record<string, string> = {
            general: 'General Inquiry',
            billing: 'Billing / Premium Subscription',
            claim: 'Claim a Business Listing',
            technical: 'Technical Support',
        };
        const subjectLabel = subjectLabels[subject] || subject || 'General Inquiry';

        await sendEmail({
            to: 'directory@thetrianglehub.online',
            replyTo: email,
            subject: `[Support] ${subjectLabel} from ${name}`,
            html: `
                <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
                    <h2 style="margin:0 0 16px;">Support Request</h2>
                    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
                        <tr><td style="padding:10px;border-bottom:1px solid #eee;font-weight:bold;width:100px;">Name</td><td style="padding:10px;border-bottom:1px solid #eee;">${name}</td></tr>
                        <tr><td style="padding:10px;border-bottom:1px solid #eee;font-weight:bold;">Email</td><td style="padding:10px;border-bottom:1px solid #eee;">${email}</td></tr>
                        <tr><td style="padding:10px;border-bottom:1px solid #eee;font-weight:bold;">Subject</td><td style="padding:10px;border-bottom:1px solid #eee;">${subjectLabel}</td></tr>
                        <tr><td style="padding:10px;font-weight:bold;vertical-align:top;">Message</td><td style="padding:10px;">${message.replace(/\n/g, '<br>')}</td></tr>
                    </table>
                    <p style="color:#888;font-size:13px;">Reply directly to this email to respond to ${name}.</p>
                </div>
            `,
        });

        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
