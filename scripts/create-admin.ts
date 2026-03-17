import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Creating default admin user...');

  const sql = neon(process.env.DATABASE_URL!);

  try {
    // Test connection
    const test = await sql`SELECT 1 as connected`;
    console.log('✅ Database connected:', test[0]);

    // Create users table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Users table created/verified');

    // Check if admin user already exists
    const existing = await sql`SELECT id, email FROM users WHERE email = 'admin@thetrianglehub.online' LIMIT 1`;

    if (existing.length === 0) {
      // Create default admin user
      const passwordHash = await bcrypt.hash('admin123', 10);

      await sql`
        INSERT INTO users (name, email, password_hash, role)
        VALUES (
          'Admin User',
          'admin@thetrianglehub.online',
          ${passwordHash},
          'admin'
        )
      `;

      console.log('\n✅ Created default admin user:');
      console.log('   Email: admin@thetrianglehub.online');
      console.log('   Password: admin123');
      console.log('   ⚠️  CHANGE THIS PASSWORD IMMEDIATELY!\n');
    } else {
      console.log('\n✅ Admin user already exists:', existing[0]);
    }

    // Show all users
    const allUsers = await sql`SELECT id, name, email, role, created_at FROM users`;
    console.log('\n📋 All users in database:');
    allUsers.forEach(u => console.log(`   - ${u.name} (${u.email}) - Role: ${u.role}`));

  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
  
  process.exit(0);
}

main();
