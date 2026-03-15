# 📋 TODO: DEPLOYMENT & TESTING CHECKLIST

## ✅ COMPLETED FEATURES

### Core Directory
- [x] Business listings with CRUD
- [x] Category browsing
- [x] Search functionality
- [x] Business profile pages
- [x] Reviews system
- [x] Events, blogs, news, jobs
- [x] Bulk CSV import
- [x] Public listing submission (no login)

### AI & Automation
- [x] AI Sales Agent (proactive lead gen)
- [x] AI Chat Widget (OpenAI integration)
- [x] AI Readiness Quiz (lead scoring)
- [x] Voice Agent (Twilio/Retell)
- [x] Lead capture & CRM integration

### Booking System
- [x] Multi-industry calendar
- [x] Service management
- [x] Schedule/availability
- [x] Appointment booking
- [x] Custom intake forms
- [x] Booking widget

### White-Label System
- [x] Multi-tenant architecture
- [x] Agency management
- [x] Custom domains/subdomains
- [x] Dynamic branding (colors, fonts, logo)
- [x] Tenant isolation
- [x] Agency pricing control

### Support Stack
- [x] Chatwoot integration
- [x] Unified support inbox
- [x] Knowledge base
- [x] Auto-responses
- [x] Multi-channel support

### Monetization
- [x] Plans & pricing (configurable)
- [x] Feature gating
- [x] Stripe integration
- [x] Payment tracking
- [x] Upsell funnels

---

## 🔧 ENVIRONMENT VARIABLES TO ADD

### In Vercel Dashboard → Settings → Environment Variables:

```env
# Required
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=https://www.thetrianglehub.online

# AI Services (for AI features)
OPENAI_API_KEY=sk-...

# Voice Calls (for outbound marketing)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+19195550100

# Chatwoot (for customer support chat)
NEXT_PUBLIC_CHATWOOT_TOKEN=your_token_here
NEXT_PUBLIC_CHATWOOT_URL=https://app.chatwoot.com

# Email (for outreach campaigns)
RESEND_API_KEY=re_...

# Payments (for subscriptions)
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# File Upload (for images)
BLOB_READ_WRITE_TOKEN=...

# Optional
NEXT_PUBLIC_LICENSE_KEY=...
NEXT_PUBLIC_APP_URL=https://www.thetrianglehub.online
```

---

## 📊 DATABASE MIGRATIONS TO RUN

Run these IN ORDER on your production database:

```bash
# 1. Voice & Chat tables
npx ts-node scripts/migrate_v11_voice_chat.ts

# 2. Booking calendar tables
npx ts-node scripts/migrate_v12_booking_calendar.ts

# 3. White-label agency tables
npx ts-node scripts/migrate_v13_white_label.ts

# 4. AI quiz leads table
npx ts-node scripts/migrate_v14_ai_quiz_leads.ts

# 5. Support system tables
npx ts-node scripts/migrate_v15_support_system.ts

# 6. Update pricing to $29/$97
npx ts-node scripts/update_pricing.ts
```

---

## 🧪 TESTING CHECKLIST

### Homepage Tests
- [ ] Load https://www.thetrianglehub.online
- [ ] Search bar works
- [ ] Featured listings display
- [ ] Category tiles display
- [ ] Green "Grow My Business" button appears (bottom-right)
- [ ] Click "Grow My Business" → AI Sales Agent opens
- [ ] Scroll to footer → "Powered by LNL AI" visible
- [ ] Click "AI Readiness Quiz" → Quiz modal opens

### AI Sales Agent Tests
- [ ] Button pulses/animates
- [ ] Click opens chat window
- [ ] Greeting message appears
- [ ] Answer qualification questions
- [ ] See relevant pitch based on pain point
- [ ] Enter test email at end
- [ ] Redirects to booking page
- [ ] Check `/dashboard/leads` → lead appears with score

### AI Readiness Quiz Tests
- [ ] Click "AI Readiness Quiz" in footer
- [ ] Answer 5 questions
- [ ] See score & recommendations
- [ ] Enter contact info
- [ ] Submit → opens LNL AI Agency site
- [ ] Check `/dashboard/leads` → lead appears

### Business Profile Tests
- [ ] Go to `/biz/raleigh-glow-med-spa`
- [ ] Business info displays
- [ ] Services list displays
- [ ] Reviews section visible
- [ ] Click "Write a Review" → submit test review
- [ ] Review appears immediately
- [ ] AI Chat widget visible (bottom-right, blue)
- [ ] Click AI Chat → send message
- [ ] Get AI response
- [ ] Booking widget visible
- [ ] Submit test booking
- [ ] Check `/dashboard/bookings` → appears

### Listing Submission Tests
- [ ] Click "List Your Business" on homepage
- [ ] Public form loads (no login required)
- [ ] Fill out form
- [ ] Submit
- [ ] Success message appears
- [ ] Check `/dashboard/listings` → appears

### Dashboard Tests
- [ ] Login to `/dashboard`
- [ ] Overview loads
- [ ] Click "Listings" → list displays
- [ ] Click "Add Listing" → form loads
- [ ] Click "Import" → CSV uploader loads
- [ ] Click "Leads & CRM" → pipeline loads
- [ ] Switch between List/Kanban views
- [ ] Add note to lead
- [ ] Change lead stage
- [ ] Click "Bookings" → appointments load
- [ ] Click "Support" → inbox loads
- [ ] Click "Agency" → settings load
- [ ] Click "Plans" → pricing editor loads

### White-Label Tests
- [ ] Go to `/dashboard/agency`
- [ ] Change primary color
- [ ] Change logo URL
- [ ] Change font family
- [ ] Save → see success message
- [ ] Reload homepage → colors changed

### Pricing Tests
- [ ] Go to `/pricing`
- [ ] Verify Premium shows $29/mo (not $97)
- [ ] Verify Pro shows $97/mo (not $297)
- [ ] Toggle Monthly/Annual → prices update

### Chatwoot Tests (after adding token)
- [ ] Add Chatwoot credentials to Vercel
- [ ] Redeploy
- [ ] Load homepage
- [ ] Chat bubble appears (bottom-right)
- [ ] Click → Chatwoot chat opens
- [ ] Send test message
- [ ] Check Chatwoot dashboard → message appears

---

## 🎯 FEATURE VALIDATION

### Lead Generation Flow
```
[ ] Visitor lands on site
[ ] Sees "Grow My Business" button
[ ] Clicks → AI Sales Agent opens
[ ] Answers questions
[ ] Gets qualified
[ ] Enters email
[ ] Lead saves to CRM
[ ] You receive notification
[ ] You call → Close deal
```

### Business Listing Flow
```
[ ] Business owner finds directory
[ ] Clicks "List Your Business"
[ ] Submits free listing
[ ] Receives claim email
[ ] Claims listing
[ ] Sees premium upsell
[ ] Upgrades to Premium ($29/mo)
[ ] Gets AI chat, booking, etc.
```

### Agency Signup Flow
```
[ ] Agency finds white-label offer
[ ] Signs up for Professional plan ($299/mo)
[ ] Sets their branding
[ ] Sets their prices
[ ] Imports 50 businesses
[ ] Charges $49/mo each = $2,450/mo
[ ] Profit: $2,151/mo
[ ] You get: $299/mo recurring
```

---

## 🚨 COMMON ISSUES & FIXES

### Issue: "Grow My Business" button not showing
**Fix:** Check browser console for errors. Ensure SalesAgent component is imported in layout.tsx

### Issue: AI Chat not responding
**Fix:** Add OPENAI_API_KEY to Vercel env vars. Redeploy.

### Issue: Chatwoot widget not showing
**Fix:** Add NEXT_PUBLIC_CHATWOOT_TOKEN to Vercel env vars. Redeploy.

### Issue: Leads not saving
**Fix:** Check database connection. Run migrate_v14_ai_quiz_leads.ts

### Issue: Booking not working
**Fix:** Run migrate_v12_booking_calendar.ts migration

### Issue: Server error on listing submission
**Fix:** Use /list-your-business (public form) instead of /dashboard/listings/new (requires login)

---

## 📈 PERFORMANCE CHECKLIST

- [ ] Enable Vercel Analytics
- [ ] Enable Vercel Speed Insights
- [ ] Configure Sentry for error tracking
- [ ] Set up database connection pooling
- [ ] Enable CDN for images
- [ ] Compress images
- [ ] Minify CSS/JS
- [ ] Enable HTTP/2
- [ ] Set up caching headers
- [ ] Monitor database query performance

---

## 🔒 SECURITY CHECKLIST

- [ ] All API routes protected
- [ ] SQL injection prevention (using parameterized queries)
- [ ] XSS prevention (React escapes by default)
- [ ] CSRF protection (NextAuth)
- [ ] Rate limiting on API routes
- [ ] Environment variables secured
- [ ] Database credentials rotated
- [ ] SSL/TLS enabled
- [ ] Regular dependency updates
- [ ] Error messages don't leak sensitive info

---

## 📞 LAUNCH DAY CHECKLIST

- [ ] All migrations run successfully
- [ ] All env vars added to Vercel
- [ ] Homepage loads without errors
- [ ] All navigation links work
- [ ] Search works
- [ ] Listings display correctly
- [ ] AI Sales Agent active
- [ ] AI Chat widget active
- [ ] Booking system functional
- [ ] Lead capture working
- [ ] CRM populating with leads
- [ ] Email sending (Resend configured)
- [ ] Chatwoot connected
- [ ] Analytics tracking
- [ ] Error tracking active
- [ ] Mobile responsive tested
- [ ] Cross-browser tested (Chrome, Firefox, Safari, Edge)
- [ ] Performance scores >90
- [ ] SSL certificate valid
- [ ] Custom domain configured
- [ ] Backup strategy in place
- [ ] Monitoring alerts configured

---

## 🎉 POST-Launch

- [ ] Monitor error logs (Sentry)
- [ ] Check analytics (Vercel Analytics)
- [ ] Review captured leads
- [ ] Test customer support flow
- [ ] Gather user feedback
- [ ] Iterate based on usage data
- [ ] Plan next feature releases

---

**Last Updated:** March 2026
**Version:** 2.0 Enterprise
