import { motion, AnimatePresence } from "framer-motion";
import Cropper from 'react-easy-crop';
import { X, Upload } from "lucide-react";
import ReviewModal from "../ReviewModal";
import api from "../../services/api";
import toast from "react-hot-toast";

const ProfileModals = ({
  showReviewModal,
  setShowReviewModal,
  showDeleteModal,
  setShowDeleteModal,
  showPortfolioModal,
  setShowPortfolioModal,
  showServiceModal,
  setShowServiceModal,
  showDeletePortfolioModal,
  setShowDeletePortfolioModal,
  showDeleteServiceModal,
  setShowDeleteServiceModal,
  showEditModal,
  setShowEditModal,
  showImageModal,
  setShowImageModal,
  showProfileImageUpload,
  setShowProfileImageUpload,
  showCoverPhotoUpload,
  setShowCoverPhotoUpload,
  showProjectModal,
  setShowProjectModal,
  profile,
  userId,
  isOwnProfile,
  isFreelancer,
  dark,
  editForm,
  setEditForm,
  savingProfile,
  handleSaveProfile,
  selectedImage,
  crop,
  setCrop,
  zoom,
  setZoom,
  croppedAreaPixels,
  onCropComplete,
  inputRef,
  onSelectFile,
  handleProfileImageUpload,
  profileImageFile,
  coverPhotoFile,
  coverPhotoPreview,
  handleCoverPhotoChange,
  handleCoverPhotoUpload,
  portfolioForm,
  setPortfolioForm,
  handleAddPortfolio,
  serviceForm,
  setServiceForm,
  handleAddService,
  itemToDelete,
  setItemToDelete,
  fetchProfile,
  projectForm,
  setProjectForm,
  imagePreview,
  uploadProgress,
  saving,
  handleImageChange,
  handleSaveProject,
  postToDelete,
  handleDeletePost,
  PROJECT_CATEGORIES,
}) => {
  return (
    <>
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        freelancerName={profile?.fullName}
        onSubmit={async (reviewData) => {
          try {
            await api.post(`/reviews/${userId}`, reviewData);
            toast.success("Review added!");
            fetchProfile();
          } catch (error) {
            toast.error(
              error.response?.data?.message || "Failed to add review",
            );
            throw error;
          }
        }}
      />

      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Delete Post
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this post? This action cannot be
                undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setPostToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleDeletePost(postToDelete);
                    setShowDeleteModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPortfolioModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Add Portfolio Item
                </h3>
                <button
                  onClick={() => {
                    setShowPortfolioModal(false);
                    setPortfolioForm({
                      title: "",
                      description: "",
                      link: "",
                      image: "",
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    value={portfolioForm.title}
                    onChange={(e) =>
                      setPortfolioForm({
                        ...portfolioForm,
                        title: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., E-commerce Website"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={portfolioForm.description}
                    onChange={(e) =>
                      setPortfolioForm({
                        ...portfolioForm,
                        description: e.target.value,
                      })
                    }
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Describe your project..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Link (optional)
                  </label>
                  <input
                    type="url"
                    value={portfolioForm.link}
                    onChange={(e) =>
                      setPortfolioForm({
                        ...portfolioForm,
                        link: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL (optional)
                  </label>
                  <input
                    type="url"
                    value={portfolioForm.image}
                    onChange={(e) =>
                      setPortfolioForm({
                        ...portfolioForm,
                        image: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent mb-2"
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="text-xs text-gray-500">Or upload an image:</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        toast.info(
                          "Image upload feature coming soon. Please use image URL for now.",
                        );
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent mt-2"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowPortfolioModal(false);
                    setPortfolioForm({
                      title: "",
                      description: "",
                      link: "",
                      image: "",
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPortfolio}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                >
                  Add Portfolio Item
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showServiceModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-lg w-full"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Add Service</h3>
                <button
                  onClick={() => {
                    setShowServiceModal(false);
                    setServiceForm({ title: "", description: "", price: "" });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Title *
                  </label>
                  <input
                    type="text"
                    value={serviceForm.title}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, title: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Logo Design"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={serviceForm.description}
                    onChange={(e) =>
                      setServiceForm({
                        ...serviceForm,
                        description: e.target.value,
                      })
                    }
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Describe your service..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price *
                  </label>
                  <input
                    type="text"
                    value={serviceForm.price}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, price: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., $50 or $50-$100"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowServiceModal(false);
                    setServiceForm({ title: "", description: "", price: "" });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddService}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                >
                  Add Service
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeletePortfolioModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Delete Portfolio Item?
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{itemToDelete?.title}"? This
                action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeletePortfolioModal(false);
                    setItemToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      await api.delete(`/profile/portfolio/${itemToDelete.id}`);
                      toast.success("Portfolio item deleted!");
                      setShowDeletePortfolioModal(false);
                      setItemToDelete(null);
                      fetchProfile();
                    } catch (error) {
                      toast.error("Failed to delete portfolio item");
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteServiceModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Delete Service?
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{itemToDelete?.title}"? This
                action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteServiceModal(false);
                    setItemToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      await api.delete(`/profile/services/${itemToDelete.id}`);
                      toast.success("Service deleted!");
                      setShowDeleteServiceModal(false);
                      setItemToDelete(null);
                      fetchProfile();
                    } catch (error) {
                      toast.error("Failed to delete service");
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
            <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 lg:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`${dark ? 'bg-gray-800' : 'bg-white'} lg:rounded-3xl w-full lg:max-w-2xl w-screen lg:max-h-[90vh] h-screen overflow-y-auto shadow-2xl`}
            >
              <div className={`sticky top-0 flex items-center justify-between lg:p-6 p-3 border-b ${dark ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'} z-10`}>
                <h3 className={`lg:text-2xl text-xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>
                  Edit Profile
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className={`p-2 rounded-xl transition ${dark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X className={`w-6 h-6 ${dark ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                    Basic Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={editForm.fullName}
                        onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        value={editForm.country}
                        onChange={(e) => setEditForm({...editForm, country: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {isFreelancer && (
                  <div className="bg-emerald-50 rounded-2xl p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                      Professional Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Professional Title
                        </label>
                        <input
                          type="text"
                          value={editForm.professionalTitle}
                          onChange={(e) => setEditForm({...editForm, professionalTitle: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="e.g., Full Stack Developer"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Years of Experience
                        </label>
                        <input
                          type="number"
                          value={editForm.yearsOfExperience}
                          onChange={(e) => setEditForm({...editForm, yearsOfExperience: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="5"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Hourly Rate ($)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={editForm.hourlyRate}
                          onChange={(e) => setEditForm({...editForm, hourlyRate: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Availability
                        </label>
                        <select
                          value={editForm.availability}
                          onChange={(e) => setEditForm({...editForm, availability: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        >
                          <option value="">Select availability</option>
                          <option value="Full-time">Full-time</option>
                          <option value="Part-time">Part-time</option>
                          <option value="As needed">As needed</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                    About
                  </h4>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                    placeholder="Tell us about yourself and your experience..."
                  />
                </div>

                {isFreelancer && (
                  <>
                    <div className="bg-emerald-50 rounded-2xl p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                        Skills (comma separated)
                      </h4>
                      <input
                        type="text"
                        value={editForm.skills}
                        onChange={(e) => setEditForm({...editForm, skills: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="React, Node.js, Python, AWS..."
                      />
                      <p className="text-xs text-emerald-700 mt-2">Enter skills separated by commas</p>
                    </div>
                    <div className="bg-blue-50 rounded-2xl p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                        Languages (comma separated)
                      </h4>
                      <input
                        type="text"
                        value={editForm.languages}
                        onChange={(e) => setEditForm({...editForm, languages: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="English, Spanish, French..."
                      />
                      <p className="text-xs text-blue-700 mt-2">Enter languages separated by commas</p>
                    </div>
                  </>
                )}

                <div className="bg-gray-50 rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                    Contact Information
                  </h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      value={editForm.whatsapp}
                      onChange={(e) => setEditForm({...editForm, whatsapp: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+1234567890"
                    />
                  </div>
                </div>

                <div className="bg-indigo-50 rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                    Social Links
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        LinkedIn
                      </label>
                      <input
                        type="url"
                        value={editForm.socialLinkedin}
                        onChange={(e) => setEditForm({...editForm, socialLinkedin: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        GitHub
                      </label>
                      <input
                        type="url"
                        value={editForm.socialGithub}
                        onChange={(e) => setEditForm({...editForm, socialGithub: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="https://github.com/username"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Portfolio
                      </label>
                      <input
                        type="url"
                        value={editForm.socialPortfolio}
                        onChange={(e) => setEditForm({...editForm, socialPortfolio: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="https://yourportfolio.com"
                      />
                    </div>
                  </div>
                </div>

                {isClient && (
                  <div className="bg-yellow-50 rounded-2xl p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                      Company Information
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Company Name
                        </label>
                        <input
                          type="text"
                          value={editForm.companyName}
                          onChange={(e) => setEditForm({...editForm, companyName: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Industry
                        </label>
                        <input
                          type="text"
                          value={editForm.industry}
                          onChange={(e) => setEditForm({...editForm, industry: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                          placeholder="e.g., Technology, Finance"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          What you're looking for
                        </label>
                        <textarea
                          value={editForm.hiringLookingFor}
                          onChange={(e) => setEditForm({...editForm, hiringLookingFor: e.target.value})}
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                          placeholder="Full stack developers, mobile app experts..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Budget Range
                        </label>
                        <input
                          type="text"
                          value={editForm.hiringBudgetRange}
                          onChange={(e) => setEditForm({...editForm, hiringBudgetRange: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                          placeholder="e.g., $1,000 - $5,000"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-3xl">
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="md:px-8 p-3 py-3 border border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 font-medium transition flex-1 md:flex-none"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    className="md:px-8 p-3 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl font-medium transition flex-1 md:flex-none flex items-center justify-center gap-2"
                  >
                    {savingProfile ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
            <AnimatePresence>
        {showImageModal && profile && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="backdrop-blur-sm xl:rounded-3xl max-w-screen xl:max-w-2xl w-full max-h-[100vh] overflow-hidden relative shadow-2xl"
            >
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute z-20 top-4 right-4 p-2 bg-white/80 hover:bg-white rounded-full transition shadow-lg"
              >
                <X className="w-6 h-6 text-gray-700" />
              </button>
              
              <div className="flex flex-col items-center gap-6 pt-8 pb-12">
                <div className="relative">
                  {profile.profileImage ? (
                    <img
                      src={profile.profileImage}
                      alt={profile.fullName}
                      className="max-w-screen max-h-screen w-auto h-auto object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.fullName || "User")}&size=320&background=${isFreelancer ? "10b981" : "eab308"}&color=fff`;
                      }}
                    />
                  ) : (
                    <div
                      className={`w-64 h-64 lg:w-80 lg:h-80 rounded-full border-8 border-white shadow-2xl flex items-center justify-center text-6xl font-bold mx-auto ${isFreelancer ? "bg-green-500 text-white" : "bg-yellow-500 text-white"}`}
                    >
                      {profile?.fullName?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  )}
                </div>
                <h2 className="absolute translate-y-1/2 h-screen text-sm lg:text-2xl font-semibold text-white/30 text-center">
                  {profile.fullName} <span className="text-xs lg:text-lg font-normal">@AFRO TASK</span>
                </h2>
                
                <div className="absolute flex flex-col justify-between gap-3 z-20">
                  {isOwnProfile && (
                    <button
                      onClick={() => {
                        setShowImageModal(false);
                        setShowProfileImageUpload(true);
                      }}
                      className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-medium transition shadow-lg flex items-center gap-2 z-20 w-max self-end"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Profile Picture
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showProfileImageUpload && isOwnProfile && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 md:p-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white md:rounded-2xl p-6 max-w-3xl w-full md:max-h-[90vh] overflow-y-auto h-full overflow-hidden"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="md:text-lg text-base font-bold text-gray-900">Crop Profile Picture (1:1)</h3>
                <button
                  onClick={() => {
                    setShowProfileImageUpload(false);
                    setSelectedImage(null);
                    setProfileImageFile(null);
                    setProfileImagePreview(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {selectedImage ? (
                <div className="space-y-4 h-auto flex flex-col">
                  <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden shadow-inner">
                    <Cropper
                      image={selectedImage}
                      crop={crop}
                      zoom={zoom}
                      aspect={1}
                      cropShape="round"
                      showGrid={false}
                      onCropChange={setCrop}
                      onCropComplete={onCropComplete}
                      onZoomChange={setZoom}
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <div className="flex-1 text-xs text-gray-500">
                      Zoom: {Math.round(zoom * 100)}% | Drag to reposition
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setZoom(zoom - 0.1)}
                        className="p-1 text-gray-500 hover:text-gray-700"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => setZoom(1)}
                        className="p-1 text-gray-500 hover:text-gray-700"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => setZoom(zoom + 0.1)}
                        className="p-1 text-gray-500 hover:text-gray-700"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="md:text-sm text-xs flex gap-3 pt-4">
                    <button
                      onClick={() => {
                        setShowProfileImageUpload(false);
                        setSelectedImage(null);
                        setProfileImageFile(null);
                      }}
                      className="flex-1 md:py-3 md:px-4 p-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => inputRef.current?.click()}
                      className="flex-1 md:py-3 md:px-4 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
                    >
                      Change Image
                    </button>
                    <button
                      onClick={handleProfileImageUpload}
                      disabled={!croppedAreaPixels || !profileImageFile}
                      className="flex-1 md:py-3 md:px-4 p-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg transition font-medium"
                    >
                      Upload
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center py-12 space-y-4">
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                    <Upload className="w-12 h-12 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900">Choose profile picture</h4>
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onSelectFile}
                  />
                  <button
                    onClick={() => inputRef.current?.click()}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    Select Image
                  </button>
                </div>
              )}
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onSelectFile}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCoverPhotoUpload && isOwnProfile && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Update Cover Photo</h3>
                <button
                  onClick={() => setShowCoverPhotoUpload(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverPhotoChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                {coverPhotoPreview && (
                  <div>
                    <img src={coverPhotoPreview} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                  </div>
                )}
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowCoverPhotoUpload(false);
                    setCoverPhotoFile(null);
                    setCoverPhotoPreview(null);
                  }}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCoverPhotoUpload}
                  disabled={!coverPhotoFile}
                  className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg transition font-medium"
                >
                  Upload
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {showProjectModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">
                Create Project
              </h3>
              <button
                onClick={() => setShowProjectModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  value={projectForm.title}
                  onChange={(e) =>
                    setProjectForm((f) => ({ ...f, title: e.target.value }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., E-commerce Website"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Description *
                </label>
                <textarea
                  value={projectForm.description}
                  onChange={(e) =>
                    setProjectForm((f) => ({
                      ...f,
                      description: e.target.value,
                    }))
                  }
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Describe what you built, the problem it solves, and your role..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  value={projectForm.category}
                  onChange={(e) =>
                    setProjectForm((f) => ({
                      ...f,
                      category: e.target.value,
                      customCategory: "",
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {PROJECT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              {projectForm.category === "Others" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Custom Category *
                  </label>
                  <input
                    type="text"
                    value={projectForm.customCategory}
                    onChange={(e) =>
                      setProjectForm((f) => ({
                        ...f,
                        customCategory: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Blockchain Development"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="mt-3 w-full h-48 object-cover rounded-lg"
                  />
                )}
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Uploading... {uploadProgress}%
                    </p>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Link
                </label>
                <input
                  type="url"
                  value={projectForm.projectLink}
                  onChange={(e) =>
                    setProjectForm((f) => ({
                      ...f,
                      projectLink: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="https://github.com/... or live URL"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Technologies Used
                </label>
                <input
                  type="text"
                  value={projectForm.technologies}
                  onChange={(e) =>
                    setProjectForm((f) => ({
                      ...f,
                      technologies: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="React, Node.js, MongoDB (comma separated)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Completion Date
                </label>
                <input
                  type="date"
                  value={projectForm.completionDate}
                  onChange={(e) =>
                    setProjectForm((f) => ({
                      ...f,
                      completionDate: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button
                onClick={() => setShowProjectModal(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveProject()}
                disabled={saving}
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white rounded-lg font-medium transition"
              >
                {saving ? "Saving..." : "Publish Project"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileModals;