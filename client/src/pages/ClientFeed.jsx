import { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, Briefcase, Users, FolderCheck, PlusCircle } from 'lucide-react';
import { createPortal } from 'react-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/navbar/Navbar';
import Sidebar from '../components/Sidebar';
import FeedHeader from '../components/FeedHeader';
import ProfileCompletionCompact from '../components/ProfileCompletionCompact';
import CodePostCard from '../components/CodePostCard';
import JobAnnouncementCard from '../components/JobAnnouncementCard';
import { useNavigate } from 'react-router-dom';

const LIMIT = 10;
const POLL_INTERVAL = 45000;

const StatCard = ({ icon: Icon, label, value }) => (
  <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3">
    <div className="w-10 h-10 rounded-xl bg-[#E6F0EF] flex items-center justify-center shrink-0">
      <Icon className="w-5 h-5 text-[#00564C]" />
    </div>
    <div className="min-w-0">
      <p className="text-lg font-bold text-gray-900 leading-none">{value}</p>
      <p className="text-xs text-gray-500 mt-1 truncate">{label}</p>
    </div>
  </div>
);

const ClientFeed = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('feed');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const [newPostsCount, setNewPostsCount] = useState(0);
  const latestPostIdRef = useRef(null);
  const pollTimerRef = useRef(null);

  const [stats, setStats] = useState({ activeJobs: 0, applicants: 0, projectsToApprove: 0 });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchStats();
    loadFeed(1, true);
    fetchRecentActivity();
    return () => clearInterval(pollTimerRef.current);
  }, []);

  useEffect(() => {
    loadFeed(1, true);
  }, [activeTab, searchQuery]);

  const buildQuery = (pageNum) => {
    let q = `page=${pageNum}&limit=${LIMIT}`;
    if (searchQuery) q += `&search=${encodeURIComponent(searchQuery)}`;
    if (activeTab === 'jobs') q += `&status=open`;
    return q;
  };

  const endpointForTab = () => (activeTab === 'jobs' ? '/jobs' : '/posts/feed');

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

  const fetchStats = async () => {
    if (!user?.id) return;
    try {
      const [jobsRes, projectsRes] = await Promise.all([
        api.get('/jobs/my-jobs').catch(() => ({ data: { jobs: [] } })),
        api.get('/projects').catch(() => ({ data: { projects: [] } })),
      ]);
      const activeJobs = jobsRes.data.jobs?.filter(j => j.status === 'open').length || 0;
      const totalApplicants = jobsRes.data.jobs?.reduce((s, j) => s + (j.applicantsCount || 0), 0) || 0;
      setStats({ activeJobs, applicants: totalApplicants, projectsToApprove: 0 });
    } catch {
      // silent
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const res = await api.get('/jobs/my-jobs');
      setRecentActivity((res.data.jobs || []).slice(0, 5));
    } catch {
      // silent
    }
  };

  const Skeleton = () => (
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 animate-pulse">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full" />
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

        <div className="lg:p-8 p-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <h1 className="lg:text-3xl md:text-2xl text-xl font-bold text-gray-900 mb-2">
                Good day, {user?.fullName?.split(' ')[0]} 👋
              </h1>
              <p className="text-gray-500 lg:text-base text-xs">
                Here's what's happening with your projects today
              </p>
            </motion.div>

            <ProfileCompletionCompact userRole="client" />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <StatCard icon={Briefcase} label="Active jobs" value={stats.activeJobs} />
              <StatCard icon={Users} label="Applicants to review" value={stats.applicants} />
              <StatCard icon={FolderCheck} label="Projects to approve" value={stats.projectsToApprove} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-t-2xl border border-gray-100 overflow-hidden">
                  <FeedHeader
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    onRefresh={() => loadFeed(1, true)}
                    refreshing={loading}
                    searchValue={searchQuery}
                    onSearchChange={setSearchQuery}
                  />
                </div>

                <div className="mt-6">
                  {loading ? (
                    <Skeleton />
                  ) : (
                    <>
                      <div className="space-y-6">
                        {posts.map(post =>
                          post.type === 'job' || activeTab === 'jobs' ? (
                            <JobAnnouncementCard
                              key={post.id}
                              job={post.job || post}
                              onView={() => navigate(`/client/jobs`)}
                            />
                          ) : (
                            <CodePostCard
                              key={post.id}
                              post={post}
                              currentUserId={user?.id || user?.uid}
                              onLike={(id) => api.post(`/posts/${id}/like`)}
                              onComment={(id) => navigate(`/client/feed`)}
                              onRepost={(id) => api.post(`/posts/${id}/repost`)}
                              onBookmark={(id) => api.post(`/posts/${id}/bookmark`)}
                              onShare={(id) =>
                                navigator.share?.({ url: `${window.location.origin}/posts/${id}` })
                              }
                            />
                          )
                        )}
                      </div>

                      {posts.length === 0 && (
                        <div className="text-center py-12 bg-white border border-gray-100 rounded-2xl">
                          <p className="text-gray-500">No posts yet. Start following freelancers!</p>
                        </div>
                      )}

                      {posts.length > 0 && hasMore && (
                        <div className="mt-8 text-center">
                          <button
                            onClick={handleLoadMore}
                            disabled={loadingMore}
                            className="px-8 py-2.5 bg-[#00564C] hover:bg-[#003F38] text-white rounded-xl font-medium text-sm transition disabled:opacity-50"
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

              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white border border-gray-100 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-900">Recent Activity</h3>
                    <button
                      onClick={() => navigate('/client/jobs')}
                      className="text-xs text-[#00564C] hover:text-[#003F38] font-medium"
                    >
                      See all
                    </button>
                  </div>
                  <div className="space-y-3">
                    {recentActivity.map((job, index) => (
                      <div key={index} className="flex items-start gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                        <div className="w-1.5 h-1.5 bg-[#00564C] rounded-full mt-1.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{job.title}</p>
                          <p className="text-xs text-gray-400">{job.applicantsCount || 0} applicants</p>
                        </div>
                      </div>
                    ))}
                    {recentActivity.length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-4">No recent activity</p>
                    )}
                  </div>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-gray-900 mb-3">Quick Actions</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => navigate('/client/post-job')}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#00564C] hover:bg-[#003F38] text-white rounded-lg font-medium transition text-sm"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Post New Job
                    </button>
                    <button
                      onClick={() => navigate('/client/jobs')}
                      className="w-full px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg font-medium transition text-sm"
                    >
                      View Applications
                    </button>
                    <button
                      onClick={() => navigate('/client/projects/ongoing')}
                      className="w-full px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg font-medium transition text-sm"
                    >
                      Manage Projects
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

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

export default ClientFeed;