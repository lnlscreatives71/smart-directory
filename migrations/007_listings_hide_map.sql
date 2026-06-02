-- Add hide_map to listings. The biz page builds the Google Maps embed from
-- name + city + state, so some listings resolve to the wrong place. When
-- hide_map is true the Location and Directions section is omitted entirely.

ALTER TABLE listings ADD COLUMN hide_map BOOLEAN DEFAULT FALSE;
