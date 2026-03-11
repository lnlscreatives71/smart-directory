import { sql } from '@/lib/db';
import { notFound } from 'next/navigation';
import ListingForm from '@/components/ListingForm';

export default async function EditListingPage({ params }: { params: { id: string } }) {
    // SSR fetch for initial data
    let initialData = null;
    try {
        const res = await sql`SELECT * FROM listings WHERE id = ${params.id}`;
        if (res.length > 0) {
            initialData = res[0];
        } else {
            notFound();
        }
    } catch (e) {
        console.error(e);
        return <div>Database Error</div>;
    }

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Edit Listing #{params.id}</h1>
            <ListingForm initialData={initialData as any} />
        </div>
    );
}
