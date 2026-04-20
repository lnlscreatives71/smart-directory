import { unstable_cache } from 'next/cache';
import { sql } from '@/lib/db';
import { siteConfig as defaultConfig } from '@/config/site';

export const SITE_SETTINGS_CACHE_TAG = 'site-settings';

async function fetchSiteSettings() {
    try {
        const res = await sql`SELECT * FROM agency_settings WHERE id = 1 LIMIT 1`;
        if (res && res.length > 0) {
            const dbSettings = res[0] as any;
            return {
                ...defaultConfig,
                name: dbSettings.site_name,
                description: dbSettings.site_description,
                hero: {
                    ...defaultConfig.hero,
                    headlineParts: [dbSettings.hero_headline, ""],
                    subhead: dbSettings.hero_subhead,
                },
                contact: {
                    ...defaultConfig.contact,
                    email: dbSettings.contact_email,
                    phone: dbSettings.contact_phone,
                    phoneRaw: dbSettings.contact_phone.replace(/\\D/g, ''),
                },
                locations: {
                    ...defaultConfig.locations,
                    primaryRegion: dbSettings.location_region,
                },
                colors: {
                    primary: dbSettings.primary_color,
                    secondary: dbSettings.secondary_color,
                }
            };
        }
    } catch (e) {
        console.error("Failed to fetch agency settings from DB", e);
    }

    return defaultConfig;
}

export const getSiteSettings = unstable_cache(
    fetchSiteSettings,
    ['site-settings-v1'],
    { revalidate: 3600, tags: [SITE_SETTINGS_CACHE_TAG] }
);
