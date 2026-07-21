import express from 'express';
import bcrypt from 'bcryptjs';
import { FieldValue } from 'firebase-admin/firestore';
import { db } from '../config/firebase.js';
import { generateToken } from '../utils/generateToken.js';
import { adminOnly } from '../middlewares/adminAuth.js';
import { upload } from '../middlewares/upload.js';

const router = express.Router();

// ── Admin Registration (one-time, protected by secret key) ──────────────────
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, secretKey } = req.body;

    if (secretKey !== process.env.ADMIN_SECRET_KEY) {
      return res.status(403).json({ message: 'Invalid secret key' });
    }

    if (!email || !password || !fullName) {
      return res.status(400).json({ message: 'Email, password and name are required' });
    }

    const existing = await db.collection('users')
      .where('email', '==', email.toLowerCase())
      .get();

    if (!existing.empty) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const docRef = await db.collection('users').add({
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'admin',
      profileImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=00564C&color=fff`,
      createdAt: new Date().toISOString(),
    });

    const token = generateToken(docRef.id, 'admin');
    res.json({
      success: true,
      message: 'Admin account created',
      token,
      user: { id: docRef.id, fullName, email, role: 'admin' }
    });
  } catch (err) {
    console.error('Admin register error:', err);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// ── Admin Login ──────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const snapshot = await db.collection('users')
      .where('email', '==', email.toLowerCase())
      .where('role', '==', 'admin')
      .get();

    if (snapshot.empty) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const userDoc = snapshot.docs[0];
    const user = { id: userDoc.id, ...userDoc.data() };

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken(user.id, 'admin');
    res.json({
      success: true,
      token,
      user: { id: user.id, fullName: user.fullName, email: user.email, role: 'admin' }
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ message: 'Login failed' });
  }
});

// ── Stats ────────────────────────────────────────────────────────────────────
router.get('/stats', adminOnly, async (req, res) => {
  try {
    const [usersSnap, jobsSnap, projectsSnap, blogsSnap] = await Promise.all([
      db.collection('users').get(),
      db.collection('jobs').get(),
      db.collection('projects').get(),
      db.collection('blogs').get(),
    ]);

    const users = usersSnap.docs.map(d => d.data());
    res.json({
      success: true,
      stats: {
        totalUsers: users.length,
        freelancers: users.filter(u => u.role === 'freelancer').length,
        clients: users.filter(u => u.role === 'client').length,
        totalJobs: jobsSnap.size,
        totalProjects: projectsSnap.size,
        totalBlogs: blogsSnap.size,
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
});

// ── Users ────────────────────────────────────────────────────────────────────
router.get('/users', adminOnly, async (req, res) => {
  try {
    const snap = await db.collection('users').orderBy('createdAt', 'desc').limit(100).get();
    const users = snap.docs.map(d => {
      const data = d.data();
      delete data.password;
      return { id: d.id, ...data };
    });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

router.delete('/users/:userId', adminOnly, async (req, res) => {
  try {
    await db.collection('users').doc(req.params.userId).delete();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

// ── Blogs ────────────────────────────────────────────────────────────────────
router.get('/blogs', adminOnly, async (req, res) => {
  try {
    const snap = await db.collection('blogs').get();
    const blogs = snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate?.()?.toISOString() || null,
    })).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    res.json({ success: true, blogs });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch blogs' });
  }
});

router.post('/blogs', adminOnly, upload.single('image'), async (req, res) => {
  try {
    const { title, description, content, authorName } = req.body;
    if (!title || !description || !content) {
      return res.status(400).json({ message: 'Title, description and content are required' });
    }

    let imageUrl = '';
    if (req.file) {
      const { uploadToCloudinary } = await import('../utils/cloudinaryUpload.js');
      imageUrl = await uploadToCloudinary(req.file.buffer, 'afro-task/blogs', 'image');
    }

    const docRef = await db.collection('blogs').add({
      title: title.trim(),
      description: description.trim(),
      content: content.trim(),
      image: imageUrl,
      authorName: authorName || 'AfroTask Admin',
      authorId: req.user.userId,
      createdAt: FieldValue.serverTimestamp(),
    });

    res.json({ success: true, id: docRef.id, image: imageUrl });
  } catch (err) {
    console.error('Admin blog create error:', err);
    res.status(500).json({ message: 'Failed to create blog' });
  }
});

router.put('/blogs/:blogId', adminOnly, upload.single('image'), async (req, res) => {
  try {
    const { title, description, content, authorName } = req.body;
    const ref = db.collection('blogs').doc(req.params.blogId);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ message: 'Blog not found' });

    const updates = {};
    if (title) updates.title = title.trim();
    if (description) updates.description = description.trim();
    if (content) updates.content = content.trim();
    if (authorName) updates.authorName = authorName;
    if (req.file) {
      const { uploadToCloudinary } = await import('../utils/cloudinaryUpload.js');
      updates.image = await uploadToCloudinary(req.file.buffer, 'afro-task/blogs', 'image');
    }
    updates.updatedAt = FieldValue.serverTimestamp();

    await ref.update(updates);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update blog' });
  }
});

router.delete('/blogs/:blogId', adminOnly, async (req, res) => {
  try {
    await db.collection('blogs').doc(req.params.blogId).delete();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete blog' });
  }
});

// ── Posts ─────────────────────────────────────────────────────────────────────
router.post('/posts', adminOnly, upload.single('image'), async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: 'Content is required' });

    let imageUrl = '';
    if (req.file) {
      const { uploadToCloudinary } = await import('../utils/cloudinaryUpload.js');
      imageUrl = await uploadToCloudinary(req.file.buffer, 'afro-task/posts', 'image');
    }

    const adminDoc = await db.collection('users').doc(req.user.userId).get();
    const admin = adminDoc.data();

    const docRef = await db.collection('posts').add({
      content: content.trim(),
      image: imageUrl || null,
      authorId: req.user.userId,
      authorName: admin?.fullName || 'AfroTask Admin',
      authorRole: 'admin',
      likes: [],
      comments: [],
      createdAt: FieldValue.serverTimestamp(),
    });

    res.json({ success: true, id: docRef.id });
  } catch (err) {
    console.error('Admin create post error:', err);
    res.status(500).json({ message: 'Failed to create post' });
  }
});

router.get('/posts', adminOnly, async (req, res) => {
  try {
    const snap = await db.collection('posts').orderBy('createdAt', 'desc').limit(100).get();
    const posts = await Promise.all(snap.docs.map(async (d) => {
      const data = d.data();
      let author = null;
      if (data.authorId) {
        const userDoc = await db.collection('users').doc(data.authorId).get();
        if (userDoc.exists) {
          const u = userDoc.data();
          author = { fullName: u.fullName, profileImage: u.profileImage, role: u.role };
        }
      }
      return { id: d.id, ...data, author, createdAt: data.createdAt?.toDate?.()?.toISOString() || (typeof data.createdAt === 'string' ? data.createdAt : null) };
    }));
    res.json({ success: true, posts });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
});

router.delete('/posts/:postId', adminOnly, async (req, res) => {
  try {
    await db.collection('posts').doc(req.params.postId).delete();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete post' });
  }
});

// ── Reports ───────────────────────────────────────────────────────────────────
router.get('/reports', adminOnly, async (req, res) => {
  try {
    const snap = await db.collection('reports').orderBy('createdAt', 'desc').limit(100).get();
    const reports = snap.docs.map(d => ({
      id: d.id, ...d.data(),
      createdAt: d.data().createdAt?.toDate?.()?.toISOString() || null,
    }));
    res.json({ success: true, reports });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch reports' });
  }
});

router.put('/reports/:reportId/resolve', adminOnly, async (req, res) => {
  try {
    await db.collection('reports').doc(req.params.reportId).update({
      status: 'resolved', resolvedAt: FieldValue.serverTimestamp(), resolvedBy: req.user.userId,
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Failed to resolve report' });
  }
});

router.delete('/reports/:reportId', adminOnly, async (req, res) => {
  try {
    await db.collection('reports').doc(req.params.reportId).delete();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete report' });
  }
});

// ── Broadcast message to all users ───────────────────────────────────────────
router.post('/broadcast', adminOnly, async (req, res) => {
  try {
    const { subject, message, targetRole } = req.body;
    if (!message) return res.status(400).json({ message: 'Message is required' });

    let query = db.collection('users');
    if (targetRole && targetRole !== 'all') {
      query = query.where('role', '==', targetRole);
    }
    const usersSnap = await query.get();

    const batch = db.batch();
    const now = new Date().toISOString();
    usersSnap.docs.forEach(userDoc => {
      const notifRef = db.collection('notifications').doc();
      batch.set(notifRef, {
        recipientId: userDoc.id,
        senderId: null,
        type: 'admin_broadcast',
        title: subject || 'Message from AfroTask Admin',
        message,
        data: { message },
        read: false,
        createdAt: now,
      });
    });
    await batch.commit();

    res.json({ success: true, sent: usersSnap.size });
  } catch (err) {
    console.error('Broadcast error:', err);
    res.status(500).json({ message: 'Failed to send broadcast' });
  }
});

// ── Direct message to a specific user ────────────────────────────────────────
router.post('/message/:userId', adminOnly, async (req, res) => {
  try {
    const { message, subject } = req.body;
    if (!message) return res.status(400).json({ message: 'Message is required' });

    await db.collection('notifications').add({
      recipientId: req.params.userId,
      senderId: null,
      type: 'admin_message',
      title: subject || 'Message from AfroTask Admin',
      message,
      data: { message },
      read: false,
      createdAt: new Date().toISOString(),
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send message' });
  }
});

// ── Admin profile update ──────────────────────────────────────────────────────
router.put('/profile', adminOnly, async (req, res) => {
  try {
    const { fullName, email } = req.body;
    const updates = {};
    if (fullName) updates.fullName = fullName;
    if (email) updates.email = email.toLowerCase();
    await db.collection('users').doc(req.user.userId).update(updates);
    const doc = await db.collection('users').doc(req.user.userId).get();
    const data = doc.data();
    delete data.password;
    res.json({ success: true, user: { id: doc.id, ...data } });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

router.put('/profile/password', adminOnly, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const doc = await db.collection('users').doc(req.user.userId).get();
    const valid = await bcrypt.compare(currentPassword, doc.data().password);
    if (!valid) return res.status(400).json({ message: 'Current password is incorrect' });
    const hashed = await bcrypt.hash(newPassword, 12);
    await db.collection('users').doc(req.user.userId).update({ password: hashed });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update password' });
  }
});
router.get('/jobs', adminOnly, async (req, res) => {
  try {
    const snap = await db.collection('jobs').orderBy('createdAt', 'desc').limit(100).get();
    const jobs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json({ success: true, jobs });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch jobs' });
  }
});

router.delete('/jobs/:jobId', adminOnly, async (req, res) => {
  try {
    await db.collection('jobs').doc(req.params.jobId).delete();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete job' });
  }
});

// ── Reviews ───────────────────────────────────────────────────────────────────
router.get('/reviews', adminOnly, async (req, res) => {
  try {
    const snap = await db.collection('reviews').limit(200).get();

    if (snap.empty) {
      return res.json({ success: true, reviews: [] });
    }

    // Collect all unique user IDs needed (reviewers + freelancers)
    const userIds = new Set();
    snap.docs.forEach(d => {
      const data = d.data();
      if (data.reviewerId) userIds.add(data.reviewerId);
      if (data.freelancerId) userIds.add(data.freelancerId);
    });

    // Fetch all users in parallel (one read per unique user)
    const userMap = {};
    await Promise.all([...userIds].map(async (uid) => {
      try {
        const doc = await db.collection('users').doc(uid).get();
        userMap[uid] = doc.exists
          ? { fullName: doc.data().fullName || 'Unknown', profileImage: doc.data().profileImage || null }
          : { fullName: 'Deleted User', profileImage: null };
      } catch {
        userMap[uid] = { fullName: 'Unknown', profileImage: null };
      }
    }));

    const reviews = snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        reviewer: userMap[data.reviewerId] || { fullName: 'Unknown', profileImage: null },
        freelancer: userMap[data.freelancerId] || { fullName: 'Unknown', profileImage: null },
      };
    });

    reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, reviews });
  } catch (err) {
    console.error('Admin reviews error:', err);
    res.status(500).json({ message: 'Failed to fetch reviews', detail: err.message });
  }
});

router.delete('/reviews/:reviewId', adminOnly, async (req, res) => {
  try {
    const doc = await db.collection('reviews').doc(req.params.reviewId).get();
    if (!doc.exists) return res.status(404).json({ message: 'Review not found' });
    await db.collection('reviews').doc(req.params.reviewId).delete();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete review' });
  }
});

export default router;
