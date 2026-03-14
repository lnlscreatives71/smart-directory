import { sql } from '../src/lib/db';

async function updatePrice() {
    try {
        await sql`UPDATE plans SET monthly_price = 29, annual_price = 290 WHERE name != 'Free'`;
        console.log("Price updated to $29/mo");
    } catch (e) {
        console.error(e);
    }
}
updatePrice();
