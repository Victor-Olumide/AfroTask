import { useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

export const useFollow = (userId, isOwnProfile) => {
  const [following, setFollowing] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(false);

  const checkFollowStatus = async () => {
    try {
      const response = await api.get(`/follows/${userId}/status`);
      setFollowing(response.data.following);
    } catch (error) {
      console.error("Failed to check follow status");
    }
  };

  const handleFollow = async () => {
    if (loadingFollow || isOwnProfile) return;

    try {
      setLoadingFollow(true);
      const response = await api.post(`/follows/${userId}`);
      setFollowing(response.data.following);
      toast.success(response.data.following ? "Following!" : "Unfollowed");
    } catch (error) {
      toast.error("Failed to follow user");
    } finally {
      setLoadingFollow(false);
    }
  };

  return {
    following,
    setFollowing,
    loadingFollow,
    handleFollow,
    checkFollowStatus,
  };
};