import { sql } from '../src/lib/db';

async function main() {
  console.log('Adding contact info columns to listings table...');

  try {
    await sql`
      ALTER TABLE listings 
      ADD COLUMN IF NOT EXISTS contact_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
      ADD COLUMN IF NOT EXISTS website VARCHAR(255);
    `;

    console.log('Successfully added contact_name, phone, and website to listings.');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

main();
