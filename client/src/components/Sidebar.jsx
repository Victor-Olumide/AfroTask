import { useContext, useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Briefcase, FileText, FolderOpen, CheckCircle,
  User, PlusCircle, Search, MessageSquare, X, BookOpen,
  Bookmark, Settings, LogOut, ChevronUp, Menu
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useDarkMode } from '../context/DarkModeContext';

const Sidebar = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  const { dark } = useDarkMode();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);


  const isControlled = isMobileMenuOpen !== undefined && setIsMobileMenuOpen !== undefined;
  const [internalMobileOpen, setInternalMobileOpen] = useState(false);
  const mobileOpen = isControlled ? isMobileMenuOpen : internalMobileOpen;
  const setMobileOpen = isControlled ? setIsMobileMenuOpen : setInternalMobileOpen;

  const isFreelancer = user?.role === 'freelancer';

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const freelancerMenu = [
    { name: 'Feed', path: '/freelancer/feed', icon: Home },
    { name: 'Explore Jobs', path: '/freelancer/jobs', icon: Search },
    { name: 'My Applications', path: '/freelancer/applications', icon: FileText },
    { name: 'Ongoing Projects', path: '/freelancer/projects/ongoing', icon: FolderOpen },
    { name: 'Completed Projects', path: '/freelancer/projects/completed', icon: CheckCircle },
    { name: 'Create Post', path: '/freelancer/create-post', icon: PlusCircle },
    { name: 'Messages', path: '/freelancer/messages', icon: MessageSquare },
    { name: 'Bookmarks', path: '/freelancer/bookmarks', icon: Bookmark },
    { name: 'Earnings', path: '/freelancer/earnings', icon: Bookmark },
    { name: 'Profile', path: '/freelancer/profile', icon: User }
  ];

  const clientMenu = [
    { name: 'Feed', path: '/client/feed', icon: Home },
    { name: 'Post Job', path: '/client/post-job', icon: PlusCircle },
    { name: 'Create Post', path: '/client/create-post', icon: PlusCircle },
    { name: 'My Jobs', path: '/client/jobs', icon: Briefcase },
    { name: 'Ongoing Projects', path: '/client/projects/ongoing', icon: FolderOpen },
    { name: 'Completed Projects', path: '/client/projects/completed', icon: CheckCircle },
    { name: 'Messages', path: '/client/messages', icon: MessageSquare },
    { name: 'Bookmarks', path: '/client/bookmarks', icon: Bookmark },
    { name: 'Blog', path: '/blogs', icon: BookOpen },
    { name: 'Profile', path: '/client/profile', icon: User }
  ];

  const menuItems = isFreelancer ? freelancerMenu : clientMenu;
  const activeColor = 'bg-[#00564C]';
  const hoverColor = dark ? 'hover:bg-slate-800' : 'hover:bg-[#E6F0EF]';

  const handleNavigation = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const sidebarInner = (
    <div className="flex flex-col h-full">
      <div className={`p-5 border-b flex items-center justify-between ${dark ? 'border-slate-800' : 'border-gray-200'}`}>
        {!isCollapsed && (
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavigation('/')}>
            <img src="/img/afro-task-logo.png" alt="Afro Task" className="h-9 w-auto" />
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`hidden lg:flex p-2 rounded-lg transition ${dark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-gray-100 text-gray-500'}`}
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <button
          onClick={() => setMobileOpen(false)}
          className={`lg:hidden p-2 rounded-lg ${dark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-gray-100 text-gray-700'}`}
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <motion.button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                whileHover={{ x: isCollapsed ? 0 : 4 }}
                whileTap={{ scale: 0.98 }}
                title={isCollapsed ? item.name : undefined}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isCollapsed ? 'justify-center' : ''
                } ${
                  isActive
                    ? `${activeColor} text-white shadow-md`
                    : dark ? `text-slate-300 ${hoverColor}` : `text-gray-700 ${hoverColor}`
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span>{item.name}</span>}
              </motion.button>
            );
          })}
        </div>
      </nav>

      <div className={`p-4 border-t ${dark ? 'border-slate-800' : 'border-gray-200'}`} ref={profileMenuRef}>
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className={`w-full flex items-center gap-3 p-2 rounded-xl transition ${
              dark ? 'hover:bg-slate-800' : 'hover:bg-gray-50'
            } ${isCollapsed ? 'justify-center' : ''}`}
          >
            <img
              src={user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}`}
              alt={user?.fullName}
              className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-[#00564C]/30"
            />
            {!isCollapsed && (
              <>
                <div className="flex-1 min-w-0 text-left">
                  <p className={`text-sm font-semibold truncate ${dark ? 'text-white' : 'text-gray-900'}`}>{user?.fullName || 'User'}</p>
                  <p className="text-xs text-gray-400 capitalize">{user?.role || 'Member'}</p>
                </div>
                <ChevronUp className={`w-4 h-4 text-gray-400 transition-transform ${showProfileMenu ? '' : 'rotate-180'}`} />
              </>
            )}
          </button>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className={`absolute bottom-full mb-2 w-56 rounded-xl shadow-xl border py-2 z-50 ${
                  dark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-gray-100 text-gray-700'
                } ${isCollapsed ? 'left-0' : 'left-0 right-0'}`}
              >
                <button
                  onClick={() => { setShowProfileMenu(false); handleNavigation(`/${user?.role || 'freelancer'}/profile`); }}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-xs font-medium transition ${dark ? 'hover:bg-slate-800' : 'hover:bg-gray-50'}`}
                >
                  <User className="w-4 h-4 text-gray-400" />
                  View Profile
                </button>
                <button
                  onClick={() => { setShowProfileMenu(false); handleNavigation('/settings'); }}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-xs font-medium transition ${dark ? 'hover:bg-slate-800' : 'hover:bg-gray-50'}`}
                >
                  <Settings className="w-4 h-4 text-gray-400" />
                  Settings
                </button>
                <div className={`border-t mt-1 pt-1 ${dark ? 'border-slate-800' : 'border-gray-100'}`}>
                  <button
                    onClick={() => { setShowProfileMenu(false); logout(); }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <div
        className={`hidden lg:flex flex-col fixed left-0 top-0 h-screen border-r z-40 transition-all duration-200 ${
          dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
        } ${isCollapsed ? 'w-20' : 'w-64'}`}
      >
        {sidebarInner}
      </div>

      {/* Mobile hamburger trigger — fixed so it stays reachable even after scrolling past the navbar */}
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
        className="lg:hidden fixed top-4 left-4 z-40 p-2.5 rounded-xl bg-[#00564C] hover:bg-[#003F38] text-white shadow-lg ring-1 ring-white/20"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`relative z-10 h-full w-64 border-r shadow-2xl flex flex-col ${
                dark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200 text-slate-900'
              }`}
            >
              {sidebarInner}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;