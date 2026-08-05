import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Search, Star, Trash2 } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

function StarRow({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`w-3.5 h-3.5 ${s <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700'}`} />
      ))}
    </div>
  );
}

export default function ReviewsTab() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterRating, setFilterRating] = useState('all');

  useEffect(() => { fetchReviews(); }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/reviews');
      setReviews(res.data.reviews || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load reviews');
      console.error('Reviews load error:', err.response?.data || err.message);
    } finally { setLoading(false); }
  };

  const deleteReview = async (id) => {
    if (!confirm('Delete this review? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/reviews/${id}`);
      toast.success('Review deleted');
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch { toast.error('Failed to delete review'); }
  };

  const filtered = reviews.filter((r) => {
    const matchSearch =
      r.comment?.toLowerCase().includes(search.toLowerCase()) ||
      r.reviewer?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      r.freelancer?.fullName?.toLowerCase().includes(search.toLowerCase());
    const matchRating = filterRating === 'all' || r.rating === Number(filterRating);
    return matchSearch && matchRating;
  });

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '—';

  const ratingCounts = [5, 4, 3, 2, 1].map((n) => ({
    star: n,
    count: reviews.filter((r) => r.rating === n).length,
  }));

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-yellow-500/15 flex items-center justify-center">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{avgRating}</p>
            <p className="text-gray-500 text-xs">Avg Rating</p>
          </div>
        </div>
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/15 flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{reviews.length}</p>
            <p className="text-gray-500 text-xs">Total Reviews</p>
          </div>
        </div>
        {ratingCounts.slice(0, 2).map(({ star, count }) => (
          <div key={star} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-yellow-500/10 flex items-center justify-center">
              <span className="text-yellow-400 font-bold text-sm">{star}★</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{count}</p>
              <p className="text-gray-500 text-xs">{star}-star reviews</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by reviewer, freelancer, or comment..."
            className="w-full pl-11 pr-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#00564C]/50 text-sm transition"
          />
        </div>
        <select
          value={filterRating}
          onChange={(e) => setFilterRating(e.target.value)}
          className="px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm focus:outline-none focus:border-[#00564C]/50 transition"
        >
          <option value="all">All Ratings</option>
          {[5, 4, 3, 2, 1].map((n) => (
            <option className="text-black" key={n} value={n}>{n} Star{n !== 1 ? 's' : ''}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-white/[0.03] animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
            <Star className="w-7 h-7 text-gray-600" />
          </div>
          <p className="text-gray-500 text-sm">No reviews found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((review, i) => (
            <motion.div key={review.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition group">
              <div className="flex items-start gap-3 md:gap-4">
                <img
                  src={review.reviewer?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.reviewer?.fullName || 'U')}&background=00564C&color=fff`}
                  alt={review.reviewer?.fullName}
                  className="w-9 h-9 rounded-full object-cover ring-1 ring-white/10 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-white text-sm font-semibold">{review.reviewer?.fullName || 'Unknown'}</span>
                      <span className="text-gray-600 text-xs">→</span>
                      <span className="text-[#4ade80] text-sm font-semibold">{review.freelancer?.fullName || 'Unknown'}</span>
                    </div>
                    <span className="text-gray-600 text-xs flex-shrink-0">
                      {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : '—'}
                    </span>
                  </div>
                  <StarRow rating={review.rating} />
                  <p className="text-gray-300 text-sm leading-relaxed line-clamp-3 mt-1">{review.comment}</p>
                  {review.projectId && (
                    <p className="text-gray-600 text-xs mt-1">Project ID: {review.projectId}</p>
                  )}
                </div>
                <button
                  onClick={() => deleteReview(review.id)}
                  className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition md:opacity-0 md:group-hover:opacity-100 flex-shrink-0"
                  title="Delete review"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
