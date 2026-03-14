import { sql } from '../src/lib/db';

async function run() {
  console.log('Running migrations...');
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        listing_id INTEGER REFERENCES listings(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        date TIMESTAMP WITH TIME ZONE NOT NULL,
        time VARCHAR(50),
        location VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('Events table created.');

    await sql`
      CREATE TABLE IF NOT EXISTS blogs (
        id SERIAL PRIMARY KEY,
        listing_id INTEGER REFERENCES listings(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        excerpt TEXT,
        content TEXT,
        image_url VARCHAR(255),
        published BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('Blogs table created.');
    
    console.log('Migrations complete.');
    process.exit(0);
  } catch (err) {
    console.error('Error running migrations:', err);
    process.exit(1);
  }
}

run();
