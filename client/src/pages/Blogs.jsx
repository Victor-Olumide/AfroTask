import { IoSearch, IoClose } from 'react-icons/io5'
import { useState, useMemo, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'
import WhiteNavbar from '../components/navbar/WhiteNavbar'
import WhyAfroTaskBoard from '../components/WhyAfroTaskBoard'
import BlogCard from '../components/BlogCard'
import { AuthContext } from '../context/AuthContext'
import api from '../services/api'
import { X, Trash2, Pencil } from 'lucide-react'
import ProductSection from '../components/landing/ProductSection'

const emptyForm = { title: '', description: '', content: '' }

function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])
  return (
    <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 rounded-xl px-5 py-4 text-sm font-medium text-white shadow-2xl transition-all
      ${type === 'success' ? 'bg-[#00564C]' : 'bg-red-600'}`}>
      {type === 'success' ? '✅' : '❌'} {message}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><X className="h-4 w-4" /></button>
    </div>
  )
}

export default function Blogs() {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [firestoreBlogs, setFirestoreBlogs] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editBlog, setEditBlog] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [visibleCount, setVisibleCount] = useState(3)
  const [inputFocused, setInputFocused] = useState(false)

  const suggestions = ["Freelancing in Nigeria", "Afro task freelancer", "Nigerian freelancer"]

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
      return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    } catch { return '' }
  }

  const allBlogs = useMemo(() => {
    const dynamic = firestoreBlogs.map(b => ({
      id: b.id,
      title: b.title,
      description: b.description,
      content: b.content,
      author: b.authorName,
      date: formatDate(b.createdAt),
      link: b.image || '',
      isFirestore: true,
      authorId: b.authorId,
      raw: b,
    }))
    return [...dynamic]
  }, [firestoreBlogs])

  const filteredSuggestions = useMemo(() => {
    if (!searchTerm.trim()) return []

    // Get unique blog titles that match the search term
    const matchedBlogs = allBlogs.filter(blog =>
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.description.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Extract and deduplicate titles
    const uniqueTitles = [...new Set(matchedBlogs.map(b => b.title))]
    return uniqueTitles.slice(0, 6) // Show top 6 matching blogs
  }, [searchTerm, allBlogs])

  const filteredBlogs = useMemo(() => {
    return allBlogs.filter(blog =>
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (blog.author || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [allBlogs, searchTerm])

  useEffect(() => { setVisibleCount() }, [searchTerm])

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
    setForm({ title: blog.title, description: blog.description, content: blog.raw?.content || '' })
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
      data.append('authorName', user.fullName || user.name || 'Anonymous')

      if (imageFile) {
        console.log('Image file being uploaded:', { name: imageFile.name, size: imageFile.size, type: imageFile.type })
        data.append('image', imageFile)
      } else {
        console.log('No image file selected for upload')
      }

      if (editBlog) {
        await api.put(`/profile/blogs/${editBlog.id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
        showToast('Blog updated successfully!')
      } else {
        const res = await api.post('/profile/blogs', data, { headers: { 'Content-Type': 'multipart/form-data' } })
        console.log('Blog creation response:', res.data)
        showToast('Blog published successfully!')
      }

      await fetchBlogs()
      setForm(emptyForm)
      setImageFile(null)
      setImagePreview(null)
      setShowCreateModal(false)
      setEditBlog(null)
    } catch (err) {
      console.error('Blog save error:', err.response?.data || err.message)
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

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pb-16 pt-16 md:pb-20 md:pt-20">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-80 opacity-60"
          style={{
            background:
              "radial-gradient(60% 100% at 50% 0%, rgba(0,86,76,0.07) 0%, rgba(251,158,1,0.05) 45%, transparent 80%)",
          }}
        />
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <div className="mb-5 inline-flex items-center gap-2">
            <span className="h-px w-6 bg-[#FB9E01]" />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#FB9E01]">
              Our blog
            </p>
            <span className="h-px w-6 bg-[#FB9E01]" />
          </div>
          <h1 className="mb-5 text-4xl font-bold leading-tight tracking-tight text-[#0B1F1C] md:text-5xl">
            Insights on the <span className="text-[#00564C]">freelance</span> economy.
          </h1>
          <p className="mx-auto max-w-xl text-base leading-relaxed text-gray-500 md:text-lg">
            Thoughts, tutorials, and stories from the AfroTask team on how to build, scale, and work in the modern gig economy.
          </p>
        </div>
      </section>

      {/* ── Search ── */}
      <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 sm:px-8">
        <div className="relative w-full">
          <IoSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl text-gray-400" />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setTimeout(() => setInputFocused(false), 200)}
            className="w-full rounded-2xl border border-black/[0.08] bg-white p-4 pl-12 pr-12 text-sm text-gray-900 shadow-[0_1px_2px_rgba(16,24,22,0.04),0_12px_32px_-16px_rgba(16,24,22,0.10)] transition focus:border-[#00564C]/40 focus:outline-none focus:ring-2 focus:ring-[#00564C]/20"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <IoClose className="text-xl" />
            </button>
          )}

          {inputFocused && (
            <>
              {filteredSuggestions.length > 0 && (
                <div className="absolute top-[calc(100%+8px)] z-10 max-h-64 w-full overflow-y-auto rounded-2xl border border-black/[0.06] bg-white shadow-[0_24px_48px_-16px_rgba(16,24,22,0.18)]">
                  {filteredSuggestions.map((sug, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSearchTerm(sug)
                        setInputFocused(false)
                      }}
                      className="flex w-full items-center gap-3 border-l-4 border-transparent px-6 py-3 text-left text-base text-gray-900 transition-colors hover:border-[#00564C] hover:bg-gray-50 focus:outline-none"
                    >
                      <IoSearch className="flex-shrink-0 text-lg text-gray-400" />
                      <span className="truncate">{sug}</span>
                    </button>
                  ))}
                </div>
              )}
              {searchTerm.trim() && filteredSuggestions.length === 0 && (
                <div className="absolute top-[calc(100%+8px)] z-10 w-full rounded-2xl border border-black/[0.06] bg-white shadow-[0_24px_48px_-16px_rgba(16,24,22,0.18)]">
                  <div className="px-6 py-4 text-center text-gray-500">
                    No blogs match &quot;{searchTerm}&quot;
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <WhyAfroTaskBoard />

      {/* Blog list */}
      <div className="p-4 pt-6 sm:p-6 lg:p-8">
        {/* Masonry layout */}
        <div className="mx-auto max-w-7xl columns-1 gap-6 space-y-6 sm:columns-2 lg:columns-3 xl:columns-3">
          {filteredBlogs.slice(0, visibleCount).map((blog) => (
            <div key={blog.id} className="group relative mb-6 break-inside-avoid">
              <BlogCard
                title={blog.title}
                description={blog.description}
                author={blog.author}
                date={blog.date}
                link={blog.link}
                onReadMore={
                  blog.isFirestore ? () => navigate(`/blogs/${blog.id}`) : undefined
                }
              />

              {/* Edit / Delete */}
              {blog.isFirestore && user && blog.authorId === user.id && (
                <div className="absolute right-3 top-3 flex gap-2 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                  <button
                    onClick={() => openEdit(blog)}
                    className="rounded-lg bg-white/95 p-2 text-[#00564C] shadow-md backdrop-blur-sm hover:bg-white"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(blog)}
                    className="rounded-lg bg-white/95 p-2 text-red-600 shadow-md backdrop-blur-sm hover:bg-white"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredBlogs.length === 0 && (
          <div className="mx-auto max-w-md py-16 text-center">
            <p className="mb-1 text-base font-medium text-gray-700">No posts found</p>
            <p className="text-sm text-gray-400">Try a different search term</p>
          </div>
        )}

        {/* View More button (IMPORTANT: outside columns) */}
        {visibleCount < filteredBlogs.length && (
          <div className="mt-10 flex justify-center">
            <button
              onClick={() => setVisibleCount((c) => c + 5)}
              className="rounded-2xl border border-black/[0.06] bg-white px-6 py-3 text-base font-semibold text-[#00564C] shadow-[0_1px_2px_rgba(16,24,22,0.04),0_12px_32px_-16px_rgba(16,24,22,0.10)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-12px_rgba(0,86,76,0.2)] sm:px-8 sm:py-4 sm:text-lg"
            >
              View more
            </button>
          </div>
        )}
      </div>

      <Footer />

      {/* ── Create / Edit Blog Modal ── */}
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
                <label className="mb-1 block text-sm font-medium text-gray-700">Blog title *</label>
                <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-[#00564C]"
                  placeholder="Enter blog title" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Short description *</label>
                <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-[#00564C]"
                  placeholder="Brief preview text" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Full content *</label>
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
                  className="flex-1 rounded-lg bg-[#00564C] px-6 py-3 font-medium text-white transition hover:bg-[#027568] disabled:opacity-60">
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