import { db } from '../config/firebase.js';
import { FieldValue } from 'firebase-admin/firestore';
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js';
import { createNotification } from './notificationController.js';
import { calculateRankingScore } from './rankingController.js';

export const createPost = async (req, res) => {
  try {
    console.log('=== CREATE POST REQUEST ===');
    console.log('Request body:', req.body);
    
    const { content, hashtags, type, mediaType } = req.body;
    const userId = req.user.userId;
    const userRole = req.user.role;

    let mediaUrl = null;
    let postType = type || 'text';
    
    if (req.file) {
      const isVideo = req.file.mimetype.startsWith('video/');
      mediaUrl = await uploadToCloudinary(
        req.file.buffer, 
        isVideo ? 'afro-task/videos' : 'afro-task/posts',
        isVideo ? 'video' : 'image'
      );
      postType = isVideo ? 'video' : 'image';
    }

    if (!content?.trim() && !mediaUrl) {
      return res.status(400).json({ message: 'Post must have content or media' });
    }

    const postData = {
      authorId: userId,
      authorRole: userRole,
      type: postType,
      content: content || '',
      mediaUrl: mediaUrl,
      mediaType: postType === 'video' ? 'video' : postType === 'image' ? 'image' : null,
      image: postType === 'image' ? mediaUrl : null,
      hashtags: hashtags ? JSON.parse(hashtags) : [],
      likes: [],
      commentsCount: 0,
      views: 0,
      createdAt: FieldValue.serverTimestamp()
    };

    // 🔧 FIX: this line was missing — postRef was never created
    const postRef = await db.collection('posts').add(postData);

    console.log('Post created successfully with ID:', postRef.id);

    // Send notifications to followers about new post
    try {
      const followersSnapshot = await db.collection('follows')
        .where('followingId', '==', userId)
        .get();

      const followerIds = followersSnapshot.docs.map(doc => doc.data().followerId);
      
      const notificationPromises = followerIds.slice(0, 100).map(followerId =>
        createNotification(followerId, userId, 'new_post', { 
          postId: postRef.id,
          postContent: content?.substring(0, 50) || 'New post'
        })
      );

      await Promise.all(notificationPromises);
      console.log(`Sent notifications to ${followerIds.length} followers`);
    } catch (notifError) {
      console.error('Failed to send post notifications:', notifError);
    }

    res.status(201).json({
      success: true,
      post: { id: postRef.id, ...postData }
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Failed to create post' });
  }
};

export const getPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const postDoc = await db.collection('posts').doc(postId).get();
    if (!postDoc.exists) return res.status(404).json({ message: 'Post not found' });

    const postData = { id: postDoc.id, ...postDoc.data() };
    const userDoc = await db.collection('users').doc(postData.authorId).get();
    postData.author = userDoc.exists ? {
      fullName: userDoc.data().fullName,
      profileImage: userDoc.data().profileImage,
      role: userDoc.data().role
    } : null;

    res.json({ success: true, post: postData });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch post' });
  }
};

export const getFeed = async (req, res) => {
  try {
    const { page = 1, limit = 50, search, category } = req.query;
    const offset = (page - 1) * limit;

    // Fetch without orderBy — mixed createdAt types (Timestamp vs ISO string) break Firestore ordering.
    // We normalise and sort in JS instead.
    const postsSnapshot = await db.collection('posts').get();

    // Helper: convert any createdAt value to a JS timestamp (ms) for reliable sorting
    const toMs = (createdAt) => {
      if (!createdAt) return 0;
      // Firestore Timestamp object
      if (typeof createdAt === 'object' && (createdAt._seconds !== undefined || createdAt.seconds !== undefined)) {
        return (createdAt._seconds ?? createdAt.seconds) * 1000;
      }
      // ISO string or any other date string
      const ms = new Date(createdAt).getTime();
      return isNaN(ms) ? 0 : ms;
    };

    let allPosts = postsSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => toMs(b.createdAt) - toMs(a.createdAt));

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      allPosts = allPosts.filter(post => {
        const contentMatch = post.content?.toLowerCase().includes(searchLower);
        const hashtagMatch = post.hashtags?.some(tag => tag.toLowerCase().includes(searchLower));
        return contentMatch || hashtagMatch;
      });
    }

    // Apply category filter
    if (category) {
      const categoryLower = category.toLowerCase();
      allPosts = allPosts.filter(post => {
        const hashtagMatch = post.hashtags?.some(tag => tag.toLowerCase() === categoryLower);
        const contentMatch = post.content?.toLowerCase().includes(categoryLower);
        return hashtagMatch || contentMatch;
      });
    }

    // Get total count after filtering
    const total = allPosts.length;

    // Apply pagination
    const paginatedPosts = allPosts.slice(offset, offset + parseInt(limit));

    // Enrich posts with author data
    const posts = await Promise.all(paginatedPosts.map(async (postData) => {
      const userDoc = await db.collection('users').doc(postData.authorId).get();
      postData.author = userDoc.exists ? {
        fullName: userDoc.data().fullName,
        profileImage: userDoc.data().profileImage,
        role: userDoc.data().role
      } : null;

      return postData;
    }));

    const hasMore = (offset + posts.length) < total;

    res.json({ 
      success: true, 
      posts, 
      page: parseInt(page),
      total,
      hasMore
    });
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({ message: 'Failed to fetch feed' });
  }
};

export const likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    const postRef = db.collection('posts').doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const likes = postDoc.data().likes || [];
    const hasLiked = likes.includes(userId);

    if (hasLiked) {
      await postRef.update({
        likes: likes.filter(id => id !== userId)
      });
    } else {
      await postRef.update({
        likes: [...likes, userId]
      });
      
      // Create notification if liking someone else's post
      const postAuthorId = postDoc.data().authorId;
      if (postAuthorId !== userId) {
        await createNotification(postAuthorId, userId, 'like', { postId });
        // Update ranking score for post author
        await calculateRankingScore(postAuthorId);
      }
    }

    res.json({ success: true, liked: !hasLiked });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Failed to like post' });
  }
};

export const reactToPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { emoji, remove } = req.body;
    const userId = req.user.userId;

    const postRef = db.collection('posts').doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const postData = postDoc.data();
    const reactions = { ...(postData.reactions || {}) };
    const userReactions = { ...(postData.userReactions || {}) };

    // Always remove the user's previous reaction first
    const prevEmoji = userReactions[userId];
    if (prevEmoji && reactions[prevEmoji]) {
      reactions[prevEmoji] = reactions[prevEmoji].filter(id => id !== userId);
      if (reactions[prevEmoji].length === 0) delete reactions[prevEmoji];
    }
    delete userReactions[userId];

    // Add new reaction unless this is a remove-only call
    if (!remove && emoji) {
      if (!reactions[emoji]) reactions[emoji] = [];
      if (!reactions[emoji].includes(userId)) reactions[emoji].push(userId);
      userReactions[userId] = emoji;
    }

    const allUserIds = [...new Set(Object.values(reactions).flat())];

    await postRef.update({ reactions, userReactions, likes: allUserIds });

    if (!remove && emoji && postData.authorId !== userId) {
      await createNotification(postData.authorId, userId, 'reaction', { postId, emoji });
    }

    res.json({ success: true, reactions, userReactions });
  } catch (error) {
    console.error('React to post error:', error);
    res.status(500).json({ message: 'Failed to react to post' });
  }
};

export const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, parentId } = req.body;
    const userId = req.user.userId;

    console.log('=== ADD COMMENT REQUEST ===');
    console.log('Post ID:', postId);
    console.log('User ID:', userId);
    console.log('Content:', content);
    console.log('Parent ID:', parentId);

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      console.error('User not found:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    const userData = userDoc.data();
    console.log('User data:', userData);

    const commentData = {
      postId,
      userId,
      content: content.trim(),
      parentId: parentId || null, // Add parentId for replies
      likes: [],
      createdAt: FieldValue.serverTimestamp(),
      user: {
        fullName: userData.fullName || 'Unknown User',
        profileImage: userData.profileImage || null,
        role: userData.role || 'user'
      }
    };

    console.log('Comment data to save:', commentData);

    const commentRef = await db.collection('posts')
      .doc(postId)
      .collection('comments')
      .add(commentData);

    console.log('Comment saved with ID:', commentRef.id);

    // Update comment count using transaction
    const postRef = db.collection('posts').doc(postId);
    await db.runTransaction(async (transaction) => {
      const postDoc = await transaction.get(postRef);
      if (postDoc.exists) {
        const currentCount = postDoc.data().commentsCount || 0;
        transaction.update(postRef, { commentsCount: currentCount + 1 });
        
        // Create notification if commenting on someone else's post
        const postAuthorId = postDoc.data().authorId;
        if (postAuthorId !== userId) {
          await createNotification(postAuthorId, userId, 'comment', { postId });
        }
      }
    });

    console.log('Comment posted successfully');

    res.status(201).json({
      success: true,
      comment: { id: commentRef.id, ...commentData }
    });
  } catch (error) {
    console.error('Add comment error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Failed to add comment',
      error: error.message 
    });
  }
};

// Delete a comment
export const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user.userId;

    const commentRef = db.collection('posts')
      .doc(postId)
      .collection('comments')
      .doc(commentId);

    const commentDoc = await commentRef.get();

    if (!commentDoc.exists) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const commentData = commentDoc.data();

    // Only the comment's author (or the post's author) can delete it
    const postRef = db.collection('posts').doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const isCommentAuthor = commentData.userId === userId;
    const isPostAuthor = postDoc.data().authorId === userId;

    if (!isCommentAuthor && !isPostAuthor) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Also delete any replies to this comment
    const repliesSnapshot = await db.collection('posts')
      .doc(postId)
      .collection('comments')
      .where('parentId', '==', commentId)
      .get();

    const deleteCount = 1 + repliesSnapshot.size;

    const batch = db.batch();
    batch.delete(commentRef);
    repliesSnapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    // Update comment count using transaction
    await db.runTransaction(async (transaction) => {
      const freshPostDoc = await transaction.get(postRef);
      if (freshPostDoc.exists) {
        const currentCount = freshPostDoc.data().commentsCount || 0;
        transaction.update(postRef, {
          commentsCount: Math.max(0, currentCount - deleteCount)
        });
      }
    });

    res.json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Failed to delete comment' });
  }
};

// Like a comment
export const likeComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user.userId;

    const commentRef = db.collection('posts').doc(postId).collection('comments').doc(commentId);
    const commentDoc = await commentRef.get();

    if (!commentDoc.exists) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const likes = commentDoc.data().likes || [];
    const hasLiked = likes.includes(userId);

    if (hasLiked) {
      await commentRef.update({
        likes: likes.filter(id => id !== userId)
      });
    } else {
      await commentRef.update({
        likes: [...likes, userId]
      });
    }

    res.json({ success: true, liked: !hasLiked });
  } catch (error) {
    console.error('Like comment error:', error);
    res.status(500).json({ message: 'Failed to like comment' });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    const postDoc = await db.collection('posts').doc(postId).get();
    
    if (!postDoc.exists) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (postDoc.data().authorId !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await db.collection('posts').doc(postId).delete();

    res.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Failed to delete post' });
  }
};

// Get posts by user ID
export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Get posts without orderBy to avoid index requirement
    const postsSnapshot = await db.collection('posts')
      .where('authorId', '==', userId)
      .get();

    const posts = await Promise.all(postsSnapshot.docs.map(async (doc) => {
      const postData = { id: doc.id, ...doc.data() };
      
      const userDoc = await db.collection('users').doc(postData.authorId).get();
      postData.author = userDoc.exists ? {
        fullName: userDoc.data().fullName,
        profileImage: userDoc.data().profileImage,
        role: userDoc.data().role
      } : null;

      return postData;
    }));

    // Sort by createdAt in memory
    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Paginate in memory
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedPosts = posts.slice(startIndex, endIndex);

    res.json({ 
      success: true, 
      posts: paginatedPosts, 
      page: parseInt(page), 
      total: posts.length 
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ message: 'Failed to fetch user posts' });
  }
};

// Increment post view count with transaction and unique viewer tracking
export const incrementPostView = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const postRef = db.collection('posts').doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const postData = postDoc.data();
    
    // Don't track if viewing own post
    if (postData.authorId === userId) {
      return res.json({ success: true, views: postData.views || 0 });
    }

    // Check if user already viewed this post
    const viewRef = db.collection('postViews').doc(`${postId}_${userId}`);
    const viewDoc = await viewRef.get();

    if (viewDoc.exists) {
      // User already viewed this post, don't increment
      return res.json({ success: true, views: postData.views || 0, alreadyViewed: true });
    }

    // Record the view
    await viewRef.set({
      postId,
      viewerId: userId,
      viewedAt: new Date().toISOString()
    });

    // Increment view count using transaction
    const result = await db.runTransaction(async (transaction) => {
      const freshPostDoc = await transaction.get(postRef);
      
      if (!freshPostDoc.exists) {
        throw new Error('Post not found');
      }

      const currentViews = freshPostDoc.data().views || 0;
      const newViews = currentViews + 1;
      
      transaction.update(postRef, {
        views: newViews
      });
      
      return newViews;
    });

    // Update ranking score for post author (every 10 views to avoid too many updates)
    if (result % 10 === 0) {
      await calculateRankingScore(postData.authorId);
    }

    res.json({ success: true, views: result, newView: true });
  } catch (error) {
    console.error('Increment view error:', error);
    res.status(500).json({ message: 'Failed to increment view' });
  }
};

// Get comments for a post
export const getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    
    const commentsSnapshot = await db.collection('posts')
      .doc(postId)
      .collection('comments')
      .orderBy('createdAt', 'asc')
      .get();

    const comments = commentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ success: true, comments });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Failed to fetch comments' });
  }
};

// Repost functionality
export const repostPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    const originalPostDoc = await db.collection('posts').doc(postId).get();
    
    if (!originalPostDoc.exists) {
      return res.status(404).json({ message: 'Original post not found' });
    }

    const originalPost = originalPostDoc.data();

    const repostData = {
      authorId: userId,
      authorRole: userRole,
      type: 'repost',
      content: originalPost.content,
      mediaUrl: originalPost.mediaUrl,
      mediaType: originalPost.mediaType,
      image: originalPost.image,
      hashtags: originalPost.hashtags || [],
      likes: [],
      commentsCount: 0,
      views: 0,
      originalPostId: postId,
      originalAuthorId: originalPost.authorId,
      createdAt: FieldValue.serverTimestamp()
    };

    const repostRef = await db.collection('posts').add(repostData);

    res.status(201).json({
      success: true,
      post: { id: repostRef.id, ...repostData }
    });
  } catch (error) {
    console.error('Repost error:', error);
    res.status(500).json({ message: 'Failed to repost' });
  }
};

// Get who viewed a post
export const getPostViewers = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    // Verify the user owns this post
    const postDoc = await db.collection('posts').doc(postId).get();
    if (!postDoc.exists) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (postDoc.data().authorId !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Get all viewers
    const viewsSnapshot = await db.collection('postViews')
      .where('postId', '==', postId)
      .get();

    const viewers = await Promise.all(viewsSnapshot.docs.map(async (doc) => {
      const viewData = doc.data();
      const userDoc = await db.collection('users').doc(viewData.viewerId).get();
      
      return {
        userId: viewData.viewerId,
        viewedAt: viewData.viewedAt,
        user: userDoc.exists ? {
          fullName: userDoc.data().fullName,
          profileImage: userDoc.data().profileImage,
          role: userDoc.data().role
        } : null
      };
    }));

    res.json({ success: true, viewers, totalViews: viewers.length });
  } catch (error) {
    console.error('Get post viewers error:', error);
    res.status(500).json({ message: 'Failed to fetch viewers' });
  }
};
