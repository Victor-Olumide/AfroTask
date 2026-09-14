import { motion } from "framer-motion";
import {
  Briefcase,
  Award,
  ExternalLink,
  MessageCircle,
  DollarSign,
  Clock,
  Mail,
  Phone,
} from "lucide-react";

const ProfileTabs = ({
  profile,
  dark,
  activeTab,
  setActiveTab,
  tabs,
  tabLabels,
  isOwnProfile,
  isFreelancer,
  isClient,
  loadingShowcase,
  showcaseProjects,
  onOpenCreateProject,
  onContactUser,
  onDeletePost,
  onOpenReviewModal,
  onOpenServiceModal,
  onOpenPortfolioModal,
  onEditProfile,
}) => {
  return (
    <div className={`${dark ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg mb-6`}>
      <div className={`border-b ${dark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="overflow-x-auto no-scrollbar pb-2">
          <div className="flex flex-nowrap gap-3 sm:gap-6 px-6 sm:px-8 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-3 sm:px-4 font-medium text-sm sm:text-base flex items-center transition whitespace-nowrap relative ${
                  activeTab === tab
                    ? isFreelancer
                      ? "text-green-600"
                      : "text-yellow-600"
                    : dark ? "text-gray-400 hover:text-gray-200" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tabLabels[tab]}
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                      isFreelancer ? "bg-green-600" : "bg-yellow-600"
                    }`}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-8">
        {activeTab === "about" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {isFreelancer && profile.introVideoUrl && (
              <div className={`${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl lg:p-6 p-3`}>
                <h3 className={`lg:text-xl text-sm font-bold mb-4 flex items-center gap-2 ${dark ? 'text-white' : 'text-gray-900'}`}>
                  <Award className="w-6 h-6 text-green-600" />
                  Introduction Video
                </h3>
                <video
                  src={profile.introVideoUrl}
                  controls
                  className="w-full max-h-96 rounded-lg"
                />
              </div>
            )}

            {isFreelancer &&
              (profile.professionalTitle ||
                profile.bio ||
                profile.yearsOfExperience) && (
                <div className={`${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl p-6`}>
                  <h3 className={`lg:text-xl text-sm font-bold mb-4 ${dark ? 'text-white' : 'text-gray-900'}`}>
                    Professional Information
                  </h3>
                  {profile.professionalTitle && (
                    <div className="mb-3">
                      <span className={`font-semibold ${dark ? 'text-gray-200' : 'text-gray-900'}`}>Title: </span>
                      <span className={dark ? 'text-gray-300' : 'text-gray-700'}>{profile.professionalTitle}</span>
                    </div>
                  )}
                  {profile.yearsOfExperience && (
                    <div className="mb-3">
                      <span className={`font-semibold ${dark ? 'text-gray-200' : 'text-gray-900'}`}>Experience: </span>
                      <span className={dark ? 'text-gray-300' : 'text-gray-700'}>{profile.yearsOfExperience} years</span>
                    </div>
                  )}
                  {profile.bio && (
                    <div className="mt-4">
                      <p className={`font-semibold mb-2 ${dark ? 'text-gray-200' : 'text-gray-900'}`}>Bio:</p>
                      <p className={`leading-relaxed ${dark ? 'text-gray-300' : 'text-gray-700'}`}>{profile.bio}</p>
                    </div>
                  )}
                  {profile.hourlyRate && (
                    <div className="mt-3">
                      <span className={`font-semibold ${dark ? 'text-gray-200' : 'text-gray-900'}`}>Hourly Rate: </span>
                      <span className="text-green-600 font-bold">${profile.hourlyRate}/hr</span>
                    </div>
                  )}
                  {profile.availability && (
                    <div className="mt-3">
                      <span className={`font-semibold ${dark ? 'text-gray-200' : 'text-gray-900'}`}>Availability: </span>
                      <span className={dark ? 'text-gray-300' : 'text-gray-700'}>{profile.availability}</span>
                    </div>
                  )}
                </div>
              )}

            {profile.about?.bio && (
              <div className={`${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl p-6`}>
                <h3 className={`text-xl font-bold mb-4 ${dark ? 'text-white' : 'text-gray-900'}`}>About</h3>
                <p className={dark ? 'text-gray-300' : 'text-gray-700'}>{profile.about.bio}</p>
                {profile.about.experience && (
                  <div className="mt-3">
                    <span className={`font-semibold ${dark ? 'text-gray-200' : 'text-gray-900'}`}>Experience: </span>
                    <span className={dark ? 'text-gray-300' : 'text-gray-700'}>{profile.about.experience}</span>
                  </div>
                )}
                {profile.about.education && (
                  <div className="mt-2">
                    <span className={`font-semibold ${dark ? 'text-gray-200' : 'text-gray-900'}`}>Education: </span>
                    <span className={dark ? 'text-gray-300' : 'text-gray-700'}>{profile.about.education}</span>
                  </div>
                )}
              </div>
            )}

            {isFreelancer && profile.skills && profile.skills.length > 0 && (
              <div>
                <h3 className={`text-xl font-bold mb-4 ${dark ? 'text-white' : 'text-gray-900'}`}>Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <span key={index} className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {isFreelancer && profile.languages && profile.languages.length > 0 && (
              <div>
                <h3 className={`text-xl font-bold mb-4 ${dark ? 'text-white' : 'text-gray-900'}`}>Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.languages.map((language, index) => (
                    <span key={index} className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {language}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {isFreelancer && profile.socialLinks && (
              <div>
                <h3 className={`text-xl font-bold mb-4 ${dark ? 'text-white' : 'text-gray-900'}`}>Social Links</h3>
                <div className="space-y-2">
                  {profile.socialLinks.linkedin && (
                    <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                      <ExternalLink className="w-4 h-4" />LinkedIn
                    </a>
                  )}
                  {profile.socialLinks.github && (
                    <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 ${dark ? 'text-gray-300 hover:text-white' : 'text-gray-800 hover:text-gray-900'}`}>
                      <ExternalLink className="w-4 h-4" />GitHub
                    </a>
                  )}
                  {profile.socialLinks.portfolio && (
                    <a href={profile.socialLinks.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-green-600 hover:text-green-700">
                      <ExternalLink className="w-4 h-4" />Portfolio
                    </a>
                  )}
                </div>
              </div>
            )}

            <div>
              <h3 className={`text-xl font-bold mb-4 ${dark ? 'text-white' : 'text-gray-900'}`}>Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`flex items-center gap-3 p-4 ${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
                  <Mail className={`w-5 h-5 ${dark ? 'text-gray-400' : 'text-gray-600'}`} />
                  <div>
                    <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Email</p>
                    <p className={`font-medium ${dark ? 'text-gray-200' : 'text-gray-900'}`}>{profile?.email}</p>
                  </div>
                </div>
                {profile?.whatsapp && (
                  <div className={`flex items-center gap-3 p-4 ${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
                    <Phone className={`w-5 h-5 ${dark ? 'text-gray-400' : 'text-gray-600'}`} />
                    <div>
                      <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-600'}`}>WhatsApp</p>
                      <p className={`font-medium ${dark ? 'text-gray-200' : 'text-gray-900'}`}>{profile.whatsapp}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {isFreelancer && profile.about?.skills && profile.about.skills.length > 0 && !profile.skills && (
              <div>
                <h3 className={`text-xl font-bold mb-4 ${dark ? 'text-white' : 'text-gray-900'}`}>Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.about.skills.map((skill, index) => (
                    <span key={index} className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">{skill}</span>
                  ))}
                </div>
              </div>
            )}

            {isFreelancer && (profile?.portfolioWebsite || profile?.linkedIn) && !profile.socialLinks && (
              <div>
                <h3 className={`text-xl font-bold mb-4 ${dark ? 'text-white' : 'text-gray-900'}`}>Links</h3>
                <div className="space-y-2">
                  {profile?.portfolioWebsite && (
                    <a href={profile.portfolioWebsite} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-green-600 hover:text-green-700">
                      <ExternalLink className="w-4 h-4" />Portfolio Website
                    </a>
                  )}
                  {profile?.linkedIn && (
                    <a href={profile.linkedIn} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-green-600 hover:text-green-700">
                      <ExternalLink className="w-4 h-4" />LinkedIn Profile
                    </a>
                  )}
                </div>
              </div>
            )}

            {isClient && profile?.companyName && (
              <div>
                <h3 className={`text-xl font-bold mb-4 ${dark ? 'text-white' : 'text-gray-900'}`}>Company Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-4 ${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
                    <p className={`text-sm mb-1 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Company Name</p>
                    <p className={`font-medium ${dark ? 'text-gray-200' : 'text-gray-900'}`}>{profile.companyName}</p>
                  </div>
                  {profile.companyWebsite && (
                    <div className={`p-4 ${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
                      <p className={`text-sm mb-1 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Website</p>
                      <a href={profile.companyWebsite} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:text-blue-700">{profile.companyWebsite}</a>
                    </div>
                  )}
                  {profile.industry && (
                    <div className={`p-4 ${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
                      <p className={`text-sm mb-1 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Industry</p>
                      <p className={`font-medium ${dark ? 'text-gray-200' : 'text-gray-900'}`}>{profile.industry}</p>
                    </div>
                  )}
                </div>
                {profile.hiringPreferences && (
                  <div className={`mt-4 p-4 ${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
                    <p className={`text-sm mb-2 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Hiring Preferences</p>
                    <div className={`space-y-1 text-sm ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {profile.hiringPreferences.lookingFor && (
                        <p><span className="font-medium">Looking for:</span> {profile.hiringPreferences.lookingFor}</p>
                      )}
                      {profile.hiringPreferences.budgetRange && (
                        <p><span className="font-medium">Budget:</span> {profile.hiringPreferences.budgetRange}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "portfolio" && isFreelancer && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {isOwnProfile && (
              <button
                onClick={onOpenCreateProject}
                className="mb-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
              >
                + Create Project
              </button>
            )}
            {loadingShowcase ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className={`${dark ? 'bg-gray-700' : 'bg-white'} rounded-xl overflow-hidden shadow-md animate-pulse`}>
                    <div className="w-full h-48 bg-gray-200" />
                    <div className="p-6 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : showcaseProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {showcaseProjects.map((item) => (
                  <div key={item.id} className={`${dark ? 'bg-gray-700' : 'bg-white'} rounded-xl overflow-hidden shadow-md hover:shadow-xl transition`}>
                    {item.projectImage ? (
                      <img src={item.projectImage} alt={item.title} className="w-full h-48 object-cover" onError={(e) => { e.target.style.display = "none"; }} />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                        <Briefcase className="w-16 h-16 text-green-600" />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className={`font-bold text-lg ${dark ? 'text-white' : 'text-gray-900'}`}>{item.title}</h4>
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full ml-2 shrink-0">{item.category}</span>
                      </div>
                      <p className={`text-sm mb-3 line-clamp-3 ${dark ? 'text-gray-300' : 'text-gray-600'}`}>{item.description}</p>
                      {item.technologies?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {item.technologies.map((t, i) => (
                            <span key={i} className={`text-xs px-2 py-0.5 rounded ${dark ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>{t}</span>
                          ))}
                        </div>
                      )}
                      {item.projectLink && (
                        <a href={item.projectLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 text-sm font-medium mb-4">
                          <ExternalLink className="w-4 h-4" />View Project
                        </a>
                      )}
                      {!isOwnProfile && (
                        <button onClick={onContactUser} className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition flex items-center justify-center gap-2">
                          <MessageCircle className="w-4 h-4" />Contact Me
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className={dark ? 'text-gray-400' : 'text-gray-600'}>No projects yet</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "services" && isFreelancer && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {isOwnProfile && (
              <button
                onClick={onOpenServiceModal}
                className="mb-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
              >
                + Add Service
              </button>
            )}
            {profile.services && profile.services.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {profile.services.map((service) => (
                  <div key={service.id} className={`${dark ? 'bg-gray-700' : 'bg-white'} rounded-xl p-6 shadow-md hover:shadow-xl transition`}>
                    <h4 className={`font-bold text-lg mb-3 ${dark ? 'text-white' : 'text-gray-900'}`}>{service.title}</h4>
                    <p className={`text-sm mb-4 line-clamp-3 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>{service.description}</p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-green-600">{service.price}</span>
                      <Briefcase className="w-6 h-6 text-green-600" />
                    </div>
                    {isOwnProfile ? (
                      <button onClick={onOpenServiceModal} className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition">
                        Delete Service
                      </button>
                    ) : (
                      <button onClick={onContactUser} className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition flex items-center justify-center gap-2">
                        <MessageCircle className="w-4 h-4" />Contact Me
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className={dark ? 'text-gray-400' : 'text-gray-600'}>No services listed yet</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "active-jobs" && isClient && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {profile.activeJobs && profile.activeJobs.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {profile.activeJobs.map((job) => (
                  <div key={job.id} className={`${dark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className={`font-bold text-lg ${dark ? 'text-white' : 'text-gray-900'}`}>{job.title}</h4>
                        <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">{job.status?.toUpperCase() || "ACTIVE"}</span>
                      </div>
                      {job.budgetRange && <p className="text-xl font-bold text-yellow-600">{job.budgetRange}</p>}
                    </div>
                    {job.description && <p className={`mb-3 line-clamp-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>{job.description}</p>}
                    {job.requiredSkills && job.requiredSkills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {job.requiredSkills.map((skill, idx) => (
                          <span key={idx} className={`px-3 py-1 rounded-full text-sm ${dark ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>{skill}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className={dark ? 'text-gray-400' : 'text-gray-600'}>No active jobs</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "completed-jobs" && isClient && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {profile.completedJobs && profile.completedJobs.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {profile.completedJobs.map((job) => (
                  <div key={job.id} className={`${dark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className={`font-bold text-lg ${dark ? 'text-white' : 'text-gray-900'}`}>{job.title}</h4>
                        <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">COMPLETED</span>
                      </div>
                      {job.budgetRange && <p className={`text-xl font-bold ${dark ? 'text-gray-300' : 'text-gray-600'}`}>{job.budgetRange}</p>}
                    </div>
                    {job.description && <p className={`mb-3 line-clamp-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>{job.description}</p>}
                    {job.completedAt && <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Completed on {new Date(job.completedAt).toLocaleDateString()}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className={dark ? 'text-gray-400' : 'text-gray-600'}>No completed jobs yet</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "projects" && isFreelancer && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {(() => {
              const activeJobs = (profile.projects || []).filter(
                (p) => p.status === "ongoing" || p.status === "awaiting_confirmation" || p.status === "active",
              );
              return activeJobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeJobs.map((project) => (
                    <div key={project.id} className={`${dark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className={`font-bold text-lg mb-1 ${dark ? 'text-white' : 'text-gray-900'}`}>{project.job?.title || "Project"}</h4>
                          <p className={`text-sm line-clamp-2 ${dark ? 'text-gray-300' : 'text-gray-600'}`}>{project.job?.description}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ml-2 ${project.status === "awaiting_confirmation" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"}`}>
                          {project.status === "awaiting_confirmation" ? "Pending" : "Ongoing"}
                        </span>
                      </div>
                      <div className={`flex items-center gap-4 text-sm mb-3 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
                        <div className="flex items-center gap-1"><DollarSign className="w-4 h-4" /><span>{project.job?.budget || project.job?.budgetRange || "N/A"}</span></div>
                        <div className="flex items-center gap-1"><Clock className="w-4 h-4" /><span>{new Date(project.startedAt).toLocaleDateString()}</span></div>
                      </div>
                      <div className={`flex items-center gap-3 pt-3 border-t ${dark ? 'border-gray-600' : 'border-gray-100'}`}>
                        <img src={project.client?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(project.client?.fullName || "Client")}`} alt={project.client?.fullName} className="w-10 h-10 rounded-full object-cover" />
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${dark ? 'text-gray-200' : 'text-gray-900'}`}>{project.client?.fullName}</p>
                          <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-600'}`}>{project.client?.companyName || "Client"}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className={dark ? 'text-gray-400' : 'text-gray-600'}>No active jobs at the moment</p>
                </div>
              );
            })()}
          </motion.div>
        )}

        {activeTab === "posts" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {profile.posts && profile.posts.length > 0 ? (
              <div className="space-y-4">
                {profile.posts.map((post) => (
                  <EnhancedPostCard
                    key={post.id}
                    post={post}
                    profile={profile}
                    isOwnProfile={isOwnProfile}
                    onDelete={(postId) => onDeletePost(postId)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className={dark ? 'text-gray-400' : 'text-gray-600'}>No posts yet</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "reviews" && isFreelancer && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {!isOwnProfile && (
              <button onClick={onOpenReviewModal} className="mb-6 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium">
                ⭐ Leave a Review
              </button>
            )}
            {profile.reviews && profile.reviews.length > 0 ? (
              <div className="space-y-4">
                {profile.reviews.map((review) => (
                  <div key={review.id} className={`${dark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
                    <div className="flex items-start gap-4">
                      <img
                        src={
                          review.reviewer?.profileImage ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(review.reviewer?.fullName || "User")}`
                        }
                        alt={review.reviewer?.fullName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h5 className={`font-semibold ${dark ? 'text-gray-200' : 'text-gray-900'}`}>
                              {review.reviewer?.fullName || "Anonymous"}
                            </h5>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <span key={i} className={i < review.rating ? "text-yellow-400" : "text-gray-300"}>⭐</span>
                              ))}
                              <span className={`text-sm ml-2 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className={dark ? 'text-gray-300' : 'text-gray-700'}>
                          {review.comment}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className={dark ? 'text-gray-400' : 'text-gray-600'}>No reviews yet</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ProfileTabs;