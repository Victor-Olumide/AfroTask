/**
 * Job announcement card — used inline in the feed when a post is a job listing.
 * job shape: { id, title, budgetRange, contractType, projectType }
 */
const JobAnnouncementCard = ({ job, onView }) => {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4">
      <span className="text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
        Job posted
      </span>

      <h4 className="text-[15px] font-semibold text-gray-900 mt-2 mb-1 line-clamp-2">
        {job.title}
      </h4>

      <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
        <span className="font-medium text-gray-700">{job.budgetRange}</span>
        {job.contractType && (
          <>
            <span>·</span>
            <span>{job.contractType}</span>
          </>
        )}
        {job.projectType && (
          <>
            <span>·</span>
            <span>{job.projectType}</span>
          </>
        )}
      </div>

      <button
        onClick={() => onView?.(job.id)}
        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
      >
        View job
      </button>
    </div>
  );
};

export default JobAnnouncementCard;