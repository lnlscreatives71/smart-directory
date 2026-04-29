import { Listing } from './types';

const CATEGORY_IMAGE_IDS: Record<string, string> = {
    restaurant: 'photo-1517248135467-4c7edcad34c4',
    dining: 'photo-1517248135467-4c7edcad34c4',
    food: 'photo-1517248135467-4c7edcad34c4',
    spa: 'photo-1600334089648-b0d9d3028eb2',
    wellness: 'photo-1600334089648-b0d9d3028eb2',
    beauty: 'photo-1600334089648-b0d9d3028eb2',
    health: 'photo-1576091160399-112ba8d25d1d',
    medical: 'photo-1576091160399-112ba8d25d1d',
    dental: 'photo-1576091160399-112ba8d25d1d',
    gym: 'photo-1534438327276-14e5300c3a48',
    fitness: 'photo-1534438327276-14e5300c3a48',
    'real estate': 'photo-1560518883-ce09059eeffa',
    hvac: 'photo-1581094794329-c8112a89af12',
    plumbing: 'photo-1581244277943-fe4a8c327939',
    services: 'photo-1454165804606-c3d57bc86b40',
    retail: 'photo-1441984904996-e0b6ba687e04',
    shop: 'photo-1441984904996-e0b6ba687e04',
};

const DEFAULT_IMAGE_ID = 'photo-1497366216548-37526070297c';

function categoryFallback(category: string | undefined, w = 800): string {
    const key = (category || '').toLowerCase().trim();
    const id = CATEGORY_IMAGE_IDS[key]
        || Object.entries(CATEGORY_IMAGE_IDS).find(([k]) => key.includes(k))?.[1]
        || DEFAULT_IMAGE_ID;
    return `https://images.unsplash.com/${id}?auto=format&fit=crop&q=80&w=${w}`;
}

// Public Maps key — exposed to client because images must be loadable in the browser.
// next/image optimizer caches the result for 30 days, which protects us against
// key rotation breakage between caches.
const MAPS_KEY = process.env.NEXT_PUBLIC_MAPS_API_KEY || '';

/**
 * Resolve the best image URL for a listing.
 * - Prefer a direct Google Places photo URL built from google_photo_ref.
 *   next/image proxies and caches it, so a key change won't immediately
 *   nuke every cached image.
 * - Fall back to image_url if it's an absolute URL.
 * - Otherwise return a category-appropriate Unsplash image.
 */
export function getListingImageUrl(listing: Pick<Listing, 'image_url' | 'category'> & { google_photo_ref?: string | null }, width = 800): string {
    if (listing.google_photo_ref && MAPS_KEY) {
        return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${width}&photo_reference=${listing.google_photo_ref}&key=${MAPS_KEY}`;
    }
    // Stale corrupted /api/photo?ref=... URLs from migration 004 — skip them.
    if (listing.image_url?.startsWith('/api/photo')) {
        return categoryFallback(listing.category, width);
    }
    if (listing.image_url && /^https?:\/\//.test(listing.image_url)) {
        return listing.image_url;
    }
    return categoryFallback(listing.category, width);
}
