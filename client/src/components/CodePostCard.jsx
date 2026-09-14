import { useState } from 'react';
import { Copy, Check, MessageCircle, Repeat2, Heart, Bookmark, Share2 } from 'lucide-react';

const getAvatar = (u) =>
  u?.role === 'admin'
    ? '/img/afro-task-logo.png'
    : (u?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(u?.fullName || 'User')}`);

const fmt = (ts) => {
  if (!ts) return '';
  let date;
  if (ts && typeof ts === 'object' && (ts._seconds !== undefined || ts.seconds !== undefined)) {
    date = new Date((ts._seconds ?? ts.seconds) * 1000);
  } else {
    date = new Date(ts);
  }
  if (isNaN(date.getTime())) return '';
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return 'Just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  const days = Math.floor(s / 86400);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
};

const RoleBadge = ({ label }) => (
  <span className="text-[11px] font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-md capitalize">
    {label}
  </span>
);

/**
 * Post card for text + optional code snippet.
 * Matches the real AfroTask post schema:
 *   post.content, post.author || post.user (fullName, role, skillCategory, profileImage),
 *   post.authorRole, post.likes (array), post.commentsCount, post.code, post.codeLanguage
 */
const CodePostCard = ({ post, onLike, onComment, onRepost, onBookmark, onShare, currentUserId }) => {
  const [copied, setCopied] = useState(false);

  const postAuthor = post.author || post.user;
  const isAdminPost = post.authorRole === 'admin';
  const authorAvatar = getAvatar(isAdminPost ? { role: 'admin' } : postAuthor);
  const authorName = postAuthor?.fullName || 'Unknown User';
  const roleLabel = isAdminPost ? 'AfroTask Admin' : (postAuthor?.skillCategory || postAuthor?.role);

  const [liked, setLiked] = useState(() =>
    currentUserId ? !!post.likes?.includes(currentUserId) : false
  );
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [bookmarked, setBookmarked] = useState(!!post.bookmarked);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(post.code || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable — silent
    }
  };

  const handleLikeClick = () => {
    setLiked((v) => !v);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
    onLike?.(post.id);
  };

  const hasContent = Boolean(post.content) || Boolean(post.code);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4">
      <div className="flex items-center gap-3 mb-3">
        <img
          src={authorAvatar}
          alt={authorName}
          className="w-9 h-9 rounded-full object-cover shrink-0"
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-gray-900 truncate">{authorName}</p>
          </div>
          <p className="text-xs text-gray-400">
            {roleLabel && <span className="capitalize">{roleLabel}</span>}
            {roleLabel && ' • '}
            {fmt(post.createdAt)}
          </p>
        </div>
      </div>

      {post.content && <p className="text-sm text-gray-800 mb-3 whitespace-pre-wrap">{post.content}</p>}

      {post.code && (
        <div className="relative bg-gray-900 rounded-xl p-3 mb-3 overflow-x-auto">
          {post.codeLanguage && (
            <span className="absolute top-2 left-3 text-[10px] uppercase tracking-wide text-gray-500">
              {post.codeLanguage}
            </span>
          )}
          <button
            onClick={handleCopy}
            aria-label="Copy code"
            className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <pre className="text-xs font-mono text-gray-100 leading-relaxed mt-4 whitespace-pre-wrap">
            {post.code}
          </pre>
        </div>
      )}

      {!hasContent && (
        <p className="text-sm text-gray-400 italic mb-3">This post has no content.</p>
      )}

      {post.image && (
        <img src={post.image} alt="Post" className="w-full max-h-96 object-cover rounded-xl mb-3" />
      )}

      <div className="flex items-center gap-5 pt-2 border-t border-gray-100 text-gray-400">
        <button
          onClick={() => onComment?.(post.id)}
          className="flex items-center gap-1.5 text-xs hover:text-gray-600 transition"
        >
          <MessageCircle className="w-4 h-4" /> {post.commentsCount ?? 0}
        </button>
        <button
          onClick={() => onRepost?.(post.id)}
          className="flex items-center gap-1.5 text-xs hover:text-gray-600 transition"
        >
          <Repeat2 className="w-4 h-4" /> {post.repostsCount ?? 0}
        </button>
        <button
          onClick={handleLikeClick}
          className={`flex items-center gap-1.5 text-xs transition ${
            liked ? 'text-pink-600' : 'hover:text-gray-600'
          }`}
        >
          <Heart className="w-4 h-4" fill={liked ? 'currentColor' : 'none'} />
          {likeCount}
        </button>
        <button
          onClick={() => { setBookmarked((v) => !v); onBookmark?.(post.id); }}
          className={`ml-auto transition ${bookmarked ? 'text-amber-500' : 'hover:text-gray-600'}`}
          aria-label="Bookmark"
        >
          <Bookmark className="w-4 h-4" fill={bookmarked ? 'currentColor' : 'none'} />
        </button>
        <button
          onClick={() => onShare?.(post.id)}
          className="hover:text-gray-600 transition"
          aria-label="Share"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CodePostCard;