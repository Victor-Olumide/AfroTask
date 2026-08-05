import { useMemo, useRef, useState } from 'react'
import {
  X,
  Upload,
  PanelRightClose,
  PanelRightOpen,
  Trash2,
  Image as ImageIcon,
  BarChart2,
} from 'lucide-react'
import BlogEditor from '../AdminDashboard/BlogEditor'

export default function BlogEditModal({
  form,
  setForm,
  imagePreview,
  saving,
  onSubmit,
  onClose,
  onImageChange,
}) {
  const [showSidebar, setShowSidebar] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const fileRef = useRef(null)

  const handleChange = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const handleImageSelect = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    // reuse the parent handler by faking an event shape
    onImageChange({ target: { files: [file] } })
  }

  const handleFileInput = (e) => {
    const file = e.target.files?.[0]
    if (file) handleImageSelect(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleImageSelect(file)
  }

  const handleRemoveImage = () => {
    if (fileRef.current) fileRef.current.value = ''
    onImageChange({ target: { files: [] } })
  }

  const wordCount = useMemo(() => {
    return form.content
      .replace(/<[^>]*>/g, '')
      .split(/\s+/)
      .filter(Boolean).length
  }, [form.content])

  const readTime = Math.max(1, Math.ceil(wordCount / 200))

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 font-sans text-slate-100 antialiased">
      <form onSubmit={onSubmit} className="flex h-full flex-col overflow-hidden">

        {/* ── Header ── */}
        <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
          <div className="flex items-center justify-between px-4 py-3 md:px-6">

            {/* Left */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
                aria-label="Close"
              >
                <X size={20} />
              </button>
              <div className="hidden h-4 w-px bg-slate-800 sm:block" />
              <div>
                <h1 className="text-base font-semibold text-white sm:text-lg">Edit Blog Post</h1>
                <p className="hidden text-xs text-slate-400 sm:block">
                  {saving ? 'Saving changes…' : 'Editing on AfroTask'}
                </p>
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setShowSidebar(!showSidebar)}
                className={`rounded-lg border p-2 transition ${
                  showSidebar
                    ? 'border-slate-700 bg-slate-800 text-slate-200'
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
                title="Toggle Settings Panel"
              >
                {showSidebar ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="hidden rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 sm:block"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-emerald-950/50 transition hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50"
              >
                {saving && (
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                )}
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </header>

        {/* ── Main container ── */}
        <div className="relative flex flex-1 overflow-hidden">

          {/* Editor workspace */}
          <main className="flex-1 overflow-y-auto bg-slate-900/60 p-4 md:p-8 lg:p-12">
            <div className={`mx-auto transition-all duration-300 ${showSidebar ? 'max-w-3xl lg:max-w-4xl' : 'max-w-4xl lg:max-w-5xl'}`}>

              {/* Title */}
              <input
                type="text"
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Post title…"
                className="mb-4 w-full border-none bg-transparent text-3xl font-extrabold tracking-tight text-white placeholder-slate-600 outline-none focus:ring-0 md:text-4xl lg:text-5xl"
              />

              {/* Meta bar */}
              <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 md:text-sm">
                <span>{new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <span>•</span>
                <span>{readTime} min read ({wordCount} words)</span>
              </div>

              {/* Description */}
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Write a brief excerpt or summary…"
                className="mb-8 w-full resize-none border-none bg-transparent text-base text-slate-300 placeholder-slate-600 outline-none focus:ring-0 md:text-lg"
              />

              {/* Rich Text Editor */}
              <section className="min-h-[450px] overflow-hidden rounded-xl border border-slate-800/80 bg-slate-950 shadow-2xl">
                <BlogEditor
                  value={form.content}
                  onChange={(html) => handleChange('content', html)}
                />
              </section>
            </div>
          </main>

          {/* Mobile sidebar overlay */}
          {showSidebar && (
            <div
              className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
              onClick={() => setShowSidebar(false)}
            />
          )}

          {/* ── Sidebar ── */}
          <aside className={`fixed bottom-0 right-0 top-[57px] z-50 flex w-full max-w-sm flex-col border-l border-slate-800/80 bg-slate-950 transition-transform duration-300 ease-in-out lg:static lg:z-auto lg:translate-x-0 ${showSidebar ? 'translate-x-0' : 'translate-x-full lg:hidden'}`}>

            <div className="flex items-center justify-between border-b border-slate-800/80 px-5 py-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Post Settings</h2>
              <button
                type="button"
                onClick={() => setShowSidebar(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 lg:hidden"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto p-5">

              {/* Featured Image */}
              <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
                    <ImageIcon size={14} className="text-emerald-500" />
                    Cover Image
                  </label>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="flex items-center gap-1 text-xs font-medium text-rose-400 hover:text-rose-300"
                    >
                      <Trash2 size={12} /> Remove
                    </button>
                  )}
                </div>

                <input ref={fileRef} hidden type="file" accept="image/*" onChange={handleFileInput} />

                {imagePreview ? (
                  <div className="group relative overflow-hidden rounded-lg border border-slate-800">
                    <img
                      src={imagePreview}
                      alt="Cover preview"
                      className="h-44 w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 opacity-0 transition group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="rounded-lg bg-slate-900/90 px-3 py-1.5 text-xs font-medium text-white shadow hover:bg-slate-800"
                      >
                        Change Image
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileRef.current?.click()}
                    className={`flex h-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 text-center transition ${
                      isDragging
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-slate-800 bg-slate-900/20 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <Upload size={24} className="mb-2 text-slate-400" />
                    <p className="text-xs font-medium text-slate-200">Click to upload or drag & drop</p>
                    <p className="mt-1 text-[10px] text-slate-500">PNG, JPG, or WebP</p>
                  </div>
                )}
              </div>

              {/* SEO Checklist */}
              <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4">
                <label className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
                  <BarChart2 size={14} className="text-emerald-500" />
                  SEO Checklist
                </label>
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between text-slate-400">
                      <span>Title Length</span>
                      <span className={form.title.length > 60 ? 'text-amber-400' : 'text-slate-300'}>
                        {form.title.length} / 60
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className={`h-full transition-all ${form.title.length > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min((form.title.length / 60) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-slate-400">
                      <span>Meta Description</span>
                      <span className={form.description.length > 160 ? 'text-amber-400' : 'text-slate-300'}>
                        {form.description.length} / 160
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className={`h-full transition-all ${form.description.length > 160 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min((form.description.length / 160) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </aside>
        </div>

        {/* Mobile footer */}
        <div className="border-t border-slate-800/80 bg-slate-950 p-3 sm:hidden">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-800 bg-slate-900 py-2.5 text-center text-xs font-medium text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-emerald-600 py-2.5 text-center text-xs font-medium text-white disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>

      </form>
    </div>
  )
}
