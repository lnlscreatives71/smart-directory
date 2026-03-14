# Smart Directory - Quick Start Guide

Welcome to the Smart Directory platform. This guide will help you get the application up and running locally, seed your initial database, and start managing businesses immediately.

## 1. Local Environment Setup

1. **Install Dependencies:**
   Ensure you have Node.js installed, then run:
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Ensure your `.env.local` contains the active Neon PostgreSQL connection string:
   ```env
   DATABASE_URL="postgresql://[user]:[password]@[host]/neondb?sslmode=require"
   ```

3. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   *The application will be accessible at `http://localhost:3000`.*

---

## 2. Database Initialization

The platform relies on a PostgreSQL database. If you are setting up for the exact first time (or want to reset to factory defaults), you need to push the schema and seed data.

1. **Run Base Schema & Seed:**
   Navigating to the seed endpoint automatically drops old tables, creates strict schemas (Listings, Plans, Leads, Campaigns), and creates 12 sample businesses.
   **Action:** Open your browser and go to `http://localhost:3000/api/seed`

2. **Run Premium Feature Migrations:**
   Run the secondary migration scripts via the terminal to instantiate the premium tables (Events, Blogs, News, Jobs, Bookings).
   ```bash
   npx tsx --env-file=.env.local scripts/migrate.ts
   npx tsx --env-file=.env.local scripts/migrate_v2.ts
   npx tsx --env-file=.env.local scripts/migrate_v6_listing_contact_info.ts
   ```

3. **Seed Premium Feature Data:**
   Attach mock events, blog posts, news, and jobs to your businesses to see how they look populated.
   ```bash
   npx tsx --env-file=.env.local scripts/seed_features.ts
   ```

---

## 3. Core Directory Navigation

### Public Facing Pages
* **Homepage (`/`)**: Main search hub, category pills, and featured ("highlighted") businesses.
* **Pricing (`/pricing`)**: The public sales funnel demonstrating Free vs Premium features.
* **Business Profile (`/biz/[slug]`)**: The dynamic individual profile page. Renders standard data, and conditionally renders premium blocks (Calendars, AI chat, News, Jobs) based on the business's `feature_flags`.

### Admin Dashboard (The Backend)
* Accessible via `http://localhost:3000/dashboard`
* **Login Credentials (Default Admin):**
    * **Email:** `admin@trianglelocalhub.com`
    * **Password:** `admin123`
* **Listings (`/dashboard/listings`)**: Your primary CRM for all directory businesses.
* **Bulk Import (`/dashboard/import`)**: Drag and drop CSVs to load 100s of listings at once.
* **Premium Assets**: Manage `Events`, `Blogs`, `News`, `Jobs`, and `Bookings` directly from the sidebar. 

---

## 4. Next Steps

Refer to the **[Detailed User Guide](USER_GUIDE.md)** for exhaustive instructions on standard operating procedures like:
* Managing Claim Requests
* Sending automated Outreach sequences
* Explicitly granting/restricting Premium features
* Modifying target geographic locations
