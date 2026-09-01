import { useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Bell, Briefcase, Search, MessageCircle, LogOut } from 'lucide-react';
import api from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const BRAND = '#00564C';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const panelRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const onClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      const notifs = response.data.notifications || [];
      setNotifications(notifs.slice(0, 10));
      setUnreadCount(notifs.filter((n) => !n.read).length);
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
        return <Briefcase className="w-4 h-4" style={{ color: BRAND }} />;
      case 'message':
        return <MessageCircle className="w-4 h-4 text-blue-600" />;
      case 'admin_broadcast':
      case 'admin_message':
        return <Bell className="w-4 h-4 text-amber-600" />;
      default:
        return <Bell className="w-4 h-4" style={{ color: BRAND }} />;
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
        return 'Your application was accepted';
      case 'application_rejected':
        return 'Your application was not selected';
      case 'admin_broadcast':
      case 'admin_message':
        return notification.title ? `${notification.title}: ${notification.message}` : notification.message || 'Message from AfroTask Admin';
      default:
        return notification.message || 'New notification';
    }
  };

  return (
    <nav className="bg-white border-b border-gray-100 fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 pl-16 pr-4 py-3 lg:pl-6">
        {user && (
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search posts, jobs, people"
                className="w-full bg-gray-50 border border-gray-200 rounded-full py-2 pl-9 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition"
                style={{ '--tw-ring-color': BRAND }}
              />
            </div>
          </form>
        )}

        {user ? (
          <div className="flex items-center gap-1 sm:gap-3">
            <div className="relative" ref={panelRef}>
              <button
                onClick={() => setShowNotifications((v) => !v)}
                className="relative p-2 rounded-full hover:bg-gray-50 transition"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span
                    className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-semibold text-white flex items-center justify-center"
                    style={{ backgroundColor: BRAND }}
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-xs font-medium hover:underline"
                          style={{ color: BRAND }}
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="py-12 text-center">
                          <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm text-gray-400">You're all caught up</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-50">
                          {notifications.map((notification) => (
                            <button
                              key={notification.id}
                              onClick={() => handleNotificationClick(notification)}
                              className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition"
                            >
                              <span className="mt-0.5 flex-shrink-0">{getNotificationIcon(notification.type)}</span>
                              <span className="flex-1 min-w-0">
                                <span className="block text-sm text-gray-800 leading-snug">
                                  {getNotificationText(notification)}
                                </span>
                                <span className="block text-xs text-gray-400 mt-0.5">
                                  {new Date(notification.createdAt).toLocaleDateString()}
                                </span>
                              </span>
                              {!notification.read && (
                                <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: BRAND }} />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 px-3 py-2 rounded-full hover:bg-gray-50 transition"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-6 text-sm font-medium">
            <button onClick={() => navigate('/welcome')} className="text-gray-600 hover:text-gray-900 transition">
              Explore
            </button>
            <button onClick={() => navigate('/login')} className="text-gray-600 hover:text-gray-900 transition">
              Log in
            </button>
            <button
              onClick={() => navigate('/')}
              className="text-white px-5 py-2 rounded-full transition hover:opacity-90"
              style={{ backgroundColor: BRAND }}
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