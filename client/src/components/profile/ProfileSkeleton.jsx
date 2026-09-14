import Sidebar from "../Sidebar";
import AdminSidebar from "../AdminSidebar";
import Navbar from "../navbar/Navbar";

const ProfileSkeleton = ({ dark, currentUser, adminStored, navigate }) => {
  return (
    <div className={`flex min-h-screen ${dark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {(currentUser?.role === 'client' || currentUser?.role === 'freelancer')
        ? <Sidebar />
        : <AdminSidebar
            user={adminStored}
            tab="profile"
            setTab={(id) => navigate(`/admin/dashboard?tab=${id}`)}
            setSearch={() => {}}
            logout={() => { localStorage.removeItem('token'); localStorage.removeItem('adminUser'); navigate('/admin/login'); }}
            onBroadcast={() => {}}
          />
      }
      <div className="flex-1 lg:ml-64">
        {(currentUser?.role === 'client' || currentUser?.role === 'freelancer') && <Navbar />}
        <div className="p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse">
              <div className="h-64 bg-gray-200 rounded-t-3xl mb-20"></div>
              <div className={`${dark ? 'bg-gray-800' : 'bg-white'} rounded-b-3xl p-8`}>
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeleton;