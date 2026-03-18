import { sql } from '../src/lib/db';
async function main() {
    const rows = await sql`
        SELECT c.id, c.status, c.contact_email, l.id as listing_id, l.name, l.plan_id
        FROM premium_upgrade_campaigns c
        JOIN listings l ON c.listing_id = l.id
        ORDER BY c.id DESC LIMIT 5
    `;
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
