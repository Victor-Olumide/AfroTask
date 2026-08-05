import { Users, TrendingUp, Activity, Briefcase, BarChart2, FileText } from 'lucide-react';
import StatCard from './StatCard';

export default function AdminOverview({ stats, onAction }) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={Users} label="Total Users" value={stats?.totalUsers} gradient="bg-blue-500" delay={0} />
        <StatCard icon={TrendingUp} label="Freelancers" value={stats?.freelancers} gradient="bg-emerald-500" delay={0.05} />
        <StatCard icon={Activity} label="Clients" value={stats?.clients} gradient="bg-yellow-500" delay={0.1} />
        <StatCard icon={Briefcase} label="Total Jobs" value={stats?.totalJobs} gradient="bg-purple-500" delay={0.15} />
        <StatCard icon={BarChart2} label="Projects" value={stats?.totalProjects} gradient="bg-pink-500" delay={0.2} />
        <StatCard icon={FileText} label="Blog Posts" value={stats?.totalBlogs} gradient="bg-[#00564C]" delay={0.25} />
      </div>
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
        <p className="text-white font-semibold mb-4 text-sm">Quick Actions</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Manage Blogs', color: 'emerald', action: () => onAction('blogs') },
            { label: 'View Users', color: 'blue', action: () => onAction('users') },
            { label: 'View Posts', color: 'purple', action: () => onAction('posts') },
            { label: 'Broadcast', color: 'yellow', action: () => onAction('broadcast') },
          ].map(({ label, color, action }) => (
            <button key={label} onClick={action}
              className={`py-3 px-4 rounded-xl text-sm font-medium transition border
                ${color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' : ''}
                ${color === 'blue' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20' : ''}
                ${color === 'purple' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20' : ''}
                ${color === 'yellow' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20' : ''}
              `}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
