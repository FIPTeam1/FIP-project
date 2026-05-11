'use client';

import { useEffect, useState } from 'react';
import { reviewsApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import type { Review } from '@/lib/types';

interface ReviewSectionProps {
  recipeId: number;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function StarRatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`text-2xl transition-colors ${
            star <= value ? 'text-[#FCAF3B]' : 'text-gray-300'
          }`}
          aria-label={`${star} star`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function ReviewSection({ recipeId }: ReviewSectionProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const res = await reviewsApi.list(recipeId);
        setReviews(res.data);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [recipeId]);

  const handlePost = async () => {
    if (!user) return;
    setPosting(true);
    setError(null);
    try {
      const displayName = [user.profile.first_name, user.profile.last_name]
        .filter(Boolean)
        .join(' ');
      const res = await reviewsApi.create({
        recipe_id: recipeId,
        rating,
        review: reviewText.trim() || undefined,
        name: displayName || undefined,
      });
      setReviews((prev) => [res.data, ...prev]);
      setReviewText('');
      setRating(5);
    } catch {
      setError('Failed to post review. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-[22px] font-semibold text-base-content">Reviews</h2>

      {/* Post a review (logged in only) */}
      {user ? (
        <div className="space-y-3 bg-white rounded-xl border border-base-200 p-4">
          <p className="text-[14px] font-semibold text-gray-700">Leave a Review</p>
          <StarRatingInput value={rating} onChange={setRating} />
          <textarea
            className="w-full rounded-xl border border-base-300 bg-base-100 px-4 py-3 text-[14px] text-base-content placeholder:text-base-content/40 resize-none focus:outline-none focus:ring-2 focus:ring-[#FCAF3B] transition"
            rows={3}
            placeholder="Share your thoughts about this recipe..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            disabled={posting}
          />
          {error && <p className="text-xs text-error">{error}</p>}
          <div className="flex justify-end">
            <button
              onClick={handlePost}
              disabled={posting}
              className="px-[30px] py-[10px] rounded-lg text-[14px] font-semibold text-white transition disabled:opacity-50"
              style={{ backgroundColor: '#5555FF' }}
            >
              {posting ? 'Posting…' : 'Post Review'}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-[14px] text-base-content/50 italic">
          Log in to leave a review.
        </p>
      )}

      {/* Review list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-9 h-9 rounded-full bg-base-300 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-28 rounded bg-base-300" />
                <div className="h-3 w-full rounded bg-base-300" />
              </div>
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-[14px] text-base-content/40 italic">
          No reviews yet. Be the first to share your thoughts!
        </p>
      ) : (
        <ul className="space-y-5">
          {reviews.map((review) => {
            const displayName = review.name ?? 'Anonymous';
            const initials = displayName.slice(0, 2).toUpperCase();
            return (
              <li key={review.id} className="flex gap-3">
                {/* Avatar */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: '#5555FF' }}
                >
                  {initials}
                </div>

                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[16px] font-medium text-base-content">
                      {displayName}
                    </span>
                    <span className="text-[#FCAF3B] text-sm">
                      {'★'.repeat(review.rating)}
                      <span className="text-gray-300">{'★'.repeat(5 - review.rating)}</span>
                    </span>
                    {review.created_at && (
                      <span className="text-xs text-base-content/40">
                        {formatDate(review.created_at)}
                      </span>
                    )}
                  </div>
                  {review.review && (
                    <p className="text-[14px] text-base-content/80 mt-0.5 leading-relaxed">
                      {review.review}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
