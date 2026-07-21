import { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, RefreshCw } from 'lucide-react';
import { createPortal } from 'react-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/navbar/Navbar';
import Sidebar from '../components/Sidebar';
import EnhancedPostCard from '../components/EnhancedPostCard';
import ProfileCompletionWidget from '../components/ProfileCompletionWidget';

const LIMIT = 10;
const POLL_INTERVAL = 45000; // 45 seconds

const FreelancerFeed = () => {
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // "New posts available" banner
  const [newPostsCount, setNewPostsCount] = useState(0);
  const latestPostIdRef = useRef(null);
  const pollTimerRef = useRef(null);

  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  const searchQuery = searchParams.get('search') || '';
  const categoryFilter = searchParams.get('category') || '';

  // ─── Initial load ────────────────────────────────────────────────────────────
  useEffect(() => {
    loadFeed(1, true);
    fetchRecommendedJobs();
    return () => clearInterval(pollTimerRef.current);
  }, []);

  // Re-fetch when search/category changes
  useEffect(() => {
    loadFeed(1, true);
  }, [searchQuery, categoryFilter]);

  // ─── Feed loader ─────────────────────────────────────────────────────────────
  const buildQuery = (pageNum) => {
    let q = `page=${pageNum}&limit=${LIMIT}`;
    if (searchQuery) q += `&search=${encodeURIComponent(searchQuery)}`;
    if (categoryFilter) q += `&category=${encodeURIComponent(categoryFilter)}`;
    return q;
  };

  const loadFeed = async (pageNum = 1, reset = false) => {
    try {
      if (reset) setLoading(true);
      else setLoadingMore(true);

      const res = await api.get(`/posts/feed?${buildQuery(pageNum)}`);
      const incoming = res.data.posts || [];

      if (reset) {
        setPosts(incoming);
        setPage(1);
        // Track the newest post so we can detect new ones later
        if (incoming.length > 0) latestPostIdRef.current = incoming[0].id;
        startPolling();
      } else {
        setPosts(prev => [...prev, ...incoming]);
        setPage(pageNum);
      }

      setHasMore(res.data.hasMore ?? incoming.length === LIMIT);
      setNewPostsCount(0);
    } catch {
      toast.error('Failed to load feed');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // ─── Background polling for new posts ────────────────────────────────────────
  const startPolling = useCallback(() => {
    clearInterval(pollTimerRef.current);
    pollTimerRef.current = setInterval(async () => {
      try {
        const res = await api.get(`/posts/feed?page=1&limit=${LIMIT}`);
        const latest = res.data.posts || [];
        if (!latest.length || !latestPostIdRef.current) return;

        // Count posts newer than what we already have
        const newCount = latest.findIndex(p => p.id === latestPostIdRef.current);
        if (newCount > 0) setNewPostsCount(newCount);
      } catch {
        // silent — don't bother the user for a background poll failure
      }
    }, POLL_INTERVAL);
  }, []);

  // ─── "Show new posts" banner click ───────────────────────────────────────────
  const handleShowNewPosts = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    loadFeed(1, true);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) loadFeed(page + 1);
  };

  const fetchRecommendedJobs = async () => {
    try {
      setLoadingJobs(true);
      const res = await api.get('/jobs?status=open&limit=5');
      setRecommendedJobs(res.data.jobs || []);
    } catch {
      // silent
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleDeletePost = (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  // ─── Skeleton ────────────────────────────────────────────────────────────────
  const Skeleton = () => (
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/4" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
    <div className="flex min-h-screen bg-gray-50 dashboard-page">
      <Sidebar />

      <div className="flex-1 lg:ml-64">
        <Navbar />

        <div className="lg:p-8">
          <div className="max-w-6xl mx-auto">
            {/* Welcome */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-6 lg:p-0"
            >
              {(searchQuery || categoryFilter) && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <p className="text-green-800 font-medium">
                      {searchQuery && `Searching for: "${searchQuery}"`}
                      {searchQuery && categoryFilter && ' in '}
                      {categoryFilter && categoryFilter}
                    </p>
                    <button
                      onClick={() => navigate('/freelancer/feed')}
                      className="text-green-600 hover:text-green-800 text-sm font-medium"
                    >
                      Clear filters ✕
                    </button>
                  </div>
                </div>
              )}
              <h1 className="lg:text-3xl md:text-2xl text-xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.fullName?.split(' ')[0]} 👋
              </h1>
              <p className="text-gray-600 lg:text-lg text-xs">
                Here's what's happening with your freelance journey today.
              </p>
            </motion.div>

            <ProfileCompletionWidget userRole="freelancer" />

            {/* Feed grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main feed */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-6 px-6 lg:px-0">
                  <h2 className="text-2xl font-bold text-gray-900">Feed</h2>
                  <button
                    onClick={() => loadFeed(1, true)}
                    disabled={loading}
                    className="flex items-center gap-1.5 text-sm text-green-600 hover:text-green-700 font-medium disabled:opacity-50 transition"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>

                {/* New posts banner */}


                <div className="md:mx-12 lg:mx-0">
                  {loading ? (
                    <Skeleton />
                  ) : (
                    <>
                      <div className="space-y-6">
                        {posts.map(post => (
                          <EnhancedPostCard
                            key={post.id}
                            post={post}
                            onDelete={handleDeletePost}
                          />
                        ))}
                      </div>

                      {posts.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
                          <p className="text-gray-500 text-lg">No posts yet. Start following people!</p>
                        </div>
                      )}

                      {posts.length > 0 && hasMore && (
                        <div className="mt-8 text-center">
                          <button
                            onClick={handleLoadMore}
                            disabled={loadingMore}
                            className="px-8 py-3  text-green-600 hover:text-green-700 font-medium rounded-xl font-medium transition disabled:opacity-50 shadow-lg"
                          >
                            {loadingMore ? 'Loading...' : 'Load More'}
                          </button>
                        </div>
                      )}

                      {posts.length > 0 && !hasMore && (
                        <p className="mt-8 text-center text-sm text-gray-400">You're all caught up!</p>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Recommended For You</h3>

                  {loadingJobs ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="p-4 bg-gray-50 rounded-xl animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                          <div className="h-3 bg-gray-200 rounded w-1/2 mb-3" />
                          <div className="h-8 bg-gray-200 rounded" />
                        </div>
                      ))}
                    </div>
                  ) : recommendedJobs.length > 0 ? (
                    <div className="space-y-4">
                      {recommendedJobs.slice(0, 3).map((job, index) => (
                        <div
                          key={job.id}
                          className={`p-4 rounded-xl border ${
                            index === 0
                              ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-100'
                              : index === 1
                              ? 'bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-100'
                              : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100'
                          }`}
                        >
                          <h4 className="font-semibold text-gray-700 mb-2 line-clamp-2">{job.title}</h4>
                          <p className="text-sm text-gray-600 mb-1">{job.budgetRange}</p>
                          <p className="text-xs text-gray-500 mb-3">{job.projectType}</p>
                          <button
                            onClick={() => navigate('/freelancer/jobs')}
                            className={`w-full px-4 py-2 text-white text-sm font-medium rounded-lg transition ${
                              index === 0
                                ? 'bg-green-600 hover:bg-green-700'
                                : index === 1
                                ? 'bg-teal-600 hover:bg-teal-700'
                                : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                          >
                            View Job
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 text-sm">No jobs available yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Floating "new posts" pill — fixed top-center */}
    {createPortal(
      <AnimatePresence>
        {newPostsCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
          >
            <button
              onClick={handleShowNewPosts}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-full shadow-2xl transition-colors"
            >
              <ArrowUp className="w-4 h-4" />
              {newPostsCount} new post{newPostsCount > 1 ? 's' : ''}
            </button>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
    )}
    </>
  );
};

export default FreelancerFeed;
