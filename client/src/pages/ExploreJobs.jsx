import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import { useDarkMode } from '../context/DarkModeContext';

const ExploreJobs = () => {
  const { dark } = useDarkMode();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [cvFile, setCvFile] = useState(null);
  const [showMobileFilterDrawer, setShowMobileFilterDrawer] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [applicationData, setApplicationData] = useState({
    proposalMessage: '',
    proposedBudget: '',
    portfolioLink: ''
  });

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

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.projectType) count++;
    if (filters.location) count++;
    if (filters.budgetMin || filters.budgetMax) count++;
    if (filters.skills.length > 0) count += filters.skills.length;
    return count;
  }, [filters]);

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

  useEffect(() => {
    fetchJobs();
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

  const filteredJobs = useMemo(() => {
    let filtered = [...jobs];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(job => 
        job.title?.toLowerCase().includes(searchLower) ||
        job.description?.toLowerCase().includes(searchLower) ||
        job.client?.fullName?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.projectType) {
      filtered = filtered.filter(job => job.projectType === filters.projectType);
    }

    if (filters.location) {
      filtered = filtered.filter(job => job.workLocation?.includes(filters.location));
    }

    if (filters.status) {
      filtered = filtered.filter(job => job.status === filters.status);
    }

    if (filters.budgetMin || filters.budgetMax) {
      filtered = filtered.filter(job => {
        const budgetMatch = job.budgetRange || job.budget;
        if (!budgetMatch) return true;
        
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

    if (filters.skills.length > 0) {
      filtered = filtered.filter(job => {
        const jobSkills = job.requiredSkills || [];
        return filters.skills.some(skill => jobSkills.includes(skill));
      });
    }

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
    try {
      const response = await api.get('/onboarding/status');
      if (!response.data.profileCompleted) {
        toast.error('Please complete your profile before applying to jobs');
        setTimeout(() => {
          window.location.href = '/freelancer/onboarding';
        }, 2000);
        return;
      }
      
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
    
    try {
      await api.post(`/jobs/${job.id}/view`);
    } catch (error) {
      console.error('Failed to track job view:', error);
    }
  };

  const submitApplication = async (e) => {
    e.preventDefault();
    
    if (!cvFile) {
      toast.error('Please upload your CV');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('jobId', selectedJob.id);
      formData.append('proposalMessage', applicationData.proposalMessage);
      formData.append('proposedBudget', applicationData.proposedBudget);
      formData.append('portfolioLink', applicationData.portfolioLink);
      formData.append('cv', cvFile);

      await api.post('/applications', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success('Application submitted successfully!');
      setShowModal(false);
      setCvFile(null);
      setApplicationData({ proposalMessage: '', proposedBudget: '', portfolioLink: '' });
      fetchJobs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit application');
    }
  };

  const handleSkillChange = (e) => {
    const value = e.target.value;
    if (value && !filters.skills.includes(value)) {
      setFilters(prev => ({ ...prev, skills: [...prev.skills, value] }));
    }
  };

  const removeSkill = (skillToRemove) => {
    setFilters(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const formatBudget = (budget) => {
    if (!budget) return 'N/A';
    if (budget.includes('$')) return budget;
    const parts = budget.split('-').map(p => p.trim());
    if (parts.length === 2) {
      return `$${parts[0]} - $${parts[1]}`;
    }
    return `$${budget}`;
  };

  const FilterInputs = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div>
        <label className="block text-xs font-medium mb-1.5 text-slate-600 dark:text-slate-400">Project Type</label>
        <select 
          value={filters.projectType} 
          onChange={(e) => setFilters({ ...filters, projectType: e.target.value })}
          className={`w-full px-3 py-2 text-sm border rounded-lg outline-none transition ${dark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
        >
          <option value="">All Types</option>
          {uniqueProjectTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium mb-1.5 text-slate-600 dark:text-slate-400">Location</label>
        <select 
          value={filters.location} 
          onChange={(e) => setFilters({ ...filters, location: e.target.value })}
          className={`w-full px-3 py-2 text-sm border rounded-lg outline-none transition ${dark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
        >
          <option value="">All Locations</option>
          {uniqueLocations.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium mb-1.5 text-slate-600 dark:text-slate-400">Budget Range ($)</label>
        <div className="flex items-center gap-2">
          <input 
            type="number" 
            placeholder="Min" 
            value={filters.budgetMin}
            onChange={(e) => setFilters({ ...filters, budgetMin: e.target.value })}
            className={`w-full px-3 py-2 text-sm border rounded-lg outline-none transition ${dark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
          />
          <span className="text-slate-400 text-xs">-</span>
          <input 
            type="number" 
            placeholder="Max" 
            value={filters.budgetMax}
            onChange={(e) => setFilters({ ...filters, budgetMax: e.target.value })}
            className={`w-full px-3 py-2 text-sm border rounded-lg outline-none transition ${dark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium mb-1.5 text-slate-600 dark:text-slate-400">Sort By</label>
        <select 
          value={filters.sortBy} 
          onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
          className={`w-full px-3 py-2 text-sm border rounded-lg outline-none transition ${dark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
        >
          <option value="newest">Newest First</option>
          <option value="most-recent">Most Recent</option>
          <option value="most-viewed">Most Viewed</option>
          <option value="highest-budget">Highest Budget</option>
        </select>
      </div>

      <div className="lg:col-span-2">
        <label className="block text-xs font-medium mb-1.5 text-slate-600 dark:text-slate-400">Filter Skills</label>
        <select 
          onChange={handleSkillChange} 
          value=""
          className={`w-full px-3 py-2 text-sm border rounded-lg outline-none transition ${dark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
        >
          <option value="">Select skill to add filter...</option>
          {uniqueSkills.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
    </div>
  );

  return (
    <div className={`flex min-h-screen ${dark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />

      <div className="flex-1 lg:ml-64">
        {/* Responsive Header Bar */}
        <header className={`sticky top-0 z-20 border-b backdrop-blur-md transition-colors ${dark ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'}`}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {/* Mobile Sidebar Hamburger Trigger */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-lg border bg-slate-100 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 transition"
                aria-label="Open Mobile Menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white truncate">
                  Explore Opportunities
                </h1>
                <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Find and apply for open client contracts
                </p>
              </div>
            </div>

            {/* Compact Live Status Badge */}
            <div className={`flex-shrink-0 flex items-center gap-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full border text-xs font-semibold shadow-sm ${
              dark 
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400' 
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>
                <strong className="font-bold">{filteredJobs.length}</strong> 
                <span className="hidden sm:inline"> {filteredJobs.length === 1 ? 'Job' : 'Jobs'} Available</span>
                <span className="sm:hidden"> Jobs</span>
              </span>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 pb-24">
          
          {/* Mobile Search & Filter Switch */}
          <div className="md:hidden space-y-3 mb-6">
            <div className="relative">
              <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text" 
                placeholder="Search jobs or skills..." 
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className={`w-full pl-9 pr-4 py-2.5 text-sm border rounded-xl outline-none shadow-sm ${dark ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'}`}
              />
            </div>

            <button 
              onClick={() => setShowMobileFilterDrawer(true)}
              className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border font-semibold text-xs transition shadow-sm ${
                activeFilterCount > 0 
                  ? 'bg-emerald-600 border-emerald-600 text-white' 
                  : dark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>
          </div>

          {/* Desktop Filter Panel */}
          <div className={`hidden md:block rounded-xl p-5 mb-8 shadow-sm border transition-colors ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'}`}>
            <div className="flex items-center justify-between border-b pb-4 mb-4 border-slate-200 dark:border-slate-800">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Search & Filters</h2>
              <button 
                onClick={() => setFilters({ search: '', projectType: '', location: '', status: 'open', budgetMin: '', budgetMax: '', sortBy: 'newest', skills: [] })}
                className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Reset Filters
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium mb-1.5 text-slate-600 dark:text-slate-400">Keywords</label>
              <div className="relative">
                <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input 
                  type="text" 
                  placeholder="Search by title, skill, or client..." 
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className={`w-full pl-9 pr-4 py-2 text-sm border rounded-lg outline-none transition focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${dark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50/50 border-slate-200 text-slate-900 placeholder-slate-400'}`}
                />
              </div>
            </div>

            <FilterInputs />

            {filters.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                {filters.skills.map((skill) => (
                  <span key={skill} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800">
                    {skill}
                    <button onClick={() => removeSkill(skill)} className="hover:text-emerald-900 dark:hover:text-emerald-100">&times;</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Job Listings Grid */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className={`p-5 rounded-xl border animate-pulse ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map(job => (
                <motion.article 
                  key={job.id} 
                  initial={{ opacity: 0, y: 12 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-5 sm:p-6 rounded-xl border transition-all duration-200 ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80 shadow-sm'}`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <img 
                        src={job.client?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(job.client?.fullName || 'Client')}&background=0284c7&color=fff`}
                        alt={job.client?.fullName || 'Client'} 
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-800 flex-shrink-0" 
                      />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-snug">{job.title}</h3>
                          {job.status && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800">
                              {job.status}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                          {job.client?.fullName && <span>{job.client.fullName}</span>}
                          {job.client?.fullName && job.workLocation && <span>•</span>}
                          {job.workLocation && <span>{job.workLocation}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:flex-col md:items-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                      <span className="text-xs text-slate-500 md:hidden">Budget</span>
                      <p className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                        {formatBudget(job.budgetRange || job.budget)}
                      </p>
                    </div>
                  </div>

                  {job.description && (
                    <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>
                  )}

                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-1.5">
                      {job.requiredSkills?.slice(0, 4).map((skill, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 pt-2 sm:pt-0">
                      <button 
                        onClick={() => handleLearnMore(job)} 
                        className={`flex-1 sm:flex-none px-4 py-2 text-xs font-semibold rounded-lg border transition ${dark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-50'}`}
                      >
                        Details
                      </button>
                      <button 
                        onClick={() => handleApply(job)} 
                        className="flex-1 sm:flex-none px-5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
                      >
                        Apply Now
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}

          {jobs.length === 0 && !loading && (
            <div className={`text-center py-16 rounded-xl border ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">No active job postings</h3>
              <p className="text-xs text-slate-500 mt-1">Check back later or try adjusting your search criteria.</p>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filter Slide-over Drawer */}
      <AnimatePresence>
        {showMobileFilterDrawer && (
          <div className="fixed inset-0 z-50 md:hidden flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilterDrawer(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`relative z-10 w-full max-w-xs h-full p-5 overflow-y-auto shadow-2xl flex flex-col justify-between ${dark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}
            >
              <div>
                <div className="flex items-center justify-between border-b pb-4 mb-4 border-slate-200 dark:border-slate-800">
                  <h2 className="text-base font-bold">Filter Jobs</h2>
                  <button onClick={() => setShowMobileFilterDrawer(false)} className="p-1 rounded-lg text-slate-400">
                    &times;
                  </button>
                </div>

                <FilterInputs />

                {filters.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {filters.skills.map((skill) => (
                      <span key={skill} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300">
                        {skill}
                        <button onClick={() => removeSkill(skill)}>&times;</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex gap-2">
                <button 
                  onClick={() => setFilters({ search: '', projectType: '', location: '', status: 'open', budgetMin: '', budgetMax: '', sortBy: 'newest', skills: [] })}
                  className="flex-1 py-2.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700"
                >
                  Reset
                </button>
                <button 
                  onClick={() => setShowMobileFilterDrawer(false)}
                  className="flex-1 py-2.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Details Modal */}
      {showJobDetails && selectedJob && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            className={`rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex items-start justify-between border-b pb-4 mb-5 border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedJob.title}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{selectedJob.client?.fullName || 'Client'} • {selectedJob.workLocation || 'Remote'}</p>
              </div>
              <button onClick={() => setShowJobDetails(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                &times;
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Budget</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{formatBudget(selectedJob.budgetRange || selectedJob.budget)}</p>
              </div>

              {selectedJob.description && (
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Description</span>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 whitespace-pre-wrap leading-relaxed">{selectedJob.description}</p>
                </div>
              )}

              {selectedJob.requiredSkills?.length > 0 && (
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Required Skills</span>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {selectedJob.requiredSkills.map((skill, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs font-medium">{skill}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex gap-3">
                <button onClick={() => setShowJobDetails(false)} className={`flex-1 py-2.5 text-xs font-semibold rounded-lg border ${dark ? 'border-slate-700 text-slate-300' : 'border-slate-300 text-slate-700'}`}>Close</button>
                <button onClick={() => { setShowJobDetails(false); handleApply(selectedJob); }} className="flex-1 py-2.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition">Apply for Job</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Application Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            className={`rounded-xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Apply for <span className="text-emerald-600 dark:text-emerald-400">{selectedJob?.title}</span>
            </h2>

            <form onSubmit={submitApplication} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5 text-slate-700 dark:text-slate-300">Proposal Message *</label>
                <textarea 
                  value={applicationData.proposalMessage} 
                  onChange={(e) => setApplicationData({ ...applicationData, proposalMessage: e.target.value })}
                  required 
                  rows={4} 
                  placeholder="Explain why you're a great fit for this project..."
                  className={`w-full px-3 py-2 text-sm border rounded-lg outline-none transition focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${dark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50/50 border-slate-200 text-slate-900'}`} 
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5 text-slate-700 dark:text-slate-300">Proposed Budget *</label>
                <input 
                  type="text" 
                  value={applicationData.proposedBudget} 
                  onChange={(e) => setApplicationData({ ...applicationData, proposedBudget: e.target.value })}
                  required 
                  placeholder="e.g. $500"
                  className={`w-full px-3 py-2 text-sm border rounded-lg outline-none transition focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${dark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50/50 border-slate-200 text-slate-900'}`} 
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5 text-slate-700 dark:text-slate-300">Portfolio Link</label>
                <input 
                  type="url" 
                  value={applicationData.portfolioLink} 
                  onChange={(e) => setApplicationData({ ...applicationData, portfolioLink: e.target.value })}
                  placeholder="https://..."
                  className={`w-full px-3 py-2 text-sm border rounded-lg outline-none transition focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${dark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50/50 border-slate-200 text-slate-900'}`} 
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5 text-slate-700 dark:text-slate-300">CV / Resume (PDF) *</label>
                <input 
                  type="file" 
                  accept=".pdf"
                  onChange={(e) => setCvFile(e.target.files[0])}
                  required 
                  className={`w-full px-3 py-2 text-sm border rounded-lg outline-none transition ${dark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50/50 border-slate-200 text-slate-700'}`} 
                />
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)} 
                  className={`flex-1 py-2.5 text-xs font-semibold rounded-lg border ${dark ? 'border-slate-700 text-slate-300' : 'border-slate-300 text-slate-700'}`}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition"
                >
                  Submit Application
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