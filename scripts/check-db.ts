import 'dotenv/config';
import { sql } from '../src/lib/db';

async function check() {
    console.log('Testing database connection...');
    try {
        // Test connection
        const result = await sql`SELECT 1 as connected`;
        console.log('✅ Database connected:', result[0]);

        // Check if users table exists
        const tableCheck = await sql`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'users'
            ) as users_table_exists
        `;
        console.log('Users table exists:', tableCheck[0].users_table_exists);

        if (tableCheck[0].users_table_exists === true) {
            // Count users
            const count = await sql`SELECT COUNT(*) as count FROM users`;
            console.log('Total users:', count[0].count);

            // List users
            const users = await sql`SELECT id, name, email, role FROM users LIMIT 10`;
            console.log('Users:', users);
        } else {
            console.log('⚠️  Users table does not exist. Run migration to create it.');
        }
    } catch (err) {
        console.error('❌ Database error:', err);
    }
    process.exit(0);
}

check();
