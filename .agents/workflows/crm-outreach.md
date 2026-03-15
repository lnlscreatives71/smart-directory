---
description: How to run and manage the CRM automated outreach workflow for The Triangle Hub
---

## Overview
This workflow triggers a 4-email outreach sequence that automatically moves business prospects through a sales funnel: from introduction → premium upsell → urgency → final call.

Each contact is randomly assigned **Variant A** or **Variant B** at the time of Email 1 and stays on that variant for the entire sequence.

---

## Email Sequence

| Step | Trigger | Variant A Subject | Variant B Subject |
|------|---------|-------------------|-------------------|
| Email 1 | Business imported w/ email | "{name} is live on The Triangle Hub!" | "Your neighbors are already finding you" |
| Wait | 3 days | — | — |
| Email 2 | 3 days after Email 1 | "Upgrade {name} and get 4x more leads" | "What would 10 more customers a month mean?" |
| Wait | 4 days | — | — |
| Email 3 | 7 days after Email 1, still unclaimed | "Action needed: Confirm your {name} listing" | "Other local businesses just upgraded" |
| Wait | 3 days | — | — |
| Email 4 | 10 days after Email 1, still unclaimed | "Last chance: Don't miss your spot" | "We're closing your file soon" |

---

## How to Trigger

### Option 1: Automatic (Production)
Vercel runs the cron daily at **1pm UTC / 9am ET** via the config in `vercel.json`.
No action needed — it runs automatically every day.

### Option 2: Manual from Admin Dashboard
1. Go to: `https://thetrianglehub.online/dashboard/leads`
2. Click **"Standard Sync"** — processes the queue with full timing delays
3. Click **"Force Push Queue"** — bypasses all wait periods (useful for testing)

### Option 3: Direct API Call
```bash
# Standard
curl -X POST https://thetrianglehub.online/api/cron/outreach

# Force-run (bypasses wait periods)
curl -X POST https://thetrianglehub.online/api/cron/outreach \
  -H "Content-Type: application/json" \
  -d '{"forceRun": true}'
```

---

## Adding Businesses to the Queue
Businesses are automatically added to `outreach_campaigns` when:
- A business is **imported via CSV** (if they have a `contact_email`)
- A business is **manually added** through the dashboard

---

## Running DB Migrations (if needed)
```bash
# v7 - email_4_sent_at column
npx tsx --env-file=.env.local scripts/migrate_v7_email4.ts

# v8 - ab_variant column
npx tsx --env-file=.env.local scripts/migrate_v8_ab_variant.ts
```

---

## Required Vercel Environment Variables
Add these in **Vercel → Settings → Environment Variables → Production**:

| Key | Value |
|-----|-------|
| `RESEND_API_KEY` | `re_[REDACTED - GET YOUR OWN KEY FROM resend.com]` |
| `RESEND_FROM_EMAIL` | `directory@mail.thetrianglehub.online` |
| `NEXTAUTH_URL` | `https://thetrianglehub.online` |
| `NEXT_PUBLIC_APP_URL` | `https://thetrianglehub.online` |
| `LICENSE_KEY` | `WL-TRIANGLE-VIP-001` |

---

## Monitoring Results
- **Resend Dashboard** → [resend.com/emails](https://resend.com/emails) — live delivery/open stats
- **Admin CRM Page** → `/dashboard/leads` — pipeline status per prospect
- **Vercel Logs** → Deployments → Runtime Logs — cron execution output
