import express from 'express';
import { createPost, getPost, getFeed, likePost, addComment, deleteComment, likeComment, deletePost, getUserPosts, incrementPostView, getComments, repostPost, getPostViewers, reactToPost } from '../controllers/postController.js';
import { protect } from '../middlewares/auth.js';
import { mediaUpload } from '../middlewares/upload.js';

const router = express.Router();

router.post('/', protect, mediaUpload.single('media'), createPost);
router.get('/feed', protect, getFeed);
router.get('/user/:userId', protect, getUserPosts);
router.get('/:postId', protect, getPost);
router.post('/:postId/like', protect, likePost);
router.post('/:postId/react', protect, reactToPost);
router.post('/:postId/comments', protect, addComment);
router.delete('/:postId/:commentId', protect, deleteComment);
router.post('/:postId/comments/:commentId/like', protect, likeComment);
router.get('/:postId/comments', protect, getComments);
router.post('/:postId/view', protect, incrementPostView);
router.get('/:postId/viewers', protect, getPostViewers);
router.post('/:postId/repost', protect, repostPost);
router.delete('/:postId', protect, deletePost);

export default router;
