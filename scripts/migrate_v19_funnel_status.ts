import { sql } from '../src/lib/db';

async function migrate() {
    console.log('Adding funnel_status and funnel_step to listings...');

    await sql`
        ALTER TABLE listings
        ADD COLUMN IF NOT EXISTS funnel_status VARCHAR DEFAULT NULL,
        ADD COLUMN IF NOT EXISTS funnel_step INT DEFAULT NULL
    `;

    console.log('Done.');
    process.exit(0);
}

migrate().catch((err) => {
    console.error(err);
    process.exit(1);
});
