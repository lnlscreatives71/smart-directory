import { sql } from '../src/lib/db';

async function main() {
  console.log('Creating agency_settings table...');

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS agency_settings (
        id SERIAL PRIMARY KEY,
        site_name VARCHAR(255) NOT NULL DEFAULT 'Triangle Local Hub',
        site_description TEXT NOT NULL DEFAULT 'Discover and support local businesses in Raleigh, Durham, and Cary, NC.',
        hero_headline VARCHAR(255) NOT NULL DEFAULT 'Find Local Businesses You Can Trust',
        hero_subhead TEXT NOT NULL DEFAULT 'Search by name, category, or keyword — and support the businesses that make your community thrive.',
        primary_color VARCHAR(50) NOT NULL DEFAULT '#3b82f6',
        secondary_color VARCHAR(50) NOT NULL DEFAULT '#10b981',
        contact_email VARCHAR(255) NOT NULL DEFAULT 'support@trianglelocalhub.com',
        contact_phone VARCHAR(50) NOT NULL DEFAULT '(919) 555-0100',
        location_region VARCHAR(100) NOT NULL DEFAULT 'the Triangle',
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Insert default row if none
    const existing = await sql`SELECT count(*) FROM agency_settings`;
    if (existing[0].count === '0') {
        await sql`
            INSERT INTO agency_settings (id) VALUES (1)
        `;
    }

    console.log('Successfully created agency_settings table and default row.');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

main();
