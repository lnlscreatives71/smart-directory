import { sql } from '../src/lib/db';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Creating default admin user...');

  try {
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

    // Check if admin user already exists
    const existing = await sql`SELECT id FROM users WHERE email = 'admin@thetrianglehub.online' LIMIT 1`;
    
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
      
      console.log('✅ Created default admin user:');
      console.log('   Email: admin@thetrianglehub.online');
      console.log('   Password: admin123');
      console.log('   ⚠️  CHANGE THIS PASSWORD IMMEDIATELY!');
    } else {
      console.log('✅ Admin user already exists');
    }
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

main();
