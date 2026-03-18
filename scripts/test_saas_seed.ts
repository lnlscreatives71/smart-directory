import { sql } from '../src/lib/db';
async function main() {
    await sql`DELETE FROM saas_push_campaigns WHERE listing_id = 1`;
    await sql`INSERT INTO saas_push_campaigns (listing_id, contact_email, contact_name) VALUES (1, 'lainiem@lnlaiagency.com', 'Lainie (Test)')`;
    await sql`UPDATE listings SET funnel_status = 'saas_push', funnel_step = 0, plan_id = 2 WHERE id = 1`;
    console.log('Seeded saas_push_campaigns for listing #1');
    process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
