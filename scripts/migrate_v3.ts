import { sql } from '../src/lib/db';

async function main() {
    try {
        console.log('Running migration v3: Adding image_url to listings...');
        
        await sql`
            ALTER TABLE listings
            ADD COLUMN IF NOT EXISTS image_url VARCHAR(2000);
        `;

        console.log('Column image_url added successfully.');

        // Let's seed some image_urls with Google Maps photos dynamically if needed, 
        // but for now just adding the column is fine.
        console.log('Migration v3 complete.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

main();
