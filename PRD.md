# Product Requirements Document (PRD)
## Smart Directory AI - Triangle Local Hub

---

### 1. Executive Summary
Smart Directory AI (Triangle Local Hub) is a full-stack, hyper-local business directory optimized for the Raleigh, Durham, and Cary (Triangle) region of North Carolina. Unlike traditional static directories, this application acts as a scalable lead-generation machine with built-in Customer Relationship Management (CRM), automated outreach sequences, and dynamic feature gating. It is designed to attract local businesses, verify their information, and upsell them to premium tiers.

### 2. Goals & Objectives
- **Lead Generation:** Capture inbound traffic looking for local services and route them to listed businesses.
- **Monetization:** Provide tiered subscription plans (Free, Premium, Pro) that unlock visibility and advanced front-end features.
- **Automation:** Automate the prospecting and verification workflow so the administrator does not need to manually email 1000s of business owners.
- **Performance:** Deliver an extremely fast, SEO-friendly Next.js App Router experience edge-ready for Vercel.

### 3. Tech Stack
- **Framework:** Next.js 14 (App Router, Server Components)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Modern Glassmorphism, Dark/Light Mode)
- **Database:** Neon Serverless Postgres (`@neondatabase/serverless`)
- **Icons:** Lucide React
- **Deployment Target:** Vercel (or any Node.js VPS like Hostinger)

---

### 4. Core Features & Functionality

#### 4.1. Public-Facing Directory
- **Dynamic Homepage:** A high-converting hero section with semantic search functionality, intelligent category routing, and a grid of top-rated, highlighted businesses.
- **Business Profile Pages (`/biz/[slug]`):** Individual SEO-optimized landing pages for businesses.
- **Search & Filtering:** Real-time search algorithm looking at business name, category, description, and city. Sorts automatically using `priority_ranking` feature flags.
- **Lead Capture:** Forms embedded onto business profiles allowing users to contact the business (routing to the Neon DB `leads` table).

#### 4.2. Feature Gating & Monetization (Feature Flags)
Instead of rigidly tying UI features to strict database tables, Smart Directory uses dynamic JSON `feature_flags` to control rendering. Features include:
- `highlight_on_home`: Automatically injects the business into the featured hero grid with premium CSS borders and verified badges.
- `priority_ranking`: Overrides standard Postgres sorting, forcing this profile to the top of any ILIKE search query.
- `ai_chat_widget`: Conditionally renders an AI lead-capture bot on the public profile.
- `booking_calendar`: Conditionally mounts a calendar/booking block for the business.

#### 4.3. Admin Dashboard (CMS)
- **Metrics Overview:** Fast aggregated metrics on total listings, total leads, and Monthly Recurring Revenue (MRR).
- **Listing Matrix:** A powerful server-side data table with real-time text search, plan filtering, and quick-action tools.
- **Listing Editor:** A comprehensive form UI with inline validation to Create and Update business listings, alter feature flags, and override subscription plans.
- **Plan Management:** Visual tier manager defining pricing and limits.

#### 4.4. Automated Outreach CRM (The Verification Funnel)
A built-in Cron Worker that scans the database and sends automated email sequences to local businesses inserted into the directory:
1. **Verification Email:** Sent immediately upon listing creation. Asks the business owner to click a magic link to claim their unclaimed profile.
2. **Upgrade Pitch:** If the profile is claimed, the system registers the action and queues an email pitching the Premium/Pro upgrade plans.
3. **Automated Follow-up:** If the business ignores Email 1 for X days, an automated follow-up is triggered to ensure the directory data is accurate.

---

### 5. Database Schema (Neon Postgres)
- **`plans`**: Defines monetization tiers (id, name, monthly_price, limits JSONB).
- **`listings`**: The core data model for businesses (id, name, slug, category, description, rating, contact_email, plan_id, feature_flags JSONB).
- **`outreach_campaigns`**: The CRM pipeline table (listing_id, status, email_1_sent_at, email_2_sent_at).
- **`leads`**: Captures inbound user inquiries for specific businesses.

### 6. Future Roadmap
- **Stripe Integration:** Hook the Next.js API up to Stripe checkout sessions so business owners can input credit cards to instantly flip their `plan_id`.
- **Inbound Webhooks:** Parse organic email replies from business owners directly into the CRM dashboard.
- **AI Vector Embeddings:** Upgrade the standard Postgres ILIKE text search to a `pgvector` semantic search using OpenAI embeddings.
