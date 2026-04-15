import React, { useState, useEffect, useCallback } from 'react';
import {
  Star,
  Trash2,
  Edit2,
  EyeOff,
  Eye,
  X,
  Loader2,
  AlertCircle,
  RefreshCw,
  Search,
} from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/interceptors';
import { API_ENDPOINTS } from '../../api/endpoints';
import Loader from '../../components/common/Loader';

interface Review {
  _id: string;
  reviewId: string;
  authorId: string;
  userId: string;
  rating: number;
  reviewText: string;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

const StarDisplay: React.FC<{ value: number }> = ({ value }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map(s => (
      <Star
        key={s}
        className={`w-4 h-4 ${s <= value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
      />
    ))}
  </div>
);

const AdminReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });

  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editText, setEditText] = useState('');
  const [editRating, setEditRating] = useState(5);
  const [editVisible, setEditVisible] = useState(true);
  const [editSaving, setEditSaving] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchReviews = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const params: any = { page, limit: 20 };
      if (search) params.search = search;
      if (ratingFilter) params.rating = ratingFilter;
      const res = await axiosInstance.get(API_ENDPOINTS.REVIEWS.ADMIN_ALL, { params });
      const data = res.data?.data || {};
      setReviews(data.reviews || []);
      const p = data.pagination || {};
      setPagination({ total: p.total || 0, page: p.page || 1, pages: p.pages || 1 });
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [search, ratingFilter]);

  useEffect(() => { fetchReviews(1); }, [fetchReviews]);

  const openEdit = (review: Review) => {
    setEditingReview(review);
    setEditText(review.reviewText);
    setEditRating(review.rating);
    setEditVisible(review.isVisible);
  };

  const saveEdit = async () => {
    if (!editingReview) return;
    setEditSaving(true);
    try {
      await axiosInstance.put(API_ENDPOINTS.REVIEWS.ADMIN_EDIT(editingReview.reviewId), {
        rating: editRating,
        reviewText: editText.trim(),
        isVisible: editVisible,
      });
      toast.success('Review updated');
      setEditingReview(null);
      fetchReviews(pagination.page);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update review');
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async (review: Review) => {
    if (!window.confirm(`Delete review by ${review.authorId}? This cannot be undone.`)) return;
    setDeletingId(review.reviewId);
    try {
      await axiosInstance.delete(API_ENDPOINTS.REVIEWS.ADMIN_DELETE(review.reviewId));
      toast.success('Review deleted');
      fetchReviews(pagination.page);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete review');
    } finally {
      setDeletingId(null);
    }
  };

  const toggleVisibility = async (review: Review) => {
    try {
      await axiosInstance.put(API_ENDPOINTS.REVIEWS.ADMIN_EDIT(review.reviewId), {
        isVisible: !review.isVisible,
      });
      toast.success(review.isVisible ? 'Review hidden' : 'Review visible');
      fetchReviews(pagination.page);
    } catch {
      toast.error('Failed to update visibility');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Reviews</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Manage author reviews shown on the public website
          </p>
        </div>
        <button
          onClick={() => fetchReviews(1)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search review text..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={ratingFilter}
          onChange={e => setRatingFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Ratings</option>
          {[5, 4, 3, 2, 1].map(r => (
            <option key={r} value={r}>{r} Star{r !== 1 ? 's' : ''}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <Loader />
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <Star className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No reviews found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <div
              key={review._id}
              className={`bg-white dark:bg-gray-800 rounded-xl border ${
                review.isVisible
                  ? 'border-gray-200 dark:border-gray-700'
                  : 'border-gray-100 dark:border-gray-800 opacity-60'
              } p-5`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <StarDisplay value={review.rating} />
                    {!review.isVisible && (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                        <EyeOff className="w-3 h-3" />
                        Hidden
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{review.reviewText}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
                    <span>Author: <span className="font-medium text-gray-600 dark:text-gray-400">{review.authorId}</span></span>
                    <span>•</span>
                    <span>{new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => toggleVisibility(review)}
                    title={review.isVisible ? 'Hide review' : 'Show review'}
                    className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    {review.isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => openEdit(review)}
                    className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(review)}
                    disabled={deletingId === review.reviewId}
                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {deletingId === review.reviewId
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Trash2 className="w-4 h-4" />
                    }
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 pt-2">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => fetchReviews(p)}
              className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                pagination.page === p
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Edit Review</h3>
              <button onClick={() => setEditingReview(null)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button key={s} type="button" onClick={() => setEditRating(s)}>
                      <Star className={`w-6 h-6 ${s <= editRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
                    </button>
                  ))}
                </div>
              </div>
              {/* Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Review Text</label>
                <textarea
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                  rows={5}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
              {/* Visibility toggle */}
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setEditVisible(!editVisible)}
                  className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${editVisible ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${editVisible ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">Visible on public website</span>
              </label>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setEditingReview(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={editSaving}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                {editSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
