import { useState } from 'react'

export default function BlogComments({
  comments,
  loadingComments,
  user,
  currentBlog,
  commentText,
  setCommentText,
  onSubmitComment,
  onDeleteComment,
  onSubmitReply,
  onDeleteReply,
  onNavigateLogin,
}) {
  const [visibleCommentCount, setVisibleCommentCount] = useState(5)
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [expandedComments, setExpandedComments] = useState(new Set())

  const toggleExpand = (commentId) => {
    const next = new Set(expandedComments)
    next.has(commentId) ? next.delete(commentId) : next.add(commentId)
    setExpandedComments(next)
  }

  const handleReplySubmit = async (e, commentId) => {
    await onSubmitReply(e, commentId, replyText)
    setReplyText('')
    setReplyingTo(null)
  }

  return (
    <div className="mb-16">
      <h2 className="text-xl md:text-2xl font-bold mb-8">Comments ({comments.length})</h2>

      {/* Comment Form */}
      <form onSubmit={onSubmitComment} className="mb-10">
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder={user ? 'Share your thoughts...' : 'Log in to comment'}
          disabled={!user}
          rows={4}
          className="w-full px-4 py-3 bg-white/10 border border-gray-400 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500 resize-none disabled:opacity-50"
        />
        <div className="flex items-center justify-between mt-4">
          {!user && (
            <p className="text-sm text-gray-300">
              <button type="button" onClick={onNavigateLogin} className="text-green-400 hover:underline font-semibold">
                Log in
              </button>{' '}
              to comment
            </p>
          )}
          <button
            type="submit"
            disabled={!user || !commentText.trim() || loadingComments}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-lg transition disabled:opacity-50 ml-auto"
          >
            Post Comment
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-6">
        {loadingComments ? (
          <p className="text-gray-300">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-gray-300">No comments yet. Be the first to comment!</p>
        ) : (
          <>
            {comments.slice(0, visibleCommentCount).map((comment) => (
              <div key={comment.id} className="bg-white/5 rounded-xl p-6 border border-gray-600">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-white">{comment.authorName || 'Anonymous'}</p>
                    <p className="text-xs text-gray-300">
                      {new Date(comment.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                  {user && (user.id === comment.authorId || user.id === currentBlog.authorId) && (
                    <button
                      onClick={() => onDeleteComment(comment.id)}
                      className="text-red-400 hover:text-red-300 text-sm font-medium transition"
                    >
                      Delete
                    </button>
                  )}
                </div>

                <p className="text-gray-100 leading-relaxed mb-4">{comment.text}</p>

                <button
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  className="text-green-400 hover:text-green-300 text-sm font-medium transition mb-4"
                >
                  {replyingTo === comment.id ? 'Cancel Reply' : 'Reply'}
                </button>

                {replyingTo === comment.id && (
                  <form onSubmit={(e) => handleReplySubmit(e, comment.id)} className="mb-4">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={user ? 'Write a reply...' : 'Log in to reply'}
                      disabled={!user}
                      rows={3}
                      className="w-full px-4 py-3 bg-white/10 border border-gray-400 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500 resize-none disabled:opacity-50 mb-3"
                    />
                    <button
                      type="submit"
                      disabled={!user || !replyText.trim()}
                      className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-lg transition disabled:opacity-50 text-sm"
                    >
                      Post Reply
                    </button>
                  </form>
                )}

                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-4 ml-4 border-l-2 border-gray-600 pl-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-300">
                        {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                      </p>
                      {comment.replies.length > 2 && !expandedComments.has(comment.id) && (
                        <button
                          onClick={() => toggleExpand(comment.id)}
                          className="text-green-400 hover:text-green-300 text-xs font-medium"
                        >
                          Show All
                        </button>
                      )}
                    </div>

                    {comment.replies
                      .slice(0, expandedComments.has(comment.id) ? undefined : 2)
                      .map((reply) => (
                        <div key={reply.id} className="bg-white/10 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-semibold text-white text-sm">{reply.authorName || 'Anonymous'}</p>
                              <p className="text-xs text-gray-300">
                                {new Date(reply.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric', month: 'short', day: 'numeric',
                                  hour: '2-digit', minute: '2-digit',
                                })}
                              </p>
                            </div>
                            {user && (user.id === reply.authorId || user.id === currentBlog.authorId) && (
                              <button
                                onClick={() => onDeleteReply(comment.id, reply.id)}
                                className="text-red-400 hover:text-red-300 text-xs font-medium transition"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                          <p className="text-gray-200 text-sm leading-relaxed">{reply.text}</p>
                        </div>
                      ))}

                    {comment.replies.length > 2 && expandedComments.has(comment.id) && (
                      <button
                        onClick={() => toggleExpand(comment.id)}
                        className="text-green-400 hover:text-green-300 text-xs font-medium"
                      >
                        Hide Replies
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}

            {visibleCommentCount < comments.length && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => setVisibleCommentCount((c) => c + 5)}
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-3 rounded-lg transition"
                >
                  Read More Comments ({comments.length - visibleCommentCount} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
