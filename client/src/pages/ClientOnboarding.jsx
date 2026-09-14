import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { Building, Target, Camera, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const inputClass =
  'w-full px-4 py-3 text-sm bg-gray-50 border border-transparent focus:border-[#00564C] focus:bg-white rounded-lg outline-none transition';

const ClientOnboarding = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [companyInfo, setCompanyInfo] = useState({
    companyName: '',
    companyWebsite: '',
    industry: '',
    linkedIn: ''
  });

  const [hiringPreferences, setHiringPreferences] = useState({
    lookingFor: '',
    budgetRange: '',
    experienceLevel: '',
    projectDuration: '',
    location: ''
  });

  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);

  useEffect(() => {
    checkProfileStatus();
  }, []);

  const checkProfileStatus = async () => {
    try {
      const response = await api.get('/onboarding/status');
      if (response.data.profileCompleted) {
        navigate('/client/feed');
      }
    } catch {
      // silent
    }
  };

  const handleSkip = () => navigate('/client/feed');

  const handleStep1Submit = async () => {
    if (!companyInfo.companyName) {
      toast.error('Company name is required');
      return;
    }

    if (!companyInfo.companyWebsite && !companyInfo.linkedIn) {
      toast.error('Please provide either company website or LinkedIn profile');
      return;
    }

    setLoading(true);
    try {
      await api.put('/profile/update', {
        companyName: companyInfo.companyName,
        companyWebsite: companyInfo.companyWebsite,
        industry: companyInfo.industry
      });

      if (companyInfo.linkedIn) {
        await api.put('/onboarding/social-links', {
          linkedin: companyInfo.linkedIn
        });
      }

      setCurrentStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async () => {
    if (!hiringPreferences.lookingFor || !hiringPreferences.budgetRange) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      await api.put('/onboarding/hiring-preferences', hiringPreferences);
      setCurrentStep(3);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const handleStep3Submit = async () => {
    if (!profileImage && !user?.profileImage) {
      toast.error('Please upload a profile photo');
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
      setTimeout(() => {
        navigate('/client/feed');
      }, 1200);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  const getProgress = () => (currentStep / 3) * 100;

  const STEPS = [
    { num: 1, icon: Building, label: 'Company' },
    { num: 2, icon: Target, label: 'Preferences' },
    { num: 3, icon: Camera, label: 'Photo' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Complete your hiring profile</h1>
            <p className="text-sm text-gray-500 mt-0.5">Step {currentStep} of 3</p>
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
                  {currentStep > step.num ? <CheckCircle className="w-4 h-4" /> : <step.icon className="w-4 h-4" />}
                </div>
                <span className={`text-[11px] font-medium ${currentStep >= step.num ? 'text-gray-700' : 'text-gray-400'}`}>
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

        <motion.div
          className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8"
          key={currentStep}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.2 }}
        >
          {currentStep === 1 && (
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-gray-900">Company information</h2>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={companyInfo.companyName}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, companyName: e.target.value })}
                  className={inputClass}
                  placeholder="Your Company Name"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Company Website</label>
                <input
                  type="url"
                  value={companyInfo.companyWebsite}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, companyWebsite: e.target.value })}
                  className={inputClass}
                  placeholder="https://yourcompany.com"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  LinkedIn Profile {!companyInfo.companyWebsite && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="url"
                  value={companyInfo.linkedIn}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, linkedIn: e.target.value })}
                  className={inputClass}
                  placeholder="https://linkedin.com/company/yourcompany"
                />
                <p className="text-xs text-gray-400 mt-1">Required if no company website provided</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Industry</label>
                <select
                  value={companyInfo.industry}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, industry: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Select Industry</option>
                  <option value="Technology">Technology</option>
                  <option value="Finance">Finance</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Retail">Retail</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <button
                onClick={handleStep1Submit}
                disabled={loading}
                className="w-full mt-2 px-6 py-2.5 bg-[#00564C] hover:bg-[#003F38] text-white text-sm rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2 transition"
              >
                {loading ? 'Saving...' : 'Continue'} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-gray-900">Hiring preferences</h2>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  What type of freelancer are you looking for? <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={hiringPreferences.lookingFor}
                  onChange={(e) => setHiringPreferences({ ...hiringPreferences, lookingFor: e.target.value })}
                  className={inputClass}
                  placeholder="e.g., Full Stack Developers, Graphic Designers"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Budget Range <span className="text-red-500">*</span>
                </label>
                <select
                  value={hiringPreferences.budgetRange}
                  onChange={(e) => setHiringPreferences({ ...hiringPreferences, budgetRange: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Select Budget Range</option>
                  <option value="$500-$1,000">$500 - $1,000</option>
                  <option value="$1,000-$5,000">$1,000 - $5,000</option>
                  <option value="$5,000-$10,000">$5,000 - $10,000</option>
                  <option value="$10,000+">$10,000+</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Preferred Experience Level</label>
                <select
                  value={hiringPreferences.experienceLevel}
                  onChange={(e) => setHiringPreferences({ ...hiringPreferences, experienceLevel: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Select Experience Level</option>
                  <option value="Entry Level">Entry Level (0-2 years)</option>
                  <option value="Intermediate">Intermediate (2-5 years)</option>
                  <option value="Expert">Expert (5+ years)</option>
                  <option value="Any">Any Level</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Project Duration</label>
                <select
                  value={hiringPreferences.projectDuration}
                  onChange={(e) => setHiringPreferences({ ...hiringPreferences, projectDuration: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Select Duration</option>
                  <option value="Short-term">Short-term (Less than 1 month)</option>
                  <option value="Medium-term">Medium-term (1-3 months)</option>
                  <option value="Long-term">Long-term (3+ months)</option>
                  <option value="Ongoing">Ongoing</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Location Preference</label>
                <select
                  value={hiringPreferences.location}
                  onChange={(e) => setHiringPreferences({ ...hiringPreferences, location: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Select Location</option>
                  <option value="Remote Only">Remote Only</option>
                  <option value="Africa">Africa</option>
                  <option value="Specific Country">Specific Country</option>
                  <option value="Any Location">Any Location</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 px-6 py-2.5 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={handleStep2Submit}
                  disabled={loading}
                  className="flex-1 px-6 py-2.5 bg-[#00564C] hover:bg-[#003F38] text-white text-sm rounded-lg disabled:opacity-50 transition flex items-center justify-center gap-2"
                >
                  {loading ? 'Saving...' : 'Continue'} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
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
                      onChange={handleProfileImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-400 text-center">
                  Upload a professional photo — visible to freelancers
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="flex-1 px-6 py-2.5 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={handleStep3Submit}
                  disabled={loading}
                  className="flex-1 px-6 py-2.5 bg-[#00564C] hover:bg-[#003F38] text-white text-sm rounded-lg disabled:opacity-50 transition flex items-center justify-center gap-2"
                >
                  {loading ? 'Finishing...' : 'Complete profile'} <CheckCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ClientOnboarding;