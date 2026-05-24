-- Add review_count to listings.
-- /api/crm/contact selects l.review_count; without it the endpoint 500s
-- and every contact shows "Contact not found."

ALTER TABLE listings ADD COLUMN review_count INTEGER DEFAULT 0;
