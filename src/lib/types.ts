export interface Plan {
    id: number;
    name: string;
    monthly_price: number;
    annual_price: number;
    description: string;
    limits: {
        images?: number;
        categories?: number;
        [key: string]: number | undefined;
    };
    active: boolean;
    is_default: boolean;
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
    image_url?: string;
    created_at: Date;
    updated_at: Date;

    // Joined fields returned by API
    plan_name?: string;
    plan_price?: number;
    contact_email?: string;
}

export interface OutreachCampaign {
    id: number;
    listing_id: number;
    status: 'pending' | 'email_1_sent' | 'email_2_sent' | 'email_3_sent' | 'completed';
    email_1_sent_at: Date | null;
    email_2_sent_at: Date | null;
    email_3_sent_at: Date | null;
    created_at: Date;
    updated_at: Date;

    // joined fields
    listing_name?: string;
    listing_email?: string;
    claimed?: boolean;
}

export interface Event {
    id: number;
    listing_id: number;
    title: string;
    description: string;
    date: Date;
    time: string;
    location: string;
    created_at: Date;
    updated_at: Date;
}

export interface Blog {
    id: number;
    listing_id: number;
    title: string;
    excerpt: string;
    content: string;
    image_url: string;
    published: boolean;
    created_at: Date;
    updated_at: Date;
    listing_name?: string;
}

export interface News {
    id: number;
    listing_id: number;
    title: string;
    content: string;
    image_url?: string;
    created_at: Date;
    updated_at: Date;
    listing_name?: string;
}

export interface Job {
    id: number;
    listing_id: number;
    title: string;
    description: string;
    employment_type: string;
    location?: string;
    salary_range?: string;
    application_url?: string;
    active: boolean;
    created_at: Date;
    updated_at: Date;
    listing_name?: string;
}

export interface Booking {
    id: number;
    listing_id: number;
    customer_name: string;
    customer_email: string;
    customer_phone?: string;
    service_requested?: string;
    booking_date: Date;
    booking_time: string;
    status: string;
    notes?: string;
    created_at: Date;
    updated_at: Date;
    listing_name?: string;
}

