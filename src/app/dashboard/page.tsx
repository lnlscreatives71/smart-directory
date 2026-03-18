import { sql } from '@/lib/db';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export default async function DashboardPage() {
    let listingsCount = 0;
    let leadsCount = 0;
    let mrr = 0;

    try {
        const listRes = await sql`SELECT COUNT(*) FROM listings`;
        listingsCount = parseInt(listRes[0].count);

        const leadsRes = await sql`SELECT COUNT(*) FROM leads`;
        leadsCount = parseInt(leadsRes[0].count);

        // Naive MRR calc from plans
        const mrrRes = await sql`
      SELECT SUM(p.monthly_price) as mrr
      FROM listings l
      JOIN plans p ON l.plan_id = p.id
    `;
        mrr = parseFloat(mrrRes[0].mrr) || 0;
    } catch (err) {
        console.error('Admin DB error:', err);
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm shadow-primary-500/5">
                    <h3 className="text-gray-500 text-sm font-medium mb-2">Total Listings</h3>
                    <p className="text-3xl font-bold">{listingsCount}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm shadow-primary-500/5">
                    <h3 className="text-gray-500 text-sm font-medium mb-2">Total Leads Generated</h3>
                    <p className="text-3xl font-bold">{leadsCount}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm shadow-primary-500/5 relative overflow-hidden">
                    <h3 className="text-gray-500 text-sm font-medium mb-2">Premium MRR</h3>
                    <p className="text-3xl font-bold text-secondary-600">${mrr.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <ArrowUpRight size={64} className="absolute right-[-10px] bottom-[-10px] text-secondary-500/10" />
                </div>
            </div>

            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Quick Actions</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/dashboard/listings/new" className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition group">
                    <h3 className="text-lg font-bold group-hover:text-primary-600 mb-1">Create New Listing &rarr;</h3>
                    <p className="text-gray-500 text-sm">Add a new business profile to the directory.</p>
                </Link>
                <Link href="/dashboard/listings" className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition group">
                    <h3 className="text-lg font-bold group-hover:text-primary-600 mb-1">Manage Listings &rarr;</h3>
                    <p className="text-gray-500 text-sm">Search, filter, edit feature flags, and update plans.</p>
                </Link>
            </div>
        </div>
    );
}
