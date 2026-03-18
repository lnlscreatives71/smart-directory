import { sql } from '@/lib/db';
import { notFound } from 'next/navigation';
import ListingForm from '@/components/ListingForm';

export default async function EditListingPage({ params }: { params: { id: string } | Promise<{ id: string }> }) {
    // SSR fetch for initial data
    let initialData = null;
    const { id } = await params;
    try {
        const res = await sql`SELECT * FROM listings WHERE id = ${id}`;
        if (res.length > 0) {
            initialData = res[0];
        } else {
            notFound();
        }
    } catch (e) {
        console.error(e);
        return <div>Database Error</div>;
    }

    const funnelStatus = initialData?.funnel_status as string | null;
    const funnelStep = initialData?.funnel_step as number | null;

    const funnelLabels: Record<string, { label: string; color: string }> = {
        premium_upgrade:    { label: 'Premium Upgrade',    color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
        saas_push:          { label: 'SAAS Push',          color: 'bg-violet-500/20 text-violet-300 border-violet-500/30' },
        marketing_services: { label: 'Marketing Services', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
        completed:          { label: 'Completed',          color: 'bg-green-500/20 text-green-300 border-green-500/30' },
        opted_out:          { label: 'Opted Out',          color: 'bg-red-500/20 text-red-300 border-red-500/30' },
    };

    const funnel = funnelStatus ? funnelLabels[funnelStatus] : null;

    return (
        <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Edit Listing #{id}</h1>
                {funnel && (
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium ${funnel.color}`}>
                        <span>Funnel:</span>
                        <span>{funnel.label}</span>
                        {funnelStep !== null && funnelStep > 0 && (
                            <span className="opacity-70">· Email {funnelStep} of 4</span>
                        )}
                    </div>
                )}
            </div>
            <ListingForm initialData={initialData as any} />
        </div>
    );
}
