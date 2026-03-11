export interface Plan {
    id: number;
    name: string;
    monthly_price: number;
    description: string;
    limits: any;
}

export interface FeatureFlags {
    highlight_on_home?: boolean;
    priority_ranking?: boolean;
    ai_chat_widget?: boolean;
    booking_calendar?: boolean;
    extra_images?: boolean;
    video_section?: boolean;
    [key: string]: boolean | undefined;
}

export interface Listing {
    id: number;
    name: string;
    slug: string;
    category: string;
    description: string;
    location_city: string;
    location_state: string;
    location_region: string;
    lat: number;
    lng: number;
    services: string[];
    rating: number;
    featured: boolean;
    claimed: boolean;
    plan_id: number;
    feature_flags: FeatureFlags;
    created_at: Date;
    updated_at: Date;

    // Joined fields returned by API
    plan_name?: string;
    plan_price?: number;
}
