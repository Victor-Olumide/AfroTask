import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { useDarkMode } from '../context/DarkModeContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/navbar/Navbar';

const PostJob = () => {
  const { logout } = useContext(AuthContext);
  const { dark } = useDarkMode();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budgetRange: '',
    requiredSkills: [],
    projectType: '',
    workLocation: '',
    deadline: ''
  });
  const [skillInput, setSkillInput] = useState('');

  const addSkill = () => {
    if (skillInput.trim() && !formData.requiredSkills.includes(skillInput.trim())) {
      setFormData({ ...formData, requiredSkills: [...formData.requiredSkills, skillInput.trim()] });
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => {
    setFormData({ ...formData, requiredSkills: formData.requiredSkills.filter(s => s !== skill) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/jobs', formData);
      toast.success('Job posted successfully!');
      navigate('/client/jobs');
    } catch (error) {
      toast.error('Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00564C] focus:border-transparent ${
    dark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'
  }`;
  const labelCls = `block text-sm font-medium mb-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`;

  return (
    <div className={`flex min-h-screen ${dark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Sidebar />

      <div className="w-screen lg:flex-1 lg:ml-64">
        <Navbar />

        <div className="lg:p-8 p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <h1 className={`text-3xl font-bold mb-8 ${dark ? 'text-white' : 'text-gray-800'}`}>Post a Project</h1>

            <div className={`${dark ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg lg:p-8 p-4`}>
              <form onSubmit={handleSubmit} className="space-y-6">

                <div>
                  <label className={labelCls}>Project Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className={inputCls}
                    placeholder="e.g., Build a responsive website"
                  />
                </div>

                <div>
                  <label className={labelCls}>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={6}
                    className={inputCls}
                    placeholder="Describe your project in detail..."
                  />
                </div>

                <div>
                  <label className={labelCls}>Budget Range</label>
                  <input
                    type="text"
                    value={formData.budgetRange}
                    onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                    required
                    className={inputCls}
                    placeholder="e.g., $500 - $2000"
                  />
                </div>

                <div>
                  <label className={labelCls}>Required Skills</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      className={inputCls}
                      placeholder="Add a skill and press Enter"
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="px-6 py-3 bg-[#00564C] hover:bg-[#003F38] text-white rounded-lg transition"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.requiredSkills.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-[#E6F0EF] text-[#00564C] rounded-lg text-sm flex items-center gap-2">
                        {skill}
                        <button type="button" onClick={() => removeSkill(skill)} className="text-[#00564C] hover:text-[#003F38]">×</button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Project Type</label>
                  <select
                    value={formData.projectType}
                    onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                    required
                    className={inputCls}
                  >
                    <option value="">Select type</option>
                    <option value="Fixed Price">Fixed Price</option>
                    <option value="Hourly">Hourly</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Work Location</label>
                  <select
                    value={formData.workLocation}
                    onChange={(e) => setFormData({ ...formData, workLocation: e.target.value })}
                    required
                    className={inputCls}
                  >
                    <option value="">Select location type</option>
                    <option value="Remote">Remote</option>
                    <option value="Onsite">Onsite</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Deadline</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    required
                    className={inputCls}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => navigate('/client/dashboard')}
                    className={`flex-1 px-6 py-3 border rounded-lg transition ${
                      dark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-[#00564C] hover:bg-[#003F38] text-white rounded-lg transition disabled:opacity-50"
                  >
                    {loading ? 'Posting...' : 'Post Job'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PostJob;