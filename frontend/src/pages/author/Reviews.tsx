import React, { useState, useEffect, useCallback } from 'react';
import { Star, Edit2, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/interceptors';
import { API_ENDPOINTS } from '../../api/endpoints';
import Loader from '../../components/common/Loader';

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
                : 'text-gray-300 dark:text-gray-600'
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
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Platform Rating & Review</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
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
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Your Review</p>
              <StarRating value={myReview.rating} size="w-5 h-5" />
            </div>
            <button
              onClick={openForm}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
          </div>
          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{myReview.reviewText}</p>
          <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Published on {new Date(myReview.updatedAt || myReview.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
      )}

      {/* No review yet */}
      {!myReview && !isEditing && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 p-10 text-center">
          <Star className="w-10 h-10 text-yellow-300 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">You haven't shared a review yet.</p>
          <button
            onClick={openForm}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Write a Review
          </button>
        </div>
      )}

      {/* Review form */}
      {isEditing && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-5">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {myReview ? 'Edit Your Review' : 'Write a Review'}
          </h2>

          {/* Star rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Rating <span className="text-red-500">*</span>
            </label>
            <StarRating value={formRating} onChange={setFormRating} size="w-7 h-7" />
          </div>

          {/* Review text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Review <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formText}
              onChange={e => { setFormText(e.target.value); setFormError(''); }}
              rows={5}
              placeholder="Share your experience with POVITAL — the publishing process, support, quality..."
              className="w-full px-4 py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors resize-none"
            />
            <div className="flex items-center justify-between mt-1">
              {formError
                ? <p className="text-xs text-red-500">{formError}</p>
                : <span />
              }
              <span className="text-xs text-gray-400">{formText.length} chars</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-1">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {myReview ? 'Update Review' : 'Submit Review'}
            </button>
          </div>
        </div>
      )}

      {/* Info note */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm text-blue-700 dark:text-blue-300">
        <p className="font-medium mb-1">About reviews</p>
        <ul className="list-disc list-inside space-y-0.5 text-blue-600 dark:text-blue-400">
          <li>You can submit one review per account</li>
          <li>Reviews are immediately visible on the POVITAL public website</li>
          <li>You can edit your review at any time</li>
        </ul>
      </div>
    </div>
  );
};

export default AuthorReviews;
