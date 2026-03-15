'use client';

import { useState, useEffect } from 'react';
import { Star, User, Send, Trash2 } from 'lucide-react';

interface Review {
    id: number;
    listing_id: number;
    author_name: string;
    rating: number;
    comment: string;
    created_at: string;
}

export default function ReviewsSection({ listingId, listingName }: { listingId: number; listingName: string }) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newReview, setNewReview] = useState({ author_name: '', rating: 5, comment: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetch(`/api/reviews?listing_id=${listingId}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) setReviews(data.data);
            })
            .finally(() => setLoading(false));
    }, [listingId]);

    const submitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newReview.author_name.trim() || !newReview.comment.trim()) return;
        
        setSubmitting(true);
        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newReview, listing_id: listingId }),
            });
            const data = await res.json();
            if (data.success) {
                setReviews([data.data, ...reviews]);
                setNewReview({ author_name: '', rating: 5, comment: '' });
                setShowForm(false);
            } else {
                alert(data.error || 'Failed to submit review');
            }
        } catch {
            alert('Network error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const deleteReview = async (id: number) => {
        if (!confirm('Delete this review?')) return;
        await fetch(`/api/reviews?id=${id}`, { method: 'DELETE' });
        setReviews(reviews.filter(r => r.id !== id));
    };

    const avgRating = reviews.length > 0 
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : '0';

    return (
        <div className="glass rounded-2xl p-8 shadow-sm mt-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        Customer Reviews
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                        {reviews.length} review{reviews.length !== 1 ? 's' : ''} · Average rating: {avgRating} / 5
                    </p>
                </div>
                <button 
                    onClick={() => setShowForm(!showForm)}
                    className="btn-primary px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2"
                >
                    <Star size={16} className="fill-white" /> Write a Review
                </button>
            </div>

            {/* Review Form */}
            {showForm && (
                <form onSubmit={submitReview} className="mb-8 p-6 bg-white/5 rounded-xl border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4">Leave a Review for {listingName}</h3>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-slate-300 mb-2">Your Name *</label>
                        <input
                            type="text"
                            value={newReview.author_name}
                            onChange={e => setNewReview({ ...newReview, author_name: e.target.value })}
                            placeholder="John D."
                            required
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-primary-500 transition"
                        />
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-slate-300 mb-2">Rating *</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setNewReview({ ...newReview, rating: star })}
                                    className={`p-1 transition ${star <= newReview.rating ? 'text-amber-400' : 'text-slate-600'}`}
                                >
                                    <Star size={28} fill={star <= newReview.rating ? 'currentColor' : 'none'} />
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-slate-300 mb-2">Your Review *</label>
                        <textarea
                            value={newReview.comment}
                            onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
                            placeholder="Share your experience with this business..."
                            rows={4}
                            required
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-primary-500 transition resize-none"
                        />
                    </div>
                    
                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn-primary px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50"
                        >
                            <Send size={16} /> {submitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="px-6 py-2.5 border border-slate-700 rounded-lg font-semibold text-slate-300 hover:bg-slate-800 transition"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* Reviews List */}
            {loading ? (
                <div className="text-center py-12 text-slate-400">Loading reviews...</div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-12">
                    <User size={48} className="mx-auto text-slate-600 mb-4" />
                    <p className="text-slate-400 font-medium">No reviews yet</p>
                    <p className="text-slate-500 text-sm mt-1">Be the first to leave a review!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map(review => (
                        <div key={review.id} className="bg-white/5 rounded-xl p-5 border border-white/5">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center text-primary-400 font-bold">
                                        {review.author_name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold text-white">{review.author_name}</p>
                                        <div className="flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <Star
                                                    key={star}
                                                    size={12}
                                                    className={star <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-500">
                                        {new Date(review.created_at).toLocaleDateString()}
                                    </span>
                                    <button
                                        onClick={() => deleteReview(review.id)}
                                        className="text-slate-600 hover:text-red-400 transition p-1"
                                        title="Delete review"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                            {review.comment && (
                                <p className="text-slate-300 text-sm leading-relaxed">{review.comment}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
