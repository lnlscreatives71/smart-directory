-- Cold Reactivation: 4-email re-engagement sequence fired 30 days after
-- the cold outreach email 4 for listings that are still unclaimed.
-- Separate table from outreach_campaigns so reactivation analytics stay clean.

CREATE TABLE IF NOT EXISTS cold_reactivation_campaigns (
    id SERIAL PRIMARY KEY,
    listing_id INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    contact_email TEXT NOT NULL,
    contact_name TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    ab_variant CHAR(1),
    email_1_sent_at TIMESTAMPTZ,
    email_2_sent_at TIMESTAMPTZ,
    email_3_sent_at TIMESTAMPTZ,
    email_4_sent_at TIMESTAMPTZ,
    email_1_resend_id TEXT,
    email_2_resend_id TEXT,
    email_3_resend_id TEXT,
    email_4_resend_id TEXT,
    opens INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    last_opened_at TIMESTAMPTZ,
    last_clicked_at TIMESTAMPTZ,
    unsubscribed BOOLEAN DEFAULT FALSE,
    unsubscribed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(listing_id)
);

CREATE INDEX IF NOT EXISTS idx_cold_reactivation_status ON cold_reactivation_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_cold_reactivation_listing_id ON cold_reactivation_campaigns(listing_id);
