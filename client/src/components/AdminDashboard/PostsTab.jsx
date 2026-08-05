import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPager } from 'react-icons/fa';
import { Flag, MessageSquare, Plus, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';
import EnhancedPostCard from '../../components/EnhancedPostCard';
import CreatePostModal from './CreatePostModal';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function PostsTab() {
  const [subTab, setSubTab] = useState('posts');
  const [posts, setPosts] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [createPostOpen, setCreatePostOpen] = useState(false);

  useEffect(() => {
    if (subTab === 'posts') fetchPosts();
    else fetchReports();
  }, [subTab]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/posts');
      setPosts(res.data.posts || []);
    } catch { toast.error('Failed to load posts'); }
    finally { setLoading(false); }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/reports');
      setReports(res.data.reports || []);
    } catch { toast.error('Failed to load reports'); }
    finally { setLoading(false); }
  };

  const deletePost = async (id) => {
    if (!confirm('Delete this post?')) return;
    try {
      await api.delete(`/admin/posts/${id}`);
      toast.success('Post deleted');
      fetchPosts();
    } catch { toast.error('Failed to delete post'); }
  };

  const resolveReport = async (id) => {
    try {
      await api.put(`/admin/reports/${id}/resolve`);
      toast.success('Report resolved');
      fetchReports();
    } catch { toast.error('Failed to resolve'); }
  };

  const dismissReport = async (id) => {
    if (!confirm('Dismiss this report?')) return;
    try {
      await api.delete(`/admin/reports/${id}`);
      toast.success('Report dismissed');
      fetchReports();
    } catch { toast.error('Failed to dismiss'); }
  };

  const pendingReports = reports.filter(r => r.status !== 'resolved').length;

  const filteredPosts = posts.filter(p =>
    p.content?.toLowerCase().includes(search.toLowerCase()) ||
    p.author?.fullName?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredReports = reports.filter(r =>
    r.reason?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5 ">
        <div className="flex gap-1 p-1 bg-white/[0.04] rounded-xl border border-white/[0.06]">
          {[{ id: 'posts', label: 'All Posts', icon: FaPager }, { id: 'reports', label: 'Reports', icon: Flag }].map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => { setSubTab(id); setSearch(''); }}
              className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition ${subTab === id ? 'bg-[#00564C] text-white' : 'text-gray-500 hover:text-gray-300'}`}>
              <Icon className="w-3.5 h-3.5" />
              {label}
              {id === 'reports' && pendingReports > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-[10px] rounded-full font-bold">{pendingReports}</span>
              )}
            </button>
          ))}
        </div>
        {subTab === 'posts' && (
          <button onClick={() => setCreatePostOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#00564C] hover:bg-[#006b5e] text-white rounded-xl text-sm font-medium transition sm:ml-auto">
            <Plus className="w-4 h-4" /> Create Post
          </button>
        )}
      </div>

      <div className="relative mb-5">
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder={subTab === 'posts' ? 'Search posts...' : 'Search reports...'}
          className="w-full pl-4 pr-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#00564C]/50 text-sm transition"
        />
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-white/[0.03] animate-pulse" />)}</div>
      ) : subTab === 'posts' ? (
        filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center md:mx-auto mb-4">
              <MessageSquare className="w-7 h-7 text-gray-600" />
            </div>
            <p className="text-gray-500 text-sm">No posts found</p>
            <button onClick={() => setCreatePostOpen(true)} className="mt-4 px-5 py-2 bg-[#00564C] text-white rounded-xl text-sm hover:bg-[#006b5e] transition">
              Create first post
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPosts.map((post) => (
              <EnhancedPostCard
                key={post.id}
                post={post}
                isAdminView={true}
                onDelete={(id) => { setPosts(prev => prev.filter(p => p.id !== id)); }}
              />
            ))}
          </div>
        )
      ) : (
        filteredReports.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
              <Flag className="w-7 h-7 text-gray-600" />
            </div>
            <p className="text-gray-500 text-sm">No reports</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredReports.map((report, i) => (
              <motion.div key={report.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className={`p-4 rounded-2xl border transition ${report.status === 'resolved' ? 'border-white/[0.04] bg-white/[0.01] opacity-60' : 'border-red-500/20 bg-red-500/[0.04] hover:bg-red-500/[0.06]'}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${report.status === 'resolved' ? 'bg-green-500/15' : 'bg-red-500/15'}`}>
                    {report.status === 'resolved'
                      ? <CheckCircle className="w-4 h-4 text-green-400" />
                      : <AlertTriangle className="w-4 h-4 text-red-400" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${report.status === 'resolved' ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                          {report.status === 'resolved' ? 'Resolved' : 'Pending'}
                        </span>
                        <span className="text-gray-500 text-xs capitalize">{report.type || 'post'} report</span>
                      </div>
                      {report.createdAt && (
                        <span className="text-gray-600 text-xs flex-shrink-0">{new Date(report.createdAt).toLocaleDateString()}</span>
                      )}
                    </div>
                    <p className="text-gray-300 text-sm font-medium">{report.reason || 'No reason provided'}</p>
                    {report.details && <p className="text-gray-500 text-xs mt-1 line-clamp-2">{report.details}</p>}
                    {report.contentPreview && <p className="text-gray-600 text-xs mt-1 italic line-clamp-1">"{report.contentPreview}"</p>}
                  </div>
                  {report.status !== 'resolved' && (
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => resolveReport(report.id)}
                        className="p-2.5 text-gray-500 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition" title="Mark resolved">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button onClick={() => dismissReport(report.id)}
                        className="p-2.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition" title="Dismiss">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )
      )}

      {createPostOpen && <CreatePostModal onClose={() => setCreatePostOpen(false)} onSaved={fetchPosts} />}
    </div>
  );
}
