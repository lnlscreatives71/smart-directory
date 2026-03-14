# Product Requirements Document (PRD)

## **Project Name:** Smart Directory SaaS
**Status:** In Development  
**Target Audience:** Local business owners (B2B), Consumers (B2C)  

---

## 1. Product Overview

### 1.1 Objective
Build a comprehensive, region-specific business directory (initially targeting the NC Triangle: Raleigh, Durham, Chapel Hill, Cary, Apex). The platform serves a dual purpose: providing an easily searchable database for consumers and an automated lead-generation & marketing suite for paying businesses.

### 1.2 Core Value Proposition
* **For Consumers:** Find highly-rated, categorized local businesses with direct booking and AI assistance capabilities. 
* **For Businesses:** Increase digital visibility via SEO-optimized sub-pages, publish news/jobs, and generate leads directly from the directory without needing a dedicated website.

### 1.3 Monetization Strategy
*   **Freemium Model:**
    *   **Community Listing (FREE):** Basic exposure, 1 category, single image banner, standard search indexing.
    *   **Local Spotlight ($29/Month):** Priority ranking, "Featured" badges, AI Chat Lead generation widget, direct booking calendars, active job postings, news announcements, events, and extra photo galleries.
    *   **Pro / Enterprise ($97+/Month):** Unlimited categories, API access, advanced outreach reporting.

---

## 2. Technical Architecture

### 2.1 Technology Stack
*   **Framework:** Next.js (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS + Lucide Icons
*   **Database:** PostgreSQL (Neon serverless)
*   **Database Client:** Native `pg` via raw SQL literal strings (no ORM).

### 2.2 Database Schema Architecture

The relational schema heavily revolves around the central `listings` table.

* **Plans:** Defines the 3 tiers (`id`, `name`, `monthly_price`, `limits`).
* **Listings:** The core entity (`name`, `slug`, `category`, `location_city`, `rating`, `feature_flags`, `plan_id`).
* **Events & Blogs:** Premium content arrays referencing a `listing_id`.
* **Jobs & News:** Additional marketing and career boards referencing a `listing_id`.
* **Bookings & Leads:** Interactive conversion points referencing a `listing_id` but created by consumers.
* **Outreach Campaigns:** The internal CRM tracker for un-claimed listings, referencing `listing_id` and tracking `email_sent` statuses.

---

## 3. Features & Requirements

### 3.1 Public Directory (B2C)

#### 3.1.1 Navigation & Search
*   **Req 1:** The header must include categorized dropdown menus (`Retail`, `Health & Wellness`, `Services`, `Dining`, `Blogs`, `Events`).
*   **Req 2:** The hero section must feature a massive, high-conversion search bar with a prominent, vibrant call-to-action button.
*   **Req 3:** The directory search should filter across strings, cities, categories, and tags via URL parameters (`?q=query`).

#### 3.1.2 The Business Profile Page (`/biz/[slug]`)
*   **Req 1:** Must dynamically render standard business information (Name, City, State, Description, Services).
*   **Req 2:** The page layout includes a Hero Banner, a Main Content Body, and a sticky Right-Hand Sidebar.
*   **Req 3:** **Premium Gating:** The rendering of component blocks (e.g., `<BookingWidget />`, AI Assistant chat, News Carousels) must be conditionally managed via the `feature_flags` JSON block attached to the SQL `listing` object.

---

## 4. Administrative Dashboard (B2B/Admin)

The `/dashboard/` nexus is gate-kept for platform owners to administer the SaaS.

### 4.1 Listings CRM (`/dashboard/listings`)
*   **Req 1:** Admins must be able to view all profiles, filter by plan tier, or filter by "Claim Request".
*   **Req 2:** Admins must be able to edit **Component Rendering Overrides**. This explicitly overrides a plan's generic features on a per-listing basis (e.g., toggling the Booking Calendar on for a Free user manually).

### 4.2 Automated Outreach CRM (`/dashboard/leads`)
*   **Req 1:** When a business is "Seeded," it starts as "un-claimed." 
*   **Req 2:** The system must execute a 3-step drip email campaign (via cron scheduler or manual trigger). 
*   **Req 3:** The funnel stages are: `pending` -> `email_1_sent` -> `email_2_sent` -> `email_3_sent` -> `completed`. The goal is to drive the owner to `/biz/claim`.

### 4.3 Premium Content Workspaces
*   **Req 1:** The platform must separate the administration of premium entities into dedicated tables.
*   **Req 2:** Specifically: `/dashboard/events` (Events), `/dashboard/blogs` (Blogs), `/dashboard/news` (Press), `/dashboard/jobs` (Career Openings), and `/dashboard/bookings` (Aggregated Appointment Ledger).

---

## 5. Security & Deployment Requirements

*   **Hosting:** Deployable strictly on Vercel or AWS Amplify using Next.js runtime.
*   **Environment Validation:** App will crash on boot if `DATABASE_URL` is omitted.
*   **Forms Validation:** Native HTML API validations (`required`, `type="email"`) alongside React controlled component state handlers to prevent empty SQL insertions.
*   **SQL Injection:** Use parameterized template literal tag functions (e.g., `sql\`SELECT * FROM listings WHERE id = ${id}\``) to prevent SQL string injection vectors natively.
