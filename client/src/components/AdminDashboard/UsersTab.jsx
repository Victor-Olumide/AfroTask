import { motion } from 'framer-motion';
import { Eye, Send, Trash2 } from 'lucide-react';

export default function UsersTab({ loading, filteredUsers, search, setSearch, navigate, onBroadcastUser, onDeleteUser }) {
  return (
    <div>
      <div className="relative mb-6">
        <div className="relative mb-5">
          <div className="relative mb-5">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="w-full pl-4 pr-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#00564C]/50 text-sm transition"
            />
          </div>
        </div>
      </div>
      {loading ? (
        <div className="space-y-2">{[...Array(6)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-white/[0.03] animate-pulse" />)}</div>
      ) : (
        <>
          <div className="md:hidden space-y-2">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-gray-600 text-sm">No users found</div>
            ) : filteredUsers.map((u, i) => (
              <motion.div key={u.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="flex items-center gap-3 p-3 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
                <img
                  src={u.role === 'admin' ? '/img/afro-task.png' : (u.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.fullName || 'U')}&background=00564C&color=fff`) }
                  alt={u.fullName}
                  className="w-10 h-10 rounded-full object-cover ring-1 ring-white/10 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{u.fullName}</p>
                  <p className="text-gray-500 text-xs truncate">{u.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      u.role === 'freelancer' ? 'bg-emerald-500/15 text-emerald-400' :
                      u.role === 'client' ? 'bg-yellow-500/15 text-yellow-400' : 'bg-purple-500/15 text-purple-400'
                    }`}>{u.role}</span>
                    <span className="text-gray-600 text-[10px]">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => navigate(u.role === 'admin' ? `/admin/profile/${u.id}` : `/profile/${u.id}`)}
                    className="p-2 text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition" title="View profile">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button onClick={() => onBroadcastUser(u.id, u.fullName)}
                    className="p-2 text-gray-500 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition" title="Message">
                    <Send className="w-4 h-4" />
                  </button>
                  <button onClick={() => onDeleteUser(u.id)}
                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="hidden md:block rounded-2xl border border-white/[0.06] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {['User', 'Role', 'Joined', 'Last Seen', ''].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u, i) => (
                  <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="border-b border-white/[0.04] hover:bg-white/[0.03] transition group">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img src={u.role === 'admin' ? '/img/afro-task.png' : (u.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.fullName || 'U')}&background=00564C&color=fff`) }
                          alt={u.fullName} className="w-8 h-8 rounded-full object-cover ring-1 ring-white/10" />
                        <div>
                          <p className="text-white text-sm font-medium">{u.fullName}</p>
                          <p className="text-gray-600 text-xs">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        u.role === 'freelancer' ? 'bg-emerald-500/15 text-emerald-400' :
                        u.role === 'client' ? 'bg-yellow-500/15 text-yellow-400' : 'bg-purple-500/15 text-purple-400'
                      }`}>{u.role}</span>
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button onClick={() => navigate(u.role === 'admin' ? `/admin/profile/${u.id}` : `/profile/${u.id}`)}
                          className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition" title="View profile">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => onBroadcastUser(u.id, u.fullName)}
                          className="p-1.5 text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition" title="Send notification">
                          <Send className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => onDeleteUser(u.id)}
                          className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && <div className="text-center py-12 text-gray-600 text-sm">No users found</div>}
          </div>
        </>
      )}
    </div>
  );
}
