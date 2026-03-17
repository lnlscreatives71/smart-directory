import { neon } from '@neondatabase/serverless';

async function main() {
  console.log('Checking agencies and menu data...');

  const sql = neon(process.env.DATABASE_URL!);

  try {
    // Check agencies
    const agencies = await sql`SELECT id, name, slug FROM agencies`;
    console.log('\n📋 Agencies:');
    if (agencies.length === 0) {
      console.log('   No agencies found!');
    } else {
      agencies.forEach(a => console.log(`   - ${a.name} (ID: ${a.id}, Slug: ${a.slug})`));
    }

    // Check menu settings
    const menuSettings = await sql`SELECT * FROM menu_settings`;
    console.log('\n📋 Menu Settings:');
    if (menuSettings.length === 0) {
      console.log('   No menu settings configured');
    } else {
      menuSettings.forEach(s => console.log(`   - Agency ${s.agency_id}: ${s.menu_name}`));
    }

    // Check menu items
    const menuItems = await sql`SELECT id, agency_id, title, menu_type, order_index, is_visible FROM menu_items ORDER BY agency_id, order_index`;
    console.log('\n📋 Menu Items:');
    if (menuItems.length === 0) {
      console.log('   No menu items created');
    } else {
      menuItems.forEach(item => console.log(`   - [${item.is_visible ? '✓' : '✗'}] ${item.title} (${item.menu_type}) - Agency ${item.agency_id}`));
    }

  } catch (err) {
    console.error('❌ Error:', err);
  }

  process.exit(0);
}

main();
