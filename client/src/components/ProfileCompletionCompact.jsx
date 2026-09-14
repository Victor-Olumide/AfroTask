import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import api from '../services/api';

/**
 * Compact horizontal profile-completion banner with a progress ring.
 * Fetches real completion data from /onboarding/status, same source
 * as the original ProfileCompletionWidget.
 * Props:
 *  - userRole (e.g. 'freelancer') — used to build the onboarding route
 */
const ProfileCompletionCompact = ({ userRole }) => {
  const navigate = useNavigate();
  const [profileStatus, setProfileStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetchProfileStatus();
  }, []);

  const fetchProfileStatus = async () => {
    try {
      const response = await api.get('/onboarding/status');
      setProfileStatus(response.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  if (loading || dismissed || !profileStatus) return null;
  if (profileStatus.profileCompleted) return null;

  const pct = profileStatus.profileCompletionPercentage || 0;
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 bg-white border border-gray-100 rounded-xl mb-6">
      <div className="flex items-center gap-3 min-w-0">
        <svg width="40" height="40" viewBox="0 0 40 40" className="shrink-0 -rotate-90">
          <circle cx="20" cy="20" r={radius} fill="none" stroke="#F1EFE8" strokeWidth="4" />
          <circle
            cx="20"
            cy="20"
            r={radius}
            fill="none"
            stroke="#0F6E56"
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            Your profile is {pct}% complete
          </p>
          {profileStatus.missingFields?.length > 0 ? (
            <p className="text-xs text-gray-500 truncate">
              Missing: {profileStatus.missingFields.slice(0, 3).join(', ')}
              {profileStatus.missingFields.length > 3 && ` +${profileStatus.missingFields.length - 3} more`}
            </p>
          ) : (
            <p className="text-xs text-gray-500 truncate">
              Complete your profile to get more job matches
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => navigate(`/${userRole}/onboarding`)}
          className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition"
        >
          Complete
        </button>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="p-1 text-gray-400 hover:text-gray-600 rounded transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ProfileCompletionCompact;