import { useState, useRef } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function CreatePostModal({ onClose, onSaved }) {
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
