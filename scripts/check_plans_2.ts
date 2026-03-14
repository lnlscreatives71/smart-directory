import { sql } from '../src/lib/db';

async function describePlans() {
    try {
        const res = await sql`SELECT * FROM plans`;
        console.log(res);
    } catch (e) {
        console.error(e);
    }
}
describePlans();
