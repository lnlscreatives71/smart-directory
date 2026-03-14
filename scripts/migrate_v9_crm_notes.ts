import pg from 'pg';

const { Client } = pg;

async function migrate() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    await client.connect();
    console.log('Running migration v9: contact_notes table + pipeline_stage column...');

    await client.query(`
        CREATE TABLE IF NOT EXISTS contact_notes (
            id          SERIAL PRIMARY KEY,
            campaign_id INTEGER NOT NULL REFERENCES outreach_campaigns(id) ON DELETE CASCADE,
            note_type   VARCHAR(20) NOT NULL DEFAULT 'manual',
            content     TEXT NOT NULL,
            created_at  TIMESTAMP DEFAULT NOW()
        )
    `);

    await client.query(`
        ALTER TABLE outreach_campaigns
        ADD COLUMN IF NOT EXISTS pipeline_stage VARCHAR(30) DEFAULT 'prospect'
    `);

    await client.query(`
        CREATE INDEX IF NOT EXISTS idx_contact_notes_campaign ON contact_notes(campaign_id)
    `);

    console.log('✅ Migration v9 complete.');
    await client.end();
    process.exit(0);
}

migrate().catch(err => {
    console.error('Migration failed:', err.message);
    process.exit(1);
});
