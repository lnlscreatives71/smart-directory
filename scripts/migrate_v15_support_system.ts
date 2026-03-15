import { sql } from '../src/lib/db';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local from project root
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function main() {
  console.log('Creating Chatwoot-like support system tables...');

  try {
    // Knowledge Base Articles
    await sql`
      CREATE TABLE IF NOT EXISTS knowledge_base (
        id SERIAL PRIMARY KEY,
        agency_id INTEGER REFERENCES agencies(id) ON DELETE CASCADE,
        listing_id INTEGER REFERENCES listings(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT,
        category VARCHAR(100),
        tags TEXT[],
        author_name VARCHAR(255),
        position INTEGER DEFAULT 0,
        published BOOLEAN DEFAULT false,
        views INTEGER DEFAULT 0,
        helpful_count INTEGER DEFAULT 0,
        not_helpful_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Support Tickets/Conversations
    await sql`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id SERIAL PRIMARY KEY,
        agency_id INTEGER REFERENCES agencies(id) ON DELETE CASCADE,
        listing_id INTEGER REFERENCES listings(id) ON DELETE CASCADE,
        contact_id INTEGER,
        subject VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'open', -- open, pending, resolved, closed
        priority VARCHAR(50) DEFAULT 'normal', -- low, normal, high, urgent
        source VARCHAR(50) DEFAULT 'chat', -- chat, email, phone, sms, facebook, twitter
        assigned_to INTEGER,
        customer_name VARCHAR(255),
        customer_email VARCHAR(255),
        customer_phone VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP WITH TIME ZONE,
        first_response_at TIMESTAMP WITH TIME ZONE,
        sla_due_at TIMESTAMP WITH TIME ZONE
      )
    `;

    // Ticket Messages
    await sql`
      CREATE TABLE IF NOT EXISTS ticket_messages (
        id SERIAL PRIMARY KEY,
        ticket_id INTEGER REFERENCES support_tickets(id) ON DELETE CASCADE,
        sender_type VARCHAR(50) NOT NULL, -- customer, agent, bot
        sender_id INTEGER,
        message_type VARCHAR(50) DEFAULT 'text', -- text, file, template
        content TEXT NOT NULL,
        attachments JSONB DEFAULT '[]'::jsonb,
        sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        delivered_at TIMESTAMP WITH TIME ZONE,
        read_at TIMESTAMP WITH TIME ZONE
      )
    `;

    // Conversation Labels/Tags
    await sql`
      CREATE TABLE IF NOT EXISTS conversation_labels (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        color VARCHAR(50) DEFAULT '#3b82f6',
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Ticket-Label associations
    await sql`
      CREATE TABLE IF NOT EXISTS ticket_labels (
        id SERIAL PRIMARY KEY,
        ticket_id INTEGER REFERENCES support_tickets(id) ON DELETE CASCADE,
        label_id INTEGER REFERENCES conversation_labels(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(ticket_id, label_id)
      )
    `;

    // Support Agents
    await sql`
      CREATE TABLE IF NOT EXISTS support_agents (
        id SERIAL PRIMARY KEY,
        agency_id INTEGER REFERENCES agencies(id) ON DELETE CASCADE,
        user_id INTEGER,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        role VARCHAR(50) DEFAULT 'agent', -- agent, admin, supervisor
        availability VARCHAR(50) DEFAULT 'online', -- online, offline, busy
        max_concurrent_chats INTEGER DEFAULT 5,
        active_chats INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Auto-responses (AI-powered)
    await sql`
      CREATE TABLE IF NOT EXISTS auto_responses (
        id SERIAL PRIMARY KEY,
        agency_id INTEGER REFERENCES agencies(id) ON DELETE CASCADE,
        listing_id INTEGER REFERENCES listings(id) ON DELETE CASCADE,
        trigger_type VARCHAR(50) NOT NULL, -- keyword, intent, time_based
        trigger_value TEXT,
        response_text TEXT NOT NULL,
        response_type VARCHAR(50) DEFAULT 'text', -- text, article, action
        confidence_threshold DECIMAL(3, 2) DEFAULT 0.8,
        active BOOLEAN DEFAULT true,
        usage_count INTEGER DEFAULT 0,
        success_rate DECIMAL(5, 2) DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create indexes (split for Neon)
    await sql`CREATE INDEX IF NOT EXISTS idx_kb_agency ON knowledge_base(agency_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_kb_listing ON knowledge_base(listing_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_kb_published ON knowledge_base(published)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_kb_slug ON knowledge_base(slug)`;
    console.log('✅ Created knowledge_base indexes');
    
    await sql`CREATE INDEX IF NOT EXISTS idx_tickets_agency ON support_tickets(agency_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_tickets_listing ON support_tickets(listing_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_tickets_status ON support_tickets(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_tickets_created ON support_tickets(created_at)`;
    console.log('✅ Created support_tickets indexes');
    
    await sql`CREATE INDEX IF NOT EXISTS idx_messages_ticket ON ticket_messages(ticket_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_messages_sent ON ticket_messages(sent_at)`;
    console.log('✅ Created ticket_messages indexes');
    
    await sql`CREATE INDEX IF NOT EXISTS idx_agents_agency ON support_agents(agency_id)`;
    console.log('✅ Created support_agents indexes');
    
    await sql`CREATE INDEX IF NOT EXISTS idx_auto_responses_agency ON auto_responses(agency_id)`;
    console.log('✅ Created auto_responses indexes');

    console.log('✅ Created Chatwoot-like support system:');
    console.log('  - knowledge_base (help center articles)');
    console.log('  - support_tickets (conversation inbox)');
    console.log('  - ticket_messages (message history)');
    console.log('  - conversation_labels (tagging system)');
    console.log('  - support_agents (agent management)');
    console.log('  - auto_responses (AI-powered replies)');
    console.log('  - Created performance indexes');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

main();
