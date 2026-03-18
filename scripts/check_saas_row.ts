import { sql } from '../src/lib/db';
async function main() {
    const rows = await sql`SELECT * FROM saas_push_campaigns WHERE listing_id = 1 ORDER BY id DESC LIMIT 3`;
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
