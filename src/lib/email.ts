export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
    // In a real production app, you would use Resend, Sendgrid, etc.
    // Example for Resend: 
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({ from: 'onboarding@resend.dev', to, subject, html });

    console.log('================= SENDING OUTREACH EMAIL =================');
    console.log(`TO: ${to}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`BODY (HTML):\n${html}`);
    console.log('==========================================================');

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return { success: true, messageId: `mock_id_${Math.random()}` };
}
