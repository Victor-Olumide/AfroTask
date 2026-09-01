import { useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { Bell, Briefcase, MessageCircle } from "lucide-react";
import api from "../../services/api";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoClose, IoPersonCircleOutline } from "react-icons/io5";


const WhiteNavbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();

      // Poll for new notifications every 30 seconds
      const interval = setInterval(() => {
        fetchNotifications();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/notifications");
      const notifs = response.data.notifications || [];
      setNotifications(notifs.slice(0, 10)); // Show last 10
      setUnreadCount(notifs.filter((n) => !n.read).length);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    setShowNotifications(false);

    // Navigate based on notification type
    if (notification.type === "job_match") {
      navigate("/freelancer/explore-jobs");
    } else if (notification.type === "new_post") {
      navigate(`/${user.role}/feed`);
    } else if (notification.type === "message") {
      navigate("/messages");
    } else if (notification.type === "application") {
      navigate("/client/my-jobs");
    } else if (
      notification.type === "like" ||
      notification.type === "comment"
    ) {
      navigate(`/${user.role}/feed`);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "job_match":
      case "application":
        return <Briefcase className="w-5 h-5 text-yellow-600" />;
      case "message":
        return <MessageCircle className="w-5 h-5 text-blue-600" />;
      default:
        return <Bell className="w-5 h-5 text-green-600" />;
    }
  };

  const getNotificationText = (notification) => {
    switch (notification.type) {
      case "job_match":
        return `New job matches your skills: ${notification.data?.jobTitle || "Check it out"}`;
      case "new_post":
        return `${notification.fromUser?.fullName || "Someone"} posted something new`;
      case "like":
        return `${notification.fromUser?.fullName || "Someone"} liked your post`;
      case "comment":
        return `${notification.fromUser?.fullName || "Someone"} commented on your post`;
      case "application":
        return `New application for your job`;
      case "message":
        return `New message from ${notification.fromUser?.fullName || "someone"}`;
      default:
        return notification.message || "New notification";
    }
  };

  const location = useLocation();
  const pathname = location.pathname;

  return (
    <nav className="bg-white text-black py-4 px-6 shadow-lg fixed top-0 left-0 w-full z-50">
      {/* Desktop Navbar */}
      <div className="hidden md:flex w-full mx-auto flex-row justify-between text-sm font-medium items-center">
        {/* Left: Logo */}
        <div className="flex flex-row justify-start gap-4 items-center">
          <div
            className="flex items-center cursor-pointer"
            onClick={() => navigate(user ? `/${user.role}/feed` : "/")}
          >
            <img
              src="/img/afro-task-logo.png"
              alt="Afro Task"
              className="h-10 w-auto"
            />
          </div>
          
          <button
            onClick={() => navigate("/")}
            className={pathname === "/" ? "text-[#00564C]" :"hover:text-green-700 transition"}
          >
            Home
          </button>
          <button
            onClick={() => navigate("/about")}
            className={pathname === "/about" ? "text-[#00564C]" :"hover:text-green-700 transition"}
          >
            About Us
          </button>
          <button
            onClick={() => navigate("/contact")}
            className={pathname === "/contact" ? "text-[#00564C]" :"hover:text-green-700 transition"}
          >
            Contact Us
          </button>
          <button
            onClick={() => navigate("/blogs")}
            className={pathname === "/blogs" ? "text-[#00564C]" :"hover:text-green-700 transition"}
          >
            Blogs
          </button>
        </div>

        {/* Right: User / Auth Section */}
        <div className="flex items-center justify-end gap-6">
          {user ? (
            <>
              <span className="text-black/90">Welcome, {user.fullName}</span>
              {user.profileImage ? (
                <img 
                  src={user.profileImage} 
                  alt={user.fullName}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-200"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
              ) : null}
              <IoPersonCircleOutline 
                className="w-8 h-8 text-gray-400" 
                style={{ display: user.profileImage ? 'none' : 'block' }}
              />
              <button
                onClick={() => navigate("/freelancer/feed")}
                className="bg-[#00564C] hover:bg-[#027568] text-white px-6 py-2 rounded-lg transition "
              >
                View Feeds
              </button>
            </>
          ) : (
            <>
            <button
            onClick={() => navigate(user ? "/post-project" : "/login")}
            className={pathname === "/post-project" ? "text-[#00564C]" :"hover:text-green-700 transition "}
          >
            Post Project
          </button>
              <button
                onClick={() => navigate("/explore-projects")}
            className={pathname === "/explore-projects" ? "text-[#00564C]" :"hover:text-green-700 transition"}
              >
                Explore Projects
              </button>

              <button
                onClick={() => navigate("/login")}
            className={pathname === "/login" ? "text-[#00564C]" :"hover:text-green-700 transition "}
              >
                Log in
              </button>
              <button
                onClick={() => navigate("/welcome")}
                className="bg-[#00564C] text-white hover:bg-[#027568] px-6 py-2 rounded-lg transition"
              >
                Sign up
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Navbar */}
      <div className="md:hidden flex w-full mx-auto flex-row justify-between text-sm font-medium items-center">
        {/* Left: Logo + Hamburger */}
        <div className="flex flex-row justify-start items-center gap-4">
          <GiHamburgerMenu 
            className="text-2xl cursor-pointer text-gray-600 hover:text-black transition" 
            onClick={() => setShowMobileMenu(true)}
          />
          <div
            className="flex items-center cursor-pointer"
            onClick={() => navigate(user ? `/${user.role}/feed` : "/")}
          >
            <img
              src="/img/afro-task-logo.png"
              alt="Afro Task"
              className="h-10 w-auto"
            />
          </div>
        </div>

        {/* Right: User / Auth (compact for mobile) */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate(`/${user.role}/profile`)}>
              <span className="text-sm text-black/90 truncate max-w-[120px]">{user.fullName}</span>
              {user.profileImage ? (
                <img 
                  src={user.profileImage} 
                  alt={user.fullName}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-200"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
              ) : null}
              <IoPersonCircleOutline 
                className="w-8 h-8 text-gray-400" 
                style={{ display: user.profileImage ? 'none' : 'block' }}
              />
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="text-sm bg-[#00564C] text-white px-4 py-1 rounded-lg hover:bg-[#027568] transition"
            >
              Login
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setShowMobileMenu(false)}
          />
          
          {/* Mobile Menu */}
          <div className="md:hidden fixed top-0 left-0 w-full h-full bg-white z-50 shadow-2xl flex flex-col overflow-y-auto">
            {/* Header with close button */}
            <div className="p-6 border-b flex items-center justify-between">
              <div
                className="flex items-center cursor-pointer"
                onClick={() => navigate(user ? `/${user.role}/feed` : "/")}
              >
                <img
                  src="/img/afro-task-logo.png"
                  alt="Afro Task"
                  className="h-10 w-auto"
                />
              </div>
              <IoClose
                className="text-2xl cursor-pointer text-gray-600 hover:text-black transition" 
                onClick={() => setShowMobileMenu(false)}
              />
            </div>

            {/* Nav Links */}
            <div className="flex-1 p-6 pt-4 space-y-4">
              <button
                onClick={() => { navigate("/"); setShowMobileMenu(false); }}
                className={`w-full text-left py-3 px-4 rounded-lg transition ${pathname === "/" ? "text-[#00564C] bg-gray-200" : "hover:bg-gray-100"}`}
              >
                Home
              </button>
              <button
                onClick={() => { navigate("/about"); setShowMobileMenu(false); }}
                className={`w-full text-left py-3 px-4 rounded-lg transition ${pathname === "/about" ? "text-[#00564C] bg-gray-200" : "hover:bg-gray-100"}`}
              >
                About Us
              </button>
              <button
                onClick={() => { navigate("/contact"); setShowMobileMenu(false); }}
                className={`w-full text-left py-3 px-4 rounded-lg transition ${pathname === "/contact" ? "text-[#00564C] bg-gray-200" : "hover:bg-gray-100"}`}
              >
                Contact Us
              </button>
              <button
                onClick={() => { navigate("/blogs"); setShowMobileMenu(false); }}
                className={`w-full text-left py-3 px-4 rounded-lg transition ${pathname === "/post-project" ? "text-[#00564C] bg-gray-200" : "hover:bg-gray-100"}`}
              >
                Blogs
              </button>
            </div>

            {/* User/Auth Section */}
            <div className="p-6 border-t space-y-3">
              {user ? (
                <>
                  <button
                    onClick={() => { navigate("/freelancer/feed"); setShowMobileMenu(false); }}
                    className="w-full bg-[#00564C] hover:bg-[#027568] text-white py-3 px-4 rounded-lg transition font-medium"
                  >
                    View Feeds
                  </button>
                  <button
                    onClick={logout}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-black py-3 px-4 rounded-lg transition font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { navigate(user ? "/post-project" : "/login"); setShowMobileMenu(false); }}
                    className="w-full bg-[#00564C] hover:bg-[#027568] text-white py-3 px-4 rounded-lg transition font-medium"
                  >
                    Post Project
                  </button>
                  <button
                    onClick={() => { navigate("/explore-projects"); setShowMobileMenu(false); }}
                    className="w-full text-black hover:bg-gray-100 py-3 px-4 rounded-lg transition font-medium border"
                  >
                    Explore Projects
                  </button>
                  <button
                    onClick={() => { navigate("/login"); setShowMobileMenu(false); }}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-black py-3 px-4 rounded-lg transition font-medium"
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => { navigate("/welcome"); setShowMobileMenu(false); }}
                    className="w-full bg-[#00564C] hover:bg-[#027568] text-white py-3 px-4 rounded-lg transition font-medium"
                  >
                    Sign up
                  </button>
                </>
          )}
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default WhiteNavbar;