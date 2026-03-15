import { sql } from '../src/lib/db';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local from project root
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function main() {
  console.log('Creating white-label multi-tenant architecture...');

  try {
    // Agencies/Tenants table - the master account
    await sql`
      CREATE TABLE IF NOT EXISTS agencies (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL, -- for subdomain: slug.directory.com
        custom_domain VARCHAR(255) UNIQUE, -- e.g., directory.theircompany.com
        logo_url TEXT,
        favicon_url TEXT,
        primary_color VARCHAR(50) DEFAULT '#3b82f6',
        secondary_color VARCHAR(50) DEFAULT '#10b981',
        font_family VARCHAR(100) DEFAULT 'Outfit',
        contact_email VARCHAR(255),
        contact_phone VARCHAR(50),
        support_email VARCHAR(255),
        stripe_customer_id VARCHAR(100),
        stripe_subscription_id VARCHAR(100),
        plan_tier VARCHAR(50) DEFAULT 'starter', -- starter, professional, enterprise
        status VARCHAR(50) DEFAULT 'active', -- active, suspended, cancelled
        settings JSONB DEFAULT '{}'::jsonb, -- custom config per agency
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Add tenant_id to existing tables for isolation
    await sql`ALTER TABLE listings ADD COLUMN IF NOT EXISTS agency_id INTEGER REFERENCES agencies(id) ON DELETE CASCADE`
    await sql`ALTER TABLE listings ADD COLUMN IF NOT EXISTS custom_domain_enabled BOOLEAN DEFAULT false`
    
    await sql`ALTER TABLE plans ADD COLUMN IF NOT EXISTS agency_id INTEGER REFERENCES agencies(id) ON DELETE CASCADE`
    
    await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS agency_id INTEGER REFERENCES agencies(id) ON DELETE CASCADE`
    
    await sql`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS agency_id INTEGER REFERENCES agencies(id) ON DELETE CASCADE`
    
    await sql`ALTER TABLE voice_calls ADD COLUMN IF NOT EXISTS agency_id INTEGER REFERENCES agencies(id) ON DELETE CASCADE`
    
    await sql`ALTER TABLE chat_conversations ADD COLUMN IF NOT EXISTS agency_id INTEGER REFERENCES agencies(id) ON DELETE CASCADE`
    
    await sql`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS agency_id INTEGER REFERENCES agencies(id) ON DELETE CASCADE`
    
    await sql`ALTER TABLE blogs ADD COLUMN IF NOT EXISTS agency_id INTEGER REFERENCES agencies(id) ON DELETE CASCADE`
    
    await sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS agency_id INTEGER REFERENCES agencies(id) ON DELETE CASCADE`
    
    await sql`ALTER TABLE news ADD COLUMN IF NOT EXISTS agency_id INTEGER REFERENCES agencies(id) ON DELETE CASCADE`
    
    await sql`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS agency_id INTEGER REFERENCES agencies(id) ON DELETE CASCADE`
    
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS agency_id INTEGER REFERENCES agencies(id) ON DELETE CASCADE`

    // Create indexes for tenant isolation queries
    await sql`CREATE INDEX IF NOT EXISTS idx_listings_agency ON listings(agency_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_plans_agency ON plans(agency_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_leads_agency ON leads(agency_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_appointments_agency ON appointments(agency_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_voice_calls_agency ON voice_calls(agency_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_chat_conversations_agency ON chat_conversations(agency_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_reviews_agency ON reviews(agency_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_blogs_agency ON blogs(agency_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_events_agency ON events(agency_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_news_agency ON news(agency_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_jobs_agency ON jobs(agency_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_bookings_agency ON bookings(agency_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_agencies_slug ON agencies(slug)`
    await sql`CREATE INDEX IF NOT EXISTS idx_agencies_domain ON agencies(custom_domain)`

    // Agency users (team members)
    await sql`
      CREATE TABLE IF NOT EXISTS agency_users (
        id SERIAL PRIMARY KEY,
        agency_id INTEGER NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL, -- references your existing users table
        role VARCHAR(50) DEFAULT 'member', -- owner, admin, member, viewer
        invited_email VARCHAR(255),
        invited_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        accepted_at TIMESTAMP WITH TIME ZONE,
        UNIQUE(agency_id, user_id)
      )
    `;

    // Agency subscription tiers with limits
    await sql`
      CREATE TABLE IF NOT EXISTS agency_plans (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL, -- starter, professional, enterprise
        monthly_price DECIMAL(10, 2) NOT NULL,
        annual_price DECIMAL(10, 2),
        max_listings INTEGER DEFAULT 100,
        max_users INTEGER DEFAULT 5,
        max_monthly_visitors INTEGER DEFAULT 10000,
        custom_domain BOOLEAN DEFAULT false,
        white_label BOOLEAN DEFAULT false,
        api_access BOOLEAN DEFAULT false,
        priority_support BOOLEAN DEFAULT false,
        ai_chat_included BOOLEAN DEFAULT true,
        voice_agent_included BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Insert default agency plans
    await sql`
      INSERT INTO agency_plans (name, monthly_price, annual_price, max_listings, max_users, custom_domain, white_label, ai_chat_included, voice_agent_included) VALUES
      ('starter', 99.00, 990.00, 100, 3, false, false, true, false),
      ('professional', 299.00, 2990.00, 1000, 10, true, true, true, true),
      ('enterprise', 999.00, 9990.00, 99999, 999, true, true, true, true)
      ON CONFLICT DO NOTHING
    `;

    // Usage tracking per agency
    await sql`
      CREATE TABLE IF NOT EXISTS agency_usage (
        id SERIAL PRIMARY KEY,
        agency_id INTEGER NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
        metric_name VARCHAR(100) NOT NULL, -- 'listings_count', 'monthly_visitors', 'ai_messages', 'voice_minutes'
        metric_value INTEGER DEFAULT 0,
        period_start DATE NOT NULL,
        period_end DATE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(agency_id, metric_name, period_start)
      )
    `;

    // Create default master agency (you)
    await sql`
      INSERT INTO agencies (name, slug, contact_email, status, plan_tier) 
      VALUES ('Triangle Hub Master', 'trianglehub', 'support@trianglehub.online', 'active', 'enterprise')
      ON CONFLICT (slug) DO NOTHING
    `;

    console.log('✅ White-label multi-tenant architecture created:');
    console.log('  - agencies table (tenant master accounts)');
    console.log('  - agency_users table (team members)');
    console.log('  - agency_plans table (subscription tiers)');
    console.log('  - agency_usage table (usage tracking)');
    console.log('  - Added agency_id to all existing tables');
    console.log('  - Created indexes for tenant isolation');
    console.log('  - Default master agency created');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

main();
