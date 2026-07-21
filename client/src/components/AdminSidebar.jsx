import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Briefcase, FileText, BarChart2, LogOut,
  MessageSquare, User, ChevronRight, Megaphone, Menu, X, Star,
} from 'lucide-react';
import { FaPager } from "react-icons/fa";
import { AnimatePresence, motion } from 'framer-motion';

const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart2 },
  { id: 'blogs', label: 'Blogs', icon: FileText },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'jobs', label: 'Jobs', icon: Briefcase },
  { id: 'posts', label: 'Posts', icon: FaPager },
  { id: 'reviews', label: 'Reviews', icon: Star },
  { id: 'chats', label: 'Chats', icon: MessageSquare },
  { id: 'profile', label: 'My Profile', icon: User },
];

function SidebarContent({ user, tab, setTab, setSearch, logout, onBroadcast, onClose }) {
  const navigate = useNavigate();

  const handleTabClick = (id) => {
    if (id === 'profile') {
      navigate(`/admin/profile/${user?.id}`);
    } else if (id === 'chats') {
      navigate('/admin/messages');
    } else {
      setTab(id);
      setSearch('');
    }
    onClose?.();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Grid bg */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '32px 32px' }} />

      {/* Logo */}
      <div className="relative z-10 p-5 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg shadow-[#00564C]/30">
            <img src="/img/afro-task-logo.png" alt="AfroTask" className="rounded-xl h-full w-auto" />
          </div>
          <div>
            <p className="font-bold text-white text-sm leading-none">AfroTask</p>
            <p className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-widest">Admin Panel</p>
          </div>
        </div>
        {/* Close button — mobile only */}
        {onClose && (
          <button onClick={onClose} className="md:hidden p-1.5 text-gray-500 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex-1 p-3 space-y-0.5 overflow-y-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => handleTabClick(id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              tab === id
                ? 'bg-[#00564C]/20 text-emerald-400 border border-[#00564C]/30'
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.04]'
            }`}>
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
            {tab === id && <ChevronRight className="w-3 h-3 ml-auto" />}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="relative z-10 p-3 border-t border-white/[0.06] space-y-1">
        <button onClick={onBroadcast}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:text-yellow-400 hover:bg-yellow-500/[0.08] transition">
          <Megaphone className="w-4 h-4" />
          Broadcast
        </button>
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
          <div className="w-7 h-7 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
            <img src="/img/afro-task-logo.png" alt="AfroTask" className="rounded-lg h-full w-auto" />
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-medium truncate">{user?.fullName || 'Admin'}</p>
            <p className="text-gray-600 text-[10px] truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:text-red-400 hover:bg-red-500/[0.08] transition">
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}

export default function AdminSidebar({ user, tab, setTab, setSearch, logout, onBroadcast }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* ── Desktop sidebar (always visible ≥ md) ── */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-60 flex-col z-30 border-r border-white/[0.06] bg-gray-900">
        <SidebarContent
          user={user} tab={tab} setTab={setTab}
          setSearch={setSearch} logout={logout} onBroadcast={onBroadcast}
        />
      </aside>

      {/* ── Mobile hamburger button ── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 rounded-xl bg-gray-800 border border-white/[0.08] text-gray-400 hover:text-white transition shadow-lg"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="md:hidden fixed inset-0 bg-black/60 z-40"
            />

            {/* Drawer */}
            <motion.aside
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="md:hidden fixed inset-y-0 left-0 w-64 z-50 bg-gray-900 border-r border-white/[0.06] flex flex-col"
            >
              <SidebarContent
                user={user} tab={tab} setTab={setTab}
                setSearch={setSearch} logout={logout} onBroadcast={onBroadcast}
                onClose={() => setMobileOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
