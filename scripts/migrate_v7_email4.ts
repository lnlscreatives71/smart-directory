import { sql } from '../src/lib/db';

async function migrate() {
    console.log('Running migration v7: adding email_4_sent_at to outreach_campaigns...');
    await sql`
        ALTER TABLE outreach_campaigns
        ADD COLUMN IF NOT EXISTS email_4_sent_at TIMESTAMP
    `;
    console.log('✅ Migration v7 complete.');
    process.exit(0);
}

migrate().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
