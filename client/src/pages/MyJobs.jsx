import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/navbar/Navbar";
import { AuthContext } from "../context/AuthContext";
import { useDarkMode } from "../context/DarkModeContext";
import { MessageCircle, Heart, Send, Smile } from "lucide-react";

const MyJobs = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { dark } = useDarkMode();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [showComments, setShowComments] = useState({});

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await api.get("/jobs/my-jobs");
      setJobs(response.data.jobs);
    } catch (error) {
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const viewApplicants = async (job) => {
    try {
      const response = await api.get(`/applications/job/${job.id}`);
      setApplications(response.data.applications);
      setSelectedJob(job);
      setShowModal(true);
    } catch (error) {
      toast.error("Failed to load applicants");
    }
  };

  const handleApplicationAction = async (applicationId, action) => {
    try {
      if (action === "start-chat") {
        await api.post(`/applications/${applicationId}/start-chat`);
        toast.success("Chat started successfully!");
        navigate(`/pre-project-chat/${applicationId}`);
      } else if (action === "reject") {
        await api.post(`/applications/${applicationId}/reject`, {
          reason: "Not selected",
        });
        toast.success("Application rejected");
        setShowModal(false);
        fetchJobs();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to process application",
      );
    }
  };

  const downloadCV = (cvUrl) => {
    if (!cvUrl) {
      toast.error("CV not available");
      return;
    }

    const link = document.createElement("a");
    link.href = cvUrl;
    link.target = "_blank";
    link.download = "CV.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const viewProfile = (freelancerId) => {
    navigate(`/profile/${freelancerId}`);
  };

  const fetchComments = async (jobId) => {
    try {
      const response = await api.get(`/jobs/${jobId}/comments`);
      setComments((prev) => ({ ...prev, [jobId]: response.data.comments }));
    } catch (error) {
      console.error("Failed to load comments:", error);
    }
  };

  const toggleComments = async (jobId) => {
    const isShowing = showComments[jobId];
    setShowComments((prev) => ({ ...prev, [jobId]: !isShowing }));

    if (!isShowing && !comments[jobId]) {
      await fetchComments(jobId);
    }
  };

  const handleAddComment = async (jobId) => {
    const content = newComment[jobId];
    if (!content || !content.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    try {
      const response = await api.post(`/jobs/${jobId}/comments`, { content });
      setComments((prev) => ({
        ...prev,
        [jobId]: [response.data.comment, ...(prev[jobId] || [])],
      }));
      setNewComment((prev) => ({ ...prev, [jobId]: "" }));
      toast.success("Comment posted!");

      setJobs((prev) =>
        prev.map((job) =>
          job.id === jobId
            ? { ...job, commentsCount: (job.commentsCount || 0) + 1 }
            : job,
        ),
      );
    } catch (error) {
      toast.error("Failed to post comment");
    }
  };

  const handleLikeComment = async (jobId, commentId) => {
    try {
      const response = await api.post(
        `/jobs/${jobId}/comments/${commentId}/like`,
      );
      setComments((prev) => ({
        ...prev,
        [jobId]: prev[jobId].map((comment) => {
          if (comment.id === commentId) {
            const likes = comment.likes || [];
            const newLikes = response.data.liked
              ? [...likes, user.id]
              : likes.filter((id) => id !== user.id);
            return { ...comment, likes: newLikes };
          }
          return comment;
        }),
      }));
    } catch (error) {
      console.error("Failed to like comment:", error);
    }
  };

  return (
    <div className={`flex min-h-screen ${dark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Sidebar />

      <div className="flex-1 lg:ml-64">
        <Navbar />

        <div className="p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
              <div>
                <h1 className={`text-2xl md:text-3xl font-bold ${dark ? 'text-white' : 'text-gray-800'}`}>
                  My Posted Jobs
                </h1>
                <p className={`mt-1 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Manage your job postings and applicants
                </p>
              </div>
              <button
                onClick={() => navigate("/client/post-job")}
                className="px-6 py-3 bg-[#00564C] hover:bg-[#003F38] text-white rounded-lg font-medium transition shadow-lg"
              >
                + Post New Job
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 gap-4 md:gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className={`${dark ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 animate-pulse`}>
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-xl"></div>
                      <div className="flex-1">
                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-[#E6F0EF] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-12 h-12 text-[#00564C]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className={`text-xl font-semibold mb-2 ${dark ? 'text-white' : 'text-gray-800'}`}>
                  No jobs posted yet
                </h3>
                <p className={`mb-6 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Start by posting your first job to find talented freelancers
                </p>
                <button
                  onClick={() => navigate("/client/post-job")}
                  className="px-8 py-3 bg-[#00564C] hover:bg-[#003F38] text-white rounded-lg font-medium transition"
                >
                  Post Your First Job
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:gap-6">
                {jobs.map((job) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl p-4 md:p-6 shadow-sm hover:shadow-md transition-all border`}
                  >
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div className="w-16 h-16 bg-[#00564C] rounded-xl flex items-center justify-center flex-shrink-0">
                        <img
                          src={
                            job.client?.profileImage ||
                            user?.profileImage ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(job.client?.fullName || user?.fullName || "Client")}&background=00564C&color=fff`
                          }
                          alt={job.client?.fullName || user?.fullName || "Client"}
                          className="w-full h-full rounded-xl object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-3">
                          <div className="flex-1">
                            <h3 className={`text-lg md:text-xl font-bold mb-1 ${dark ? 'text-white' : 'text-gray-900'}`}>
                              {job.title}
                            </h3>
                            <div className={`flex flex-wrap items-center gap-2 text-sm ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {job.status && (
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    job.status === "open"
                                      ? "bg-green-100 text-green-700"
                                      : job.status === "closed"
                                        ? "bg-gray-100 text-gray-700"
                                        : "bg-blue-100 text-blue-700"
                                  }`}
                                >
                                  {job.status.toUpperCase()}
                                </span>
                              )}
                              {job.workLocation && (
                                <>
                                  {job.status && <span>•</span>}
                                  <span>{job.workLocation}</span>
                                </>
                              )}
                              {job.createdAt && (
                                <>
                                  {(job.status || job.workLocation) && (
                                    <span>•</span>
                                  )}
                                  <span>
                                    Posted{" "}
                                    {new Date(
                                      job.createdAt,
                                    ).toLocaleDateString()}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          {(job.budgetRange || job.budget) && (
                            <div className="text-left md:text-right">
                              <p className="text-xl md:text-2xl font-bold text-[#00564C]">
                                {job.budgetRange ||
                                  `$${job.budget?.toLocaleString()}`}
                              </p>
                              {job.projectType && (
                                <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {job.projectType}
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {job.description && (
                          <p className={`mb-4 line-clamp-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {job.description}
                          </p>
                        )}

                        {((job.requiredSkills &&
                          job.requiredSkills.length > 0) ||
                          (job.skills && job.skills.length > 0)) && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {(job.requiredSkills || job.skills)
                              ?.slice(0, 5)
                              .map((skill, idx) => (
                                <span key={idx} className={`px-3 py-1 rounded-full text-sm ${dark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                                  {skill}
                                </span>
                              ))}
                            {(job.requiredSkills || job.skills)?.length > 5 && (
                              <span className={`px-3 py-1 rounded-full text-sm ${dark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                                +{(job.requiredSkills || job.skills).length - 5}{" "}
                                more
                              </span>
                            )}
                          </div>
                        )}

                        <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t ${dark ? 'border-gray-700' : 'border-gray-100'}`}>
                          <div className={`flex items-center gap-4 text-sm ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
                            <div className="flex items-center gap-1">
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                              </svg>
                              <span className="font-medium">
                                {job.applicantsCount || 0} Applicants
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                              <span>{job.views || 0} Views</span>
                            </div>
                            <button
                              onClick={() => toggleComments(job.id)}
                              className="flex items-center gap-1 hover:text-[#00564C] transition"
                            >
                              <MessageCircle className="w-5 h-5" />
                              <span>{job.commentsCount || 0} Comments</span>
                            </button>
                          </div>
                          <button
                            onClick={() => viewApplicants(job)}
                            className="px-6 py-2.5 bg-[#00564C] hover:bg-[#003F38] text-white rounded-lg font-medium transition"
                          >
                            View Applicants
                          </button>
                        </div>

                        {showComments[job.id] && (
                          <div className={`mt-4 pt-4 border-t ${dark ? 'border-gray-700' : 'border-gray-200'}`}>
                            <div className="flex items-start gap-3 mb-4">
                              <img
                                src={
                                  user?.photoURL ||
                                  `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || "User")}`
                                }
                                alt="Your avatar"
                                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                              />
                              <div className="flex-1 flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Write a comment..."
                                  value={newComment[job.id] || ""}
                                  onChange={(e) =>
                                    setNewComment((prev) => ({
                                      ...prev,
                                      [job.id]: e.target.value,
                                    }))
                                  }
                                  onKeyPress={(e) =>
                                    e.key === "Enter" &&
                                    handleAddComment(job.id)
                                  }
                                  className={`flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-[#00564C] ${dark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'}`}
                                />
                                <button
                                  onClick={() => handleAddComment(job.id)}
                                  className="p-2 bg-[#00564C] hover:bg-[#003F38] text-white rounded-full transition"
                                >
                                  <Send className="w-5 h-5" />
                                </button>
                              </div>
                            </div>

                            <div className="space-y-3">
                              {comments[job.id]?.length === 0 && (
                                <p className={`text-center py-4 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                                  No comments yet. Be the first to comment!
                                </p>
                              )}
                              {comments[job.id]?.map((comment) => (
                                <div
                                  key={comment.id}
                                  className={`flex items-start gap-3 rounded-lg p-3 ${dark ? 'bg-gray-700' : 'bg-gray-50'}`}
                                >
                                  <img
                                    src={
                                      comment.user?.profileImage ||
                                      `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user?.fullName || "User")}`
                                    }
                                    alt={comment.user?.fullName}
                                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className={`font-semibold text-sm ${dark ? 'text-gray-200' : ''}`}>
                                        {comment.user?.fullName}
                                      </span>
                                      <span className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {new Date(
                                          comment.createdAt,
                                        ).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <p className={`text-sm ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
                                      {comment.content}
                                    </p>
                                    <button
                                      onClick={() => handleLikeComment(job.id, comment.id)}
                                      className={`flex items-center gap-1 mt-2 text-xs transition ${
                                        comment.likes?.includes(user?.id) ? "text-red-500" : dark ? "text-gray-400 hover:text-red-400" : "text-gray-500 hover:text-red-500"
                                      }`}
                                    >
                                      <Heart
                                        className={`w-4 h-4 ${comment.likes?.includes(user?.id) ? "fill-current" : ""}`}
                                      />
                                      <span>{comment.likes?.length || 0}</span>
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`${dark ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-4 md:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto`}
          >
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className={`text-xl md:text-2xl font-bold ${dark ? 'text-white' : 'text-gray-800'}`}>
                Applicants for {selectedJob?.title}
              </h2>
              <button onClick={() => setShowModal(false)} className={`p-2 rounded-lg transition ${dark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                <svg className={`w-6 h-6 ${dark ? 'text-gray-300' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {applications.length === 0 ? (
              <div className="text-center py-12">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${dark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <svg
                    className="w-10 h-10 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <p className={dark ? 'text-gray-400' : 'text-gray-500'}>No applications yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className={`border rounded-xl p-4 md:p-6 ${dark ? 'border-gray-700' : 'border-gray-200'}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <img
                        src={
                          app.freelancer?.profileImage ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(app.freelancer?.fullName || "User")}`
                        }
                        alt={app.freelancer?.fullName}
                        className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-bold text-lg ${dark ? 'text-white' : ''}`}>{app.freelancer?.fullName}</h3>
                        <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-600'}`}>{app.freelancer?.skillCategory}</p>
                        <p className={`mt-3 text-sm md:text-base ${dark ? 'text-gray-300' : 'text-gray-700'}`}>{app.proposalMessage}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                          <span className="font-medium text-[#00564C]">
                            Budget: {app.proposedBudget}
                          </span>
                          {app.portfolioLink && (
                            <a
                              href={app.portfolioLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline"
                            >
                              View Portfolio →
                            </a>
                          )}
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            onClick={() => viewProfile(app.freelancerId)}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition text-sm"
                          >
                            View Profile
                          </button>
                          <button
                            onClick={() => downloadCV(app.cvUrl)}
                            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition text-sm"
                          >
                            Download CV
                          </button>
                          {app.status === "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  handleApplicationAction(app.id, "start-chat")
                                }
                                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition text-sm"
                              >
                                Start Chat
                              </button>
                              <button
                                onClick={() =>
                                  handleApplicationAction(app.id, "reject")
                                }
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition text-sm"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {app.status === "chatting" && (
                            <button
                              onClick={() =>
                                navigate(`/pre-project-chat/${app.id}`)
                              }
                              className="px-4 py-2 bg-[#00564C] hover:bg-[#003F38] text-white rounded-lg transition text-sm"
                            >
                              Continue Chat
                            </button>
                          )}
                          {app.status !== "pending" &&
                            app.status !== "chatting" && (
                              <span
                                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                                  app.status === "accepted"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {app.status}
                              </span>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowModal(false)}
              className={`mt-6 w-full px-6 py-3 border rounded-lg transition ${dark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MyJobs;