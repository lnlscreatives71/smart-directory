import { sql } from '../src/lib/db';

const TEST_EMAIL = 'lainiem@lnlaiagency.com';
const TEST_NAME = 'Lainie (Test)';

async function main() {
    // Pick first listing
    const [listing] = await sql`SELECT id, name FROM listings ORDER BY id LIMIT 1`;
    if (!listing) { console.error('No listings found'); process.exit(1); }

    console.log(`Using listing: #${listing.id} — ${listing.name}`);

    // Reset listing to free plan + funnel state
    await sql`
        UPDATE listings SET plan_id = 1, funnel_status = 'premium_upgrade', funnel_step = 0
        WHERE id = ${listing.id}
    `;

    // Clear any existing campaign rows for this listing
    await sql`DELETE FROM premium_upgrade_campaigns WHERE listing_id = ${listing.id}`;

    // Insert fresh campaign row
    await sql`
        INSERT INTO premium_upgrade_campaigns (listing_id, contact_email, contact_name)
        VALUES (${listing.id}, ${TEST_EMAIL}, ${TEST_NAME})
    `;

    console.log(`Seeded premium_upgrade_campaigns for listing #${listing.id}`);
    console.log(`Email will be sent to: ${TEST_EMAIL}`);
    console.log('\nNow hit: POST /api/cron/premium-upsell with body {"forceRun":true}');
    process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
