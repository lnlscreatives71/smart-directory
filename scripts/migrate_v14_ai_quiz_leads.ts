import { sql } from '../src/lib/db';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local from project root
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function main() {
  console.log('Creating AI quiz leads table...');

  try {
    // AI Quiz Leads table for tracking quiz submissions
    await sql`
      CREATE TABLE IF NOT EXISTS ai_quiz_leads (
        id SERIAL PRIMARY KEY,
        listing_id INTEGER REFERENCES listings(id) ON DELETE CASCADE,
        business_name VARCHAR(255),
        contact_name VARCHAR(255),
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        quiz_score INTEGER NOT NULL,
        quiz_percentage INTEGER NOT NULL,
        quiz_level VARCHAR(50) NOT NULL, -- ready, warm, needs_work, cold
        answers JSONB DEFAULT '{}'::jsonb,
        recommendations JSONB DEFAULT '[]'::jsonb,
        status VARCHAR(50) DEFAULT 'new', -- new, contacted, qualified, demo_booked, closed
        notes TEXT,
        agency_id INTEGER REFERENCES agencies(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create index for fast lookups (split for Neon)
    await sql`CREATE INDEX IF NOT EXISTS idx_ai_quiz_leads_email ON ai_quiz_leads(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_ai_quiz_leads_level ON ai_quiz_leads(quiz_level)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_ai_quiz_leads_status ON ai_quiz_leads(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_ai_quiz_leads_listing ON ai_quiz_leads(listing_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_ai_quiz_leads_agency ON ai_quiz_leads(agency_id)`;
    console.log('✅ Created ai_quiz_leads indexes');

    console.log('✅ Successfully created ai_quiz_leads table with indexes');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

main();
