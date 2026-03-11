# Smart Directory AI - User Instruction Guide

Welcome to the Smart Directory administrator guide! This document explains exactly how to operate the software, manage your directory listings, and run the automated outreach CRM.

---

## 1. Local Development Setup
If you are running the app on your own computer:
1. Open your terminal in the project folder (`smart-directory-nc`).
2. Run `npm run dev`.
3. Open your browser to `http://localhost:3000`.

*Note: Make sure your `.env.local` file contains your valid `DATABASE_URL` pointing to your Neon Postgres database.*

---

## 2. Navigating the Admin Dashboard
The Admin Dashboard is the central nervous system of your business. It is securely located at `http://localhost:3000/dashboard`.
*(In a production setup, this route will be protected by a login screen).*

### Overview Page
The main dashboard gives you a high-level view of your Directory's health:
- **Total Listings**: How many businesses are in your database.
- **Leads Generated**: How many users have filled out contact forms.
- **Premium MRR**: Estimated Monthly Recurring Revenue based on what Plans your listings are assigned to.

---

## 3. Managing Listings
To view all businesses, navigate to **Dashboard -> Listings**.

### Adding a New Business Prospect
1. Click the **"+ Create Listing"** button.
2. Fill out the **Business Info** (Name, URL Slug, Category, City, Description). 
   - *Crucial:* Ensure you enter a valid **Contact Email**. Without this, the CRM cannot send an outreach email to the owner!
3. Assign a **Plan** (Free, Premium, or Pro).
4. **Feature Flags:** Toggle on specific premium UI features (like `highlight_on_home`) if you want to bypass the Plan restrictions and give them a feature for free.
5. Click **Create Listing**.
   - *Behind the scenes, this automatically inserts the business into the `outreach_campaigns` CRM queue so they can receive their Verification Email.*

### Editing a Business
Click the **"Edit"** pencil icon next to any listing in the Matrix to open their profile. You can manually change they status to **"Claimed"** here if an owner calls you on the phone instead of using the automated email links.

---

## 4. The CRM & Automated Outreach Engine
Your directory includes a proprietary Automated CRM located at **Dashboard -> Leads & CRM**.

### How the Pipeline Works
When you add a new business to the directory (with an email address), they enter the pipeline as **Pending Verification**. The system is designed to send them a sequence of 3 emails over a 1-week period to get them to verify their info and upgrade to a paid plan.

### Running the Campaign Engine
Because you don't have a background-server running 24/7 yet, you control when the emails send!
1. Go to the **Leads & CRM** page.
2. You will see a list of every business and what stage of the funnel they are in.
3. Click the **"Standard Sync"** button.
   - The app will securely scan your database.
   - Anyone who is "Pending" will be sent **Email 1** (Verification Link).
   - Anyone who has "Claimed" their profile but hasn't received an upsell will be sent **Email 2** (Premium Pitch).
   - Anyone who ignored Email 1 for 5 days will receive **Email 3** (Final Follow-up).
4. *Testing Override:* If you don't want to wait 5 days to test Email 3, click the **"Force Push Queue"** button. This ignores the time delay and forces the next email in the sequence.

*Emails currently simulate sending via your local Terminal window so you can read the HTML safely. When you go live, you will replace lines 2-5 in `src/lib/email.ts` with your actual Resend or Sendgrid API keys.*

---

## 5. Monetization & Plans
Navigate to **Dashboard -> Plans**.
This shows your active pricing tiers. The `listings` database connects directly to these plans.

If you edit the price of the "Premium" plan here, everywhere a Premium business is displayed on the public site or inside the Admin dashboard will instantly update to calculate the new MRR.

## 6. Going Live
When you are ready to launch to the public:
1. Create a free account at **Vercel.com**.
2. Connect your GitHub account and import the standard `smart-directory` repository.
3. Before hitting Deploy, click "Environment Variables" and paste in your `DATABASE_URL` from Neon.
4. Vercel will instantly compile your Next.js application and provide you with a live, blazing fast `https` URL!
