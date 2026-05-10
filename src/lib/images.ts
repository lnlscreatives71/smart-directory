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

/**
 * Resolve the best image URL for a listing.
 * - Prefer image_url when it's a real absolute URL (SMB uploads, manual imports).
 *   Skip Google Maps URLs — those require live API calls per render and were
 *   burning ~$125/mo before we cut them off.
 * - Otherwise fall back to a category-appropriate Unsplash image.
 *
 * google_photo_ref is intentionally ignored. The column stays for historical
 * reference but Google Photos are no longer fetched at runtime.
 */
export function getListingImageUrl(listing: Pick<Listing, 'image_url' | 'category'> & { google_photo_ref?: string | null }, width = 800): string {
    const url = listing.image_url;
    if (url && /^https?:\/\//.test(url) && !url.includes('maps.googleapis.com')) {
        return url;
    }
    return categoryFallback(listing.category, width);
}
