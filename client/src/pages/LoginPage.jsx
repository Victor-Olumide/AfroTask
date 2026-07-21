import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import Footer from '../components/Footer';
import { ArrowLeft, Eye, EyeOff, Mail, X } from 'lucide-react';
import {
  auth,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  googleProvider,
  appleProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from '../config/firebase';

// Map Firebase error codes to user-friendly messages
const getFirebaseError = (code) => {
  switch (code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please try again.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please wait a moment and try again.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    default:
      return null;
  }
};

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  // Unverified email state
  const [unverifiedEmail, setUnverifiedEmail] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  // Forgot password modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);

  // Handle redirect result (for browsers that block popups)
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (!result) return;
        const { user } = result;
        await signOut(auth);
        const response = await api.post('/auth/google', {
          email: user.email,
          fullName: user.displayName,
          profileImage: user.photoURL,
          googleUid: user.uid,
        });
        if (response.data.needsRole) {
          toast('Please choose your account type to continue.', { icon: 'ℹ️' });
          navigate('/welcome');
          return;
        }
        toast.success('Logged in with Google!');
        login(response.data.token, response.data.user);
      } catch (err) {
        if (err?.code !== 'auth/no-current-user') {
          console.error('Redirect result error:', err);
        }
      }
    };
    handleRedirectResult();
  }, []);

  const handleChange = (e) => {
    setUnverifiedEmail(false);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUnverifiedEmail(false);

    // In emulator/dev mode skip Firebase verification — go straight to backend
    const usingEmulator = import.meta.env.VITE_USE_EMULATOR === 'true';

    try {
      if (!usingEmulator) {
        // Production: check Firebase email verification
        try {
          const fbResult = await signInWithEmailAndPassword(auth, formData.email, formData.password);

          if (!fbResult.user.emailVerified) {
            await signOut(auth);
            setUnverifiedEmail(true);
            setLoading(false);
            return;
          }

          await signOut(auth);
        } catch (fbErr) {
          const friendlyMsg = getFirebaseError(fbErr.code);
          if (friendlyMsg) {
            toast.error(friendlyMsg);
            setLoading(false);
            return;
          }
          // auth/user-not-found = legacy account, fall through to backend
          if (fbErr.code !== 'auth/user-not-found') {
            console.warn('Firebase login note:', fbErr.code, fbErr.message);
          }
        }
      }

      // Backend login — always runs
      const response = await api.post('/auth/login', formData);
      toast.success('Login successful!');
      login(response.data.token, response.data.user);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    try {
      const fbResult = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      await sendEmailVerification(fbResult.user);
      await signOut(auth);
      toast.success('Verification email sent! Check your inbox.');
    } catch (err) {
      toast.error('Could not resend verification email. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
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
      });

      if (response.data.needsRole) {
        // User doesn't exist yet — send them to welcome to pick a role
        toast('Please choose your account type to continue.', { icon: 'ℹ️' });
        navigate('/welcome');
        return;
      }

      toast.success('Logged in with Google!');
      login(response.data.token, response.data.user);
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') return; // user dismissed
      toast.error('Google sign-in failed. Please try again.');
      console.error('Google login error:', err);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleAppleLogin = async () => {
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
      });

      if (response.data.needsRole) {
        toast('Please choose your account type to continue.', { icon: 'ℹ️' });
        navigate('/welcome');
        return;
      }

      toast.success('Logged in with Apple!');
      login(response.data.token, response.data.user);
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') return;
      toast.error('Apple sign-in failed. Please try again.');
      console.error('Apple login error:', err);
    } finally {
      setAppleLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return toast.error('Please enter your email address.');
    setForgotLoading(true);
    try {
      await sendPasswordResetEmail(auth, forgotEmail.trim());
      setForgotSent(true);
    } catch (err) {
      const msg = getFirebaseError(err.code) || 'Failed to send reset email. Please try again.';
      toast.error(msg);
    } finally {
      setForgotLoading(false);
    }
  };

  const closeForgotModal = () => {
    setShowForgotModal(false);
    setForgotEmail('');
    setForgotSent(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Back to home */}
      <div className="p-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-green-600 transition font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center py-6 px-6 lg:px-12">
        <div className="w-full max-w-6xl flex gap-8 lg:gap-12">
          {/* Left illustration */}
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

          {/* Login form */}
          <div className="w-full lg:w-1/2 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8"
            >
              <div className="text-center mb-8">
                <img
                  src="/img/afro-task-logo.png"
                  alt="Afro Task"
                  className="h-16 w-auto mx-auto mb-4"
                />
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h1>
                <p className="text-gray-600 text-sm">Log in to continue to your dashboard</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      autoComplete="current-password"
                      className="w-full px-4 py-3 pr-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Email not verified warning */}
                <AnimatePresence>
                  {unverifiedEmail && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="bg-yellow-50 border border-yellow-300 rounded-lg p-4"
                    >
                      <div className="flex items-start gap-3">
                        <Mail className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-yellow-800">
                            Email not verified
                          </p>
                          <p className="text-xs text-yellow-700 mt-1">
                            Please verify your email before logging in. Check your inbox for the
                            verification link.
                          </p>
                          <button
                            type="button"
                            onClick={handleResendVerification}
                            disabled={resendLoading}
                            className="text-xs font-semibold text-yellow-800 underline mt-2 hover:text-yellow-900 disabled:opacity-50"
                          >
                            {resendLoading ? 'Sending...' : 'Resend verification email'}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Forgot password link */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-sm text-green-600 hover:text-green-700 font-medium transition"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
                >
                  {loading ? 'Logging in...' : 'Log in'}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">OR</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Google Sign-In */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-gray-700 disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {googleLoading ? 'Signing in...' : 'Continue with Google'}
              </button>

              {/* Apple Sign-In */}
              <button
                type="button"
                onClick={handleAppleLogin}
                disabled={appleLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 mt-3 bg-black hover:bg-gray-900 text-white rounded-lg transition font-medium disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.39.07 2.35.74 3.15.8 1.2-.24 2.35-.93 3.62-.84 1.54.12 2.7.72 3.44 1.84-3.14 1.88-2.39 5.98.48 7.13-.57 1.56-1.32 3.1-2.69 3.95zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                {appleLoading ? 'Signing in...' : 'Continue with Apple'}
              </button>

              <p className="mt-5 text-center text-gray-600 text-sm">
                Don't have an account?{' '}
                <button
                  onClick={() => navigate('/welcome')}
                  className="text-green-600 hover:text-green-700 font-semibold"
                >
                  Sign up
                </button>
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />

      {/* ── Forgot Password Modal ── */}
      <AnimatePresence>
        {showForgotModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
            onClick={closeForgotModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeForgotModal}
                className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

              {forgotSent ? (
                /* Success state */
                <div className="text-center py-4">
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-7 h-7 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Check your inbox</h3>
                  <p className="text-gray-600 text-sm mb-1">We sent a password reset link to:</p>
                  <p className="font-semibold text-gray-800 mb-4">{forgotEmail}</p>
                  <p className="text-gray-500 text-xs mb-6">
                    Click the link in the email to create a new password. The link expires in 1 hour.
                  </p>
                  <button
                    onClick={closeForgotModal}
                    className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition"
                  >
                    Back to Login
                  </button>
                </div>
              ) : (
                /* Form state */
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">Reset your password</h3>
                      <p className="text-xs text-gray-500">
                        Enter your email and we'll send a reset link
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleForgotSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        required
                        placeholder="Enter your registered email"
                        autoFocus
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div className="flex gap-3 pt-1">
                      <button
                        type="button"
                        onClick={closeForgotModal}
                        className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={forgotLoading}
                        className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition disabled:opacity-50"
                      >
                        {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoginPage;
