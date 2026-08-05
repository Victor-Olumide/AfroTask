import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  LogOut,
  Mail,
  Monitor,
  Moon,
  Save,
  Shield,
  Sun,
  Trash2,
  User,
  Bell,
  Camera,
  Check,
  Eye,
  EyeOff,
  Lock,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useDarkMode } from '../context/DarkModeContext';

const STORAGE_KEY = 'afrotask-settings';

const DEFAULT_LOCAL_SETTINGS = {
  emailNotifications: true,
  marketingEmails: false,
  projectUpdates: true,
  messageAlerts: true,
  weeklyDigest: false,
};

function buildInitialProfile(user) {
  return {
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || '',
    professionalTitle: user?.professionalTitle || '',
    companyName: user?.companyName || '',
    companyWebsite: user?.companyWebsite || '',
    industry: user?.industry || '',
  };
}

function readLocalSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_LOCAL_SETTINGS;
    return { ...DEFAULT_LOCAL_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_LOCAL_SETTINGS;
  }
}

function saveLocalSettings(value) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // ignore storage failures
  }
}

function getPasswordStrength(password) {
  if (!password) return null;
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { label: 'Weak', color: 'bg-red-500', width: 'w-1/5' };
  if (score <= 2) return { label: 'Fair', color: 'bg-orange-400', width: 'w-2/5' };
  if (score <= 3) return { label: 'Good', color: 'bg-yellow-400', width: 'w-3/5' };
  if (score <= 4) return { label: 'Strong', color: 'bg-emerald-500', width: 'w-4/5' };
  return { label: 'Very strong', color: 'bg-emerald-600', width: 'w-full' };
}

const NAV_SECTIONS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Monitor },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'session', label: 'Session', icon: LogOut },
];

function SettingsCard({ icon: Icon, title, description, children }) {
  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5 md:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="rounded-2xl bg-[#00564C]/10 p-3 text-[#00564C] dark:bg-[#00564C]/20 dark:text-emerald-300">
          <Icon size={20} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-white/60">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function SettingsToggle({ label, description, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-gray-200 p-4 transition hover:border-[#00564C]/30 dark:border-white/10 dark:hover:border-emerald-400/30">
      <div>
        <p className="font-medium text-gray-900 dark:text-white">{label}</p>
        <p className="mt-1 text-sm text-gray-500 dark:text-white/60">{description}</p>
      </div>
      <div className="relative mt-1">
        <input type="checkbox" className="peer sr-only" checked={checked} onChange={onChange} />
        <div className="h-6 w-11 rounded-full bg-gray-300 transition peer-checked:bg-[#00564C] dark:bg-white/20" />
        <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5" />
      </div>
    </label>
  );
}

function Input({ label, className = '', ...props }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-medium text-gray-700 dark:text-white/80">{label}</span>
      <input
        {...props}
        className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#00564C] dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30"
      />
    </label>
  );
}

function TextArea({ label, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-gray-700 dark:text-white/80">{label}</span>
      <textarea
        {...props}
        className="min-h-[120px] w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#00564C] dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30"
      />
    </label>
  );
}

export default function AppSettingsPage() {
  const { user, setUser, logout } = useAuth();
  const { dark, toggle } = useDarkMode();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState(() => buildInitialProfile(user));
  const [localSettings, setLocalSettings] = useState(DEFAULT_LOCAL_SETTINGS);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(user?.profileImage || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [savingPassword, setSavingPassword] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');
  const [unsavedProfile, setUnsavedProfile] = useState(false);
  const [unsavedPrefs, setUnsavedPrefs] = useState(false);
  const sectionRefs = useRef({});

  const passwordStrength = getPasswordStrength(passwordForm.newPassword);

  const scrollToSection = (id) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveSection(id);
  };
  useEffect(() => {
    setProfile(buildInitialProfile(user));
    setProfileImagePreview(user?.profileImage || '');
  }, [user]);

  useEffect(() => {
    setLocalSettings(readLocalSettings());
  }, []);

  const roleLabel = useMemo(() => {
    if (user?.role === 'client') return 'Client';
    if (user?.role === 'freelancer') return 'Freelancer';
    return 'Member';
  }, [user?.role]);

  const handleProfileChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setUnsavedProfile(true);
  };

  const handleToggleSetting = (field) => {
    setLocalSettings((prev) => ({ ...prev, [field]: !prev[field] }));
    setUnsavedPrefs(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProfileImageFile(file);
    setProfileImagePreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);

    try {
      const formData = new FormData();
      formData.append('fullName', profile.fullName);
      formData.append('phone', profile.phone);
      formData.append('location', profile.location);
      formData.append('bio', profile.bio);
      formData.append('professionalTitle', profile.professionalTitle);
      formData.append('companyName', profile.companyName);
      formData.append('companyWebsite', profile.companyWebsite);
      formData.append('industry', profile.industry);

      if (profileImageFile) {
        formData.append('profileImage', profileImageFile);
      }

      const res = await api.put('/profile/update', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Update the user in context so the rest of the app reflects the changes
      if (res.data?.user) {
        setUser(res.data.user);
      }

      toast.success('Profile saved');
      setUnsavedProfile(false);
      setProfileImageFile(null);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to save profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePreferences = async () => {
    setSavingPrefs(true);

    try {
      saveLocalSettings(localSettings);
      toast.success('Preferences saved on this device');
      setUnsavedPrefs(false);
    } catch {
      toast.error('Failed to save preferences');
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('Please fill all password fields');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setSavingPassword(true);

    try {
      await api.put('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordFields(false);
      toast.success('Password updated');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa] px-4 py-6 text-gray-900 dark:bg-[#071411] dark:text-white md:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-4 border-b border-gray-200 pb-5 dark:border-white/10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center rounded-xl border border-gray-200 p-2 text-gray-500 transition hover:border-gray-300 hover:text-gray-800 dark:border-white/10 dark:text-white/60 dark:hover:border-white/20 dark:hover:text-white"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h1>
              <p className="text-xs text-gray-500 dark:text-white/50 capitalize">{roleLabel} account</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.fullName || 'AfroTask User'}</p>
              <p className="text-xs text-gray-500 dark:text-white/50">{user?.email}</p>
            </div>
            <div className="h-9 w-9 overflow-hidden rounded-xl border border-gray-200 bg-gray-100 dark:border-white/10 dark:bg-white/10 flex-shrink-0">
              {profileImagePreview ? (
                <img src={profileImagePreview} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-[#00564C] dark:text-emerald-300">
                  {(user?.fullName || 'A')[0]}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Unsaved changes banner */}
        {(unsavedProfile || unsavedPrefs) && (
          <div className="mb-4 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-300">
            <AlertCircle size={16} className="shrink-0" />
            You have unsaved changes.{' '}
            {unsavedProfile && <button onClick={handleSaveProfile} className="font-semibold underline">Save profile</button>}
            {unsavedProfile && unsavedPrefs && ' · '}
            {unsavedPrefs && <button onClick={handleSavePreferences} className="font-semibold underline">Save preferences</button>}
          </div>
        )}

        {/* Section nav */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {NAV_SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => scrollToSection(id)}
              className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                activeSection === id
                  ? 'bg-[#00564C] text-white shadow'
                  : 'bg-white text-gray-600 hover:bg-gray-100 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10'
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div ref={(el) => (sectionRefs.current['profile'] = el)}>
            <SettingsCard
              icon={User}
              title="Profile information"
              description="Update the details other users and clients can see on your account."
            >
              <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-dashed border-gray-300 p-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 overflow-hidden rounded-3xl bg-gray-100 dark:bg-white/10">
                    {profileImagePreview ? (
                      <img src={profileImagePreview} alt="Profile preview" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-[#00564C] dark:text-emerald-300">
                        {(profile.fullName || user?.fullName || 'A')[0]}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Profile photo</p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-white/60">
                      JPG, PNG or WEBP. Keep it clean and professional.
                    </p>
                  </div>
                </div>

                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#00564C] px-4 py-3 text-sm font-medium text-white transition hover:opacity-95"
                >
                  <Camera size={16} />
                  Upload photo
                </button>

                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Full name"
                  value={profile.fullName}
                  onChange={(e) => handleProfileChange('fullName', e.target.value)}
                  placeholder="Enter your full name"
                />
                <Input label="Email address" value={profile.email} disabled placeholder="Email" />
                <Input
                  label="Phone number"
                  value={profile.phone}
                  onChange={(e) => handleProfileChange('phone', e.target.value)}
                  placeholder="+234..."
                />
                <Input
                  label="Location"
                  value={profile.location}
                  onChange={(e) => handleProfileChange('location', e.target.value)}
                  placeholder="City, Country"
                />

                {user?.role === 'freelancer' ? (
                  <Input
                    label="Professional title"
                    className="md:col-span-2"
                    value={profile.professionalTitle}
                    onChange={(e) => handleProfileChange('professionalTitle', e.target.value)}
                    placeholder="e.g. Full Stack Developer"
                  />
                ) : (
                  <>
                    <Input
                      label="Company name"
                      value={profile.companyName}
                      onChange={(e) => handleProfileChange('companyName', e.target.value)}
                      placeholder="Your company"
                    />
                    <Input
                      label="Industry"
                      value={profile.industry}
                      onChange={(e) => handleProfileChange('industry', e.target.value)}
                      placeholder="Technology, Design, Finance..."
                    />
                    <Input
                      label="Company website"
                      className="md:col-span-2"
                      value={profile.companyWebsite}
                      onChange={(e) => handleProfileChange('companyWebsite', e.target.value)}
                      placeholder="https://yourcompany.com"
                    />
                  </>
                )}

                <div className="md:col-span-2">
                  <TextArea
                    label="Bio"
                    value={profile.bio}
                    onChange={(e) => handleProfileChange('bio', e.target.value)}
                    placeholder="Tell people a bit about yourself"
                  />
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#00564C] px-5 py-3 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingProfile ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {savingProfile ? 'Saving...' : 'Save profile'}
                </button>
              </div>
            </SettingsCard>
            </div>

            <div ref={(el) => (sectionRefs.current['notifications'] = el)}>
            <SettingsCard
              icon={Bell}
              title="Notifications"
              description="Choose how Afro Task should notify you. These preferences are currently stored locally on this device."
            >
              <div className="space-y-3">
                <SettingsToggle
                  label="Direct messages"
                  description="Get alerts when someone sends you a message."
                  checked={localSettings.messageAlerts}
                  onChange={() => handleToggleSetting('messageAlerts')}
                />
                <SettingsToggle
                  label="Project updates"
                  description="Be notified about job activity, proposals, and project changes."
                  checked={localSettings.projectUpdates}
                  onChange={() => handleToggleSetting('projectUpdates')}
                />
                <SettingsToggle
                  label="Email notifications"
                  description="Receive important account updates through email."
                  checked={localSettings.emailNotifications}
                  onChange={() => handleToggleSetting('emailNotifications')}
                />
                <SettingsToggle
                  label="Weekly digest"
                  description="Get a summary of your account activity once a week."
                  checked={localSettings.weeklyDigest}
                  onChange={() => handleToggleSetting('weeklyDigest')}
                />
                <SettingsToggle
                  label="Marketing emails"
                  description="Receive product updates, announcements, and offers."
                  checked={localSettings.marketingEmails}
                  onChange={() => handleToggleSetting('marketingEmails')}
                />
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  disabled={savingPrefs}
                  className="inline-flex items-center gap-2 rounded-2xl border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 transition hover:border-[#00564C] hover:text-[#00564C] disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:text-white"
                >
                  {savingPrefs ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  {savingPrefs ? 'Saving...' : 'Save preferences'}

                </button>
              </div>
            </SettingsCard>
            </div>
          </div>

          <div className="space-y-6">
            <div ref={(el) => (sectionRefs.current['appearance'] = el)}>
            <SettingsCard
              icon={Monitor}
              title="Appearance"
              description="Switch the look and feel of the dashboard."
            >
              <div className="grid gap-3">
                <button
                  type="button"
                  onClick={!dark ? undefined : toggle}
                  className={`flex items-center justify-between rounded-2xl border p-4 text-left transition ${
                    !dark
                      ? 'border-[#00564C] bg-[#00564C]/5'
                      : 'border-gray-200 hover:border-[#00564C]/30 dark:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Sun size={18} className="text-amber-500" />
                    <div>
                      <p className="font-medium dark:text-white">Light mode</p>
                      <p className="text-sm text-gray-500 dark:text-white/60">Bright and clean workspace.</p>
                    </div>
                  </div>
                  {!dark && <Check size={18} className="text-[#00564C]" />}
                </button>

                <button
                  type="button"
                  onClick={dark ? undefined : toggle}
                  className={`flex items-center justify-between rounded-2xl border p-4 text-left transition ${
                    dark
                      ? 'border-[#00564C] bg-[#00564C]/10 dark:bg-[#00564C]/15'
                      : 'border-gray-200 hover:border-[#00564C]/30 dark:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Moon size={18} className="text-sky-400" />
                    <div>
                      <p className="font-medium dark:text-white">Dark mode</p>
                      <p className="text-sm text-gray-500 dark:text-white/60">Easier on the eyes at night.</p>
                    </div>
                  </div>
                  {dark && <Check size={18} className="text-[#00564C] dark:text-emerald-300" />}
                </button>
              </div>
            </SettingsCard>
            </div>

            <div ref={(el) => (sectionRefs.current['security'] = el)}>
            <SettingsCard
              icon={Shield}
              title="Security"
              description="Keep your account protected and your session under control."
            >
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordFields((prev) => !prev)}
                  className="flex w-full items-center justify-between rounded-2xl border border-gray-200 px-4 py-4 text-left transition hover:border-[#00564C]/30 dark:border-white/10"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-gray-100 p-2 dark:bg-white/10">
                      <Lock size={18} />
                    </div>
                    <div>
                      <p className="font-medium dark:text-white">Change password</p>
                      <p className="mt-1 text-sm text-gray-500 dark:text-white/60">
                        Update your password if you think your account needs extra protection.
                      </p>
                    </div>
                  </div>
                  {showPasswordFields ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>

                {showPasswordFields && (
                  <div className="space-y-4 rounded-2xl border border-gray-200 p-4 dark:border-white/10">
                    <Input
                      type="password"
                      label="Current password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                      placeholder="Enter current password"
                    />
                    <Input
                      type="password"
                      label="New password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Enter new password"
                    />
                    {passwordStrength && (
                      <div className="space-y-1">
                        <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-white/10">
                          <div className={`h-full rounded-full transition-all ${passwordStrength.color} ${passwordStrength.width}`} />
                        </div>
                        <p className={`text-xs font-medium ${passwordStrength.color.replace('bg-', 'text-')}`}>{passwordStrength.label}</p>
                      </div>
                    )}
                    <Input
                      type="password"
                      label="Confirm new password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={handleChangePassword}
                      disabled={savingPassword}
                      className="inline-flex items-center gap-2 rounded-2xl bg-[#00564C] px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                  {savingPassword ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                  {savingPassword ? 'Updating...' : 'Update password'}

                    </button>
                  </div>
                )}

                <div className="rounded-2xl border border-gray-200 p-4 dark:border-white/10">
                  <div className="mb-3 flex items-start gap-3">
                    <div className="rounded-xl bg-gray-100 p-2 dark:bg-white/10">
                      <Mail size={18} />
                    </div>
                    <div>
                      <p className="font-medium dark:text-white">Signed-in email</p>
                      <p className="mt-1 text-sm text-gray-500 dark:text-white/60">{user?.email || 'No email available'}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-white/60">
                    To change your email address, please contact support.
                  </p>
                </div>
              </div>
            </SettingsCard>
            </div>

            <div ref={(el) => (sectionRefs.current['session'] = el)}>
            <SettingsCard
              icon={LogOut}
              title="Session and danger zone"
              description="Actions here affect your current session and account access."
            >
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={logout}
                  className="flex w-full items-center justify-between rounded-2xl border border-gray-200 px-4 py-4 text-left transition hover:border-[#00564C]/30 dark:border-white/10"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-gray-100 p-2 dark:bg-white/10">
                      <LogOut size={18} />
                    </div>
                    <div>
                      <p className="font-medium dark:text-white">Log out</p>
                      <p className="mt-1 text-sm text-gray-500 dark:text-white/60">Sign out of your account on this device.</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-[#00564C] dark:text-emerald-300">Now</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                      toast.error('Account deletion is not available yet. Please contact support.');
                    }
                  }}
                  className="flex w-full items-center justify-between rounded-2xl border border-red-200 bg-red-50/60 px-4 py-4 text-left transition hover:bg-red-50 dark:border-red-400/20 dark:bg-red-500/10"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-white p-2 text-red-600 dark:bg-red-500/10 dark:text-red-300">
                      <Trash2 size={18} />
                    </div>
                    <div>
                      <p className="font-medium text-red-700 dark:text-red-300">Delete account</p>
                      <p className="mt-1 text-sm text-red-600/80 dark:text-red-300/70">
                        Permanently delete your account and all associated data. This cannot be undone.
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </SettingsCard>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-white/50">
          <button
            onClick={() => navigate(user?.role === 'client' ? '/client/dashboard' : '/freelancer/dashboard')}
            className="hover:text-[#00564C] dark:hover:text-emerald-300 transition"
          >
            Return to dashboard
          </button>
          <span>•</span>
          <button
            onClick={() => navigate(user?.role === 'client' ? '/client/profile' : '/freelancer/profile')}
            className="hover:text-[#00564C] dark:hover:text-emerald-300 transition"
          >
            Go to profile
          </button>
        </div>
      </div>
    </div>
  );
}
