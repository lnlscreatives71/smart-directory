import { neon } from '@neondatabase/serverless';

async function main() {
  console.log('Creating tags and menu builder tables...');

  const sql = neon(process.env.DATABASE_URL!);

  try {
    // Test connection
    const test = await sql`SELECT 1 as connected`;
    console.log('✅ Database connected:', test[0]);

    // Create tags table - for business tags that can be used in menu building
    await sql`
      CREATE TABLE IF NOT EXISTS tags (
        id SERIAL PRIMARY KEY,
        agency_id INTEGER REFERENCES agencies(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) NOT NULL,
        icon VARCHAR(50),
        color VARCHAR(50) DEFAULT '#3b82f6',
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(agency_id, slug)
      )
    `;
    console.log('✅ Tags table created');

    // Create listing_tags junction table - many-to-many relationship
    await sql`
      CREATE TABLE IF NOT EXISTS listing_tags (
        id SERIAL PRIMARY KEY,
        listing_id INTEGER REFERENCES listings(id) ON DELETE CASCADE,
        tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(listing_id, tag_id)
      )
    `;
    console.log('✅ Listing_tags junction table created');

    // Create menu_items table - for building custom navigation menus
    await sql`
      CREATE TABLE IF NOT EXISTS menu_items (
        id SERIAL PRIMARY KEY,
        agency_id INTEGER REFERENCES agencies(id) ON DELETE CASCADE,
        parent_id INTEGER REFERENCES menu_items(id) ON DELETE CASCADE,
        title VARCHAR(100) NOT NULL,
        menu_type VARCHAR(50) NOT NULL, -- 'category', 'tag', 'custom_link', 'listing'
        target_type VARCHAR(50), -- 'category_slug', 'tag_slug', 'url', 'listing_id'
        target_value VARCHAR(255), -- the actual value (slug, URL, or ID)
        icon VARCHAR(50),
        order_index INTEGER DEFAULT 0,
        is_visible BOOLEAN DEFAULT true,
        open_in_new_tab BOOLEAN DEFAULT false,
        css_class VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Menu_items table created');

    // Create menu_settings table - for storing menu configuration per agency
    await sql`
      CREATE TABLE IF NOT EXISTS menu_settings (
        id SERIAL PRIMARY KEY,
        agency_id INTEGER REFERENCES agencies(id) ON DELETE CASCADE UNIQUE,
        menu_name VARCHAR(100) DEFAULT 'Main Menu',
        max_depth INTEGER DEFAULT 2,
        show_icons BOOLEAN DEFAULT true,
        layout_style VARCHAR(50) DEFAULT 'dropdown', -- 'dropdown', 'mega', 'accordion'
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Menu_settings table created');

    // Add indexes for performance
    await sql`CREATE INDEX IF NOT EXISTS idx_tags_agency ON tags(agency_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_listing_tags_listing ON listing_tags(listing_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_listing_tags_tag ON listing_tags(tag_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_menu_items_agency ON menu_items(agency_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_menu_items_parent ON menu_items(parent_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_menu_items_order ON menu_items(order_index)`;
    console.log('✅ Indexes created');

    console.log('\n📋 Schema created successfully!');
    console.log('\nTables created:');
    console.log('  - tags: Store business tags per agency');
    console.log('  - listing_tags: Many-to-many relationship between listings and tags');
    console.log('  - menu_items: Hierarchical menu structure with parent-child relationships');
    console.log('  - menu_settings: Menu configuration per agency');

  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }

  process.exit(0);
}

main();
