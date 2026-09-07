import express from 'express';
import {
  getProfileStatus,
  updateProfessionalInfo,
  updateSkills,
  updateSocialLinks,
  // uploadIntroVideo,
  updateHiringPreferences,
  completeOnboarding
} from '../controllers/onboardingController.js';
import { protect } from '../middlewares/auth.js';
// import { mediaUpload } from '../middlewares/upload.js';

const router = express.Router();

// Get profile completion status
router.get('/status', protect, getProfileStatus);

// Freelancer onboarding steps
router.put('/professional-info', protect, updateProfessionalInfo);
router.put('/skills', protect, updateSkills);
router.put('/social-links', protect, updateSocialLinks);
// router.post('/intro-video', protect, mediaUpload.single('video'), uploadIntroVideo);

// Client onboarding
router.put('/hiring-preferences', protect, updateHiringPreferences);

// Complete onboarding
router.post('/complete', protect, completeOnboarding);

export default router;
