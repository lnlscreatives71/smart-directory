import { sql } from '../src/lib/db.js';

async function main() {
  console.log('Creating voice calls and chat conversations tables...');

  try {
    // Voice calls table for tracking outbound marketing calls
    await sql`
      CREATE TABLE IF NOT EXISTS voice_calls (
        id SERIAL PRIMARY KEY,
        listing_id INTEGER REFERENCES listings(id) ON DELETE CASCADE,
        contact_name VARCHAR(255),
        contact_phone VARCHAR(50) NOT NULL,
        contact_email VARCHAR(255),
        call_purpose VARCHAR(50) DEFAULT 'marketing',
        call_sid VARCHAR(100) UNIQUE NOT NULL,
        status VARCHAR(50) DEFAULT 'queued',
        user_response VARCHAR(10),
        duration INTEGER DEFAULT 0,
        error_code VARCHAR(10),
        recording_url TEXT,
        transcript TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Chat conversations table for AI chat history
    await sql`
      CREATE TABLE IF NOT EXISTS chat_conversations (
        id SERIAL PRIMARY KEY,
        listing_id INTEGER REFERENCES listings(id) ON DELETE CASCADE,
        session_id VARCHAR(100),
        user_name VARCHAR(255),
        user_email VARCHAR(255),
        user_phone VARCHAR(50),
        user_message TEXT NOT NULL,
        ai_response TEXT NOT NULL,
        sentiment VARCHAR(20),
        is_lead BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create indexes for better query performance
    await sql`
      CREATE INDEX IF NOT EXISTS idx_voice_calls_listing ON voice_calls(listing_id);
      CREATE INDEX IF NOT EXISTS idx_voice_calls_status ON voice_calls(status);
      CREATE INDEX IF NOT EXISTS idx_voice_calls_created ON voice_calls(created_at);
      
      CREATE INDEX IF NOT EXISTS idx_chat_conversations_listing ON chat_conversations(listing_id);
      CREATE INDEX IF NOT EXISTS idx_chat_conversations_session ON chat_conversations(session_id);
      CREATE INDEX IF NOT EXISTS idx_chat_conversations_created ON chat_conversations(created_at);
    `;

    console.log('✅ Successfully created tables:');
    console.log('  - voice_calls (for outbound marketing calls)');
    console.log('  - chat_conversations (for AI chat history)');
    console.log('  - Created performance indexes');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

main();
