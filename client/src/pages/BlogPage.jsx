import { useState, useEffect, useMemo, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { X, ArrowLeft } from 'lucide-react'

import { AuthContext } from '../context/AuthContext'
import api from '../services/api'

import LoadingScreen from '../components/LoadingScreen'
import WhiteNavbar from '../components/navbar/WhiteNavbar'
import Footer from '../components/Footer'
import BlogHeader from '../components/blog/BlogHeader'
import BlogContent from '../components/blog/BlogContent'
import BlogShareBar from '../components/blog/BlogShareBar'
import BlogComments from '../components/blog/BlogComments'
import BlogSuggestions from '../components/blog/BlogSuggestions'
import BlogEditModal from '../components/blog/BlogEditModal'

// ── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl text-white text-sm font-medium transition-all
      ${type === 'success' ? 'bg-[#00564C]' : 'bg-red-600'}`}>
      {type === 'success' ? '✅' : '❌'} {message}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const emptyForm = { title: '', description: '', content: '' }

const formatDate = (iso) => {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch { return '' }
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function BlogPage() {
  const { user } = useContext(AuthContext)
  const { blogId } = useParams()
  const navigate = useNavigate()

  // data
  const [firestoreBlogs, setFirestoreBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentBlog, setCurrentBlog] = useState(null)

  // delete
  const [deleting, setDeleting] = useState(false)

  // edit modal
  const [showEditModal, setShowEditModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [saving, setSaving] = useState(false)

  // comments
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [loadingComments, setLoadingComments] = useState(false)

  // toast
  const [toast, setToast] = useState(null)
  const showToast = (message, type = 'success') => setToast({ message, type })

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchBlogs = async () => {
    try {
      const res = await api.get('/profile/blogs')
      setFirestoreBlogs(res.data.blogs || [])
    } catch {
      setFirestoreBlogs([])
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    if (!blogId) return
    setLoadingComments(true)
    try {
      const res = await api.get(`/profile/blogs/${blogId}/comments`)
      setComments(res.data.comments || [])
    } catch (err) {
      console.error('Failed to fetch comments:', err)
      setComments([])
    } finally {
      setLoadingComments(false)
    }
  }

  useEffect(() => { fetchBlogs() }, [])

  // ── Derived state ──────────────────────────────────────────────────────────
  const allBlogs = useMemo(() => firestoreBlogs.map((b) => ({
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
  })), [firestoreBlogs])

  useEffect(() => {
    if (allBlogs.length > 0) {
      const found = allBlogs.find((b) => String(b.id) === String(blogId))
      setCurrentBlog(found || null)
      if (found) fetchComments()
    }
  }, [allBlogs, blogId])

  const suggestions = useMemo(() => {
    if (!currentBlog) return []
    return allBlogs
      .filter((b) => b.id !== currentBlog.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
  }, [allBlogs, currentBlog])

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!currentBlog?.isFirestore) return
    if (!window.confirm(`Delete "${currentBlog.title}"?`)) return
    setDeleting(true)
    try {
      await api.delete(`/profile/blogs/${currentBlog.id}`)
      navigate('/blogs')
    } catch (err) {
      console.error(err)
      alert('Failed to delete blog')
    } finally {
      setDeleting(false)
    }
  }

  const openEdit = () => {
    setForm({ title: currentBlog.title, description: currentBlog.description, content: currentBlog.content })
    setImageFile(null)
    setImagePreview(currentBlog.link || null)
    setShowEditModal(true)
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) {
      setImageFile(null)
      setImagePreview(null)
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.description.trim() || !form.content.trim()) return
    setSaving(true)
    try {
      const data = new FormData()
      data.append('title', form.title.trim())
      data.append('description', form.description.trim())
      data.append('content', form.content.trim())
      data.append('authorName', user.fullName || user.name || 'Anonymous')
      if (imageFile) data.append('image', imageFile)

      await api.put(`/profile/blogs/${currentBlog.id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      showToast('Blog updated successfully!')
      await fetchBlogs()
      setForm(emptyForm)
      setImageFile(null)
      setImagePreview(null)
      setShowEditModal(false)
    } catch (err) {
      console.error('Blog save error:', err.response?.data || err.message)
      showToast(err.response?.data?.message || 'Failed to save blog', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    if (!user) { navigate('/welcome'); return }
    if (!commentText.trim()) return
    try {
      await api.post(`/profile/blogs/${blogId}/comments`, {
        text: commentText.trim(),
        authorName: user.fullName || user.name || 'Anonymous',
      })
      showToast('Comment added successfully!')
      setCommentText('')
      await fetchComments()
    } catch (err) {
      console.error('Failed to add comment:', err)
      showToast(err.response?.data?.message || 'Failed to add comment', 'error')
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return
    try {
      await api.delete(`/profile/blogs/${blogId}/comments/${commentId}`)
      showToast('Comment deleted')
      await fetchComments()
    } catch (err) {
      console.error('Failed to delete comment:', err)
      showToast(err.response?.data?.message || 'Failed to delete comment', 'error')
    }
  }

  const handleSubmitReply = async (e, commentId, replyText) => {
    e.preventDefault()
    if (!user) { navigate('/welcome'); return }
    if (!replyText.trim()) return
    try {
      await api.post(`/profile/blogs/${blogId}/comments/${commentId}/replies`, {
        text: replyText.trim(),
        authorName: user.fullName || user.name || 'Anonymous',
      })
      showToast('Reply added successfully!')
      await fetchComments()
    } catch (err) {
      console.error('Failed to add reply:', err)
      showToast(err.response?.data?.message || 'Failed to add reply', 'error')
    }
  }

  const handleDeleteReply = async (commentId, replyId) => {
    if (!window.confirm('Delete this reply?')) return
    try {
      await api.delete(`/profile/blogs/${blogId}/comments/${commentId}/replies/${replyId}`)
      showToast('Reply deleted')
      await fetchComments()
    } catch (err) {
      console.error('Failed to delete reply:', err)
      showToast(err.response?.data?.message || 'Failed to delete reply', 'error')
    }
  }

  const handleCopyLink = async () => {
    const url = `https://afrotask.digify.com.ng/blogs/${currentBlog.id}`
    try {
      await navigator.clipboard.writeText(url)
      showToast('Link copied to clipboard!')
    } catch {
      prompt('Copy this link:', url)
    }
  }

  // ── Loading / Not Found ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#00564C] flex items-center justify-center p-8">
        <LoadingScreen />
      </div>
    )
  }

  if (!currentBlog) {
    return (
      <div className="min-h-screen bg-[#00564C]">
        <WhiteNavbar />
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-12">
          <div className="text-center max-w-md space-y-6">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight text-white">
              Blog Not Found
            </h1>
            <p className="text-lg md:text-xl text-gray-200 leading-relaxed">
              The blog you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <button
              onClick={() => navigate('/blogs')}
              className="bg-white hover:bg-gray-100 text-[#00564C] font-semibold px-8 py-4 rounded-2xl transition-all flex items-center gap-2 mx-auto shadow-lg"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Blogs
            </button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen text-black bg-gray-50 relative">
      <WhiteNavbar />

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <button
        onClick={() => navigate('/blogs')}
        className="fixed top-24 left-6 z-20 bg-white/80 hover:bg-white text-gray-800 shadow-md backdrop-blur-sm p-3 rounded-xl transition-all flex items-center gap-2"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Blogs
      </button>

      <div className="pt-32 px-4 sm:px-8 lg:px-0 w-full flex items-center justify-center flex-col mx-auto">
        <div className="max-w-4xl w-full">

          <BlogHeader
            blog={currentBlog}
            user={user}
            onEdit={openEdit}
            onDelete={handleDelete}
            deleting={deleting}
          />

          <BlogContent content={currentBlog.content} />

          <BlogShareBar blog={currentBlog} onCopyLink={handleCopyLink} />

        </div>

        {/* Dark section — comments + suggestions */}
        <div className="pt-16 pb-20 px-4 sm:px-8 lg:px-0 mx-auto w-screen bg-[#00564C] text-white">
          <div className="max-w-4xl mx-auto">

            <BlogComments
              comments={comments}
              loadingComments={loadingComments}
              user={user}
              currentBlog={currentBlog}
              commentText={commentText}
              setCommentText={setCommentText}
              onSubmitComment={handleSubmitComment}
              onDeleteComment={handleDeleteComment}
              onSubmitReply={handleSubmitReply}
              onDeleteReply={handleDeleteReply}
              onNavigateLogin={() => navigate('/welcome')}
            />

            <BlogSuggestions
              suggestions={suggestions}
              onNavigate={navigate}
            />

          </div>
        </div>
      </div>

      <Footer />

      {showEditModal && (
        <BlogEditModal
          form={form}
          setForm={setForm}
          imagePreview={imagePreview}
          saving={saving}
          onSubmit={handleEditSubmit}
          onClose={() => setShowEditModal(false)}
          onImageChange={handleImageChange}
        />
      )}
    </div>
  )
}
