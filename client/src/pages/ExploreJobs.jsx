import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/navbar/Navbar';
import JobCard from '../components/JobCard';
import { useDarkMode } from '../context/DarkModeContext';

const ExploreJobs = () => {
  const { dark } = useDarkMode();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [cvFile, setCvFile] = useState(null);
  const [applicationData, setApplicationData] = useState({
    proposalMessage: '',
    proposedBudget: '',
    portfolioLink: ''
  });

  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    projectType: '',
    location: '',
    status: 'open',
    budgetMin: '',
    budgetMax: '',
    sortBy: 'newest',
    skills: []
  });

  // Unique filter options
  const uniqueProjectTypes = useMemo(() => {
    return Array.from(new Set(jobs.map(job => job.projectType).filter(Boolean))).sort();
  }, [jobs]);

  const uniqueLocations = useMemo(() => {
    return Array.from(new Set(jobs.map(job => job.workLocation).filter(Boolean))).sort();
  }, [jobs]);

  const uniqueSkills = useMemo(() => {
    const allSkills = jobs.flatMap(job => job.requiredSkills || []);
    return Array.from(new Set(allSkills)).sort();
  }, [jobs]);

  // Set of jobIds the current user has already applied to — drives the
  // "Applied" button state below. Recomputed any time `applications` is
  // invalidated (initial fetch, or right after a successful submission).
  const appliedJobIds = useMemo(() => {
    return new Set(applications.map(app => app.jobId));
  }, [applications]);

  useEffect(() => {
    fetchJobs();
    fetchApplications();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs');
      setJobs(response.data.jobs);
    } catch (error) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await api.get('/applications/my-applications');
      setApplications(response.data.applications);
    } catch (error) {
      console.error('Failed to load applications:', error);
      // Non-fatal: don't block the jobs list if this call fails
    }
  };

  const filteredJobs = useMemo(() => {
    let filtered = [...jobs];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(job => 
        job.title?.toLowerCase().includes(searchLower) ||
        job.description?.toLowerCase().includes(searchLower) ||
        job.client?.fullName?.toLowerCase().includes(searchLower)
      );
    }

    // Project type filter
    if (filters.projectType) {
      filtered = filtered.filter(job => job.projectType === filters.projectType);
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(job => job.workLocation?.includes(filters.location));
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(job => job.status === filters.status);
    }

    // Budget filters (parse ranges like "$500-$1000")
    if (filters.budgetMin || filters.budgetMax) {
      filtered = filtered.filter(job => {
        const budgetMatch = job.budgetRange || job.budget;
        if (!budgetMatch) return true;
        
        // Handle single values or ranges
        const cleanBudget = budgetMatch.replace(/[$\s]/g, '');
        let jobMin, jobMax;
        
        if (cleanBudget.includes('-')) {
          [jobMin, jobMax] = cleanBudget.split('-').map(num => parseFloat(num));
        } else {
          jobMin = jobMax = parseFloat(cleanBudget);
        }
        
        const min = parseFloat(filters.budgetMin) || 0;
        const max = parseFloat(filters.budgetMax) || Infinity;
        
        return (jobMin >= min && jobMax <= max) || 
               (min === 0 && max === Infinity) || 
               (jobMax >= min && jobMin <= max);
      });
    }

    // Skills filter
    if (filters.skills.length > 0) {
      filtered = filtered.filter(job => {
        const jobSkills = job.requiredSkills || [];
        return filters.skills.some(skill => jobSkills.includes(skill));
      });
    }

    // Sort
    switch (filters.sortBy) {
      case 'most-viewed':
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'most-recent':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'highest-budget':
        filtered.sort((a, b) => {
          const aBudget = parseFloat((a.budgetRange || a.budget || '0').split('-')[1]?.replace(/[$\s]/g, '') || 0);
          const bBudget = parseFloat((b.budgetRange || b.budget || '0').split('-')[1]?.replace(/[$\s]/g, '') || 0);
          return bBudget - aBudget;
        });
        break;
      default:
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return filtered;
  }, [jobs, filters]);

  const handleApply = async (job) => {
    // Already applied — button should be disabled, but guard here too
    // in case this gets called from somewhere else (e.g. modal).
    if (appliedJobIds.has(job.id)) {
      toast.error('You already applied to this job');
      return;
    }

    // Check if profile is completed and has intro video
    try {
      const response = await api.get('/onboarding/status');
      if (!response.data.profileCompleted) {
        toast.error('Please complete your profile before applying to jobs');
        setTimeout(() => {
          window.location.href = '/freelancer/onboarding';
        }, 2000);
        return;
      }
      
      // Check specifically for intro video
      const userResponse = await api.get('/auth/me');
      if (!userResponse.data.user.introVideoUrl) {
        toast.error('You must upload a professional introduction video before applying to jobs');
        setTimeout(() => {
          window.location.href = '/freelancer/onboarding';
        }, 2000);
        return;
      }
    } catch (error) {
      console.error('Failed to check profile status');
    }
    
    setSelectedJob(job);
    setShowModal(true);
    setShowJobDetails(false);
  };

  const handleLearnMore = async (job) => {
    setSelectedJob(job);
    setShowJobDetails(true);
    setShowModal(false);
    
    // Track job view
    try {
      await api.post(`/jobs/${job.id}/view`);
    } catch (error) {
      console.error('Failed to track job view:', error);
    }
  };

// New state — tracks in-flight submission
const [submitting, setSubmitting] = useState(false);

const submitApplication = async (e) => {
  e.preventDefault();

  // Guard 1: block if already submitting (handles double-click / double-submit)
  if (submitting) return;

  // Guard 2: block if this job was already applied to (handles stale modal state)
  if (appliedJobIds.has(selectedJob.id)) {
    toast.error('You already applied to this job');
    setShowModal(false);
    return;
  }

  if (!cvFile) {
    toast.error('Please upload your CV');
    return;
  }

  setSubmitting(true);
  try {
    const formData = new FormData();
    formData.append('jobId', selectedJob.id);
    formData.append('proposalMessage', applicationData.proposalMessage);
    formData.append('proposedBudget', applicationData.proposedBudget);
    formData.append('portfolioLink', applicationData.portfolioLink);
    formData.append('cv', cvFile);

    const response = await api.post('/applications', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    toast.success('Application submitted successfully!');
    setShowModal(false);
    setCvFile(null);
    setApplicationData({ proposalMessage: '', proposedBudget: '', portfolioLink: '' });

    // Invalidate applied-jobs state immediately so the button flips to
    // "Applied" without waiting on a full refetch.
    const newApplication = response.data?.application || { jobId: selectedJob.id };
    setApplications(prev => [...prev, newApplication]);

    fetchJobs();
  } catch (error) {
    // Handle server-side duplicate rejection (e.g. 409) distinctly if you
    // want a clearer message, otherwise fall back to the generic one.
    if (error.response?.status === 409) {
      toast.error('You already applied to this job');
      setApplications(prev =>
        prev.some(a => a.jobId === selectedJob.id)
          ? prev
          : [...prev, { jobId: selectedJob.id }]
      );
      setShowModal(false);
    } else {
      toast.error(error.response?.data?.message || 'Failed to submit application');
    }
  } finally {
    setSubmitting(false);
  }
};

  return (
    <div className={`flex min-h-screen ${dark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Sidebar />

      <div className="flex-1 lg:ml-64">
        <div className={`border-b px-6 py-4 ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="max-w-7xl mx-auto text-center lg:text-start">
            <h1 className={`text-2xl font-bold ${dark ? 'text-white' : 'text-gray-800'}`}>Explore Jobs</h1>
          </div>
        </div>

        <div className="p-4 md:p-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">

            <div className="mb-6 md:mb-8">
              <h1 className={`text-2xl md:text-3xl font-bold mb-2 ${dark ? 'text-white' : 'text-gray-800'}`}>Explore Jobs</h1>
              <p className={dark ? 'text-gray-400' : 'text-gray-600'}>Find your next opportunity</p>
            </div>

            {/* Filters */}
            <div className={`rounded-2xl p-6 mb-6 shadow-sm border sticky top-20 z-10 ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Search Jobs', type: 'text', placeholder: 'Job title, description, client...', key: 'search' },
                  { label: 'Min Budget', type: 'number', placeholder: '$0', key: 'budgetMin' },
                ].map(({ label, type, placeholder, key }) => (
                  <div key={key}>
                    <label className={`block text-sm font-medium mb-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>{label}</label>
                    <input type={type} placeholder={placeholder} value={filters[key]}
                      onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${dark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'}`}
                    />
                  </div>
                ))}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Project Type</label>
                  <select value={filters.projectType} onChange={(e) => setFilters({ ...filters, projectType: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${dark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}>
                    <option value="">All Types</option>
                    {uniqueProjectTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Location</label>
                  <select value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${dark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}>
                    <option value="">All Locations</option>
                    {uniqueLocations.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Max Budget</label>
                  <input type="number" placeholder="$5000" value={filters.budgetMax}
                    onChange={(e) => setFilters({ ...filters, budgetMax: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${dark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Sort By</label>
                  <select value={filters.sortBy} onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${dark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}>
                    <option value="newest">Newest</option>
                    <option value="most-recent">Most Recent</option>
                    <option value="most-viewed">Most Viewed</option>
                    <option value="highest-budget">Highest Budget</option>
                  </select>
                </div>
                <div className="lg:col-span-2">
                  <label className={`block text-sm font-medium mb-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Skills</label>
                  <select value={filters.skills} onChange={(e) => setFilters({ ...filters, skills: Array.from(e.target.selectedOptions, o => o.value) })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent h-12 ${dark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}>
                    <option value="">Select a skill...</option>
                    {uniqueSkills.slice(0, 10).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="flex items-end">
                  <button onClick={() => setFilters({ search: '', projectType: '', location: '', status: 'open', budgetMin: '', budgetMax: '', sortBy: 'newest', skills: [] })}
                    className={`w-full px-6 py-2 rounded-lg font-medium transition ${dark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
                    Clear Filters
                  </button>
                </div>
              </div>

              <div className={`mt-4 pt-4 border-t ${dark ? 'border-gray-700' : 'border-gray-200'}`}>
                <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Showing {filteredJobs.length} of {jobs.length} jobs</p>
              </div>
            </div>

            {/* Job List */}
            {loading ? (
              <div className="grid grid-cols-1 gap-4 md:gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={`${dark ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 animate-pulse`}>
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-xl" />
                      <div className="flex-1">
                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                        <div className="h-4 bg-gray-200 rounded w-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:gap-6">
                {filteredJobs.map(job => {
                  const hasApplied = appliedJobIds.has(job.id);
                  return (
                    <motion.div key={job.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      className={`rounded-2xl p-4 md:p-6 shadow-sm hover:shadow-md transition-all border ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                      <div className="flex flex-col md:flex-row md:items-start gap-4">
                        <img src={job.client?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(job.client?.fullName || 'Client')}&background=10b981&color=fff`}
                          alt={job.client?.fullName || 'Client'} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-3">
                            <div className="flex-1">
                              <h3 className={`text-lg md:text-xl font-bold mb-1 ${dark ? 'text-white' : 'text-gray-900'}`}>{job.title}</h3>
                              <div className={`flex flex-wrap items-center gap-2 text-sm ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {job.client?.fullName && <><span>{job.client.fullName}</span><span>•</span></>}
                                {job.workLocation && <><span>{job.workLocation}</span><span>•</span></>}
                                {job.status && (
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${job.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                    {job.status.toUpperCase()}
                                  </span>
                                )}
                              </div>
                            </div>
                            {job.budgetRange && (
                              <div className="text-left md:text-right">
                                <p className="text-xl md:text-2xl font-bold text-green-600">{job.budgetRange}</p>
                                {job.projectType && <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{job.projectType}</p>}
                              </div>
                            )}
                          </div>
                          {job.description && <p className={`mb-4 line-clamp-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>{job.description}</p>}
                          {job.requiredSkills?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {job.requiredSkills.slice(0, 4).map((skill, idx) => (
                                <span key={idx} className={`px-3 py-1 rounded-full text-sm ${dark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>{skill}</span>
                              ))}
                              {job.requiredSkills.length > 4 && (
                                <span className={`px-3 py-1 rounded-full text-sm ${dark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>+{job.requiredSkills.length - 4} more</span>
                              )}
                            </div>
                          )}
                          <div className="flex flex-col sm:flex-row gap-3">
                            <button
                              onClick={() => handleApply(job)}
                              disabled={hasApplied}
                              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg font-medium transition ${
                                hasApplied
                                  ? `cursor-not-allowed ${dark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'}`
                                  : 'bg-green-600 hover:bg-green-700 text-white'
                              }`}
                            >
                              {hasApplied ? 'Applied' : 'Apply Now'}
                            </button>
                            <button onClick={() => handleLearnMore(job)} className={`flex-1 sm:flex-none px-6 py-2.5 border rounded-lg transition ${dark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>Learn More</button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {jobs.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 ${dark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className={`text-lg ${dark ? 'text-gray-400' : 'text-gray-500'}`}>No jobs available at the moment</p>
                <p className={`text-sm mt-2 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Check back later for new opportunities</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Job Details Modal */}
      {showJobDetails && selectedJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className={`${dark ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 md:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h2 className={`text-2xl md:text-3xl font-bold mb-2 ${dark ? 'text-white' : 'text-gray-800'}`}>{selectedJob.title}</h2>
                <p className={dark ? 'text-gray-400' : 'text-gray-600'}>{selectedJob.client?.fullName || 'Client'} • {selectedJob.workLocation || 'Remote'}</p>
              </div>
              <button onClick={() => setShowJobDetails(false)} className={`p-2 rounded-lg transition ${dark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                <svg className={`w-6 h-6 ${dark ? 'text-gray-300' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-6">
              {selectedJob.budgetRange && (
                <div>
                  <h3 className={`text-lg font-semibold mb-2 ${dark ? 'text-white' : 'text-gray-900'}`}>Budget</h3>
                  <p className="text-2xl font-bold text-green-600">{selectedJob.budgetRange}</p>
                  {selectedJob.projectType && <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{selectedJob.projectType}</p>}
                </div>
              )}
              {selectedJob.description && (
                <div>
                  <h3 className={`text-lg font-semibold mb-2 ${dark ? 'text-white' : 'text-gray-900'}`}>Job Description</h3>
                  <p className={`whitespace-pre-wrap ${dark ? 'text-gray-300' : 'text-gray-700'}`}>{selectedJob.description}</p>
                </div>
              )}
              {selectedJob.requiredSkills?.length > 0 && (
                <div>
                  <h3 className={`text-lg font-semibold mb-3 ${dark ? 'text-white' : 'text-gray-900'}`}>Skills Required</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.requiredSkills.map((skill, idx) => (
                      <span key={idx} className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">{skill}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Project Type', value: selectedJob.projectType },
                  { label: 'Work Location', value: selectedJob.workLocation },
                  { label: 'Deadline', value: selectedJob.deadline && new Date(selectedJob.deadline).toLocaleDateString() },
                  { label: 'Posted', value: selectedJob.createdAt && new Date(selectedJob.createdAt).toLocaleDateString() },
                ].filter(i => i.value).map(({ label, value }) => (
                  <div key={label}>
                    <h4 className={`text-sm font-medium mb-1 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>{label}</h4>
                    <p className={dark ? 'text-gray-200' : 'text-gray-900'}>{value}</p>
                  </div>
                ))}
              </div>
              <div className={`flex flex-col sm:flex-row gap-3 pt-4 border-t ${dark ? 'border-gray-700' : 'border-gray-200'}`}>
                <button
                  onClick={() => { setShowJobDetails(false); handleApply(selectedJob); }}
                  disabled={appliedJobIds.has(selectedJob.id)}
                  className={`flex-1 px-6 py-3 rounded-lg font-medium transition ${
                    appliedJobIds.has(selectedJob.id)
                      ? `cursor-not-allowed ${dark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'}`
                      : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                  }`}
                >
                  {appliedJobIds.has(selectedJob.id) ? 'Applied' : 'Apply for this Job'}
                </button>
                <button onClick={() => setShowJobDetails(false)}
                  className={`flex-1 px-6 py-3 border rounded-lg transition ${dark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Application Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className={`${dark ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
            <h2 className={`text-xl md:text-2xl font-bold mb-4 md:mb-6 ${dark ? 'text-white' : 'text-gray-800'}`}>
              Apply for {selectedJob?.title}
            </h2>
            <form onSubmit={submitApplication} className="space-y-4">
              {[
                { label: 'Proposal Message *', key: 'proposalMessage', type: 'textarea', placeholder: "Explain why you're the best fit...", required: true },
                { label: 'Proposed Budget *', key: 'proposedBudget', type: 'text', placeholder: 'e.g., $500 - $1000', required: true },
                { label: 'Portfolio Link (Optional)', key: 'portfolioLink', type: 'url', placeholder: 'https://your-portfolio.com', required: false },
              ].map(({ label, key, type, placeholder, required }) => (
                <div key={key}>
                  <label className={`block text-sm font-medium mb-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>{label}</label>
                  {type === 'textarea' ? (
                    <textarea value={applicationData[key]} onChange={(e) => setApplicationData({ ...applicationData, [key]: e.target.value })}
                      required={required} rows={6} placeholder={placeholder}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm ${dark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'}`} />
                  ) : (
                    <input type={type} value={applicationData[key]} onChange={(e) => setApplicationData({ ...applicationData, [key]: e.target.value })}
                      required={required} placeholder={placeholder}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm ${dark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'}`} />
                  )}
                </div>
              ))}
              <div>
                <label className={`block text-sm font-medium mb-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Upload CV * (PDF, DOC, DOCX)</label>
                <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setCvFile(e.target.files[0])} required
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm ${dark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`} />
                {cvFile && <p className="mt-2 text-sm text-green-600">Selected: {cvFile.name}</p>}
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button type="button" onClick={() => { setShowModal(false); setCvFile(null); }}
                  className={`flex-1 px-6 py-3 border rounded-lg transition text-sm ${dark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`flex-1 px-6 py-3 rounded-lg transition text-sm font-medium ${
                    submitting
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                  }`}
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ExploreJobs;