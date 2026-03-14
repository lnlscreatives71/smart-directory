import { sql } from '../src/lib/db';

async function seed() {
    console.log('Seeding dummy data for Events, Blogs, News, Jobs, and Bookings...');
    try {
        // Fetch a few listings to attach dummy data to
        const listings = await sql`SELECT id, name FROM listings LIMIT 8;`;

        for (const listing of listings) {
            console.log(`Adding data for: ${listing.name}`);

            // Add 2 Events
            await sql`
                INSERT INTO events (listing_id, title, description, date, time, location)
                VALUES 
                (${listing.id}, 'Spring Open House', 'Join us to explore our new seasonal offerings with complimentary refreshments.', CURRENT_DATE + interval '10 days', '10:00 AM - 2:00 PM', 'Main Lobby'),
                (${listing.id}, 'Weekly Workshop Session', 'Interactive hands-on session focusing on our core services.', CURRENT_DATE + interval '3 days', '6:00 PM - 8:00 PM', 'Meeting Room 1')
            `;

            // Add 1 Blog
            await sql`
                INSERT INTO blogs (listing_id, title, excerpt, content, image_url, published)
                VALUES (${listing.id}, 'Top Strategies from ' || ${listing.name}, 'Discover the best practices and insights from our team of experts.', 'Welcome to our official company blog! We are excited to share our industry knowledge, tips, and updates regarding our upcoming services. Whether you are a regular client or just discovering us for the first time, our goal is to consistently deliver value. Stay tuned as we will be posting more in-depth guides in the near future.', 'https://images.unsplash.com/photo-1542435503-956c469947f6?auto=format&fit=crop&q=80&w=800', true)
            `;

            // Add 1 News Announcement
            await sql`
                INSERT INTO news (listing_id, title, content, image_url)
                VALUES (${listing.id}, ${listing.name} || ' announces expansion plan!', 'We are thrilled to announce that we are expanding our primary services to better serve the community. Over the next quarter, we will be rolling out several new features and extended hours.', null)
            `;

            // Add 1 Job Posting
            await sql`
                INSERT INTO jobs (listing_id, title, description, employment_type, location, salary_range, application_url, active)
                VALUES (${listing.id}, 'Customer Success Specialist', 'We are looking for a dedicated and energetic customer representative to manage our growing portfolio of clients. You will be responsible for onboarding, support, and relationship management.', 'Full-Time', 'Hybrid (In-Office/Remote)', '$50,000 - $65,000/yr', 'https://linkedin.com/jobs', true)
            `;

            // Add 1 Upcoming Booking
            await sql`
                INSERT INTO bookings (listing_id, customer_name, customer_email, customer_phone, service_requested, booking_date, booking_time, notes, status)
                VALUES (${listing.id}, 'Jane Doe', 'jane.doe@example.com', '(555) 123-4567', 'Initial Consultation', CURRENT_DATE + interval '5 days', '09:30', 'Looking forward to learning more about your offerings.', 'pending')
            `;
        }
        
        console.log('Dynamically seeded dummy premium accounts for 8 businesses.');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding premium features data:', err);
        process.exit(1);
    }
}

seed();
