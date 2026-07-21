import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Briefcase, FileText, BarChart2, LogOut, Plus, Trash2,
  Pencil, X, Upload, Eye, Search, Shield, TrendingUp, Activity,
  ChevronRight, MessageSquare, Flag, Send, User, CheckCircle,
  AlertTriangle, Megaphone, Image as ImageIcon, ThumbsUp,
  Lock, Mail, Save, Loader2, EyeOff, Star,
} from 'lucide-react';
import { FaPager } from "react-icons/fa";
import { motion, AnimatePresence } from 'framer-motion';
import AdminSidebar from '../components/AdminSidebar';
import EnhancedPostCard from '../components/EnhancedPostCard';
import api from '../services/api';
import toast from 'react-hot-toast';

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

const emptyBlog = { title: '', description: '', content: '', authorName: 'AfroTask Admin' };

// ── StatCard ──────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, gradient, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl p-5 border border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.05] transition group"
    >
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition ${gradient}`} />
      <div className="relative z-10">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${gradient} bg-opacity-20`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <p className="text-3xl font-bold text-white mb-1">{value ?? <span className="text-gray-600">—</span>}</p>
        <p className="text-gray-500 text-sm">{label}</p>
      </div>
    </motion.div>
  );
}

// ── BlogModal ─────────────────────────────────────────────────────────────────
function BlogModal({ blog, onClose, onSaved }) {
  const [form, setForm] = useState(blog ? { ...blog } : { ...emptyBlog });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(blog?.image || '');
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  const handleImage = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setImageFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.content) {
      toast.error('Title, description and content are required');
      return;
    }
    setSaving(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== undefined) data.append(k, v); });
      if (imageFile) data.append('image', imageFile);

      if (blog?.id) {
        await api.put(`/admin/blogs/${blog.id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Blog updated!');
      } else {
        await api.post('/admin/blogs', data, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Blog created!');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save blog');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gray-800 rounded-2xl w-full max-w-2xl border border-gray-700 shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-white font-bold text-xl">{blog?.id ? 'Edit Blog' : 'Create Blog'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div
            onClick={() => fileRef.current?.click()}
            className="relative h-40 rounded-xl border-2 border-dashed border-gray-600 hover:border-[#00564C] cursor-pointer overflow-hidden flex items-center justify-center bg-gray-700/50 transition"
          >
            {preview ? (
              <img src={preview} alt="cover" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center text-gray-400">
                <Upload className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Click to upload cover image</p>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
          </div>
          {[
            { label: 'Title', key: 'title', placeholder: 'Blog post title...' },
            { label: 'Author Name', key: 'authorName', placeholder: 'AfroTask Admin' },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
              <input
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                placeholder={placeholder}
                className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#00564C]"
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Short Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              placeholder="Brief summary shown on the blog list..."
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#00564C] resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Content</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={10}
              placeholder="Write the full blog content here..."
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#00564C] resize-y"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-700 transition">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-[#00564C] hover:bg-[#00564C]/90 text-white font-semibold rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2">
              {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {saving ? 'Saving...' : blog?.id ? 'Update Blog' : 'Publish Blog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── CreatePostModal ───────────────────────────────────────────────────────────
function CreatePostModal({ onClose, onSaved }) {
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  const handleImage = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setImageFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) { toast.error('Post content is required'); return; }
    setSaving(true);
    try {
      const data = new FormData();
      data.append('content', content.trim());
      if (imageFile) data.append('image', imageFile);
      await api.post('/admin/posts', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Post published!');
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create post');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl w-full max-w-lg border border-gray-700 shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-700">
          <h2 className="text-white font-bold text-lg">Create Post</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            placeholder="What's on your mind? Share an update, tip, or announcement..."
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#00564C] resize-none text-sm"
          />
          {preview && (
            <div className="relative rounded-xl overflow-hidden h-40">
              <img src={preview} alt="preview" className="w-full h-full object-cover" />
              <button type="button" onClick={() => { setPreview(''); setImageFile(null); }}
                className="absolute top-2 right-2 p-1 bg-black/60 rounded-full text-white hover:bg-black/80">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <div className="flex items-center justify-between">
            <button type="button" onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-white/[0.06] rounded-xl text-sm transition">
              <ImageIcon className="w-4 h-4" /> Add Image
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-700 text-sm transition">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="px-4 py-2 bg-[#00564C] hover:bg-[#006b5e] text-white rounded-xl text-sm font-medium transition disabled:opacity-50 flex items-center gap-2">
                {saving && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {saving ? 'Posting...' : 'Publish Post'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── BroadcastModal ────────────────────────────────────────────────────────────
function BroadcastModal({ onClose, prefillUserId = null, prefillUserName = null }) {
  const [form, setForm] = useState({ subject: '', message: '', targetRole: 'all' });
  const [sending, setSending] = useState(false);
  const isDirect = !!prefillUserId;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!form.message.trim()) { toast.error('Message is required'); return; }
    setSending(true);
    try {
      if (isDirect) {
        await api.post(`/admin/message/${prefillUserId}`, { subject: form.subject, message: form.message });
        toast.success(`Message sent to ${prefillUserName || 'user'}!`);
      } else {
        const res = await api.post('/admin/broadcast', form);
        toast.success(`Broadcast sent to ${res.data.sent} users!`);
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl w-full max-w-lg border border-gray-700 shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              {isDirect ? <Send className="w-4 h-4 text-yellow-400" /> : <Megaphone className="w-4 h-4 text-yellow-400" />}
            </div>
            <h2 className="text-white font-bold text-lg">
              {isDirect ? `Message ${prefillUserName || 'User'}` : 'Broadcast to Users'}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSend} className="p-5 space-y-4">
          {!isDirect && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Target Audience</label>
              <select
                value={form.targetRole}
                onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-[#00564C] text-sm"
              >
                <option value="all">All Users</option>
                <option value="freelancer">Freelancers Only</option>
                <option value="client">Clients Only</option>
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Subject (optional)</label>
            <input
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="Message from AfroTask Admin"
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#00564C] text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Message</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={5}
              placeholder="Write your message here..."
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#00564C] resize-none text-sm"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-700 text-sm transition">
              Cancel
            </button>
            <button type="submit" disabled={sending} className="flex-1 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-xl text-sm transition disabled:opacity-50 flex items-center justify-center gap-2">
              {sending && <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />}
              {sending ? 'Sending...' : isDirect ? 'Send Message' : 'Broadcast'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


// ── PostsTab ──────────────────────────────────────────────────────────────────
function PostsTab() {
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
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder={subTab === 'posts' ? 'Search posts...' : 'Search reports...'}
          className="w-full pl-11 pr-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#00564C]/50 text-sm transition"
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

// ── ReviewsTab ────────────────────────────────────────────────────────────────
function ReviewsTab() {
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

  const filtered = reviews.filter(r => {
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

  const ratingCounts = [5, 4, 3, 2, 1].map(n => ({
    star: n,
    count: reviews.filter(r => r.rating === n).length,
  }));

  function StarRow({ rating }) {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(s => (
          <Star key={s} className={`w-3.5 h-3.5 ${s <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700'}`} />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Summary bar */}
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by reviewer, freelancer, or comment..."
            className="w-full pl-11 pr-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#00564C]/50 text-sm transition"
          />
        </div>
        <select
          value={filterRating}
          onChange={e => setFilterRating(e.target.value)}
          className="px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm focus:outline-none focus:border-[#00564C]/50 transition"
        >
          <option value="all">All Ratings</option>
          {[5, 4, 3, 2, 1].map(n => (
            <option className='text-black' key={n} value={n}>{n} Star{n !== 1 ? 's' : ''}</option>
          ))}
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-white/[0.03] animate-pulse" />)}
        </div>
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
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition group"
            >
              <div className="flex items-start gap-3 md:gap-4">
                {/* Reviewer avatar */}
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
                {/* Delete — always visible on mobile, hover-only on desktop */}
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

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user, logout } = useAdmin();
  const navigate = useNavigate();
  const [tab, setTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || 'overview';
  });
  const [stats, setStats] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [blogModal, setBlogModal] = useState(null);
  const [broadcastModal, setBroadcastModal] = useState(null); // null | { userId?, userName? }
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

  const TABS = [
    { id: 'overview', label: 'Overview', icon: BarChart2 },
    { id: 'blogs', label: 'Blogs', icon: FileText },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'posts', label: 'Posts', icon: MessageSquare },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'profile', label: 'My Profile', icon: User },
  ];

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
        tab={tab}
        setTab={setTab}
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
                <div className="space-y-8">
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard icon={Users} label="Total Users" value={stats?.totalUsers} gradient="bg-blue-500" delay={0} />
                    <StatCard icon={TrendingUp} label="Freelancers" value={stats?.freelancers} gradient="bg-emerald-500" delay={0.05} />
                    <StatCard icon={Activity} label="Clients" value={stats?.clients} gradient="bg-yellow-500" delay={0.1} />
                    <StatCard icon={Briefcase} label="Total Jobs" value={stats?.totalJobs} gradient="bg-purple-500" delay={0.15} />
                    <StatCard icon={BarChart2} label="Projects" value={stats?.totalProjects} gradient="bg-pink-500" delay={0.2} />
                    <StatCard icon={FileText} label="Blog Posts" value={stats?.totalBlogs} gradient="bg-[#00564C]" delay={0.25} />
                  </div>
                  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
                    <p className="text-white font-semibold mb-4 text-sm">Quick Actions</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { label: 'Manage Blogs', color: 'emerald', action: () => setTab('blogs') },
                        { label: 'View Users', color: 'blue', action: () => setTab('users') },
                        { label: 'View Posts', color: 'purple', action: () => setTab('posts') },
                        { label: 'Broadcast', color: 'yellow', action: () => setBroadcastModal({}) },
                      ].map(({ label, color, action }) => (
                        <button key={label} onClick={action}
                          className={`py-3 px-4 rounded-xl text-sm font-medium transition border
                            ${color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' : ''}
                            ${color === 'blue' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20' : ''}
                            ${color === 'purple' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20' : ''}
                            ${color === 'yellow' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20' : ''}
                          `}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Search bar for list tabs */}
              {(tab === 'blogs' || tab === 'users' || tab === 'jobs') && (
                <div className="relative mb-6">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input value={search} onChange={(e) => setSearch(e.target.value)}
                    placeholder={`Search ${tab}...`}
                    className="w-full pl-11 pr-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#00564C]/50 text-sm transition"
                  />
                </div>
              )}

              {/* Blogs */}
              {tab === 'blogs' && (
                loading ? (
                  <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-2xl bg-white/[0.03] animate-pulse" />)}</div>
                ) : filteredBlogs.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-7 h-7 text-gray-600" />
                    </div>
                    <p className="text-gray-500 text-sm">No blogs yet.</p>
                    <button onClick={() => setBlogModal({})} className="mt-4 px-5 py-2 bg-[#00564C] text-white rounded-xl text-sm hover:bg-[#006b5e] transition">
                      Create your first post
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredBlogs.map((blog, i) => (
                      <motion.div key={blog.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                        className="flex items-center gap-3 p-3 md:p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition group">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden flex-shrink-0 bg-white/[0.05]">
                          {blog.image ? <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center"><FileText className="w-5 h-5 text-gray-600" /></div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold text-sm truncate">{blog.title}</p>
                          <p className="text-gray-500 text-xs truncate mt-0.5 hidden sm:block">{blog.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-gray-600">By {blog.authorName || 'Admin'}</span>
                            {blog.createdAt && <span className="text-[10px] text-gray-700">• {new Date(blog.createdAt).toLocaleDateString()}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition">
                          <a href={`/blogs/${blog.id}`} target="_blank" rel="noreferrer"
                            className="p-2 text-gray-500 hover:text-white hover:bg-white/[0.08] rounded-lg transition">
                            <Eye className="w-4 h-4" />
                          </a>
                          <button onClick={() => setBlogModal(blog)} className="p-2 text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => deleteBlog(blog.id)} className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )
              )}

              {/* Users */}
              {tab === 'users' && (
                loading ? (
                  <div className="space-y-2">{[...Array(6)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-white/[0.03] animate-pulse" />)}</div>
                ) : (
                  <>
                    {/* ── Mobile card list (< md) ── */}
                    <div className="md:hidden space-y-2">
                      {filteredUsers.length === 0 ? (
                        <div className="text-center py-12 text-gray-600 text-sm">No users found</div>
                      ) : filteredUsers.map((u, i) => (
                        <motion.div key={u.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                          className="flex items-center gap-3 p-3 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
                          <img
                            src={u.role === 'admin' ? '/img/afro-task.png' : (u.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.fullName || 'U')}&background=00564C&color=fff`)}
                            alt={u.fullName}
                            className="w-10 h-10 rounded-full object-cover ring-1 ring-white/10 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{u.fullName}</p>
                            <p className="text-gray-500 text-xs truncate">{u.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                u.role === 'freelancer' ? 'bg-emerald-500/15 text-emerald-400' :
                                u.role === 'client' ? 'bg-yellow-500/15 text-yellow-400' : 'bg-purple-500/15 text-purple-400'
                              }`}>{u.role}</span>
                              <span className="text-gray-600 text-[10px]">
                                {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button onClick={() => navigate(u.role === 'admin' ? `/admin/profile/${u.id}` : `/profile/${u.id}`)}
                              className="p-2 text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition" title="View profile">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button onClick={() => setBroadcastModal({ userId: u.id, userName: u.fullName })}
                              className="p-2 text-gray-500 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition" title="Message">
                              <Send className="w-4 h-4" />
                            </button>
                            <button onClick={() => deleteUser(u.id)}
                              className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* ── Desktop table (≥ md) ── */}
                    <div className="hidden md:block rounded-2xl border border-white/[0.06] overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-white/[0.06]">
                            {['User', 'Role', 'Joined', 'Last Seen', ''].map(h => (
                              <th key={h} className="text-left px-5 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.map((u, i) => (
                            <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                              className="border-b border-white/[0.04] hover:bg-white/[0.03] transition group">
                              <td className="px-5 py-3">
                                <div className="flex items-center gap-3">
                                  <img src={u.role === 'admin' ? '/img/afro-task.png' : (u.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.fullName || 'U')}&background=00564C&color=fff`)}
                                    alt={u.fullName} className="w-8 h-8 rounded-full object-cover ring-1 ring-white/10" />
                                  <div>
                                    <p className="text-white text-sm font-medium">{u.fullName}</p>
                                    <p className="text-gray-600 text-xs">{u.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-3">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                  u.role === 'freelancer' ? 'bg-emerald-500/15 text-emerald-400' :
                                  u.role === 'client' ? 'bg-yellow-500/15 text-yellow-400' : 'bg-purple-500/15 text-purple-400'
                                }`}>{u.role}</span>
                              </td>
                              <td className="px-5 py-3 text-gray-400 text-xs">
                                {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                              </td>
                              <td className="px-5 py-3 text-gray-400 text-xs">
                                {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                              </td>
                              <td className="px-5 py-3 text-right">
                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
                                  <button onClick={() => navigate(u.role === 'admin' ? `/admin/profile/${u.id}` : `/profile/${u.id}`)}
                                    className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition" title="View profile">
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => setBroadcastModal({ userId: u.id, userName: u.fullName })}
                                    className="p-1.5 text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition" title="Send notification">
                                    <Send className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => deleteUser(u.id)}
                                    className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                      {filteredUsers.length === 0 && <div className="text-center py-12 text-gray-600 text-sm">No users found</div>}
                    </div>
                  </>
                )
              )}

              {/* Jobs */}
              {tab === 'jobs' && (
                loading ? (
                  <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 rounded-2xl bg-white/[0.03] animate-pulse" />)}</div>
                ) : filteredJobs.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
                      <Briefcase className="w-7 h-7 text-gray-600" />
                    </div>
                    <p className="text-gray-500 text-sm">No jobs found</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredJobs.map((job, i) => (
                      <motion.div key={job.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                        className="flex items-center gap-3 px-3 md:px-5 py-3 md:py-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition group">
                        <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                          <Briefcase className="w-4 h-4 text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-semibold truncate">{job.title}</p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${job.status === 'open' ? 'bg-green-500/15 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                              {job.status?.toUpperCase()}
                            </span>
                            {job.budgetRange && <span className="text-xs text-gray-600">{job.budgetRange}</span>}
                          </div>
                        </div>
                        <button onClick={() => deleteJob(job.id)}
                          className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition md:opacity-0 md:group-hover:opacity-100 flex-shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )
              )}

              {/* Posts & Reports */}
              {tab === 'posts' && <PostsTab />}

              {/* Reviews */}
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
