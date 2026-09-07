import { db } from '../config/firebase.js';
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js';

// Calculate profile completion percentage
const calculateProfileCompletion = (user) => {
  const fields = {
    freelancer: [
      'professionalTitle',
      'yearsOfExperience',
      'bio',
      'skills',
      'socialLinks',
      // 'introVideoUrl',
      'profileImage'
    ],
    client: [
      'companyName',
      'hiringPreferences',
      'profileImage'
    ]
  };

  const requiredFields = fields[user.role] || [];
  let completed = 0;

  requiredFields.forEach(field => {
    if (field === 'skills' && user.skills && user.skills.length > 0) {
      completed++;
    } else if (field === 'socialLinks' && user.socialLinks && user.socialLinks.linkedin) {
      completed++;
    } else if (field === 'hiringPreferences' && user.hiringPreferences && user.hiringPreferences.lookingFor) {
      completed++;
    } else if (user[field]) {
      completed++;
    }
  });

  return Math.round((completed / requiredFields.length) * 100);
};

// Determine profile strength
const getProfileStrength = (percentage, hasVideo, verified) => {
  if (percentage === 100 && hasVideo && verified) return 'elite';
  if (percentage >= 80 && hasVideo) return 'professional';
  return 'basic';
};

// Get profile completion status
export const getProfileStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userData = userDoc.data();
    const percentage = calculateProfileCompletion(userData);
    const strength = getProfileStrength(
      percentage,
      // !!userData.introVideoUrl,
      !!userData.verified
    );

    res.json({
      success: true,
      profileCompleted: percentage === 100,
      profileCompletionPercentage: percentage,
      profileStrength: strength,
      missingFields: getMissingFields(userData)
    });
  } catch (error) {
    console.error('Get profile status error:', error);
    res.status(500).json({ message: 'Failed to get profile status' });
  }
};

// Get missing fields
const getMissingFields = (user) => {
  const missing = [];
  
  if (user.role === 'freelancer') {
    if (!user.professionalTitle) missing.push('Professional Title');
    if (!user.yearsOfExperience) missing.push('Years of Experience');
    if (!user.bio || user.bio.length < 150) missing.push('Bio (min 150 characters)');
    if (!user.skills || user.skills.length === 0) missing.push('Skills');
    if (!user.socialLinks || !user.socialLinks.linkedin) missing.push('LinkedIn Profile');
    // if (!user.introVideoUrl) missing.push('Introduction Video');
    if (!user.profileImage) missing.push('Profile Photo');
  } else if (user.role === 'client') {
    if (!user.companyName) missing.push('Company Name');
    if (!user.hiringPreferences) missing.push('Hiring Preferences');
    if (!user.profileImage) missing.push('Profile Photo');
  }
  
  return missing;
};

// Update professional info (Step 1)
export const updateProfessionalInfo = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      professionalTitle,
      yearsOfExperience,
      bio,
      languages,
      availability,
      hourlyRate
    } = req.body;

    // Validate bio length
    if (bio && bio.length < 150) {
      return res.status(400).json({ message: 'Bio must be at least 150 characters' });
    }

    const updateData = {
      professionalTitle,
      yearsOfExperience: parseInt(yearsOfExperience),
      bio,
      languages: languages || [],
      availability,
      updatedAt: new Date().toISOString()
    };

    if (hourlyRate) {
      updateData.hourlyRate = parseFloat(hourlyRate);
    }

    await db.collection('users').doc(userId).update(updateData);

    // Recalculate completion
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    const percentage = calculateProfileCompletion(userData);

    await db.collection('users').doc(userId).update({
      profileCompletionPercentage: percentage
    });

    res.json({
      success: true,
      message: 'Professional info updated',
      profileCompletionPercentage: percentage
    });
  } catch (error) {
    console.error('Update professional info error:', error);
    res.status(500).json({ message: 'Failed to update professional info' });
  }
};

// Update skills (Step 2)
export const updateSkills = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { skills } = req.body;

    if (!skills || skills.length === 0) {
      return res.status(400).json({ message: 'Please select at least one skill' });
    }

    await db.collection('users').doc(userId).update({
      skills,
      updatedAt: new Date().toISOString()
    });

    // Recalculate completion
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    const percentage = calculateProfileCompletion(userData);

    await db.collection('users').doc(userId).update({
      profileCompletionPercentage: percentage
    });

    res.json({
      success: true,
      message: 'Skills updated',
      profileCompletionPercentage: percentage
    });
  } catch (error) {
    console.error('Update skills error:', error);
    res.status(500).json({ message: 'Failed to update skills' });
  }
};

// Update social links (Step 3)
export const updateSocialLinks = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { linkedin, github, portfolio, behance, dribbble, instagram, otherLinks } = req.body;

    const socialLinks = {
      linkedin: linkedin || '',
      github: github || '',
      portfolio: portfolio || '',
      behance: behance || '',
      dribbble: dribbble || '',
      instagram: instagram || '',
      otherLinks: otherLinks || []
    };

    await db.collection('users').doc(userId).update({
      socialLinks,
      updatedAt: new Date().toISOString()
    });

    // Recalculate completion
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    const percentage = calculateProfileCompletion(userData);

    await db.collection('users').doc(userId).update({
      profileCompletionPercentage: percentage
    });

    res.json({
      success: true,
      message: 'Social links updated',
      profileCompletionPercentage: percentage
    });
  } catch (error) {
    console.error('Update social links error:', error);
    res.status(500).json({ message: 'Failed to update social links' });
  }
};

// Upload intro video (Step 5)
// export const uploadIntroVideo = async (req, res) => {
//   try {
//     const userId = req.user.userId;

//     if (!req.file) {
//       return res.status(400).json({ message: 'Please upload a video' });
//     }

//     // Upload to Cloudinary
//     const videoUrl = await uploadToCloudinary(
//       req.file.buffer,
//       'afro-task/intro-videos',
//       'video'
//     );

//     await db.collection('users').doc(userId).update({
//       introVideoUrl: videoUrl,
//       updatedAt: new Date().toISOString()
//     });

//     // Recalculate completion
//     const userDoc = await db.collection('users').doc(userId).get();
//     const userData = userDoc.data();
//     const percentage = calculateProfileCompletion(userData);
//     const strength = getProfileStrength(percentage, true, userData.verified);

//     await db.collection('users').doc(userId).update({
//       profileCompletionPercentage: percentage,
//       profileStrength: strength,
//       profileCompleted: percentage === 100
//     });

//     res.json({
//       success: true,
//       message: 'Introduction video uploaded',
//       videoUrl,
//       profileCompletionPercentage: percentage,
//       profileCompleted: percentage === 100
//     });
//   } catch (error) {
//     console.error('Upload intro video error:', error);
//     res.status(500).json({ message: 'Failed to upload video' });
//   }
// };

// Update client hiring preferences
export const updateHiringPreferences = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      lookingFor,
      budgetRange,
      experienceLevel,
      projectDuration,
      location
    } = req.body;

    const hiringPreferences = {
      lookingFor,
      budgetRange,
      experienceLevel,
      projectDuration,
      location
    };

    await db.collection('users').doc(userId).update({
      hiringPreferences,
      updatedAt: new Date().toISOString()
    });

    // Recalculate completion
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    const percentage = calculateProfileCompletion(userData);

    await db.collection('users').doc(userId).update({
      profileCompletionPercentage: percentage,
      profileCompleted: percentage === 100
    });

    res.json({
      success: true,
      message: 'Hiring preferences updated',
      profileCompletionPercentage: percentage,
      profileCompleted: percentage === 100
    });
  } catch (error) {
    console.error('Update hiring preferences error:', error);
    res.status(500).json({ message: 'Failed to update hiring preferences' });
  }
};

// Complete onboarding
export const completeOnboarding = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();

    const percentage = calculateProfileCompletion(userData);

    if (percentage < 100) {
      return res.status(400).json({
        message: 'Please complete all required fields',
        missingFields: getMissingFields(userData)
      });
    }

    const strength = getProfileStrength(
      percentage,
      // !!userData.introVideoUrl,
      !!userData.verified
    );

    await db.collection('users').doc(userId).update({
      profileCompleted: true,
      profileCompletionPercentage: 100,
      profileStrength: strength,
      onboardingCompletedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Onboarding completed successfully!',
      profileStrength: strength
    });
  } catch (error) {
    console.error('Complete onboarding error:', error);
    res.status(500).json({ message: 'Failed to complete onboarding' });
  }
};
