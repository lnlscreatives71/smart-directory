# 🚀 Quickstart Guide: Deploying Smart Directory AI to Vercel

Vercel is the creator of Next.js and the absolute best place to host this application. Because this app uses Neon (Serverless Postgres) and Next.js App Router, it is perfectly optimized to run on Vercel's Edge Network.

Follow these 5 simple steps to get your site live on the internet!

---

## 1. Prepare Your GitHub Repository
Since we already pushed your code to GitHub, your code is ready. 
Make sure you can see your code here: 
👉 [https://github.com/lnlscreatives71/smart-directory](https://github.com/lnlscreatives71/smart-directory)

---

## 2. Get Your Neon Database URL
Before you deploy, you need to copy your secure database connection string.
1. Open your code editor (VS Code).
2. Look for the `.env.local` file in your `smart-directory-nc` project folder.
3. Completely copy the long URL next to `DATABASE_URL=`.
   - *It will look something like this:* `postgresql://neondb_owner:xxxxx@ep-withered-rain-a5xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require`

---

## 3. Connect Vercel to GitHub
1. Go to [https://vercel.com/](https://vercel.com/) and create a free account (Sign up using your GitHub account).
2. Once logged in, click the **"Add New"** button in the top right corner and select **"Project"**.
3. Under the **"Import Git Repository"** section, look for your `smart-directory` repository.
4. Click the **"Import"** button next to it.

---

## 4. Configure Your Vercel Environment Variables
Vercel will ask you to configure the project before it builds it. *This is the most important step!*

1. **Project Name:** Leave it as `smart-directory` (or change it to anything you want, like `triangle-local-hub`).
2. **Framework Preset:** Leave it as **Next.js** (Vercel automatically detects this).
3. **Environment Variables:**
   - Click to expand the "Environment Variables" section.
   - For **Name**, type: `DATABASE_URL`
   - For **Value**, physically **paste** the long PostgreSQL URL you copied from your `.env.local` file in Step 2.
   - Click the **"Add"** button.

---

## 5. Deploy & Seed!
1. Click the big blue **"Deploy"** button.
2. Vercel will now download your code from GitHub, install the dependencies, and build the application. This takes about 60 seconds.
3. Once you see the confetti 🎉, click **"Continue to Dashboard"**.
4. Click the temporary URL Vercel gave you (e.g. `smart-directory-xxxx.vercel.app`) to view your live site!

### Final Step: Seed the DB (Optional but Recommended)
If your live site is empty, it's because your Vercel URL has not run the database setup script yet.
1. In your browser's address bar, type your live URL and add `/api/seed` to the end.
   - *Example:* `https://smart-directory-xxxx.vercel.app/api/seed`
2. Press Enter. You should see a success message (`{"success":true,"message":"Database seeded successfully with 12 listings"}`).
3. Delete `/api/seed` from the URL, hit Enter, and your fully-functional live app will be rendering beautifully on the internet! 

*(Note: In the future, once your real customers are adding data, you should never hit `/api/seed` again as it resets the database).*
