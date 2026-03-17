/**
 * Migration v20: Add SMB user fields
 * - listing_id on users (links SMB user → their claimed listing)
 * - magic_token + magic_token_expires_at for passwordless login
 */
import 'dotenv/config';
import { sql } from '../src/lib/db';

async function main() {
    console.log('Running migration v20: SMB user fields...');

    try {
        // Add listing_id to users
        await sql`
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS listing_id INTEGER REFERENCES listings(id) ON DELETE SET NULL
        `;
        console.log('✅ Added listing_id to users');

        // Add magic token fields
        await sql`
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS magic_token VARCHAR(128),
            ADD COLUMN IF NOT EXISTS magic_token_expires_at TIMESTAMP WITH TIME ZONE
        `;
        console.log('✅ Added magic_token and magic_token_expires_at to users');

        // Index for fast token lookups
        await sql`
            CREATE INDEX IF NOT EXISTS idx_users_magic_token ON users(magic_token)
            WHERE magic_token IS NOT NULL
        `;
        console.log('✅ Created index on magic_token');

        console.log('\n✅ Migration v20 complete.');
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
    process.exit(0);
}

main();
