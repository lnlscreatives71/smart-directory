-- Migration 004 wrote '/api/photo?ref=' || google_photo_ref into image_url
-- without URL-encoding. Any photo_reference containing '+', '/', '=', or '%'
-- got corrupted (e.g. '+' decoded to space at request time → broken proxy
-- request → Unsplash fallback). Components now derive the proxy URL from
-- google_photo_ref directly via getListingImageUrl(), so we just clear
-- the corrupted relative URLs and let the helper take over.

UPDATE listings
SET image_url = NULL
WHERE google_photo_ref IS NOT NULL
  AND image_url LIKE '/api/photo%';
