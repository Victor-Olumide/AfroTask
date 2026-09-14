import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Building, ExternalLink, MessageSquare, Heart, Trash2, Eye, CheckCircle, Target } from 'lucide-react';
import Button from '../components/Button';
import ClientAnalytics from '../components/ClientAnalytics';
import api from '../services/api';
import toast from 'react-hot-toast';
import { db } from '../config/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

const ClientDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [activeJobs, setActiveJobs] = useState([]);
  const [completedJobs, setCompletedJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchProfileData();
      fetchNotifications();
      fetchJobs();
      setupRealTimeListeners();
    }
  }, [user?.id]);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs/my-jobs');
      if (response.data.success) {
        const jobs = response.data.jobs;
        setActiveJobs(jobs.filter(j => j.status === 'open'));
        setCompletedJobs(jobs.filter(j => j.status === 'closed'));
      }
    } catch (error) {
      console.error('Failed to fetch jobs');
    } finally {
      setLoadingJobs(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications?limit=5');
      if (response.data.success) {
        const projectNotifs = response.data.notifications.filter(n => n.type === 'project_finished' && !n.read);
        setNotifications(projectNotifs);
      }
    } catch (error) {
      console.error('Failed to fetch notifications');
    }
  };

  const setupRealTimeListeners = () => {
    if (!user?.id) return;

    const postsQuery = query(
      collection(db, 'posts'),
      where('authorId', '==', user.id),
      orderBy('createdAt', 'desc')
    );

    const unsubscribePosts = onSnapshot(postsQuery, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(postsData);
      setLoadingPosts(false);
    });

    return () => {
      unsubscribePosts();
    };
  };

  const fetchProfileData = async () => {
    try {
      const response = await api.get(`/profile/public/${user.id}`);
      if (response.data.success) {
        setProfileData(response.data.profile);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await api.delete(`/posts/${postId}`);
      toast.success('Post deleted');
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  const handleLikePost = async (postId) => {
    try {
      await api.post(`/posts/${postId}/like`);
    } catch (error) {
      toast.error('Failed to like post');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-[#00564C] p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">Afro Task</h1>
          <Button onClick={logout} variant="outline">Logout</Button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {notifications.length > 0 && (
          <div className="mb-6 space-y-3">
            {notifications.map((notif) => (
              <div key={notif.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-[#E6F0EF] rounded-full flex items-center justify-center shrink-0">
                  <CheckCircle className="w-5 h-5 text-[#00564C]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{notif.data?.jobTitle} — Project Finished!</p>
                  <p className="text-sm text-gray-500 truncate">{notif.data?.message}</p>
                </div>
                <Button
                  onClick={() => navigate(`/client/project/${notif.data?.projectId}`)}
                  className="bg-[#00564C] hover:bg-[#003F38]"
                >
                  Review Now
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {profileData?.profileImage ? (
              <img
                src={profileData.profileImage}
                alt={profileData?.fullName}
                className="w-28 h-28 rounded-full object-cover border-4 border-[#E6F0EF]"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData?.fullName || 'User')}&size=200&background=00564C&color=fff`;
                }}
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-[#00564C] flex items-center justify-center text-white text-3xl font-bold shrink-0">
                {profileData?.fullName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{profileData?.fullName || 'User'}</h2>
              {profileData?.companyName && (
                <p className="text-gray-600 text-base mb-2 flex items-center gap-2">
                  <Building className="w-4 h-4 text-gray-400" />
                  {profileData.companyName}
                </p>
              )}
              <p className="text-gray-400 text-sm mb-3">{profileData?.email}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#E6F0EF] text-[#00564C] rounded-full text-xs font-medium">
                  Client
                </span>
                {profileData?.industry && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                    {profileData.industry}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {profileData?.companyWebsite && (
                  <a
                    href={profileData.companyWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-medium transition"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Website
                  </a>
                )}
                {profileData?.socialLinks?.linkedin && (
                  <a
                    href={profileData.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-medium transition"
                  >
                    <ExternalLink className="w-3 h-3" />
                    LinkedIn
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <ClientAnalytics userId={user?.id} />
        </div>

        {profileData?.hiringPreferences && (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-[#00564C]" />
              Hiring Preferences
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profileData.hiringPreferences.lookingFor && (
                <div>
                  <p className="text-gray-400 text-xs mb-1">Looking For</p>
                  <p className="text-gray-900 text-sm font-medium">{profileData.hiringPreferences.lookingFor}</p>
                </div>
              )}
              {profileData.hiringPreferences.budgetRange && (
                <div>
                  <p className="text-gray-400 text-xs mb-1">Budget Range</p>
                  <p className="text-gray-900 text-sm font-medium">{profileData.hiringPreferences.budgetRange}</p>
                </div>
              )}
              {profileData.hiringPreferences.experienceLevel && (
                <div>
                  <p className="text-gray-400 text-xs mb-1">Experience Level</p>
                  <p className="text-gray-900 text-sm font-medium">{profileData.hiringPreferences.experienceLevel}</p>
                </div>
              )}
              {profileData.hiringPreferences.projectDuration && (
                <div>
                  <p className="text-gray-400 text-xs mb-1">Project Duration</p>
                  <p className="text-gray-900 text-sm font-medium">{profileData.hiringPreferences.projectDuration}</p>
                </div>
              )}
              {profileData.hiringPreferences.location && (
                <div>
                  <p className="text-gray-400 text-xs mb-1">Location Preference</p>
                  <p className="text-gray-900 text-sm font-medium">{profileData.hiringPreferences.location}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
          <h3 className="text-base font-bold text-gray-900 mb-4">Active Jobs</h3>
          {loadingJobs ? (
            <p className="text-gray-400 text-sm text-center py-8">Loading jobs...</p>
          ) : activeJobs.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No active jobs</p>
          ) : (
            <div className="space-y-3">
              {activeJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-gray-50 hover:bg-gray-100 rounded-xl p-4 transition cursor-pointer"
                  onClick={() => navigate(`/client/jobs/${job.id}`)}
                >
                  <div className="flex justify-between items-start mb-2 gap-3">
                    <h4 className="font-semibold text-gray-900 text-sm">{job.title}</h4>
                    <span className="px-2.5 py-1 bg-[#E6F0EF] text-[#00564C] text-xs font-medium rounded-full shrink-0">Open</span>
                  </div>
                  <p className="text-gray-500 text-sm mb-3 line-clamp-2">{job.description}</p>
                  <div className="flex items-center gap-3 text-gray-400 text-xs">
                    <span>${job.budget}</span>
                    <span>•</span>
                    <span>{job.applicationsCount || 0} applications</span>
                    <span>•</span>
                    <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
          <h3 className="text-base font-bold text-gray-900 mb-4">Completed Jobs</h3>
          {loadingJobs ? (
            <p className="text-gray-400 text-sm text-center py-8">Loading jobs...</p>
          ) : completedJobs.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No completed jobs</p>
          ) : (
            <div className="space-y-3">
              {completedJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-gray-50 hover:bg-gray-100 rounded-xl p-4 transition cursor-pointer"
                  onClick={() => navigate(`/client/jobs/${job.id}`)}
                >
                  <div className="flex justify-between items-start mb-2 gap-3">
                    <h4 className="font-semibold text-gray-900 text-sm">{job.title}</h4>
                    <span className="px-2.5 py-1 bg-gray-200 text-gray-600 text-xs font-medium rounded-full shrink-0">Closed</span>
                  </div>
                  <p className="text-gray-500 text-sm mb-3 line-clamp-2">{job.description}</p>
                  <div className="flex items-center gap-3 text-gray-400 text-xs">
                    <span>${job.budget}</span>
                    <span>•</span>
                    <span>{job.applicationsCount || 0} applications</span>
                    <span>•</span>
                    <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-gray-900">Posts</h3>
          </div>
          {loadingPosts ? (
            <p className="text-gray-400 text-sm text-center py-8">Loading posts...</p>
          ) : posts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">No posts yet. Share your thoughts!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <img
                      src={post.author?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.fullName || 'User')}`}
                      alt={post.author?.fullName}
                      className="w-9 h-9 rounded-full object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 text-sm font-medium truncate">{post.author?.fullName}</p>
                      <p className="text-gray-400 text-xs">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="text-gray-400 hover:text-red-500 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {post.content && (
                    <p className="text-gray-800 text-sm mb-3">{post.content}</p>
                  )}

                  {post.mediaUrl && (
                    <div className="mb-3">
                      {post.type === 'video' || post.mediaType === 'video' ? (
                        <video
                          src={post.mediaUrl}
                          controls
                          className="w-full rounded-lg max-h-96"
                        />
                      ) : (
                        <img
                          src={post.mediaUrl}
                          alt="Post media"
                          className="w-full rounded-lg"
                        />
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-gray-400 text-xs">
                    <button
                      onClick={() => handleLikePost(post.id)}
                      className={`flex items-center gap-1.5 hover:text-gray-700 transition ${
                        post.likes?.includes(user.id) ? 'text-red-500' : ''
                      }`}
                    >
                      <Heart className="w-4 h-4" fill={post.likes?.includes(user.id) ? 'currentColor' : 'none'} />
                      <span>{post.likes?.length || 0}</span>
                    </button>
                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4" />
                      <span>{post.commentsCount || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Eye className="w-4 h-4" />
                      <span>{post.views || 0} views</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;