import { useState, useContext, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Cropper from 'react-easy-crop';
import imageCompression from 'browser-image-compression';
import { AuthContext } from "../context/AuthContext";
import { useDarkMode } from "../context/DarkModeContext";
import Navbar from "../components/navbar/Navbar";
import Sidebar from "../components/Sidebar";
import AdminSidebar from "../components/AdminSidebar";
import ReviewModal from "../components/ReviewModal";
import EnhancedPostCard from "../components/EnhancedPostCard";
import {
  MapPin,
  Briefcase,
  Award,
  ExternalLink,
  Mail,
  Phone,
  ArrowLeft,
  MessageCircle,
  X,
  DollarSign,
  Clock,
  Upload,
} from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";
import ProfileCompletionWidget from "../components/ProfileCompletionWidget";
import ProfileHeader from "../components/profile/ProfileHeader";
import ProfileTabs from "../components/profile/ProfileTabs";
import ProfileModals from "../components/profile/ProfileModals";
import ProfileSkeleton from "../components/profile/ProfileSkeleton";
import { useProfileData } from "../hooks/useProfileData";
import { useFollow } from "../hooks/useFollow";
import { useProfileProjects } from "../hooks/useProfileProjects";

const PROJECT_CATEGORIES = [
  "Web Development",
  "Mobile Development",
  "UI/UX Design",
  "Graphic Design",
  "Video Editing",
  "Digital Marketing",
  "Writing",
  "Data Science",
  "AI / Machine Learning",
  "Cybersecurity",
  "DevOps",
  "Game Development",
  "Others",
];

const emptyProjectForm = {
  title: "",
  description: "",
  category: "",
  customCategory: "",
  projectLink: "",
  technologies: "",
  completionDate: "",
  image: null,
};

const PublicProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const adminStored = (() => { try { return JSON.parse(localStorage.getItem('adminUser')); } catch { return null; } })();
  const { dark } = useDarkMode();

  const {
    profile,
    loading,
    fetchProfile,
    setProfile,
    isOwnProfile,
    isFreelancer,
    isClient,
    tabs,
    tabLabels,
    handleSaveProfile,
    handleDeletePost,
    editForm,
    setEditForm,
    savingProfile,
    setSavingProfile,
  } = useProfileData(userId, user);

  const { following, loadingFollow, handleFollow } = useFollow(userId, isOwnProfile);

  const [activeTab, setActiveTab] = useState("about");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [portfolioForm, setPortfolioForm] = useState({
    title: "",
    description: "",
    link: "",
    image: "",
  });
  const [serviceForm, setServiceForm] = useState({
    title: "",
    description: "",
    price: "",
  });
  const [showDeletePortfolioModal, setShowDeletePortfolioModal] = useState(false);
  const [showDeleteServiceModal, setShowDeleteServiceModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showcaseProjects, setShowcaseProjects] = useState([]);
  const [loadingShowcase, setLoadingShowcase] = useState(false);

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectForm, setProjectForm] = useState(emptyProjectForm);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);

  const [showImageModal, setShowImageModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [showProfileImageUpload, setShowProfileImageUpload] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const inputRef = useRef(null);

  const [showCoverPhotoUpload, setShowCoverPhotoUpload] = useState(false);
  const [coverPhotoFile, setCoverPhotoFile] = useState(null);
  const [coverPhotoPreview, setCoverPhotoPreview] = useState(null);

  useEffect(() => {
    fetchProfile();
    if (!isOwnProfile) {
      checkFollowStatus();
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchShowcaseProjects(userId);
    }
  }, [userId]);

  const fetchShowcaseProjects = async (uid) => {
    setLoadingShowcase(true);
    try {
      const res = await api.get(`/profile/showcase-projects?freelancerId=${uid}&limit=50`);
      setShowcaseProjects(res.data.projects || []);
    } catch (err) {
      console.error("Failed to fetch showcase projects:", err);
      setShowcaseProjects([]);
    } finally {
      setLoadingShowcase(false);
    }
  };

  const checkFollowStatus = async () => {
    try {
      const response = await api.get(`/follows/${userId}/status`);
      setFollowing(response.data.following);
    } catch (error) {
      console.error("Failed to check follow status");
    }
  };

  const openEditProfile = () => {
    setEditForm({
      fullName: profile?.fullName || '',
      country: profile?.country || '',
      professionalTitle: profile?.professionalTitle || '',
      yearsOfExperience: profile?.yearsOfExperience || '',
      hourlyRate: profile?.hourlyRate || '',
      availability: profile?.availability || '',
      bio: profile?.bio || profile?.about?.bio || '',
      skills: profile?.skills?.join(', ') || profile?.about?.skills?.join(', ') || '',
      languages: profile?.languages?.join(', ') || '',
      whatsapp: profile?.whatsapp || '',
      companyName: profile?.companyName || '',
      industry: profile?.industry || '',
      hiringLookingFor: profile?.hiringPreferences?.lookingFor || '',
      hiringBudgetRange: profile?.hiringPreferences?.budgetRange || '',
      socialLinkedin: profile?.socialLinks?.linkedin || profile?.linkedIn || '',
      socialGithub: profile?.socialLinks?.github || '',
      socialPortfolio: profile?.socialLinks?.portfolio || profile?.portfolioWebsite || '',
    });
    setShowEditModal(true);
  };

  const openProfileImageUpload = () => {
    setShowProfileImageUpload(true);
    setShowImageModal(false);
  };

  const openCoverPhotoUpload = () => {
    setShowCoverPhotoUpload(true);
    setShowImageModal(false);
  };

  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => setSelectedImage(reader.result));
      reader.readAsDataURL(file);
      setProfileImageFile(file);
    }
  };

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.addEventListener('load', () => resolve(img));
      img.addEventListener('error', (error) => reject(error));
      img.src = url;
    });

  const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = 256;
    canvas.height = 256;

    const safeArea = Math.floor(256 * 4 / 3);
    const safeAreaMargin = Math.floor(safeArea / 2);
    const safeAreaSize = Math.floor(safeArea - safeAreaMargin * 2);

    const cropX = -pixelCrop.x + pixelCrop.width / 2 - safeAreaSize / 2;
    const cropY = -pixelCrop.y + pixelCrop.height / 2 - safeAreaSize / 2;

    ctx.drawImage(
      image,
      cropX,
      cropY,
      safeAreaSize,
      safeAreaSize,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const compressedFile = await imageCompression(blob, {
          maxSizeMB: 1,
          maxWidthOrHeight: 512,
          useWebWorker: true,
          fileType: 'image/webp',
        });
        resolve(compressedFile);
      }, 'image/webp');
    });
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleProfileImageUpload = async () => {
    if (!profileImageFile || !croppedAreaPixels) {
      toast.error("Please crop and select an image");
      return;
    }

    try {
      const croppedImageFile = await getCroppedImg(selectedImage, croppedAreaPixels);
      const formData = new FormData();
      formData.append('profileImage', croppedImageFile);

      await api.put(`/profile/${userId}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success("Profile picture updated successfully!");
      setShowProfileImageUpload(false);
      setSelectedImage(null);
      setProfileImageFile(null);
      setProfileImagePreview(null);
      fetchProfile();
    } catch (error) {
      toast.error("Failed to upload profile picture");
    }
  };

  const handleCoverPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverPhotoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setCoverPhotoPreview(previewUrl);
    }
  };

  const handleCoverPhotoUpload = async () => {
    if (!coverPhotoFile) {
      toast.error("Please select an image");
      return;
    }

    const formData = new FormData();
    formData.append('coverPhoto', coverPhotoFile);

    try {
      await api.put(`/profile/${userId}/cover`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success("Cover photo updated successfully!");
      setShowCoverPhotoUpload(false);
      setCoverPhotoFile(null);
      setCoverPhotoPreview(null);
      fetchProfile();
    } catch (error) {
      toast.error("Failed to upload cover photo");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProjectForm((f) => ({ ...f, image: file }));
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSaveProject = async () => {
    const {
      title,
      description,
      category,
      customCategory,
      projectLink,
      technologies,
      completionDate,
      image,
    } = projectForm;
    if (!title.trim() || !description.trim() || !category) {
      toast.error("Title, description and category are required");
      return;
    }
    const finalCategory =
      category === "Others" && customCategory.trim()
        ? customCategory.trim()
        : category;
    setSaving(true);
    try {
      const data = new FormData();
      data.append("title", title.trim());
      data.append("description", description.trim());
      data.append("category", finalCategory);
      data.append("projectLink", projectLink.trim());
      data.append("technologies", technologies);
      data.append("completionDate", completionDate || "");
      data.append("freelancerName", profile?.fullName || user.name || "");
      data.append("freelancerProfileImage", profile?.profileImage || "");
      if (image instanceof File) data.append("image", image);

      await api.post("/profile/showcase-projects", data, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (e.total)
            setUploadProgress(Math.round((e.loaded / e.total) * 100));
        },
      });

      toast.success("Project created and published!");
      setShowProjectModal(false);
      setProjectForm(emptyProjectForm);
      setImagePreview(null);
      setUploadProgress(0);
      fetchShowcaseProjects(userId);
    } catch (err) {
      console.error("Save project error:", err);
      toast.error("Failed to save project");
    } finally {
      setSaving(false);
    }
  };

  const handleAddPortfolio = async () => {
    if (!portfolioForm.title || !portfolioForm.description) {
      toast.error("Please fill in title and description");
      return;
    }
    try {
      await api.post("/profile/portfolio", portfolioForm);
      toast.success("Portfolio item added!");
      setShowPortfolioModal(false);
      setPortfolioForm({ title: "", description: "", link: "", image: "" });
      fetchProfile();
    } catch (error) {
      toast.error("Failed to add portfolio item");
    }
  };

  const handleAddService = async () => {
    if (!serviceForm.title || !serviceForm.description || !serviceForm.price) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      await api.post("/profile/services", serviceForm);
      toast.success("Service added!");
      setShowServiceModal(false);
      setServiceForm({ title: "", description: "", price: "" });
      fetchProfile();
    } catch (error) {
      toast.error("Failed to add service");
    }
  };

  const handleContactUser = async () => {
    try {
      const response = await api.post("/pre-project-chats/create-direct", {
        otherUserId: userId,
      });

      if (response.data.success) {
        const role = adminStored ? 'admin' : user?.role;
        const messagesPath = `/${role}/messages?chatId=${response.data.chatId}`;
        navigate(messagesPath);
        toast.success(`Opening chat with ${profile?.fullName}`);
      }
    } catch (error) {
      console.error("Error creating chat:", error);
      toast.error("Failed to open chat");
    }
  };

  const openCreateProject = () => {
    setEditingProject(null);
    setProjectForm(emptyProjectForm);
    setImagePreview(null);
    setUploadProgress(0);
    setShowProjectModal(true);
  };

  if (loading) {
    return (
      <ProfileSkeleton 
        dark={dark} 
        currentUser={user} 
        adminStored={adminStored} 
        navigate={navigate} 
      />
    );
  }

  if (!profile) {
    return (
      <div className={`flex min-h-screen ${dark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {(user?.role === 'client' || user?.role === 'freelancer')
          ? <Sidebar />
          : <AdminSidebar
              user={adminStored}
              tab="profile"
              setTab={(id) => navigate(`/admin/dashboard?tab=${id}`)}
              setSearch={() => {}}
              logout={() => { localStorage.removeItem('token'); localStorage.removeItem('adminUser'); navigate('/admin/login'); }}
              onBroadcast={() => {}}
            />
        }
        <div className="flex-1 lg:ml-64">
          {(user?.role === 'client' || user?.role === 'freelancer') && <Navbar />}
          <div className="p-4 md:p-8">
            <div className="max-w-6xl mx-auto text-center py-12">
              <p className={`text-lg ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Profile not found</p>
              <button
                onClick={() => navigate(-1)}
                className="mt-4 px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen ${dark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {(user?.role === 'client' || user?.role === 'freelancer')
        ? <Sidebar />
        : <AdminSidebar
            user={adminStored}
            tab="profile"
            setTab={(id) => navigate(`/admin/dashboard?tab=${id}`)}
            setSearch={() => {}}
            logout={() => { localStorage.removeItem('token'); localStorage.removeItem('adminUser'); navigate('/admin/login'); }}
            onBroadcast={() => {}}
          />
      }

      <div className="w-screen lg:flex-1 lg:ml-64">
        {(user?.role === 'client' || user?.role === 'freelancer') && <Navbar />}
        <div className="py-2 md:p-8">
          <div className="mx-auto">
            <button
              onClick={() => navigate(-1)}
              className={`mb-4 flex items-center gap-2 transition ${dark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>

            <ProfileHeader
              profile={profile}
              dark={dark}
              isOwnProfile={isOwnProfile}
              isFreelancer={isFreelancer}
              following={following}
              loadingFollow={loadingFollow}
              onFollow={handleFollow}
              onContact={handleContactUser}
              onEditProfile={openEditProfile}
              onImageClick={() => setShowImageModal(true)}
              onCoverClick={() => setShowCoverPhotoUpload(true)}
            />

            {isOwnProfile && (
              <ProfileCompletionWidget userRole={profile.role} />
            )}

            <ProfileTabs
              profile={profile}
              dark={dark}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              tabs={tabs}
              tabLabels={tabLabels}
              isOwnProfile={isOwnProfile}
              isFreelancer={isFreelancer}
              isClient={isClient}
              loadingShowcase={loadingShowcase}
              showcaseProjects={showcaseProjects}
              onOpenCreateProject={openCreateProject}
              onContactUser={handleContactUser}
              onDeletePost={(postId) => {
                setPostToDelete(postId);
                setShowDeleteModal(true);
              }}
              onOpenReviewModal={() => setShowReviewModal(true)}
              onOpenServiceModal={() => setShowServiceModal(true)}
              onOpenPortfolioModal={() => setShowPortfolioModal(true)}
              onEditProfile={openEditProfile}
            />
          </div>
        </div>
      </div>

      <ProfileModals
        showReviewModal={showReviewModal}
        setShowReviewModal={setShowReviewModal}
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        showPortfolioModal={showPortfolioModal}
        setShowPortfolioModal={setShowPortfolioModal}
        showServiceModal={showServiceModal}
        setShowServiceModal={setShowServiceModal}
        showDeletePortfolioModal={showDeletePortfolioModal}
        setShowDeletePortfolioModal={setShowDeletePortfolioModal}
        showDeleteServiceModal={showDeleteServiceModal}
        setShowDeleteServiceModal={setShowDeleteServiceModal}
        showEditModal={showEditModal}
        setShowEditModal={setShowEditModal}
        showImageModal={showImageModal}
        setShowImageModal={setShowImageModal}
        showProfileImageUpload={showProfileImageUpload}
        setShowProfileImageUpload={setShowProfileImageUpload}
        showCoverPhotoUpload={showCoverPhotoUpload}
        setShowCoverPhotoUpload={setShowCoverPhotoUpload}
        showProjectModal={showProjectModal}
        setShowProjectModal={setShowProjectModal}
        profile={profile}
        userId={userId}
        isOwnProfile={isOwnProfile}
        isFreelancer={isFreelancer}
        dark={dark}
        editForm={editForm}
        setEditForm={setEditForm}
        savingProfile={savingProfile}
        handleSaveProfile={handleSaveProfile}
        selectedImage={selectedImage}
        crop={crop}
        setCrop={setCrop}
        zoom={zoom}
        setZoom={setZoom}
        croppedAreaPixels={croppedAreaPixels}
        onCropComplete={onCropComplete}
        inputRef={inputRef}
        onSelectFile={onSelectFile}
        handleProfileImageUpload={handleProfileImageUpload}
        profileImageFile={profileImageFile}
        coverPhotoFile={coverPhotoFile}
        coverPhotoPreview={coverPhotoPreview}
        handleCoverPhotoChange={handleCoverPhotoChange}
        handleCoverPhotoUpload={handleCoverPhotoUpload}
        portfolioForm={portfolioForm}
        setPortfolioForm={setPortfolioForm}
        handleAddPortfolio={handleAddPortfolio}
        serviceForm={serviceForm}
        setServiceForm={setServiceForm}
        handleAddService={handleAddService}
        itemToDelete={itemToDelete}
        setItemToDelete={setItemToDelete}
        fetchProfile={fetchProfile}
        projectForm={projectForm}
        setProjectForm={setProjectForm}
        imagePreview={imagePreview}
        uploadProgress={uploadProgress}
        saving={saving}
        handleImageChange={handleImageChange}
        handleSaveProject={handleSaveProject}
        postToDelete={postToDelete}
        handleDeletePost={handleDeletePost}
        PROJECT_CATEGORIES={PROJECT_CATEGORIES}
      />
    </div>
  );
};

export default PublicProfilePage;