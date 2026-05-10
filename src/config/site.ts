// Per-deploy defaults. Every value can be overridden per Vercel project via
// env vars (NEXT_PUBLIC_*) so a fresh white-label deploy never shows Triangle
// Hub branding. The DB layer (agency_settings via getSiteSettings) further
// overrides a subset at runtime when admins change them in /dashboard/settings.

const env = (key: string, fallback: string) =>
    (process.env[key] && process.env[key]!.trim()) || fallback;

const phone = env('NEXT_PUBLIC_CONTACT_PHONE', '(350) 777-2961');

export const siteConfig = {
    name: env('NEXT_PUBLIC_SITE_NAME', 'The Triangle Hub'),
    shortName: env('NEXT_PUBLIC_SITE_SHORT_NAME', 'TriangleHub'),
    description: env(
        'NEXT_PUBLIC_SITE_DESCRIPTION',
        'Discover and support local businesses in Raleigh, Durham, and Cary, NC.'
    ),
    url: env('NEXT_PUBLIC_SITE_URL', 'https://thetrianglehub.online'),
    logoUrl: env('NEXT_PUBLIC_LOGO_URL', '/triangle-hub-logo-dark.png'),
    contact: {
        email: env('NEXT_PUBLIC_CONTACT_EMAIL', 'directory@thetrianglehub.online'),
        phone,
        phoneRaw: phone.replace(/\D/g, ''),
        address: env('NEXT_PUBLIC_CONTACT_ADDRESS', 'Raleigh, NC 27601'),
    },
    seo: {
        title: env(
            'NEXT_PUBLIC_SEO_TITLE',
            'The Triangle Hub | Raleigh, Durham & Cary Business Directory'
        ),
        description: env(
            'NEXT_PUBLIC_SEO_DESCRIPTION',
            'The premier local business directory for the Triangle region.'
        ),
    },
    hero: {
        headlineParts: env(
            'NEXT_PUBLIC_HERO_HEADLINE',
            'Find Local Businesses You Can |Trust'
        ).split('|'),
        subhead: env(
            'NEXT_PUBLIC_HERO_SUBHEAD',
            'Search by name, category, or keyword — and support the businesses that make your community thrive.'
        ),
        bannerTitle: env('NEXT_PUBLIC_HERO_BANNER_TITLE', 'Local Skyline'),
        imageUrl: env('NEXT_PUBLIC_HERO_IMAGE_URL', '/trianglehubcityimage.png'),
    },
    locations: {
        primaryRegion: env('NEXT_PUBLIC_PRIMARY_REGION', 'the Triangle'),
        defaultState: env('NEXT_PUBLIC_DEFAULT_STATE', 'NC'),
        defaultRegion: env('NEXT_PUBLIC_DEFAULT_REGION', 'Triangle'),
        filterCities: env(
            'NEXT_PUBLIC_FILTER_CITIES',
            'Raleigh,Durham,Cary,Chapel Hill'
        )
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
    },
    links: {
        facebook: env('NEXT_PUBLIC_FACEBOOK_URL', '#'),
        instagram: env('NEXT_PUBLIC_INSTAGRAM_URL', '#'),
        twitter: env('NEXT_PUBLIC_TWITTER_URL', '#'),
    },
};

export type SiteConfig = typeof siteConfig;
