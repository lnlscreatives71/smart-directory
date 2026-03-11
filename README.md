# Smart Directory AI - Triangle Local Hub

A full-stack Next.js 14 App Router directory website specifically built for local businesses in the Raleigh–Durham–Cary (Triangle) area, North Carolina. Patterned after premium business directories with AI feature gating and lead generation capabilities.

## Features
- **Next.js 14 App Router** with Server Components
- **Neon Serverless Postgres** Integration
- **Tailwind CSS** Modern UI/UX
- **Feature Gating**: Premium features like AI Chat, Booking Calendars, and Home Page Highlights controlled by DB `feature_flags`.
- **Dynamic Routing** for Categories, Locations, and Business Profiles.
- **Admin Dashboard**: Fully implemented backend CRM and Listing Editor to control plan upgrades and feature flags.

## Prerequisites
- Node.js 18+
- [Neon Postgres Database](https://neon.tech/)

## Setup Instructions

### 1. Database Configuration (Neon)
1. Go to [Neon.tech](https://neon.tech/) and create a free account.
2. Create a new project and select **Postgres 15** or higher.
3. Use the Neon CLI or dashboard to get your connection string.
4. Paste your connection string into `.env.local`:
   ```env
   DATABASE_URL="your-neon-connection-string-here"
   ```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Migrations and Seed Database
The application includes a built-in API route that drops existing tables, creates the schema, and seeds realistic example listings for the Triangle area.

1. Start the development server:
   ```bash
   npm run dev
   ```
2. Open your browser and navigate to:
   ```
   http://localhost:3000/api/seed
   ```
3. You should see a JSON response: `{"success": true, "message": "Database seeded successfully"}`. **Do not run this in production without authentication!**

### 4. Start Developing
After seeding the database, navigate to the homepage:
```
http://localhost:3000
```
Browse businesses, search for terms (e.g. "HVAC", "Cary", "Restaurant"), and view premium listings that have specific UI components unlocked.

### Admin Dashboard Overview
Access `/dashboard` to view analytics, create brand new database listings, update Plans, and explicitly override feature flag arrays for specific local businesses.

## Deployment
Perfectly suited for deployment on Vercel. 
Simply push to GitHub, import to Vercel, and add your `DATABASE_URL` to the Vercel Environment Variables settings. Since we use `@neondatabase/serverless`, the database queries will execute efficiently on the Edge or Serverless Functions.
