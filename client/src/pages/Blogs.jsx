import { Search, X, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'
import { useState, useMemo, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'
import WhiteNavbar from '../components/navbar/WhiteNavbar'
import { AuthContext } from '../context/AuthContext'
import api from '../services/api'
import { Trash2, Pencil, CheckCircle2, AlertCircle, Plus } from 'lucide-react'

const emptyForm = { title: '', description: '', content: '', category: '' }
const PAGE_SIZE = 9

function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])
  return (
    <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 rounded-xl px-5 py-4 text-sm font-medium text-white shadow-2xl transition-all
      ${type === 'success' ? 'bg-[#00564C]' : 'bg-red-600'}`}>
      {type === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
      {message}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><X className="h-4 w-4" /></button>
    </div>
  )
}

function initials(name) {
  if (!name) return '?'
  return name.split(' ').map(p => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
}

function BlogTile({ blog, onRead, canEdit, onEdit, onDelete }) {
  return (
    <div className="group relative flex flex-col rounded-2xl border border-black/[0.06] bg-white p-6 shadow-[0_1px_2px_rgba(16,24,22,0.04)] transition hover:shadow-[0_16px_36px_-20px_rgba(16,24,22,0.16)]">
      <button onClick={onRead} disabled={!onRead} className="flex flex-1 flex-col text-left">
        <span className="mb-4 inline-flex w-fit items-center rounded-full bg-[#E6F0EF] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#00564C]">
          {blog.category || 'General'}
        </span>

        <h3 className="mb-2 line-clamp-2 text-lg font-bold leading-snug text-[#0B1F1C]">
          {blog.title}
        </h3>

        <p className="mb-5 line-clamp-3 flex-1 text-sm leading-relaxed text-gray-500">
          {blog.description}
        </p>

        <div className="flex items-center gap-2.5 border-t border-gray-100 pt-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#00564C] text-[10px] font-semibold text-white">
            {initials(blog.author)}
          </div>
          <p className="truncate text-sm font-medium text-gray-800">{blog.author || 'Anonymous'}</p>
          <span className="ml-auto text-xs text-gray-400">{blog.date}</span>
        </div>
      </button>

      {canEdit && (
        <div className="absolute right-4 top-4 flex gap-1.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
          <button onClick={onEdit} className="rounded-lg bg-white/95 p-2 text-[#00564C] shadow-md backdrop-blur-sm hover:bg-white">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button onClick={onDelete} className="rounded-lg bg-white/95 p-2 text-red-600 shadow-md backdrop-blur-sm hover:bg-white">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

export default function Blogs() {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [category, setCategory] = useState('All Categories')
  const [showCategoryMenu, setShowCategoryMenu] = useState(false)
  const [firestoreBlogs, setFirestoreBlogs] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editBlog, setEditBlog] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [page, setPage] = useState(1)

  const showToast = (message, type = 'success') => setToast({ message, type })

  const fetchBlogs = async () => {
    try {
      const res = await api.get('/profile/blogs')
      setFirestoreBlogs(res.data.blogs || [])
    } catch {
      setFirestoreBlogs([])
    }
  }

  useEffect(() => { fetchBlogs() }, [])

  const formatDate = (iso) => {
    if (!iso) return ''
    try {
      return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    } catch { return '' }
  }

  const allBlogs = useMemo(() => {
    return firestoreBlogs
      .map(b => ({
        id: b.id,
        title: b.title,
        description: b.description,
        content: b.content,
        author: b.authorName,
        category: b.category,
        date: formatDate(b.createdAt),
        createdAt: b.createdAt,
        link: b.image || '',
        isFirestore: true,
        authorId: b.authorId,
        raw: b,
      }))
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
  }, [firestoreBlogs])

  const categories = useMemo(() => {
    const set = new Set(allBlogs.map(b => b.category).filter(Boolean))
    return ['All Categories', ...Array.from(set)]
  }, [allBlogs])

  const filteredBlogs = useMemo(() => {
    let list = allBlogs
    if (category !== 'All Categories') {
      list = list.filter(b => b.category === category)
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase()
      list = list.filter(blog =>
        blog.title.toLowerCase().includes(q) ||
        blog.description.toLowerCase().includes(q) ||
        (blog.author || '').toLowerCase().includes(q)
      )
    }
    return list
  }, [allBlogs, searchTerm, category])

  const totalPages = Math.max(1, Math.ceil(filteredBlogs.length / PAGE_SIZE))
  const pagedBlogs = filteredBlogs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => { setPage(1) }, [searchTerm, category])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const openCreate = () => {
    setEditBlog(null)
    setForm(emptyForm)
    setImageFile(null)
    setImagePreview(null)
    setShowCreateModal(true)
  }

  const openEdit = (blog) => {
    setEditBlog(blog)
    setForm({ title: blog.title, description: blog.description, content: blog.raw?.content || '', category: blog.category || '' })
    setImageFile(null)
    setImagePreview(blog.link || null)
    setShowCreateModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) { navigate('/welcome'); return }
    if (!form.title.trim() || !form.description.trim() || !form.content.trim()) return
    setSaving(true)
    try {
      const data = new FormData()
      data.append('title', form.title.trim())
      data.append('description', form.description.trim())
      data.append('content', form.content.trim())
      data.append('category', form.category.trim())
      data.append('authorName', user.fullName || user.name || 'Anonymous')
      if (imageFile) data.append('image', imageFile)

      if (editBlog) {
        await api.put(`/profile/blogs/${editBlog.id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
        showToast('Blog updated successfully!')
      } else {
        await api.post('/profile/blogs', data, { headers: { 'Content-Type': 'multipart/form-data' } })
        showToast('Blog published successfully!')
      }

      await fetchBlogs()
      setForm(emptyForm)
      setImageFile(null)
      setImagePreview(null)
      setShowCreateModal(false)
      setEditBlog(null)
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save blog', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (blog) => {
    if (!window.confirm(`Delete "${blog.title}"?`)) return
    try {
      await api.delete(`/profile/blogs/${blog.id}`)
      showToast('Blog deleted.')
      await fetchBlogs()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete blog', 'error')
    }
  }

  return (
    <div className="relative min-h-screen bg-[#FBFAF7] text-gray-900">
      <WhiteNavbar />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Hero — pill badge, heading, subtext, centered */}
      <section className="relative overflow-hidden pb-14 pt-16 md:pb-16 md:pt-20">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-72 opacity-60"
          style={{
            background: "radial-gradient(60% 100% at 50% 0%, rgba(0,86,76,0.07) 0%, transparent 75%)",
          }}
        />
        <div className="relative mx-auto max-w-2xl px-6 text-center">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-black/[0.06] bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-gray-600 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00564C]" />
            Our blog
          </span>
          <h1 className="mb-4 text-4xl font-bold leading-tight tracking-tight text-[#0B1F1C] md:text-5xl">
            Insights on the <span className="text-[#00564C]">freelance</span> economy.
          </h1>
          <p className="mx-auto max-w-lg text-base leading-relaxed text-gray-500 md:text-lg">
            Thoughts, tutorials, and stories from the AfroTask team on how to build, scale, and work in the modern gig economy.
          </p>
        </div>
      </section>

      {/* Search + category row, directly under hero */}
      <div className="mx-auto max-w-4xl px-4 sm:px-8">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border border-black/[0.08] bg-white py-3.5 pl-11 pr-10 text-sm text-gray-900 shadow-[0_1px_2px_rgba(16,24,22,0.04),0_12px_32px_-16px_rgba(16,24,22,0.10)] outline-none transition focus:border-[#00564C]/40 focus:ring-2 focus:ring-[#00564C]/20"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowCategoryMenu(v => !v)}
              className="flex w-full items-center justify-between gap-3 rounded-2xl border border-black/[0.08] bg-white px-5 py-3.5 text-sm text-gray-700 shadow-[0_1px_2px_rgba(16,24,22,0.04),0_12px_32px_-16px_rgba(16,24,22,0.10)] transition hover:border-[#00564C]/30 sm:w-56"
            >
              <span className="truncate">{category}</span>
              <ChevronDown className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${showCategoryMenu ? 'rotate-180' : ''}`} />
            </button>
            {showCategoryMenu && (
              <div className="absolute right-0 z-10 mt-2 w-full min-w-[14rem] overflow-hidden rounded-2xl border border-black/[0.06] bg-white py-1.5 shadow-[0_24px_48px_-16px_rgba(16,24,22,0.18)]">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => { setCategory(c); setShowCategoryMenu(false) }}
                    className={`block w-full px-4 py-2.5 text-left text-sm transition ${
                      c === category ? 'bg-[#E6F0EF] text-[#00564C] font-medium' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          {user && (
            <button
              onClick={openCreate}
              className="flex items-center justify-center gap-1.5 rounded-2xl bg-[#00564C] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#003F38] whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              New post
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="mx-auto max-w-6xl px-4 pb-6 pt-10 sm:px-8">
        {pagedBlogs.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pagedBlogs.map((blog) => (
              <BlogTile
                key={blog.id}
                blog={blog}
                onRead={blog.isFirestore ? () => navigate(`/blogs/${blog.id}`) : undefined}
                canEdit={blog.isFirestore && user && blog.authorId === user.id}
                onEdit={() => openEdit(blog)}
                onDelete={() => handleDelete(blog)}
              />
            ))}
          </div>
        ) : (
          <div className="mx-auto max-w-md py-20 text-center">
            <p className="mb-1 text-base font-medium text-gray-700">No posts found</p>
            <p className="text-sm text-gray-400">Try a different search term or category</p>
          </div>
        )}

        {/* Pagination */}
        {filteredBlogs.length > 0 && (
          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-6 sm:flex-row">
            <p className="text-sm text-gray-400">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredBlogs.length)} of {filteredBlogs.length} posts
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:border-[#00564C]/30 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </button>
              <span className="px-3 text-sm font-medium text-gray-500">{page} / {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1 rounded-xl bg-[#00564C] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#003F38] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <Footer />

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 p-6">
              <h3 className="text-xl font-bold text-[#0B1F1C]">{editBlog ? 'Edit blog post' : 'Create blog post'}</h3>
              <button onClick={() => setShowCreateModal(false)} className="rounded-full p-2 transition hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Blog title</label>
                <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-[#00564C]"
                  placeholder="Enter blog title" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
                <input type="text" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-[#00564C]"
                  placeholder="e.g. Freelancer Tips, Product Updates" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Short description</label>
                <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-[#00564C]"
                  placeholder="Brief preview text" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Full content</label>
                <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} required rows={6}
                  className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-[#00564C]"
                  placeholder="Write your full blog content here..." />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Blog image</label>
                <input type="file" accept="image/*" onChange={handleImageChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3" />
                {imagePreview && <img src={imagePreview} alt="Preview" className="mt-3 h-48 w-full rounded-lg object-cover" />}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Author</label>
                <input type="text" value={user?.fullName || user?.name || ''} disabled
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)}
                  className="flex-1 rounded-lg border border-gray-300 px-6 py-3 text-gray-700 transition hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 rounded-lg bg-[#00564C] px-6 py-3 font-medium text-white transition hover:bg-[#003F38] disabled:opacity-60">
                  {saving ? (editBlog ? 'Saving...' : 'Publishing...') : (editBlog ? 'Save changes' : 'Publish blog')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}