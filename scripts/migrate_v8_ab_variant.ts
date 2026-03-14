import { sql } from '../src/lib/db';

async function migrate() {
    console.log('Running migration v8: adding ab_variant to outreach_campaigns...');
    await sql`
        ALTER TABLE outreach_campaigns
        ADD COLUMN IF NOT EXISTS ab_variant VARCHAR(1) DEFAULT 'A'
    `;
    console.log('✅ Migration v8 complete.');
    process.exit(0);
}

migrate().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
