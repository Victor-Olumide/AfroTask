import { motion } from "framer-motion";
import { MapPin, Briefcase, MessageCircle } from "lucide-react";

const ProfileHeader = ({
  profile,
  dark,
  isOwnProfile,
  isFreelancer,
  following,
  loadingFollow,
  onFollow,
  onContact,
  onEditProfile,
  onImageClick,
  onCoverClick,
}) => {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={onCoverClick}
        className={`lg:h-64 md:h-32 h-24 lg:rounded-t-3xl cursor-pointer relative ${
          profile?.coverPhoto
            ? "bg-cover bg-center bg-no-repeat"
            : isFreelancer
              ? "bg-gradient-to-r from-green-500 to-emerald-600"
              : "bg-gradient-to-r from-yellow-500 to-orange-500"
        }`}
        style={profile?.coverPhoto ? { backgroundImage: `url(${profile.coverPhoto})` } : {}}
      >
        <div className="absolute lg:-bottom-16 -bottom-12 lg:left-8 left-4">
          {profile?.profileImage ? (
            <img
              src={profile.profileImage}
              alt={profile?.fullName}
              className="lg:w-32 lg:h-32 w-24 h-24 rounded-full object-cover lg:border-8 border-4 border-white shadow-xl cursor-pointer hover:shadow-2xl transition-shadow"
              onClick={(e) => {
                e.stopPropagation();
                onImageClick();
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.fullName || "User")}&size=200&background=${isFreelancer ? "10b981" : "eab308"}&color=fff`;
              }}
            />
          ) : (
            <div
              className={`w-32 h-32 rounded-full cursor-pointer hover:shadow-2xl transition-shadow ${
                isFreelancer ? "bg-green-500" : "bg-yellow-500"
              } border-8 border-white flex items-center justify-center text-white text-5xl font-bold shadow-xl`}
              onClick={(e) => {
                e.stopPropagation();
                onImageClick();
              }}
            >
              {profile?.fullName?.charAt(0)?.toUpperCase() || "U"}
            </div>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className={`${dark ? 'bg-gray-800' : 'bg-white'} lg:rounded-b-3xl lg:shadow-lg lg:pt-20 pt-12 px-4 lg:px-6 pb-6 mb-6`}
      >
        <div className="grid grid-rows-1 md:grid-cols-1 justify-between items-end">
          <div>
            <h1 className={`lg:text-3xl text-xl font-bold mb-2 ${dark ? 'text-white' : 'text-gray-900'}`}>
              {profile?.fullName}
            </h1>
            <div className={`flex items-center gap-4 lg:text-base text-sm mb-4 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
              {profile?.country && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{profile.country}</span>
                </div>
              )}
              {isFreelancer && profile?.skillCategory && (
                <div className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  <span>{profile.skillCategory}</span>
                </div>
              )}
            </div>

            <div className="flex flex-row justify-between items-center w-full">
              <div className="flex items-center justify-start gap-4">
                <div className="text-center">
                  <p className={`lg:text-2xl text-xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>
                    {profile.followersCount || 0}
                  </p>
                  <p className={`lg:text-sm text-xs ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Followers
                  </p>
                </div>
                <div className="text-center">
                  <p className={`lg:text-2xl text-xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>
                    {profile.followingCount || 0}
                  </p>
                  <p className={`lg:text-sm text-xs ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Following
                  </p>
                </div>
                {isFreelancer && (
                  <div className="text-center">
                    <p className={`lg:text-2xl text-xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>
                      {profile.projects?.length || 0}
                    </p>
                    <p className={`lg:text-sm text-xs ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Projects
                    </p>
                  </div>
                )}
              </div>

              {isOwnProfile && (
                <div className="flex items-center justify-end">
                  <button
                    onClick={onEditProfile}
                    className={`px-6 py-3 font-medium transition flex items-end justify-end gap-2 mx-auto ${dark ? 'text-gray-300' : 'text-gray-600'}`}
                  >
                    <svg className="md:w-8 md:h-8 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          {!isOwnProfile && (
            <div className="flex justify-end mt-4 gap-3">
              <button
                onClick={onFollow}
                disabled={loadingFollow}
                className={`px-6 py-2 rounded-lg font-medium transition ${
                  following
                    ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    : isFreelancer
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-yellow-600 hover:bg-yellow-700 text-white"
                }`}
              >
                {loadingFollow
                  ? "..."
                  : following
                    ? "Following"
                    : "Follow"}
              </button>
              <button
                onClick={onContact}
                className={`px-6 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                  isFreelancer
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                Contact Me
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default ProfileHeader;