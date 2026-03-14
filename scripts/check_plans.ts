import { sql } from '../src/lib/db';

async function describePlans() {
    try {
        const res = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'plans'`;
        console.log(res);
    } catch (e) {
        console.error(e);
    }
}
describePlans();
