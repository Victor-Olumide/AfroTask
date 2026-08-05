import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Megaphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminSidebar from '../components/AdminSidebar';
import api from '../services/api';
import toast from 'react-hot-toast';
import AdminOverview from '../components/AdminDashboard/AdminOverview';
import BlogModal from '../components/AdminDashboard/BlogModal';
import BroadcastModal from '../components/AdminDashboard/BroadcastModal';
import PostsTab from '../components/AdminDashboard/PostsTab';
import ReviewsTab from '../components/AdminDashboard/ReviewsTab';
import BlogsTab from '../components/AdminDashboard/BlogsTab';
import UsersTab from '../components/AdminDashboard/UsersTab';
import JobsTab from '../components/AdminDashboard/JobsTab';

// ── helpers ──────────────────────────────────────────────────────────────────
function useAdmin() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = (() => { try { return JSON.parse(localStorage.getItem('adminUser')); } catch { return null; } })();

  useEffect(() => {
    if (!token || !user || user.role !== 'admin') {
      navigate('/admin/login');
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  return { user, logout };
}

export default function AdminDashboard() {
  const { user, logout } = useAdmin();
  const navigate = useNavigate();
  const { tab: tabParam } = useParams();
  const tab = tabParam || 'overview';

  const setTab = (id) => navigate(`/admin/dashboard/${id}`);

  const [stats, setStats] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [blogModal, setBlogModal] = useState(null);
  const [broadcastModal, setBroadcastModal] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchStats(); }, []);
  useEffect(() => {
    if (tab === 'blogs') fetchBlogs();
    if (tab === 'users') fetchUsers();
    if (tab === 'jobs') fetchJobs();
  }, [tab]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data.stats);
    } catch { toast.error('Failed to load stats'); }
  };

  const fetchBlogs = async () => {
    setLoading(true);
    try { const res = await api.get('/admin/blogs'); setBlogs(res.data.blogs || []); }
    catch { toast.error('Failed to load blogs'); }
    finally { setLoading(false); }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try { const res = await api.get('/admin/users'); setUsers(res.data.users || []); }
    catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  const fetchJobs = async () => {
    setLoading(true);
    try { const res = await api.get('/admin/jobs'); setJobs(res.data.jobs || []); }
    catch { toast.error('Failed to load jobs'); }
    finally { setLoading(false); }
  };

  const deleteBlog = async (id) => {
    if (!confirm('Delete this blog?')) return;
    try { await api.delete(`/admin/blogs/${id}`); toast.success('Blog deleted'); fetchBlogs(); }
    catch { toast.error('Failed to delete'); }
  };

  const deleteUser = async (id) => {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    try { await api.delete(`/admin/users/${id}`); toast.success('User deleted'); fetchUsers(); }
    catch { toast.error('Failed to delete user'); }
  };

  const deleteJob = async (id) => {
    if (!confirm('Delete this job?')) return;
    try { await api.delete(`/admin/jobs/${id}`); toast.success('Job deleted'); fetchJobs(); }
    catch { toast.error('Failed to delete job'); }
  };

  const filteredBlogs = blogs.filter(b =>
    b.title?.toLowerCase().includes(search.toLowerCase()) ||
    b.authorName?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredUsers = users.filter(u =>
    u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredJobs = jobs.filter(j =>
    j.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <AdminSidebar
        user={user}
        setSearch={setSearch}
        logout={logout}
        onBroadcast={() => setBroadcastModal({})}
      />

      {/* Main */}
      <div className="md:ml-60 flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 flex items-center justify-between px-4 md:px-8 py-3 md:py-4 border-b border-white/[0.06] bg-[#060d0c]/20 backdrop-blur gap-3">
          <div className="min-w-0">
            <h1 className="text-base md:text-lg font-bold text-white capitalize truncate">
              {tab === 'overview' ? 'Dashboard' : tab === 'posts' ? 'Posts & Reports' : tab}
            </h1>
            <p className="text-gray-600 text-xs mt-0.5 hidden sm:block">
              {tab === 'overview' && 'Platform activity at a glance'}
              {tab === 'blogs' && 'Create and manage blog posts'}
              {tab === 'users' && 'View and manage registered users'}
              {tab === 'jobs' && 'Monitor job postings'}
              {tab === 'posts' && 'Manage community posts and handle reports'}
              {tab === 'reviews' && 'View and moderate user reviews'}
              {tab === 'profile' && 'Manage your admin account'}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {tab === 'blogs' && (
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => setBlogModal({})}
                className="flex items-center gap-2 px-3 md:px-4 py-2 bg-[#00564C] hover:bg-[#006b5e] text-white rounded-xl text-sm font-medium transition shadow-lg shadow-[#00564C]/20">
                <Plus className="w-4 h-4" /> <span className="hidden sm:inline">New Blog</span>
              </motion.button>
            )}
            {tab === 'users' && (
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => setBroadcastModal({})}
                className="flex items-center gap-2 px-3 md:px-4 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 rounded-xl text-sm font-medium transition">
                <Megaphone className="w-4 h-4" /> <span className="hidden sm:inline">Broadcast</span>
              </motion.button>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>

              {/* Overview */}
              {tab === 'overview' && (
                <AdminOverview
                  stats={stats}
                  onAction={(action) => {
                    if (action === 'broadcast') {
                      setBroadcastModal({});
                    } else {
                      setTab(action);
                    }
                  }}
                />
              )}

              {tab === 'blogs' && (
                <BlogsTab
                  loading={loading}
                  filteredBlogs={filteredBlogs}
                  search={search}
                  setSearch={setSearch}
                  setBlogModal={setBlogModal}
                  deleteBlog={deleteBlog}
                />
              )}

              {tab === 'users' && (
                <UsersTab
                  loading={loading}
                  filteredUsers={filteredUsers}
                  search={search}
                  setSearch={setSearch}
                  navigate={navigate}
                  onBroadcastUser={(userId, userName) => setBroadcastModal({ userId, userName })}
                  onDeleteUser={deleteUser}
                />
              )}

              {tab === 'jobs' && (
                <JobsTab
                  loading={loading}
                  filteredJobs={filteredJobs}
                  onDeleteJob={deleteJob}
                />
              )}

              {tab === 'posts' && <PostsTab />}
              {tab === 'reviews' && <ReviewsTab />}


            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Modals */}
      {blogModal !== null && (
        <BlogModal blog={blogModal?.id ? blogModal : null} onClose={() => setBlogModal(null)} onSaved={fetchBlogs} />
      )}
      {broadcastModal !== null && (
        <BroadcastModal
          onClose={() => setBroadcastModal(null)}
          prefillUserId={broadcastModal.userId}
          prefillUserName={broadcastModal.userName}
        />
      )}
    </div>
  );
}
