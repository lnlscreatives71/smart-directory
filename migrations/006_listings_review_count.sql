-- Add review_count to listings. /api/crm/contact selects l.review_count
-- so without this column every contact detail page 500s.

ALTER TABLE listings ADD COLUMN review_count INTEGER DEFAULT 0;
