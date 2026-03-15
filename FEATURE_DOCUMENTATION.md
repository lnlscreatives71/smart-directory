# 🚀 COMPLETE FEATURE DOCUMENTATION
## Smart Directory SaaS - Full Platform Overview

**Last Updated:** March 2026
**Version:** 2.0 Enterprise
**Website:** https://www.thetrianglehub.online

---

## 📋 TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [Core Platform Features](#core-platform-features)
3. [AI & Automation Suite](#ai--automation-suite)
4. [Lead Generation System](#lead-generation-system)
5. [White-Label Agency System](#white-label-agency-system)
6. [Customer Support Stack](#customer-support-stack)
7. [Booking & Scheduling](#booking--scheduling)
8. [Monetization Features](#monetization-features)
9. [Technical Architecture](#technical-architecture)
10. [Environment Variables Required](#environment-variables-required)
11. [API Endpoints](#api-endpoints)
12. [Database Schema](#database-schema)

---

## 🎯 EXECUTIVE SUMMARY

### What This Platform Is

A **full-stack, AI-powered business directory SaaS** that serves TWO revenue streams:

1. **Direct-to-Business:** List businesses, charge monthly fees for premium features
2. **White-Label Agencies:** Sell complete directory platforms to agencies who resell to their clients

### The Secret Weapon

This isn't just a directory. It's a **lead generation machine** that:
- Captures warm leads through AI interactions
- Qualifies prospects automatically
- Books demos on your calendar
- Sells your high-ticket AI services on autopilot

### Revenue Model

| Revenue Stream | Price Point | Target |
|----------------|-------------|--------|
| **Business Listings** | Free - $97/mo | Small businesses |
| **White-Label Directories** | $99-299/mo + setup fee | Marketing agencies |
| **AI Automation Services** | $2,000-5,000/mo | Warm leads from directory |
| **AiEO Services** | $1,000-3,000/mo | SEO clients |
| **Web Design** | $5,000-15,000/project | Businesses needing websites |

---

## 🏗️ CORE PLATFORM FEATURES

### 1. Business Directory System

#### **Public-Facing Features:**
- ✅ **Homepage** with hero search, featured listings, category browsing
- ✅ **Category Pages** with filters (location, rating, plan tier)
- ✅ **Business Profile Pages** (`/biz/[slug]`) with:
  - Business info, photos, services
  - AI Chat widget (premium feature)
  - Booking calendar (premium feature)
  - Customer reviews & ratings
  - News/blog posts
  - Job postings
  - Events calendar
  - Map integration
  - Contact form

#### **Search & Discovery:**
- ✅ Search by name, category, keyword, location
- ✅ Filter by city, rating, plan tier
- ✅ Featured/priority ranking for premium listings
- ✅ Category tiles with images
- ✅ Related businesses suggestions

#### **Business Listing Types:**
- ✅ **Free Listing:** Basic info, 1 image, 1 category
- ✅ **Premium ($29/mo):** AI chat, booking, 5 images, priority ranking
- ✅ **Pro ($97/mo):** All features, 20 images, unlimited categories, API access

---

### 2. Dashboard & Admin System

#### **Public Dashboard** (No Login Required):
- ✅ `/list-your-business` - Public submission form
- ✅ Free listing creation
- ✅ Auto-enrollment in outreach campaigns

#### **Admin Dashboard** (Login Required):
- ✅ `/dashboard` - Overview & analytics
- ✅ `/dashboard/listings` - CRUD all listings
- ✅ `/dashboard/listings/new` - Create new listing
- ✅ `/dashboard/listings/[id]` - Edit existing listing
- ✅ `/dashboard/plans` - Manage pricing tiers & features
- ✅ `/dashboard/import` - Bulk CSV import
- ✅ `/dashboard/leads` - CRM pipeline (Kanban + List view)
- ✅ `/dashboard/bookings` - Appointment management
- ✅ `/dashboard/events` - Event management
- ✅ `/dashboard/blogs` - Blog post management
- ✅ `/dashboard/news` - News feed management
- ✅ `/dashboard/jobs` - Job posting management
- ✅ `/dashboard/support` - Unified support inbox
- ✅ `/dashboard/agency` - White-label agency settings
- ✅ `/dashboard/settings` - Platform branding

---

### 3. User Management & Authentication

- ✅ NextAuth.js integration
- ✅ Email/password authentication
- ✅ Protected routes
- ✅ Role-based access (admin, agency, business owner)
- ✅ Session management
- ✅ Password reset flow

---

## 🤖 AI & AUTOMATION SUITE

### 1. AI Sales Agent (Revenue-Generating)

**Location:** Floating button (bottom-right, green, pulsing)
**Purpose:** Proactively sell AI services to visitors

#### **Features:**
- ✅ **Proactive greeting** after 5 seconds
- ✅ **Lead qualification flow:**
  - Identifies pain points (missed calls, admin work, leads, burnout)
  - Qualifies budget ($500-1K, $1K-3K, $3K-5K, $5K+)
  - Determines timeline (ASAP, this month, next quarter)
  - Captures contact info (name, business, email, phone)
- ✅ **Service pitch scripts:**
  - AI Voice Agent for missed calls
  - AI Automation for admin work
  - Lead Gen AI for more customers
  - Lifestyle pitch for burnout
- ✅ **Social proof integration:**
  - Case studies ($8M+ revenue, 94% retention)
  - Testimonials from real clients
  - Stats (+340% leads, 62% fewer no-shows)
- ✅ **Multiple CTAs:**
  - Book free strategy call
  - Call phone number directly
  - Send info (nurture sequence)
- ✅ **Lead scoring:**
  - HOT (90+): Call within 1 hour
  - WARM (60-79): Email + call in 24hrs
  - COLD (<60): Nurture sequence
- ✅ **CRM integration:** Saves to `/api/ai-leads`

#### **Sales Scripts Included:**
```
Pain Point Discovery:
- "What's the #1 challenge in your business?"
  → Missing calls → AI Voice pitch
  → Admin work → Automation pitch
  → Not enough leads → Lead Gen pitch
  → Burned out → Lifestyle pitch

Budget Qualification:
- "$500-1K" → Small business
- "$1K-3K" → Professional
- "$3K-5K" → Premium
- "$5K+" → Enterprise → Book call

Closing:
- "📅 Book Free Strategy Call"
- "📞 Call: (919) 555-0100"
- "Send me info first" → Nurture
```

---

### 2. AI Chat Widget (Customer-Facing)

**Location:** Business profile pages (bottom-right, blue)
**Purpose:** Answer questions, capture leads, book appointments

#### **Features:**
- ✅ **OpenAI GPT-4o-mini integration**
- ✅ **Business context awareness:**
  - Knows business name, category, services
  - Knows location, phone, website
  - Trained on business description
- ✅ **Lead capture:**
  - Detects buying intent
  - Asks for name, email, phone
  - Saves to leads table
- ✅ **Booking integration:**
  - Can create appointments directly
  - Checks availability
  - Confirms bookings
- ✅ **Fallback mode:**
  - Works without API key (demo responses)
  - Graceful degradation
- ✅ **Conversation history:**
  - Saves to `chat_conversations` table
  - Analytics on message sentiment
  - Lead intent tracking

#### **Special Commands:**
```
BOOKING_REQUEST: {service, date, time, name, email, phone}
AVAILABILITY_CHECK: {date}
BOOKING_CONFIRMED: Thank you message
```

---

### 3. AI Readiness Quiz

**Location:** Footer ("AI Readiness Quiz" button)
**Purpose:** Qualify leads, capture contact info, recommend services

#### **Quiz Questions (5 total):**
1. How do you handle inbound calls?
2. What happens to after-hours leads?
3. How do customers book appointments?
4. When was your website last updated?
5. Are you using AI tools?

#### **Scoring System:**
- **75%+ (🚀 Ready):** Perfect candidate - call immediately
- **50-74% (✅ Warm):** Great fit - email sequence
- **25-49% (📈 Needs Work):** Send case studies
- **<25% (💡 Cold):** Educational content

#### **Recommendations Engine:**
```
If phone score >= 30 → AI Voice Agent
If leads score >= 30 → 24/7 AI Follow-up
If booking score >= 30 → Auto-Booking System
If website score >= 30 → Web Design
If AI awareness >= 20 → AiEO Services
```

#### **Lead Capture:**
- Name, email, phone, business name
- Quiz score & level saved to CRM
- Auto-opens booking page after submission
- Sends to `/api/ai-leads`

---

### 4. Voice Agent (Outbound Marketing)

**Purpose:** Automated outbound calls for marketing & reminders

#### **Call Types:**
- ✅ **Appointment reminders** (24hr before)
- ✅ **Follow-up calls** to inquiries
- ✅ **Marketing calls** (special offers)
- ✅ **Lead nurture** (checking interest)
- ✅ **Open house invitations**

#### **Features:**
- ✅ **Twilio integration** (or Retell AI alternative)
- ✅ **TwiML call flows:**
  - AI voice script (customizable)
  - Press 1 to transfer to team member
  - Press 2 for SMS with more info
- ✅ **Call logging:**
  - Call SID, status, duration
  - User response (1 or 2)
  - Transcript storage
  - Error tracking
- ✅ **Status callbacks:**
  - Queued → Ringing → In-progress → Completed
  - Failed/No-answer/Busy tracking
- ✅ **Database integration:**
  - Saves to `voice_calls` table
  - Links to listing & appointment
  - Updates appointment reminder_sent flag

#### **Call Scripts:**
```
Appointment Reminder:
"Hi! This is [Business Name]. This is a friendly reminder 
about your upcoming appointment. If you need to reschedule, 
call us at [phone] or visit our website."

Follow-Up:
"Hi! This is [Business Name]. We wanted to follow up on your 
recent inquiry. Press 1 to speak with someone now."

Marketing:
"Hi! This is [Business Name] with a special offer. Call us at 
[phone] to learn more."
```

---

## 🎣 LEAD GENERATION SYSTEM

### 1. Multi-Channel Lead Capture

| Source | Endpoint | Data Captured |
|--------|----------|---------------|
| **AI Sales Agent** | `/api/ai-leads` | Name, business, email, phone, pain point, budget, timeline, score |
| **AI Readiness Quiz** | `/api/ai-leads` | Name, email, phone, business, quiz score, level, recommendations |
| **AI Chat Widget** | `/api/ai-leads` | Name, email, phone, conversation, intent |
| **Contact Form** | `/api/leads` | Name, email, phone, message |
| **Booking Request** | `/api/bookings` | Name, email, phone, date, time, service |
| **Review Submission** | `/api/reviews` | Name, rating, comment |
| **CSV Import** | `/api/import` | Auto-enrolls in outreach |

---

### 2. CRM Pipeline (`/dashboard/leads`)

#### **Pipeline Stages:**
```
Prospect → Contacted → Engaged → Claimed → Upgraded → Lost
```

#### **Features:**
- ✅ **List view** with sorting & filtering
- ✅ **Kanban view** (drag-and-drop stages)
- ✅ **Contact notes** (manual, call, email types)
- ✅ **Activity log** (all interactions)
- ✅ **Outreach campaign tracking:**
  - Status: pending → email_1_sent → email_2_sent → email_3_sent → completed
  - A/B test variants (A or B)
  - Email sent timestamps
- ✅ **Lead scoring display** (from quiz)
- ✅ **Source tracking** (ai_quiz, sales_agent, chat, import, etc.)
- ✅ **Bulk actions** (stage updates, delete)
- ✅ **Search & filter** (by status, source, score)

---

### 3. Outreach Campaign System

#### **3-Step Email Drip:**
```
Step 1: Welcome + Value Prop
Step 2: Social Proof + Case Study
Step 3: Urgency + Call-to-Action
```

#### **Features:**
- ✅ Auto-enrollment on import
- ✅ Manual trigger from dashboard
- ✅ Stage tracking per lead
- ✅ A/B testing support
- ✅ Cron job ready (`/api/cron/outreach`)
- ✅ Resend integration for sending

---

### 4. "Powered by LNL AI" Upsell System

#### **Footer Banner:**
- ✅ CTA: "Want This AI Power on YOUR Website?"
- ✅ "Book AI Demo" button → lnlaiagency.com
- ✅ 4 service showcases (Chat, Voice, Booking, AiEO)
- ✅ Social proof ($8M+ revenue, 94% retention)
- ✅ "AI Readiness Quiz" trigger

#### **Dashboard Upsell Banner:**
- ✅ Shows in bottom-right of dashboard
- ✅ "Love the AI features? Get this on YOUR website!"
- ✅ Case study with real results
- ✅ Modal with full pitch
- ✅ Dismissible (saves to localStorage)

---

## 🏢 WHITE-LABEL AGENCY SYSTEM

### 1. Multi-Tenant Architecture

#### **Database Tables:**
- ✅ `agencies` - Master tenant accounts
- ✅ `agency_users` - Team members per agency
- ✅ `agency_plans` - Subscription tiers (starter, professional, enterprise)
- ✅ `agency_usage` - Usage tracking (listings, visitors, AI messages)
- ✅ All tables have `agency_id` for data isolation

#### **Features:**
- ✅ **Custom subdomains:** `agency.trianglehub.online`
- ✅ **Custom domains:** `directory.theircompany.com`
- ✅ **White-label branding:**
  - Logo upload
  - Favicon
  - Primary/secondary colors
  - Font family selection
- ✅ **Tenant isolation:** All queries filter by agency_id
- ✅ **Middleware:** Resolves agency from domain/hostname

---

### 2. Agency Management (`/dashboard/agency`)

#### **Configurable Settings:**
- ✅ Agency name & slug
- ✅ Custom domain
- ✅ Logo & favicon URLs
- ✅ Brand colors (color pickers)
- ✅ Font family (dropdown)
- ✅ Contact emails (support, general)
- ✅ Contact phone
- ✅ Plan tier (starter, professional, enterprise)
- ✅ Status (active, suspended, cancelled)

#### **Pricing Control:**
- ✅ Agencies set THEIR own prices for small businesses
- ✅ Decide which features are free vs premium
- ✅ Create custom plans
- ✅ Feature gating per plan

---

### 3. Agency Plans & Pricing

#### **Default Tiers:**
| Plan | Price | Max Listings | Max Users | Custom Domain | White-Label |
|------|-------|--------------|-----------|---------------|-------------|
| **Starter** | $99/mo | 100 | 3 | ❌ | ❌ |
| **Professional** | $299/mo | 1,000 | 10 | ✅ | ✅ |
| **Enterprise** | $999/mo | Unlimited | Unlimited | ✅ | ✅ |

#### **Agency Revenue Model:**
```
Agency pays you: $299/mo (Professional)
Agency sells 50 listings at: $49/mo = $2,450/mo
Agency profit: $2,151/mo
Your revenue: $299/mo per agency × 10 agencies = $2,990/mo
```

---

## 💬 CUSTOMER SUPPORT STACK

### 1. Chatwoot Integration

#### **Features:**
- ✅ **Live chat widget** on every page
- ✅ **Multi-channel:**
  - Website chat
  - Facebook Messenger
  - Instagram Direct
  - Telegram
  - WhatsApp
  - Line
  - Email
  - SMS
  - Twitter
- ✅ **AI-powered:**
  - Captain AI Agent (auto-answers FAQs)
  - Captain Copilot (smart reply suggestions)
  - Auto-translation (31+ languages)
- ✅ **Unified inbox** for all channels
- ✅ **Knowledge base** integration
- ✅ **Agent management** (availability, max concurrent chats)
- ✅ **Conversation labels** (tagging system)
- ✅ **Analytics** (response time, CSAT, resolution rate)

#### **Setup:**
```env
NEXT_PUBLIC_CHATWOOT_TOKEN=your_token
NEXT_PUBLIC_CHATWOOT_URL=https://app.chatwoot.com
```

---

### 2. Built-In Support System

#### **Support Inbox (`/dashboard/support`):**
- ✅ **Unified inbox** for all conversations
- ✅ **Multi-channel:** Chat, Email, Phone, SMS, Social
- ✅ **Status filtering:** Open, Pending, Resolved, Closed
- ✅ **Priority levels:** Low, Normal, High, Urgent
- ✅ **Agent assignment**
- ✅ **Message history** (full thread)
- ✅ **Labels/Tags** for organization
- ✅ **Stats dashboard:**
  - Open count
  - Pending count
  - Resolved count
  - Total conversations

#### **Knowledge Base:**
- ✅ Articles with categories & tags
- ✅ AI-powered search
- ✅ View tracking
- ✅ Helpful/Not helpful voting
- ✅ Custom branding per agency
- ✅ Multiple portals (per agency/business)

#### **Auto-Responses:**
- ✅ Keyword-based triggers
- ✅ Intent detection
- ✅ Confidence scoring
- ✅ Success rate tracking
- ✅ Learns from past conversations

---

## 📅 BOOKING & SCHEDULING

### 1. Multi-Industry Booking Calendar

#### **Database Tables:**
- ✅ `business_schedules` - Weekly availability, buffers, breaks
- ✅ `business_services` - Service offerings (duration, price, type)
- ✅ `appointments` - Bookings with metadata
- ✅ `business_time_off` - Blocked dates (vacations, holidays)
- ✅ `booking_questions` - Custom intake forms
- ✅ `booking_responses` - Customer answers

#### **Features:**
- ✅ **Service-based booking:**
  - Duration (15 min - 2 hours)
  - Pricing (free or paid)
  - Categories (group services)
  - Booking types (in-person, virtual, phone)
- ✅ **Schedule management:**
  - Weekly hours (day-by-day)
  - Break times (lunch, etc.)
  - Buffer times between appointments
  - Time-off blocking
- ✅ **Availability checking:**
  - Real-time slot availability
  - 30-minute intervals
  - Conflict prevention
- ✅ **Appointment management:**
  - Status (pending, confirmed, completed, cancelled, no-show)
  - Customer info (name, email, phone)
  - Notes (customer & internal)
  - Timezone support
  - Payment tracking (unpaid, paid, refunded)
  - Reminder tracking
  - Meeting links (for virtual)
- ✅ **Custom intake forms:**
  - Question types (text, select, radio, checkbox, date)
  - Required/optional questions
  - Custom ordering
  - Response storage

---

### 2. Booking Widget

#### **Customer-Facing:**
- ✅ Embedded on business profiles
- ✅ Service selection
- ✅ Date/time picker
- ✅ Customer info form
- ✅ Instant confirmation
- ✅ Email notifications (pending)

#### **Business Dashboard (`/dashboard/bookings`):**
- ✅ View all appointments
- ✅ Filter by date, status, service
- ✅ Confirm/cancel appointments
- ✅ Add internal notes
- ✅ Reschedule
- ✅ Export to calendar (Google, Outlook - pending)

---

## 💰 MONETIZATION FEATURES

### 1. Plans & Pricing System

#### **Default Plans:**
| Plan | Price | Features |
|------|-------|----------|
| **Free** | $0 | Basic listing, 1 image, 1 category |
| **Premium** | $29/mo | AI chat, booking, 5 images, 3 categories, priority ranking |
| **Pro** | $97/mo | All features, 20 images, unlimited categories, API access |

#### **Configurable Features:**
- ✅ Directory owners set THEIR own prices
- ✅ Choose which features are free vs premium
- ✅ Create unlimited custom plans
- ✅ Feature gating per plan
- ✅ Monthly OR annual pricing
- ✅ Enable/disable plans anytime

#### **Feature Flags:**
```json
{
  "highlight_on_home": true,
  "priority_ranking": true,
  "ai_chat_widget": true,
  "booking_calendar": true,
  "extra_images": true,
  "video_section": true,
  "news_feeds": true,
  "job_postings": true,
  "events": true
}
```

---

### 2. Payment Integration

#### **Stripe Integration:**
- ✅ Checkout endpoint (`/api/checkout`)
- ✅ Webhook handler (`/api/webhook/stripe`)
- ✅ Subscription management
- ✅ Plan upgrades/downgrades
- ✅ Proration handling
- ✅ Invoice generation

#### **Payment Tracking:**
- ✅ `payment_status` on appointments
- ✅ `payment_amount` tracking
- ✅ Paid consultations support
- ✅ Retainer deposits
- ✅ Refundable/non-refundable terms

---

### 3. Bulk Import System

#### **CSV Import (`/dashboard/import`):**
- ✅ Column mapping (name, category, email, phone, etc.)
- ✅ Duplicate detection (by name + city)
- ✅ Validation (required fields)
- ✅ Preview before import
- ✅ Row-by-row error reporting
- ✅ Auto-image assignment by category
- ✅ Auto-enrollment in outreach campaigns

#### **Import Template:**
```csv
name,category,description,location_city,location_state,contact_name,contact_email,phone,website,rating
"Triangle Wellness Spa","Med Spa","Premier wellness services","Raleigh","NC","Jane Doe","hello@trianglewellness.com","919-555-0100","https://trianglewellness.com",4.8
```

---

## 🏛️ TECHNICAL ARCHITECTURE

### 1. Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS 4 |
| **Database** | PostgreSQL (Neon serverless) |
| **Database Client** | Native `pg` with SQL template literals |
| **Authentication** | NextAuth.js |
| **AI/LLM** | OpenAI GPT-4o-mini |
| **Voice** | Twilio / Retell AI |
| **Email** | Resend |
| **Payments** | Stripe |
| **File Upload** | Vercel Blob |
| **Chat/Support** | Chatwoot |
| **Analytics** | Vercel Analytics, Speed Insights |
| **Error Tracking** | Sentry |
| **Deployment** | Vercel |

---

### 2. Database Schema

#### **Core Tables:**
- `plans` - Subscription tiers
- `listings` - Business profiles
- `leads` - Customer leads
- `outreach_campaigns` - Email drip tracking

#### **Content Tables:**
- `blogs` - Blog posts
- `events` - Events calendar
- `news` - News feed
- `jobs` - Job postings
- `reviews` - Customer reviews

#### **Booking Tables:**
- `business_schedules` - Weekly availability
- `business_services` - Service offerings
- `appointments` - Bookings
- `business_time_off` - Blocked dates
- `booking_questions` - Intake forms
- `booking_responses` - Customer answers

#### **Support Tables:**
- `knowledge_base` - Help articles
- `support_tickets` - Conversations
- `ticket_messages` - Message history
- `conversation_labels` - Tags
- `support_agents` - Agent management
- `auto_responses` - AI replies

#### **Lead Gen Tables:**
- `ai_quiz_leads` - Quiz submissions
- `chat_conversations` - AI chat history
- `voice_calls` - Outbound call logs

#### **Agency Tables:**
- `agencies` - Master tenants
- `agency_users` - Team members
- `agency_plans` - Subscription tiers
- `agency_usage` - Usage tracking
- `agency_settings` - Branding config

---

### 3. API Endpoints

#### **Listings:**
```
GET    /api/listings              - List all (with filters)
POST   /api/listings              - Create new
GET    /api/listings/[id]         - Get by ID
PUT    /api/listings/[id]         - Update
DELETE /api/listings/[id]         - Delete
```

#### **Plans:**
```
GET    /api/plans                 - List all plans
POST   /api/plans                 - Create plan
PATCH  /api/plans/[id]            - Update plan
DELETE /api/plans/[id]            - Delete plan
```

#### **Leads & CRM:**
```
GET    /api/leads                 - List leads
POST   /api/leads                 - Create lead
GET    /api/crm/notes             - Get notes
POST   /api/crm/notes             - Add note
DELETE /api/crm/notes?id=        - Delete note
GET    /api/ai-leads              - Get AI quiz leads
POST   /api/ai-leads              - Submit quiz
```

#### **Booking:**
```
GET    /api/booking/services      - Get services
POST   /api/booking/services      - Create service
PUT    /api/booking/services      - Update service
DELETE /api/booking/services?id=  - Delete service
GET    /api/booking/schedules     - Get schedule
POST   /api/booking/schedules     - Set schedule
PATCH  /api/booking/schedules     - Check availability
GET    /api/booking/appointments  - Get appointments
POST   /api/booking/appointments  - Create booking
PUT    /api/booking/appointments  - Update booking
DELETE /api/booking/appointments  - Cancel booking
```

#### **Reviews:**
```
GET    /api/reviews?listing_id=   - Get reviews
POST   /api/reviews               - Create review
DELETE /api/reviews?id=           - Delete review
```

#### **Chat:**
```
POST   /api/chat                  - AI chat message
```

#### **Voice:**
```
POST   /api/voice                 - Initiate call
POST   /api/voice/gather          - Handle keypress
POST   /api/voice/status          - Call status callback
```

#### **Import:**
```
POST   /api/import                - Bulk CSV import
```

#### **Agencies:**
```
GET    /api/agencies              - List agencies
GET    /api/agencies?slug=        - Get by slug
GET    /api/agencies?domain=      - Get by domain
POST   /api/agencies              - Create agency
PUT    /api/agencies              - Update agency
DELETE /api/agencies?id=          - Delete agency
```

#### **Support:**
```
GET    /api/support/tickets       - Get tickets
```

#### **Settings:**
```
GET    /api/settings              - Get settings
PUT    /api/settings              - Update settings
```

#### **Other:**
```
GET    /api/seed                  - Seed database
GET    /api/upload                - Upload image
POST   /api/checkout              - Create Stripe checkout
POST   /api/webhook/stripe        - Stripe webhook
GET    /api/cron/outreach         - Send outreach emails
```

---

## ⚙️ ENVIRONMENT VARIABLES REQUIRED

```env
# Database
DATABASE_URL="postgresql://..."

# Authentication
NEXTAUTH_SECRET="your_secret"
NEXTAUTH_URL="https://yourdomain.com"

# AI Services
OPENAI_API_KEY="sk-..."

# Voice Calls
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="+1..."

# Chatwoot
NEXT_PUBLIC_CHATWOOT_TOKEN="..."
NEXT_PUBLIC_CHATWOOT_URL="https://app.chatwoot.com"

# Email
RESEND_API_KEY="re_..."

# Payments
STRIPE_SECRET_KEY="sk_..."
STRIPE_PUBLISHABLE_KEY="pk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# File Upload
BLOB_READ_WRITE_TOKEN="..."

# License (optional)
NEXT_PUBLIC_LICENSE_KEY="..."

# App URL
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

---

## 📊 DATABASE SCHEMA (Key Fields)

### `listings`
```sql
id, name, slug, category, description
location_city, location_state, location_region
street_address, lat, lng
services (JSONB), rating, featured, claimed
plan_id, feature_flags (JSONB)
contact_email, contact_name, phone, website, image_url
business_hours (JSONB), social_media (JSONB)
contact_form_enabled, agency_id
created_at, updated_at
```

### `appointments`
```sql
id, listing_id, service_id
customer_name, customer_email, customer_phone
appointment_date, start_time, end_time
status (pending/confirmed/completed/cancelled/no-show)
notes, internal_notes, timezone
booking_type (in-person/virtual/phone)
location, meeting_link
reminder_sent, confirmation_sent
payment_status, payment_amount
metadata (JSONB), agency_id
created_at, updated_at
```

### `ai_quiz_leads`
```sql
id, listing_id, agency_id
business_name, contact_name, email, phone
quiz_score, quiz_percentage, quiz_level
answers (JSONB), recommendations (JSONB)
status (new/contacted/qualified/demo_booked/closed)
notes
created_at, updated_at
```

### `agencies`
```sql
id, name, slug, custom_domain
logo_url, favicon_url
primary_color, secondary_color, font_family
contact_email, contact_phone, support_email
stripe_customer_id, stripe_subscription_id
plan_tier (starter/professional/enterprise)
status (active/suspended/cancelled)
settings (JSONB)
created_at, updated_at
```

---

## 🎯 SALES COPY HIGHLIGHTS

### For Small Businesses:
```
"Get Found by Local Customers - Free!"

✓ Free listing in the directory
✓ Reach thousands of local searchers
✓ Upgrade anytime for AI Chat, booking, priority ranking

Starting at $0/mo →
```

### For Premium Features:
```
"Unlock AI-Powered Growth"

✓ AI Chat that answers 24/7
✓ Online booking that fills your calendar
✓ Priority ranking above competitors
✓ Customer reviews that build trust
✓ News, events, jobs - unlimited content

Just $29/mo →
```

### For Agencies (White-Label):
```
"Launch Your Own Directory in 24 Hours"

✓ Fully white-labeled platform
✓ Your branding, your domain, your pricing
✓ Keep 100% of listing revenue
✓ AI Chat, Voice, Booking included
✓ We handle tech, you handle clients

From $99/mo →
```

### For AI Services (Upsell):
```
"Get the Same AI Power on YOUR Website"

✓ 24/7 AI Sales Force
✓ AI Voice that answers every call
✓ Auto-booking that fills your calendar
✓ Get found in AI search (AiEO)

Book Free Demo →
```

---

## 📚 DOCUMENTATION LINKS

- **PRD:** `/PRD.md`
- **User Guide:** `/USER_GUIDE.md`
- **Quick Start:** `/QUICK_START.md`
- **Deployment Guide:** `/VERCEL_DEPLOYMENT_GUIDE.md`
- **API Docs:** See endpoints section above

---

## 🚀 DEPLOYMENT CHECKLIST

- [ ] Add all environment variables to Vercel
- [ ] Run all database migrations
- [ ] Seed initial data (plans, settings)
- [ ] Configure Chatwoot token
- [ ] Configure OpenAI API key
- [ ] Configure Twilio credentials (if using voice)
- [ ] Configure Stripe (if taking payments)
- [ ] Test all features in production
- [ ] Set up custom domain
- [ ] Enable Vercel Analytics
- [ ] Configure Sentry for error tracking

---

**Built with ❤️ by LNL AI Agency**
**https://www.lnlaiagency.com/**
