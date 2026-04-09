import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function UnsubscribePage({
    searchParams,
}: {
    searchParams: { lid?: string };
}) {
    const lid = searchParams.lid;
    let success = false;
    let alreadyUnsubscribed = false;

    if (lid && !isNaN(Number(lid))) {
        const listingId = Number(lid);
        const result = await sql`
            SELECT unsubscribed FROM outreach_campaigns
            WHERE listing_id = ${listingId}
            LIMIT 1
        `;

        if (result.length > 0) {
            if (result[0].unsubscribed) {
                alreadyUnsubscribed = true;
            } else {
                await sql`
                    UPDATE outreach_campaigns
                    SET unsubscribed = TRUE, unsubscribed_at = NOW()
                    WHERE listing_id = ${listingId}
                `;
                success = true;
            }
        }
    }

    return (
        <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', fontFamily: "'Segoe UI', Arial, sans-serif" }}>
            <div style={{ maxWidth: 480, width: '100%', background: '#1e293b', borderRadius: 16, padding: 40, border: '1px solid #334155', textAlign: 'center' }}>
                {success || alreadyUnsubscribed ? (
                    <>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                        <h1 style={{ color: '#fff', fontSize: 24, margin: '0 0 12px' }}>
                            {alreadyUnsubscribed ? 'Already unsubscribed' : 'You\'ve been unsubscribed'}
                        </h1>
                        <p style={{ color: '#94a3b8', fontSize: 15, lineHeight: 1.7, margin: '0 0 24px' }}>
                            {alreadyUnsubscribed
                                ? 'You\'re already removed from our email list. We won\'t send you any more messages.'
                                : 'You\'ve been removed from our outreach emails. We won\'t contact you again.'}
                        </p>
                        <p style={{ color: '#64748b', fontSize: 13 }}>
                            Your listing will remain live on the directory. If you change your mind, you can always{' '}
                            <a href="/biz/claim" style={{ color: '#6366f1', textDecoration: 'none' }}>claim your listing</a>.
                        </p>
                    </>
                ) : (
                    <>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
                        <h1 style={{ color: '#fff', fontSize: 24, margin: '0 0 12px' }}>Invalid unsubscribe link</h1>
                        <p style={{ color: '#94a3b8', fontSize: 15, lineHeight: 1.7 }}>
                            This unsubscribe link is not valid. If you received an email from us and want to opt out,
                            please reply to the email directly.
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
