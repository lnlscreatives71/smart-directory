import { sql } from '../src/lib/db';

async function main() {
  console.log('Updating plans table with configurable pricing...');

  try {
    // Add annual_price and features columns if they don't exist
    await sql`
      ALTER TABLE plans 
      ADD COLUMN IF NOT EXISTS annual_price DECIMAL(10, 2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true
    `;

    // Update existing plans with correct pricing
    await sql`UPDATE plans SET monthly_price = 0, annual_price = 0 WHERE name = 'free'`;
    await sql`UPDATE plans SET monthly_price = 29, annual_price = 290 WHERE name = 'premium'`;
    await sql`UPDATE plans SET monthly_price = 97, annual_price = 970 WHERE name = 'pro'`;

    // Set free as default
    await sql`UPDATE plans SET is_default = true WHERE name = 'free'`;
    await sql`UPDATE plans SET active = true`;

    console.log('✅ Plans table updated with configurable pricing');
    console.log('  - Free: $0/mo');
    console.log('  - Premium: $29/mo ($290/yr)');
    console.log('  - Pro: $97/mo ($970/yr)');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

main();
