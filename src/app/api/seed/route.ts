import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    await sql`DROP TABLE IF EXISTS outreach_campaigns, leads, reviews, searches, listings, plans CASCADE;`;

    await sql`
      CREATE TABLE plans (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        monthly_price DECIMAL(10, 2) NOT NULL,
        description TEXT,
        limits JSONB DEFAULT '{}'::jsonb
      );
    `;

    await sql`
      CREATE TABLE listings (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT,
        location_city VARCHAR(100) NOT NULL,
        location_state VARCHAR(50) NOT NULL,
        location_region VARCHAR(100) NOT NULL,
        lat DECIMAL(10, 8),
        lng DECIMAL(11, 8),
        services JSONB DEFAULT '[]'::jsonb,
        rating DECIMAL(3, 2) DEFAULT 0.0,
        featured BOOLEAN DEFAULT FALSE,
        claimed BOOLEAN DEFAULT FALSE,
        plan_id INTEGER REFERENCES plans(id),
        feature_flags JSONB DEFAULT '{}'::jsonb,
        contact_email VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE outreach_campaigns (
        id SERIAL PRIMARY KEY,
        listing_id INTEGER REFERENCES listings(id) ON DELETE CASCADE,
        status VARCHAR(50) DEFAULT 'pending',
        email_1_sent_at TIMESTAMP WITH TIME ZONE,
        email_2_sent_at TIMESTAMP WITH TIME ZONE,
        email_3_sent_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE leads (
        id SERIAL PRIMARY KEY,
        listing_id INTEGER REFERENCES listings(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        message TEXT,
        category VARCHAR(100),
        source VARCHAR(50),
        status VARCHAR(50) DEFAULT 'new',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE reviews (
        id SERIAL PRIMARY KEY,
        listing_id INTEGER REFERENCES listings(id) ON DELETE CASCADE,
        author_name VARCHAR(255) NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE searches (
        id SERIAL PRIMARY KEY,
        query TEXT NOT NULL,
        filters JSONB DEFAULT '{}'::jsonb,
        results_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      INSERT INTO plans (name, monthly_price, description, limits) VALUES 
      ('free', 0.00, 'Basic exposure in the directory', '{"images": 1, "categories": 1}'),
      ('premium', 97.00, 'Highlighted listing + AI chat + booking', '{"images": 5, "categories": 3}'),
      ('pro', 297.00, 'Top placement + all features', '{"images": 20, "categories": 10}');
    `;

    const listings = [
      {
        name: 'North Hills Bistro', slug: 'north-hills-bistro', category: 'Restaurants', description: 'Cozy American dining in the heart of North Hills.', city: 'Raleigh', region: 'Triangle', lat: 35.8375, lng: -78.6417, services: ['Dinner', 'Brunch', 'Cocktails'], rating: 4.8, featured: true, plan: 2, contact_email: 'hello@northhillsbistro.com',
        flags: { highlight_on_home: true, priority_ranking: false, ai_chat_widget: true, booking_calendar: true }
      },
      {
        name: 'Durham Downtown Eats', slug: 'durham-downtown-eats', category: 'Restaurants', description: 'Farm-to-table Southern fare.', city: 'Durham', region: 'Triangle', lat: 35.9940, lng: -78.8986, services: ['Lunch', 'Dinner', 'Outdoor Seating'], rating: 4.5, featured: false, plan: 1, contact_email: 'info@durhameats.com',
        flags: { highlight_on_home: false, priority_ranking: false, ai_chat_widget: false, booking_calendar: false }
      },
      {
        name: 'Cary Sushi House', slug: 'cary-sushi-house', category: 'Restaurants', description: 'Premium sushi and Japanese cuisine.', city: 'Cary', region: 'Triangle', lat: 35.7915, lng: -78.7811, services: ['Sushi', 'Takeout', 'Sake'], rating: 4.7, featured: true, plan: 3, contact_email: 'reservations@carysushi.com',
        flags: { highlight_on_home: true, priority_ranking: true, ai_chat_widget: true, booking_calendar: true }
      },
      {
        name: 'Raleigh Glow Med Spa', slug: 'raleigh-glow-med-spa', category: 'Med Spas', description: 'Advanced aesthetics and laser treatments.', city: 'Raleigh', region: 'Triangle', lat: 35.8300, lng: -78.6500, services: ['Botox', 'Laser Hair Removal', 'Facials'], rating: 4.9, featured: true, plan: 3, contact_email: 'glow@raleighglowspa.com',
        flags: { highlight_on_home: true, priority_ranking: true, ai_chat_widget: true, booking_calendar: true }
      },
      {
        name: 'Cary Revive Aesthetics', slug: 'cary-revive-aesthetics', category: 'Med Spas', description: 'Holistic wellness and beauty treatments.', city: 'Cary', region: 'Triangle', lat: 35.7950, lng: -78.7850, services: ['Fillers', 'IV Therapy', 'Massage'], rating: 4.6, featured: false, plan: 2, contact_email: 'hello@caryrevive.com',
        flags: { highlight_on_home: false, priority_ranking: false, ai_chat_widget: true, booking_calendar: true }
      },
      {
        name: 'Triangle HVAC Pros', slug: 'triangle-hvac-pros', category: 'Home Services', description: 'Reliable heating, cooling, and ventilation experts.', city: 'Raleigh', region: 'Triangle', lat: 35.7796, lng: -78.6382, services: ['AC Repair', 'Heating Installation', 'Maintenance'], rating: 4.4, featured: false, plan: 1, contact_email: 'service@trianglehvac.com',
        flags: { highlight_on_home: false, priority_ranking: false, ai_chat_widget: false, booking_calendar: false }
      },
      {
        name: 'Cary Clean Homes', slug: 'cary-clean-homes', category: 'Home Services', description: 'Professional residential cleaning services.', city: 'Cary', region: 'Triangle', lat: 35.7915, lng: -78.7811, services: ['Deep Cleaning', 'Move-in/Move-out', 'Weekly Service'], rating: 4.8, featured: true, plan: 2, contact_email: 'quote@carycleanhomes.com',
        flags: { highlight_on_home: true, priority_ranking: false, ai_chat_widget: true, booking_calendar: false }
      },
      {
        name: 'Triangle Premier Realty', slug: 'triangle-premier-realty', category: 'Real Estate', description: 'Your trusted partner in buying and selling homes in the Triangle.', city: 'Apex', region: 'Triangle', lat: 35.7326, lng: -78.8503, services: ['Buying', 'Selling', 'Property Management'], rating: 5.0, featured: true, plan: 3, contact_email: 'contact@trianglepremierrealty.com',
        flags: { highlight_on_home: true, priority_ranking: true, ai_chat_widget: true, booking_calendar: true, video_section: true }
      },
      {
        name: 'Raleigh Strength Club', slug: 'raleigh-strength-club', category: 'Gyms & Fitness', description: 'Elite strength training and conditioning facility.', city: 'Raleigh', region: 'Triangle', lat: 35.8000, lng: -78.6400, services: ['Personal Training', 'Powerlifting', 'Classes'], rating: 4.9, featured: false, plan: 1, contact_email: 'info@raleighstrength.com',
        flags: { highlight_on_home: false, priority_ranking: false, ai_chat_widget: false, booking_calendar: false }
      },
      {
        name: 'Durham Digital Marketing', slug: 'durham-digital-marketing', category: 'Professional Services', description: 'SEO, PPC, and web design experts for local businesses.', city: 'Durham', region: 'Triangle', lat: 35.9940, lng: -78.8986, services: ['SEO', 'Web Design', 'Ads'], rating: 4.7, featured: true, plan: 2, contact_email: 'growth@durhamdigital.com',
        flags: { highlight_on_home: true, priority_ranking: false, ai_chat_widget: true, booking_calendar: false }
      },
      {
        name: 'Apex Family Dental', slug: 'apex-family-dental', category: 'Health', description: 'Comprehensive dental care for the whole family.', city: 'Apex', region: 'Triangle', lat: 35.7326, lng: -78.8503, services: ['Checkups', 'Braces', 'Whitening'], rating: 4.6, featured: false, plan: 1, contact_email: 'smile@apexfamilydental.com',
        flags: { highlight_on_home: false, priority_ranking: false, ai_chat_widget: false, booking_calendar: false }
      },
      {
        name: 'Chapel Hill Elite Tutors', slug: 'chapel-hill-elite-tutors', category: 'Education', description: 'Top-tier academic tutoring and test prep.', city: 'Chapel Hill', region: 'Triangle', lat: 35.9132, lng: -79.0558, services: ['SAT/ACT Prep', 'Math Tutoring', 'College Admissions'], rating: 4.9, featured: true, plan: 3, contact_email: 'learn@chapelhillettutors.com',
        flags: { highlight_on_home: true, priority_ranking: true, ai_chat_widget: true, booking_calendar: true, extra_images: true }
      }
    ];

    for (const b of listings) {
      const res = await sql`
        INSERT INTO listings (name, slug, category, description, location_city, location_state, location_region, lat, lng, services, rating, featured, plan_id, feature_flags, contact_email)
        VALUES (${b.name}, ${b.slug}, ${b.category}, ${b.description}, ${b.city}, 'NC', ${b.region}, ${b.lat}, ${b.lng}, ${JSON.stringify(b.services)}, ${b.rating}, ${b.featured}, ${b.plan}, ${JSON.stringify(b.flags)}, ${b.contact_email})
        RETURNING id;
      `;
      // Insert into outreach campaign CRM
      await sql`
        INSERT INTO outreach_campaigns (listing_id, status)
        VALUES (${res[0].id}, 'pending');
      `;
    }

    return NextResponse.json({ success: true, message: 'Database seeded successfully with 12 listings' });

  } catch (error: any) {
    console.error('Seeding error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
