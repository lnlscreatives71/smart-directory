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
    features?: string[];
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
    street_address?: string;
    lat: number;
    lng: number;
    services: string[];
    rating: number;
    featured: boolean;
    claimed: boolean;
    plan_id: number;
    feature_flags: FeatureFlags;
    contact_email?: string;
    contact_name?: string;
    phone?: string;
    website?: string;
    image_url?: string;
    business_hours?: BusinessHour[];
    social_media?: SocialMediaLinks;
    contact_form_enabled?: boolean;
    created_at: Date;
    updated_at: Date;

    custom_fields?: Record<string, string>;

    // Joined fields returned by API
    plan_name?: string;
    plan_price?: number;
}

export interface BusinessHour {
    day: string;
    open: string;
    close: string;
    isClosed: boolean;
}

export interface SocialMediaLinks {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
    [key: string]: string | undefined;
}

export interface OutreachCampaign {
    id: number;
    listing_id: number;
    status: 'pending' | 'email_1_sent' | 'email_2_sent' | 'email_3_sent' | 'email_4_sent' | 'completed';
    pipeline_stage: 'prospect' | 'contacted' | 'engaged' | 'claimed' | 'upgraded' | 'lost';
    ab_variant: 'A' | 'B' | null;
    email_1_sent_at: Date | null;
    email_2_sent_at: Date | null;
    email_3_sent_at: Date | null;
    email_4_sent_at: Date | null;
    created_at: Date;
    updated_at: Date;

    // joined fields
    listing_name?: string;
    listing_email?: string;
    claimed?: boolean;
}

export interface ContactNote {
    id: number;
    campaign_id: number;
    note_type: 'manual' | 'call' | 'email' | 'system';
    content: string;
    created_at: Date;
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

