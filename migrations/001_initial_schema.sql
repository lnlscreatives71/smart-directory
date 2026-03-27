-- ============================================================
-- Migration 001: Initial Schema
-- Creates all core tables for a fresh white-label directory
-- Safe to run on existing DBs (CREATE TABLE IF NOT EXISTS)
-- ============================================================

-- Users (admin + SMB owners)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  listing_id INTEGER,
  magic_token VARCHAR(128),
  magic_token_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Agency branding + config (single row, id=1)
CREATE TABLE IF NOT EXISTS agency_settings (
  id SERIAL PRIMARY KEY,
  site_name VARCHAR(255) NOT NULL DEFAULT 'My Local Directory',
  site_description TEXT NOT NULL DEFAULT 'Discover and support local businesses in your community.',
  hero_headline VARCHAR(255) NOT NULL DEFAULT 'Find Local Businesses You Can Trust',
  hero_subhead TEXT NOT NULL DEFAULT 'Search by name, category, or keyword.',
  primary_color VARCHAR(50) NOT NULL DEFAULT '#3b82f6',
  secondary_color VARCHAR(50) NOT NULL DEFAULT '#10b981',
  contact_email VARCHAR(255) NOT NULL DEFAULT 'support@yourdirectory.com',
  contact_phone VARCHAR(50) NOT NULL DEFAULT '(555) 000-0000',
  location_region VARCHAR(100) NOT NULL DEFAULT 'your area',
  logo_url TEXT,
  favicon_url TEXT,
  premium_price NUMERIC DEFAULT 29,
  strategy_call_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Agencies (licensee tracking)
CREATE TABLE IF NOT EXISTS agencies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  custom_domain VARCHAR(255),
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
  plan_tier VARCHAR(50) DEFAULT 'starter',
  status VARCHAR(50) DEFAULT 'active',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Plans (Free / Premium tiers for SMBs)
CREATE TABLE IF NOT EXISTS plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  monthly_price NUMERIC NOT NULL DEFAULT 0,
  annual_price NUMERIC DEFAULT 0,
  price INTEGER DEFAULT 0,
  description TEXT,
  limits JSONB DEFAULT '{}',
  features JSONB DEFAULT '[]',
  active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false
);

-- Listings (business directory entries)
CREATE TABLE IF NOT EXISTS listings (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  location_city VARCHAR(100) NOT NULL,
  location_state VARCHAR(50) NOT NULL,
  location_region VARCHAR(100) NOT NULL,
  street_address TEXT,
  zip_code VARCHAR(20),
  lat NUMERIC,
  lng NUMERIC,
  phone VARCHAR(50),
  website VARCHAR(500),
  contact_email VARCHAR(255),
  contact_name VARCHAR(255),
  image_url TEXT,
  services JSONB DEFAULT '[]',
  rating NUMERIC DEFAULT 0.0,
  featured BOOLEAN DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  claimed BOOLEAN DEFAULT false,
  claim_status VARCHAR DEFAULT NULL,
  claimed_at TIMESTAMPTZ,
  plan_id INTEGER,
  feature_flags JSONB DEFAULT '{}',
  funnel_status VARCHAR,
  funnel_step INTEGER,
  custom_fields JSONB DEFAULT '{}',
  recommended_services TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Tags
CREATE TABLE IF NOT EXISTS tags (
  id SERIAL PRIMARY KEY,
  agency_id INTEGER,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  icon VARCHAR(50),
  color VARCHAR(50) DEFAULT '#3b82f6',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Listing <-> Tag join
CREATE TABLE IF NOT EXISTS listing_tags (
  id SERIAL PRIMARY KEY,
  listing_id INTEGER,
  tag_id INTEGER,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Menu items
CREATE TABLE IF NOT EXISTS menu_items (
  id SERIAL PRIMARY KEY,
  agency_id INTEGER,
  parent_id INTEGER,
  title VARCHAR(100) NOT NULL,
  menu_type VARCHAR(50) NOT NULL,
  target_type VARCHAR(50),
  target_value VARCHAR(255),
  icon VARCHAR(50),
  order_index INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  open_in_new_tab BOOLEAN DEFAULT false,
  css_class VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Menu settings
CREATE TABLE IF NOT EXISTS menu_settings (
  id SERIAL PRIMARY KEY,
  agency_id INTEGER,
  menu_name VARCHAR(100) DEFAULT 'Main Menu',
  max_depth INTEGER DEFAULT 2,
  show_icons BOOLEAN DEFAULT true,
  layout_style VARCHAR(50) DEFAULT 'dropdown',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Outreach campaigns (cold email sequences)
CREATE TABLE IF NOT EXISTS outreach_campaigns (
  id SERIAL PRIMARY KEY,
  listing_id INTEGER,
  status VARCHAR(50) DEFAULT 'pending',
  ab_variant VARCHAR(1),
  email_1_sent_at TIMESTAMPTZ,
  email_2_sent_at TIMESTAMPTZ,
  email_3_sent_at TIMESTAMPTZ,
  email_4_sent_at TIMESTAMPTZ,
  email_1_resend_id VARCHAR,
  email_2_resend_id VARCHAR,
  email_3_resend_id VARCHAR,
  email_4_resend_id VARCHAR,
  opens INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  last_opened_at TIMESTAMPTZ,
  last_clicked_at TIMESTAMPTZ,
  pipeline_stage VARCHAR(50) DEFAULT 'contacted',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Premium upgrade campaigns
CREATE TABLE IF NOT EXISTS premium_upgrade_campaigns (
  id SERIAL PRIMARY KEY,
  listing_id INTEGER NOT NULL,
  contact_email VARCHAR NOT NULL,
  contact_name VARCHAR,
  status VARCHAR NOT NULL DEFAULT 'pending',
  email_1_sent_at TIMESTAMPTZ,
  email_2_sent_at TIMESTAMPTZ,
  email_3_sent_at TIMESTAMPTZ,
  email_4_sent_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  opted_out_at TIMESTAMPTZ,
  opt_out_token VARCHAR,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- SaaS push campaigns
CREATE TABLE IF NOT EXISTS saas_push_campaigns (
  id SERIAL PRIMARY KEY,
  listing_id INTEGER NOT NULL,
  contact_email VARCHAR NOT NULL,
  contact_name VARCHAR,
  status VARCHAR NOT NULL DEFAULT 'pending',
  email_1_sent_at TIMESTAMPTZ,
  email_2_sent_at TIMESTAMPTZ,
  email_3_sent_at TIMESTAMPTZ,
  email_4_sent_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  opted_out_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Marketing services campaigns
CREATE TABLE IF NOT EXISTS marketing_services_campaigns (
  id SERIAL PRIMARY KEY,
  listing_id INTEGER NOT NULL,
  contact_email VARCHAR NOT NULL,
  contact_name VARCHAR,
  status VARCHAR NOT NULL DEFAULT 'pending',
  email_1_sent_at TIMESTAMPTZ,
  email_2_sent_at TIMESTAMPTZ,
  email_3_sent_at TIMESTAMPTZ,
  email_4_sent_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  opted_out_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Claim / new business requests
CREATE TABLE IF NOT EXISTS new_business_requests (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  category VARCHAR NOT NULL,
  description TEXT,
  phone VARCHAR,
  website VARCHAR,
  location_city VARCHAR NOT NULL,
  location_state VARCHAR DEFAULT 'NC',
  contact_name VARCHAR NOT NULL,
  contact_email VARCHAR NOT NULL,
  status VARCHAR DEFAULT 'pending',
  listing_id INTEGER,
  user_id INTEGER,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Custom import fields (per-directory)
CREATE TABLE IF NOT EXISTS custom_import_fields (
  id SERIAL PRIMARY KEY,
  field_key VARCHAR(100) NOT NULL UNIQUE,
  field_label VARCHAR(200) NOT NULL,
  field_description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Leads
CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  listing_id INTEGER,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  message TEXT,
  category VARCHAR(100),
  source VARCHAR(50),
  status VARCHAR(50) DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  listing_id INTEGER,
  author_name VARCHAR(255) NOT NULL,
  rating INTEGER NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Searches (analytics)
CREATE TABLE IF NOT EXISTS searches (
  id SERIAL PRIMARY KEY,
  query TEXT NOT NULL,
  filters JSONB DEFAULT '{}',
  results_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- AI Quiz Leads
CREATE TABLE IF NOT EXISTS ai_quiz_leads (
  id SERIAL PRIMARY KEY,
  listing_id INTEGER,
  business_name VARCHAR(255),
  contact_name VARCHAR(255),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  quiz_score INTEGER NOT NULL,
  quiz_percentage INTEGER NOT NULL,
  quiz_level VARCHAR(50) NOT NULL,
  answers JSONB DEFAULT '{}',
  recommendations JSONB DEFAULT '[]',
  status VARCHAR(50) DEFAULT 'new',
  notes TEXT,
  agency_id INTEGER,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Contact notes (CRM)
CREATE TABLE IF NOT EXISTS contact_notes (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER NOT NULL,
  note_type VARCHAR(20) NOT NULL DEFAULT 'manual',
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- Blogs
CREATE TABLE IF NOT EXISTS blogs (
  id SERIAL PRIMARY KEY,
  listing_id INTEGER,
  agency_id INTEGER,
  title VARCHAR(255) NOT NULL,
  excerpt TEXT,
  content TEXT,
  image_url VARCHAR(255),
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Events
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  listing_id INTEGER,
  agency_id INTEGER,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date TIMESTAMPTZ NOT NULL,
  time VARCHAR(50),
  location VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Jobs
CREATE TABLE IF NOT EXISTS jobs (
  id SERIAL PRIMARY KEY,
  listing_id INTEGER,
  agency_id INTEGER,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  employment_type VARCHAR(50) DEFAULT 'Full-Time',
  location VARCHAR(255),
  salary_range VARCHAR(100),
  application_url VARCHAR(255),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- News
CREATE TABLE IF NOT EXISTS news (
  id SERIAL PRIMARY KEY,
  listing_id INTEGER,
  agency_id INTEGER,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  image_url VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  listing_id INTEGER,
  agency_id INTEGER,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  service_requested VARCHAR(255),
  booking_date DATE NOT NULL,
  booking_time VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Business schedules
CREATE TABLE IF NOT EXISTS business_schedules (
  id SERIAL PRIMARY KEY,
  listing_id INTEGER,
  day_of_week INTEGER NOT NULL,
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  is_open BOOLEAN DEFAULT true,
  break_start TIME,
  break_end TIME,
  buffer_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Business services
CREATE TABLE IF NOT EXISTS business_services (
  id SERIAL PRIMARY KEY,
  listing_id INTEGER,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  price NUMERIC,
  category VARCHAR(100),
  active BOOLEAN DEFAULT true,
  booking_type VARCHAR(50) DEFAULT 'in-person',
  locations_allowed JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Business time off
CREATE TABLE IF NOT EXISTS business_time_off (
  id SERIAL PRIMARY KEY,
  listing_id INTEGER,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason VARCHAR(255),
  all_day BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Appointments
CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  listing_id INTEGER,
  agency_id INTEGER,
  service_id INTEGER,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  notes TEXT,
  internal_notes TEXT,
  timezone VARCHAR(50) DEFAULT 'America/New_York',
  booking_type VARCHAR(50) DEFAULT 'in-person',
  location VARCHAR(255),
  meeting_link TEXT,
  reminder_sent BOOLEAN DEFAULT false,
  confirmation_sent BOOLEAN DEFAULT false,
  payment_status VARCHAR(50) DEFAULT 'unpaid',
  payment_amount NUMERIC,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Booking questions / responses
CREATE TABLE IF NOT EXISTS booking_questions (
  id SERIAL PRIMARY KEY,
  listing_id INTEGER,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) DEFAULT 'text',
  options JSONB,
  required BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS booking_responses (
  id SERIAL PRIMARY KEY,
  appointment_id INTEGER,
  question_id INTEGER,
  answer_text TEXT,
  answer_value JSONB,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Chat / support
CREATE TABLE IF NOT EXISTS chat_conversations (
  id SERIAL PRIMARY KEY,
  listing_id INTEGER,
  agency_id INTEGER,
  session_id VARCHAR(100),
  user_name VARCHAR(255),
  user_email VARCHAR(255),
  user_phone VARCHAR(50),
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  sentiment VARCHAR(20),
  is_lead BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS conversation_labels (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(50) DEFAULT '#3b82f6',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS auto_responses (
  id SERIAL PRIMARY KEY,
  agency_id INTEGER,
  listing_id INTEGER,
  trigger_type VARCHAR(50) NOT NULL,
  trigger_value TEXT,
  response_text TEXT NOT NULL,
  response_type VARCHAR(50) DEFAULT 'text',
  confidence_threshold NUMERIC DEFAULT 0.8,
  active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  success_rate NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS knowledge_base (
  id SERIAL PRIMARY KEY,
  agency_id INTEGER,
  listing_id INTEGER,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
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
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Support tickets
CREATE TABLE IF NOT EXISTS support_agents (
  id SERIAL PRIMARY KEY,
  agency_id INTEGER,
  user_id INTEGER,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'agent',
  availability VARCHAR(50) DEFAULT 'online',
  max_concurrent_chats INTEGER DEFAULT 5,
  active_chats INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS support_tickets (
  id SERIAL PRIMARY KEY,
  agency_id INTEGER,
  listing_id INTEGER,
  contact_id INTEGER,
  subject VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'open',
  priority VARCHAR(50) DEFAULT 'normal',
  source VARCHAR(50) DEFAULT 'chat',
  assigned_to INTEGER,
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  customer_phone VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMPTZ,
  first_response_at TIMESTAMPTZ,
  sla_due_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS ticket_labels (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER,
  label_id INTEGER,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ticket_messages (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER,
  sender_type VARCHAR(50) NOT NULL,
  sender_id INTEGER,
  message_type VARCHAR(50) DEFAULT 'text',
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  sent_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ
);

-- Agency plans / usage / users
CREATE TABLE IF NOT EXISTS agency_plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  monthly_price NUMERIC NOT NULL,
  annual_price NUMERIC,
  max_listings INTEGER DEFAULT 100,
  max_users INTEGER DEFAULT 5,
  max_monthly_visitors INTEGER DEFAULT 10000,
  custom_domain BOOLEAN DEFAULT false,
  white_label BOOLEAN DEFAULT false,
  api_access BOOLEAN DEFAULT false,
  priority_support BOOLEAN DEFAULT false,
  ai_chat_included BOOLEAN DEFAULT true,
  voice_agent_included BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agency_usage (
  id SERIAL PRIMARY KEY,
  agency_id INTEGER NOT NULL,
  metric_name VARCHAR(100) NOT NULL,
  metric_value INTEGER DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agency_users (
  id SERIAL PRIMARY KEY,
  agency_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  role VARCHAR(50) DEFAULT 'member',
  invited_email VARCHAR(255),
  invited_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  accepted_at TIMESTAMPTZ
);

-- Voice calls
CREATE TABLE IF NOT EXISTS voice_calls (
  id SERIAL PRIMARY KEY,
  listing_id INTEGER,
  agency_id INTEGER,
  contact_name VARCHAR(255),
  contact_phone VARCHAR(50) NOT NULL,
  contact_email VARCHAR(255),
  call_purpose VARCHAR(50) DEFAULT 'marketing',
  call_sid VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'queued',
  user_response VARCHAR(10),
  duration INTEGER DEFAULT 0,
  error_code VARCHAR(10),
  recording_url TEXT,
  transcript TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- Seed default data (only if tables are empty)
-- ============================================================

-- Default plans
INSERT INTO plans (name, monthly_price, price, description, features, active, is_default)
SELECT 'Free', 0, 0, 'Basic listing visibility', '["Basic listing","Contact info","Search visibility"]'::jsonb, true, true
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE name = 'Free');

INSERT INTO plans (name, monthly_price, price, description, features, active, is_default)
SELECT 'Premium', 29, 2900, 'Enhanced listing with full features', '["Featured placement","Extra photos","Direct contact form","Priority search","Promotional offers"]'::jsonb, true, false
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE name = 'Premium');

-- Default agency_settings row
INSERT INTO agency_settings (id, site_name, site_description, hero_headline, hero_subhead, primary_color, secondary_color, contact_email, contact_phone, location_region)
SELECT 1, 'My Local Directory', 'Discover and support local businesses in your community.', 'Find Local Businesses You Can Trust', 'Search by name, category, or keyword — and support the businesses that make your community thrive.', '#3b82f6', '#10b981', 'support@yourdirectory.com', '(555) 000-0000', 'your area'
WHERE NOT EXISTS (SELECT 1 FROM agency_settings WHERE id = 1);
