import { useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

export const useProfileProjects = (userId, profile) => {
  const [showcaseProjects, setShowcaseProjects] = useState([]);
  const [loadingShowcase, setLoadingShowcase] = useState(false);
  const [projectForm, setProjectForm] = useState({
    title: "",
    description: "",
    category: "",
    customCategory: "",
    projectLink: "",
    technologies: "",
    completionDate: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);

  const fetchShowcaseProjects = async (uid) => {
    setLoadingShowcase(true);
    try {
      const res = await api.get(
        `/profile/showcase-projects?freelancerId=${uid}&limit=50`,
      );
      setShowcaseProjects(res.data.projects || []);
    } catch (err) {
      console.error("Failed to fetch showcase projects:", err);
      setShowcaseProjects([]);
    } finally {
      setLoadingShowcase(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProjectForm((f) => ({ ...f, image: file }));
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSaveProject = async (user, fetchShowcaseProjects) => {
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
      setProjectForm({
        title: "",
        description: "",
        category: "",
        customCategory: "",
        projectLink: "",
        technologies: "",
        completionDate: "",
        image: null,
      });
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

  const openCreateProject = () => {
    setProjectForm({
      title: "",
      description: "",
      category: "",
      customCategory: "",
      projectLink: "",
      technologies: "",
      completionDate: "",
      image: null,
    });
    setImagePreview(null);
    setUploadProgress(0);
  };

  return {
    showcaseProjects,
    loadingShowcase,
    fetchShowcaseProjects,
    projectForm,
    setProjectForm,
    imagePreview,
    uploadProgress,
    saving,
    setSaving,
    handleImageChange,
    handleSaveProject,
    openCreateProject,
  };
};