# Detailed User Guide - Smart Directory

This comprehensive guide is meant for platform administrators to understand the core workflows and day-to-day operations of managing the Smart Directory platform.

## Table of Contents
1. [Adding a Business Account](#1-adding-a-business-account)
2. [Changing Business Locations](#2-changing-business-locations)
3. [Updating Features (Free vs Paid)](#3-updating-features-[free-vs-paid])
4. [Claiming a Free Listing](#4-claiming-a-free-listing)
5. [Running the Automated Email Outreach Campaign](#5-running-the-automated-email-outreach-campaign)
6. [Managing Premium Assets (News, Jobs, Bookings, Events)](#6-managing-premium-assets)

---

## 1. Adding a Business Account

Admins can manually input any business into the directory.

1. Go to **Dashboard > Listings** (`/dashboard/listings`).
2. Click the specific **"Add Business"** button in the top right.
3. **Core Details**: Enter the Business Name, URL Slug (critical for routing), and a descriptive paragraph.
4. **Geography**: Enter the required City (e.g., *Raleigh*) and State (e.g., *NC*).
5. **Subscription Tier**: Under *Plan & Feature Flags*, select the baseline tier for this business (Free, Premium, or Pro).
6. **Save**: Click **Create Listing**. The listing instantly goes live.

---

## 2. Changing Business Locations

Geographic routing heavily influences directory SEO. A business’s location determines which searches it surfaces on.

**To change a business location:**
1. Navigate to **Dashboard > Listings**.
2. Locate the target business via the Search bar or table, and click the **Edit** (Pencil) icon.
3. In the *"Business Info"* form block, modify the **City** and **State** input fields. 
4. The directory relies on exact string-matching for city filters (e.g., *Cary*, *Durham*, *Raleigh*). Ensure consistency for searches to group appropriately. 
5. Click **Save Changes**. Changes reflect on the card dynamically.

---

## 3. Updating Features (Free vs Paid)

The platform employs a fine-grained monetization strategy using **Feature Flags**. You can explicitly turn on or off premium features for a specific business, regardless of their subscription plan tier.

**To grant or restrict premium features:**
1. Open the specific business via **Dashboard > Listings > Edit**.
2. Scroll down to the **"Component Rendering Overrides"** section at the bottom.
3. You will see several functional checkboxes:
   * **Highlight On Home**: Bumps the business to the Top/Featured tier of cards.
   * **Priority Ranking**: Weights the search index.
   * **AI Chat Widget**: Turns on the conversational lead-gen bot on their profile.
   * **Booking Calendar**: Implements the automatic customer appointment UI.
   * **Extra Images**: Unlocks media bounds.
4. Toggle these on or off as a "comp" or a downgrade, and click **Save Changes**. 

**To update global feature descriptions:**
1. Edit the frontend component at `src/app/pricing/page.tsx` directly to change the marketing descriptions of `FREE_FEATURES` versus `PREMIUM_FEATURES`.

---

## 4. Claiming a Free Listing

Often, administrators will bulk-scrape and upload 1,000s of "Unclaimed" Free business listings into the database. Owners must then "Claim" them to verify ownership and edit info.

**The Workflow:**
1. The business owner visits the directory, sees their profile, and clicks **"Claim This Listing"** (or hits the `/biz/claim` portal).
2. They submit their Name, Corporate Email, and verification proof.
3. **Admin Verification:** The admin logs into the Dashboard, goes to **Listings**, and filters by the **"Claim Request"** tab.
4. If valid, the admin edits the specific business profile.
5. In the **"Services & Validation"** section, the admin checks the **"Owner Claimed"** checkbox.
6. The listing now receives a visible, verified blue checkmark on the public frontend.

---

## 5. Running the Automated Email Outreach Campaign

The platform operates an internal CRM ("Leads & CRM") to automatically convert scraped free listings into paying PREMIUM subscribers.

**The Pipeline Lifecycle:**
1. Whenever a business is added to the system (or seeded), an entry is automatically created in the `outreach_campaigns` SQL table with a status of `pending`.
2. The core task runner (`/api/cron/outreach/route.ts`) acts as the email engine.
3. When the CRON runs (or when an admin triggers it manually via Dashboard):
   * **Email 1** (Verification): Sent to `pending` businesses asking them to verify their info and offering a free "Premium" trial preview. Status updates to `email_1_sent`.
   * **Email 2** (Upsell): Sent 1 week later if they haven't upgraded. Focuses on premium features (AI Chat, Bookings, Events). Status updates to `email_2_sent`.
   * **Email 3** (Final Offer): Sent 1 week after Email 2. Offers a temporary discount if they upgrade today. Status updates to `completed`.
   
**To view and manage the campaign:**
* Visit **Dashboard > Leads & CRM**. The table displays exactly which step of the funnel each un-claimed business is in.

---

## 6. Managing Premium Assets

As part of the Premium tier offering, your subscribed businesses can publish exclusive dynamic content to their pages.

* **Jobs**: Found in `/dashboard/jobs`. Add full-time or remote hiring postings.
* **Events**: Found in `/dashboard/events`. Calendar-blocked open houses or webinars.
* **News/Press**: Found in `/dashboard/news`. Official announcements that inject into a visual feed.
* **Bookings**: Found in `/dashboard/bookings`. Global overview of all appointment requests generated from the public-facing `<BookingWidget />`. 
