-- Store Google Places photo_reference separately from image_url so
-- the proxy route can rebuild signed URLs on demand. Keeps API keys
-- server-side and survives key rotation / referrer-restriction changes.

ALTER TABLE listings ADD COLUMN IF NOT EXISTS google_photo_ref TEXT;

-- Backfill: extract photo_reference= param from any existing Google Places URLs.
UPDATE listings
SET google_photo_ref = SUBSTRING(image_url FROM 'photo_reference=([^&]+)')
WHERE image_url LIKE '%maps.googleapis.com%photo_reference=%'
  AND google_photo_ref IS NULL;

-- Rewrite those image_urls to point at our proxy so cards work today
-- without a refresh-photos run.
UPDATE listings
SET image_url = '/api/photo?ref=' || google_photo_ref
WHERE google_photo_ref IS NOT NULL
  AND image_url LIKE '%maps.googleapis.com%';
