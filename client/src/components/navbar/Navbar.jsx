import { useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Bell, Briefcase, Search, MessageCircle, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import api from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const profileMenuRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchNotifications();

      const interval = setInterval(() => {
        fetchNotifications();
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      const notifs = response.data.notifications || [];
      setNotifications(notifs.slice(0, 10));
      setUnreadCount(notifs.filter(n => !n.read).length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    setShowNotifications(false);

    if (notification.type === 'job_match') {
      navigate(`/${user.role}/jobs`);
    } else if (notification.type === 'new_post') {
      navigate(`/${user.role}/feed`);
    } else if (notification.type === 'message') {
      navigate(`/${user.role}/messages`);
    } else if (notification.type === 'application') {
      navigate('/client/my-jobs');
    } else if (notification.type === 'like' || notification.type === 'comment') {
      navigate(`/${user.role}/feed`);
    } else if (notification.type === 'follow') {
      navigate(`/profile/${notification.senderId}`);
    } else if (notification.type === 'application_accepted') {
      navigate(`/${user.role}/applications`);
    } else if (notification.type === 'application_rejected') {
      navigate(`/${user.role}/applications`);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchInput.trim())}`);
      setSearchInput('');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'job_match':
      case 'application':
        return <Briefcase className="w-5 h-5 text-yellow-600" />;
      case 'message':
        return <MessageCircle className="w-5 h-5 text-blue-600" />;
      case 'admin_broadcast':
      case 'admin_message':
        return <Bell className="w-5 h-5 text-emerald-600" />;
      default:
        return <Bell className="w-5 h-5 text-[#00564C]" />;
    }
  };

  const getNotificationText = (notification) => {
    switch (notification.type) {
      case 'job_match':
        return `New job matches your skills: ${notification.data?.jobTitle || 'Check it out'}`;
      case 'new_post':
        return `${notification.fromUser?.fullName || 'Someone'} posted something new`;
      case 'like':
        return `${notification.fromUser?.fullName || 'Someone'} liked your post`;
      case 'comment':
        return `${notification.fromUser?.fullName || 'Someone'} commented on your post`;
      case 'application':
        return `${notification.fromUser?.fullName || 'Someone'} applied for your job`;
      case 'message':
        return `New message from ${notification.fromUser?.fullName || 'someone'}`;
      case 'follow':
        return `${notification.fromUser?.fullName || 'Someone'} started following you`;
      case 'application_accepted':
        return `Your application was accepted!`;
      case 'application_rejected':
        return `Your application was not selected`;
      case 'admin_broadcast':
      case 'admin_message':
        return notification.title ? `${notification.title}: ${notification.message}` : notification.message || 'Message from AfroTask Admin';
      default:
        return notification.message || 'New notification';
    }
  };

  return (
    <nav className="bg-[#00564C] dashboard-navbar text-white py-4 px-6 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between first-line:items-center pl-8 lg:pl-0 md:pl-12">
        {user && (
          <form onSubmit={handleSearch} className="flex-1 max-w-36 md:max-w-sm lg:max-w-md mx-4">
            <div className="relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search posts, jobs, people..."
                className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-4 pl-10 text-white placeholder-white/50 focus:outline-none focus:border-white/40 transition"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
            </div>
          </form>
        )}

        {user ? (
          <div className="flex items-center justify-end gap-2 md:gap-4 md:ml-12">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 hover:bg-white/10 rounded-lg transition"
              >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute lg:right-0 md:right-0 -right-32 mt-2  w-screen md:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto"
                  >
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-xs text-[#00564C] hover:text-[#003F38] font-medium"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>No notifications yet</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`p-4 hover:bg-gray-50 cursor-pointer transition ${
                              !notification.read ? 'bg-blue-50' : ''
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              {getNotificationIcon(notification.type)}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-500">
                                  {getNotificationText(notification)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(notification.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile avatar dropdown */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-1.5 p-1 pr-2 hover:bg-white/10 rounded-full transition"
              >
                <img
                  src={user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}`}
                  alt={user?.fullName}
                  className="w-8 h-8 rounded-full object-cover border-2 border-white/20"
                />
                <ChevronDown className={`w-4 h-4 text-white/70 transition-transform hidden sm:block ${showProfileMenu ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50"
                  >
                    <div className="px-4 py-2.5 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user?.fullName}</p>
                      <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                    </div>

                    <button
                      onClick={() => { setShowProfileMenu(false); navigate(`/${user.role}/profile`); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                      <User className="w-4 h-4 text-gray-400" />
                      View Profile
                    </button>
                    <button
                      onClick={() => { setShowProfileMenu(false); navigate('/settings'); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                      <Settings className="w-4 h-4 text-gray-400" />
                      Settings
                    </button>

                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={() => { setShowProfileMenu(false); logout(); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
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
        ) : (
          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/welcome')} className="hover:text-green-200 transition">Explore</button>
            <button onClick={() => navigate('/login')} className="hover:text-green-200 transition">Log in</button>
            <button
              onClick={() => navigate('/')}
              className="bg-[#00564C] hover:bg-[#003F38] px-6 py-2 rounded-lg transition"
            >
              Sign up
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;