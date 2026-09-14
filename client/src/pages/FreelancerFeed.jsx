import { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUp,
  Sparkles,
  Briefcase,
  ArrowRight,
  Filter,
  RefreshCw,
  X
} from 'lucide-react';
import { createPortal } from 'react-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/navbar/Navbar';
import Sidebar from '../components/Sidebar';
import FeedHeader from '../components/FeedHeader';
import ProfileCompletionCompact from '../components/ProfileCompletionCompact';
import PostComposer from '../components/PostComposer';
import CodePostCard from '../components/CodePostCard';
import JobAnnouncementCard from '../components/JobAnnouncementCard';

const LIMIT = 10;
const POLL_INTERVAL = 45000;

const FreelancerFeed = () => {
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Mobile drawer state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('feed');

  // Feed & Data states
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [posting, setPosting] = useState(false);

  // Polling states
  const [newPostsCount, setNewPostsCount] = useState(0);
  const latestPostIdRef = useRef(null);
  const pollTimerRef = useRef(null);

  // Job recommendations
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  const searchQuery = searchParams.get('search') || '';
  const categoryFilter = searchParams.get('category') || '';

  useEffect(() => {
    loadFeed(1, true);
    fetchRecommendedJobs();
    return () => clearInterval(pollTimerRef.current);
  }, []);

  useEffect(() => {
    loadFeed(1, true);
  }, [searchQuery, categoryFilter, activeTab]);

  const endpointForTab = () => {
    if (activeTab === 'jobs') return '/jobs';
    if (activeTab === 'snippets') return '/posts/feed';
    return '/posts/feed';
  };

  const buildQuery = (pageNum) => {
    let q = `page=${pageNum}&limit=${LIMIT}`;
    if (searchQuery) q += `&search=${encodeURIComponent(searchQuery)}`;
    if (categoryFilter) q += `&category=${encodeURIComponent(categoryFilter)}`;
    if (activeTab === 'jobs') q += `&status=open`;
    if (activeTab === 'snippets') q += `&type=snippet`;
    return q;
  };

  const loadFeed = async (pageNum = 1, reset = false) => {
    try {
      if (reset) setLoading(true);
      else setLoadingMore(true);

      const res = await api.get(`${endpointForTab()}?${buildQuery(pageNum)}`);
      const incoming = res.data.posts || res.data.jobs || [];

      if (reset) {
        setPosts(incoming);
        setPage(1);
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

  const startPolling = useCallback(() => {
    clearInterval(pollTimerRef.current);
    pollTimerRef.current = setInterval(async () => {
      try {
        const res = await api.get(`/posts/feed?page=1&limit=${LIMIT}`);
        const latest = res.data.posts || [];
        if (!latest.length || !latestPostIdRef.current) return;

        const newCount = latest.findIndex(p => p.id === latestPostIdRef.current);
        if (newCount > 0) setNewPostsCount(newCount);
      } catch {
        // silent
      }
    }, POLL_INTERVAL);
  }, []);

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

  const handleCreatePost = async ({ text, code, imageFile, jobLink }) => {
    setPosting(true);
    try {
      const form = new FormData();
      form.append('content', text);
      if (code) form.append('code', code);
      if (imageFile) form.append('image', imageFile);
      if (jobLink) form.append('jobLink', jobLink);
      await api.post('/posts', form);
      loadFeed(1, true);
    } catch {
      toast.error('Failed to post');
    } finally {
      setPosting(false);
    }
  };

  const Skeleton = () => (
    <div className="divide-y divide-gray-100">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="p-4 sm:p-5 animate-pulse space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 bg-gray-200 rounded w-1/3" />
              <div className="h-3 bg-gray-200 rounded w-1/4" />
            </div>
          </div>
          <div className="space-y-2 pt-1">
            <div className="h-3 bg-gray-200 rounded w-full" />
            <div className="h-3 bg-gray-200 rounded w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">
      
      {/* 1. Desktop Permanent Sidebar */}
      <div className="hidden lg:block fixed inset-y-0 left-0 w-64 z-30 bg-white border-r border-gray-100">
        <Sidebar />
      </div>

      {/* 2. Mobile Drawer Sidebar (Explicit Slide-Over Window) */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop Blur/Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black"
            />
            {/* Sliding Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-50 flex flex-col"
            >
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <span className="font-bold text-[#00564C]">Menu</span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 rounded-lg text-gray-500 hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <Sidebar onClose={() => setSidebarOpen(false)} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Main Body */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        
        {/* Top Navigation */}
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Content Layout */}
        <main className="max-w-6xl w-full mx-auto flex-1 flex flex-col lg:flex-row">
          
          <div className="flex-1 min-w-0 border-x-0 lg:border-x border-gray-100 bg-white">
            
            {/* Sticky Header */}
            <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between">
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                  Home
                </h1>
                <p className="text-xs text-gray-500">
                  Welcome back, {user?.fullName?.split(' ')[0]} 👋
                </p>
              </div>
              <button
                onClick={() => loadFeed(1, true)}
                className="p-2 text-gray-500 hover:text-[#00564C] hover:bg-gray-50 rounded-full transition"
                title="Refresh Feed"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#00564C]' : ''}`} />
              </button>
            </div>

            {/* Active Filters Bar */}
            {(searchQuery || categoryFilter) && (
              <div className="px-4 py-2.5 bg-[#00564C]/5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-medium text-[#00564C]">
                  <Filter className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">
                    {searchQuery && `"${searchQuery}"`}
                    {searchQuery && categoryFilter && ' in '}
                    {categoryFilter && categoryFilter}
                  </span>
                </div>
                <button
                  onClick={() => navigate('/freelancer/feed')}
                  className="text-xs font-bold text-[#00564C] hover:underline shrink-0"
                >
                  Clear
                </button>
              </div>
            )}

            {/* Profile Bar */}
            <div className="p-4 border-b border-gray-100">
              <ProfileCompletionCompact userRole="freelancer" />
            </div>

            {/* Feed Tabs */}
            <div className="border-b border-gray-100">
              <FeedHeader
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onRefresh={() => loadFeed(1, true)}
                refreshing={loading}
                searchValue={searchQuery}
                onSearchChange={(val) =>
                  navigate(val ? `/freelancer/feed?search=${encodeURIComponent(val)}` : '/freelancer/feed')
                }
              />
            </div>

            {/* Post Composer */}
            {activeTab !== 'jobs' && (
              <div className="border-b border-gray-100 p-4 bg-gray-50/30">
                <PostComposer
                  user={user}
                  submitting={posting}
                  onSubmit={handleCreatePost}
                />
              </div>
            )}

            {/* Posts Stream */}
            {loading ? (
              <Skeleton />
            ) : (
              <div className="divide-y divide-gray-100">
                {posts.map(post =>
                  post.type === 'job' || activeTab === 'jobs' ? (
                    <JobAnnouncementCard
                      key={post.id}
                      job={post.job || post}
                      onView={() => navigate(`/freelancer/jobs/${(post.job || post).id}`)}
                    />
                  ) : (
                    <CodePostCard
                      key={post.id}
                      post={post}
                      currentUserId={user?.id || user?.uid}
                      onLike={(id) => api.post(`/posts/${id}/like`)}
                      onComment={(id) => navigate(`/freelancer/posts/${id}`)}
                      onRepost={(id) => api.post(`/posts/${id}/repost`)}
                      onBookmark={(id) => api.post(`/posts/${id}/bookmark`)}
                      onShare={(id) =>
                        navigator.share?.({ url: `${window.location.origin}/posts/${id}` })
                      }
                    />
                  )
                )}

                {posts.length === 0 && (
                  <div className="text-center py-16 px-4">
                    <Briefcase className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <h3 className="text-gray-900 font-bold text-base">No posts found</h3>
                    <p className="text-gray-500 text-xs mt-1">Try clearing filters or posting something new.</p>
                  </div>
                )}

                {posts.length > 0 && hasMore && (
                  <div className="p-4 text-center">
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="w-full sm:w-auto px-6 py-2 bg-[#00564C] hover:bg-[#00423A] text-white text-xs font-semibold rounded-full transition shadow-sm disabled:opacity-50"
                    >
                      {loadingMore ? 'Loading...' : 'Load more posts'}
                    </button>
                  </div>
                )}

                {posts.length > 0 && !hasMore && (
                  <p className="py-6 text-center text-xs text-gray-400 font-medium">
                    You're all caught up
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right Recommended Column */}
          <div className="hidden lg:block w-80 pl-6 py-4 space-y-4 shrink-0">
            <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100 sticky top-20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#00564C]" />
                  <h3 className="text-sm font-bold text-gray-900">Recommended Jobs</h3>
                </div>
                <button 
                  onClick={() => navigate('/freelancer/jobs')}
                  className="text-xs font-semibold text-[#00564C] hover:underline flex items-center gap-0.5"
                >
                  All <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {loadingJobs ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-3 bg-white rounded-xl animate-pulse space-y-2 border border-gray-100">
                      <div className="h-3.5 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : recommendedJobs.length > 0 ? (
                <div className="space-y-2.5">
                  {recommendedJobs.slice(0, 3).map((job) => (
                    <div
                      key={job.id}
                      className="p-3 bg-white rounded-xl border border-gray-100 hover:border-[#00564C]/40 transition group"
                    >
                      <h4 className="font-semibold text-gray-900 text-xs line-clamp-1 group-hover:text-[#00564C] transition">
                        {job.title}
                      </h4>
                      <div className="flex items-center justify-between text-[11px] text-gray-500 mt-1 mb-2">
                        <span className="font-bold text-[#00564C] bg-[#00564C]/10 px-1.5 py-0.5 rounded">
                          {job.budgetRange || 'Flexible'}
                        </span>
                        <span>{job.projectType}</span>
                      </div>
                      <button
                        onClick={() => navigate(`/freelancer/jobs`)}
                        className="w-full py-1.5 bg-[#00564C] hover:bg-[#00423A] text-white text-[11px] font-semibold rounded-lg transition"
                      >
                        View Job
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-gray-400 text-xs">
                  No open jobs found.
                </p>
              )}
            </div>
          </div>

        </main>
      </div>

      {/* Floating Pill Notification for New Posts */}
      {createPortal(
        <AnimatePresence>
          {newPostsCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: -20, x: '-50%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="fixed top-16 left-1/2 z-50"
            >
              <button
                onClick={handleShowNewPosts}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-[#00564C] hover:bg-[#00423A] text-white text-xs font-semibold rounded-full shadow-lg transition"
              >
                <ArrowUp className="w-3.5 h-3.5" />
                {newPostsCount} new post{newPostsCount > 1 ? 's' : ''}
              </button>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default FreelancerFeed;