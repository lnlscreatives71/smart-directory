export const siteConfig = {
    name: "Triangle Local Hub",
    shortName: "TriangleHub",
    description: "Discover and support local businesses in Raleigh, Durham, and Cary, NC.",
    url: "https://trianglelocalhub.com",
    contact: {
        email: "support@trianglelocalhub.com",
        phone: "(919) 555-0100",
        phoneRaw: "9195550100",
        address: "Raleigh, NC 27601",
    },
    seo: {
        title: "Triangle Local Hub | Raleigh, Durham & Cary Business Directory",
        description: "The premier local business directory for the Triangle region (Raleigh, Durham, Cary, NC). Discover trusted local services and businesses.",
    },
    hero: {
        headlineParts: ["Find Local Businesses You Can ", "Trust"],
        subhead: "Search by name, category, or keyword — and support the businesses that make your community thrive.",
        bannerTitle: "Triangle Regional Skyline"
    },
    locations: {
        primaryRegion: "the Triangle",
        defaultState: "NC",
        defaultRegion: "Triangle",
        filterCities: ['Raleigh', 'Durham', 'Cary', 'Chapel Hill']
    },
    links: {
        facebook: "#",
        instagram: "#",
        twitter: "#"
    }
};

export type SiteConfig = typeof siteConfig;
