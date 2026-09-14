import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import {
  User, Briefcase, Link as LinkIcon, Camera,
  Check, ArrowRight, ArrowLeft
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const PREDEFINED_SKILLS = [
  'Full Stack Development', 'Frontend Development', 'Backend Development',
  'React', 'Node.js', 'NestJS', 'MongoDB', 'Firebase',
  'UI/UX Design', 'Graphic Design', 'Web Design',
  'Mobile App Development', 'Flutter', 'React Native',
  'DevOps', 'AWS', 'Cybersecurity',
  'Data Analysis', 'Machine Learning', 'AI Development',
  'Video Editing', 'Motion Graphics',
  'SEO', 'Digital Marketing', 'Content Writing', 'Copywriting',
  'WordPress', 'Shopify Development', '3D Modeling', 'Product Design'
];

const TOTAL_STEPS = 4;

const STEPS = [
  { num: 1, icon: User, label: 'Info' },
  { num: 2, icon: Briefcase, label: 'Skills' },
  { num: 3, icon: LinkIcon, label: 'Links' },
  { num: 4, icon: Camera, label: 'Photo' },
];

const inputClass =
  'w-full px-4 py-2.5 text-sm bg-gray-50 border border-transparent focus:border-[#00564C] focus:bg-white rounded-lg outline-none transition';

const FreelancerOnboarding = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [professionalInfo, setProfessionalInfo] = useState({
    professionalTitle: '', yearsOfExperience: '', bio: '',
    languages: '', availability: 'full-time', hourlyRate: ''
  });

  const [selectedSkills, setSelectedSkills] = useState([]);
  const [customSkill, setCustomSkill] = useState('');
  const [showCustomSkill, setShowCustomSkill] = useState(false);

  const [socialLinks, setSocialLinks] = useState({
    linkedin: '', github: '', portfolio: '', behance: '', dribbble: '', instagram: ''
  });

  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const response = await api.get('/onboarding/status');
      if (response.data.profileCompleted) {
        navigate('/freelancer/feed');
      }
    } catch {
      // silent
    }
  };

  const handleSkip = () => navigate('/freelancer/feed');

  const handleStep1 = async () => {
    if (!professionalInfo.professionalTitle || !professionalInfo.yearsOfExperience || !professionalInfo.bio) {
      toast.error('Please fill all required fields');
      return;
    }
    if (professionalInfo.bio.length < 150) {
      toast.error('Bio must be at least 150 characters');
      return;
    }
    setLoading(true);
    try {
      await api.put('/onboarding/professional-info', {
        ...professionalInfo,
        languages: professionalInfo.languages.split(',').map(l => l.trim()).filter(l => l)
      });
      setCurrentStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2 = async () => {
    if (selectedSkills.length === 0) {
      toast.error('Please select at least one skill');
      return;
    }
    setLoading(true);
    try {
      await api.put('/onboarding/skills', { skills: selectedSkills });
      setCurrentStep(3);
    } catch {
      toast.error('Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleStep3 = async () => {
    if (!socialLinks.linkedin) {
      toast.error('LinkedIn is required');
      return;
    }
    setLoading(true);
    try {
      await api.put('/onboarding/social-links', socialLinks);
      setCurrentStep(4);
    } catch {
      toast.error('Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleStep4 = async () => {
    if (!profileImage && !user?.profileImage) {
      toast.error('Please upload a photo');
      return;
    }
    setLoading(true);
    try {
      if (profileImage) {
        const formData = new FormData();
        formData.append('profileImage', profileImage);
        await api.put('/profile/update', formData);
      }
      await api.post('/onboarding/complete');
      toast.success('Profile complete!');
      setTimeout(() => navigate('/freelancer/feed'), 1200);
    } catch {
      toast.error('Failed to complete profile');
    } finally {
      setLoading(false);
    }
  };

  const toggleSkill = (skill) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const addCustomSkill = () => {
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
      setSelectedSkills([...selectedSkills, customSkill.trim()]);
      setCustomSkill('');
      setShowCustomSkill(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Complete your profile</h1>
            <p className="text-sm text-gray-500 mt-0.5">Step {currentStep} of {TOTAL_STEPS}</p>
          </div>
          <button
            onClick={handleSkip}
            className="text-sm text-gray-400 hover:text-gray-600 font-medium transition"
          >
            Skip for now
          </button>
        </div>

        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((step, i) => (
            <div key={step.num} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                    currentStep > step.num
                      ? 'bg-[#00564C] text-white'
                      : currentStep === step.num
                      ? 'bg-[#E6F0EF] text-[#00564C] border-2 border-[#00564C]'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {currentStep > step.num ? <Check className="w-4 h-4" /> : <step.icon className="w-4 h-4" />}
                </div>
                <span
                  className={`text-[11px] font-medium ${
                    currentStep >= step.num ? 'text-gray-700' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 rounded-full transition-colors ${
                    currentStep > step.num ? 'bg-[#00564C]' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <h2 className="text-base font-semibold text-gray-900">Professional information</h2>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Professional title</label>
                  <input
                    type="text"
                    value={professionalInfo.professionalTitle}
                    onChange={(e) => setProfessionalInfo({ ...professionalInfo, professionalTitle: e.target.value })}
                    className={inputClass}
                    placeholder="e.g. Full Stack Developer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Years of experience</label>
                  <input
                    type="number"
                    value={professionalInfo.yearsOfExperience}
                    onChange={(e) => setProfessionalInfo({ ...professionalInfo, yearsOfExperience: e.target.value })}
                    className={inputClass}
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Bio</label>
                  <textarea
                    value={professionalInfo.bio}
                    onChange={(e) => setProfessionalInfo({ ...professionalInfo, bio: e.target.value })}
                    rows={5}
                    className={`${inputClass} resize-none`}
                    placeholder="Tell clients about yourself, your experience, and what you do best..."
                  />
                  <p className={`text-xs mt-1 ${professionalInfo.bio.length >= 150 ? 'text-[#00564C]' : 'text-gray-400'}`}>
                    {professionalInfo.bio.length}/150 minimum
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Languages</label>
                  <input
                    type="text"
                    value={professionalInfo.languages}
                    onChange={(e) => setProfessionalInfo({ ...professionalInfo, languages: e.target.value })}
                    className={inputClass}
                    placeholder="English, French"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Availability</label>
                    <select
                      value={professionalInfo.availability}
                      onChange={(e) => setProfessionalInfo({ ...professionalInfo, availability: e.target.value })}
                      className={inputClass}
                    >
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Hourly rate (USD)</label>
                    <input
                      type="number"
                      value={professionalInfo.hourlyRate}
                      onChange={(e) => setProfessionalInfo({ ...professionalInfo, hourlyRate: e.target.value })}
                      className={inputClass}
                      min="0"
                    />
                  </div>
                </div>

                <button
                  onClick={handleStep1}
                  disabled={loading}
                  className="w-full mt-2 px-6 py-2.5 bg-[#00564C] hover:bg-[#003F38] text-white text-sm rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2 transition"
                >
                  {loading ? 'Saving...' : 'Continue'} <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <h2 className="text-base font-semibold text-gray-900">Select your skills</h2>

                <div className="flex flex-wrap gap-2">
                  {PREDEFINED_SKILLS.map((skill) => (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        selectedSkills.includes(skill)
                          ? 'bg-[#00564C] text-white'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                  <button
                    onClick={() => setShowCustomSkill(!showCustomSkill)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#E6F0EF] text-[#00564C] hover:bg-[#d8e9e7] transition"
                  >
                    + Other
                  </button>
                </div>

                {showCustomSkill && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customSkill}
                      onChange={(e) => setCustomSkill(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addCustomSkill()}
                      className={`flex-1 ${inputClass}`}
                      placeholder="Custom skill"
                    />
                    <button onClick={addCustomSkill} className="px-4 py-2 bg-[#00564C] hover:bg-[#003F38] text-white text-sm rounded-lg transition">
                      Add
                    </button>
                  </div>
                )}

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-medium text-gray-600 mb-2">Selected ({selectedSkills.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedSkills.length === 0 ? (
                      <p className="text-sm text-gray-400">No skills selected yet</p>
                    ) : (
                      selectedSkills.map((skill) => (
                        <span key={skill} className="px-3 py-1 bg-[#00564C] text-white rounded-lg text-xs font-medium">
                          {skill}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 px-6 py-2.5 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    onClick={handleStep2}
                    disabled={loading}
                    className="flex-1 px-6 py-2.5 bg-[#00564C] hover:bg-[#003F38] text-white text-sm rounded-lg disabled:opacity-50 transition flex items-center justify-center gap-2"
                  >
                    {loading ? 'Saving...' : 'Continue'} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <h2 className="text-base font-semibold text-gray-900">Social links</h2>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">LinkedIn</label>
                  <input
                    type="url"
                    value={socialLinks.linkedin}
                    onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                    className={inputClass}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">GitHub</label>
                  <input
                    type="url"
                    value={socialLinks.github}
                    onChange={(e) => setSocialLinks({ ...socialLinks, github: e.target.value })}
                    className={inputClass}
                    placeholder="https://github.com/yourusername"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Portfolio</label>
                  <input
                    type="url"
                    value={socialLinks.portfolio}
                    onChange={(e) => setSocialLinks({ ...socialLinks, portfolio: e.target.value })}
                    className={inputClass}
                    placeholder="https://yourportfolio.com"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="flex-1 px-6 py-2.5 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    onClick={handleStep3}
                    disabled={loading}
                    className="flex-1 px-6 py-2.5 bg-[#00564C] hover:bg-[#003F38] text-white text-sm rounded-lg disabled:opacity-50 transition flex items-center justify-center gap-2"
                  >
                    {loading ? 'Saving...' : 'Continue'} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <h2 className="text-base font-semibold text-gray-900">Profile photo</h2>

                <div className="flex flex-col items-center gap-3 py-4">
                  <div className="relative">
                    <img
                      src={profileImagePreview || user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}`}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover border-4 border-[#E6F0EF]"
                    />
                    <label className="absolute bottom-0 right-0 p-2.5 bg-[#00564C] hover:bg-[#003F38] text-white rounded-full cursor-pointer transition shadow-sm">
                      <Camera className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setProfileImage(file);
                            setProfileImagePreview(URL.createObjectURL(file));
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-400">Click the camera icon to upload a photo</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="flex-1 px-6 py-2.5 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    onClick={handleStep4}
                    disabled={loading}
                    className="flex-1 px-6 py-2.5 bg-[#00564C] hover:bg-[#003F38] text-white text-sm rounded-lg disabled:opacity-50 transition flex items-center justify-center gap-2"
                  >
                    {loading ? 'Finishing...' : 'Complete profile'} <Check className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default FreelancerOnboarding;