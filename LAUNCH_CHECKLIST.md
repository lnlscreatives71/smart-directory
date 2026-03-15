# 🚀 LAUNCH CHECKLIST - Complete Step-by-Step Guide

**Time Required:** 20-30 minutes  
**Difficulty:** Easy (just copy-paste)

---

## 📋 PART 1: GET API KEYS (15 minutes)

### ✅ 1. OpenAI (AI Chat & Sales Agent)
**Required for:** AI chat responses, lead qualification

1. Go to: https://platform.openai.com/api-keys
2. Sign up/login
3. Click **"Create new secret key"**
4. Copy the key (starts with `sk-...`)
5. **Cost:** ~$0.01 per 1000 tokens (pennies per conversation)

```
✅ OPENAI_API_KEY = sk-proj-...
```

---

### ✅ 2. Twilio (Voice Calls & SMS)
**Required for:** Outbound marketing calls, appointment reminders

1. Go to: https://www.twilio.com/try-twilio
2. Sign up for free trial ($15 credit)
3. Verify email & phone
4. Dashboard shows **Account SID** (copy it, starts with `AC...`)
5. Click **"Show"** to reveal Auth Token (copy it)
6. Go to **Phone Numbers** → **Buy a Number** (~$1/month)
7. Choose number with **Voice + SMS** capabilities

```
✅ TWILIO_ACCOUNT_SID = AC...
✅ TWILIO_AUTH_TOKEN = ...
✅ TWILIO_PHONE_NUMBER = +1919...
```

---

### ✅ 3. Chatwoot (Customer Support Chat)
**Required for:** Live chat widget, support inbox

**Option A: Self-Hosted (You chose this)**
1. Your Chatwoot URL: `http://your_server_ip:3000`
2. Login to your Chatwoot
3. Settings → Inboxes → Add Inbox → Website
4. Copy **Website Token**

```
✅ NEXT_PUBLIC_CHATWOOT_TOKEN = ...
✅ NEXT_PUBLIC_CHATWOOT_URL = http://your_server_ip:3000
```

**Option B: Chatwoot Cloud (Easier)**
1. Go to: https://app.chatwoot.com
2. Sign up for free trial
3. Settings → Inboxes → Add Website
4. Copy Website Token

```
✅ NEXT_PUBLIC_CHATWOOT_TOKEN = ...
✅ NEXT_PUBLIC_CHATWOOT_URL = https://app.chatwoot.com
```

---

### ✅ 4. Resend (Email Sending)
**Required for:** Outreach campaigns, booking confirmations

1. Go to: https://resend.com/api-keys
2. Sign up/login
3. Click **"Create API Key"**
4. Copy the key (starts with `re_...`)
5. **Cost:** Free for 3,000 emails/month

```
✅ RESEND_API_KEY = re_...
```

---

### ✅ 5. Stripe (Payment Processing)
**Required for:** Subscription payments, booking deposits

1. Go to: https://dashboard.stripe.com/register
2. Sign up/login
3. Go to **Developers** → **API keys**
4. Copy **Secret key** (starts with `sk_test_...`)
5. Copy **Publishable key** (starts with `pk_test_...`)
6. **Cost:** 2.9% + $0.30 per transaction

```
✅ STRIPE_SECRET_KEY = sk_test_...
✅ STRIPE_PUBLISHABLE_KEY = pk_test_...
✅ STRIPE_WEBHOOK_SECRET = whsec_... (create in webhook settings)
```

---

### ✅ 6. Database Connection (Neon PostgreSQL)
**Required for:** All data storage

1. Go to: https://console.neon.tech
2. Sign up/login
3. Create new project
4. Copy **Connection string** (starts with `postgresql://...`)

```
✅ DATABASE_URL = postgresql://...
```

---

### ✅ 7. NextAuth (Authentication)
**Required for:** User login, dashboard access

1. Generate a secret: https://generate-secret.vercel.app/32
2. Copy the generated string

```
✅ NEXTAUTH_SECRET = (32 character random string)
✅ NEXTAUTH_URL = https://www.thetrianglehub.online
```

---

### ✅ 8. Vercel Blob (File Uploads)
**Required for:** Image uploads

1. Go to Vercel Dashboard → Storage
2. Add Blob Storage
3. Copy the token

```
✅ BLOB_READ_WRITE_TOKEN = ...
```

---

## 📋 PART 2: ADD TO VERCEL (5 minutes)

### Step 1: Go to Vercel Dashboard
1. https://vercel.com/dashboard
2. Click your project: `smart-directory-nc`
3. Go to **Settings** → **Environment Variables**

### Step 2: Add All Variables
Click **"Add New"** for each:

| Variable Name | Value | Example |
|---------------|-------|---------|
| `DATABASE_URL` | From Neon | `postgresql://...` |
| `NEXTAUTH_SECRET` | From generator | `abc123...` (32 chars) |
| `NEXTAUTH_URL` | Your domain | `https://www.thetrianglehub.online` |
| `OPENAI_API_KEY` | From OpenAI | `sk-proj-...` |
| `TWILIO_ACCOUNT_SID` | From Twilio | `AC...` |
| `TWILIO_AUTH_TOKEN` | From Twilio | `...` |
| `TWILIO_PHONE_NUMBER` | From Twilio | `+1919...` |
| `NEXT_PUBLIC_CHATWOOT_TOKEN` | From Chatwoot | `...` |
| `NEXT_PUBLIC_CHATWOOT_URL` | Your Chatwoot | `http://your_ip:3000` |
| `RESEND_API_KEY` | From Resend | `re_...` |
| `STRIPE_SECRET_KEY` | From Stripe | `sk_test_...` |
| `STRIPE_PUBLISHABLE_KEY` | From Stripe | `pk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | From Stripe | `whsec_...` |
| `BLOB_READ_WRITE_TOKEN` | From Vercel | `...` |

### Step 3: Save & Redeploy
1. Click **"Save"** on each variable
2. Go to **Deployments** tab
3. Click **"Redeploy"** on latest deployment
4. Wait 2-3 minutes for build

---

## 📋 PART 3: RUN DATABASE MIGRATIONS (5 minutes)

### Connect to Your Database

**Option A: From Your Computer**
```bash
# Install ts-node if not already installed
npm install -g ts-node

# Run migrations in order:
npx ts-node scripts/migrate_v11_voice_chat.ts
npx ts-node scripts/migrate_v12_booking_calendar.ts
npx ts-node scripts/migrate_v13_white_label.ts
npx ts-node scripts/migrate_v14_ai_quiz_leads.ts
npx ts-node scripts/migrate_v15_support_system.ts
npx ts-node scripts/update_pricing.ts
```

**Option B: From Vercel (Remote)**
```bash
# Install Vercel CLI
npm i -g vercel

# Link to your project
vercel link

# Pull production env vars
vercel env pull production

# Run migrations (they'll use production DB)
npx ts-node scripts/migrate_v11_voice_chat.ts
# ... repeat for all migrations
```

---

## 📋 PART 4: TEST EVERYTHING (5 minutes)

### Homepage Tests
```
[ ] Go to https://www.thetrianglehub.online
[ ] Page loads without errors
[ ] Green "Grow My Business" button visible (bottom-right)
[ ] Click button → AI Sales Agent opens
[ ] Answer a few questions → works
[ ] Scroll to footer → "AI Readiness Quiz" button visible
[ ] Click quiz → answers → submits → works
```

### Business Profile Tests
```
[ ] Go to /biz/raleigh-glow-med-spa
[ ] Business info displays
[ ] Blue AI chat widget visible (bottom-right)
[ ] Click chat → send message → AI responds
[ ] Reviews section visible
[ ] Click "Write a Review" → submit → appears
[ ] Booking widget visible
[ ] Fill form → submit → works
```

### Dashboard Tests
```
[ ] Go to /dashboard
[ ] Login works
[ ] Overview loads
[ ] Click "Leads & CRM" → shows captured leads
[ ] Click "Bookings" → shows appointments
[ ] Click "Support" → inbox loads
[ ] Click "Agency" → settings load
```

### Chatwoot Tests
```
[ ] Chat bubble appears on homepage
[ ] Click → Chatwoot opens
[ ] Send test message
[ ] Check your Chatwoot dashboard → message appears
```

---

## ✅ LAUNCH COMPLETE!

### What's Now Live:
- ✅ AI Sales Agent qualifying leads
- ✅ AI Chat Widget answering questions
- ✅ AI Readiness Quiz capturing leads
- ✅ Booking system accepting appointments
- ✅ Reviews system collecting social proof
- ✅ Chatwoot support chat active
- ✅ CRM tracking all leads
- ✅ White-label platform ready for agencies

### What to Monitor:
- `/dashboard/leads` → New leads coming in
- `/dashboard/bookings` → Appointment requests
- Vercel Analytics → Traffic & performance
- Sentry → Any errors

---

## 🆘 TROUBLESHOOTING

### Issue: "Missing environment variables"
**Fix:** Double-check all 14 variables are added in Vercel

### Issue: "Database connection error"
**Fix:** Verify DATABASE_URL is correct, check Neon dashboard

### Issue: "AI not responding"
**Fix:** Check OPENAI_API_KEY, verify billing in OpenAI dashboard

### Issue: "Chatwoot not loading"
**Fix:** Verify URL is correct, check CORS settings on your server

### Issue: "Migrations fail"
**Fix:** Check database connection, ensure tables don't already exist

---

## 📞 NEED HELP?

**Support:** support@trianglehub.online  
**Docs:** See `FEATURE_DOCUMENTATION.md` for full details

---

**🎉 You're live! Start driving traffic and watch the leads roll in!**
