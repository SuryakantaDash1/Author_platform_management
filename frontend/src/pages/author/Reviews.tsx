import React, { useState, useEffect, useCallback } from 'react';
import { Star, Edit2, AlertCircle, Loader2, CheckCircle2, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/interceptors';
import { API_ENDPOINTS } from '../../api/endpoints';
import Loader from '../../components/common/Loader';

const LIME = '#84CC16';
const LIME_DARK = '#65a30d';

interface Review {
  _id: string;
  authorId: string;
  rating: number;
  reviewText: string;
  createdAt: string;
  updatedAt: string;
}

const StarRating: React.FC<{ value: number; onChange?: (v: number) => void; size?: string }> = ({
  value, onChange, size = 'w-6 h-6',
}) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHovered(star)}
          onMouseLeave={() => onChange && setHovered(0)}
          className={onChange ? 'cursor-pointer' : 'cursor-default'}
          disabled={!onChange}
        >
          <Star
            className={`${size} transition-colors ${
              star <= (hovered || value)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-neutral-300 dark:text-neutral-600'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

const AuthorReviews: React.FC = () => {
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formRating, setFormRating] = useState(5);
  const [formText, setFormText] = useState('');
  const [formError, setFormError] = useState('');

  const fetchMyReview = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axiosInstance.get('/reviews/my');
      setMyReview(res.data?.data?.review || null);
    } catch {
      setMyReview(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMyReview(); }, [fetchMyReview]);

  const openForm = () => {
    if (myReview) {
      setFormRating(myReview.rating);
      setFormText(myReview.reviewText);
    } else {
      setFormRating(5);
      setFormText('');
    }
    setFormError('');
    setIsEditing(true);
  };

  const handleSubmit = async () => {
    if (!formText.trim()) { setFormError('Please write your review.'); return; }
    if (formRating < 1) { setFormError('Please select a rating.'); return; }
    setSaving(true);
    setFormError('');
    try {
      if (myReview) {
        await axiosInstance.put(API_ENDPOINTS.REVIEWS.UPDATE(myReview._id), {
          rating: formRating,
          reviewText: formText.trim(),
        });
        toast.success('Review updated!');
      } else {
        await axiosInstance.post(API_ENDPOINTS.REVIEWS.SUBMIT, {
          rating: formRating,
          reviewText: formText.trim(),
        });
        toast.success('Review submitted!');
      }
      setIsEditing(false);
      fetchMyReview();
    } catch (err: any) {
      setFormError(err?.response?.data?.message || 'Failed to save review');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Platform Rating & Review</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Share your experience with the POVITAL platform. Your review appears on our public website.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Existing review display */}
      {myReview && !isEditing && (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
          {/* Lime accent top bar */}
          <div className="h-1" style={{ background: `linear-gradient(90deg, ${LIME}, ${LIME_DARK})` }} />
          <div className="p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">Your Review</p>
                <StarRating value={myReview.rating} size="w-5 h-5" />
              </div>
              <button
                onClick={openForm}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors hover:bg-lime-50 dark:hover:bg-lime-900/20"
                style={{ color: LIME_DARK }}
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
            </div>
            <p className="text-neutral-700 dark:text-neutral-300 text-sm leading-relaxed">{myReview.reviewText}</p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Published on {new Date(myReview.updatedAt || myReview.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>
      )}

      {/* No review yet */}
      {!myReview && !isEditing && (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border-2 border-dashed border-neutral-200 dark:border-neutral-700 p-10 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(132,204,22,0.10)' }}>
            <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
          </div>
          <p className="text-neutral-600 dark:text-neutral-400 mb-5 text-sm">You haven't shared a review yet.</p>
          <button
            onClick={openForm}
            className="px-5 py-2.5 text-white text-sm font-semibold rounded-xl transition-all hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${LIME}, ${LIME_DARK})` }}
          >
            Write a Review
          </button>
        </div>
      )}

      {/* Review form */}
      {isEditing && (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
          {/* Lime accent top bar */}
          <div className="h-1" style={{ background: `linear-gradient(90deg, ${LIME}, ${LIME_DARK})` }} />
          <div className="p-6 space-y-5">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
              {myReview ? 'Edit Your Review' : 'Write a Review'}
            </h2>

            {/* Star rating */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Your Rating <span className="text-red-500">*</span>
              </label>
              <StarRating value={formRating} onChange={setFormRating} size="w-7 h-7" />
            </div>

            {/* Review text */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Your Review <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formText}
                onChange={e => { setFormText(e.target.value); setFormError(''); }}
                rows={5}
                placeholder="Share your experience with POVITAL — the publishing process, support, quality..."
                className="w-full px-4 py-3 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-400/40 focus:border-lime-400 transition-colors resize-none"
              />
              <div className="flex items-center justify-between mt-1">
                {formError
                  ? <p className="text-xs text-red-500">{formError}</p>
                  : <span />
                }
                <span className="text-xs text-neutral-400">{formText.length} chars</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-1">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white rounded-lg transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: `linear-gradient(135deg, ${LIME}, ${LIME_DARK})` }}
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {myReview ? 'Update Review' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info note */}
      <div className="rounded-xl p-4 text-sm" style={{ background: 'rgba(132,204,22,0.07)', border: '1px solid rgba(132,204,22,0.25)' }}>
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-4 h-4 flex-shrink-0" style={{ color: LIME_DARK }} />
          <p className="font-semibold" style={{ color: LIME_DARK }}>About reviews</p>
        </div>
        <ul className="list-disc list-inside space-y-0.5 text-neutral-600 dark:text-neutral-400 ml-1">
          <li>You can submit one review per account</li>
          <li>Reviews are immediately visible on the POVITAL public website</li>
          <li>You can edit your review at any time</li>
        </ul>
      </div>
    </div>
  );
};

export default AuthorReviews;
