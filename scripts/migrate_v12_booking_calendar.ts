import { sql } from '../src/lib/db.js';

async function main() {
  console.log('Creating booking calendar tables...');

  try {
    // Business availability/schedules
    await sql`
      CREATE TABLE IF NOT EXISTS business_schedules (
        id SERIAL PRIMARY KEY,
        listing_id INTEGER REFERENCES listings(id) ON DELETE CASCADE,
        day_of_week INTEGER NOT NULL, -- 0=Sunday, 1=Monday, etc.
        open_time TIME NOT NULL,
        close_time TIME NOT NULL,
        is_open BOOLEAN DEFAULT true,
        break_start TIME,
        break_end TIME,
        buffer_minutes INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(listing_id, day_of_week)
      )
    `;

    // Service offerings with duration and pricing
    await sql`
      CREATE TABLE IF NOT EXISTS business_services (
        id SERIAL PRIMARY KEY,
        listing_id INTEGER REFERENCES listings(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        duration_minutes INTEGER NOT NULL DEFAULT 60,
        price DECIMAL(10, 2),
        category VARCHAR(100),
        active BOOLEAN DEFAULT true,
        booking_type VARCHAR(50) DEFAULT 'in-person', -- in-person, virtual, phone
        locations_allowed JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Appointments/bookings
    await sql`
      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        listing_id INTEGER REFERENCES listings(id) ON DELETE CASCADE,
        service_id INTEGER REFERENCES business_services(id),
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(50),
        appointment_date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, completed, cancelled, no-show
        notes TEXT,
        internal_notes TEXT,
        timezone VARCHAR(50) DEFAULT 'America/New_York',
        booking_type VARCHAR(50) DEFAULT 'in-person',
        location VARCHAR(255),
        meeting_link TEXT,
        reminder_sent BOOLEAN DEFAULT false,
        confirmation_sent BOOLEAN DEFAULT false,
        payment_status VARCHAR(50) DEFAULT 'unpaid',
        payment_amount DECIMAL(10, 2),
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Time-off/blocked slots (vacations, holidays, etc.)
    await sql`
      CREATE TABLE IF NOT EXISTS business_time_off (
        id SERIAL PRIMARY KEY,
        listing_id INTEGER REFERENCES listings(id) ON DELETE CASCADE,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        reason VARCHAR(255),
        all_day BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Booking intake questions (customizable per business)
    await sql`
      CREATE TABLE IF NOT EXISTS booking_questions (
        id SERIAL PRIMARY KEY,
        listing_id INTEGER REFERENCES listings(id) ON DELETE CASCADE,
        question_text TEXT NOT NULL,
        question_type VARCHAR(50) DEFAULT 'text', -- text, select, radio, checkbox, date
        options JSONB, -- for select/radio options
        required BOOLEAN DEFAULT false,
        order_index INTEGER DEFAULT 0,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Booking responses
    await sql`
      CREATE TABLE IF NOT EXISTS booking_responses (
        id SERIAL PRIMARY KEY,
        appointment_id INTEGER REFERENCES appointments(id) ON DELETE CASCADE,
        question_id INTEGER REFERENCES booking_questions(id) ON DELETE CASCADE,
        answer_text TEXT,
        answer_value JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create indexes for performance
    await sql`
      CREATE INDEX IF NOT EXISTS idx_appointments_listing ON appointments(listing_id);
      CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
      CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
      CREATE INDEX IF NOT EXISTS idx_schedules_listing ON business_schedules(listing_id);
      CREATE INDEX IF NOT EXISTS idx_services_listing ON business_services(listing_id);
      CREATE INDEX IF NOT EXISTS idx_time_off_listing ON business_time_off(listing_id);
      CREATE INDEX IF NOT EXISTS idx_questions_listing ON booking_questions(listing_id);
    `;

    console.log('✅ Successfully created booking calendar tables:');
    console.log('  - business_schedules (weekly availability + buffers)');
    console.log('  - business_services (service offerings with booking types)');
    console.log('  - appointments (bookings with metadata)');
    console.log('  - business_time_off (blocked dates)');
    console.log('  - booking_questions (custom intake forms)');
    console.log('  - booking_responses (customer answers)');
    console.log('  - Created performance indexes');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

main();
