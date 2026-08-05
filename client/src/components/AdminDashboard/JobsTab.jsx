import { motion } from 'framer-motion';
import { Briefcase, Trash2 } from 'lucide-react';

export default function JobsTab({ loading, filteredJobs, onDeleteJob }) {
  return (
    <div>
      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 rounded-2xl bg-white/[0.03] animate-pulse" />)}</div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-7 h-7 text-gray-600" />
          </div>
          <p className="text-gray-500 text-sm">No jobs found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredJobs.map((job, i) => (
            <motion.div key={job.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 px-3 md:px-5 py-3 md:py-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition group">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-4 h-4 text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">{job.title}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${job.status === 'open' ? 'bg-green-500/15 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                    {job.status?.toUpperCase()}
                  </span>
                  {job.budgetRange && <span className="text-xs text-gray-600">{job.budgetRange}</span>}
                </div>
              </div>
              <button onClick={() => onDeleteJob(job.id)}
                className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition md:opacity-0 md:group-hover:opacity-100 flex-shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
