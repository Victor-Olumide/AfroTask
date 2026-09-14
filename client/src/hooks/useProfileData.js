import { useState, useEffect } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

export const useProfileData = (userId, user) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editForm, setEditForm] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);

  const isOwnProfile = user?.id === userId;

  const fetchProfile = async () => {
    try {
      const response = await api.get(`/profile/public/${userId}`);
      const profileData = response.data.profile;

      if (profileData.role === 'admin') {
        window.location.href = `/admin/profile/${userId}`;
        return;
      }

      if (profileData.role === "freelancer") {
        try {
          const reviewsResponse = await api.get(`/reviews/${userId}`);
          profileData.reviews = reviewsResponse.data.reviews || [];
          profileData.averageRating = reviewsResponse.data.averageRating || 0;
          profileData.totalReviews = reviewsResponse.data.totalReviews || 0;
        } catch (err) {
          console.error("Failed to fetch reviews:", err);
          profileData.reviews = [];
        }
      }

      if (profileData.role === "client") {
        try {
          const jobsResponse = await api.get(`/jobs/my-jobs`);
          const allJobs = jobsResponse.data.jobs || [];
          profileData.activeJobs = allJobs.filter(
            (job) => job.status === "open" || job.status === "ongoing",
          );
          profileData.completedJobs = allJobs.filter(
            (job) => job.status === "completed" || job.status === "closed",
          );
        } catch (err) {
          console.error("Failed to fetch jobs:", err);
          profileData.activeJobs = [];
          profileData.completedJobs = [];
        }
      }

      try {
        const postsResponse = await api.get(`/posts/user/${userId}`);
        profileData.posts = postsResponse.data.posts || [];
      } catch (err) {
        console.error("Failed to fetch posts:", err);
        profileData.posts = [];
      }

      if (profileData.role === "freelancer") {
        try {
          const projectsResponse = await api.get(
            `/profile/showcase-projects?freelancerId=${userId}&limit=50`,
          );
          profileData.projects = projectsResponse.data.projects || [];
        } catch (err) {
          console.error("Failed to fetch projects:", err);
          profileData.projects = [];
        }
      }

      setProfile(profileData);
    } catch (error) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    const skillsArray = editForm.skills.split(',').map(s => s.trim()).filter(Boolean);
    const languagesArray = editForm.languages.split(',').map(s => s.trim()).filter(Boolean);
    const socialLinksObj = {
      linkedin: editForm.socialLinkedin || '',
      github: editForm.socialGithub || '',
      portfolio: editForm.socialPortfolio || '',
    };

    const formData = new FormData();
    formData.append('fullName', editForm.fullName);
    formData.append('country', editForm.country);
    formData.append('professionalTitle', editForm.professionalTitle);
    formData.append('yearsOfExperience', editForm.yearsOfExperience);
    formData.append('hourlyRate', editForm.hourlyRate);
    formData.append('availability', editForm.availability);
    formData.append('bio', editForm.bio);
    formData.append('skills', JSON.stringify(skillsArray));
    formData.append('languages', JSON.stringify(languagesArray));
    formData.append('whatsapp', editForm.whatsapp);
    formData.append('companyName', editForm.companyName);
    formData.append('industry', editForm.industry);
    formData.append('hiringPreferences', JSON.stringify({
      lookingFor: editForm.hiringLookingFor,
      budgetRange: editForm.hiringBudgetRange,
    }));
    formData.append('socialLinks', JSON.stringify(socialLinksObj));

    setSavingProfile(true);
    try {
      await api.put(`/profile/${userId}`, formData);
      toast.success('Profile updated successfully!');
      setEditForm(false);
      fetchProfile();
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await api.delete(`/posts/${postId}`);
      toast.success("Post deleted!");
      fetchProfile();
    } catch (error) {
      toast.error("Failed to delete post");
    }
  };

  const isFreelancer = profile?.role === "freelancer";
  const isClient = profile?.role === "client";

  const tabs = isFreelancer
    ? ["about", "portfolio", "services", "projects", "posts", "reviews"]
    : ["about", "active-jobs", "completed-jobs", "posts"];

  const tabLabels = {
    about: "About",
    portfolio: "Projects",
    services: "Services",
    projects: "Active Jobs",
    posts: "Posts",
    reviews: "Reviews",
    "active-jobs": "Active Jobs",
    "completed-jobs": "Completed Jobs",
  };

  return {
    profile,
    setProfile,
    loading,
    fetchProfile,
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
  };
};