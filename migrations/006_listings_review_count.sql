-- Add review_count + social_media to listings if missing.
-- Both are referenced by /api/crm/contact; if either is missing, the
-- contact detail endpoint 500s and every contact shows "Contact not found."

ALTER TABLE listings ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS social_media JSONB DEFAULT '{}';
