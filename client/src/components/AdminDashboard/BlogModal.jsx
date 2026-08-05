import { useEffect, useMemo, useRef, useState } from "react";
import { 
  X, 
  Upload, 
  PanelRightClose, 
  PanelRightOpen, 
  Trash2, 
  User, 
  Folder, 
  Tag, 
  BarChart2, 
  Image as ImageIcon 
} from "lucide-react";
import toast from "react-hot-toast";

import api from "../../services/api";
import BlogEditor from "./BlogEditor";

const emptyBlog = {
  title: "",
  description: "",
  content: "",
  authorName: "AfroTask Admin",
  category: "",
  tags: "",
};

export default function BlogModal({ blog, onClose, onSaved }) {
  const [showSidebar, setShowSidebar] = useState(true);
  const [form, setForm] = useState(blog ? { ...emptyBlog, ...blog } : emptyBlog);
  const [preview, setPreview] = useState(blog?.image || "");
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileRef = useRef(null);

  useEffect(() => {
    if (blog) {
      setForm({ ...emptyBlog, ...blog });
      setPreview(blog.image || "");
    } else {
      setForm(emptyBlog);
      setPreview("");
      setImageFile(null);
    }
  }, [blog]);

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageSelect = (file) => {
    if (!file || !file.type.startsWith("image/")) {
      return toast.error("Please select a valid image file");
    }
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) handleImageSelect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageSelect(file);
  };

  const handleRemoveImage = () => {
    setPreview("");
    setImageFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const wordCount = useMemo(() => {
    return form.content
      .replace(/<[^>]*>/g, "")
      .split(/\s+/)
      .filter(Boolean).length;
  }, [form.content]);

  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) return toast.error("Title is required");
    if (!form.description.trim()) return toast.error("Description is required");
    if (!form.content.trim()) return toast.error("Content is required");

    try {
      setSaving(true);
      const data = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          data.append(key, value);
        }
      });

      if (imageFile) {
        data.append("image", imageFile);
      }

      if (blog?.id) {
        await api.put(`/admin/blogs/${blog.id}`, data);
      } else {
        await api.post("/admin/blogs", data);
      }

      toast.success(blog ? "Blog post updated" : "Blog post published");
      onSaved?.();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save blog post");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 font-sans text-slate-100 antialiased">
      <form onSubmit={handleSubmit} className="flex h-full flex-col overflow-hidden">
        
        {/* ================= HEADER ================= */}
        <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
          <div className="flex items-center justify-between px-4 py-3 md:px-6">
            
            {/* Left: Close & Title */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
              <div className="h-4 w-px bg-slate-800 hidden sm:block" />
              <div>
                <h1 className="text-base font-semibold text-white sm:text-lg">
                  {blog ? "Edit Blog Post" : "Create New Post"}
                </h1>
                <p className="hidden text-xs text-slate-400 sm:block">
                  {saving ? "Saving changes..." : "Drafting in AfroTask Admin"}
                </p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setShowSidebar(!showSidebar)}
                className={`rounded-lg border p-2 transition ${
                  showSidebar
                    ? "border-slate-700 bg-slate-800 text-slate-200"
                    : "border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
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
                className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-emerald-950/50 transition hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving...
                  </span>
                ) : blog ? (
                  "Update Post"
                ) : (
                  "Publish Post"
                )}
              </button>
            </div>
          </div>
        </header>

        {/* ================= MAIN CONTAINER ================= */}
        <div className="relative flex flex-1 overflow-hidden">

          {/* Editor Workspace */}
          <main className="flex-1 overflow-y-auto bg-slate-900/60 p-4 md:p-8 lg:p-12">
            <div
              className={`mx-auto transition-all duration-300 ${
                showSidebar ? "max-w-3xl lg:max-w-4xl" : "max-w-4xl lg:max-w-5xl"
              }`}
            >
              {/* Title Input */}
              <input
                type="text"
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Post title..."
                className="mb-4 w-full border-none bg-transparent text-3xl font-extrabold tracking-tight text-white placeholder-slate-600 outline-none focus:ring-0 md:text-4xl lg:text-5xl"
              />

              {/* Metadata Bar */}
              <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 md:text-sm">
                <span className="font-medium text-slate-300">{form.authorName || "Anonymous"}</span>
                <span>•</span>
                <span>{new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
                <span>•</span>
                <span>{readTime} min read ({wordCount} words)</span>
              </div>

              {/* Excerpt / Description Input */}
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Write a brief excerpt or summary for social cards and search listings..."
                className="mb-8 w-full resize-none border-none bg-transparent text-base text-slate-300 placeholder-slate-600 outline-none focus:ring-0 md:text-lg"
              />

              {/* Rich Text Editor Container */}
              <section className="min-h-[450px] overflow-hidden rounded-xl border border-slate-800/80 bg-slate-950 shadow-2xl">
                <BlogEditor
                  value={form.content}
                  onChange={(html) => handleChange("content", html)}
                />
              </section>
            </div>
          </main>

          {/* Mobile Sidebar Overlay */}
          {showSidebar && (
            <div
              className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
              onClick={() => setShowSidebar(false)}
            />
          )}

          {/* ================= SIDEBAR ================= */}
          <aside
            className={`fixed bottom-0 right-0 top-[57px] z-50 flex w-full max-w-sm flex-col border-l border-slate-800/80 bg-slate-950 transition-transform duration-300 ease-in-out lg:static lg:z-auto lg:translate-x-0 ${
              showSidebar ? "translate-x-0" : "translate-x-full lg:hidden"
            }`}
          >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between border-b border-slate-800/80 px-5 py-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                Post Settings
              </h2>
              <button
                type="button"
                onClick={() => setShowSidebar(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 lg:hidden"
              >
                <X size={18} />
              </button>
            </div>

            {/* Sidebar Form Fields */}
            <div className="flex-1 space-y-6 overflow-y-auto p-5">
              
              {/* Featured Image Section */}
              <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
                    <ImageIcon size={14} className="text-emerald-500" />
                    Featured Image
                  </label>
                  {preview && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="flex items-center gap-1 text-xs font-medium text-rose-400 hover:text-rose-300"
                    >
                      <Trash2 size={12} />
                      Remove
                    </button>
                  )}
                </div>

                <input
                  ref={fileRef}
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                />

                {preview ? (
                  <div className="group relative overflow-hidden rounded-lg border border-slate-800">
                    <img
                      src={preview}
                      alt="Featured visual preview"
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
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileRef.current?.click()}
                    className={`flex h-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 text-center transition ${
                      isDragging
                        ? "border-emerald-500 bg-emerald-500/10"
                        : "border-slate-800 bg-slate-900/20 hover:border-slate-700 hover:bg-slate-900/60"
                    }`}
                  >
                    <Upload size={24} className="mb-2 text-slate-400" />
                    <p className="text-xs font-medium text-slate-200">
                      Click to upload or drag & drop
                    </p>
                    <p className="mt-1 text-[10px] text-slate-500">
                      PNG, JPG, or WebP (Max 5MB)
                    </p>
                  </div>
                )}
              </div>

              {/* Author Input */}
              <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4">
                <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
                  <User size={14} className="text-emerald-500" />
                  Author Name
                </label>
                <input
                  type="text"
                  value={form.authorName}
                  onChange={(e) => handleChange("authorName", e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 outline-none transition focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                />
              </div>

              {/* Category Input */}
              <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4">
                <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
                  <Folder size={14} className="text-emerald-500" />
                  Category
                </label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  placeholder="e.g. Technology, Design"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 outline-none transition focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                />
              </div>

              {/* Tags Input */}
              <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4">
                <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
                  <Tag size={14} className="text-emerald-500" />
                  Tags
                </label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => handleChange("tags", e.target.value)}
                  placeholder="React, WebDev, Tutorial"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 outline-none transition focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                />
                <p className="mt-1.5 text-[11px] text-slate-500">
                  Separate tags with commas
                </p>
              </div>

              {/* SEO & Metrics Card */}
              <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4">
                <label className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
                  <BarChart2 size={14} className="text-emerald-500" />
                  SEO Checklist
                </label>
                
                <div className="space-y-3 text-xs">
                  {/* Title character counter */}
                  <div>
                    <div className="flex justify-between text-slate-400">
                      <span>Title Length</span>
                      <span className={form.title.length > 60 ? "text-amber-400" : "text-slate-300"}>
                        {form.title.length} / 60 chars
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className={`h-full transition-all ${
                          form.title.length > 60 ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.min((form.title.length / 60) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Meta description character counter */}
                  <div>
                    <div className="flex justify-between text-slate-400">
                      <span>Meta Description</span>
                      <span className={form.description.length > 160 ? "text-amber-400" : "text-slate-300"}>
                        {form.description.length} / 160 chars
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className={`h-full transition-all ${
                          form.description.length > 160 ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.min((form.description.length / 160) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </aside>
        </div>

        {/* Mobile Sticky Footer */}
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
              {saving ? "Saving..." : blog ? "Update Post" : "Publish"}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}