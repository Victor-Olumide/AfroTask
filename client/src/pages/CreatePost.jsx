import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { useDarkMode } from '../context/DarkModeContext';
import Sidebar from '../components/Sidebar';

const CreatePost = () => {
  const { user } = useContext(AuthContext);
  const { dark } = useDarkMode();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ content: '', hashtags: '' });
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);

  const isFreelancer = user?.role === 'freelancer';
  const dashboardPath = isFreelancer ? '/freelancer/feed' : '/client/feed';
  const primaryColor = '#00564C';

  const handleMediaChange = (e) => {
    const newFiles = Array.from(e.target.files);
    const newPreviews = newFiles.map(file => ({
      url: URL.createObjectURL(file),
      name: file.name,
      type: file.type.startsWith('video/') ? 'video' : 'image'
    }));
    setMediaFiles(prev => [...prev, ...newFiles]);
    setMediaPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeMedia = (index) => {
    URL.revokeObjectURL(mediaPreviews[index].url);
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.content.trim() && mediaFiles.length === 0) {
      toast.error('Please add some content or media');
      return;
    }
    setLoading(true);
    try {
      const data = new FormData();
      data.append('content', formData.content);
      const hashtagsArray = formData.hashtags.split(',').map(t => t.trim()).filter(Boolean);
      data.append('hashtags', JSON.stringify(hashtagsArray));
      mediaFiles.forEach((file, index) => {
        data.append('media', file);
        data.append(`mediaType_${index}`, file.type.startsWith('video/') ? 'video' : 'image');
      });
      await api.post('/posts', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Post created successfully!');
      navigate(dashboardPath);
    } catch {
      toast.error('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = `w-full px-4 py-3.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00564C] focus:border-transparent transition-all duration-200 text-sm shadow-sm ${
    dark ? 'bg-gray-800/60 border-gray-700 text-white placeholder-gray-500 hover:border-gray-600' : 'bg-gray-50/50 border-gray-200 text-gray-900 placeholder-gray-400 hover:border-gray-300'
  }`;

  const labelCls = `block text-xs uppercase tracking-wider font-semibold mb-2.5 ${dark ? 'text-gray-400' : 'text-gray-600'}`;

  return (
    <div className={`flex min-h-screen font-sans ${dark ? 'bg-gray-950 text-gray-100' : 'bg-gray-50/50 text-gray-800'}`}>
      <Sidebar />

      <div className="flex-1 lg:ml-64 transition-all duration-300">

        <div className="p-4 md:p-10 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="w-full"
          >
            <h1 className={`text-2xl md:text-3xl font-extrabold tracking-tight mb-8 ${dark ? 'text-white' : 'text-gray-900'}`}>
              {isFreelancer ? 'Create Post' : 'Share Company Update'}
            </h1>

            <div className={`${dark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200/70'} border rounded-2xl shadow-xl shadow-black/5 p-6 md:p-10 transition-all`}>
              <form onSubmit={handleSubmit} className="space-y-7">

                <div>
                  <label className={labelCls}>
                    {isFreelancer ? "What's on your mind?" : "What's new with your company?"}
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={5}
                    className={`${inputCls} resize-none leading-relaxed`}
                    placeholder={isFreelancer
                      ? "Share your thoughts, achievements, or updates..."
                      : "Share company news, job openings, or announcements..."}
                  />
                  <p className={`text-xs mt-2 font-medium ${dark ? 'text-gray-500' : 'text-gray-400'}`}>You can post text, image, or both</p>
                </div>

                <div>
                  <label className={labelCls}>Hashtags (comma separated)</label>
                  <input
                    type="text"
                    value={formData.hashtags}
                    onChange={(e) => setFormData({ ...formData, hashtags: e.target.value })}
                    className={inputCls}
                    placeholder={isFreelancer ? "webdev, design, freelance" : "hiring, jobs, company"}
                  />
                </div>

                <div>
                  <label className={labelCls}>Media (Image or Video)</label>
                  <div className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 hover:border-[#00564C] group ${
                    dark ? 'border-gray-700 bg-gray-800/30 hover:bg-gray-800/60' : 'border-gray-200 bg-gray-50/30 hover:bg-emerald-50/20'
                  }`}>
                    <input
                      type="file"
                      onChange={handleMediaChange}
                      accept="image/*,video/*"
                      multiple
                      className="w-full cursor-pointer absolute inset-0 opacity-0 z-10"
                    />
                    <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                      <div className={`p-3 rounded-full transition-colors ${dark ? 'bg-gray-800 group-hover:bg-gray-700' : 'bg-white shadow-sm group-hover:bg-emerald-50'}`}>
                        <svg className="w-6 h-6 text-[#00564C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className={`text-sm font-medium ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Click or drag to upload media
                      </p>
                      <p className={`text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
                        Upload images or videos (PNG, JPG, GIF, MP4)
                      </p>
                    </div>
                  </div>

                  {mediaPreviews.length > 0 && (
                    <div className="mt-6">
                      <div className="flex justify-between items-center mb-3.5">
                        <p className={`text-xs font-semibold uppercase tracking-wider ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {mediaPreviews.length} file(s) selected
                        </p>
                        <button
                          type="button"
                          onClick={() => { mediaFiles.forEach(f => URL.revokeObjectURL(f)); setMediaFiles([]); setMediaPreviews([]); }}
                          className="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors"
                        >
                          Clear all
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {mediaPreviews.map((preview, index) => (
                          <div key={index} className={`relative group rounded-xl overflow-hidden border shadow-sm transition-all duration-200 hover:shadow-md ${dark ? 'border-gray-800 bg-gray-800/80' : 'border-gray-200 bg-gray-50'}`}>
                            {preview.type === 'video' ? (
                              <video src={preview.url} controls className="w-full h-36 object-cover" />
                            ) : (
                              <img src={preview.url} alt={`Preview ${index + 1}`} className="w-full h-36 object-cover" />
                            )}
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center">
                              <button 
                                type="button" 
                                onClick={() => removeMedia(index)} 
                                className="bg-red-500/90 hover:bg-red-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg backdrop-blur-sm transition-transform active:scale-95 shadow-lg"
                              >
                                Remove
                              </button>
                            </div>
                            <div className="p-2 border-t border-inherit">
                              <p className={`text-xs font-medium truncate ${dark ? 'text-gray-300' : 'text-gray-600'}`}>{preview.name}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-6 border-t border-inherit">
                  <button
                    type="button"
                    onClick={() => navigate(dashboardPath)}
                    className={`flex-1 px-5 py-3 rounded-xl font-medium text-sm transition-all duration-200 border ${
                      dark ? 'border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-gray-600' : 'border-gray-200 text-gray-700 hover:bg-gray-100/70 hover:border-gray-300'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-5 py-3 rounded-xl text-white font-semibold text-sm transition-all duration-200 shadow-md shadow-[#00564C]/20 hover:shadow-lg hover:shadow-[#00564C]/30 hover:brightness-110 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Posting...
                      </span>
                    ) : 'Post'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;