/**
 * /api/migrate — Run pending DB migrations from the admin dashboard.
 * Admin-only. Safe to run multiple times (idempotent).
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { sql } from '@/lib/db';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return runMigrations();
}

// GET so it can also be triggered from the setup page before login exists
export async function GET(req: NextRequest) {
    // During first-time setup, no admin exists yet — allow if no users in DB
    const session = await getServerSession(authOptions);
    if (!session) {
        const users = await sql`SELECT COUNT(*) as count FROM users LIMIT 1`.catch(() => [{ count: '1' }]);
        const count = parseInt((users[0] as any).count, 10);
        if (count > 0) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        // No users = first-time setup, allow
    }
    return runMigrations();
}

// Neon v1 requires sql.query(...) for raw SQL strings; the bare sql(...) form
// was removed in favour of the template-tag-only API.
const rawSql = (sql as unknown as { query: (query: string, params?: unknown[]) => Promise<unknown> }).query.bind(sql);

async function runMigrations() {
    const results: { file: string; status: 'applied' | 'skipped' | 'error'; error?: string }[] = [];

    try {
        await rawSql(`
            CREATE TABLE IF NOT EXISTS _migrations (
                id SERIAL PRIMARY KEY,
                filename VARCHAR(255) NOT NULL UNIQUE,
                applied_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            )
        `);

        const applied = await sql`SELECT filename FROM _migrations ORDER BY filename`;
        const appliedSet = new Set(applied.map((r: any) => r.filename as string));

        const migrationsDir = join(process.cwd(), 'migrations');
        let files: string[] = [];
        try {
            files = readdirSync(migrationsDir)
                .filter((f: string) => f.endsWith('.sql'))
                .sort();
        } catch {
            return NextResponse.json({ error: 'migrations/ directory not found on server' }, { status: 500 });
        }

        for (const file of files) {
            if (appliedSet.has(file)) {
                results.push({ file, status: 'skipped' });
                continue;
            }

            try {
                const content = readFileSync(join(migrationsDir, file), 'utf8');
                const statements = content
                    .split(';')
                    .map((s: string) => s.trim())
                    .filter((s: string) => s.replace(/--[^\n]*/g, '').trim().length > 0);

                for (const stmt of statements) {
                    await rawSql(stmt);
                }

                await sql`INSERT INTO _migrations (filename) VALUES (${file})`;
                results.push({ file, status: 'applied' });
            } catch (err: any) {
                results.push({ file, status: 'error', error: err.message });
            }
        }

        const applied_count = results.filter(r => r.status === 'applied').length;
        const skipped_count = results.filter(r => r.status === 'skipped').length;
        const error_count = results.filter(r => r.status === 'error').length;

        return NextResponse.json({
            success: error_count === 0,
            summary: `${applied_count} applied, ${skipped_count} already up to date, ${error_count} errors`,
            results,
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
