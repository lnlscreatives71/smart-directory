import { sql } from '../src/lib/db';

async function main() {
  console.log('Adding business profile fields to listings table...');

  try {
    // Add new columns for complete business profiles
    await sql`
      ALTER TABLE listings 
      ADD COLUMN IF NOT EXISTS street_address VARCHAR(255),
      ADD COLUMN IF NOT EXISTS business_hours JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS social_media JSONB DEFAULT '{}'::jsonb,
      ADD COLUMN IF NOT EXISTS contact_form_enabled BOOLEAN DEFAULT true
    `;

    console.log('Successfully added business profile fields:');
    console.log('  - street_address');
    console.log('  - business_hours (JSON)');
    console.log('  - social_media (JSON)');
    console.log('  - contact_form_enabled');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

main();
