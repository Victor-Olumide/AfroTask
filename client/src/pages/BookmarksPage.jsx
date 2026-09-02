import { useState, useEffect, useCallback, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/navbar/Navbar';
import Sidebar from '../components/Sidebar';
import EnhancedPostCard from '../components/EnhancedPostCard';

const STORAGE_KEY = (userId) => `bookmarks_${userId}`;
const BOOKMARKS_EVENT = 'bookmarks:changed';

// ─── Exported helpers used by EnhancedPostCard ───────────────────────────────

export const getBookmarks = (userId) => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY(userId)) || '[]');
  } catch {
    return [];
  }
};

export const getBookmarkedIds = (userId) => getBookmarks(userId).map(p => p.id);

// Notify every listener (this page, nav badges, other post cards, etc.)
// that bookmark state changed, so they can invalidate and re-read.
const notifyBookmarksChanged = (userId) => {
  window.dispatchEvent(new CustomEvent(BOOKMARKS_EVENT, { detail: { userId } }));
};

export const toggleBookmark = (userId, post) => {
  const current = getBookmarks(userId);
  const exists = current.some(p => p.id === post.id);
  const next = exists
    ? current.filter(p => p.id !== post.id)
    : [...current, post];
  localStorage.setItem(STORAGE_KEY(userId), JSON.stringify(next));
  notifyBookmarksChanged(userId);
  return !exists; // returns true if now bookmarked
};

export const removeBookmark = (userId, postId) => {
  const current = getBookmarks(userId);
  const next = current.filter(p => p.id !== postId);
  localStorage.setItem(STORAGE_KEY(userId), JSON.stringify(next));
  notifyBookmarksChanged(userId);
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const BookmarksPage = () => {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);

  // Single source of truth for reading from storage — every action funnels
  // through this so the list is always freshly "invalidated" and re-read.
  const refresh = useCallback(() => {
    if (!user?.id) return;
    setPosts(getBookmarks(user.id));
  }, [user?.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Invalidate on any bookmark change fired from anywhere in the app
  // (e.g. unbookmarking from a post card on the feed, not just here).
  useEffect(() => {
    if (!user?.id) return;

    const handleBookmarksChanged = (e) => {
      if (!e.detail?.userId || e.detail.userId === user.id) {
        refresh();
      }
    };

    // Cross-tab sync: fires when localStorage changes in *another* tab.
    const handleStorageEvent = (e) => {
      if (e.key === STORAGE_KEY(user.id)) {
        refresh();
      }
    };

    window.addEventListener(BOOKMARKS_EVENT, handleBookmarksChanged);
    window.addEventListener('storage', handleStorageEvent);

    return () => {
      window.removeEventListener(BOOKMARKS_EVENT, handleBookmarksChanged);
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, [user?.id, refresh]);

  const handleDelete = useCallback((postId) => {
    if (!user?.id) return;
    // Optimistic UI update
    setPosts(prev => prev.filter(p => p.id !== postId));
    // Persist + invalidate so any other mounted views stay in sync
    removeBookmark(user.id, postId);
  }, [user?.id]);

  const isFreelancer = user?.role === 'freelancer';
  const accentFill  = isFreelancer ? 'text-green-600' : 'text-yellow-500';

  return (
    <div className="flex min-h-screen bg-gray-50 dashboard-page">
      <Sidebar />

      <div className="flex-1 lg:ml-64">
        <Navbar />

        <div className="lg:p-8 p-4 pt-16 lg:pt-8">
          <div className="max-w-2xl mx-auto">

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 px-1 flex items-center gap-3"
            >
              <Bookmark className={`w-6 h-6 ${accentFill} fill-current flex-shrink-0`} />
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Bookmarks</h1>
                <p className="text-xs lg:text-sm text-gray-500">
                  {posts.length} saved post{posts.length !== 1 ? 's' : ''}
                </p>
              </div>
            </motion.div>

            {/* Posts */}
            {posts.length === 0 ? (
              <div className="text-center py-20 bg-white lg:rounded-2xl shadow-sm mx-0">
                <Bookmark className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No bookmarks yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Tap the bookmark icon on any post to save it here
                </p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                <div className="space-y-4 lg:space-y-6">
                  {posts.map(post => (
                    <motion.div
                      key={post.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.18 }}
                    >
                      <EnhancedPostCard
                        post={post}
                        onDelete={handleDelete}
                      />
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default BookmarksPage;