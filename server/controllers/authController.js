import bcrypt from 'bcryptjs';
import { db } from '../config/firebase.js';
import { generateToken } from '../utils/generateToken.js';
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js';

export const googleAuth = async (req, res) => {
  try {
    const { email, fullName, profileImage, googleUid, role } = req.body;

    if (!email || !googleUid) {
      return res.status(400).json({ message: 'Invalid Google credentials' });
    }

    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email.toLowerCase()).get();

    let userId, userData;

    if (!snapshot.empty) {
      // Existing user — log them in
      const userDoc = snapshot.docs[0];
      userId = userDoc.id;
      userData = userDoc.data();

      // If existing user has no role (edge case), use the provided role or default
      if (!userData.role) {
        const fallbackRole = role || 'freelancer';
        await usersRef.doc(userId).update({ role: fallbackRole, googleUid });
        userData.role = fallbackRole;
      }

      // Update googleUid if not set
      if (!userData.googleUid) {
        await usersRef.doc(userId).update({ googleUid });
      }
    } else {
      // New user — role is required for signup
      if (!role) {
        return res.status(400).json({ message: 'role_required', needsRole: true });
      }

      const newUser = {
        fullName: fullName || email.split('@')[0],
        email: email.toLowerCase(),
        password: null,
        role,
        profileImage: profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || email)}&background=00564C&color=fff`,
        googleUid,
        authProvider: 'google',
        accountType: 'individual',
        createdAt: new Date().toISOString()
      };

      const userDoc = await usersRef.add(newUser);
      userId = userDoc.id;
      userData = newUser;
    }

    const token = generateToken(userId, userData.role);

    res.json({
      success: true,
      token,
      user: {
        id: userId,
        fullName: userData.fullName,
        email: userData.email,
        role: userData.role,
        profileImage: userData.profileImage
      }
    });
  } catch (error) {
    console.error('Google auth error:', error.message, error.stack);
    res.status(500).json({ message: 'Google authentication failed', detail: error.message });
  }
};

export const register = async (req, res) => {
  try {
    const { 
      fullName, email, password, role, whatsapp, country, 
      skillCategory, portfolioWebsite, linkedIn, 
      companyName, companyType, nationalId
    } = req.body;

    // Check if user already exists
    const usersRef = db.collection('users');
    const existingUser = await usersRef.where('email', '==', email).get();
    
    if (!existingUser.empty) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Profile image is required' });
    }

    // Upload image to Cloudinary
    const profileImageUrl = await uploadToCloudinary(req.file.buffer);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Determine account type
    const accountType = companyName ? 'company' : 'individual';

    // Create user document
    const userData = {
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      whatsapp: whatsapp || null,
      profileImage: profileImageUrl,
      country: country || null,
      skillCategory: skillCategory || null,
      portfolioWebsite: portfolioWebsite || null,
      linkedIn: linkedIn || null,
      companyName: companyName || null,
      companyType: companyType || null,
      accountType,
      nin: nin || null,
      ninVerified: false,
      createdAt: new Date().toISOString()
    };

    const userDoc = await usersRef.add(userData);

    // Generate JWT
    const token = generateToken(userDoc.id, role);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: userDoc.id,
        fullName,
        email,
        role,
        profileImage: profileImageUrl
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message || 'Registration failed' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user by email
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email.toLowerCase()).get();

    if (snapshot.empty) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const userDoc = snapshot.docs[0];
    const user = { id: userDoc.id, ...userDoc.data() };

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT
    const token = generateToken(user.id, user.role);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
};

export const getMe = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userData = userDoc.data();
    delete userData.password;

    res.json({ 
      success: true, 
      user: {
        id: userDoc.id,
        ...userData
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Failed to fetch user data' });
  }
};
