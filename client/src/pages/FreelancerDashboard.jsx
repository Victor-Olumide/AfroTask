import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  Briefcase, DollarSign, Clock, Video, ExternalLink,
  MessageSquare, Heart, Trash2, Eye, Pencil, X
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/navbar/Navbar';
import FreelancerAnalytics from '../components/FreelancerAnalytics';
import api from '../services/api';
import toast from 'react-hot-toast';
import { db } from '../config/firebase';
import {
  collection, query, where, onSnapshot, orderBy,
  updateDoc, deleteDoc, doc
} from 'firebase/firestore';

const PROJECT_CATEGORIES = [
  'Web Development', 'Mobile Development', 'UI/UX Design', 'Graphic Design',
  'Video Editing', 'Digital Marketing', 'Writing', 'Data Science',
  'AI / Machine Learning', 'Cybersecurity', 'DevOps', 'Game Development', 'Others'
];

const emptyProjectForm = {
  title: '', description: '', category: '', customCategory: '',
  projectLink: '', technologies: '', completionDate: '', image: null
};

const FreelancerDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeProjects, setActiveProjects] = useState([]);
  const [showcaseProjects, setShowcaseProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingActiveProjects, setLoadingActiveProjects] = useState(true);
  const [loadingShowcase, setLoadingShowcase] = useState(true);

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectForm, setProjectForm] = useState(emptyProjectForm);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);

  const [showServiceModal, setShowServiceModal] = useState(false);
  const [serviceForm, setServiceForm] = useState({ title: '', description: '', price: '' });

  useEffect(() => {
    if (user?.id) {
      fetchProfileData();
      const cleanup = setupRealTimeListeners();
      return cleanup;
    }
  }, [user?.id]);

  const setupRealTimeListeners = () => {
    if (!user?.id) return;

    const postsQuery = query(
      collection(db, 'posts'),
      where('authorId', '==', user.id),
      orderBy('createdAt', 'desc')
    );
    const unsubPosts = onSnapshot(postsQuery, (snap) => {
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoadingPosts(false);
    });

    const showcaseQuery = query(
      collection(db, 'projects'),
      where('freelancerId', '==', user.id),
      orderBy('createdAt', 'desc')
    );
    const unsubShowcase = onSnapshot(showcaseQuery, (snap) => {
      setShowcaseProjects(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoadingShowcase(false);
    });

    return () => { unsubPosts(); unsubShowcase(); };
  };

  const fetchProfileData = async () => {
    try {
      const response = await api.get(`/profile/public/${user.id}`);
      if (response.data.success) setProfileData(response.data.profile);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    setLoadingActiveProjects(true);
    api.get('/projects')
      .then(res => setActiveProjects(res.data.projects || []))
      .catch(err => console.error('Failed to fetch active projects:', err))
      .finally(() => setLoadingActiveProjects(false));
  }, [user?.id]);

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await api.delete(`/posts/${postId}`);
      toast.success('Post deleted');
    } catch { toast.error('Failed to delete post'); }
  };

  const handleLikePost = async (postId) => {
    try { await api.post(`/posts/${postId}/like`); }
    catch { toast.error('Failed to like post'); }
  };

  const handleSaveService = async () => {
    if (!serviceForm.title?.trim() || !serviceForm.description?.trim()) {
      toast.error('Please fill in title and description'); return;
    }
    try {
      const updated = [...(profileData?.services || []), {
        title: serviceForm.title.trim(),
        description: serviceForm.description.trim(),
        price: serviceForm.price?.trim() || ''
      }];
      await api.put(`/profile/${user.id}`, { services: updated });
      toast.success('Service added!');
      setShowServiceModal(false);
      setServiceForm({ title: '', description: '', price: '' });
      await fetchProfileData();
    } catch { toast.error('Failed to save service'); }
  };

  const handleDeleteService = async (index) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      const services = [...(profileData?.services || [])];
      services.splice(index, 1);
      await api.put(`/profile/${user.id}`, { services });
      toast.success('Service deleted!');
      await fetchProfileData();
    } catch { toast.error('Failed to delete service'); }
  };

  const openCreateProject = () => {
    setEditingProject(null);
    setProjectForm(emptyProjectForm);
    setImagePreview(null);
    setUploadProgress(0);
    setShowProjectModal(true);
  };

  const openEditProject = (project) => {
    setEditingProject(project);
    setProjectForm({
      title: project.title || '',
      description: project.description || '',
      category: PROJECT_CATEGORIES.includes(project.category) ? project.category : 'Others',
      customCategory: PROJECT_CATEGORIES.includes(project.category) ? '' : (project.category || ''),
      projectLink: project.projectLink || '',
      technologies: Array.isArray(project.technologies) ? project.technologies.join(', ') : (project.technologies || ''),
      completionDate: project.completionDate || '',
      image: null
    });
    setImagePreview(project.projectImage || null);
    setUploadProgress(0);
    setShowProjectModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProjectForm(f => ({ ...f, image: file }));
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSaveProject = async () => {
    const { title, description, category, customCategory, projectLink, technologies, completionDate, image } = projectForm;
    if (!title.trim() || !description.trim() || !category) {
      toast.error('Title, description and category are required'); return;
    }
    const finalCategory = category === 'Others' && customCategory.trim() ? customCategory.trim() : category;

    setSaving(true);
    try {
      const data = new FormData();
      data.append('title', title.trim());
      data.append('description', description.trim());
      data.append('category', finalCategory);
      data.append('projectLink', projectLink.trim());
      data.append('technologies', technologies);
      data.append('completionDate', completionDate || '');
      data.append('freelancerName', profileData?.fullName || user.name || '');
      data.append('freelancerProfileImage', profileData?.profileImage || '');
      if (image instanceof File) data.append('image', image);

      if (editingProject) {
        await api.post(`/profile/showcase-projects?projectId=${editingProject.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (e) => {
            if (e.total) setUploadProgress(Math.round((e.loaded / e.total) * 100));
          }
        });
        toast.success('Project updated!');
      } else {
        await api.post('/profile/showcase-projects', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (e) => {
            if (e.total) setUploadProgress(Math.round((e.loaded / e.total) * 100));
          }
        });
        toast.success('Project created and published!');
      }

      setShowProjectModal(false);
      setEditingProject(null);
      setProjectForm(emptyProjectForm);
      setImagePreview(null);
      setUploadProgress(0);
    } catch (err) {
      console.error('Save project error:', err);
      toast.error('Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Delete this project? It will be removed from the Explore page too.')) return;
    try {
      await deleteDoc(doc(db, 'projects', projectId));
      toast.success('Project deleted');
    } catch { toast.error('Failed to delete project'); }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 lg:ml-64 flex items-center justify-center">
          <div className="text-[#00564C] text-lg font-medium">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dashboard-page">
      <Sidebar />

      <div className="flex-1 lg:ml-64">
        <Navbar />

        <div className="max-w-6xl mx-auto p-4 lg:p-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8 mb-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {profileData?.profileImage ? (
                <img
                  src={profileData.profileImage}
                  alt={profileData?.fullName}
                  className="w-32 h-32 rounded-full object-cover border-4 border-[#00564C]/10 shadow-sm"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData?.fullName || 'User')}&size=200&background=00564C&color=fff`;
                  }}
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-[#00564C] border-4 border-[#00564C]/10 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                  {profileData?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-gray-900 mb-1">{profileData?.fullName || 'User'}</h2>
                <p className="text-[#00564C] text-xl font-medium mb-2">{profileData?.professionalTitle || 'Freelancer'}</p>
                <p className="text-gray-500 text-sm mb-3">{profileData?.email}</p>
                <div className="flex flex-wrap gap-3 mb-4">
                  {profileData?.yearsOfExperience && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#00564C]/10 text-[#00564C] rounded-full text-sm font-medium">
                      <Briefcase className="w-4 h-4" />{profileData.yearsOfExperience} years exp
                    </span>
                  )}
                  {profileData?.availability && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#00564C]/10 text-[#00564C] rounded-full text-sm font-medium">
                      <Clock className="w-4 h-4" />{profileData.availability}
                    </span>
                  )}
                  {profileData?.hourlyRate && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#FB9E01]/10 text-[#CC8102] rounded-full text-sm font-medium">
                      <DollarSign className="w-4 h-4" />${profileData.hourlyRate}/hr
                    </span>
                  )}
                </div>
                {profileData?.bio && (
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">{profileData.bio}</p>
                )}
                {profileData?.socialLinks && (
                  <div className="flex flex-wrap gap-2">
                    {profileData.socialLinks.linkedin && (
                      <a href={profileData.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition">
                        <ExternalLink className="w-3 h-3" />LinkedIn
                      </a>
                    )}
                    {profileData.socialLinks.github && (
                      <a href={profileData.socialLinks.github} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-medium transition">
                        <ExternalLink className="w-3 h-3" />GitHub
                      </a>
                    )}
                    {profileData.socialLinks.portfolio && (
                      <a href={profileData.socialLinks.portfolio} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-sm font-medium transition">
                        <ExternalLink className="w-3 h-3" />Portfolio
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <FreelancerAnalytics userId={user?.id} />
          </div>

          {profileData?.skills?.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profileData.skills.map((skill, i) => (
                  <span key={i} className="px-4 py-2 bg-[#00564C]/10 text-[#00564C] rounded-full text-sm font-medium">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {profileData?.languages?.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Languages</h3>
              <div className="flex flex-wrap gap-2">
                {profileData.languages.map((lang, i) => (
                  <span key={i} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">{lang}</span>
                ))}
              </div>
            </div>
          )}

          {profileData?.introVideoUrl && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Video className="w-6 h-6 text-[#00564C]" />Introduction Video
              </h3>
              <video src={profileData.introVideoUrl} controls className="w-full max-h-96 rounded-xl" />
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">My Projects</h3>
              <button
                onClick={openCreateProject}
                className="px-4 py-2 bg-[#00564C] hover:bg-[#027568] text-white rounded-lg text-sm font-medium transition"
              >
                + Create Project
              </button>
            </div>

            {loadingShowcase ? (
              <p className="text-gray-400 text-center py-8">Loading projects...</p>
            ) : showcaseProjects.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No projects yet. Create your first project to showcase your work!</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {showcaseProjects.map((project) => (
                  <div key={project.id} className="bg-gray-50 border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-300">
                    {project.projectImage ? (
                      <img src={project.projectImage} alt={project.title} className="w-full h-48 object-cover" />
                    ) : (
                      <div className="w-full h-48 bg-[#00564C]/5 flex items-center justify-center">
                        <Briefcase className="w-16 h-16 text-[#00564C]/20" />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{project.title}</h4>
                        <span className="text-xs px-2 py-1 bg-[#00564C]/10 text-[#00564C] rounded-full ml-2 shrink-0 font-medium">{project.category}</span>
                      </div>
                      <p className="text-gray-500 text-sm mb-3 line-clamp-2">{project.description}</p>
                      {project.technologies?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {project.technologies.map((t, i) => (
                            <span key={i} className="text-xs px-2 py-0.5 bg-white border border-gray-200 text-gray-600 rounded">{t}</span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-gray-400 text-xs mb-3">
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{project.views || 0}</span>
                        <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{project.likes || 0}</span>
                        {project.createdAt && (
                          <span>{new Date(project.createdAt.seconds * 1000).toLocaleDateString()}</span>
                        )}
                      </div>
                      {project.projectLink && (
                        <a href={project.projectLink} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[#00564C] hover:underline text-sm mb-3 transition">
                          <ExternalLink className="w-4 h-4" />View Project
                        </a>
                      )}
                      <div className="flex gap-2">
                        <button onClick={() => openEditProject(project)}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition">
                          <Pencil className="w-4 h-4" />Edit
                        </button>
                        <button onClick={() => handleDeleteProject(project.id)}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition">
                          <Trash2 className="w-4 h-4" />Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Services</h3>
              <button onClick={() => { setServiceForm({ title: '', description: '', price: '' }); setShowServiceModal(true); }}
                className="px-4 py-2 bg-[#00564C] hover:bg-[#027568] text-white rounded-lg text-sm font-medium transition">
                + Add Service
              </button>
            </div>
            {profileData?.services?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profileData.services.map((service, i) => (
                  <div key={i} className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900">{service.title}</h4>
                      {service.price && <span className="text-[#00564C] font-semibold">{service.price}</span>}
                    </div>
                    <p className="text-gray-500 text-sm mb-3">{service.description}</p>
                    <button onClick={() => handleDeleteService(i)}
                      className="w-full px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition">
                      Delete Service
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">No services listed yet.</p>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Active Jobs</h3>
            </div>
            {loadingActiveProjects ? (
              <p className="text-gray-400 text-center py-8">Loading...</p>
            ) : activeProjects.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No active jobs yet. Start applying!</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeProjects.map((project) => (
                  <div key={project.id} className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{project.job?.title || 'Project'}</h4>
                        <p className="text-gray-500 text-sm line-clamp-2">{project.job?.description}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ml-2 ${
                        project.status === 'completed' ? 'bg-green-50 text-green-700'
                        : project.status === 'awaiting_confirmation' ? 'bg-amber-50 text-amber-700'
                        : 'bg-blue-50 text-blue-700'
                      }`}>
                        {project.status === 'awaiting_confirmation' ? 'Pending' : project.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" />{project.job?.budget || 'N/A'}</span>
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{new Date(project.startedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                      <img
                        src={project.client?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(project.client?.fullName || 'Client')}`}
                        alt={project.client?.fullName} className="w-8 h-8 rounded-full"
                      />
                      <div className="flex-1">
                        <p className="text-gray-900 text-sm font-medium">{project.client?.fullName}</p>
                        <p className="text-gray-400 text-xs">{project.client?.companyName || 'Client'}</p>
                      </div>
                      <button onClick={() => navigate(`/project/${project.id}`)}
                        className="px-3 py-1 bg-[#00564C]/10 hover:bg-[#00564C]/20 text-[#00564C] text-sm rounded-lg font-medium transition">
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Posts</h3>
            {loadingPosts ? (
              <p className="text-gray-400 text-center py-8">Loading posts...</p>
            ) : posts.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No posts yet.</p>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post.id} className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <img
                        src={post.author?.profileImage || `https://ui-avatars.com/api/?name=${post.author?.fullName}`}
                        alt={post.author?.fullName} className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1">
                        <p className="text-gray-900 font-medium">{post.author?.fullName}</p>
                        <p className="text-gray-400 text-xs">{new Date(post.createdAt).toLocaleDateString()}</p>
                      </div>
                      <button onClick={() => handleDeletePost(post.id)} className="text-red-400 hover:text-red-600 transition">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    {post.content && <p className="text-gray-800 mb-3">{post.content}</p>}
                    {post.mediaUrl && (
                      <div className="mb-3">
                        {post.type === 'video' || post.mediaType === 'video' ? (
                          <video src={post.mediaUrl} controls className="w-full rounded-lg max-h-96" />
                        ) : (
                          <img src={post.mediaUrl} alt="Post media" className="w-full rounded-lg" />
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-gray-500 text-sm">
                      <button onClick={() => handleLikePost(post.id)}
                        className={`flex items-center gap-1 hover:text-[#00564C] transition ${post.likes?.includes(user.id) ? 'text-red-500' : ''}`}>
                        <Heart className="w-5 h-5" fill={post.likes?.includes(user.id) ? 'currentColor' : 'none'} />
                        <span>{post.likes?.length || 0}</span>
                      </button>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-5 h-5" /><span>{post.commentsCount || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-5 h-5" /><span>{post.views || 0} views</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showProjectModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">
                {editingProject ? 'Edit Project' : 'Create Project'}
              </h3>
              <button onClick={() => setShowProjectModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Title *</label>
                <input type="text" value={projectForm.title}
                  onChange={e => setProjectForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., E-commerce Website" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Description *</label>
                <textarea value={projectForm.description}
                  onChange={e => setProjectForm(f => ({ ...f, description: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Describe what you built, the problem it solves, and your role..." />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select value={projectForm.category}
                  onChange={e => setProjectForm(f => ({ ...f, category: e.target.value, customCategory: '' }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                  <option value="">Select a category</option>
                  {PROJECT_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {projectForm.category === 'Others' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Custom Category *</label>
                  <input type="text" value={projectForm.customCategory}
                    onChange={e => setProjectForm(f => ({ ...f, customCategory: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Blockchain Development" />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Image *</label>
                <input type="file" accept="image/*" onChange={handleImageChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="mt-3 w-full h-48 object-cover rounded-lg" />
                )}
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Uploading... {uploadProgress}%</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Link</label>
                <input type="url" value={projectForm.projectLink}
                  onChange={e => setProjectForm(f => ({ ...f, projectLink: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="https://github.com/... or live URL" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Technologies Used</label>
                <input type="text" value={projectForm.technologies}
                  onChange={e => setProjectForm(f => ({ ...f, technologies: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="React, Node.js, MongoDB (comma separated)" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Completion Date</label>
                <input type="date" value={projectForm.completionDate}
                  onChange={e => setProjectForm(f => ({ ...f, completionDate: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button onClick={() => setShowProjectModal(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={handleSaveProject} disabled={saving}
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white rounded-lg font-medium transition">
                {saving ? 'Saving...' : editingProject ? 'Update Project' : 'Publish Project'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showServiceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-lg w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Add Service</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Title *</label>
                <input type="text" value={serviceForm.title}
                  onChange={e => setServiceForm({ ...serviceForm, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Website Development" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea value={serviceForm.description}
                  onChange={e => setServiceForm({ ...serviceForm, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Describe your service..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <input type="text" value={serviceForm.price}
                  onChange={e => setServiceForm({ ...serviceForm, price: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., $50/hour or $500 fixed" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowServiceModal(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={handleSaveService}
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition">
                Add Service
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FreelancerDashboard;