/**
 * Database migration runner
 * Usage: npm run migrate
 *
 * Reads all .sql files from /migrations/, tracks applied migrations in a
 * `_migrations` table, and runs only pending ones in order.
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
    console.error('❌  DATABASE_URL not set in .env.local');
    process.exit(1);
}

const sql = neon(DATABASE_URL);

async function run() {
    // Create migrations tracking table
    await sql.unsafe(`
        CREATE TABLE IF NOT EXISTS _migrations (
            id SERIAL PRIMARY KEY,
            filename VARCHAR(255) NOT NULL UNIQUE,
            applied_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        )
    `);

    const applied = await sql`SELECT filename FROM _migrations ORDER BY filename`;
    const appliedSet = new Set(applied.map((r: any) => r.filename as string));

    const migrationsDir = join(process.cwd(), 'migrations');
    const files = readdirSync(migrationsDir)
        .filter(f => f.endsWith('.sql'))
        .sort();

    const pending = files.filter(f => !appliedSet.has(f));

    if (pending.length === 0) {
        console.log('✅  All migrations applied. Nothing to do.');
        return;
    }

    console.log(`\n📦  Running ${pending.length} pending migration(s)...\n`);

    for (const file of pending) {
        console.log(`  ▶  ${file}`);
        const content = readFileSync(join(migrationsDir, file), 'utf8');

        // Split on semicolons, skip blank lines and comment-only blocks
        const statements = content
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.replace(/--[^\n]*/g, '').trim().startsWith('/*') && s.replace(/--[^\n]*/g, '').trim().length > 0);

        for (const stmt of statements) {
            await sql.unsafe(stmt);
        }

        await sql`INSERT INTO _migrations (filename) VALUES (${file})`;
        console.log(`  ✅  ${file}`);
    }

    console.log('\n🎉  Migrations complete!\n');
    process.exit(0);
}

run().catch(err => {
    console.error('❌  Migration failed:', err.message || err);
    process.exit(1);
});
