import ListingForm from '@/components/ListingForm';

export default function NewListingPage() {
    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Create New Listing</h1>
            <ListingForm />
        </div>
    );
}
