import { sql } from '../src/lib/db';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Creating users table...');

  try {
    const salt = await bcrypt.genSalt(10);
    const defaultPasswordHash = await bcrypt.hash('admin123', salt);

    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Insert default admin if none
    const existing = await sql`SELECT count(*) FROM users WHERE email = 'admin@trianglelocalhub.com'`;
    if (existing[0].count === '0') {
        await sql`
            INSERT INTO users (name, email, password_hash, role) 
            VALUES ('Administrator', 'admin@trianglelocalhub.com', ${defaultPasswordHash}, 'admin')
        `;
        console.log('Inserted default admin (admin@trianglelocalhub.com / admin123)');
    }

    console.log('Successfully created users table.');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

main();
