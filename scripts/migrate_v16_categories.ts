import { sql } from '../src/lib/db';

async function main() {
  console.log('Creating categories table...');

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        icon VARCHAR(50),
        order_index INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Insert default categories
    await sql`
      INSERT INTO categories (name, slug, icon, order_index) VALUES
      ('Dining', 'dining', '🍽️', 1),
      ('Services', 'services', '🔧', 2),
      ('Retail', 'retail', '🛍️', 3),
      ('Health & Wellness', 'health', '💪', 4),
      ('Blogs', 'blogs', '📰', 5),
      ('More', 'more', '📌', 6)
      ON CONFLICT (slug) DO NOTHING
    `;

    console.log('✅ Created categories table with defaults');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

main();
