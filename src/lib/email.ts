import { Resend } from 'resend';

const FROM = process.env.RESEND_FROM_EMAIL || 'directory@outreach.thetrianglehub.online';
const REPLY_TO = process.env.RESEND_REPLY_TO_EMAIL || 'directory@thetrianglehub.online';
const SITE_NAME = 'The Triangle Hub';

export async function sendEmail({
    to,
    subject,
    html,
    replyTo,
}: {
    to: string;
    subject: string;
    html: string;
    replyTo?: string;
}) {
    if (!process.env.RESEND_API_KEY) {
        console.warn('[Email] RESEND_API_KEY not set. Logging email instead of sending.');
        console.log(`TO: ${to}\nSUBJECT: ${subject}\nBODY:\n${html}`);
        return { success: true, messageId: `mock_${Math.random()}` };
    }

    try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const { data, error } = await resend.emails.send({
            from: `${SITE_NAME} <${FROM}>`,
            to,
            subject,
            html,
            replyTo: replyTo || REPLY_TO,
        });

        if (error) {
            console.error('[Resend] Error sending email:', error);
            throw new Error(error.message);
        }

        console.log(`[Resend] Email sent to ${to} | ID: ${data?.id}`);
        return { success: true, messageId: data?.id };
    } catch (err) {
        console.error('[Resend] Failed to send email:', err);
        throw err;
    }
}
