import { useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import Footer from '../components/Footer';
import { ArrowLeft, Eye, EyeOff, Mail, ShieldCheck } from 'lucide-react';
import { auth, createUserWithEmailAndPassword, sendEmailVerification, signOut, signInWithEmailAndPassword, googleProvider, appleProvider, signInWithPopup } from '../config/firebase';

const SignupPage = () => {
  const { role } = useParams();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    whatsapp: '',
    password: '',
    confirmPassword: '',
    country: '',
    skillCategory: '',
    portfolioWebsite: '',
    linkedIn: '',
    companyName: '',
    companyType: '',
    nationalId: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [idVerifying, setIdVerifying] = useState(false);
  const [idStatus, setIdStatus] = useState(null); // null | 'valid' | 'invalid'

  // Per-country national ID config: label, placeholder, regex, hint
  const NATIONAL_ID_CONFIG = {
    Nigeria:       { label: 'NIN (National Identification Number)',      placeholder: '11-digit NIN',                  regex: /^\d{11}$/,          hint: 'Your 11-digit NIMC NIN' },
    Ghana:         { label: 'Ghana Card Number',                         placeholder: 'GHA-XXXXXXXXX-X',               regex: /^GHA-\d{9}-\d$/i,   hint: 'Format: GHA-000000000-0' },
    Kenya:         { label: 'National ID Number',                        placeholder: '8-digit ID number',             regex: /^\d{8}$/,            hint: 'Your 8-digit Kenyan National ID' },
    'South Africa':{ label: 'South African ID Number',                   placeholder: '13-digit ID number',            regex: /^\d{13}$/,           hint: 'Your 13-digit SA ID number' },
    Egypt:         { label: 'National ID Number',                        placeholder: '14-digit National ID',          regex: /^\d{14}$/,           hint: 'Your 14-digit Egyptian National ID' },
    Tanzania:      { label: 'NIDA Number',                               placeholder: '20-digit NIDA number',          regex: /^\d{20}$/,           hint: 'Your 20-digit NIDA number' },
    Uganda:        { label: 'National ID Number',                        placeholder: '14-character NIN',              regex: /^[A-Z0-9]{14}$/i,    hint: 'Your 14-character Ugandan NIN' },
    Rwanda:        { label: 'National ID Number',                        placeholder: '16-digit ID number',            regex: /^\d{16}$/,           hint: 'Your 16-digit Rwandan ID' },
    Ethiopia:      { label: 'Fayda ID / National ID',                    placeholder: 'National ID number',            regex: /^[A-Z0-9]{6,20}$/i,  hint: 'Your Ethiopian national ID number' },
    Morocco:       { label: 'CIN (Carte d\'Identité Nationale)',         placeholder: 'e.g. AB123456',                 regex: /^[A-Z]{1,2}\d{5,6}$/i, hint: 'Format: 1-2 letters + 5-6 digits' },
    Senegal:       { label: 'NINEA / CNI Number',                        placeholder: 'National ID number',            regex: /^[A-Z0-9]{6,15}$/i,  hint: 'Your Senegalese national ID' },
    'Ivory Coast': { label: 'CNI Number',                                placeholder: 'National ID number',            regex: /^[A-Z0-9]{6,15}$/i,  hint: 'Your Ivorian national ID number' },
    Cameroon:      { label: 'CNI Number',                                placeholder: 'National ID number',            regex: /^[A-Z0-9]{6,15}$/i,  hint: 'Your Cameroonian national ID' },
    Zimbabwe:      { label: 'National ID Number',                        placeholder: 'e.g. 63-123456A78',             regex: /^\d{2}-\d{6}[A-Z]\d{2}$/i, hint: 'Format: 00-000000A00' },
    Zambia:        { label: 'National Registration Card (NRC)',          placeholder: 'e.g. 123456/10/1',              regex: /^\d{6}\/\d{2}\/\d{1}$/, hint: 'Format: 000000/00/0' },
    Botswana:      { label: 'Omang ID Number',                           placeholder: '9-digit Omang number',          regex: /^\d{9}$/,            hint: 'Your 9-digit Omang ID' },
    Other:         { label: 'Government-Issued ID Number',               placeholder: 'Passport or national ID number',regex: /^[A-Z0-9]{5,20}$/i,  hint: 'Passport number or national ID' },
  };

  const getIdConfig = () => NATIONAL_ID_CONFIG[formData.country] || null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Reset ID verification if country changes
    if (name === 'country') {
      setFormData(prev => ({ ...prev, country: value, nationalId: '' }));
      setIdStatus(null);
    }
  };

  const handleImageChange = (e) => {
    setProfileImage(e.target.files[0]);
  };

  const validatePassword = (password) => {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const handleVerifyId = async () => {
    const config = getIdConfig();
    if (!config) return;
    if (!config.regex.test(formData.nationalId)) {
      toast.error(`Invalid format. ${config.hint}`);
      setIdStatus('invalid');
      return;
    }
    setIdVerifying(true);
    try {
      // Simulate async check — swap for a real API call when available
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIdStatus('valid');
      toast.success('ID submitted. Full verification happens within 24 hours.');
    } catch {
      setIdStatus('invalid');
      toast.error('Verification failed. Please try again.');
    } finally {
      setIdVerifying(false);
    }
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const { user } = result;
      await signOut(auth); // sign out Firebase session; app uses custom tokens

      const response = await api.post('/auth/google', {
        email: user.email,
        fullName: user.displayName,
        profileImage: user.photoURL,
        googleUid: user.uid,
        role, // from URL param — freelancer or client
      });

      toast.success('Account created with Google!');
      login(response.data.token, response.data.user);
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') return;
      toast.error('Google sign-up failed. Please try again.');
      console.error('Google signup error:', err);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleAppleSignup = async () => {
    setAppleLoading(true);
    try {
      const result = await signInWithPopup(auth, appleProvider);
      const { user } = result;
      await signOut(auth);

      const response = await api.post('/auth/google', {
        email: user.email,
        fullName: user.displayName || user.email?.split('@')[0],
        profileImage: user.photoURL,
        googleUid: user.uid,
        role,
      });

      toast.success('Account created with Apple!');
      login(response.data.token, response.data.user);
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') return;
      toast.error('Apple sign-up failed. Please try again.');
      console.error('Apple signup error:', err);
    } finally {
      setAppleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    if (!validatePassword(formData.password)) {
      return toast.error('Password must be 8+ chars with uppercase, number, and special character');
    }

    if (!profileImage) {
      return toast.error('Profile image is required');
    }

    if (formData.nin && !validateNIN(formData.nin)) {
      return toast.error('NIN must be exactly 11 digits');
    }

    if (formData.nin && ninStatus !== 'valid') {
      return toast.error('Please verify your NIN before submitting');
    }

    setLoading(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key]) data.append(key, formData[key]);
      });
      data.append('role', role);
      data.append('profileImage', profileImage);

      const response = await api.post('/auth/register', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Step 2: Create Firebase Auth user and send verification email
      // This must happen AFTER backend registration succeeds
      try {
        const fbUser = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        await sendEmailVerification(fbUser.user);
        // Sign out of Firebase email/password session — the app uses custom tokens for
        // Firestore/Storage, so we don't want to keep this session active
        await signOut(auth);
      } catch (fbErr) {
        if (fbErr.code === 'auth/email-already-in-use') {
          // Firebase user already exists (e.g. user retried after a partial failure).
          // Sign in and resend verification if not yet verified.
          try {
            const existing = await signInWithEmailAndPassword(auth, formData.email, formData.password);
            if (!existing.user.emailVerified) {
              await sendEmailVerification(existing.user);
            }
            await signOut(auth);
          } catch (resendErr) {
            console.warn('Could not resend verification:', resendErr?.message);
          }
        } else {
          // Non-critical — backend registration succeeded, but Firebase user creation failed.
          // Log it but don't block the user.
          console.error('Firebase user creation failed:', fbErr.code, fbErr.message);
          toast.error('Account created but verification email could not be sent. Please contact support.');
          setLoading(false);
          return;
        }
      }

      setRegisteredEmail(formData.email);
      setEmailSent(true);
      toast.success('Account created! Please verify your email before logging in.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="p-4">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-green-600 transition font-medium text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>

      {/* Email verification sent screen */}
      {emailSent ? (
        <div className="flex-1 flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md bg-white rounded-2xl shadow-xl p-10 text-center"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Check your email</h2>
            <p className="text-gray-600 text-sm mb-2">
              We sent a verification link to:
            </p>
            <p className="font-semibold text-gray-800 mb-5">{registeredEmail}</p>
            <p className="text-gray-500 text-sm mb-8">
              Click the link in the email to verify your account, then come back to log in.
            </p>
            <Link
              to="/login"
              className="inline-block w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition text-center"
            >
              Go to Login
            </Link>
          </motion.div>
        </div>
      ) : (
      <div className="flex-1 flex items-center justify-center py-6 px-6 lg:px-12">
        <div className="w-full max-w-6xl flex gap-8 lg:gap-12">
          <div className="hidden lg:flex lg:w-1/2 items-center justify-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center p-8"
            >
              <img 
                src="/img/fa1.png" 
                alt="Team collaboration" 
                className="w-full h-auto object-contain max-h-[600px]"
              />
            </motion.div>
          </div>

          <div className="w-full lg:w-1/2 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8"
            >
            <div className="text-center mb-6">
              <img 
                src="/img/afro-task-logo.png" 
                alt="Afro Task" 
                className="h-16 w-auto mx-auto mb-4"
              />
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Join Afro Task Today</h1>
              <p className="text-gray-600 text-sm">
                Connect with top freelancers and clients across Africa. Sign up to start collaborating
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {role === 'freelancer' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
                    <input
                      type="tel"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleChange}
                      required
                      placeholder="+234..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Select your country</option>
                      <option value="Nigeria">🇳🇬 Nigeria</option>
                      <option value="Ghana">🇬🇭 Ghana</option>
                      <option value="Kenya">🇰🇪 Kenya</option>
                      <option value="South Africa">🇿🇦 South Africa</option>
                      <option value="Egypt">🇪🇬 Egypt</option>
                      <option value="Tanzania">🇹🇿 Tanzania</option>
                      <option value="Uganda">🇺🇬 Uganda</option>
                      <option value="Rwanda">🇷🇼 Rwanda</option>
                      <option value="Ethiopia">🇪🇹 Ethiopia</option>
                      <option value="Morocco">🇲🇦 Morocco</option>
                      <option value="Senegal">🇸🇳 Senegal</option>
                      <option value="Ivory Coast">🇨🇮 Ivory Coast</option>
                      <option value="Cameroon">🇨🇲 Cameroon</option>
                      <option value="Zimbabwe">🇿🇼 Zimbabwe</option>
                      <option value="Zambia">🇿🇲 Zambia</option>
                      <option value="Botswana">🇧🇼 Botswana</option>
                      <option value="Other">🌍 Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Primary Skill/Service</label>
                    <input
                      type="text"
                      name="skillCategory"
                      value={formData.skillCategory}
                      onChange={handleChange}
                      required
                      placeholder="e.g., Full Stack Developer, UI/UX Designer, Video Editor"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">What service do you offer?</p>
                  </div>
                </>
              )}

              {role === 'client' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
                    <input
                      type="tel"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleChange}
                      required
                      placeholder="+234..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Select your country</option>
                      <option value="Nigeria">🇳🇬 Nigeria</option>
                      <option value="Ghana">🇬🇭 Ghana</option>
                      <option value="Kenya">🇰🇪 Kenya</option>
                      <option value="South Africa">🇿🇦 South Africa</option>
                      <option value="Egypt">🇪🇬 Egypt</option>
                      <option value="Tanzania">🇹🇿 Tanzania</option>
                      <option value="Uganda">🇺🇬 Uganda</option>
                      <option value="Rwanda">🇷🇼 Rwanda</option>
                      <option value="Ethiopia">🇪🇹 Ethiopia</option>
                      <option value="Morocco">🇲🇦 Morocco</option>
                      <option value="Senegal">🇸🇳 Senegal</option>
                      <option value="Ivory Coast">🇨🇮 Ivory Coast</option>
                      <option value="Cameroon">🇨🇲 Cameroon</option>
                      <option value="Zimbabwe">🇿🇼 Zimbabwe</option>
                      <option value="Zambia">🇿🇲 Zambia</option>
                      <option value="Botswana">🇧🇼 Botswana</option>
                      <option value="Other">🌍 Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name (Optional)</label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Type</label>
                    <select
                      name="companyType"
                      value={formData.companyType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Select type</option>
                      <option value="Startup">Startup</option>
                      <option value="Agency">Agency</option>
                      <option value="Corporate">Corporate</option>
                      <option value="Individual">Individual</option>
                    </select>
                  </div>
                </>
              )}

              {/* National ID — shown only after a country is selected */}
              {getIdConfig() && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {getIdConfig().label}
                  <span className="ml-1 text-gray-400 font-normal text-xs">— Optional but recommended</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      name="nationalId"
                      value={formData.nationalId}
                      onChange={(e) => {
                        setFormData({ ...formData, nationalId: e.target.value });
                        setIdStatus(null);
                      }}
                      placeholder={getIdConfig().placeholder}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        idStatus === 'valid'
                          ? 'border-green-500 bg-green-50'
                          : idStatus === 'invalid'
                          ? 'border-red-400 bg-red-50'
                          : 'border-gray-300'
                      }`}
                    />
                    {idStatus === 'valid' && (
                      <ShieldCheck className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleVerifyId}
                    disabled={idVerifying || !formData.nationalId || idStatus === 'valid'}
                    className="px-4 py-3 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition disabled:opacity-50 whitespace-nowrap"
                  >
                    {idVerifying ? 'Checking...' : idStatus === 'valid' ? 'Verified ✓' : 'Verify ID'}
                  </button>
                </div>
                {idStatus === 'valid' && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> ID submitted — full verification within 24 hours.
                  </p>
                )}
                {idStatus === 'invalid' && (
                  <p className="text-xs text-red-500 mt-1">{getIdConfig().hint}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Verifying your government ID builds trust and unlocks higher-paying jobs.
                </p>
              </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 pr-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 pr-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture</label>
                <input
                  type="file"
                  onChange={handleImageChange}
                  accept="image/*"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium">OR</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Google Sign-Up */}
            {/* <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-gray-700 disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {googleLoading ? 'Signing up...' : 'Sign up with Google'}
            </button> */}

            {/* Apple Sign-Up */}
            {/* <button
              type="button"
              onClick={handleAppleSignup}
              disabled={appleLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 mt-3 bg-black hover:bg-gray-900 text-white rounded-lg transition font-medium disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.39.07 2.35.74 3.15.8 1.2-.24 2.35-.93 3.62-.84 1.54.12 2.7.72 3.44 1.84-3.14 1.88-2.39 5.98.48 7.13-.57 1.56-1.32 3.1-2.69 3.95zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              {appleLoading ? 'Signing up...' : 'Sign up with Apple'}
            </button> */}

            <p className="mt-5 text-center text-gray-600 text-sm">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-green-600 hover:text-green-700 font-semibold"
              >
                Log in
              </button>
            </p>
          </motion.div>
        </div>
        </div>
      </div>
      )}

      <Footer />
    </div>
  );
};

export default SignupPage;
