import { motion } from 'framer-motion';
import { Search, FileText, Eye, Pencil, Trash2 } from 'lucide-react';

export default function BlogsTab({ loading, filteredBlogs, search, setSearch, setBlogModal, deleteBlog }) {
  return (
    <div>
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search blogs..."
          className="w-full pl-11 pr-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#00564C]/50 text-sm transition"
        />
      </div>

      {loading ? (
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
      )}
    </div>
  );
}
